const Protocols = {
    VMESS: 'vmess',
    VLESS: 'vless',
    TROJAN: 'trojan',
    SHADOWSOCKS: 'shadowsocks',
    DOKODEMO: 'dokodemo-door',
    MTPROTO: 'mtproto',
    SOCKS: 'socks',
    HTTP: 'http',
};

const VmessMethods = {
    AES_128_GCM: 'aes-128-gcm',
    CHACHA20_POLY1305: 'chacha20-poly1305',
    AUTO: 'auto',
    NONE: 'none',
};

const SSMethods = {
    // AES_256_CFB: 'aes-256-cfb',
    // AES_128_CFB: 'aes-128-cfb',
    // CHACHA20: 'chacha20',
    // CHACHA20_IETF: 'chacha20-ietf',
    CHACHA20_POLY1305: 'chacha20-poly1305',
    AES_256_GCM: 'aes-256-gcm',
    AES_128_GCM: 'aes-128-gcm',
    BLAKE3_AES_128_GCM: '2022-blake3-aes-128-gcm',
    BLAKE3_AES_256_GCM: '2022-blake3-aes-256-gcm',
    BLAKE3_CHACHA20_POLY1305: '2022-blake3-chacha20-poly1305',
};

const RULE_IP = {
    PRIVATE: 'geoip:private',
    CN: 'geoip:cn',
};

const RULE_DOMAIN = {
    ADS: 'geosite:category-ads',
    ADS_ALL: 'geosite:category-ads-all',
    CN: 'geosite:cn',
    GOOGLE: 'geosite:google',
    FACEBOOK: 'geosite:facebook',
    SPEEDTEST: 'geosite:speedtest',
};

const FLOW_VISION = {
    FLOWVISION: "xtls-rprx-vision",
}

const TLS_VERSION_OPTION = {
    TLS10: "1.0",
    TLS11: "1.1",
    TLS12: "1.2",
    TLS13: "1.3",
};

const TLS_CIPHER_OPTION = {
    RSA_AES_128_CBC: "TLS_RSA_WITH_AES_128_CBC_SHA",
    RSA_AES_256_CBC: "TLS_RSA_WITH_AES_256_CBC_SHA",
    RSA_AES_128_GCM: "TLS_RSA_WITH_AES_128_GCM_SHA256",
    RSA_AES_256_GCM: "TLS_RSA_WITH_AES_256_GCM_SHA384",
    AES_128_GCM: "TLS_AES_128_GCM_SHA256",
    AES_256_GCM: "TLS_AES_256_GCM_SHA384",
    CHACHA20_POLY1305: "TLS_CHACHA20_POLY1305_SHA256",
    ECDHE_ECDSA_AES_128_CBC: "TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA",
    ECDHE_ECDSA_AES_256_CBC: "TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA",
    ECDHE_RSA_AES_128_CBC: "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA",
    ECDHE_RSA_AES_256_CBC: "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA",
    ECDHE_ECDSA_AES_128_GCM: "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256",
    ECDHE_ECDSA_AES_256_GCM: "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384",
    ECDHE_RSA_AES_128_GCM: "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
    ECDHE_RSA_AES_256_GCM: "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
    ECDHE_ECDSA_CHACHA20_POLY1305: "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256",
    ECDHE_RSA_CHACHA20_POLY1305: "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256",
};

const ALPN_OPTION = {
    H2: "h2",
    HTTP1: "http/1.1",
};

const TCP_CONGESTION = {
    bbr: "bbr",
    cubic: "cubic",
    reno: "reno",
}

const DOMAIN_STRATEGY = {
    AsIs: "AsIs",
    UseIP: "UseIP",
    UseIPv4: "UseIPv4",
    UseIPv6: "UseIPv6",
}

Object.freeze(Protocols);
Object.freeze(VmessMethods);
Object.freeze(SSMethods);
Object.freeze(RULE_IP);
Object.freeze(RULE_DOMAIN);
Object.freeze(FLOW_VISION);
Object.freeze(TLS_VERSION_OPTION);
Object.freeze(TLS_CIPHER_OPTION);
Object.freeze(ALPN_OPTION);
Object.freeze(TCP_CONGESTION);
Object.freeze(DOMAIN_STRATEGY);

class XrayCommonClass {

    static toJsonArray(arr) {
        return arr.map(obj => obj.toJson());
    }

    static fromJson() {
        return new XrayCommonClass();
    }

    toJson() {
        return this;
    }

    toString(format = true) {
        return format ? JSON.stringify(this.toJson(), null, 2) : JSON.stringify(this.toJson());
    }

    static toHeaders(v2Headers) {
        let newHeaders = [];
        if (v2Headers) {
            Object.keys(v2Headers).forEach(key => {
                let values = v2Headers[key];
                if (typeof (values) === 'string') {
                    newHeaders.push({ name: key, value: values });
                } else {
                    for (let i = 0; i < values.length; ++i) {
                        newHeaders.push({ name: key, value: values[i] });
                    }
                }
            });
        }
        return newHeaders;
    }

    static toV2Headers(headers, arr = true) {
        let v2Headers = {};
        for (let i = 0; i < headers.length; ++i) {
            let name = headers[i].name;
            let value = headers[i].value;
            if (ObjectUtil.isEmpty(name) || ObjectUtil.isEmpty(value)) {
                continue;
            }
            if (!(name in v2Headers)) {
                v2Headers[name] = arr ? [value] : value;
            } else {
                if (arr) {
                    v2Headers[name].push(value);
                } else {
                    v2Headers[name] = value;
                }
            }
        }
        return v2Headers;
    }
}


class TcpStreamSettings extends XrayCommonClass {
    constructor(type = 'none',
        request = new TcpStreamSettings.TcpRequest(),
        response = new TcpStreamSettings.TcpResponse(),
    ) {
        super();
        this.type = type;
        this.request = request;
        this.response = response;
    }

    static fromJson(json = {}) {
        let header = json.header;
        if (!header) {
            header = {};
        }
        return new TcpStreamSettings(
            header.type,
            TcpStreamSettings.TcpRequest.fromJson(header.request),
            TcpStreamSettings.TcpResponse.fromJson(header.response),
        );
    }

