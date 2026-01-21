package common

import (
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"
)

//
// =======================
// DNS Resolver（纯 Go，不走 cgo）
// =======================
//

var goResolver = &net.Resolver{
	PreferGo: true,
	Dial: func(ctx context.Context, network, address string) (net.Conn, error) {
		d := &net.Dialer{Timeout: 5 * time.Second}

		// Google DNS
		if c, err := d.DialContext(ctx, "udp", "8.8.8.8:53"); err == nil {
			return c, nil
		}
		 // Cloudflare DNS
		if c, err := d.DialContext(ctx, "udp", "1.1.1.1:53"); err == nil {
			return c, nil
		}

		// 阿里 DNS
		return d.DialContext(ctx, "udp", "223.5.5.5:53")
	},
}


// resolveHost 解析域名（不会触发 getaddrinfo / SIGFPE）
func resolveHost(host string) (string, error) {
	if host == "" {
		return "", fmt.Errorf("域名不能为空")
	}

	ips, err := goResolver.LookupIPAddr(context.Background(), host)
	if err != nil || len(ips) == 0 {
		return "", fmt.Errorf("无法解析域名: %s", host)
	}
	return ips[0].IP.String(), nil
}

//
// =======================
// HTTP Client
// =======================
//

// NewHTTPClient 创建安全的 HTTP Client（DNS fallback + SNI + Redirect）
func NewHTTPClient() *http.Client {
	dialer := &net.Dialer{
		Timeout:   10 * time.Second,
		KeepAlive: 30 * time.Second,
	}

	transport := &http.Transport{
		DisableKeepAlives:     false,
		TLSHandshakeTimeout:   10 * time.Second,
		ResponseHeaderTimeout: 180 * time.Second,

		// ★ 核心：DNS 只在 DialContext 决策
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			host, port, err := net.SplitHostPort(addr)
			if err != nil {
				return nil, err
			}

			ip, err := resolveHost(host)
			if err != nil {
				return nil, err
			}

			return dialer.DialContext(ctx, network, net.JoinHostPort(ip, port))
		},

		TLSClientConfig: &tls.Config{},
	}

	return &http.Client{
		Timeout:   60 * time.Second,
		Transport: transport,

		// Redirect 只修 Host，绝不改 Transport
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			req.Host = req.URL.Hostname()
			return nil
		},
	}
}

//
// =======================
// HTTP GET
// =======================
//

// HttpGetWithDNSFallback 发起 GET 请求
func HttpGetWithDNSFallback(urlStr string) (*http.Response, error) {
	_, err := url.Parse(urlStr)
	if err != nil {
		return nil, err
	}

	client := NewHTTPClient()

	resp, err := client.Get(urlStr)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return nil, fmt.Errorf(
			"HTTP 请求失败: %d %s",
			resp.StatusCode,
			strings.TrimSpace(string(body)),
		)
	}

	return resp, nil
}

//
// =======================
// Public IP
// =======================
//

// GetMyIpAddr 获取公网 IP
func GetMyIpAddr() string {
	urls := []string{
		"https://api64.ipify.org",
		"https://ip.sb",
	}

	for _, u := range urls {
		resp, err := HttpGetWithDNSFallback(u)
		if err != nil {
			continue
		}

		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return strings.TrimSpace(string(body))
	}
	return ""
}
