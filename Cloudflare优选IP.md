# Cloudflare优选IP

`https://github.com/XIU2/CloudflareSpeedTest/releases` 下载对应环境版本

## 下载 CloudflareSpeedTest

```bash
# 创建目录
mkdir -p /opt/CloudflareST
# 进入新创建目录
cd /opt/CloudflareST
# 下载对应架构的文件 最新的latest版本
wget https://github.com/XIU2/CloudflareSpeedTest/releases/latest/download/CloudflareST_linux_amd64.tar.gz
# 解压文件
tar -xvf CloudflareST_linux_amd64.tar.gz
```

## 手动使用CloudflareSpeedTest

```bash
# 官方文档 https://github.com/XIU2/CloudflareSpeedTest
# 获取最快10 ip
./CloudflareST  -dn 10 -tll 40 -tl 200 -httping
```

## 安装coredns

`https://github.com/coredns/coredns/releases` 选择你要下载版本

```bash
# 创建目录
mkdir -p /opt/coredns
# 进入新创建目录
cd /opt/coredns
# 下载对应架构的文件
wget https://github.com/coredns/coredns/releases/download/v1.10.1/coredns_1.10.1_linux_amd64.tgz
#　解压文件
tar -xvf coredns_1.10.1_linux_amd64.tgz
# 创建配置文件
cat >Corefile << EOF 
.:443 {
    forward .  223.5.5.5:53 114.114.114.114:53 119.29.29.29:53
    loadbalance
    log . "{remote} {type} {name} {class} {size} {rcode} {duration}"
    cache 30
    reload 6s
    hosts {
        172.64.229.37 test1.example.com
        172.64.229.37 test2.example.com
        172.64.229.37 test3.example.com
        172.64.229.37 test4.example.com
        fallthrough
    }
}
EOF
# 配置说明：
443 监听端口 同时监听tcp/udp 支持tls https grpc 等方案 https://coredns.io/plugins/tls/ 
forward 本地无解析查询上游dns
loadbalance 负载均衡
log 日志格式
cache 缓存
reload 配置重新加载时间
hosts 默认读取/etc/hosts 也可以自己写 这里我直接写配置文件就可以不动hosts 文件
fallthrough 查询不到域名继续向下查 走入forward
172.64.229.37 Cloudflare 优选ip 最快速度的

# 配置启动脚本

cat >/etc/systemd/system/coredns.service << EOF
[Unit]
Description=smart dns server
After=network.target

[Service]
ExecStart=/opt/coredns/coredns -conf=/opt/coredns/Corefile
LimitNOFILE=65535
LimitNPROC=65535
LimitCORE=infinity
LimitMEMLOCK=infinity
KillMode=process
Restart=always
StartLimitInterval=0
RestartSec=10
[Install]
WantedBy=multi-user.target
EOF
# 配置开机启动并启动程序 
 systemctl enable coredns --now
# 查看启动状态
 systemctl status coredns
```

## 配置CloudflareST 并定时执行修改优选IP
 
`https://github.com/XIU2/CloudflareSpeedTest/discussions/312` 官方默认修改 /etc/hosts 文件