    toJson() {
        return {
            header: {
                type: this.type,
                request: this.type === 'http' ? this.request.toJson() : undefined,
                response: this.type === 'http' ? this.response.toJson() : undefined,
            },
        };

    }
}

TcpStreamSettings.TcpRequest = class extends XrayCommonClass {
    constructor(version = '1.1',
        method = 'GET',
        path = ['/'],
        headers = [],
    ) {
        super();
        this.version = version;
        this.method = method;
        this.path = path.length === 0 ? ['/'] : path;
        this.headers = headers;
    }

    addPath(path) {
        this.path.push(path);
    }

    removePath(index) {
        this.path.splice(index, 1);
    }

    addHeader(name, value) {
        this.headers.push({ name: name, value: value });
    }

    getHeader(name) {
        for (const header of this.headers) {
            if (header.name.toLowerCase() === name.toLowerCase()) {
                return header.value;
            }
        }
        return null;
    }

    removeHeader(index) {
        this.headers.splice(index, 1);
    }

    static fromJson(json = {}) {
        return new TcpStreamSettings.TcpRequest(
            json.version,
            json.method,
            json.path,
            XrayCommonClass.toHeaders(json.headers),
        );
    }

    toJson() {
        return {
            method: this.method,
            path: ObjectUtil.clone(this.path),
            headers: XrayCommonClass.toV2Headers(this.headers),
        };
    }
};

TcpStreamSettings.TcpResponse = class extends XrayCommonClass {
    constructor(version = '1.1',
        status = '200',
        reason = 'OK',
        headers = [],
    ) {
        super();
        this.version = version;
        this.status = status;
        this.reason = reason;
        this.headers = headers;
    }

    addHeader(name, value) {
        this.headers.push({ name: name, value: value });
    }

    removeHeader(index) {
        this.headers.splice(index, 1);
    }

    static fromJson(json = {}) {
        return new TcpStreamSettings.TcpResponse(
            json.version,
            json.status,
            json.reason,
            XrayCommonClass.toHeaders(json.headers),
        );
    }

    toJson() {
        return {
            version: this.version,
            status: this.status,
            reason: this.reason,
            headers: XrayCommonClass.toV2Headers(this.headers),
        };
    }
};

class KcpStreamSettings extends XrayCommonClass {
    constructor(mtu = 1350, tti = 20,
        uplinkCapacity = 5,
        downlinkCapacity = 20,
        congestion = false,
        readBufferSize = 2,
        writeBufferSize = 2,
        type = 'none',
        seed = RandomUtil.randomSeq(10),
    ) {
        super();
        this.mtu = mtu;
        this.tti = tti;
        this.upCap = uplinkCapacity;
        this.downCap = downlinkCapacity;
        this.congestion = congestion;
        this.readBuffer = readBufferSize;
        this.writeBuffer = writeBufferSize;
        this.type = type;
        this.seed = seed;
    }

    static fromJson(json = {}) {
        return new KcpStreamSettings(
            json.mtu,
            json.tti,
            json.uplinkCapacity,
            json.downlinkCapacity,
            json.congestion,
            json.readBufferSize,
            json.writeBufferSize,
            ObjectUtil.isEmpty(json.header) ? 'none' : json.header.type,
            json.seed,
        );
    }

    toJson() {
        return {
            mtu: this.mtu,
            tti: this.tti,
            uplinkCapacity: this.upCap,
            downlinkCapacity: this.downCap,
            congestion: this.congestion,
            readBufferSize: this.readBuffer,
            writeBufferSize: this.writeBuffer,
            header: {
                type: this.type,
            },
            seed: this.seed,
        };
    }
}

class WsStreamSettings extends XrayCommonClass {
    constructor(path = '/', headers = []) {
        super();
        this.path = path;
        this.headers = headers;
    }

    addHeader(name, value) {
        this.headers.push({ name: name, value: value });
    }

    getHeader(name) {
        for (const header of this.headers) {
            if (header.name.toLowerCase() === name.toLowerCase()) {
                return header.value;
            }
        }
        return null;
    }

    removeHeader(index) {
        this.headers.splice(index, 1);
    }

    static fromJson(json = {}) {
        return new WsStreamSettings(
            json.path,
            XrayCommonClass.toHeaders(json.headers),
        );
    }

    toJson() {
        return {
            path: this.path,
            headers: XrayCommonClass.toV2Headers(this.headers, false),
        };
    }
}

class HttpStreamSettings extends XrayCommonClass {
    constructor(path = '/', host = ['']) {
        super();
        this.path = path;
        this.host = host.length === 0 ? [''] : host;
    }

    addHost(host) {
        this.host.push(host);
    }

    removeHost(index) {
        this.host.splice(index, 1);
    }

    static fromJson(json = {}) {
        return new HttpStreamSettings(json.path, json.host);
    }

    toJson() {
        let host = [];
        for (let i = 0; i < this.host.length; ++i) {
            if (!ObjectUtil.isEmpty(this.host[i])) {
                host.push(this.host[i]);
            }
        }
        return {
            path: this.path,
            host: host,
        }
    }
}


class QuicStreamSettings extends XrayCommonClass {
    constructor(security = VmessMethods.NONE,
        key = '', type = 'none',) {
        super();
        this.security = security;
        this.key = key;
        this.type = type;
    }

    static fromJson(json = {}) {
        return new QuicStreamSettings(
            json.security,
            json.key,
            json.header ? json.header.type : 'none',
        );
    }

    toJson() {
        return {
            security: this.security,
            key: this.key,
            header: {
                type: this.type,
            }
        }
    }
}

class GrpcStreamSettings extends XrayCommonClass {
    constructor(serviceName = "") {
        super();
        this.serviceName = serviceName;
    }

    static fromJson(json = {}) {
        return new GrpcStreamSettings(json.serviceName);
    }

    toJson() {
        return {
            serviceName: this.serviceName,
        }
    }
}


