package web

import (
	"context"
	"crypto/tls"
	// "crypto/x509"
	"embed"
	// "fmt"
	"html/template"
	"io"
	"io/fs"
	// "io/ioutil"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
	"xray-ui/config"
	"xray-ui/logger"
	"xray-ui/util/common"
	"xray-ui/web/controller"
	"xray-ui/web/job"
	"xray-ui/web/network"
	"xray-ui/web/service"
	"xray-ui/web/tlsmanager"

	"github.com/BurntSushi/toml"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/nicksnyder/go-i18n/v2/i18n"
	"github.com/robfig/cron/v3"
	"golang.org/x/text/language"
)

//go:embed assets/*
var assetsFS embed.FS

//go:embed html/*
var htmlFS embed.FS

//go:embed translation/*
var i18nFS embed.FS

var startTime = time.Now()

var xuiBeginRunTime string

var isTelegramEnable bool

// 预定义 IPv4 私网和回环网段
var privateIPv4Nets []*net.IPNet

type wrapAssetsFS struct {
	embed.FS
}

func GetXuiStarttime() string {
	return xuiBeginRunTime
}

func (f *wrapAssetsFS) Open(name string) (fs.File, error) {
	file, err := f.FS.Open("assets/" + name)
	if err != nil {
		return nil, err
	}
	return &wrapAssetsFile{
		File: file,
	}, nil
}

type wrapAssetsFile struct {
	fs.File
}

func (f *wrapAssetsFile) Stat() (fs.FileInfo, error) {
	info, err := f.File.Stat()
	if err != nil {
		return nil, err
	}
	return &wrapAssetsFileInfo{
		FileInfo: info,
	}, nil
}

type wrapAssetsFileInfo struct {
	fs.FileInfo
}

func (f *wrapAssetsFileInfo) ModTime() time.Time {
	return startTime
}

type Server struct {
	httpServer *http.Server
	listener   net.Listener

	index  *controller.IndexController
	server *controller.ServerController
	xui    *controller.XUIController

	xrayService     service.XrayService
	settingService  service.SettingService
	inboundService  service.InboundService
	telegramService service.TelegramService

	cron *cron.Cron

	ctx    context.Context
	cancel context.CancelFunc
	
	// 证书管理器
	tlsMgr *tlsmanager.Manager
}

func NewServer() *Server {
	ctx, cancel := context.WithCancel(context.Background())
	return &Server{
		ctx:    ctx,
		cancel: cancel,
	}
}

func (s *Server) getHtmlFiles() ([]string, error) {
	files := make([]string, 0)
	dir, _ := os.Getwd()
	err := fs.WalkDir(os.DirFS(dir), "web/html", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		files = append(files, path)
		return nil
	})
	if err != nil {
		return nil, err
	}
	return files, nil
}

