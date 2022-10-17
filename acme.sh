#!/bin/bash
red='\033[0;31m'
bblue='\033[0;34m'
plain='\033[0m'
red(){ echo -e "\033[31m\033[01m$1\033[0m";}
green(){ echo -e "\033[32m\033[01m$1\033[0m";}
yellow(){ echo -e "\033[33m\033[01m$1\033[0m";}
white(){ echo -e "\033[37m\033[01m$1\033[0m";}
readp(){ read -p "$(yellow "$1")" $2;}
[[ $EUID -ne 0 ]] && yellow "请以root模式运行脚本" && rm -rf acme.sh && exit
if [[ -f /etc/redhat-release ]]; then
release="Centos"
elif cat /etc/issue | grep -q -E -i "debian"; then
release="Debian"
elif cat /etc/issue | grep -q -E -i "ubuntu"; then
release="Ubuntu"
elif cat /etc/issue | grep -q -E -i "centos|red hat|redhat"; then
release="Centos"
elif cat /proc/version | grep -q -E -i "debian"; then
release="Debian"
elif cat /proc/version | grep -q -E -i "ubuntu"; then
release="Ubuntu"
elif cat /proc/version | grep -q -E -i "centos|red hat|redhat"; then
release="Centos"
else 
red "不支持你当前系统，请选择使用Ubuntu,Debian,Centos系统" && rm -rf acme.sh && exit 
fi

