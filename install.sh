#!/bin/bash
curl -sS -H "Accept: application/vnd.github.v3+json" -o "/tmp/tmp_file" 'https://api.github.com/repos/qist/xray-ui/releases/latest'
releases_version=($(sed 'y/,/\n/' "/tmp/tmp_file" | grep 'tag_name' | awk -F '"' '{print $4}'))
rm /tmp/tmp_file -f
red='\033[0;31m'
green='\033[0;32m'
yellow='\033[0;33m'
bblue='\033[0;34m'
plain='\033[0m'

red() { echo -e "\033[31m\033[01m$1\033[0m"; }
green() { echo -e "\033[32m\033[01m$1\033[0m"; }
yellow() { echo -e "\033[33m\033[01m$1\033[0m"; }
blue() { echo -e "\033[36m\033[01m$1\033[0m"; }
white() { echo -e "\033[37m\033[01m$1\033[0m"; }
readp() { read -p "$(yellow "$1")" $2; }
remoteV=${releases_version}
clear
white "Github项目  ：github.com/qist/xray-ui"
yellow "感谢xray-ui代码贡献者们（vaxilu）"
green "当前安装版本： $remoteV"
yellow "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
sleep 2
cur_dir=$(pwd)

# check root
[[ $EUID -ne 0 ]] && echo -e "${red}错误：${plain} 必须使用root用户运行此脚本！\n" && exit 1

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

sys() {
    [ -f /etc/os-release ] && grep -i pretty_name /etc/os-release | cut -d \" -f2 && return
    [ -f /etc/lsb-release ] && grep -i description /etc/lsb-release | cut -d \" -f2 && return
    [ -f /etc/redhat-release ] && awk '{print $0}' /etc/redhat-release && return
}
op=$(sys)
version=$(uname -r | awk -F "-" '{print $1}')
vi=$(systemd-detect-virt)
white "VPS操作系统: $(blue "$op") \c" && white " 内核版本: $(blue "$version") \c" && white " CPU架构 : $(blue "$arch") \c" && white " 虚拟化类型: $(blue "$vi")"
sleep 2

if [ $(getconf WORD_BIT) != '32' ] && [ $(getconf LONG_BIT) != '64' ]; then
    echo "本软件不支持 32 位系统(x86)，请使用 64 位系统(x86_64)，如果检测有误，请联系作者"
    exit -1
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
ports=$(/usr/local/xray-ui/xray-ui 2>&1 | grep tcp | awk '{print $5}' | sed "s/://g")
if [[ -n $ports ]]; then
    green "经检测，xray-ui已安装"
    echo
    acp=$(/usr/local/xray-ui/xray-ui setting -show 2>/dev/null)
    green "$acp"
    echo
    readp "是否直接重装xray-ui，请输入Y/y键并回车。如不重装，输入N/n键回车退出脚本):" ins
    if [[ $ins = [Yy] ]]; then
        systemctl stop xray-ui
        systemctl disable xray-ui
        rm /etc/systemd/system/xray-ui.service -f
        systemctl daemon-reload
        systemctl reset-failed
        rm /etc/xray-ui/ -rf
        rm /usr/local/xray-ui/ -rf
        rm -rf /root/rayuil.sh /root/acme.sh
        sed -i '/xrayuil.sh/d' /etc/crontab
        sed -i '/xray-ui restart/d' /etc/crontab
    else
        exit 1
    fi
