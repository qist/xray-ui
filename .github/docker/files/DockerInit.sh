#!/bin/sh
case $1 in
    amd64)
        ARCH="64"
        FNAME="amd64"
        ;;
    i386)
        ARCH="32"
        FNAME="i386"
        ;;
    armv8 | arm64 | aarch64)
        ARCH="arm64-v8a"
        FNAME="arm64"
        ;;
    armv7 | arm | arm32)
        ARCH="arm32-v7a"
        FNAME="arm32"
        ;;
    armv6)
        ARCH="arm32-v6"
        FNAME="armv6"
        ;;
    *)
        ARCH="64"
        FNAME="amd64"
        ;;
esac
mkdir -p build/bin
cd build/bin
wget "https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-${ARCH}.zip"
unzip "Xray-linux-${ARCH}.zip"
rm -f "Xray-linux-${ARCH}.zip" geoip.dat geosite.dat
mv xray "xray-linux-${FNAME}"
wget https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geoip.dat
wget https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geosite.dat
cd ../../