func (s *Server) getHtmlTemplate(funcMap template.FuncMap) (*template.Template, error) {
	t := template.New("").Funcs(funcMap)
	err := fs.WalkDir(htmlFS, "html", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() {
			newT, err := t.ParseFS(htmlFS, path+"/*.html")
			if err != nil {
				// ignore
				return nil
			}
			t = newT
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return t, nil
}

func (s *Server) initRouter() (*gin.Engine, error) {
	// 设置 Gin 运行模式
	if config.IsDebug() {
		gin.SetMode(gin.DebugMode)
	} else {
		// 生产环境禁用日志输出
		gin.DefaultWriter = io.Discard
		gin.DefaultErrorWriter = io.Discard
		gin.SetMode(gin.ReleaseMode)
	}

	engine := gin.Default()

	// 读取配置 secret 和 basePath
	secret, err := s.settingService.GetSecret()
	if err != nil {
		return nil, err
	}

	basePath, err := s.settingService.GetBasePath()
	if err != nil {
		return nil, err
	}
	assetsBasePath := basePath + "assets/"

	// 创建 Cookie Store 并设置 Options
	store := cookie.NewStore(secret)
	store.Options(sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7, // 7 天
		HttpOnly: true,
		Secure:   false, // 根据实际是否使用 HTTPS 设为 true 或 false
		Domain:   "",    // 关键：留空，不设置 Domain，避免 IPv6 地址带 [] 导致浏览器拒绝 Cookie
	})
	engine.Use(sessions.Sessions("session", store))

	// 设置 base_path 到 Context，供模板或接口调用
	engine.Use(func(c *gin.Context) {
		c.Set("base_path", basePath)
	})

	// 静态资源缓存头设置
	engine.Use(func(c *gin.Context) {
		uri := c.Request.RequestURI
		if strings.HasPrefix(uri, assetsBasePath) {
			c.Header("Cache-Control", "max-age=31536000") // 1 年缓存
		}
	})

	// 国际化支持初始化
	err = s.initI18n(engine)
	if err != nil {
		return nil, err
	}

	// 加载页面模板和静态文件
	if config.IsDebug() {
		// 开发环境 - 直接加载文件系统
		files, err := s.getHtmlFiles()
		if err != nil {
			return nil, err
		}
		engine.LoadHTMLFiles(files...)
		engine.StaticFS(basePath+"assets", http.FS(os.DirFS("web/assets")))
	} else {
		// 生产环境 - 加载内嵌模板和静态资源
		t, err := s.getHtmlTemplate(engine.FuncMap)
		if err != nil {
			return nil, err
		}
		engine.SetHTMLTemplate(t)
		engine.StaticFS(basePath+"assets", http.FS(&wrapAssetsFS{FS: assetsFS}))
	}

	// 分组路由
	g := engine.Group(basePath)

	// 初始化各控制器
	s.index = controller.NewIndexController(g)
	s.server = controller.NewServerController(g)
	s.xui = controller.NewXUIController(g)

	return engine, nil
}

func (s *Server) initI18n(engine *gin.Engine) error {
	bundle := i18n.NewBundle(language.SimplifiedChinese)
	bundle.RegisterUnmarshalFunc("toml", toml.Unmarshal)
	err := fs.WalkDir(i18nFS, "translation", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		data, err := i18nFS.ReadFile(path)
		if err != nil {
			return err
		}
		_, err = bundle.ParseMessageFileBytes(data, path)
		return err
	})
	if err != nil {
		return err
	}

	findI18nParamNames := func(key string) []string {
		names := make([]string, 0)
		keyLen := len(key)
		for i := 0; i < keyLen-1; i++ {
			if key[i:i+2] == "{{" { // 判断开头 "{{"
				j := i + 2
				isFind := false
				for ; j < keyLen-1; j++ {
					if key[j:j+2] == "}}" { // 结尾 "}}"
						isFind = true
						break
					}
				}
				if isFind {
					names = append(names, key[i+3:j])
				}
			}
		}
		return names
	}

	var localizer *i18n.Localizer

	engine.FuncMap["i18n"] = func(key string, params ...string) (string, error) {
		names := findI18nParamNames(key)
		if len(names) != len(params) {
			return "", common.NewError("find names:", names, "---------- params:", params, "---------- num not equal")
		}
		templateData := map[string]interface{}{}
		for i := range names {
			templateData[names[i]] = params[i]
		}
		return localizer.Localize(&i18n.LocalizeConfig{
			MessageID:    key,
			TemplateData: templateData,
		})
	}

	engine.Use(func(c *gin.Context) {
		accept := c.GetHeader("Accept-Language")
		localizer = i18n.NewLocalizer(bundle, accept)
		c.Set("localizer", localizer)
		c.Next()
	})

	return nil
}

func (s *Server) startTask() {
	err := s.xrayService.RestartXray(true)
	if err != nil {
		logger.Warning("start xray failed:", err)
	}
	// 每 30 秒检查一次 xray 是否在运行
	s.cron.AddJob("@every 30s", job.NewCheckXrayRunningJob())

	go func() {
		time.Sleep(time.Second * 5)
		// 每 10 秒统计一次流量，首次启动延迟 5 秒，与重启 xray 的时间错开
		s.cron.AddJob("@every 10s", job.NewXrayTrafficJob())
	}()

	// 每 30 秒检查一次 inbound 流量超出和到期的情况
	s.cron.AddJob("@every 30s", job.NewCheckInboundJob())
	//每2s检查一次SSH信息
	s.cron.AddFunc("@every 2s", func() { job.NewStatsNotifyJob().SSHStatusLoginNotify(xuiBeginRunTime) })
	// 每一天提示一次流量情况,上海时间8点30
	var entry cron.EntryID

	if isTelegramEnable {
		runtime, err := s.settingService.GetTgbotRuntime()
		if err != nil || runtime == "" {
			logger.Errorf("Add NewStatsNotifyJob error[%s],Runtime[%s] invalid,wil run default", err, runtime)
			runtime = "@daily"
		}
		logger.Infof("Tg notify enabled,run at %s", runtime)
		entry, err = s.cron.AddJob(runtime, job.NewStatsNotifyJob())
		if err != nil {
			logger.Warning("Add NewStatsNotifyJob error", err)
			return
		}
	} else {
		s.cron.Remove(entry)
	}
}

