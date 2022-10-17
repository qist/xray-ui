本项目基于上游X-UI项目进行略微的功能改动！后续将紧跟上游X-UI版本更新！在此感谢[vaxilu](https://github.com/vaxilu/x-ui)、[FranzKafkaYu](https://github.com/FranzKafkaYu/x-ui)及各位为此项目做出贡献

----------------------------------------------------------------------------------------------------------------------------------------------
### 功能介绍

系统状态监控
支持多用户多协议，网页可视化操作
支持的协议：vmess、vless、trojan、shadowsocks、dokodemo-door、socks、http
支持配置更多传输配置
流量统计，限制流量，限制到期时间
可自定义 xray 配置模板
支持 https 访问面板（自备域名 + ssl 证书）
更多高级配置项，详见面板

----------------------------------------------------------------------------------------------------------------------------------------------

本脚本显示功能更加人性化！已解决各种新老系统安装失败问题，并会长期更新，欢迎大家提建议！！

默认账号密码 admin/admin        

更新日志：
2022.10.17 更改trojan 可以关闭tls配置可以使用nginx 对外代理

2022.7.4 更新上游支持trojan的多类传输协议支持

2022.6.28 更新上游BUG修复

2022.6.22 更新上游BUG修复，加入自动提示脚本版本更新功能，仅支持SSH端输入"x-ui"后提示

2022.6.20 更新上游内容：加入FranzKafkaYu的流量重置功能与全新的shadowsocks 2022协议

2022.6.12 更新内容：设置用户名、密码、端口时（首次安装或者重置），加入默认回车为随机用户名密码及端口功能，彻底告别admin与54321默认设置

2022.5.17 更新内容：同步上游源码，优化双栈VPS安装结束后，双IP（V4+V6）登录信息的显示

2022.5.12 更新内容：加入已安装提示，更新脚本时不必重新输入账户、密码、端口

2022.4.26 更新上游内容：FranzKafkaYu的TG通知功能

2022.4.16 更新内容：首次安装或者后续设置端口时，如端口被占用会自动提示并要求重新设置端口（直到不冲突为止），防止端口冲突引起的安装失败问题

2022.4.14 更新上游内容：加入IBM Linuxone vps的s390x架构支持（存在被封的可能性）

-------------------------------------------------------------------------------------------------------------------------------------------------
### 手动安装

```
# 下载 
wget -N --no-check-certificate -O /usr/local/xray-ui-linux-amd64.tar.gz https://github.com/qist/xray-ui/releases/download/v0.1.1.1/xray-ui-linux-amd64.tar.gz

# 解压
    cd /usr/local/
    tar -xvf xray-ui-linux-amd64.tar.gz
    rm xray-ui-linux-amd64.tar.gz -f
    cd xray-ui
    chmod +x xray-ui bin/xray-linux-amd64
    cp -f xray-ui.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable xray-ui
    systemctl start xray-ui
```

### VPS直接运行一键脚本

```
wget -N https://raw.githubusercontent.com/qist/xray-ui/main/install.sh && bash install.sh
```

#### 编译

```
git clone https://github.com/qist/xray-ui.git

cd xray-ui

CGO_ENABLED=1 go build -o xray-ui/xray-ui  -ldflags '-linkmode "external" -extldflags "-static"' main.go
```
--------------------------------------------------------------------------------------------------------------------------------------------------
### 关于TG通知（上游内容）

使用说明:在面板后台设置机器人相关参数

Tg机器人Token

Tg机器人ChatId

#### Tg机器人周期运行时间，采用crontab语法参考语法：

30 * * * * * //每一分的第30s进行通知

@hourly //每小时通知

@daily //每天通知（凌晨零点整）

@every 8h //每8小时通知

@every 30s  //每30s通知一次

#### TG通知内容：

节点流量使用

面板登录提醒

节点到期提醒

流量预警提醒

#### TG机器人可输入内容：

/delete port将会删除对应端口的节点

/restart 将会重启xray服务，该命令不会重启xray-ui面板自身

/status 将会获取当前系统状态

/enable port将会开启对应端口的节点

/disable port将会关闭对应端口的节点

/version v1.5.5将会升级xray到1.6.0版本

/help 获取帮助信息