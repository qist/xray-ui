package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"xray-ui/logger"
	"xray-ui/xray"

	"go.uber.org/atomic"
)

var p *xray.Process
var lock sync.Mutex
var isNeedXrayRestart atomic.Bool
var result string

type XrayService struct {
	inboundService InboundService
	settingService SettingService
}

type hysteriaPortHoppingInbound struct {
	Port  int
	Ports string
}

type nftPortHoppingRule struct {
	Handle string
	Port   int
	Ports  string
}

type hysteriaStreamSettingsConfig struct {
	HysteriaSettings *hysteriaSettingsConfig `json:"hysteriaSettings"`
}

type hysteriaSettingsConfig struct {
	PortHopping *hysteriaPortHoppingConfig `json:"portHopping"`
}

type hysteriaPortHoppingConfig struct {
	Enabled bool   `json:"enabled"`
	Ports   string `json:"ports"`
}

func (s *XrayService) IsXrayRunning() bool {
	return p != nil && p.IsRunning()
}

func (s *XrayService) GetXrayErr() error {
	if p == nil {
		return nil
	}
	return p.GetErr()
}

func (s *XrayService) GetXrayResult() string {
	if result != "" {
		return result
	}
	if s.IsXrayRunning() {
		return ""
	}
	if p == nil {
		return ""
	}
	result = p.GetResult()
	return result
}

func (s *XrayService) GetXrayVersion() string {
	if p == nil {
		return "Unknown"
	}
	return p.GetVersion()
}

func (s *XrayService) GetXrayConfig() (*xray.Config, error) {
	templateConfig, err := s.settingService.GetXrayConfigTemplate()
	if err != nil {
		return nil, err
	}

	xrayConfig := &xray.Config{}
	err = json.Unmarshal([]byte(templateConfig), xrayConfig)
	if err != nil {
		return nil, err
	}

	inbounds, err := s.inboundService.GetAllInbounds()
	if err != nil {
		return nil, err
	}
	for _, inbound := range inbounds {
		if !inbound.Enable {
			continue
		}
		inboundConfig := inbound.GenXrayInboundConfig()
		xrayConfig.InboundConfigs = append(xrayConfig.InboundConfigs, *inboundConfig)
	}
	return xrayConfig, nil
}

func (s *XrayService) GetXrayTraffic() ([]*xray.Traffic, error) {
	if !s.IsXrayRunning() {
		return nil, errors.New("xray is not running")
	}
	return p.GetTraffic(true)
}

func (s *XrayService) RestartXray(isForce bool) error {
	lock.Lock()
	defer lock.Unlock()
	logger.Debug("restart xray, force:", isForce)

	xrayConfig, err := s.GetXrayConfig()
	if err != nil {
		return err
	}
	if err = s.ensureHysteriaPortHoppingRules(xrayConfig); err != nil {
		return err
	}

	if p != nil && p.IsRunning() {
		if !isForce && p.GetConfig().Equals(xrayConfig) {
			logger.Debug("not need to restart xray")
			return nil
		}
		p.Stop()
	}

	p = xray.NewProcess(xrayConfig)
	result = ""
	return p.Start()
}

func (s *XrayService) StopXray() error {
	lock.Lock()
	defer lock.Unlock()
	logger.Debug("stop xray")
	if s.IsXrayRunning() {
		return p.Stop()
	}
	return errors.New("xray is not running")
}

func (s *XrayService) SetToNeedRestart() {
	isNeedXrayRestart.Store(true)
}

func (s *XrayService) IsNeedRestartAndSetFalse() bool {
	return isNeedXrayRestart.CompareAndSwap(true, false)
}

func getHysteriaPortHoppingInbound(protocol string, port int, streamSettings []byte) (*hysteriaPortHoppingInbound, error) {
	if protocol != "hysteria" {
		return nil, nil
	}
	streamSettingsText := strings.TrimSpace(string(streamSettings))
	if streamSettingsText == "" || streamSettingsText == "null" {
		return nil, nil
	}
	config := &hysteriaStreamSettingsConfig{}
	if err := json.Unmarshal(streamSettings, config); err != nil {
		return nil, fmt.Errorf("解析 Hysteria streamSettings 失败: %w", err)
	}
	if config.HysteriaSettings == nil || config.HysteriaSettings.PortHopping == nil || !config.HysteriaSettings.PortHopping.Enabled {
		return nil, nil
	}
	ports, err := normalizeHysteriaPortRange(config.HysteriaSettings.PortHopping.Ports)
	if err != nil {
		return nil, err
	}
	return &hysteriaPortHoppingInbound{
		Port:  port,
		Ports: ports,
	}, nil
}

