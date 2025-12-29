#!/bin/bash
red='\033[0;31m'
green='\033[0;32m'
yellow='\033[0;33m'
plain='\033[0m'
green() { echo -e "\033[32m\033[01m$1\033[0m"; }
blue() { echo -e "\033[36m\033[01m$1\033[0m"; }
yellow() { echo -e "\033[33m\033[01m$1\033[0m"; }
# check root
function LOGD() {
    echo -e "${yellow}[DEG] $* ${plain}"
}

function LOGE() {
    echo -e "${red}[ERR] $* ${plain}"
}

function LOGI() {
    echo -e "${green}[INF] $* ${plain}"
}

[[ $EUID -ne 0 ]] && echo -e "${red}错误: ${plain}  必须使用root用户运行此脚本！\n" && exit 1

# check os
if [[ -f /etc/redhat-release ]]; then
    release="centos"
elif cat /etc/issue | grep -Eqi "debian"; then
    release="debian"
elif cat /etc/issue | grep -Eqi "ubuntu"; then
    release="ubuntu"
elif cat /etc/issue | grep -Eqi "centos|red hat|redhat"; then
    release="centos"
elif cat /proc/version | grep -Eqi "debian"; then
    release="debian"
elif cat /proc/version | grep -Eqi "ubuntu"; then
    release="ubuntu"
elif cat /proc/version | grep -Eqi "centos|red hat|redhat"; then
    release="centos"
elif cat /etc/system-release-cpe | grep -Eqi "amazon_linux"; then
    release="amazon_linux"
else
    echo -e "${red}未检测到系统版本，请联系脚本作者！${plain}\n" && exit 1
fi

os_version=""

# os version
if [[ -f /etc/os-release ]]; then
    os_version=$(awk -F'[= ."]' '/VERSION_ID/{print $3}' /etc/os-release)
fi
if [[ -z "$os_version" && -f /etc/lsb-release ]]; then
    os_version=$(awk -F'[= ."]+' '/DISTRIB_RELEASE/{print $2}' /etc/lsb-release)
fi

if [[ x"${release}" == x"centos" ]]; then
    if [[ ${os_version} -le 6 ]]; then
        echo -e "${red}请使用 CentOS 7 或更高版本的系统！${plain}\n" && exit 1
    fi
elif [[ x"${release}" == x"ubuntu" ]]; then
    if [[ ${os_version} -lt 16 ]]; then
        echo -e "${red}请使用 Ubuntu 16 或更高版本的系统！${plain}\n" && exit 1
    fi
elif [[ x"${release}" == x"debian" ]]; then
    if [[ ${os_version} -lt 8 ]]; then
        echo -e "${red}请使用 Debian 8 或更高版本的系统！${plain}\n" && exit 1
    fi
elif [[ x"${release}" == x"amazon_linux" ]]; then
    if [[ ${os_version} -lt 2 ]]; then
        echo -e "${red}请使用 Amazon Linux 2 或更高版本的系统！${plain}\n" && exit 1
    fi
fi

xrayui() {
    cat >/root/xrayuil.sh <<-\EOF
#!/bin/bash
xui=`ps -aux |grep "xray-ui" |grep -v "grep" |wc -l`
xray=`ps -aux |grep "xray-linux" |grep -v "grep" |wc -l`
sleep 1
if [ $xui = 0 ];then
xray-ui restart
fi
if [ $xray = 0 ];then
xray-ui restart
fi
EOF
    chmod +x /root/xrayuil.sh
    sed -i '/xrayuil.sh/d' /etc/crontab >/dev/null 2>&1
    echo "*/1 * * * * root bash /root/xrayuil.sh >/dev/null 2>&1" >>/etc/crontab
}

confirm() {
    if [[ $# > 1 ]]; then
        echo && read -p "$1 [默认$2]: " temp
        if [[ x"${temp}" == x"" ]]; then
            temp=$2
        fi
    else
        read -p "$1 [y/n]: " temp
    fi
    if [[ x"${temp}" == x"y" || x"${temp}" == x"Y" ]]; then
        return 0
    else
        return 1
    fi
}

confirm_restart() {
    confirm "是否重启面板，重启面板也会重启 xray" "y"
    if [[ $? == 0 ]]; then
        restart
    else
        show_menu
    fi
}

before_show_menu() {
    echo && echo -n -e "${yellow}按回车返回主菜单: ${plain}" && read temp
    show_menu
}

install() {
    wget -N https://raw.githubusercontent.com/qist/xray-ui/main/install.sh && bash install.sh
    if [[ $? == 0 ]]; then
        if [[ $# == 0 ]]; then
            start
        else
            start 0
        fi
    fi
}

arch() {
    case "$(uname -m)" in
    x86_64 | x64 | amd64) echo 'amd64' ;;
    i*86 | x86) echo '386' ;;
    armv8* | armv8 | arm64 | aarch64) echo 'arm64' ;;
    armv7* | armv7 | arm) echo 'armv7' ;;
    armv6* | armv6) echo 'armv6' ;;
    armv5* | armv5) echo 'armv5' ;;
    s390x) echo 's390x' ;;
    *) echo -e "${green}Unsupported CPU architecture! ${plain}" && rm -f install.sh && exit 1 ;;
    esac
}