class TlsStreamSettings extends XrayCommonClass {
    constructor(serverName = '',
        rejectUnknownSni = false,
        minVersion = TLS_VERSION_OPTION.TLS10,
        maxVersion = TLS_VERSION_OPTION.TLS12,
        cipherSuites = '',
        certificates = [new TlsStreamSettings.Cert()], alpn = ['']) {
        super();
        this.server = serverName;
        this.rejectUnknownSni = rejectUnknownSni;
        this.minVersion = minVersion;
        this.maxVersion = maxVersion;
        this.cipherSuites = cipherSuites;
        this.certs = certificates;
        this.alpn = alpn;
    }

    addCert(cert) {
        this.certs.push(cert);
    }

    removeCert(index) {
        this.certs.splice(index, 1);
    }

    static fromJson(json = {}) {
        let certs;
        if (!ObjectUtil.isEmpty(json.certificates)) {
            certs = json.certificates.map(cert => TlsStreamSettings.Cert.fromJson(cert));
        }
        return new TlsStreamSettings(
            json.serverName,
            json.rejectUnknownSni,
            json.minVersion,
            json.maxVersion,
            json.cipherSuites,
            certs,
            json.alpn,
        );
    }

    toJson() {
        return {
            serverName: this.server,
            rejectUnknownSni: this.rejectUnknownSni,
            minVersion: this.minVersion,
            maxVersion: this.maxVersion,
            cipherSuites: this.cipherSuites,
            certificates: TlsStreamSettings.toJsonArray(this.certs),
            alpn: this.alpn,
        };
    }
}

TlsStreamSettings.Cert = class extends XrayCommonClass {
    constructor(useFile = true, ocspStapling = 3600, certificateFile = '', keyFile = '', certificate = '', key = '') {
        super();
        this.useFile = useFile;
        this.ocspStapling = ocspStapling;
        this.certFile = certificateFile;
        this.keyFile = keyFile;
        this.cert = certificate instanceof Array ? certificate.join('\n') : certificate;
        this.key = key instanceof Array ? key.join('\n') : key;
    }

    static fromJson(json = {}) {
        if ('certificateFile' in json && 'keyFile' in json) {
            return new TlsStreamSettings.Cert(
                true,
                json.ocspStapling,
                json.certificateFile,
                json.keyFile,
            );
        } else {
            return new TlsStreamSettings.Cert(
                false,
                json.ocspStapling,
                '', '',
                json.certificate.join('\n'),
                json.key.join('\n'),
            );
        }
    }

    toJson() {
        if (this.useFile) {
            return {
                ocspStapling: this.ocspStapling,
                certificateFile: this.certFile,
                keyFile: this.keyFile,
            };
        } else {
            return {
                ocspStapling: this.ocspStapling,
                certificate: this.cert.split('\n'),
                key: this.key.split('\n'),
            };
        }
    }
};

class ReaLITyStreamSettings extends XrayCommonClass {
    constructor(show = false, dest = "", xver = 0, serverNames = '', privateKey = "", minClientVer = "", maxClientVer = "", maxTimeDiff = 0, shortIds = '') {
        super();
        this.show = show;
        this.dest = dest;
        this.xver = xver;
        this.serverNames = serverNames instanceof Array ? serverNames.join('\n') : serverNames;
        this.privateKey = privateKey;
        this.minClientVer = minClientVer;
        this.maxClientVer = maxClientVer;
        this.maxTimeDiff = maxTimeDiff;
        this.shortIds = shortIds instanceof Array ? shortIds.join('\n') : shortIds;

    }

    static fromJson(json = {}) {
        return new ReaLITyStreamSettings(
            json.show,
            json.dest,
            json.xver,
            json.serverNames,
            json.privateKey,
            json.minClientVer,
            json.maxClientVer,
            json.maxTimeDiff,
            json.shortIds,
        );
    }

    toJson() {
        return {
            show: this.show,
            dest: this.dest,
            xver: this.xver,
            serverNames: this.serverNames.split('\n'),
            privateKey: this.privateKey,
            minClientVer: this.minClientVer,
            maxClientVer: this.maxClientVer,
            maxTimeDiff: this.maxTimeDiff,
            shortIds: this.shortIds.split('\n'),
        }
    }
}


class SockoptStreamSettings  extends XrayCommonClass {
    constructor(tcpFastOpen = false,
        domainStrategy = DOMAIN_STRATEGY.AsIs,
        tcpcongestion = '',
        acceptProxyProtocol = false,
        tcpKeepAliveIdle = 0,
        tcpKeepAliveInterval = 0,
        _interface ="",
    ) {
        super();
        this.tcpFastOpen = tcpFastOpen;
        this.domainStrategy = domainStrategy;
        this.tcpcongestion = tcpcongestion;
        this.acceptProxyProtocol = acceptProxyProtocol;
        this.tcpKeepAliveIdle = tcpKeepAliveIdle;
        this.tcpKeepAliveInterval = tcpKeepAliveInterval;
        this._interface = _interface;
    }

    static fromJson(json = {}) {
        return new SockoptStreamSettings(
            json.tcpFastOpen,
            json.domainStrategy,
            json.tcpcongestion,
            json.acceptProxyProtocol,
            json.tcpKeepAliveIdle,
            json.tcpKeepAliveInterval,
            json._interface,
        );
    }

    toJson() {
        return {
            tcpFastOpen: this.tcpFastOpen,
            domainStrategy: this.domainStrategy,
            tcpcongestion: this.tcpcongestion,
            acceptProxyProtocol: this.acceptProxyProtocol,
            tcpKeepAliveIdle: this.tcpKeepAliveIdle,
            tcpKeepAliveInterval: this.tcpKeepAliveInterval,
            interface: this._interface,
        };
    }
}