v4v6(){
v6=$(curl -s6m5 https://ip.gs -k)
v4=$(curl -s4m5 https://ip.gs -k)
}


acme1(){
[[ $(type -P yum) ]] && yumapt='yum -y' || yumapt='apt -y'
[[ $(type -P curl) ]] || (yellow "检测到curl未安装，升级安装中" && $yumapt update;$yumapt install curl)
[[ $(type -P lsof) ]] || (yellow "检测到lsof未安装，升级安装中" && $yumapt update;$yumapt install lsof)
[[ $(type -P socat) ]] || $yumapt install socat
v4v6
if [[ -z $v4 ]]; then
yellow "检测到VPS为纯IPV6 Only，添加dns64"
echo -e nameserver 2a01:4f8:c2c:123f::1 > /etc/resolv.conf
green "dns64添加完毕"
sleep 2
fi
}
acme2(){
yellow "关闭防火墙，开放所有端口规则"
systemctl stop firewalld.service >/dev/null 2>&1
systemctl disable firewalld.service >/dev/null 2>&1
setenforce 0 >/dev/null 2>&1
ufw disable >/dev/null 2>&1
iptables -P INPUT ACCEPT >/dev/null 2>&1
iptables -P FORWARD ACCEPT >/dev/null 2>&1
iptables -P OUTPUT ACCEPT >/dev/null 2>&1
iptables -t nat -F >/dev/null 2>&1
iptables -t mangle -F >/dev/null 2>&1
iptables -F >/dev/null 2>&1
iptables -X >/dev/null 2>&1
netfilter-persistent save >/dev/null 2>&1
if [[ -n $(apachectl -v 2>/dev/null) ]]; then
systemctl stop httpd.service >/dev/null 2>&1
systemctl disable httpd.service >/dev/null 2>&1
service apache2 stop >/dev/null 2>&1
systemctl disable apache2 >/dev/null 2>&1
fi
green "所有端口已开放"
sleep 2
if [[ -n $(lsof -i :80|grep -v "PID") ]]; then
yellow "检测到80端口被占用，现执行80端口全释放"
sleep 2
lsof -i :80|grep -v "PID"|awk '{print "kill -9",$2}'|sh >/dev/null 2>&1
green "80端口全释放完毕！"
sleep 2
fi
}
acme3(){
readp "请输入注册所需的邮箱（回车跳过则自动生成虚拟gmail邮箱）：" Aemail
if [ -z $Aemail ]; then
auto=`date +%s%N |md5sum | cut -c 1-6`
Aemail=$auto@gmail.com
fi
yellow "当前注册的邮箱名称：$Aemail"
green "开始安装acme.sh申请证书脚本"
wget -N https://github.com/Neilpang/acme.sh/archive/master.tar.gz >/dev/null 2>&1
tar -zxvf master.tar.gz >/dev/null 2>&1
cd acme.sh-master >/dev/null 2>&1
./acme.sh --install >/dev/null 2>&1
cd
curl https://get.acme.sh | sh -s email=$Aemail
[[ -n $(/root/.acme.sh/acme.sh -v 2>/dev/null) ]] && green "安装acme.sh证书申请程序成功" || red "安装acme.sh证书申请程序失败" 
bash /root/.acme.sh/acme.sh --upgrade --use-wget --auto-upgrade
}

checktls(){
fail(){
red "遗憾，域名证书申请失败"
yellow "建议一：更换下二级域名名称再尝试执行脚本（重要）"
green "例：原二级域名 x.ygkkk.eu.org 或 x.ygkkk.cf ，在cloudflare中重命名其中的x名称，确定并生效"
echo
yellow "建议二：更换下当前本地网络IP环境，再尝试执行脚本"
rm -rf acme.sh && exit
}
if [[ -f /root/cert.crt && -f /root/private.key ]] && [[ -s /root/cert.crt && -s /root/private.key ]]; then
if [[ -f '/etc/hysteria/config.json' ]]; then
echo ${ym} > /etc/hysteria/ca.log
fi
sed -i '/--cron/d' /etc/crontab
echo "0 0 * * * root bash /root/.acme.sh/acme.sh --cron -f >/dev/null 2>&1" >> /etc/crontab
green "root目录下的域名证书申请成功或已存在！域名证书（cert.crt）和密钥（private.key）已保存到 /root 文件夹" 
yellow "公钥文件crt路径如下，可直接复制"
green "/root/cert.crt"
yellow "密钥文件key路径如下，可直接复制"
green "/root/private.key"
rm -rf acme.sh
else
fail
fi
}

installCA(){
bash ~/.acme.sh/acme.sh --install-cert -d ${ym} --key-file /root/private.key --fullchain-file /root/cert.crt --ecc
}

ACMEstandaloneDNS(){
readp "请输入解析完成的二级域名:" ym
green "已输入的二级域名:$ym" && sleep 1
domainIP=$(curl -s ipget.net/?ip="$ym")
wro
if [[ $domainIP = $v4 ]]; then
bash /root/.acme.sh/acme.sh  --issue -d ${ym} --standalone -k ec-256 --server letsencrypt --insecure
fi
if [[ $domainIP = $v6 ]]; then
bash /root/.acme.sh/acme.sh  --issue -d ${ym} --standalone -k ec-256 --server letsencrypt --listen-v6 --insecure
fi
installCA
checktls
}
ACMEDNS(){
readp "请输入解析完成的域名:" ym
green "已输入的域名:$ym" && sleep 1
freenom=`echo $ym | awk -F '.' '{print $NF}'`
if [[ $freenom =~ tk|ga|gq|ml|cf ]]; then
red "经检测，你正在使用freenom免费域名解析，不支持当前DNS API模式，脚本退出" && rm -rf acme.sh && exit 
fi
domainIP=$(curl -s ipget.net/?ip=acme.sh."$ym")
if [[ -n $(echo $domainIP | grep nginx) ]]; then
green "经检测，当前为单域名证书申请" && sleep 2
domainIP=$(curl -s ipget.net/?ip="$ym")
else
green "经检测，当前为泛域名证书申请" && sleep 2
fi
wro
echo
ab="请选择托管域名解析服务商：\n1.Cloudflare\n2.腾讯云DNSPod\n3.阿里云Aliyun\n 请选择："
readp "$ab" cd
case "$cd" in 
1 )
readp "请复制Cloudflare的Global API Key：" GAK
export CF_Key="$GAK"
readp "请输入登录Cloudflare的注册邮箱地址：" CFemail
export CF_Email="$CFemail"
if [[ $domainIP = $v4 ]]; then
bash /root/.acme.sh/acme.sh --issue --dns dns_cf -d ${ym} -k ec-256 --server letsencrypt --insecure
fi
if [[ $domainIP = $v6 ]]; then
bash /root/.acme.sh/acme.sh --issue --dns dns_cf -d ${ym} -k ec-256 --server letsencrypt --listen-v6 --insecure
fi
;;
2 )
readp "请复制腾讯云DNSPod的DP_Id：" DPID
export DP_Id="$DPID"
readp "请复制腾讯云DNSPod的DP_Key：" DPKEY
export DP_Key="$DPKEY"
if [[ $domainIP = $v4 ]]; then
bash /root/.acme.sh/acme.sh --issue --dns dns_dp -d ${ym} -k ec-256 --server letsencrypt --insecure
fi
if [[ $domainIP = $v6 ]]; then
bash /root/.acme.sh/acme.sh --issue --dns dns_dp -d ${ym} -k ec-256 --server letsencrypt --listen-v6 --insecure
fi
;;
3 )
readp "请复制阿里云Aliyun的Ali_Key：" ALKEY
export Ali_Key="$ALKEY"
readp "请复制阿里云Aliyun的Ali_Secret：" ALSER
export Ali_Secret="$ALSER"
if [[ $domainIP = $v4 ]]; then
bash /root/.acme.sh/acme.sh --issue --dns dns_ali -d ${ym} -k ec-256 --server letsencrypt --insecure
fi
if [[ $domainIP = $v6 ]]; then
bash /root/.acme.sh/acme.sh --issue --dns dns_ali -d ${ym} -k ec-256 --server letsencrypt --listen-v6 --insecure
fi
esac
installCA
checktls
}
wro(){
v4v6
if [[ -n $(echo $domainIP | grep nginx) ]]; then
yellow "当前域名解析到的IP：无"
red "域名解析无效，请检查域名是否填写正确或稍等几分钟等待解析完成再执行脚本" && rm -rf acme.sh && exit 
elif [[ -n $(echo $domainIP | grep ":") || -n $(echo $domainIP | grep ".") ]]; then
if [[ $domainIP != $v4 ]] && [[ $domainIP != $v6 ]]; then
yellow "当前域名解析到的IP：$domainIP"
red "当前域名解析的IP与当前VPS使用的IP不匹配"
green "建议如下："
yellow "1、请确保CDN小黄云关闭状态(仅限DNS)，其他域名解析网站设置同理"
yellow "2、请检查域名解析网站设置的IP是否正确"
rm -rf acme.sh && exit 
else
green "恭喜，域名解析正确，当前域名解析到的IP：$domainIP"
fi
fi
}

