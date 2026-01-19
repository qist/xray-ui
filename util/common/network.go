package common

import (
	"context"
	"crypto/tls"
	"io/ioutil"
	"net"
	"net/http"
	"net/url"
	// "strings"
	"time"
)

// 通用HTTP请求函数，处理DNS解析失败的情况
func httpGetWithDNSFallback(urlStr string) (*http.Response, error) {
	parsedURL, err := url.Parse(urlStr)
	if err != nil {
		return nil, err
	}
	host := parsedURL.Hostname()
	port := parsedURL.Port()
	if port == "" {
		if parsedURL.Scheme == "https" {
			port = "443"
		} else {
			port = "80"
		}
	}

	// 尝试解析 DNS: Google DNS -> Cloudflare DNS
	var ips []net.IPAddr
	resolver := &net.Resolver{
		PreferGo: true,
		Dial: func(ctx context.Context, network, address string) (net.Conn, error) {
			d := net.Dialer{Timeout: 5 * time.Second}
			return d.DialContext(ctx, network, "8.8.8.8:53")
		},
	}
	ips, err = resolver.LookupIPAddr(context.Background(), host)
	if err != nil {
		resolver.Dial = func(ctx context.Context, network, address string) (net.Conn, error) {
			d := net.Dialer{Timeout: 5 * time.Second}
			return d.DialContext(ctx, network, "1.1.1.1:53")
		}
		ips, err = resolver.LookupIPAddr(context.Background(), host)
		if err != nil {
			return nil, err
		}
	}

	// 使用第一个解析到的 IP
	ip := ips[0].IP.String()

	// 自定义 Transport，通过 IP 建立连接，但保留原 Host 做 TLS SNI
	dialer := &net.Dialer{Timeout: 10 * time.Second}
	transport := &http.Transport{
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			_, portAddr, _ := net.SplitHostPort(addr)
			return dialer.DialContext(ctx, network, net.JoinHostPort(ip, portAddr))
		},
		TLSHandshakeTimeout:   10 * time.Second,
		ResponseHeaderTimeout: 60 * time.Second, // 大文件读取头超时
		TLSClientConfig:       &tls.Config{},   // 默认验证证书
	}

	client := &http.Client{
		Transport: transport,
		Timeout:   0, // 不限制总超时，由 Transport 控制各阶段
	}

	// 发起请求
	req, err := http.NewRequest("GET", urlStr, nil)
	if err != nil {
		return nil, err
	}
	req.Host = host // 保持 Host 用于 TLS/SNI

	return client.Do(req)
}
func GetMyIpAddr() string {
	resp, err := httpGetWithDNSFallback("https://api64.ipify.org")
	if err != nil {
		resp, _ = httpGetWithDNSFallback("http://ip.sb")
	}
	defer resp.Body.Close()
	s, _ := ioutil.ReadAll(resp.Body)
	return string(s)
}