class StreamSettings extends XrayCommonClass {
    constructor(network = 'tcp',
        security = 'none',
        tlsSettings = new TlsStreamSettings(),
        realitySettings = new ReaLITyStreamSettings(),
        tcpSettings = new TcpStreamSettings(),
        kcpSettings = new KcpStreamSettings(),
        wsSettings = new WsStreamSettings(),
        httpSettings = new HttpStreamSettings(),
        quicSettings = new QuicStreamSettings(),
        grpcSettings = new GrpcStreamSettings(),
        sockopt = new SockoptStreamSettings(),
    ) {
        super();
        this.network = network;
        this.security = security;
        this.tls = tlsSettings;
        this.reality = realitySettings;
        this.tcp = tcpSettings;
        this.kcp = kcpSettings;
        this.ws = wsSettings;
        this.http = httpSettings;
        this.quic = quicSettings;
        this.grpc = grpcSettings;
        this.sockopt = sockopt;
    }

    get isTls() {
        return this.security === 'tls';
    }

    set isTls(isTls) {
        if (isTls) {
            this.security = 'tls';
        } else {
            this.security = 'none';
        }
    }

    get isReaLITy() {
        return this.security === "reality";
    }

    set isReaLITy(isReaLITy) {
        if (isReaLITy) {
            this.security = 'reality';
        } else {
            this.security = 'none';
        }
    }

    get isSockopt() {
        return ['none'].indexOf(this.security) !== -1;
    }

    set isSockopt(isSockopt) {
        if (isSockopt) {
            return ['none'].indexOf(this.security) !== -1;
        }
    }

    static fromJson(json = {}) {
        return new StreamSettings(
            json.network,
            json.security,
            TlsStreamSettings.fromJson(json.tlsSettings),
            ReaLITyStreamSettings.fromJson(json.realitySettings),
            TcpStreamSettings.fromJson(json.tcpSettings),
            KcpStreamSettings.fromJson(json.kcpSettings),
            WsStreamSettings.fromJson(json.wsSettings),
            HttpStreamSettings.fromJson(json.httpSettings),
            QuicStreamSettings.fromJson(json.quicSettings),
            GrpcStreamSettings.fromJson(json.grpcSettings),
            SockoptStreamSettings.fromJson(json.sockopt),
        );
    }

    toJson() {
        const network = this.network;
        return {
            network: network,
            security: this.security,
            tlsSettings: this.isTls ? this.tls.toJson() : undefined,
            realitySettings: this.isReaLITy ? this.reality.toJson() : undefined,
            tcpSettings: network === 'tcp' ? this.tcp.toJson() : undefined,
            kcpSettings: network === 'kcp' ? this.kcp.toJson() : undefined,
            wsSettings: network === 'ws' ? this.ws.toJson() : undefined,
            httpSettings: network === 'http' ? this.http.toJson() : undefined,
            quicSettings: network === 'quic' ? this.quic.toJson() : undefined,
            grpcSettings: network === 'grpc' ? this.grpc.toJson() : undefined,
            sockopt: this.isSockopt ? this.sockopt.toJson() : undefined,
        };
    }
}

class Sniffing extends XrayCommonClass {
    constructor(enabled = true, destOverride = ['http', 'tls']) {
        super();
        this.enabled = enabled;
        this.destOverride = destOverride;
    }

    static fromJson(json = {}) {
        let destOverride = ObjectUtil.clone(json.destOverride);
        if (!ObjectUtil.isEmpty(destOverride) && !ObjectUtil.isArrEmpty(destOverride)) {
            if (ObjectUtil.isEmpty(destOverride[0])) {
                destOverride = ['http', 'tls'];
            }
        }
        return new Sniffing(
            !!json.enabled,
            destOverride,
        );
    }
}

class Inbound extends XrayCommonClass {
    constructor(port = RandomUtil.randomIntRange(10000, 60000),
        listen = '',
        protocol = Protocols.VMESS,
        settings = null,
        streamSettings = new StreamSettings(),
        tag = '',
        sniffing = new Sniffing(),
    ) {
        super();
        this.port = port;
        this.listen = listen;
        this._protocol = protocol;
        this.settings = ObjectUtil.isEmpty(settings) ? Inbound.Settings.getSettings(protocol) : settings;
        this.stream = streamSettings;
        this.tag = tag;
        this.sniffing = sniffing;
    }

    get protocol() {
        return this._protocol;
    }

    set protocol(protocol) {
        this._protocol = protocol;
        this.settings = Inbound.Settings.getSettings(protocol);
        if (protocol === Protocols.TROJAN) {
            if (this.network === "tcp") {
                this.tls = true;
            }
        }
    }

    get tls() {
        return this.stream.security === 'tls';
    }

    set tls(isTls) {
        if (isTls) {
            this.stream.security = 'tls';
        } else {
            this.stream.security = 'none';
        }

    }

    get reality() {
        return this.stream.security === 'reality';
    }

    set reality(isReaLITy) {
        if (isReaLITy) {
            this.stream.security = 'reality';
        } else {
            this.stream.security = 'none';
        }

    }

    get sockopt() {
        return ['none'].indexOf(this.stream.security) !== -1;
    }
    
    set sockopt(isSockopt) {
        if (isSockopt) {
            return ['none'].indexOf(this.stream.security) !== -1;
        }
    }

    get network() {
        return this.stream.network;
    }

    set network(network) {
        this.stream.network = network;
    }

    get isTcp() {
        return this.network === "tcp";
    }

    get isWs() {
        return this.network === "ws";
    }

    get isKcp() {
        return this.network === "kcp";
    }

    get isQuic() {
        return this.network === "quic"
    }

    get isGrpc() {
        return this.network === "grpc";
    }

    get isH2() {
        return this.network === "http";
    }

    // VMess & VLess
    get uuid() {
        switch (this.protocol) {
            case Protocols.VMESS:
                return this.settings.vmesses[0].id;
            case Protocols.VLESS:
                return this.settings.vlesses[0].id;
            default:
                return "";
        }
    }

    // VLess & Trojan
    get flow() {
        switch (this.protocol) {
            case Protocols.VLESS:
                return this.settings.vlesses[0].flow;
            case Protocols.TROJAN:
                return this.settings.clients[0].flow;
            default:
                return "";
        }
    }

    // VMess
    get alterId() {
        switch (this.protocol) {
            case Protocols.VMESS:
                return this.settings.vmesses[0].alterId;
            default:
                return "";
        }
    }