func normalizeHysteriaPortRange(portRange string) (string, error) {
	value := strings.TrimSpace(strings.ReplaceAll(portRange, ":", "-"))
	parts := strings.Split(value, "-")
	if len(parts) != 2 {
		return "", fmt.Errorf("端口跳跃范围格式错误: %s", portRange)
	}
	start, err := strconv.Atoi(strings.TrimSpace(parts[0]))
	if err != nil {
		return "", fmt.Errorf("端口跳跃起始端口无效: %s", parts[0])
	}
	end, err := strconv.Atoi(strings.TrimSpace(parts[1]))
	if err != nil {
		return "", fmt.Errorf("端口跳跃结束端口无效: %s", parts[1])
	}
	if start < 1 || start > 65535 || end < 1 || end > 65535 || start > end {
		return "", fmt.Errorf("端口跳跃范围无效: %s", portRange)
	}
	return fmt.Sprintf("%d-%d", start, end), nil
}

func iptablesPortRange(portRange string) string {
	return strings.Replace(portRange, "-", ":", 1)
}

func (s *XrayService) ensureHysteriaPortHoppingRules(xrayConfig *xray.Config) error {
	inbounds := make([]hysteriaPortHoppingInbound, 0)
	seen := map[string]int{}
	for _, inbound := range xrayConfig.InboundConfigs {
		entry, err := getHysteriaPortHoppingInbound(inbound.Protocol, inbound.Port, inbound.StreamSettings)
		if err != nil {
			return fmt.Errorf("Hysteria 端口 %d 的端口跳跃配置无效: %w", inbound.Port, err)
		}
		if entry == nil {
			continue
		}
		if targetPort, ok := seen[entry.Ports]; ok && targetPort != entry.Port {
			return fmt.Errorf("端口跳跃范围 %s 被重复用于多个 Hysteria 端口: %d, %d", entry.Ports, targetPort, entry.Port)
		}
		if _, ok := seen[entry.Ports]; ok {
			continue
		}
		seen[entry.Ports] = entry.Port
		inbounds = append(inbounds, *entry)
	}
	if _, err := exec.LookPath("nft"); err == nil {
		if err := ensureNFTablesPortHoppingRules(inbounds); err != nil {
			return err
		}
		return nil
	}

	supported := 0
	if _, err := exec.LookPath("iptables"); err == nil {
		supported++
	}
	if _, err := exec.LookPath("ip6tables"); err == nil {
		supported++
	}
	if supported == 0 {
		if len(inbounds) == 0 {
			return nil
		}
		return fmt.Errorf("未找到 nft、iptables 或 ip6tables，无法应用 Hysteria 端口跳跃规则")
	}
	if _, err := exec.LookPath("iptables"); err == nil {
		if err := syncIPTablesPortHoppingRules("iptables", inbounds); err != nil {
			return err
		}
	}
	if _, err := exec.LookPath("ip6tables"); err == nil {
		if err := syncIPTablesPortHoppingRules("ip6tables", inbounds); err != nil {
			return err
		}
	}
	return nil
}

func portHoppingRuleKey(ports string, port int) string {
	return fmt.Sprintf("%s->%d", ports, port)
}

