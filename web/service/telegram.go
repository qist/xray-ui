package service

import (
	"fmt"
	"log"
	"os"
	"runtime"
	"strconv"
	"time"
	"xray-ui/logger"
	"xray-ui/util/common"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/load"
)

//This should be global variable,and only one instance
var botInstace *tgbotapi.BotAPI

//结构体类型大写表示可以被其他包访问
type TelegramService struct {
	xrayService    XrayService
	serverService  ServerService
	inboundService InboundService
	settingService SettingService
}

func (s *TelegramService) GetsystemStatus() string {
	var status string
	//get hostname
	name, err := os.Hostname()
	if err != nil {
		fmt.Println("get hostname error:", err)
		return ""
	}
	status = fmt.Sprintf("主机名称:%s\r\n", name)
	status += fmt.Sprintf("系统类型:%s\r\n", runtime.GOOS)
	status += fmt.Sprintf("系统架构:%s\r\n", runtime.GOARCH)
	avgState, err := load.Avg()
	if err != nil {
		logger.Warning("get load avg failed:", err)
	} else {
		status += fmt.Sprintf("系统负载:%.2f,%.2f,%.2f\r\n", avgState.Load1, avgState.Load5, avgState.Load15)
	}
	upTime, err := host.Uptime()
	if err != nil {
		logger.Warning("get uptime failed:", err)
	} else {
		status += fmt.Sprintf("运行时间:%s\r\n", common.FormatTime(upTime))
	}
	//xray version
	status += fmt.Sprintf("xray版本:%s\r\n", s.xrayService.GetXrayVersion())
	//ip address
	var ip string
	ip = common.GetMyIpAddr()
	status += fmt.Sprintf("IP地址:%s\r\n \r\n", ip)
	//get traffic
	inbouds, err := s.inboundService.GetAllInbounds()
	if err != nil {
		logger.Warning("StatsNotifyJob run error:", err)
	}
	for _, inbound := range inbouds {
		status += fmt.Sprintf("节点名称:%s\r\n端口:%d\r\n上行流量↑:%s\r\n下行流量↓:%s\r\n总流量:%s\r\n", inbound.Remark, inbound.Port, common.FormatTraffic(inbound.Up), common.FormatTraffic(inbound.Down), common.FormatTraffic((inbound.Up + inbound.Down)))
		if inbound.ExpiryTime == 0 {
			status += fmt.Sprintf("到期时间:无限期\r\n \r\n")
		} else {
			status += fmt.Sprintf("到期时间:%s\r\n \r\n", time.Unix((inbound.ExpiryTime/1000), 0).Format("2006-01-02 15:04:05"))
		}
	}
	return status
}