    // Socks & HTTP
    get username() {
        switch (this.protocol) {
            case Protocols.SOCKS:
            case Protocols.HTTP:
                return this.settings.accounts[0].user;
            default:
                return "";
        }
    }

    // Trojan & Shadowsocks & Socks & HTTP
    get password() {
        switch (this.protocol) {
            case Protocols.TROJAN:
                return this.settings.clients[0].password;
            case Protocols.SHADOWSOCKS:
                return this.settings.password;
            case Protocols.SOCKS:
            case Protocols.HTTP:
                return this.settings.accounts[0].pass;
            default:
                return "";
        }
    }

    // Shadowsocks
    get method() {
        switch (this.protocol) {
            case Protocols.SHADOWSOCKS:
                return this.settings.method;
            default:
                return "";
        }
    }

    get serverName() {
        if (this.stream.isTls) {
            return this.stream.tls.server;
        }
        return "";
    }

    get host() {
        if (this.isTcp) {
            return this.stream.tcp.request.getHeader("Host");
        } else if (this.isWs) {
            return this.stream.ws.getHeader("Host");
        } else if (this.isH2) {
            return this.stream.http.host[0];
        }
        return null;
    }

    get path() {
        if (this.isTcp) {
            return this.stream.tcp.request.path[0];
        } else if (this.isWs) {
            return this.stream.ws.path;
        } else if (this.isH2) {
            return this.stream.http.path[0];
        }
        return null;
    }

    get quicSecurity() {
        return this.stream.quic.security;
    }

    get quicKey() {
        return this.stream.quic.key;
    }

    get quicType() {
        return this.stream.quic.type;
    }

    get kcpType() {
        return this.stream.kcp.type;
    }

    get kcpSeed() {
        return this.stream.kcp.seed;
    }

    get serviceName() {
        return this.stream.grpc.serviceName;
    }

    canEnableTls() {
        switch (this.protocol) {
            case Protocols.VMESS:
            case Protocols.VLESS:
            case Protocols.TROJAN:
            case Protocols.SHADOWSOCKS:
                break;
            default:
                return false;
        }

        switch (this.network) {
            case "tcp":
            case "ws":
            case "http":
            case "quic":
            case "grpc":
                return true;
            default:
                return false;
        }
    }

    canSetTls() {
        return this.canEnableTls();
    }

    canEnableReaLITy() {
        switch (this.protocol) {
            case Protocols.VLESS:
            case Protocols.TROJAN:
            case Protocols.VMESS:
                break;
            default:
                return false;
        }
        return ['tcp', 'http', 'grpc'].indexOf(this.network) !== -1;
        //return this.network === "tcp";
    }

    canSockopt() {
        switch (this.protocol) {
            case Protocols.VLESS:
            case Protocols.TROJAN:
            case Protocols.SHADOWSOCKS:
            case Protocols.VMESS:
                break;
            default:
                return false;
        }
        return ['tcp', 'http', 'grpc', 'ws'].indexOf(this.network) !== -1;
        //return this.network === "tcp";
    }

    canEnableStream() {
        switch (this.protocol) {
            case Protocols.VMESS:
            case Protocols.VLESS:
            case Protocols.SHADOWSOCKS:
            case Protocols.TROJAN:
                return true;
            default:
                return false;
        }
    }

    canSniffing() {
        switch (this.protocol) {
            case Protocols.VMESS:
            case Protocols.VLESS:
            case Protocols.TROJAN:
            case Protocols.SHADOWSOCKS:
                return true;
            default:
                return false;
        }
    }

    reset() {
        this.port = RandomUtil.randomIntRange(10000, 60000);
        this.listen = '';
        this.protocol = Protocols.VMESS;
        this.settings = Inbound.Settings.getSettings(Protocols.VMESS);
        this.stream = new StreamSettings();
        this.tag = '';
        this.sniffing = new Sniffing();
    }

    genVmessLink(address = '', remark = '') {
        if (this.protocol !== Protocols.VMESS) {
            return '';
        }
        let network = this.stream.network;
        let type = 'none';
        let host = '';
        let path = '';
        if (network === 'tcp') {
            let tcp = this.stream.tcp;
            type = tcp.type;
            if (type === 'http') {
                let request = tcp.request;
                path = request.path.join(',');
                let index = request.headers.findIndex(header => header.name.toLowerCase() === 'host');
                if (index >= 0) {
                    host = request.headers[index].value;
                }
            }
        } else if (network === 'kcp') {
            let kcp = this.stream.kcp;
            type = kcp.type;
            path = kcp.seed;
        } else if (network === 'ws') {
            let ws = this.stream.ws;
            path = ws.path;
            let index = ws.headers.findIndex(header => header.name.toLowerCase() === 'host');
            if (index >= 0) {
                host = ws.headers[index].value;
            }
        } else if (network === 'http') {
            network = 'h2';
            path = this.stream.http.path;
            host = this.stream.http.host.join(',');
        } else if (network === 'quic') {
            type = this.stream.quic.type;
            host = this.stream.quic.security;
            path = this.stream.quic.key;
        } else if (network === 'grpc') {
            path = this.stream.grpc.serviceName;
        }

        if (this.stream.security === 'tls') {
            if (!ObjectUtil.isEmpty(this.stream.tls.server)) {
                address = this.stream.tls.server;
            }
        }

        let obj = {
            v: '2',
            ps: remark,
            add: address,
            port: this.port,
            id: this.settings.vmesses[0].id,
            aid: this.settings.vmesses[0].alterId,
            net: network,
            type: type,
            host: host,
            path: path,
            tls: this.stream.security,
        };
        return 'vmess://' + base64(JSON.stringify(obj, null, 2));
    }

