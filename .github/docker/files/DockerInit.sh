#!/bin/sh
# $1 = TARGETARCH (amd64, arm64, arm, 386, s390x)
# $2 = TARGETVARIANT (v8, v7, v6, 或空)
case "$1" in
    amd64)
        ARCH="64"
        FNAME="amd64"
        ;;
    386)
        ARCH="32"
        FNAME="386"
        ;;
    arm64)
        ARCH="arm64-v8a"
        FNAME="arm64"
        ;;
    arm)
        case "$2" in
            v6)
                ARCH="arm32-v6"
                FNAME="arm"
                ;;
            v7)
                ARCH="arm32-v7a"
                FNAME="arm"
                ;;
            *)
                ARCH="arm32-v7a"
                FNAME="arm"
                ;;
        esac
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