echo "arch: $(arch)"

update() {
    confirm "本功能会强制重装当前最新版，数据不会丢失，是否继续?" "n"
    if [[ $? != 0 ]]; then
        echo -e "${red}已取消${plain}"
        if [[ $# == 0 ]]; then
            before_show_menu
        fi
        return 0
    fi
    if [[ x"${release}" == x"centos" ]]; then
        setenforce 0 >/dev/null 2>&1
    fi
    systemctl stop xray-ui
    curl -sS -H "Accept: application/vnd.github.v3+json" -o "/tmp/tmp_file" 'https://api.github.com/repos/qist/xray-ui/releases/latest'
    releases_version=($(sed 'y/,/\n/' "/tmp/tmp_file" | grep 'tag_name' | awk -F '"' '{print $4}'))
    rm /tmp/tmp_file -f
    mkdir -p /tmp/xray
    cd /tmp/xray
    if [ $# == 0 ]; then
        wget --no-check-certificate -O /tmp/xray/xray-ui-linux-$(arch).tar.gz https://github.com/qist/xray-ui/releases/download/${releases_version}/xray-ui-linux-$(arch).tar.gz
        if [[ $? -ne 0 ]]; then
            echo -e "${red}下载 xray-ui 失败，请确保你的服务器能够下载 Github 的文件${plain}"
            rm -f install.sh
            exit 1
        fi
    else
        last_version=$1
        url="https://github.com/qist/xray-ui/releases/download/${releases_version}/xray-ui-linux-$(arch).tar.gz"
        echo -e "开始安装 xray-ui v$1"
        wget --no-check-certificate -O /tmp/xray/xray-ui-linux-$(arch).tar.gz ${url}
        if [[ $? -ne 0 ]]; then
            echo -e "${red}下载 xray-ui v$1 失败，请确保此版本存在${plain}"
            rm -f install.sh
            exit 1
        fi
    fi
    if [[ -e /usr/local/xray-ui/xray-ui ]]; then
        rm /usr/local/xray-ui/xray-ui -f
        rm /usr/local/xray-ui/xray-ui.service -f
    fi
    tar zxvf xray-ui-linux-$(arch).tar.gz
    mv /tmp/xray/xray-ui/{xray-ui,xray-ui.service} /usr/local/xray-ui/
    rm /tmp/xray -rf
    cd /usr/local/xray-ui
    if [[ $(arch) == "armv5" || $(arch) == "armv6" || $(arch) == "armv7" ]]; then
        mv bin/xray-linux-$(arch) bin/xray-linux-arm
        chmod +x bin/xray-linux-arm
    fi
    chmod +x xray-ui bin/xray-linux-$(arch)
    \cp -f xray-ui.service /etc/systemd/system/
    wget --no-check-certificate -O /usr/bin/xray-ui https://raw.githubusercontent.com/qist/xray-ui/main/xray-ui.sh
    chmod +x /usr/bin/xray-ui
    #chmod +x /usr/local/xray-ui/xray-ui.sh
    systemctl daemon-reload
    systemctl enable xray-ui
    systemctl start xray-ui
    xray-ui restart
    echo -e "${green}更新完成，已自动重启面板${plain}"
    acp=$(/usr/local/xray-ui/xray-ui setting -show 2>/dev/null)
    green "$acp"
    exit 0
}

uninstall() {
    confirm "确定要卸载面板吗，xray 也会卸载?" "n"
    if [[ $? != 0 ]]; then
        if [[ $# == 0 ]]; then
            show_menu
        fi
        return 0
    fi
    systemctl stop xray-ui
    systemctl disable xray-ui
    rm /etc/systemd/system/xray-ui.service -f
    systemctl daemon-reload
    systemctl reset-failed
    rm /etc/xray-ui/ -rf
    rm /usr/local/xray-ui/ -rf
    rm -f /root/xrayuil.sh
    sed -i '/xrayuil.sh/d' /etc/crontab >/dev/null 2>&1
    sed -i '/xray-ui restart/d' /etc/crontab >/dev/null 2>&1
    sed -i '/xray-ui geoip/d' /etc/crontab >/dev/null 2>&1
    rm /usr/bin/xray-ui -f
    green "xray-ui已卸载成功，后会有期！"
}

reset_user() {
    confirm "确定要将用户名和密码重置为随机6位字符吗" "n"
    if [[ $? != 0 ]]; then
        if [[ $# == 0 ]]; then
            show_menu
        fi
        return 0
    fi
    uauto=$(date +%s%N | md5sum | cut -c 1-6)
    username=$uauto
    pauto=$(date +%s%N | md5sum | cut -c 1-6)
    password=$pauto
    /usr/local/xray-ui/xray-ui setting -username ${username} -password ${password} >/dev/null 2>&1
    green "xray-ui登录用户名：${username}"
    green "xray-ui登录密码：${password}"
    confirm_restart
}

generate_random_string() {
    local n=$1
    # 定义数字、大写字母和小写字母的集合
    local characters='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

    # 生成随机字符并限制在指定字符集中
    # 从 /dev/urandom 生成随机字节，使用 tr 进行过滤
    local random_string=$(cat /dev/urandom | tr -dc "$characters" | fold -w "$n" | head -n 1)

    echo "$random_string"
}


reset_path() {
    confirm "确定要将访问路径随机10位字符吗" "n"
    if [[ $? != 0 ]]; then
        if [[ $# == 0 ]]; then
            show_menu
        fi
        return 0
    fi
    path_random=$(generate_random_string 10)
    /usr/local/xray-ui/xray-ui setting -webBasePath ${path_random} >/dev/null 2>&1
    green "xray-ui路径：${path_random}"
    confirm_restart
}

reset_cert() {
    confirm "确定要重新设置证书吗" "n"
    if [[ $? != 0 ]]; then
        if [[ $# == 0 ]]; then
            show_menu
        fi
        return 0
    fi
    LOGD "请输入证书路径:"
    read -p "输入您的证书路径:" Xray_cert
    LOGD "证书路径为:${Xray_cert}"
    LOGD "请输入密钥路径:"
    read -p "输入您的密钥路径:" Xray_Key
    LOGD "您的密钥是:${Xray_Key}"
    /usr/local/xray-ui/xray-ui cert -webCert "${Xray_cert}" -webCertKey "${Xray_Key}"
    confirm_restart
}

reset_mTLS() {
    confirm "确定要重新设置证书吗" "n"
    if [[ $? != 0 ]]; then
        if [[ $# == 0 ]]; then
            show_menu
        fi
        return 0
    fi
    LOGD "请输入证书路径:"
    read -p "输入您的证书路径:" Xray_cert
    LOGD "证书路径为:${Xray_cert}"
    LOGD "请输入密钥路径:"
    read -p "输入您的密钥路径:" Xray_Key
    LOGD "您的密钥是:${Xray_Key}"
    LOGD "请输入CA路径:"
    read -p "输入您的CA路径:" Xray_Ca
    LOGD "您的CA是:${Xray_Ca}"
    /usr/local/xray-ui/xray-ui cert -webCert "${Xray_cert}" -webCertKey "${Xray_Key}" -webCa "${Xray_Ca}"
    confirm_restart
}

reset_config() {
    confirm "确定要重置所有面板设置吗，账号数据不会丢失，用户名和密码不会改变" "n"
    if [[ $? != 0 ]]; then
        if [[ $# == 0 ]]; then
            show_menu
        fi
        return 0
    fi
    /usr/local/xray-ui/xray-ui setting -reset
    echo -e "所有面板设置已重置为默认值，现在请重启面板，并使用默认的 ${green}54321${plain} 端口访问面板"
    confirm_restart
}

check_config() {
    info=$(/usr/local/xray-ui/xray-ui setting -show true)
    if [[ $? != 0 ]]; then
        echo -e "get current settings error,please check logs"
        show_menu
    fi
    green "${info}"
}

set_port() {
    echo && echo -n -e "输入端口号[1-65535]: " && read port
    if [[ -z "${port}" ]]; then
        echo -e "${yellow}已取消${plain}"
        before_show_menu
    else
        until [[ -z $(ss -ntlp | awk '{print $4}' | grep -w "$port") ]]; do
            [[ -n $(ss -ntlp | awk '{print $4}' | grep -w "$port") ]] && yellow "\n端口被占用，请重新输入端口" && readp "自定义xray-ui端口:" port
        done
        /usr/local/xray-ui/xray-ui setting -port ${port} >/dev/null 2>&1
        echo -e "设置端口完毕，现在请重启面板，并使用新设置的端口 ${green}${port}${plain} 访问面板"
        confirm_restart
    fi
}

start() {
    check_status
    if [[ $? == 0 ]]; then
        echo ""
        echo -e "${green}面板已运行，无需再次启动，如需重启请选择重启${plain}"
    else
        systemctl start xray-ui
        xrayui
        sleep 2
        check_status
        if [[ $? == 0 ]]; then
            echo -e "${green}xray-ui 启动成功${plain}"
        else
            echo -e "${red}面板启动失败，可能是因为启动时间超过了两秒，请稍后查看日志信息${plain}"
        fi
    fi

    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

stop() {
    check_status
    if [[ $? == 1 ]]; then
        echo ""
        echo -e "${green}面板已停止，无需再次停止${plain}"
    else
        systemctl stop xray-ui
        rm -f /root/xrayuil.sh
        sed -i '/xrayuil.sh/d' /etc/crontab >/dev/null 2>&1
        sleep 2
        check_status
        if [[ $? == 1 ]]; then
            echo -e "${green}xray-ui 与 xray 停止成功${plain}"
        else
            echo -e "${red}面板停止失败，停止xray-ui守护进程中……请稍在一分钟后再查看，请稍后查看日志信息${plain}"
        fi
    fi

    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

restart() {
    systemctl restart xray-ui
    xrayui
    sleep 2
    check_status
    if [[ $? == 0 ]]; then
        echo -e "${green}xray-ui 与 xray 重启成功${plain}"
    else
        echo -e "${red}面板重启失败，可能是因为启动时间超过了两秒，请稍后查看日志信息${plain}"
    fi
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

status() {
    systemctl status xray-ui -l
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

enable() {
    systemctl enable xray-ui
    if [[ $? == 0 ]]; then
        echo -e "${green}xray-ui 设置开机自启成功${plain}"
    else
        echo -e "${red}xray-ui 设置开机自启失败${plain}"
    fi

    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

disable() {
    systemctl disable xray-ui
    if [[ $? == 0 ]]; then
        echo -e "${green}xray-ui 取消开机自启成功${plain}"
    else
        echo -e "${red}xray-ui 取消开机自启失败${plain}"
    fi

    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

show_log() {
    journalctl -u xray-ui.service -e --no-pager -f
    if [[ $# == 0 ]]; then
        before_show_menu
    fi
}

migrate_v2_ui() {
    /usr/local/xray-ui/xray-ui v2-ui

    before_show_menu
}

x25519() {
    arch=$(arch)
    if [[ $arch == "x86_64" || $arch == "x64" || $arch == "amd64" ]]; then
        arch="amd64"
    elif [[ $arch == "aarch64" || $arch == "arm64" ]]; then
        arch="arm64"
    elif [[ $arch == "s390x" ]]; then
        arch="s390x"
    else
        arch="amd64"
    fi
    /usr/local/xray-ui/bin/xray-linux-$(arch) x25519
    echo ""
    exit 0
}

geoip() {
    pushd /usr/local/xray-ui
    ./xray-ui geoip
    echo "重启重新加载更新文件"
    systemctl restart xray-ui
    echo ""
    exit 0
}

crontab() {
    sed -i '/xray-ui geoip/d' /etc/crontab
    echo "30 1 * * * root xray-ui geoip >/dev/null 2>&1" >>/etc/crontab
    echo -e ""
    blue "添加定时更新geoip到计划任务,默认每天凌晨1.30执行"
    exit 0
}

update_shell() {
    wget --no-check-certificate -O /usr/bin/xray-ui https://raw.githubusercontent.com/qist/xray-ui/main/xray-ui.sh
    if [[ $? != 0 ]]; then
        echo ""
        echo -e "${red}下载脚本失败，请检查本机能否连接 Github${plain}"
        before_show_menu
    else
        chmod +x /usr/bin/xray-ui
        echo -e "${green}升级脚本成功，请重新运行脚本${plain}" && exit 0
    fi
}

# 0: running, 1: not running, 2: not installed
check_status() {
    if [[ ! -f /etc/systemd/system/xray-ui.service ]]; then
        return 2
    fi
    temp=$(systemctl status xray-ui | grep Active | awk '{print $3}' | cut -d "(" -f2 | cut -d ")" -f1)
    if [[ x"${temp}" == x"running" ]]; then
        return 0
    else
        return 1
    fi
}

check_enabled() {
    temp=$(systemctl is-enabled xray-ui)
    if [[ x"${temp}" == x"enabled" ]]; then
        return 0
    else
        return 1
    fi
}

check_uninstall() {
    check_status
    if [[ $? != 2 ]]; then
        echo ""
        echo -e "${red}面板已安装，请不要重复安装${plain}"
        if [[ $# == 0 ]]; then
            before_show_menu
        fi
        return 1
    else
        return 0
    fi
}

check_install() {
    check_status
    if [[ $? == 2 ]]; then
        echo ""
        echo -e "${red}请先安装面板${plain}"
        if [[ $# == 0 ]]; then
            before_show_menu
        fi
        return 1
    else
        return 0
    fi
}

show_status() {
    check_status
    case $? in
    0)
        echo -e "xray-ui面板状态: ${green}已运行${plain}"
        show_enable_status
        ;;
    1)
        echo -e "xray-ui面板状态: ${yellow}未运行${plain}"
        show_enable_status
        ;;
    2)
        echo -e "xray-ui面板状态: ${red}未安装${plain}"
        ;;
    esac
    show_xray_status
}

show_enable_status() {
    check_enabled
    if [[ $? == 0 ]]; then
        echo -e "是否开机自启: ${green}是${plain}"
    else
        echo -e "是否开机自启: ${red}否${plain}"
    fi
}

check_xray_status() {
    count=$(ps -ef | grep "xray-linux" | grep -v "grep" | wc -l)
    if [[ count -ne 0 ]]; then
        return 0
    else
        return 1
    fi
}

show_xray_status() {
    check_xray_status
    if [[ $? == 0 ]]; then
        echo -e "xray 状态: ${green}运行${plain}"
    else
        echo -e "xray 状态: ${red}未运行${plain}"
    fi
}


install_acme() {
    cd ~
    LOGI "正在安装 acme..."
    curl https://get.acme.sh | sh
    if [ $? -ne 0 ]; then
        LOGE "acme 安装失败"
        return 1
    else
        LOGI "acme 安装成功"
    fi
    return 0
}

ssl_cert_issue_main() {
    echo -e "${green}\t1.${plain} 获取 SSL"
    echo -e "${green}\t2.${plain} 获取 IP SSL"
    echo -e "${green}\t3.${plain} 撤销证书"
    echo -e "${green}\t4.${plain} 强制续期"
    echo -e "${green}\t0.${plain} 返回主菜单"
    read -p "请选择一个选项: " choice
    case "$choice" in
    0)
        show_menu
        ;;
    1)
        ssl_cert_issue
        ;;
    2)
        ssl_cert_issue_ip
        ;;

    3)
        local domain=""
        read -p "请输入要撤销证书的域名: " domain
        ~/.acme.sh/acme.sh --revoke -d ${domain}
        LOGI "证书已撤销"
        ;;
    4)
        local domain=""
        read -p "请输入要强制续期的域名: " domain
        ~/.acme.sh/acme.sh --renew -d ${domain} --force
        ;;
    *) echo "无效选项" ;;
    esac
}

ssl_cert_issue() {
    # 首先检查是否安装了 acme.sh
    if ! command -v ~/.acme.sh/acme.sh &>/dev/null; then
        echo "未找到 acme.sh，将进行安装"
        install_acme
        if [ $? -ne 0 ]; then
            LOGE "acme 安装失败，请检查日志"
            exit 1
        fi
    fi
    # 安装 socat
    case "${release}" in
    ubuntu | debian | armbian)
        apt update && apt install socat -y
        ;;
    centos | almalinux | rocky | oracle)
        yum -y update && yum -y install socat
        ;;
    fedora)
        dnf -y update && dnf -y install socat
        ;;
    arch | manjaro | parch)
        pacman -Sy --noconfirm socat
        ;;
    *)
        echo -e "${red}不支持的操作系统，请手动安装必要的软件包${plain}\n"
        exit 1
        ;;
    esac
    if [ $? -ne 0 ]; then
        LOGE "socat 安装失败，请检查日志"
        exit 1
    else
        LOGI "socat 安装成功..."
    fi

    # 获取域名并验证
    local domain=""
    read -p "请输入您的域名:" domain
    LOGD "您的域名是:${domain}，正在检查..."
    # 判断是否已经存在证书
    local currentCert=$(~/.acme.sh/acme.sh --list | tail -1 | awk '{print $1}')

    if [ ${currentCert} == ${domain} ]; then
        local certInfo=$(~/.acme.sh/acme.sh --list)
        LOGE "系统中已存在该域名的证书，不能重复签发，当前证书详情:"
        LOGI "$certInfo"
        exit 1
    else
        LOGI "您的域名可以进行证书签发..."
    fi

    # 创建存放证书的目录
    certPath="/root/cert/${domain}"
    if [ ! -d "$certPath" ]; then
        mkdir -p "$certPath"
    else
        rm -rf "$certPath"
        mkdir -p "$certPath"
    fi

    # 获取需要使用的端口
    local WebPort=80
    read -p "请选择使用的端口，默认为80端口:" WebPort
    if [[ ${WebPort} -gt 65535 || ${WebPort} -lt 1 ]]; then
        LOGE "输入的端口号无效，将使用默认端口"
    fi
    LOGI "将使用端口:${WebPort} 进行证书签发，请确保此端口已开放..."
    # 用户需手动处理开放端口及结束占用进程
    ~/.acme.sh/acme.sh --set-default-ca --server letsencrypt
    ~/.acme.sh/acme.sh --issue -d ${domain} --listen-v6 --standalone --httpport ${WebPort}
    if [ $? -ne 0 ]; then
        LOGE "证书签发失败，请检查日志"
        rm -rf ~/.acme.sh/${domain}
        exit 1
    else
        LOGE "证书签发成功，正在安装证书..."
    fi
    # 安装证书
    ~/.acme.sh/acme.sh --installcert -d ${domain} \
        --ca-file /root/cert/ca.cer \
        --cert-file /root/cert/${domain}.cer \
        --key-file /root/cert/${domain}/privkey.pem \
        --fullchain-file /root/cert/${domain}/fullchain.pem

    if [ $? -ne 0 ]; then
        LOGE "证书安装失败，退出"
        rm -rf ~/.acme.sh/${domain}
        exit 1
    else
        LOGI "证书安装成功，开启自动续期..."
        confirm "是否自动应用ssl?[y/n]" "y"
        if [ $? -eq 0 ]; then
           /usr/local/xray-ui/xray-ui cert -webCert "/root/cert/${domain}/fullchain.pem" -webCertKey "/root/cert/${domain}/privkey.pem"
           confirm_restart
        else
          LOGE "手动重置ssl"
          LOGE "xray-ui 选择22 重置ssl证书"
        fi
    fi

    ~/.acme.sh/acme.sh --upgrade --auto-upgrade
    if [ $? -ne 0 ]; then
        LOGE "自动续期失败，证书详情如下:"
        ls -lah $certPath/*
        chmod 755 $certPath/*
        exit 1
    else
        LOGI "自动续期成功，证书详情如下:"
        ls -lah $certPath/*
        chmod 755 $certPath/*
    fi
}
 
ssl_cert_issue_ip() {

    # ========== acme.sh ==========
    if ! command -v ~/.acme.sh/acme.sh &>/dev/null; then
        LOGI "未检测到 acme.sh，开始安装..."
        install_acme || { LOGE "acme.sh 安装失败"; exit 1; }
    fi

    # ========== socat ==========
    case "${release}" in
        ubuntu|debian|armbian)
            apt update && apt install -y socat
            ;;
        centos|almalinux|rocky|oracle)
            yum -y install socat
            ;;
        fedora)
            dnf -y install socat
            ;;
        arch|manjaro|parch)
            pacman -Sy --noconfirm socat
            ;;
        *)
            LOGE "不支持的系统，请手动安装 socat"
            exit 1
            ;;
    esac || { LOGE "socat 安装失败"; exit 1; }

    LOGI "socat 已就绪"

    # ========== 获取 IP ==========
    local Ip=""
    local v4=""
    local v6=""

    read -p "请输入 IP（直接回车自动获取）: " Ip

    if [[ -z "${Ip}" ]]; then
        LOGI "自动获取公网 IP..."

        v4=$(curl -s4m8 http://ip.sb -k)
        v6=$(curl -s6m8 http://ip.sb -k)

        if [[ -n "${v4}" ]]; then
            Ip="${v4}"
            LOGI "使用 IPv4：${Ip}"
        elif [[ -n "${v6}" ]]; then
            Ip="${v6}"
            LOGI "未检测到 IPv4，使用 IPv6：${Ip}"
        else
            LOGE "无法获取公网 IP"
            exit 1
        fi
    else
        LOGI "使用用户输入 IP：${Ip}"
    fi

    # ========== IP 校验 ==========
    if ! [[ "${Ip}" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ || "${Ip}" =~ : ]]; then
        LOGE "IP 格式不合法：${Ip}"
        exit 1
    fi

    # ========== 检查是否已有证书 ==========
    if ~/.acme.sh/acme.sh --list | awk '{print $1}' | grep -qw "${Ip}"; then
        LOGE "该 IP 已存在证书，无法重复签发"
        ~/.acme.sh/acme.sh --list | grep "${Ip}"
        exit 1
    fi

    # ========== 证书目录 ==========
    local certPath="/root/cert/${Ip}"
    rm -rf "${certPath}"
    mkdir -p "${certPath}"

    # ========== 端口选择 ==========
    local WebPort=80

    if [[ "${Ip}" =~ : ]]; then
        WebPort=80
        LOGI "IPv6 校验强制使用 80 端口"
    else
        read -p "请选择端口（默认 80）: " WebPort
        [[ -z "${WebPort}" ]] && WebPort=80

        if [[ "${WebPort}" -lt 1 || "${WebPort}" -gt 65535 ]]; then
            LOGE "端口无效，使用 80"
            WebPort=80
        fi
    fi

    LOGI "使用端口 ${WebPort} 进行 HTTP-01 校验"

    # ========== 签发 ==========
    ~/.acme.sh/acme.sh --set-default-ca --server letsencrypt

    ~/.acme.sh/acme.sh \
        --issue \
        --server letsencrypt \
        -d "${Ip}" \
        --certificate-profile shortlived \
        --standalone \
        --httpport "${WebPort}" \
        --force || {
            LOGE "证书签发失败"
            rm -rf ~/.acme.sh/"${Ip}"
            exit 1
        }

    LOGI "证书签发成功"

    # ========== 安装 ==========
    ~/.acme.sh/acme.sh --installcert -d "${Ip}" \
        --ecc \
        --ca-file /root/cert/ca.cer \
        --cert-file /root/cert/"${Ip}".cer \
        --key-file "${certPath}/privkey.pem" \
        --fullchain-file "${certPath}/fullchain.pem" || {
            LOGE "证书安装失败"
            exit 1
        }

    LOGI "证书安装完成"

    # ========== 应用到 xray-ui ==========
    confirm "是否自动应用 SSL 到 xray-ui？[y/n]" "y"
    if [ $? -eq 0 ]; then
        /usr/local/xray-ui/xray-ui cert \
            -webCert "${certPath}/fullchain.pem" \
            -webCertKey "${certPath}/privkey.pem"
        confirm_restart
    else
        LOGI "请在 xray-ui 中手动重置 SSL（选项 22）"
    fi

    # ========== 自动续期 ==========
    ~/.acme.sh/acme.sh --upgrade --auto-upgrade

    LOGI "证书文件："
    ls -lah "${certPath}"
    chmod 755 "${certPath}"/*
}


ssl_cert_issue_CF() {
    echo -E ""
    LOGD "******使用说明******"
    LOGI "此 Acme 脚本需要以下信息:"
    LOGI "1. Cloudflare 注册的电子邮件"
    LOGI "2. Cloudflare 全局 API 密钥"
    LOGI "3. 已解析 DNS 至当前服务器的域名"
    LOGI "4. 证书申请后默认安装路径为 /root/cert "
    confirm "确认信息?[y/n]" "y"
    if [ $? -eq 0 ]; then
        # 首先检查是否安装了 acme.sh
        if ! command -v ~/.acme.sh/acme.sh &>/dev/null; then
            echo "未找到 acme.sh，将进行安装"
            install_acme
            if [ $? -ne 0 ]; then
                LOGE "acme 安装失败，请检查日志"
                exit 1
            fi
        fi
        CF_Domain=""
        CF_GlobalKey=""
        CF_AccountEmail=""
        certPath=/root/cert
        if [ ! -d "$certPath" ]; then
            mkdir $certPath
        else
            rm -rf $certPath
            mkdir $certPath
        fi
        LOGD "请输入域名:"
        read -p "输入您的域名:" CF_Domain
        LOGD "域名设置为:${CF_Domain}"
        LOGD "请输入 API 密钥:"
        read -p "输入您的密钥:" CF_GlobalKey
        LOGD "您的 API 密钥是:${CF_GlobalKey}"
        LOGD "请输入注册邮箱:"
        read -p "输入您的邮箱:" CF_AccountEmail
        LOGD "您的注册邮箱是:${CF_AccountEmail}"
        ~/.acme.sh/acme.sh --set-default-ca --server letsencrypt
        if [ $? -ne 0 ]; then
            LOGE "默认 CA 设置为 Lets'Encrypt 失败，脚本退出..."
            exit 1
        fi
        export CF_Key="${CF_GlobalKey}"
        export CF_Email=${CF_AccountEmail}
        ~/.acme.sh/acme.sh --issue --dns dns_cf -d ${CF_Domain} -d *.${CF_Domain} --log
        if [ $? -ne 0 ]; then
            LOGE "证书签发失败，脚本退出..."
            exit 1
        else
            LOGI "证书签发成功，正在安装..."
        fi
        ~/.acme.sh/acme.sh --installcert -d ${CF_Domain} -d *.${CF_Domain} --ca-file /root/cert/ca.cer \
            --cert-file /root/cert/${CF_Domain}.cer --key-file /root/cert/${CF_Domain}.key \
            --fullchain-file /root/cert/fullchain.cer
        if [ $? -ne 0 ]; then
            LOGE "证书安装失败，脚本退出..."
            exit 1
        else
            LOGI "证书安装成功，开启自动更新..."
            confirm "是否自动应用ssl?[y/n]" "y"
            if [ $? -eq 0 ]; then
               /usr/local/xray-ui/xray-ui cert -webCert "/root/cert/fullchain.cer" -webCertKey "/root/cert/${CF_Domain}.key"
               confirm_restart
            else
              LOGE "手动重置ssl"
              LOGE "xray-ui  选择22 重置ssl证书"
           fi
        fi
        ~/.acme.sh/acme.sh --upgrade --auto-upgrade
        if [ $? -ne 0 ]; then
            LOGE "自动更新设置失败，脚本退出..."
            ls -lah $certPath
            chmod 755 $certPath
            exit 1
        else
            LOGI "证书已安装并开启自动更新，具体信息如下:"
            ls -lah $certPath
            chmod 755 $certPath
        fi
    else
        show_menu
    fi
}

show_usage() {
    echo "xray-ui 管理脚本使用方法: "
    echo "------------------------------------------"
    echo "xray-ui              - 显示管理菜单"
    echo "xray-ui start        - 启动 xray-ui 面板"
    echo "xray-ui stop         - 停止 xray-ui 面板"
    echo "xray-ui restart      - 重启 xray-ui 面板"
    echo "xray-ui status       - 查看 xray-ui 状态"
    echo "xray-ui enable       - 设置 xray-ui 开机自启"
    echo "xray-ui disable      - 取消 xray-ui 开机自启"
    echo "xray-ui log          - 查看 xray-ui 日志"
    echo "xray-ui v2-ui        - 迁移本机器的 v2-ui 账号数据至 xray-ui"
    echo "xray-ui update       - 更新 xray-ui 面板"
    echo "xray-ui geoip        - 更新 geoip ip库"
    echo "xray-ui update_shell - 更新 xray-ui 脚本"
    echo "xray-ui install      - 安装 xray-ui 面板"
    echo "xray-ui x25519       - REALITY  key 生成"
    echo "xray-ui ssl_main     - SSL 证书管理"
    echo "xray-ui ip_ssl_main  - ip SSL 证书安装"
    echo "xray-ui ssl_CF       - Cloudflare SSL 证书"
    echo "xray-ui crontab      - 添加geoip到任务计划每天凌晨1.30执行"
    echo "xray-ui uninstall    - 卸载 xray-ui 面板"
    echo "------------------------------------------"
}

show_menu() {
    echo -e "
  ${green}xray-ui 面板管理脚本${plain}
  ${green}0.${plain} 退出脚本
————————————————
  ${green}1.${plain} 安装 xray-ui
  ${green}2.${plain} 更新 xray-ui
  ${green}3.${plain} 卸载 xray-ui
————————————————
  ${green}4.${plain} 重置用户名密码
  ${green}5.${plain} 重置面板设置
  ${green}6.${plain} 设置面板端口
  ${green}7.${plain} 当前面板设置
————————————————
  ${green}8.${plain} 启动 xray-ui
  ${green}9.${plain} 停止 xray-ui
  ${green}10.${plain} 重启 xray-ui
  ${green}11.${plain} 查看 xray-ui 状态
  ${green}12.${plain} 查看 xray-ui 日志
————————————————
  ${green}13.${plain} 设置 xray-ui 开机自启
  ${green}14.${plain} 取消 xray-ui 开机自启
————————————————
  ${green}15.${plain} xray REALITY x25519 生成 
  ${green}16.${plain} 更新 xray-ui 脚本
  ${green}17.${plain} 更新 geoip ip库
  ${green}18.${plain} 添加geoip到任务计划
  ${green}19.${plain} SSL 证书管理
  ${green}20.${plain} Cloudflare SSL 证书
  ${green}21.${plain} 重置web 路径
  ${green}22.${plain} 重置ssl证书
  ${green}23.${plain} 重置mTLS证书
 "
    show_status
    echo "------------------------------------------"
    acp=$(/usr/local/xray-ui/xray-ui setting -show 2>/dev/null)
    green "$acp"
    tlsx=$(/usr/local/xray-ui/xray-ui setting -show 2>&1 | grep 证书文件)
    if [ -z "${tlsx}" ]; then
    yellow "当前面板http只支持127.0.0.1访问如果外面访问请用ssh转发或者nginx代理或者xray-ui 配置证书 选择22配置证书 xray-ui ip_ssl_main"
    fi
    echo "------------------------------------------"
    uiV=$(/usr/local/xray-ui/xray-ui -v)
    curl -sS -H "Accept: application/vnd.github.v3+json" -o "/tmp/tmp_file" 'https://api.github.com/repos/qist/xray-ui/releases/latest'
    remoteV=($(sed 'y/,/\n/' "/tmp/tmp_file" | grep 'tag_name' | awk -F '"' '{print $4}'))
    rm /tmp/tmp_file -f
    localV=${uiV}
    if [ "${localV}" = "${remoteV}" ]; then
        green "已安装最新版本：${uiV} ，如有更新，此处会自动提示"
    else
        green "当前安装的版本：${uiV}"
        yellow "检测到最新版本：${remoteV} ，可选择2进行更新！"
    fi

    echo && read -p "请输入选择 [0-23]: " num

    case "${num}" in
    0)
        exit 0
        ;;
    1)
        check_uninstall && install
        ;;
    2)
        check_install && update
        ;;
    3)
        check_install && uninstall
        ;;
    4)
        check_install && reset_user
        ;;
    5)
        check_install && reset_config
        ;;
    6)
        check_install && set_port
        ;;
    7)
        check_install && check_config
        ;;
    8)
        check_install && start
        ;;
    9)
        check_install && stop
        ;;
    10)
        check_install && restart
        ;;
    11)
        check_install && status
        ;;
    12)
        check_install && show_log
        ;;
    13)
        check_install && enable
        ;;
    14)
        check_install && disable
        ;;
    15)
        x25519
        ;;
    16)
        update_shell
        ;;
    17)
        geoip
        ;;
    18)
        crontab
        ;;
    19)
        ssl_cert_issue_main
        ;;
    20)
        ssl_cert_issue_CF
        ;;
    21)
        check_install && reset_path
        ;;
    22)
        check_install && reset_cert
        ;;
    23)
        check_install && reset_mTLS
        ;;
    *)
        echo -e "${red}请输入正确的数字 [0-23]${plain}"
        ;;
    esac
}

if [[ $# > 0 ]]; then
    case $1 in
    "start")
        check_install 0 && start 0
        ;;
    "stop")
        check_install 0 && stop 0
        ;;
    "restart")
        check_install 0 && restart 0
        ;;
    "status")
        check_install 0 && status 0
        ;;
    "enable")
        check_install 0 && enable 0
        ;;
    "disable")
        check_install 0 && disable 0
        ;;
    "log")
        check_install 0 && show_log 0
        ;;
    "v2-ui")
        check_install 0 && migrate_v2_ui 0
        ;;
    "update")
        check_install 0 && update 0
        ;;
    "install")
        check_uninstall 0 && install 0
        ;;
    "x25519")
        x25519 0
        ;;
    "update_shell")
        update_shell 0
        ;;
    "geoip")
        geoip 0
        ;;
    "crontab")
        crontab 0
        ;;
    "ssl_main")
        ssl_cert_issue_main
        ;;
    "ip_ssl_main")
        ssl_cert_issue_ip 0
        ;;
    "ssl_CF")
        ssl_cert_issue_CF 0
        ;;
    "uninstall")
        check_install 0 && uninstall 0
        ;;
    *) show_usage ;;
    esac
else
    show_menu
fi