    genVLESSLink(address = '', remark = '') {
        const settings = this.settings;
        const uuid = settings.vlesses[0].id;
        const port = this.port;
        const type = this.stream.network;
        const params = new Map();
        params.set("type", this.stream.network);
        if (this.reality) {
            params.set("security", "reality");
        } else {
            params.set("security", this.stream.security);
        }
        switch (type) {
            case "tcp":
                const tcp = this.stream.tcp;
                if (tcp.type === 'http') {
                    const request = tcp.request;
                    params.set("path", request.path.join(','));
                    const index = request.headers.findIndex(header => header.name.toLowerCase() === 'host');
                    if (index >= 0) {
                        const host = request.headers[index].value;
                        params.set("host", host);
                    }
                }
                break;
            case "kcp":
                const kcp = this.stream.kcp;
                params.set("headerType", kcp.type);
                params.set("seed", kcp.seed);
                break;
            case "ws":
                const ws = this.stream.ws;
                params.set("path", ws.path);
                const index = ws.headers.findIndex(header => header.name.toLowerCase() === 'host');
                if (index >= 0) {
                    const host = ws.headers[index].value;
                    params.set("host", host);
                }
                break;
            case "http":
                const http = this.stream.http;
                params.set("path", http.path);
                params.set("host", http.host);
                break;
            case "quic":
                const quic = this.stream.quic;
                params.set("quicSecurity", quic.security);
                params.set("key", quic.key);
                params.set("headerType", quic.type);
                break;
            case "grpc":
                const grpc = this.stream.grpc;
                params.set("serviceName", grpc.serviceName);
                break;
        }

        if (this.stream.security === 'tls') {
            if (!ObjectUtil.isEmpty(this.stream.tls.server)) {
                address = this.stream.tls.server;
                params.set("sni", address);
                params.set("flow", this.settings.vlesses[0].flow);
            }
        }

        if (this.reality) {
            params.set("flow", this.settings.vlesses[0].flow);
        }

        const link = `vless://${uuid}@${address}:${port}`;
        const url = new URL(link);
        for (const [key, value] of params) {
            url.searchParams.set(key, value)
        }
        url.hash = encodeURIComponent(remark);
        return url.toString();
    }

    genSSLink(address = '', remark = '') {
        let settings = this.settings;
        const server = this.stream.tls.server;
        if (!ObjectUtil.isEmpty(server)) {
            address = server;
        }
        if (settings.method == SSMethods.BLAKE3_AES_128_GCM || settings.method == SSMethods.BLAKE3_AES_256_GCM || settings.method == SSMethods.BLAKE3_CHACHA20_POLY1305) {
            return `ss://${settings.method}:${settings.password}@${address}:${this.port}#${encodeURIComponent(remark)}`;
        } else {
            return 'ss://' + safeBase64(settings.method + ':' + settings.password + '@' + address + ':' + this.port)
                + '#' + encodeURIComponent(remark);
        }
    }

    genTrojanLink(address = '', remark = '') {
        let settings = this.settings;
        const port = this.port;
        const type = this.stream.network;
        const params = new Map();
        params.set("type", this.stream.network);
        if (this.reality) {
            params.set("security", "reality");
        } else {
            params.set("security", this.stream.security);
        }
        switch (type) {
            case "tcp":
                const tcp = this.stream.tcp;
                if (tcp.type === 'http') {
                    const request = tcp.request;
                    params.set("path", request.path.join(','));
                    const index = request.headers.findIndex(header => header.name.toLowerCase() === 'host');
                    if (index >= 0) {
                        const host = request.headers[index].value;
                        params.set("host", host);
                    }
                }
                break;
            case "kcp":
                const kcp = this.stream.kcp;
                params.set("headerType", kcp.type);
                params.set("seed", kcp.seed);
                break;
            case "ws":
                const ws = this.stream.ws;
                params.set("path", ws.path);
                const index = ws.headers.findIndex(header => header.name.toLowerCase() === 'host');
                if (index >= 0) {
                    const host = ws.headers[index].value;
                    params.set("host", host);
                }
                break;
            case "http":
                const http = this.stream.http;
                params.set("path", http.path);
                params.set("host", http.host);
                break;
            case "quic":
                const quic = this.stream.quic;
                params.set("quicSecurity", quic.security);
                params.set("key", quic.key);
                params.set("headerType", quic.type);
                break;
            case "grpc":
                const grpc = this.stream.grpc;
                params.set("serviceName", grpc.serviceName);
                break;
        }

        if (this.stream.security === 'tls') {
            if (!ObjectUtil.isEmpty(this.stream.tls.server)) {
                address = this.stream.tls.server;
                params.set("sni", address);
            }
        }
        if (this.reality) {
            params.set("flow", this.settings.clients[0].flow);
        }
        const link = `trojan://${settings.clients[0].password}@${address}:${port}`;
        const url = new URL(link);
        for (const [key, value] of params) {
            url.searchParams.set(key, value)
        }
        url.hash = encodeURIComponent(remark);
        return url.toString();
    }

    genLink(address = '', remark = '') {
        switch (this.protocol) {
            case Protocols.VMESS: return this.genVmessLink(address, remark);
            case Protocols.VLESS: return this.genVLESSLink(address, remark);
            case Protocols.SHADOWSOCKS: return this.genSSLink(address, remark);
            case Protocols.TROJAN: return this.genTrojanLink(address, remark);
            default: return '';
        }
    }

    static fromJson(json = {}) {
        return new Inbound(
            json.port,
            json.listen,
            json.protocol,
            Inbound.Settings.fromJson(json.protocol, json.settings),
            StreamSettings.fromJson(json.streamSettings),
            json.tag,
            Sniffing.fromJson(json.sniffing),
        )
    }

    toJson() {
        let streamSettings;
        if (this.canEnableStream() || this.protocol === Protocols.TROJAN) {
            streamSettings = this.stream.toJson();
        }
        return {
            port: this.port,
            listen: this.listen,
            protocol: this.protocol,
            settings: this.settings instanceof XrayCommonClass ? this.settings.toJson() : this.settings,
            streamSettings: streamSettings,
            tag: this.tag,
            sniffing: this.sniffing.toJson(),
        };
    }
}

