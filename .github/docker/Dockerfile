# syntax=docker/dockerfile:1
FROM --platform=$BUILDPLATFORM golang:latest AS build
RUN apt update && apt-get install libc6-dev gcc  g++ 
WORKDIR /src
COPY . .
ARG TARGETOS TARGETARCH
RUN GOOS=$TARGETOS GOARCH=$TARGETARCH CGO_ENABLED=1 go build -o xray-ui -trimpath -ldflags "-s -w -buildid=" main.go

FROM --platform=${TARGETPLATFORM} alpine:latest
WORKDIR /root
COPY --from=build /src/xray-ui /root/xray-ui
COPY --from=build /src/xray-ui.sh /usr/bin/xray-ui
RUN set -ex \
	&& apk add --no-cache tzdata ca-certificates \
	&& mkdir -p /root/bin \
    && chmod +x /root/xray-ui \
    && chmod +x /usr/bin/xray-ui \
    && cd /root/bin \
    && wget https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip \
    && unzip Xray-linux-64.zip \
    && rm -f Xray-linux-64.zip geoip.dat geosite.dat \
	&& wget -O /root/bin/geosite.dat https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geosite.dat \
	&& wget -O /root/bin/geoip.dat https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geoip.dat \
    && mv xray xray-linux-amd64

VOLUME /etc/xray-ui
ENV TZ=Asia/Shanghai
CMD [ "./xray-ui" ]