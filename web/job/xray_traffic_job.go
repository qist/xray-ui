package job

import (
	"xray-ui/logger"
	"xray-ui/web/service"
)

type XrayTrafficJob struct {
	xrayService    service.XrayService
	inboundService service.InboundService
}

func NewXrayTrafficJob() *XrayTrafficJob {
	return new(XrayTrafficJob)
}

func (j *XrayTrafficJob) Run() {
	if !j.xrayService.IsXrayRunning() {
		return
	}
	traffics, err := j.xrayService.GetXrayTraffic()
	if err != nil {
		logger.Warning("get xray traffic failed:", err)
		return
	}
	err = j.inboundService.AddTraffic(traffics)
	if err != nil {
		logger.Warning("add traffic failed:", err)
	}
}