Inbound.Settings = class extends XrayCommonClass {
    constructor(protocol) {
        super();
        this.protocol = protocol;
    }

    static getSettings(protocol) {
        switch (protocol) {
            case Protocols.VMESS: return new Inbound.VmessSettings(protocol);
            case Protocols.VLESS: return new Inbound.VLESSSettings(protocol);
            case Protocols.TROJAN: return new Inbound.TrojanSettings(protocol);
            case Protocols.SHADOWSOCKS: return new Inbound.ShadowsocksSettings(protocol);
            case Protocols.DOKODEMO: return new Inbound.DokodemoSettings(protocol);
            case Protocols.MTPROTO: return new Inbound.MtprotoSettings(protocol);
            case Protocols.SOCKS: return new Inbound.SocksSettings(protocol);
            case Protocols.HTTP: return new Inbound.HttpSettings(protocol);
            default: return null;
        }
    }

    static fromJson(protocol, json) {
        switch (protocol) {
            case Protocols.VMESS: return Inbound.VmessSettings.fromJson(json);
            case Protocols.VLESS: return Inbound.VLESSSettings.fromJson(json);
            case Protocols.TROJAN: return Inbound.TrojanSettings.fromJson(json);
            case Protocols.SHADOWSOCKS: return Inbound.ShadowsocksSettings.fromJson(json);
            case Protocols.DOKODEMO: return Inbound.DokodemoSettings.fromJson(json);
            case Protocols.MTPROTO: return Inbound.MtprotoSettings.fromJson(json);
            case Protocols.SOCKS: return Inbound.SocksSettings.fromJson(json);
            case Protocols.HTTP: return Inbound.HttpSettings.fromJson(json);
            default: return null;
        }
    }

    toJson() {
        return {};
    }
};

Inbound.VmessSettings = class extends Inbound.Settings {
    constructor(protocol,
        vmesses = [new Inbound.VmessSettings.Vmess()],
        disableInsecureEncryption = false) {
        super(protocol);
        this.vmesses = vmesses;
        this.disableInsecure = disableInsecureEncryption;
    }

    indexOfVmessById(id) {
        return this.vmesses.findIndex(vmess => vmess.id === id);
    }

    addVmess(vmess) {
        if (this.indexOfVmessById(vmess.id) >= 0) {
            return false;
        }
        this.vmesses.push(vmess);
    }

    delVmess(vmess) {
        const i = this.indexOfVmessById(vmess.id);
        if (i >= 0) {
            this.vmesses.splice(i, 1);
        }
    }

    static fromJson(json = {}) {
        return new Inbound.VmessSettings(
            Protocols.VMESS,
            json.clients.map(client => Inbound.VmessSettings.Vmess.fromJson(client)),
            ObjectUtil.isEmpty(json.disableInsecureEncryption) ? false : json.disableInsecureEncryption,
        );
    }

    toJson() {
        return {
            clients: Inbound.VmessSettings.toJsonArray(this.vmesses),
            disableInsecureEncryption: this.disableInsecure,
        };
    }
};
Inbound.VmessSettings.Vmess = class extends XrayCommonClass {
    constructor(id = RandomUtil.randomUUID(), alterId = 0) {
        super();
        this.id = id;
        this.alterId = alterId;
    }

    static fromJson(json = {}) {
        return new Inbound.VmessSettings.Vmess(
            json.id,
            json.alterId,
        );
    }
};

Inbound.VLESSSettings = class extends Inbound.Settings {
    constructor(protocol,
        vlesses = [new Inbound.VLESSSettings.VLESS()],
        decryption = 'none',
        fallbacks = [],) {
        super(protocol);
        this.vlesses = vlesses;
        this.decryption = decryption;
        this.fallbacks = fallbacks;
    }

    addFallback() {
        this.fallbacks.push(new Inbound.VLESSSettings.Fallback());
    }

    delFallback(index) {
        this.fallbacks.splice(index, 1);
    }

    static fromJson(json = {}) {
        return new Inbound.VLESSSettings(
            Protocols.VLESS,
            json.clients.map(client => Inbound.VLESSSettings.VLESS.fromJson(client)),
            json.decryption,
            Inbound.VLESSSettings.Fallback.fromJson(json.fallbacks),
        );
    }

    toJson() {
        return {
            clients: Inbound.VLESSSettings.toJsonArray(this.vlesses),
            decryption: this.decryption,
            fallbacks: Inbound.VLESSSettings.toJsonArray(this.fallbacks),
        };
    }
};

Inbound.VLESSSettings.VLESS = class extends XrayCommonClass {

    constructor(id = RandomUtil.randomUUID(), flow = "") {
        super();
        this.id = id;
        this.flow = flow;
    }

    static fromJson(json = {}) {
        return new Inbound.VLESSSettings.VLESS(
            json.id,
            json.flow,
        );
    }
};
Inbound.VLESSSettings.Fallback = class extends XrayCommonClass {
    constructor(name = "", alpn = '', path = '', dest = '', xver = 0) {
        super();
        this.name = name;
        this.alpn = alpn;
        this.path = path;
        this.dest = dest;
        this.xver = xver;
    }

    toJson() {
        let xver = this.xver;
        if (!Number.isInteger(xver)) {
            xver = 0;
        }
        return {
            name: this.name,
            alpn: this.alpn,
            path: this.path,
            dest: this.dest,
            xver: xver,
        }
    }

    static fromJson(json = []) {
        const fallbacks = [];
        for (let fallback of json) {
            fallbacks.push(new Inbound.VLESSSettings.Fallback(
                fallback.name,
                fallback.alpn,
                fallback.path,
                fallback.dest,
                fallback.xver,
            ))
        }
        return fallbacks;
    }
};

Inbound.TrojanSettings = class extends Inbound.Settings {
    constructor(protocol,
        clients = [new Inbound.TrojanSettings.Client()],
        fallbacks = [],) {
        super(protocol);
        this.clients = clients;
        this.fallbacks = fallbacks;
    }

    addTrojanFallback() {
        this.fallbacks.push(new Inbound.TrojanSettings.Fallback());
    }

    delTrojanFallback(index) {
        this.fallbacks.splice(index, 1);
    }

    toJson() {
        return {
            clients: Inbound.TrojanSettings.toJsonArray(this.clients),
            fallbacks: Inbound.TrojanSettings.toJsonArray(this.fallbacks),
        };
    }

    static fromJson(json = {}) {
        const clients = [];
        for (const c of json.clients) {
            clients.push(Inbound.TrojanSettings.Client.fromJson(c));
        }
        return new Inbound.TrojanSettings(
            Protocols.TROJAN,
            clients,
            Inbound.TrojanSettings.Fallback.fromJson(json.fallbacks));
    }
};
Inbound.TrojanSettings.Client = class extends XrayCommonClass {
    constructor(password = RandomUtil.randomSeq(10)) {
        super();
        this.password = password;
        //this.flow = flow;
    }

    toJson() {
        return {
            password: this.password,
            // flow: this.flow,
        };
    }

    static fromJson(json = {}) {
        return new Inbound.TrojanSettings.Client(
            json.password,
            // json.flow,
        );
    }

};