acme(){
yellow "稍等3秒，检测IP环境中"
wgcfv6=$(curl -s6m6 https://www.cloudflare.com/cdn-cgi/trace -k | grep warp | cut -d= -f2)
wgcfv4=$(curl -s4m6 https://www.cloudflare.com/cdn-cgi/trace -k | grep warp | cut -d= -f2)
if [[ ! $wgcfv4 =~ on|plus && ! $wgcfv6 =~ on|plus ]]; then
ab="1.选择standalone独立模式申请证书（仅需域名），安装过程中将强制释放80端口，相关http应用端口可能都将失效，请自行处理。\n2.选择DNS API模式申请证书（需域名、ID、Key），目前支持Cloudflare域名解析平台、腾讯域名解析平台、阿里域名解析平台\n0.返回上一层\n 请选择："
readp "$ab" cd
case "$cd" in 
1 ) acme1 && acme2 && acme3 && ACMEstandaloneDNS;;
2 ) acme1 && acme3 && ACMEDNS;;
0 ) start_menu;;
esac
else
yellow "检测到正在使用WARP接管VPS出站，现执行临时关闭"
systemctl stop wg-quick@wgcf >/dev/null 2>&1
green "WARP已临时闭关"
ab="1.选择standalone独立模式申请证书（仅需域名）,安装过程中将强制释放80端口，相关http应用端口可能都将失效，请自行处理。\n2.选择DNS API模式申请证书（需域名、ID、Key），目前支持Cloudflare域名解析平台、腾讯域名解析平台、阿里域名解析平台\n0.返回上一层\n 请选择："
readp "$ab" cd
case "$cd" in 
1 ) acme1 && acme2 && acme3 && ACMEstandaloneDNS;;
2 ) acme1 && acme3 && ACMEDNS;;
0 ) start_menu;;
esac
yellow "现恢复原先WARP接管VPS出站设置，现执行WARP开启"
systemctl start wg-quick@wgcf >/dev/null 2>&1
green "WARP已恢复开启"
fi
}
Certificate(){
[[ -z $(/root/.acme.sh/acme.sh -v 2>/dev/null) ]] && yellow "未安装acme.sh证书申请，无法执行" && rm -rf acme.sh && exit 
green "Main_Domainc下显示的域名就是已申请成功的域名证书，Renew下显示对应域名证书的自动续期时间点"
bash /root/.acme.sh/acme.sh --list
echo
readp "请输入要撤销并删除的域名证书（复制Main_Domain下显示的域名，退出请按Ctrl+c）:" ym
if [[ -n $(bash /root/.acme.sh/acme.sh --list | grep $ym) ]]; then
bash /root/.acme.sh/acme.sh --revoke -d ${ym} --ecc
bash /root/.acme.sh/acme.sh --remove -d ${ym} --ecc
rm -rf cert.crt private.key
green "撤销并删除${ym}域名证书成功"
else
red "未找到你输入的${ym}域名证书，请自行核实！" && exit
fi
}
acmerenew(){
[[ -z $(/root/.acme.sh/acme.sh -v 2>/dev/null) ]] && yellow "未安装acme.sh证书申请，无法执行" && rm -rf acme.sh && exit 
green "Main_Domainc下显示的域名就是已申请成功的域名证书，Renew下显示对应域名证书的自动续期时间点"
bash /root/.acme.sh/acme.sh --list
echo
ab="1.无脑一键续期所有证书（推荐）\n2.选择指定的域名证书续期\n0.返回上一层\n 请选择："
readp "$ab" cd
case "$cd" in 
1 ) 
bash /root/.acme.sh/acme.sh --cron -f
checktls
;;
2 ) 
readp "请输入要续期的域名证书（复制Main_Domain下显示的域名）:" ym
if [[ -n $(bash /root/.acme.sh/acme.sh --list | grep $ym) ]]; then
bash /root/.acme.sh/acme.sh --renew -d ${ym} --force --ecc
checktls
else
red "未找到你输入的${ym}域名证书，请自行核实！" && exit
fi
;;
0 ) start_menu;;
esac
}
uninstall(){
[[ -z $(/root/.acme.sh/acme.sh -v 2>/dev/null) ]] && yellow "未安装acme.sh证书申请，无法执行" && rm -rf acme.sh && exit 
curl https://get.acme.sh | sh
bash /root/.acme.sh/acme.sh --uninstall
rm -rf cert.crt private.key
rm -rf ~/.acme.sh acme.sh
sed -i '/--cron/d' /etc/crontab
[[ -z $(/root/.acme.sh/acme.sh -v 2>/dev/null) ]] && green "acme.sh卸载完毕" || red "acme.sh卸载失败"
}
start_menu(){
clear
yellow "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~" 
yellow " 提示："
yellow " 一、standalone模式仅支持单域名证书申请"
yellow " 二、DNS API模式不支持freenom免费域名申请，支持单域名与泛域名证书申请"
echo
green " 1. acme.sh申请letsencrypt ECC证书（支持standalone模式与DNS API模式） "
green " 2. 查询已申请成功的域名及自动续期时间点；撤销并删除当前已申请的域名证书 "
green " 3. 手动一键续期或指定续期的域名证书 "
green " 4. 卸载一键ACME证书申请脚本 "
green " 0. 退出 "
read -p "请输入数字:" NumberInput
case "$NumberInput" in     
1 ) acme;;
2 ) Certificate;;
3 ) acmerenew;;
4 ) uninstall;;
* ) rm -rf acme.sh && exit      
esac
}   
start_menu "first" 