func (s *Server) Start() (err error) {
	//这是一个匿名函数，没没有函数名
	defer func() {
		if err != nil {
			s.Stop()
		}
	}()

	loc, err := s.settingService.GetTimeLocation()
	if err != nil {
		return err
	}
	s.cron = cron.New(cron.WithLocation(loc), cron.WithSeconds())
	s.cron.Start()

	engine, err := s.initRouter()
	if err != nil {
		return err
	}

	certFile, err := s.settingService.GetCertFile()
	if err != nil {
		return err
	}
	keyFile, err := s.settingService.GetKeyFile()
	if err != nil {
		return err
	}
	caFile, err := s.settingService.GetCaFile()
	if err != nil {
		return err
	}
	listen, err := s.settingService.GetListen()
	if err != nil {
		return err
	}
	port, err := s.settingService.GetPort()
	if err != nil {
		return err
	}
	if certFile == "" || keyFile == "" {
		// If any of the files are empty, override `listen` to use "127.0.0.1"
		if !isInternalIP(listen) {
			// If not internal, fallback to "127.0.0.1"
			listen = fallbackToLocalhost(listen)
		}
	}
	
	listenAddr := net.JoinHostPort(listen, strconv.Itoa(port))
	listener, err := net.Listen("tcp", listenAddr)
	if err != nil {
		return err
	}

	// 创建 TLS 管理器
	if certFile != "" && keyFile != "" {
		s.tlsMgr = tlsmanager.New(certFile, keyFile, caFile)
		// 可以通过以下方式设置是否禁用会话票证
		s.tlsMgr.DisableSessionTicket = true
		
		tlsConfig := s.tlsMgr.TLSConfig()
		
		if caFile != "" {
			// mTLS 模式
			listener = network.NewAutoHttpsListener(listener)
			listener = tls.NewListener(listener, tlsConfig)
			logger.Info("web server run mTLS on", listener.Addr())
		} else {
			// TLS 模式
			listener = network.NewAutoHttpsListener(listener)
			listener = tls.NewListener(listener, tlsConfig)
			logger.Info("web server run https on", listener.Addr())
		}
	} else {
		logger.Info("web server run http on", listener.Addr())
	}
	
	s.listener = listener

	xuiBeginRunTime = time.Now().Format("2006-01-02 15:04:05")

	isTgbotenabled, err := s.settingService.GetTgbotenabled()
	if (err == nil) && (isTgbotenabled) {
		isTelegramEnable = true

		go func() {
			s.telegramService.StartRun()
			time.Sleep(time.Second * 2)
		}()

	} else {
		isTelegramEnable = false
	}

	s.startTask()

	s.httpServer = &http.Server{
		Handler: engine,
	}

	go func() {
		s.httpServer.Serve(listener)
	}()

	return nil
}

func (s *Server) Stop() error {
	s.cancel()
	if isTelegramEnable {
		s.telegramService.StopRunAndClose()
	}
	s.xrayService.StopXray()
	if s.cron != nil {
		s.cron.Stop()
	}
	var err1 error
	var err2 error
	if s.httpServer != nil {
		err1 = s.httpServer.Shutdown(s.ctx)
	}
	if s.listener != nil {
		err2 = s.listener.Close()
	}
	return common.Combine(err1, err2)
}

func (s *Server) GetCtx() context.Context {
	return s.ctx
}

func (s *Server) GetCron() *cron.Cron {
	return s.cron
}

func init() {
	for _, cidr := range []string{
		"10.0.0.0/8",     // A类私网
		"172.16.0.0/12",  // B类私网
		"192.168.0.0/16", // C类私网
		"100.64.0.0/10",  // CGNAT地址段
		"127.0.0.0/8",    // 回环
	} {
		_, netw, err := net.ParseCIDR(cidr)
		if err == nil {
			privateIPv4Nets = append(privateIPv4Nets, netw)
		}
	}
}

// isInternalIP 判断是否为私网或回环IP（支持IPv4和IPv6）
func isInternalIP(ipStr string) bool {
	ip := net.ParseIP(ipStr)
	if ip == nil {
		return false
	}

	if ip4 := ip.To4(); ip4 != nil {
		// IPv4 判断是否在私网/回环网段内
		for _, privateNet := range privateIPv4Nets {
			if privateNet.Contains(ip4) {
				return true
			}
		}
		return false
	}

	// IPv6 判断回环或链路本地地址
	if ip.IsLoopback() || ip.IsLinkLocalUnicast() {
		return true
	}

	// 判断 IPv6 fc00::/7 私网地址段
	if ip[0]&0xfe == 0xfc {
		return true
	}

	return false
}

// fallbackToLocalhost 根据传入地址返回对应的本地回环地址
func fallbackToLocalhost(listen string) string {
	ip := net.ParseIP(listen)
	if ip == nil {
		// 无法解析则默认回退 IPv4 回环
		return "127.0.0.1"
	}
	if ip.To4() != nil {
		// IPv4 回退 IPv4 回环
		return "127.0.0.1"
	}
	// IPv6 回退 IPv6 回环
	return "::1"
}