func syncIPTablesPortHoppingRules(command string, inbounds []hysteriaPortHoppingInbound) error {
	actualRules, err := listIPTablesPortHoppingRules(command)
	if err != nil {
		return err
	}
	desired := map[string]hysteriaPortHoppingInbound{}
	for _, inbound := range inbounds {
		desired[portHoppingRuleKey(inbound.Ports, inbound.Port)] = inbound
	}
	counts := map[string]int{}
	for _, rule := range actualRules {
		key := portHoppingRuleKey(rule.Ports, rule.Port)
		if _, ok := desired[key]; !ok {
			if err := deleteIPTablesPortHoppingRule(command, rule); err != nil {
				return err
			}
			logger.Infof("%s 已删除失效 Hysteria 端口跳跃规则: %s -> %d", command, rule.Ports, rule.Port)
			continue
		}
		counts[key]++
	}
	for _, inbound := range inbounds {
		if err := ensureIPTablesPortHoppingRule(command, inbound, counts[portHoppingRuleKey(inbound.Ports, inbound.Port)]); err != nil {
			return err
		}
	}
	return nil
}

func ensureIPTablesPortHoppingRule(command string, inbound hysteriaPortHoppingInbound, ruleCount int) error {
	targetPort := strconv.Itoa(inbound.Port)
	portRange := iptablesPortRange(inbound.Ports)
	if ruleCount > 1 {
		for i := 0; i < ruleCount-1; i++ {
			if err := deleteIPTablesPortHoppingRule(command, inbound); err != nil {
				return err
			}
		}
		logger.Infof("%s 已清理重复 Hysteria 端口跳跃规则: %s -> %d, 删除 %d 条", command, inbound.Ports, inbound.Port, ruleCount-1)
	}
	if ruleCount > 0 {
		logger.Infof("%s Hysteria 端口跳跃规则已存在，跳过: %s -> %d", command, inbound.Ports, inbound.Port)
		return nil
	}
	addArgs := []string{"-t", "nat", "-A", "PREROUTING", "-p", "udp", "--dport", portRange, "-j", "REDIRECT", "--to-ports", targetPort}
	output, err := exec.Command(command, addArgs...).CombinedOutput()
	if err != nil {
		return fmt.Errorf("%s 添加 Hysteria 端口跳跃规则失败: %s", command, strings.TrimSpace(string(output)))
	}
	logger.Infof("%s 已添加 Hysteria 端口跳跃规则: %s -> %d", command, inbound.Ports, inbound.Port)
	return nil
}

func listIPTablesPortHoppingRules(command string) ([]hysteriaPortHoppingInbound, error) {
	output, err := exec.Command(command, "-t", "nat", "-S", "PREROUTING").CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("读取 %s Hysteria 端口跳跃规则失败: %s", command, strings.TrimSpace(string(output)))
	}
	pattern := regexp.MustCompile(`(?m)^-A PREROUTING -p udp(?: -m udp)? --dport ([0-9:]+) -j REDIRECT --to-ports ([0-9]+)$`)
	matches := pattern.FindAllStringSubmatch(string(output), -1)
	rules := make([]hysteriaPortHoppingInbound, 0, len(matches))
	for _, match := range matches {
		if len(match) != 3 {
			continue
		}
		port, err := strconv.Atoi(match[2])
		if err != nil {
			continue
		}
		rules = append(rules, hysteriaPortHoppingInbound{
			Port:  port,
			Ports: strings.Replace(match[1], ":", "-", 1),
		})
	}
	return rules, nil
}

func deleteIPTablesPortHoppingRule(command string, inbound hysteriaPortHoppingInbound) error {
	args := []string{"-t", "nat", "-D", "PREROUTING", "-p", "udp", "--dport", iptablesPortRange(inbound.Ports), "-j", "REDIRECT", "--to-ports", strconv.Itoa(inbound.Port)}
	output, err := exec.Command(command, args...).CombinedOutput()
	if err != nil {
		return fmt.Errorf("删除重复 %s Hysteria 端口跳跃规则失败: %s", command, strings.TrimSpace(string(output)))
	}
	return nil
}