fi
install_base() {
    if [[ x"${release}" == x"centos" ]]; then
        if [[ ${os_version} =~ 8 ]]; then
            yum clean all && yum makecache
        fi
        yum install epel-release -y && yum install wget curl tar gzip lsof -y

        setenforce 0 >/dev/null 2>&1
    else
        apt update && apt install wget curl tar lsof gzip -y
    fi
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

install_xray-ui() {
    systemctl stop xray-ui
    cd /usr/local/
    if [ $# == 0 ]; then
        wget --no-check-certificate -O /usr/local/xray-ui-linux-$(arch).tar.gz https://github.com/qist/xray-ui/releases/download/${releases_version}/xray-ui-linux-$(arch).tar.gz
        if [[ $? -ne 0 ]]; then
            echo -e "${red}下载 xray-ui 失败，请确保你的服务器能够下载 Github 的文件${plain}"
            rm -f install.sh
            exit 1
        fi
    else
        last_version=$1
        url="https://github.com/qist/xray-ui/releases/download/${releases_version}/xray-ui-linux-$(arch).tar.gz"
        echo -e "开始安装 xray-ui v$1"
        wget  --no-check-certificate -O /usr/local/xray-ui-linux-$(arch).tar.gz ${url}
        if [[ $? -ne 0 ]]; then
            echo -e "${red}下载 xray-ui v$1 失败，请确保此版本存在${plain}"
            rm -f install.sh
            exit 1
        fi
    fi

    if [[ -e /usr/local/xray-ui/ ]]; then
        rm /usr/local/xray-ui/ -rf
    fi

    tar -zxvf xray-ui-linux-$(arch).tar.gz
    rm xray-ui-linux-$(arch).tar.gz -f
    cd xray-ui
    # Check the system's architecture and rename the file accordingly
    if [[ $(arch) == "armv5" || $(arch) == "armv6" || $(arch) == "armv7" ]]; then
        mv bin/xray-linux-$(arch) bin/xray-linux-arm
        chmod +x bin/xray-linux-arm
    fi   
    chmod +x xray-ui bin/xray-linux-$(arch)
    cp -f xray-ui.service /etc/systemd/system/
    wget --no-check-certificate -O /usr/bin/xray-ui https://raw.githubusercontent.com/qist/xray-ui/main/xray-ui.sh
    chmod +x /usr/bin/xray-ui
    systemctl daemon-reload
    systemctl enable xray-ui
    systemctl start xray-ui
    sleep 2
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
    sed -i '/xrayuil.sh/d' /etc/crontab
    echo "*/1 * * * * root bash /root/xrayuil.sh >/dev/null 2>&1" >>/etc/crontab
    sed -i '/xray-ui restart/d' /etc/crontab
    echo "0 1 1 * *  root xray-ui restart >/dev/null 2>&1" >>/etc/crontab
    sleep 1
    echo -e ""
    blue "以下设置内容建议自定义，以防止账号密码路径及端口泄露"
    echo -e ""
    readp "设置xray-ui登录用户名（回车跳过为随机6位字符）：" username
    if [[ -z ${username} ]]; then
        uauto=$(date +%s%N | md5sum | cut -c 1-6)
        username=$uauto
    fi
    sleep 1
    green "xray-ui登录用户名：${username}"
    echo -e ""
    readp "设置xray-ui登录密码（回车跳过为随机6位字符）：" password
    if [[ -z ${password} ]]; then
        pauto=$(date +%s%N | md5sum | cut -c 1-6)
        password=$pauto
    fi
    green "xray-ui登录密码：${password}"
    /usr/local/xray-ui/xray-ui setting -username ${username} -password ${password} >/dev/null 2>&1
    sleep 1
    echo -e ""
    readp "设置xray-ui登录端口[1-65535]（回车跳过为2000-65535之间的随机端口）：" port
    if [[ -z $port ]]; then
        port=$(shuf -i 2000-65535 -n 1)
        until [[ -z $(ss -ntlp | awk '{print $4}' | grep -w "$port") ]]; do
            [[ -n $(ss -ntlp | awk '{print $4}' | grep -w "$port") ]] && yellow "\n端口被占用，请重新输入端口" && readp "自定义xray-ui端口:" port
        done
    else
        until [[ -z $(ss -ntlp | awk '{print $4}' | grep -w "$port") ]]; do
            [[ -n $(ss -ntlp | awk '{print $4}' | grep -w "$port") ]] && yellow "\n端口被占用，请重新输入端口" && readp "自定义xray-ui端口:" port
        done
    fi
    /usr/local/xray-ui/xray-ui setting -port $port >/dev/null 2>&1
    green "xray-ui登录端口：${port}"
    sleep 1
    echo -e ""
    readp "设置xray-ui web 路径 （回车跳过为随机10位字符）：" path
    if [[ -z ${path} ]]; then
        path=$(generate_random_string 10)
    fi
    /usr/local/xray-ui/xray-ui setting -webBasePath $path >/dev/null 2>&1
    green "xray-ui web 路径：${path}"
    /usr/local/xray-ui/xray-ui setting -listen 127.0.0.1 >/dev/null 2>&1
    sleep 1
    xray-ui restart
    xuilogin() {
        v4=$(curl -s4m8 http://ip.sb -k)
        v6=$(curl -s6m8 http://ip.sb -k)
        if [[ -z $v4 ]]; then
            int="${green}请在浏览器地址栏复制${plain}  ${bblue}[$v6]:$ports/$path${plain}  ${green}进入xray-ui登录界面\n当前xray-ui登录用户名：${plain}${bblue}${username}${plain}${green} \n当前xray-ui登录密码：${plain}${bblue}${password}${plain}"
        elif [[ -n $v4 && -n $v6 ]]; then
            int="${green}请在浏览器地址栏复制${plain}  ${bblue}$v4:$ports/$path${plain}  ${yellow}或者${plain}  ${bblue}[$v6]:$ports/$path${plain}  ${green}进入xray-ui登录界面\n当前xray-ui登录用户名：${plain}${bblue}${username}${plain}${green} \n当前xray-ui登录密码：${plain}${bblue}${password}${plain}"
        else
            int="${green}请在浏览器地址栏复制${plain}  ${bblue}$v4:$ports/$path${plain}  ${green}进入xray-ui登录界面\n当前xray-ui登录用户名：${plain}${bblue}${username}${plain}${green} \n当前xray-ui登录密码：${plain}${bblue}${password}${plain}"
        fi
    }
ssh_forwarding() {
    # 获取 IPv4 和 IPv6 地址
    v4=$(curl -s4m8 http://ip.sb -k)
    v6=$(curl -s6m8 http://ip.sb -k)

    echo -e ""
    read -p "设置 xray-ui ssh 转发端口 [1-65535]（回车跳过为 2000-65535 之间的随机端口）：" ssh_port

    # 如果未输入端口，则随机生成一个2000-65535之间的端口
    if [[ -z $ssh_port ]]; then
        ssh_port=$(shuf -i 2000-65535 -n 1)
    fi

    # 检查端口是否被占用，直到找到未占用的端口
    while [[ -n $(ss -ntlp | awk '{print $4}' | grep -w ":$ssh_port") ]]; do
        echo -e "\n端口 $ssh_port 被占用，请重新输入端口"
        read -p "自定义 xray-ui ssh 转发端口:" ssh_port
        if [[ -z $ssh_port ]]; then
            ssh_port=$(shuf -i 2000-65535 -n 1)
        fi
    done

    # 检查 IP 并输出相应的 SSH 和浏览器访问信息
    if [[ -z $v4 ]]; then
        # echo -e "${green}请在 xray-ui 服务器系统输入${plain} ${bblue}ssh  -f -N -L [::]:$ssh_port:127.0.0.1:$ports root@127.0.0.1${plain} 输入 root 密码进行转发 不建议使用"
        # echo -e "${green}请在浏览器地址栏复制${plain} ${bblue}[$v6]:$ssh_port/$path${plain} ${green}进入 xray-ui 登录界面"
        echo -e "${green}客户端转发 安全性高${plain} ${bblue}ssh  -f -N -L [::]:$ssh_port:127.0.0.1:$ports root@[$v6]${plain} 输入 root 密码进行转发"
        echo -e "${green}请在浏览器地址栏复制${plain} ${bblue}[::1]:$ssh_port/$path${plain} ${green}进入 xray-ui 登录界面"
        echo -e "${green}当前 xray-ui 登录用户名：${plain}${bblue}${username}${plain}"
        echo -e "${green}当前 xray-ui 登录密码：${plain}${bblue}${password}${plain}"
        yellow "不使用ssh 转发请配置nginx https代理或者xray-ui 配置证书"
    elif [[ -n $v4 && -n $v6 ]]; then
        # echo -e "${green}请在  xray-ui 服务器系统输入${plain} ${bblue}ssh  -f -N -L 0.0.0.0:$ssh_port:127.0.0.1:$ports root@127.0.0.1${plain} ${yellow}或者 ${bblue}ssh  -f -N -L [::]:$ssh_port:127.0.0.1:$ports root@127.0.0.1${plain} 输入 root 密码进行转发 不建议使用"
        # echo -e "${green}请在浏览器地址栏复制${plain} ${bblue}$v4:$ssh_port/$path${plain} ${yellow}或者${plain} ${bblue}[$v6]:$ssh_port/$path${plain} ${green}进入 xray-ui 登录界面"
        echo -e "${green}客户端转发 安全性高 ${plain} ${bblue}ssh  -f -N -L 0.0.0.0:$ssh_port:127.0.0.1:$ports root@$v4${plain} ${yellow}或者 ${bblue}ssh  -f -N -L [::]:$ssh_port:127.0.0.1:$ports root@[$v6]${plain} 输入 root 密码进行转发"
        echo -e "${green}请在浏览器地址栏复制${plain} ${bblue}127.0.0.1:$ssh_port/$path${plain} ${yellow}或者${plain} ${bblue}[::1]:$ssh_port/$path${plain} ${green}进入 xray-ui 登录界面"
        echo -e "${green}当前 xray-ui 登录用户名：${plain}${bblue}${username}${plain}"
        echo -e "${green}当前 xray-ui 登录密码：${plain}${bblue}${password}${plain}"
        yellow "不使用ssh 转发请配置nginx https代理或者xray-ui 配置证书"
    else
        # echo -e "${green}请在  xray-ui 服务器系统输入${plain} ${bblue}ssh  -f -N -L 0.0.0.0:$ssh_port:127.0.0.1:$ports root@127.0.0.1${plain} 输入 root 密码进行转发 "
        # echo -e "${green}请在浏览器地址栏复制${plain} ${bblue}$v4:$ssh_port/$path${plain} ${green}进入 xray-ui 登录界面"
        echo -e "${green}客户端转发 安全性高${plain} ${bblue}ssh  -f -N -L 0.0.0.0:$ssh_port:127.0.0.1:$ports root@$v4${plain} 输入 root 密码进行转发"
        echo -e "${green}请在浏览器地址栏复制${plain} ${bblue}127.0.0.1:$ssh_port/$path${plain} ${green}进入 xray-ui 登录界面"
        echo -e "${green}当前 xray-ui 登录用户名：${plain}${bblue}${username}${plain}"
        echo -e "${green}当前 xray-ui 登录密码：${plain}${bblue}${password}${plain}"
        yellow "不使用ssh 转发请配置nginx https代理或者xray-ui 配置证书"
    fi
    }
    ports=$(/usr/local/xray-ui/xray-ui 2>&1 | grep "tcp" | awk '{print $5}' | cut -d':' -f2)
    if [[ -n $ports ]]; then
        echo -e ""
        yellow "xray-ui $remoteV 安装成功，请稍等3秒，检测IP环境，输出xray-ui登录信息……"
        ssh_forwarding
        yellow "下面是xray-ui tls mTLS 配置信息"
        yellow "证书管理 xray-ui ssl_main  cf 证书申请 xray-ui ssl_CF"
        yellow "TLS 配置 /usr/local/xray-ui/xray-ui cert -webCert /root/cert/你的域名/fullchain.pem -webCertKey /root/cert/你的域名/privkey.pem 重启 xray-ui restart 生效"
        yellow "mTLS 配置 /usr/local/xray-ui/xray-ui cert -webCert /root/cert/你的域名/fullchain.pem -webCertKey /root/cert/你的域名/privkey.pem -webCa /root/cert/ca.cer 重启 xray-ui restart 生效"
        yellow "访问：https://你的域名:$ports/$path"
        yellow "mTLS windows 使用....."
        yellow "生成windows客户端证书 client.p12..."
        yellow "openssl pkcs12 -export -out client.p12 -inkey /root/cert/你的域名/privkey.pem -in  /root/cert/${domain}.cer -certfile /root/cert/ca.cer"
        yellow "client.p12: windows客户端证书 记得设置密码 导入证书需要密码"
        yellow "client.p12 文件导入windows系统 桌面双击打开->导入->下一步->将所有证书都放入下列存储->个人->完成 如果导入失败开始菜单搜证书 打开管理用户证书管理->个人->所有任务->导入->输入密码"
    
    else
        red "xray-ui安装失败，请查看日志，运行 xray-ui log"
    fi
    sleep 1
    echo -e ""
    echo -e "$int"
    echo -e ""
    echo -e "xray-ui 管理脚本使用方法: "
    echo -e "----------------------------------------------"
    echo -e "xray-ui              - 显示管理菜单"
    echo -e "xray-ui start        - 启动 xray-ui 面板"
    echo -e "xray-ui stop         - 停止 xray-ui 面板"
    echo -e "xray-ui restart      - 重启 xray-ui 面板"
    echo -e "xray-ui status       - 查看 xray-ui 状态"
    echo -e "xray-ui enable       - 设置 xray-ui 开机自启"
    echo -e "xray-ui disable      - 取消 xray-ui 开机自启"
    echo -e "xray-ui log          - 查看 xray-ui 日志"
    echo -e "xray-ui v2-ui        - 迁移本机器的 v2-ui 账号数据至 xray-ui"
    echo -e "xray-ui update       - 更新 xray-ui 面板"
    echo -e "xray-ui geoip        - 更新 geoip ip库"
    echo -e "xray-ui update_shell - 更新 xray-ui 脚本"
    echo -e "xray-ui install      - 安装 xray-ui 面板"
    echo -e "xray-ui x25519       - REALITY  key 生成"
    echo -e "xray-ui ssl_main     - SSL 证书管理"
    echo -e "xray-ui ssl_CF       - Cloudflare SSL 证书"
    echo -e "xray-ui crontab      - 添加geoip到任务计划每天凌晨1.30执行"    
    echo -e "xray-ui uninstall    - 卸载 xray-ui 面板"
    echo -e "----------------------------------------------"
    rm -f install.sh
}

echo -e "${green}开始安装xray-ui必要依赖${plain}"
install_base
echo -e "${green}开始安装xray-ui核心组件${plain}"
install_xray-ui $1