```bash
# 进入CloudflareST 目录

cd /opt/CloudflareST

# 使用coredns 实现优选ip 解析需要修改cfst_hosts.sh 要使用hosts 就不用修改
# 下面是修改使用coredns 解析脚本
#!/usr/bin/env bash
PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin:~/bin
export PATH
# --------------------------------------------------------------
#       项目: CloudflareSpeedTest 自动更新 Hosts
#       版本: 1.0.4
#       作者: XIU2
#       项目: https://github.com/XIU2/CloudflareSpeedTest
# --------------------------------------------------------------

_CHECK() {
        while true
                do
                if [[ ! -e "nowip_hosts.txt" ]]; then
                        echo -e "该脚本的作用为 CloudflareST 测速后获取最快 IP 并替换 Hosts 中的 Cloudflare CDN IP。\n使用前请先阅读：https://github.com/XIU2/CloudflareSpeedTest/issues/42#issuecomment-768273848"
                        echo -e "第一次使用，请先将 Hosts 中所有 Cloudflare CDN IP 统一改为一个 IP。"
                        read -e -p "输入该 Cloudflare CDN IP 并回车（后续不再需要该步骤）：" NOWIP
                        if [[ ! -z "${NOWIP}" ]]; then
                                echo ${NOWIP} > nowip_hosts.txt
                                break
                        else
                                echo "该 IP 不能是空！"
                        fi
                else
                        break
                fi
        done
}

_UPDATE() {
        echo -e "开始测速..."
        NOWIP=$(head -1 nowip_hosts.txt)

        # 这里可以自己添加、修改 CloudflareST 的运行参数
        ./CloudflareST  -dn 10 -tll 40 -tl 200 -httping -o "result_hosts.txt"

        # 如果需要 "找不到满足条件的 IP 就一直循环测速下去"，那么可以将下面的两个 exit 0 改为 _UPDATE 即可
        [[ ! -e "result_hosts.txt" ]] && echo "CloudflareST 测速结果 IP 数量为 0，跳过下面步骤..." && exit 0

        # 下面这行代码是 "找不到满足条件的 IP 就一直循环测速下去" 才需要的代码
        # 考虑到当指定了下载速度下限，但一个满足全部条件的 IP 都没找到时，CloudflareST 就会输出所有 IP 结果
        # 因此当你指定 -sl 参数时，需要移除下面这段代码开头的 # 井号注释符，来做文件行数判断（比如下载测速数量：10 个，那么下面的值就设在为 11）
        #[[ $(cat result_hosts.txt|wc -l) > 11 ]] && echo "CloudflareST 测速结果没有找到一个完全满足条件的 IP，重新测速..." && _UPDATE


        BESTIP=$(sed -n "2,1p" result_hosts.txt | awk -F, '{print $1}')
        if [[ -z "${BESTIP}" ]]; then
                echo "CloudflareST 测速结果 IP 数量为 0，跳过下面步骤..."
                exit 0
        fi
        echo ${BESTIP} > nowip_hosts.txt
        echo -e "\n旧 IP 为 ${NOWIP}\n新 IP 为 ${BESTIP}\n"

        echo "开始备份 Hosts 文件（hosts_backup）..."
        \cp -f /opt/coredns/Corefile /opt/coredns/Corefile_backup

        echo -e "开始替换..."
        sed -i 's/'${NOWIP}'/'${BESTIP}'/g' /opt/coredns/Corefile
        echo -e "完成..."
}

_CHECK
_UPDATE

# 第一次运行记得给/opt/coredns/Corefile 里面配置优选IP

./cfst_hosts.sh 

#输入172.64.229.37 等待 执行结束
# 可以看到/opt/coredns/ 目录生成了备份文件Corefile_backup 更新了的配置文件Corefile

# 创建定时任务调用脚本
cat >crontab.sh << EOF
#!/bin/bash
cd /opt/CloudflareST && ./cfst_hosts.sh
EOF
# crontab.sh 可执行权限
chmod +x crontab.sh

# 测试crontab.sh 脚本能否正常运行 记得查看/opt/coredns/Corefile 是不是 改变如果改变证明成功

/opt/CloudflareST/crontab.sh

# 每天凌晨 5 点 0 分，执行一次脚本
0 5 * * * root bash /opt/CloudflareST/crontab.sh >/dev/null 2>&1

# 每天凌晨 5 点 30 分，执行一次脚本
30 5 * * * root bash /opt/CloudflareST/crontab.sh >/dev/null 2>&1

# 每 6 个小时（0 分时），执行一次脚本
0 */6 * * * root bash /opt/CloudflareST/crontab.sh >/dev/null 2>&1

# 每小时 0 分，执行一次脚本
# 创建定时任务
# 说明 0 5 * * * 每天凌晨5点运行 
vim /etc/crontab

0 5 * * * root bash /opt/CloudflareST/crontab.sh >/dev/null 2>&1

# 保存 wq!
```

## 客户端配置

```bash

# Clash.Meta 配置
  default-nameserver： # 解析rule-providers跟proxy-providers url的域名或者其它dns httpdns 域名解析
    - tcp://coredns ip:443
    - coredns ip:443
  nameserver-policy: # 浏览器 curl 网络工具使用解析 域名 dns 
    "+.example.com": 
    - tcp://coredns ip:443
    - coredns ip:443
  proxy-server-nameserver: # 解析代理节点服务器域名就是 ss trojan vless 等域名
    - tcp://coredns ip:443
    - coredns ip:443
# linux 系统 win 系统 
# 配置 coredns ip 记得监听53 端口 不然就要进行配置
# 当然也支持在你的路由器里面配置。
# 其它客户端的程序根据官方文档修改。
```