func ensureNFTablesPortHoppingRules(inbounds []hysteriaPortHoppingInbound) error {
	if err := ensureNFTable(); err != nil {
		return err
	}
	if err := ensureNFTChain(); err != nil {
		return err
	}
	output, err := exec.Command("nft", "-a", "list", "chain", "inet", "hysteria_porthopping", "prerouting").CombinedOutput()
	if err != nil {
		return fmt.Errorf("读取 nft Hysteria 端口跳跃链失败: %s", strings.TrimSpace(string(output)))
	}
	actualRules := listNFTPortHoppingRules(string(output))
	desired := map[string]hysteriaPortHoppingInbound{}
	for _, inbound := range inbounds {
		desired[portHoppingRuleKey(inbound.Ports, inbound.Port)] = inbound
	}
	handlesByKey := map[string][]string{}
	for _, rule := range actualRules {
		key := portHoppingRuleKey(rule.Ports, rule.Port)
		if _, ok := desired[key]; !ok {
			if err := deleteNFTPortHoppingRule(rule.Handle); err != nil {
				return err
			}
			logger.Infof("nft 已删除失效 Hysteria 端口跳跃规则: %s -> %d", rule.Ports, rule.Port)
			continue
		}
		handlesByKey[key] = append(handlesByKey[key], rule.Handle)
	}
	for _, inbound := range inbounds {
		handles := handlesByKey[portHoppingRuleKey(inbound.Ports, inbound.Port)]
		if len(handles) > 1 {
			for _, handle := range handles[1:] {
				if err := deleteNFTPortHoppingRule(handle); err != nil {
					return err
				}
			}
			logger.Infof("nft 已清理重复 Hysteria 端口跳跃规则: %s -> %d, 删除 %d 条", inbound.Ports, inbound.Port, len(handles)-1)
		}
		if len(handles) > 0 {
			logger.Infof("nft Hysteria 端口跳跃规则已存在，跳过: %s -> %d", inbound.Ports, inbound.Port)
			continue
		}
		command := fmt.Sprintf("nft add rule inet hysteria_porthopping prerouting udp dport %s counter redirect to :%d", inbound.Ports, inbound.Port)
		output, err := exec.Command("bash", "-lc", command).CombinedOutput()
		if err != nil {
			return fmt.Errorf("nft 添加 Hysteria 端口跳跃规则失败: %s", strings.TrimSpace(string(output)))
		}
		logger.Infof("nft 已添加 Hysteria 端口跳跃规则: %s -> %d", inbound.Ports, inbound.Port)
	}
	return nil
}

func listNFTPortHoppingRules(chainRules string) []nftPortHoppingRule {
	pattern := regexp.MustCompile(`(?m)^\s*udp dport ([0-9-]+)\s+counter(?:\s+packets\s+\d+\s+bytes\s+\d+)?\s+redirect to :([0-9]+)\s+# handle (\d+)\s*$`)
	matches := pattern.FindAllStringSubmatch(chainRules, -1)
	rules := make([]nftPortHoppingRule, 0, len(matches))
	for _, match := range matches {
		if len(match) != 4 {
			continue
		}
		port, err := strconv.Atoi(match[2])
		if err != nil {
			continue
		}
		rules = append(rules, nftPortHoppingRule{
			Ports:  match[1],
			Port:   port,
			Handle: match[3],
		})
	}
	return rules
}

func deleteNFTPortHoppingRule(handle string) error {
	output, err := exec.Command("nft", "delete", "rule", "inet", "hysteria_porthopping", "prerouting", "handle", handle).CombinedOutput()
	if err != nil {
		return fmt.Errorf("删除重复 nft Hysteria 端口跳跃规则失败: %s", strings.TrimSpace(string(output)))
	}
	return nil
}

func ensureNFTable() error {
	if err := exec.Command("nft", "list", "table", "inet", "hysteria_porthopping").Run(); err == nil {
		return nil
	}
	output, err := exec.Command("nft", "add", "table", "inet", "hysteria_porthopping").CombinedOutput()
	if err != nil {
		return fmt.Errorf("创建 nft Hysteria 表失败: %s", strings.TrimSpace(string(output)))
	}
	return nil
}

func ensureNFTChain() error {
	if err := exec.Command("nft", "list", "chain", "inet", "hysteria_porthopping", "prerouting").Run(); err == nil {
		return nil
	}
	command := "nft add chain inet hysteria_porthopping prerouting '{ type nat hook prerouting priority dstnat; policy accept; }'"
	output, err := exec.Command("bash", "-lc", command).CombinedOutput()
	if err != nil {
		return fmt.Errorf("创建 nft Hysteria prerouting 链失败: %s", strings.TrimSpace(string(output)))
	}
	return nil
}
