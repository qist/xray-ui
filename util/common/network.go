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

// resolveHost 解析域名，系统 DNS 失败后尝试 Google → Cloudflare
func resolveHost(host string) (string, error) {
	if host == "" {
		return "", fmt.Errorf("域名不能为空")
	}

	// 系统 DNS
	if ips, err := net.LookupIP(host); err == nil && len(ips) > 0 {
		return ips[0].String(), nil
	}

	// Google DNS
	resolver := &net.Resolver{
		PreferGo: true,
		Dial: func(ctx context.Context, network, address string) (net.Conn, error) {
			return (&net.Dialer{Timeout: 5 * time.Second}).DialContext(ctx, network, "8.8.8.8:53")
		},
	}
	if ips, err := resolver.LookupIPAddr(context.Background(), host); err == nil && len(ips) > 0 {
		return ips[0].IP.String(), nil
	}

	// Cloudflare DNS
	resolver.Dial = func(ctx context.Context, network, address string) (net.Conn, error) {
		return (&net.Dialer{Timeout: 5 * time.Second}).DialContext(ctx, network, "1.1.1.1:53")
	}
	if ips, err := resolver.LookupIPAddr(context.Background(), host); err == nil && len(ips) > 0 {
		return ips[0].IP.String(), nil
	}

	return "", fmt.Errorf("无法解析域名: %s", host)
}

// newHttpClient 创建 HTTP Client，支持 DNS fallback + HTTPS SNI + 跨域重定向
func newHttpClient(rawURL string) (*http.Client, error) {
	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		return nil, err
	}

	scheme := parsedURL.Scheme
	host := parsedURL.Hostname()
	port := parsedURL.Port()
	if port == "" {
		if scheme == "https" {
			port = "443"
		} else {
			port = "80"
		}
	}

	ip, err := resolveHost(host)
	if err != nil {
		return nil, err
	}

	dialer := &net.Dialer{Timeout: 10 * time.Second, KeepAlive: 30 * time.Second}

	transport := &http.Transport{
		TLSHandshakeTimeout:   10 * time.Second,
		ResponseHeaderTimeout: 180 * time.Second,
		DisableKeepAlives:     false,
		TLSClientConfig:       &tls.Config{ServerName: host},
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			return dialer.DialContext(ctx, network, net.JoinHostPort(ip, port))
		},
	}

	client := &http.Client{
		Timeout:   60 * time.Second,
		Transport: transport,
		// 处理重定向
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			newHost := req.URL.Hostname()
			newPort := req.URL.Port()
			if newPort == "" {
				if req.URL.Scheme == "https" {
					newPort = "443"
				} else {
					newPort = "80"
				}
			}

			newIP, err := resolveHost(newHost)
			if err != nil {
				return err
			}

			req.Host = newHost
			req.URL.Host = net.JoinHostPort(newIP, newPort)
			req.RequestURI = "" // 必须清空 RequestURI

			// 更新 TLS SNI
			if req.URL.Scheme == "https" {
				transport.TLSClientConfig = &tls.Config{ServerName: newHost}
			}

			// DialContext 使用新的 IP
			transport.DialContext = func(ctx context.Context, network, addr string) (net.Conn, error) {
				return dialer.DialContext(ctx, network, net.JoinHostPort(newIP, newPort))
			}

			return nil
		},
	}

	return client, nil
}

// HttpGetWithDNSFallback 发起 GET 请求
func HttpGetWithDNSFallback(urlStr string) (*http.Response, error) {
	client, err := newHttpClient(urlStr)
	if err != nil {
		return nil, err
	}

	resp, err := client.Get(urlStr)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return nil, fmt.Errorf("HTTP请求失败，状态码: %d, 响应: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}

	return resp, nil
}

// GetMyIpAddr 获取本机公网 IP
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
		if resp != nil {
			body, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			return strings.TrimSpace(string(body))
		}
	}

	return ""
}
