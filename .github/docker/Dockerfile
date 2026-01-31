# ========================================================
# Stage: build
# ========================================================
FROM --platform=$BUILDPLATFORM golang:alpine AS build
WORKDIR /app
ARG TARGETARCH

RUN apk --no-cache --update add \
  build-base \
  gcc \
  wget \
  unzip

COPY . .
COPY .github/docker/files/DockerInit.sh  /app/DockerInit.sh
ENV CGO_ENABLED=1
ENV CGO_CFLAGS="-D_LARGEFILE64_SOURCE"
RUN go build -ldflags "-w -s" -o build/xray-ui main.go
RUN chmod +x  ./DockerInit.sh && \
     ./DockerInit.sh "$TARGETARCH"

# ========================================================
# Stage: Final Image of xray-ui
# ========================================================
FROM alpine
ENV TZ=Asia/Shanghai
WORKDIR /app

RUN apk add --no-cache --update \
  ca-certificates \
  tzdata \
  fail2ban \
  bash

COPY --from=build /app/build/ /app/
COPY --from=build /app/DockerEntrypoint.sh /app/
COPY --from=build /app/xray-ui.sh /usr/bin/xray-ui


# Configure fail2ban
RUN rm -f /etc/fail2ban/jail.d/alpine-ssh.conf \
  && cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local \
  && sed -i "s/^\[ssh\]$/&\nenabled = false/" /etc/fail2ban/jail.local \
  && sed -i "s/^\[sshd\]$/&\nenabled = false/" /etc/fail2ban/jail.local \
  && sed -i "s/#allowipv6 = auto/allowipv6 = auto/g" /etc/fail2ban/fail2ban.conf

RUN chmod +x \
  /app/DockerEntrypoint.sh \
  /app/xray-ui \
  /usr/bin/xray-ui

VOLUME [ "/etc/xray-ui" ]
CMD [ "./xray-ui" ]
ENTRYPOINT [ "/app/DockerEntrypoint.sh" ]