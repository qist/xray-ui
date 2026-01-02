package tlsmanager

import (
	"crypto/rand"
	"crypto/sha256"
	"crypto/tls"
	"crypto/x509"
	"encoding/hex"
	"fmt"
	"os"
	"sync"

	"xray-ui/logger"
)

type Manager struct {
	certFile string
	keyFile  string
	caFile   string

	mu        sync.Mutex
	lastHash  string
	ticketKey [32]byte

	DisableSessionTicket bool
}

func New(certFile, keyFile, caFile string) *Manager {
	m := &Manager{
		certFile: certFile,
		keyFile:  keyFile,
		caFile:   caFile,
	}
	m.rotateTicketKey()
	m.lastHash = m.certHash()
	return m
}

func (m *Manager) TLSConfig() *tls.Config {
	base := &tls.Config{
		MinVersion: tls.VersionTLS12,
	}

	base.GetConfigForClient = func(hello *tls.ClientHelloInfo) (*tls.Config, error) {
		m.reloadIfChanged()

		cert, err := tls.LoadX509KeyPair(m.certFile, m.keyFile)
		if err != nil {
			logger.Error("load tls cert failed:", err)
			return nil, err
		}

		cfg := &tls.Config{
			MinVersion:   tls.VersionTLS12,
			Certificates: []tls.Certificate{cert},
		}

		if m.DisableSessionTicket {
			cfg.SessionTicketsDisabled = true
		} else {
			keys := [][32]byte{m.ticketKey}
			cfg.SetSessionTicketKeys(keys)
		}

		if m.caFile != "" {
			caPem, err := os.ReadFile(m.caFile)
			if err != nil {
				return nil, err
			}
			pool := x509.NewCertPool()
			if !pool.AppendCertsFromPEM(caPem) {
				return nil, fmt.Errorf("append ca cert failed")
			}
			cfg.ClientCAs = pool
			cfg.ClientAuth = tls.RequireAndVerifyClientCert
		}

		return cfg, nil
	}

	return base
}

func (m *Manager) reloadIfChanged() {
	m.mu.Lock()
	defer m.mu.Unlock()

	hash := m.certHash()
	if hash != m.lastHash {
		logger.Info("TLS certificate changed, rotate session ticket key")
		m.rotateTicketKey()
		m.lastHash = hash
	}
}

func (m *Manager) certHash() string {
	data, err := os.ReadFile(m.certFile)
	if err != nil {
		return ""
	}
	sum := sha256.Sum256(data)
	return hex.EncodeToString(sum[:])
}

func (m *Manager) rotateTicketKey() {
	_, _ = rand.Read(m.ticketKey[:])
}