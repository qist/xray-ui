package common

import (
	"context"
	"crypto/tls"
	"io/ioutil"
	"fmt"
	"net/url"

	"net"
	"net/http"
	// "strings"
	"time"
)

// resolveHost 解析域名，系统DNS失败后尝试Google→Cloudflare
func resolveHost(host string) (string, error) {
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

// newHttpClient 创建支持 DNS fallback + HTTPS SNI + 跨域重定向 的 HTTP 客户端
func newHttpClient(urlStr string) (*http.Client, error) {
	parsedURL, err := url.Parse(urlStr)
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
		Timeout:   0,
		Transport: transport,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			// 每次重定向都重新解析新的域名
			newURL := req.URL
			newScheme := newURL.Scheme
			newHost := newURL.Hostname()
			newPort := newURL.Port()
			if newPort == "" {
				if newScheme == "https" {
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

			// 更新 Transport 的 DialContext 和 ServerName
			transport.DialContext = func(ctx context.Context, network, addr string) (net.Conn, error) {
				return dialer.DialContext(ctx, network, net.JoinHostPort(newIP, newPort))
			}
			transport.TLSClientConfig = &tls.Config{ServerName: newHost}

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
		resp.Body.Close()
		return nil, fmt.Errorf("HTTP请求失败，状态码: %d", resp.StatusCode)
	}
	return resp, nil
}
func GetMyIpAddr() string {
	resp, err := HttpGetWithDNSFallback("https://api64.ipify.org")
	if err != nil {
		resp, _ = HttpGetWithDNSFallback("http://ip.sb")
	}
	defer resp.Body.Close()
	s, _ := ioutil.ReadAll(resp.Body)
	return string(s)
}