Inbound.TrojanSettings.Fallback = class extends XrayCommonClass {
    constructor(name = "", alpn = '', path = '', dest = '', xver = 0) {
        super();
        this.name = name;
        this.alpn = alpn;
        this.path = path;
        this.dest = dest;
        this.xver = xver;
    }

    toJson() {
        let xver = this.xver;
        if (!Number.isInteger(xver)) {
            xver = 0;
        }
        return {
            name: this.name,
            alpn: this.alpn,
            path: this.path,
            dest: this.dest,
            xver: xver,
        }
    }

    static fromJson(json = []) {
        const fallbacks = [];
        for (let fallback of json) {
            fallbacks.push(new Inbound.TrojanSettings.Fallback(
                fallback.name,
                fallback.alpn,
                fallback.path,
                fallback.dest,
                fallback.xver,
            ))
        }
        return fallbacks;
    }
};

Inbound.ShadowsocksSettings = class extends Inbound.Settings {
    constructor(protocol,
        method = SSMethods.AES_256_GCM,
        password = btoa(RandomUtil.randomSeq(64)),
        network = 'tcp,udp'
    ) {
        super(protocol);
        this.method = method;
        this.password = password;
        this.network = network;
    }

    static fromJson(json = {}) {
        return new Inbound.ShadowsocksSettings(
            Protocols.SHADOWSOCKS,
            json.method,
            json.password,
            json.network,
        );
    }

    toJson() {
        return {
            method: this.method,
            password: this.password,
            network: this.network,
        };
    }
};

Inbound.DokodemoSettings = class extends Inbound.Settings {
    constructor(protocol, address, port, network = 'tcp,udp') {
        super(protocol);
        this.address = address;
        this.port = port;
        this.network = network;
    }

    static fromJson(json = {}) {
        return new Inbound.DokodemoSettings(
            Protocols.DOKODEMO,
            json.address,
            json.port,
            json.network,
        );
    }

    toJson() {
        return {
            address: this.address,
            port: this.port,
            network: this.network,
        };
    }
};

Inbound.MtprotoSettings = class extends Inbound.Settings {
    constructor(protocol, users = [new Inbound.MtprotoSettings.MtUser()]) {
        super(protocol);
        this.users = users;
    }

    static fromJson(json = {}) {
        return new Inbound.MtprotoSettings(
            Protocols.MTPROTO,
            json.users.map(user => Inbound.MtprotoSettings.MtUser.fromJson(user)),
        );
    }

    toJson() {
        return {
            users: XrayCommonClass.toJsonArray(this.users),
        };
    }
};
Inbound.MtprotoSettings.MtUser = class extends XrayCommonClass {
    constructor(secret = RandomUtil.randomMTSecret()) {
        super();
        this.secret = secret;
    }

    static fromJson(json = {}) {
        return new Inbound.MtprotoSettings.MtUser(json.secret);
    }
};

Inbound.SocksSettings = class extends Inbound.Settings {
    constructor(protocol, auth = 'password', accounts = [new Inbound.SocksSettings.SocksAccount()], udp = false, ip = '127.0.0.1') {
        super(protocol);
        this.auth = auth;
        this.accounts = accounts;
        this.udp = udp;
        this.ip = ip;
    }

    addAccount(account) {
        this.accounts.push(account);
    }

    delAccount(index) {
        this.accounts.splice(index, 1);
    }

    static fromJson(json = {}) {
        let accounts;
        if (json.auth === 'password') {
            accounts = json.accounts.map(
                account => Inbound.SocksSettings.SocksAccount.fromJson(account)
            )
        }
        return new Inbound.SocksSettings(
            Protocols.SOCKS,
            json.auth,
            accounts,
            json.udp,
            json.ip,
        );
    }

    toJson() {
        return {
            auth: this.auth,
            accounts: this.auth === 'password' ? this.accounts.map(account => account.toJson()) : undefined,
            udp: this.udp,
            ip: this.ip,
        };
    }
};
Inbound.SocksSettings.SocksAccount = class extends XrayCommonClass {
    constructor(user = RandomUtil.randomSeq(10), pass = RandomUtil.randomSeq(10)) {
        super();
        this.user = user;
        this.pass = pass;
    }

    static fromJson(json = {}) {
        return new Inbound.SocksSettings.SocksAccount(json.user, json.pass);
    }
};

Inbound.HttpSettings = class extends Inbound.Settings {
    constructor(protocol, accounts = [new Inbound.HttpSettings.HttpAccount()]) {
        super(protocol);
        this.accounts = accounts;
    }

    addAccount(account) {
        this.accounts.push(account);
    }

    delAccount(index) {
        this.accounts.splice(index, 1);
    }

    static fromJson(json = {}) {
        return new Inbound.HttpSettings(
            Protocols.HTTP,
            json.accounts.map(account => Inbound.HttpSettings.HttpAccount.fromJson(account)),
        );
    }

    toJson() {
        return {
            accounts: Inbound.HttpSettings.toJsonArray(this.accounts),
        };
    }
};

Inbound.HttpSettings.HttpAccount = class extends XrayCommonClass {
    constructor(user = RandomUtil.randomSeq(10), pass = RandomUtil.randomSeq(10)) {
        super();
        this.user = user;
        this.pass = pass;
    }

    static fromJson(json = {}) {
        return new Inbound.HttpSettings.HttpAccount(json.user, json.pass);
    }
};
