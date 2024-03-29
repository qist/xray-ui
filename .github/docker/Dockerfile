FROM --platform=$BUILDPLATFORM  golang:bullseye AS build

RUN apt update && apt install -y gcc-aarch64-linux-gnu
ARG TARGETOS TARGETARCH

RUN echo "I'm building for $BUILDPLATFORM"

WORKDIR /src

COPY . .

COPY .github/docker/files/cc-name.sh /tmp/cc-name.sh
 
RUN FILE_NAME=`bash /tmp/cc-name.sh` && echo $FILE_NAME && GOOS=$TARGETOS GOARCH=$TARGETARCH CGO_ENABLED=1  CC="$FILE_NAME" go build -o xray-ui -trimpath -ldflags '-s -w -buildid= -linkmode "external" -extldflags "-static"' main.go

FROM --platform=${TARGETPLATFORM} alpine:latest

ARG TARGETARCH

WORKDIR /root

COPY --from=build /src/xray-ui /root/xray-ui
COPY .github/docker/files/file-name.sh /tmp/file-name.sh

RUN set -ex \
    && FILE_NAME=`sh /tmp/file-name.sh` && echo $FILE_NAME \
    && apk add --no-cache tzdata ca-certificates bash \
    && mkdir -p /root/bin \
    && chmod +x /root/xray-ui \
    && cd /root/bin \
    && wget https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-${FILE_NAME}.zip \
    && unzip Xray-linux-${FILE_NAME}.zip \
    && rm -f Xray-linux-${FILE_NAME}.zip geoip.dat geosite.dat \
    && mv xray xray-linux-${TARGETARCH} \
    && rm -f /tmp/file-name.sh \
    && wget -O /root/bin/geosite.dat https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geosite.dat \
    && wget -O /root/bin/geoip.dat https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geoip.dat
    

VOLUME /etc/xray-ui
ENV TZ=Asia/Shanghai
CMD [ "./xray-ui" ]