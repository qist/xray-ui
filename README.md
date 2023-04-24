本项目基于上游X-UI项目进行略微的功能改动！后续将紧跟上游X-UI版本更新！在此感谢[vaxilu](https://github.com/vaxilu/x-ui)及各位为此项目做出贡献

----------------------------------------------------------------------------------------------------------------------------------------------
### 功能介绍

系统状态监控
支持多协议，网页可视化操作
支持的协议：vmess、vless、trojan、shadowsocks、dokodemo-door、socks、http
支持配置更多传输配置
流量统计，限制流量，限制到期时间
可自定义 xray 配置模板
支持 https 访问面板（自备域名 + ssl 证书）
更多高级配置项，详见面板

----------------------------------------------------------------------------------------------------------------------------------------------

本脚本显示功能更加人性化！已解决各种新老系统安装失败问题，并会长期更新，欢迎大家提建议！！
    

更新日志：

2023.4.24 添加一键更新geoip,geosite 添加geoip,geosite 更新版本号

$\textcolor{#ff0000}{这次更新记得先备份一下基础配置可能会覆盖以防外一记得备份}

2023.4.23 添加docker镜像

```bash
# juestnow/xray-ui:latest 最新版本
 docker run -d --net=host -v/etc/xray-ui:/etc/xray-ui --restart=unless-stopped juestnow/xray-ui:latest 
# 查看默认账号密码
 docker run  --rm juestnow/xray-ui /root/xray-ui setting -show
```

2023.4.20 添加 配置文件下载本地，DB文件下载到本地，更新依赖到最新！

2023.4.17 添加uTLS REALITY x25519 使用go原生生成公钥私钥

2023.4.12 升级依赖模块 sockopt 可以在 REALITY TLS NONE 可用！增加REALITY分享连接shortId随机选择

2023.4.11 REALITY 配置 生成 x25519 shortIds等 ！

2023.4.7 添加 xray-ui x25519 生成REALITY公私钥 ！

[xray-ui 面板配置 reality](./reality.md)

2023.3.13 添加reality 支持 !

* [reality 配置参考](./media/reality.png)

2023.3.10 删除旧版XTLS配置以便支持xray1.8.0版本 旧trojan配置请关闭然后打开编辑从新保存即可正常，旧VLESS配置可能需要删除重新创建xray才能启动成功

2023.1.7 添加VLESS-TCP-XTLS-Vision 支持

2022.10.19 更新xray时不更新geoip.dat geosite.dat . geoip.dat geosite.dat 使用[Loyalsoldier](https://github.com/Loyalsoldier/geoip)提供版本单独更新

2022.10.17 更改trojan 可以关闭tls配置可以使用nginx 对外代理

-------------------------------------------------------------------------------------------------------------------------------------------------
### 手动安装

```bash
# 下载 
wget -N --no-check-certificate -O /usr/local/xray-ui-linux-amd64.tar.gz https://github.com/qist/xray-ui/releases/latest/download/xray-ui-linux-amd64.tar.gz

# 解压
    cd /usr/local/
    tar -xvf xray-ui-linux-amd64.tar.gz
    rm xray-ui-linux-amd64.tar.gz -f
    cd xray-ui
    chmod +x xray-ui bin/xray-linux-amd64
    cp -f xray-ui.service /etc/systemd/system/
    wget --no-check-certificate -O /usr/bin/xray-ui https://raw.githubusercontent.com/qist/xray-ui/main/xray-ui.sh
    chmod +x /usr/bin/xray-ui
    systemctl daemon-reload
    systemctl enable xray-ui
    systemctl start xray-ui
    # 设置账号密码：
    /usr/local/xray-ui/xray-ui setting -username admin -password admin123
    # 设置端口
   /usr/local/xray-ui/xray-ui setting -port  5432
```

### VPS直接运行一键脚本

```bash
bash <(curl -Ls  https://raw.githubusercontent.com/qist/xray-ui/main/install.sh)
```

#### 编译

```bash
git clone https://github.com/qist/xray-ui.git

cd xray-ui
debian/ubuntu解决方案：sudo apt-get install libc6-dev
redhat/centos解决方案：yum install glibc-static.x86_64 -y 或者 sudo yum install glibc-static
CGO_ENABLED=1 go build -o xray-ui/xray-ui  -ldflags '-linkmode "external" -extldflags "-static"' main.go
# 交叉编译
在centos7中安装，yum install gcc-aarch64-linux-gnu
去https://releases.linaro.org/components/toolchain/binaries/ 找 latest-7
下载 aarch64-linux-gnu/sysroot-glibc-linaro-2.25-2019.02-aarch64-linux-gnu.tar.xz
自己找个目录, 解压 tar Jxvf sysroot-glibc-linaro-2.25-2019.02-aarch64-linux-gnu.tar.xz
build时，指定 sysroot 的位置。

用 CGO_ENABLED=1 GOOS=linux GOARCH=arm64 CC="aarch64-linux-gnu-gcc" CGO_CFLAGS="-g -O2 --sysroot=/..../sysroot-glibc-linaro-2.25-2019.02-aarch64-linux-gnu/" CGO_LDFLAGS="-g -O2 --sysroot=/..../sysroot-glibc-linaro-2.25-2019.02-aarch64-linux-gnu/" go build -v -ldflags "-w -s" -o xray-ui/xray-ui main.go 编译成功。
debian/ubuntu解决方案
apt install gcc-aarch64-linux-gnu
CGO_ENABLED=1 GOARCH=arm64 CC="aarch64-linux-gnu-gcc" go build -o xray-ui/xray-ui  -ldflags '-linkmode "external" -extldflags "-static"' main.go 
```

--------------------------------------------------------------------------------------------------------------------------------------------------
### nginx 代理设置

```nginx
upstream xray-ui {
        least_conn;
        server 127.0.0.1:54321 max_fails=3 fail_timeout=30s;
        keepalive 1000;
}
server {
    listen 80;
    server_name xray.test.com;
    location / {
        proxy_redirect     off;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP   $remote_addr;
        proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
        proxy_ssl_session_reuse off;
        proxy_ssl_server_name on;
        proxy_buffering    off;
        proxy_connect_timeout      90;
        proxy_send_timeout         90;
        proxy_read_timeout         90;
        proxy_buffer_size          4k;
        proxy_buffers              4 32k;
        proxy_busy_buffers_size    64k;
        proxy_http_version 1.1;
        proxy_set_header Accept-Encoding "";
        proxy_pass http://xray-ui;
        #proxy_pass_request_headers on;
        proxy_set_header Connection "keep-alive";
        proxy_store off;
    }
 }
 # vpn代理nginx 配置参考
https://github.com/qist/xray/tree/main/xray/nginx
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

/version 0.1.1.1 xray升级到1.6.0版本

/help 获取帮助信息
