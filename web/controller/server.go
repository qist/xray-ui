package controller

import (
	"github.com/gin-gonic/gin"
	"time"
	"xray-ui/web/global"
	"xray-ui/web/service"
)

type ServerController struct {
	BaseController

	serverService service.ServerService

	lastStatus        *service.Status
	lastGetStatusTime time.Time

	lastVersions        []string
	lastGetVersionsTime time.Time

	lastGeoipStatus        *service.Status
	lastGeoipGetStatusTime time.Time

	lastGeoipVersions        []string
	lastGeoipGetVersionsTime time.Time

	lastGeositeStatus        *service.Status
	lastGeositeGetStatusTime time.Time

	lastGeositeVersions        []string
	lastGeositeGetVersionsTime time.Time
}

func NewServerController(g *gin.RouterGroup) *ServerController {
	a := &ServerController{
		lastGetStatusTime: time.Now(),
	}
	a.initRouter(g)
	a.startTask()
	return a
}

func (a *ServerController) initRouter(g *gin.RouterGroup) {
	g = g.Group("/server")

	g.Use(a.checkLogin)
	g.POST("/status", a.status)
	g.POST("/getXrayVersion", a.getXrayVersion)
	g.POST("/installXray/:version", a.installXray)
	g.POST("/getGeoipVersion", a.getGeoipVersion)
	g.POST("/installGeoip/:version", a.installGeoip)
	g.POST("/getGeositeVersion", a.getGeositeVersion)
	g.POST("/installGeosite/:version", a.installGeosite)
}

func (a *ServerController) refreshStatus() {
	a.lastStatus = a.serverService.GetStatus(a.lastStatus)
}

func (a *ServerController) startTask() {
	webServer := global.GetWebServer()
	c := webServer.GetCron()
	c.AddFunc("@every 2s", func() {
		now := time.Now()
		if now.Sub(a.lastGetStatusTime) > time.Minute*3 {
			return
		}
		a.refreshStatus()
	})
}

func (a *ServerController) status(c *gin.Context) {
	a.lastGetStatusTime = time.Now()

	jsonObj(c, a.lastStatus, nil)
}

func (a *ServerController) getXrayVersion(c *gin.Context) {
	now := time.Now()
	if now.Sub(a.lastGetVersionsTime) <= time.Minute {
		jsonObj(c, a.lastVersions, nil)
		return
	}

	versions, err := a.serverService.GetXrayVersions()
	if err != nil {
		jsonMsg(c, "获取版本", err)
		return
	}

	a.lastVersions = versions
	a.lastGetVersionsTime = time.Now()

	jsonObj(c, versions, nil)
}

func (a *ServerController) installXray(c *gin.Context) {
	version := c.Param("version")
	err := a.serverService.UpdateXray(version)
	jsonMsg(c, "安装 xray", err)
}

func (a *ServerController) getGeoipVersion(c *gin.Context) {
	now := time.Now()
	if now.Sub(a.lastGeoipGetVersionsTime) <= time.Minute {
		jsonObj(c, a.lastGeoipVersions, nil)
		return
	}

	versions, err := a.serverService.GetGeoipVersions()
	if err != nil {
		jsonMsg(c, "获取版本", err)
		return
	}

	a.lastGeoipVersions = versions
	a.lastGeoipGetVersionsTime = time.Now()

	jsonObj(c, versions, nil)
}

func (a *ServerController) installGeoip(c *gin.Context) {
	version := c.Param("version")
	err := a.serverService.UpdateGeoip(version)
	jsonMsg(c, "安装 geoip", err)
}

func (a *ServerController) getGeositeVersion(c *gin.Context) {
	now := time.Now()
	if now.Sub(a.lastGeositeGetVersionsTime) <= time.Minute {
		jsonObj(c, a.lastGeositeVersions, nil)
		return
	}

	versions, err := a.serverService.GetGeositeVersions()
	if err != nil {
		jsonMsg(c, "获取版本", err)
		return
	}

	a.lastGeositeVersions = versions
	a.lastGeositeGetVersionsTime = time.Now()

	jsonObj(c, versions, nil)
}

func (a *ServerController) installGeosite(c *gin.Context) {
	version := c.Param("version")
	err := a.serverService.UpdateGeosite(version)
	jsonMsg(c, "安装 geosite", err)
}