func (s *TelegramService) StartRun() {
	logger.Info("telegram service ready to run")
	s.settingService = SettingService{}
	tgBottoken, err := s.settingService.GetTgBotToken()
	if err != nil || tgBottoken == "" {
		logger.Infof("telegram service start run failed,GetTgBotToken fail,err:%v,tgBottoken:%s", err, tgBottoken)
		return
	}
	logger.Infof("TelegramService GetTgBotToken:%s", tgBottoken)
	botInstace, err = tgbotapi.NewBotAPI(tgBottoken)
	if err != nil {
		logger.Infof("telegram service start run failed,NewBotAPI fail:%v,tgBottoken:%s", err, tgBottoken)
		return
	}
	botInstace.Debug = false
	fmt.Printf("Authorized on account %s", botInstace.Self.UserName)
	//get all my commands
	commands, err := botInstace.GetMyCommands()
	if err != nil {
		logger.Warning("telegram service start run error,GetMyCommandsfail:", err)
	}
	for _, command := range commands {
		fmt.Printf("command %s,Description:%s \r\n", command.Command, command.Description)
	}
	//get update
	chanMessage := tgbotapi.NewUpdate(0)
	chanMessage.Timeout = 60

	updates := botInstace.GetUpdatesChan(chanMessage)

	for update := range updates {
		if update.Message == nil {
			//NOTE:may ther are different bot instance,we could use different bot endApiPoint
			updates.Clear()
			continue
		}

		if !update.Message.IsCommand() {
			continue
		}

		msg := tgbotapi.NewMessage(update.Message.Chat.ID, "")

		// Extract the command from the Message.
		switch update.Message.Command() {
		case "delete":
			inboundPortStr := update.Message.CommandArguments()
			inboundPortValue, err := strconv.Atoi(inboundPortStr)
			if err != nil {
				msg.Text = "Invalid inbound port,please check it"
				break
			}
			//logger.Infof("Will delete port:%d inbound", inboundPortValue)
			error := s.inboundService.DelInboundByPort(inboundPortValue)
			if error != nil {
				msg.Text = fmt.Sprintf("delete inbound whoes port is %d failed", inboundPortValue)
			} else {
				msg.Text = fmt.Sprintf("delete inbound whoes port is %d success", inboundPortValue)
			}
		case "restart":
			err := s.xrayService.RestartXray(true)
			if err != nil {
				msg.Text = fmt.Sprintln("Restart xray failed,error:", err)
			} else {
				msg.Text = "Restart xray success"
			}
		case "disable":
			inboundPortStr := update.Message.CommandArguments()
			inboundPortValue, err := strconv.Atoi(inboundPortStr)
			if err != nil {
				msg.Text = "Invalid inbound port,please check it"
				break
			}
			//logger.Infof("Will delete port:%d inbound", inboundPortValue)
			error := s.inboundService.DisableInboundByPort(inboundPortValue)
			if error != nil {
				msg.Text = fmt.Sprintf("disable inbound whoes port is %d failed,err:%s", inboundPortValue, error)
			} else {
				msg.Text = fmt.Sprintf("disable inbound whoes port is %d success", inboundPortValue)
			}
		case "enable":
			inboundPortStr := update.Message.CommandArguments()
			inboundPortValue, err := strconv.Atoi(inboundPortStr)
			if err != nil {
				msg.Text = "Invalid inbound port,please check it"
				break
			}
			//logger.Infof("Will delete port:%d inbound", inboundPortValue)
			error := s.inboundService.EnableInboundByPort(inboundPortValue)
			if error != nil {
				msg.Text = fmt.Sprintf("enable inbound whoes port is %d failed,err:%s", inboundPortValue, error)
			} else {
				msg.Text = fmt.Sprintf("enable inbound whoes port is %d success", inboundPortValue)
			}
		case "clear":
			inboundPortStr := update.Message.CommandArguments()
			inboundPortValue, err := strconv.Atoi(inboundPortStr)
			if err != nil {
				msg.Text = "Invalid inbound port,please check it"
				break
			}
			error := s.inboundService.ClearTrafficByPort(inboundPortValue)
			if error != nil {
				msg.Text = fmt.Sprintf("Clear Traffic whose port is %d failed,err:%s", inboundPortValue, error)
			} else {
				msg.Text = fmt.Sprintf("Clear Traffic whose port is %d success", inboundPortValue)
			}

		case "clearall":
			error := s.inboundService.ClearAllInboundTraffic()
			if error != nil {
				msg.Text = fmt.Sprintf("Clear All inbound Traffic failed,err:%s", error)
			} else {
				msg.Text = fmt.Sprintf("Clear All inbound Traffic success")
			}
		case "version":
			versionStr := update.Message.CommandArguments()
			currentVersion, _ := s.serverService.GetXrayVersions()
			if currentVersion[0] == versionStr {
				msg.Text = fmt.Sprintf("can't change same version to %s", versionStr)
			}
			error := s.serverService.UpdateXray(versionStr)
			if error != nil {
				msg.Text = fmt.Sprintf("change version to %s failed,err:%s", versionStr, error)
			} else {
				msg.Text = fmt.Sprintf("change version to %s  success", versionStr)
			}
		case "status":
			msg.Text = s.GetsystemStatus()
		default:
			//NOTE:here we need string as a new line each one,we should use ``
			msg.Text = `/delete will help you delete inbound according port
/restart will restart xray,this command will not restart xray-ui
/status will get current system info
/enable will enable inbound according port
/disable will disable inbound according port
/clear will clear inbound traffic accoring port
/clearall will cleal all inbouns traffic
/version will change xray version to specific one
You can input /help to see more commands`
		}

		if _, err := botInstace.Send(msg); err != nil {
			log.Panic(err)
		}
	}

}

func (s *TelegramService) SendMsgToTgbot(msg string) {
	logger.Info("SendMsgToTgbot entered")
	tgBotid, err := s.settingService.GetTgBotChatId()
	if err != nil {
		logger.Warning("sendMsgToTgbot failed,GetTgBotChatId fail:", err)
		return
	}
	if tgBotid == 0 {
		logger.Warning("sendMsgToTgbot failed,GetTgBotChatId illegal")
		return
	}

	info := tgbotapi.NewMessage(int64(tgBotid), msg)
	if botInstace != nil {
		botInstace.Send(info)
	} else {
		logger.Warning("bot instance is nil")
	}
}

//NOTE:This function can't be called repeatly
func (s *TelegramService) StopRunAndClose() {
	if botInstace != nil {
		botInstace.StopReceivingUpdates()
	}
}
