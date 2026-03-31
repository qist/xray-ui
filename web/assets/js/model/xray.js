const Protocols = {
    VMESS: 'vmess',
    VLESS: 'vless',
    TROJAN: 'trojan',
    SHADOWSOCKS: 'shadowsocks',
    DOKODEMO: 'dokodemo-door',
    SOCKS: 'socks',
    HTTP: 'http',
    HYSTERIA: 'hysteria',
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
    AES_128_GCM: "TLS_AES_128_GCM_SHA256",
    AES_256_GCM: "TLS_AES_256_GCM_SHA384",
    CHACHA20_POLY1305: "TLS_CHACHA20_POLY1305_SHA256",
    ECDHE_ECDSA_AES_128_CBC: "TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA",
    ECDHE_ECDSA_AES_256_CBC: "TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA",
    ECDHE_ECDSA_AES_128_GCM: "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256",
    ECDHE_ECDSA_AES_256_GCM: "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384",
    ECDHE_RSA_AES_128_GCM: "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
    ECDHE_RSA_AES_256_GCM: "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
    ECDHE_ECDSA_CHACHA20_POLY1305: "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256",
    ECDHE_RSA_CHACHA20_POLY1305: "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256",
};

const ALPN_OPTION = {
    H3: "h3",
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
    UseIPv6v4: "UseIPv6v4",
    UseIPv4v6: "UseIPv4v6",
    ForceIP: "ForceIP",
    ForceIPv6v4: "ForceIPv6v4",
    ForceIPv6: "ForceIPv6",
    ForceIPv4v6: "ForceIPv4v6",
    ForceIPv4: "ForceIPv4",
}

const UTLS_FINGERPRINT = {
    UTLS_CHROME: "chrome",
    UTLS_FIREFOX: "firefox",
    UTLS_SAFARI: "safari",
    UTLS_IOS: "ios",
    UTLS_android: "android",
    UTLS_EDGE: "edge",
    UTLS_360: "360",
    UTLS_QQ: "qq",
    UTLS_RANDOM: "random",
    UTLS_RANDOMIZED: "randomized",
};

const USAGE_OPTION = {
    ENCIPHERMENT: "encipherment",
    VERIFY: "verify",
    ISSUE: "issue",
};

const SNIFFING_OPTION = {
    HTTP: "http",
    TLS: "tls",
    QUIC: "quic",
    FAKEDNS: "fakedns"
};

const MODE_OPTION = {
    AUTO: "auto",
    PACKET_UP: "packet-up",
    STREAM_UP: "stream-up",
    STREAM_ONE: "stream-one",
};

Object.freeze(Protocols);
Object.freeze(VmessMethods);
Object.freeze(SSMethods);
Object.freeze(RULE_IP);
Object.freeze(RULE_DOMAIN);
Object.freeze(FLOW_VISION);
Object.freeze(TLS_VERSION_OPTION);
Object.freeze(TLS_CIPHER_OPTION);
Object.freeze(ALPN_OPTION);
Object.freeze(USAGE_OPTION);
Object.freeze(TCP_CONGESTION);
Object.freeze(DOMAIN_STRATEGY);
Object.freeze(SNIFFING_OPTION);
Object.freeze(MODE_OPTION);

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

class GrpcStreamSettings extends XrayCommonClass {
    constructor(
        serviceName = "",
        authority = "",
        multiMode = false,
    ) {
        super();
        this.serviceName = serviceName;
        this.authority = authority;
        this.multiMode = multiMode;
    }

    static fromJson(json = {}) {
        return new GrpcStreamSettings(
            json.serviceName,
            json.authority,
            json.multiMode);
    }

    toJson() {
        return {
            serviceName: this.serviceName,
            authority: this.authority,
            multiMode: this.multiMode,
        }
    }
}

class HttpUpgradeStreamSettings extends XrayCommonClass {
    constructor(acceptProxyProtocol = false, path = '/', host = '', headers = []) {
        super();
        this.acceptProxyProtocol = acceptProxyProtocol;
        this.path = path;
        this.host = host;
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
        return new HttpUpgradeStreamSettings(
            json.acceptProxyProtocol,
            json.path,
            json.host,
            XrayCommonClass.toHeaders(json.headers),
        );
    }

    toJson() {
        return {
            acceptProxyProtocol: this.acceptProxyProtocol,
            path: this.path,
            host: this.host,
            headers: XrayCommonClass.toV2Headers(this.headers, false),
        };
    }
}

class xHTTPStreamSettings extends XrayCommonClass {
    constructor(
        path = '/',
        host = '',
        headers = [],
        scMaxEachPostBytes = 1000000,
        scMaxBufferedPosts = 100,
        scMinPostsIntervalMs = 30,
        noSSEHeader = false,
        xPaddingBytes = "100-1000",
        scStreamUpServerSecs = "20-80",
        xmux = {
            maxConnections: '16-32',
            maxConcurrency: 0,
            cMaxReuseTimes: '64-128',
            cMaxLifetimeMs: 0,
            hMaxRequestTimes: '800-900',
            hKeepAlivePeriod: 45,
        },
        mode = MODE_OPTION.AUTO,
        noGRPCHeader = false,
    ) {
        super();
        this.path = path;
        this.host = host;
        this.headers = headers;
        this.scMaxEachPostBytes = scMaxEachPostBytes;
        this.scMaxBufferedPosts = scMaxBufferedPosts;
        this.scMinPostsIntervalMs = scMinPostsIntervalMs;
        this.noSSEHeader = noSSEHeader;
        this.xPaddingBytes = RandomUtil.convertXPaddingBytes(xPaddingBytes);
        this.scStreamUpServerSecs = RandomUtil.convertXPaddingBytes(scStreamUpServerSecs);
        this.xmux = xmux;
        this.mode = mode;
        this.noGRPCHeader = noGRPCHeader;
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
        return new xHTTPStreamSettings(
            json.path,
            json.host,
            XrayCommonClass.toHeaders(json.headers),
            json.scMaxEachPostBytes,
            json.scMaxBufferedPosts,
            json.scMinPostsIntervalMs,
            json.noSSEHeader,
            json.xPaddingBytes,
            json.scStreamUpServerSecs,
            json.xmux,
            json.mode,
            json.noGRPCHeader,
        );
    }

    toJson() {
        const xmuxData = {};
        if (!ObjectUtil.isEmpty(this.xmux.maxConnections)) {
            xmuxData.maxConnections = RandomUtil.convertXPaddingBytes(this.xmux.maxConnections);
        }
        if (!ObjectUtil.isEmpty(this.xmux.maxConcurrency)) {
            xmuxData.maxConcurrency = RandomUtil.convertXPaddingBytes(this.xmux.maxConcurrency);
        }
        xmuxData.cMaxReuseTimes = RandomUtil.convertXPaddingBytes(this.xmux.cMaxReuseTimes);
        xmuxData.cMaxLifetimeMs = RandomUtil.convertXPaddingBytes(this.xmux.cMaxLifetimeMs);
        xmuxData.hMaxRequestTimes = RandomUtil.convertXPaddingBytes(this.xmux.hMaxRequestTimes);
        xmuxData.hKeepAlivePeriod = RandomUtil.convertXPaddingBytes(this.xmux.hKeepAlivePeriod);
        return {
            path: this.path,
            host: this.host,
            headers: XrayCommonClass.toV2Headers(this.headers, false),
            scMaxEachPostBytes: this.scMaxEachPostBytes,
            scMaxBufferedPosts: this.scMaxBufferedPosts,
            scMinPostsIntervalMs: this.scMinPostsIntervalMs,
            noSSEHeader: this.noSSEHeader,
            xPaddingBytes: RandomUtil.convertXPaddingBytes(this.xPaddingBytes),
            scStreamUpServerSecs: RandomUtil.convertXPaddingBytes(this.scStreamUpServerSecs),
            xmux: xmuxData,
            mode: this.mode,
            noGRPCHeader: this.noGRPCHeader,
        };
    }
}

class HysteriaStreamSettings extends XrayCommonClass {
    constructor(
        version = 2,
        auth = RandomUtil.randomSeq(16),
        udpIdleTimeout = 60,
        masquerade = new HysteriaStreamSettings.Masquerade(),
        portHopping = new HysteriaStreamSettings.PortHopping(),
    ) {
        super();
        this.version = version;
        this.auth = ObjectUtil.isEmpty(auth) ? RandomUtil.randomSeq(16) : auth;
        this.udpIdleTimeout = udpIdleTimeout;
        this.masquerade = masquerade;
        this.portHopping = portHopping;
    }

    refreshAuth() {
        this.auth = RandomUtil.randomSeq(16);
    }

    static fromJson(json = {}) {
        return new HysteriaStreamSettings(
            json.version,
            json.auth,
            json.udpIdleTimeout,
            HysteriaStreamSettings.Masquerade.fromJson(json.masquerade),
            HysteriaStreamSettings.PortHopping.fromJson(json.portHopping),
        );
    }

    toJson() {
        return {
            version: this.version,
            auth: this.auth,
            udpIdleTimeout: this.udpIdleTimeout,
            masquerade: this.masquerade.toJson(),
            portHopping: this.portHopping.toJson(),
        };
    }
}

HysteriaStreamSettings.PortHopping = class extends XrayCommonClass {
    constructor(
        enabled = false,
        mode = 'preset',
        preset = '20000-50000',
        ports = '20000-50000',
    ) {
        super();
        this.enabled = enabled;
        this.mode = mode;
        this.preset = ObjectUtil.isEmpty(preset) ? '20000-50000' : preset;
        this.ports = ObjectUtil.isEmpty(ports) ? this.preset : ports;
    }

    syncPorts() {
        if (this.mode === 'preset') {
            this.ports = this.preset;
        }
    }

    setPreset(preset) {
        this.preset = preset;
        this.syncPorts();
    }

    static fromJson(json = {}) {
        return new HysteriaStreamSettings.PortHopping(
            ObjectUtil.isEmpty(json.enabled) ? false : json.enabled,
            ObjectUtil.isEmpty(json.mode) ? 'preset' : json.mode,
            ObjectUtil.isEmpty(json.preset) ? '20000-50000' : json.preset,
            ObjectUtil.isEmpty(json.ports) ? '20000-50000' : json.ports,
        );
    }

    toJson() {
        if (!this.enabled) {
            return undefined;
        }
        this.syncPorts();
        return {
            enabled: this.enabled,
            mode: this.mode,
            preset: this.preset,
            ports: this.ports,
        };
    }
};

HysteriaStreamSettings.Masquerade = class extends XrayCommonClass {
    constructor(
        type = '',
        dir = '',
        url = '',
        rewriteHost = false,
        insecure = false,
        content = '',
        headers = [],
        statusCode = 0,
    ) {
        super();
        this.type = type;
        this.dir = dir;
        this.url = url;
        this.rewriteHost = rewriteHost;
        this.insecure = insecure;
        this.content = content;
        this.headers = headers;
        this.statusCode = statusCode;
    }

    addHeader(name, value) {
        this.headers.push({ name: name, value: value });
    }

    removeHeader(index) {
        this.headers.splice(index, 1);
    }

    static fromJson(json = {}) {
        return new HysteriaStreamSettings.Masquerade(
            json.type,
            json.dir,
            json.url,
            json.rewriteHost,
            json.insecure,
            json.content,
            XrayCommonClass.toHeaders(json.headers),
            json.statusCode,
        );
    }

    toJson() {
        return {
            type: this.type,
            dir: this.dir,
            url: this.url,
            rewriteHost: this.rewriteHost,
            insecure: this.insecure,
            content: this.content,
            headers: XrayCommonClass.toV2Headers(this.headers, false),
            statusCode: this.statusCode,
        };
    }
};

class FinalMaskSettings extends XrayCommonClass {
    constructor(
        tcp = [],
        udp = [],
        quicParams = new FinalMaskSettings.QuicParams(),
    ) {
        super();
        this.tcp = tcp;
        this.udp = udp;
        this.quicParams = quicParams;
    }

    addTcpMask(type = '', settings = new FinalMaskSettings.Mask.Settings()) {
        this.tcp.push(new FinalMaskSettings.Mask(type, settings));
    }

    removeTcpMask(index) {
        this.tcp.splice(index, 1);
    }

    addUdpMask(type = '', settings = new FinalMaskSettings.Mask.Settings()) {
        this.udp.push(new FinalMaskSettings.Mask(type, settings));
    }

    removeUdpMask(index) {
        this.udp.splice(index, 1);
    }

    get isEmpty() {
        return this.tcp.filter(mask => !ObjectUtil.isEmpty(mask.type)).length === 0
            && this.udp.filter(mask => !ObjectUtil.isEmpty(mask.type)).length === 0
            && (this.quicParams == undefined || this.quicParams.isEmpty);
    }

    static fromJson(json = {}) {
        const tcp = ObjectUtil.isEmpty(json.tcp) ? [] : json.tcp.map(mask => FinalMaskSettings.Mask.fromJson(mask, 'tcp'));
        const udp = ObjectUtil.isEmpty(json.udp) ? [] : json.udp.map(mask => FinalMaskSettings.Mask.fromJson(mask, 'udp'));
        return new FinalMaskSettings(
            tcp,
            udp,
            FinalMaskSettings.QuicParams.fromJson(json.quicParams),
        );
    }

    toJson() {
        const tcp = this.tcp.filter(mask => !ObjectUtil.isEmpty(mask.type)).map(mask => mask.toJson('tcp'));
        const udp = this.udp.filter(mask => !ObjectUtil.isEmpty(mask.type)).map(mask => mask.toJson('udp'));
        return {
            tcp: tcp,
            udp: udp,
            quicParams: this.quicParams.toJson(),
        };
    }
}

FinalMaskSettings.Mask = class extends XrayCommonClass {
    constructor(
        type = '',
        settings = new FinalMaskSettings.Mask.Settings(),
    ) {
        super();
        this.type = type;
        this.settings = settings;
    }

    setType(type) {
        this.type = type;
        if (ObjectUtil.isEmpty(this.settings)) {
            this.settings = new FinalMaskSettings.Mask.Settings();
        }
        this.settings.ensureType(type);
    }

    static fromJson(json = {}, protocol = '') {
        return new FinalMaskSettings.Mask(
            json.type,
            FinalMaskSettings.Mask.Settings.fromJson(json.settings, json.type, protocol),
        );
    }

    toJson(protocol = '') {
        return {
            type: this.type,
            settings: this.settings.toJson(this.type, protocol),
        };
    }

    summary(protocol = '') {
        if (ObjectUtil.isEmpty(this.type)) {
            return '';
        }
        const settings = this.settings;
        switch (this.type) {
            case 'header-custom':
                if (protocol === 'udp') {
                    return `header-custom(client:${settings.udpHeaderCustom.client.length}, server:${settings.udpHeaderCustom.server.length})`;
                }
                return `header-custom(clients:${settings.tcpHeaderCustom.clients.length}, servers:${settings.tcpHeaderCustom.servers.length}, errors:${settings.tcpHeaderCustom.errors.length})`;
            case 'fragment':
                return `fragment(${settings.fragment.packets}, len:${settings.fragment.length}, delay:${settings.fragment.delay}, maxSplit:${settings.fragment.maxSplit})`;
            case 'sudoku': {
                const customTables = settings.sudoku.customTables.filter(value => !ObjectUtil.isEmpty(value)).length;
                const hasPassword = !ObjectUtil.isEmpty(settings.sudoku.password) ? 'yes' : 'no';
                return `sudoku(password:${hasPassword}, table:${settings.sudoku.customTable ? 'yes' : 'no'}, tables:${customTables}, padding:${settings.sudoku.paddingMin}-${settings.sudoku.paddingMax})`;
            }
            case 'header-dns':
                return `header-dns(${settings.headerDns.domain})`;
            case 'mkcp-aes128gcm':
                return `mkcp-aes128gcm(password:${ObjectUtil.isEmpty(settings.mkcpAes128Gcm.password) ? 'no' : 'yes'})`;
            case 'noise':
                return `noise(reset:${settings.noise.reset}, items:${settings.noise.noise.length})`;
            case 'salamander':
                return `salamander(password:${ObjectUtil.isEmpty(settings.salamander.password) ? 'no' : 'yes'})`;
            case 'xdns':
                return `xdns(${settings.xdns.domain})`;
            case 'xicmp':
                return `xicmp(${settings.xicmp.listenIp}, id:${settings.xicmp.id})`;
            case 'header-dtls':
            case 'header-srtp':
            case 'header-utp':
            case 'header-wechat':
            case 'header-wireguard':
            case 'mkcp-original':
                return `${this.type}(default)`;
            default:
                return this.type;
        }
    }
};

FinalMaskSettings.Mask.Settings = class extends XrayCommonClass {
    constructor(
        entries = [],
        tcpHeaderCustom = new FinalMaskSettings.Mask.Settings.HeaderCustom(),
        udpHeaderCustom = new FinalMaskSettings.Mask.Settings.UdpHeaderCustom(),
        fragment = new FinalMaskSettings.Mask.Settings.Fragment(),
        sudoku = new FinalMaskSettings.Mask.Settings.Sudoku(),
        headerDns = new FinalMaskSettings.Mask.Settings.DomainSetting(),
        mkcpAes128Gcm = new FinalMaskSettings.Mask.Settings.PasswordSetting(),
        noise = new FinalMaskSettings.Mask.Settings.Noise(),
        salamander = new FinalMaskSettings.Mask.Settings.PasswordSetting(),
        xdns = new FinalMaskSettings.Mask.Settings.DomainSetting(),
        xicmp = new FinalMaskSettings.Mask.Settings.Xicmp(),
    ) {
        super();
        this.entries = entries;
        this.tcpHeaderCustom = tcpHeaderCustom;
        this.udpHeaderCustom = udpHeaderCustom;
        this.fragment = fragment;
        this.sudoku = sudoku;
        this.headerDns = headerDns;
        this.mkcpAes128Gcm = mkcpAes128Gcm;
        this.noise = noise;
        this.salamander = salamander;
        this.xdns = xdns;
        this.xicmp = xicmp;
    }

    ensureType(type) {
        switch (type) {
            case 'header-custom':
                if (ObjectUtil.isEmpty(this.tcpHeaderCustom)) {
                    this.tcpHeaderCustom = new FinalMaskSettings.Mask.Settings.HeaderCustom();
                }
                if (ObjectUtil.isEmpty(this.udpHeaderCustom)) {
                    this.udpHeaderCustom = new FinalMaskSettings.Mask.Settings.UdpHeaderCustom();
                }
                break;
            case 'fragment':
                if (ObjectUtil.isEmpty(this.fragment)) {
                    this.fragment = new FinalMaskSettings.Mask.Settings.Fragment();
                }
                break;
            case 'sudoku':
                if (ObjectUtil.isEmpty(this.sudoku)) {
                    this.sudoku = new FinalMaskSettings.Mask.Settings.Sudoku();
                }
                break;
            case 'header-dns':
                if (ObjectUtil.isEmpty(this.headerDns)) {
                    this.headerDns = new FinalMaskSettings.Mask.Settings.DomainSetting();
                }
                break;
            case 'mkcp-aes128gcm':
                if (ObjectUtil.isEmpty(this.mkcpAes128Gcm)) {
                    this.mkcpAes128Gcm = new FinalMaskSettings.Mask.Settings.PasswordSetting();
                }
                break;
            case 'noise':
                if (ObjectUtil.isEmpty(this.noise)) {
                    this.noise = new FinalMaskSettings.Mask.Settings.Noise();
                }
                break;
            case 'salamander':
                if (ObjectUtil.isEmpty(this.salamander)) {
                    this.salamander = new FinalMaskSettings.Mask.Settings.PasswordSetting();
                }
                break;
            case 'xdns':
                if (ObjectUtil.isEmpty(this.xdns)) {
                    this.xdns = new FinalMaskSettings.Mask.Settings.DomainSetting();
                }
                break;
            case 'xicmp':
                if (ObjectUtil.isEmpty(this.xicmp)) {
                    this.xicmp = new FinalMaskSettings.Mask.Settings.Xicmp();
                }
                break;
        }
    }

    addEntry(name = '', value = '') {
        this.entries.push({ name: name, value: value });
    }

    removeEntry(index) {
        this.entries.splice(index, 1);
    }

    static parseValue(value) {
        if (ObjectUtil.isEmpty(value)) {
            return '';
        }
        const trimValue = value.trim();
        const canUseJson = trimValue === 'true'
            || trimValue === 'false'
            || trimValue === 'null'
            || /^-?\d+(\.\d+)?$/.test(trimValue)
            || ((trimValue.startsWith('{') && trimValue.endsWith('}'))
                || (trimValue.startsWith('[') && trimValue.endsWith(']')));
        if (canUseJson) {
            try {
                return JSON.parse(trimValue);
            } catch (e) {
            }
        }
        return value;
    }

    static fromJson(json = {}, type = '', protocol = '') {
        if (type === 'header-custom') {
            return new FinalMaskSettings.Mask.Settings(
                [],
                protocol === 'tcp' ? FinalMaskSettings.Mask.Settings.HeaderCustom.fromJson(json) : new FinalMaskSettings.Mask.Settings.HeaderCustom(),
                protocol === 'udp' ? FinalMaskSettings.Mask.Settings.UdpHeaderCustom.fromJson(json) : new FinalMaskSettings.Mask.Settings.UdpHeaderCustom(),
            );
        }
        if (type === 'fragment') {
            return new FinalMaskSettings.Mask.Settings(
                [],
                new FinalMaskSettings.Mask.Settings.HeaderCustom(),
                new FinalMaskSettings.Mask.Settings.UdpHeaderCustom(),
                FinalMaskSettings.Mask.Settings.Fragment.fromJson(json),
            );
        }
        if (type === 'sudoku') {
            return new FinalMaskSettings.Mask.Settings(
                [],
                new FinalMaskSettings.Mask.Settings.HeaderCustom(),
                new FinalMaskSettings.Mask.Settings.UdpHeaderCustom(),
                new FinalMaskSettings.Mask.Settings.Fragment(),
                FinalMaskSettings.Mask.Settings.Sudoku.fromJson(json),
            );
        }
        if (type === 'header-dns') {
            return new FinalMaskSettings.Mask.Settings(
                [],
                new FinalMaskSettings.Mask.Settings.HeaderCustom(),
                new FinalMaskSettings.Mask.Settings.UdpHeaderCustom(),
                new FinalMaskSettings.Mask.Settings.Fragment(),
                new FinalMaskSettings.Mask.Settings.Sudoku(),
                FinalMaskSettings.Mask.Settings.DomainSetting.fromJson(json),
            );
        }
        if (type === 'mkcp-aes128gcm') {
            return new FinalMaskSettings.Mask.Settings(
                [],
                new FinalMaskSettings.Mask.Settings.HeaderCustom(),
                new FinalMaskSettings.Mask.Settings.UdpHeaderCustom(),
                new FinalMaskSettings.Mask.Settings.Fragment(),
                new FinalMaskSettings.Mask.Settings.Sudoku(),
                new FinalMaskSettings.Mask.Settings.DomainSetting(),
                FinalMaskSettings.Mask.Settings.PasswordSetting.fromJson(json),
            );
        }
        if (type === 'noise') {
            return new FinalMaskSettings.Mask.Settings(
                [],
                new FinalMaskSettings.Mask.Settings.HeaderCustom(),
                new FinalMaskSettings.Mask.Settings.UdpHeaderCustom(),
                new FinalMaskSettings.Mask.Settings.Fragment(),
                new FinalMaskSettings.Mask.Settings.Sudoku(),
                new FinalMaskSettings.Mask.Settings.DomainSetting(),
                new FinalMaskSettings.Mask.Settings.PasswordSetting(),
                FinalMaskSettings.Mask.Settings.Noise.fromJson(json),
            );
        }
        if (type === 'salamander') {
            return new FinalMaskSettings.Mask.Settings(
                [],
                new FinalMaskSettings.Mask.Settings.HeaderCustom(),
                new FinalMaskSettings.Mask.Settings.UdpHeaderCustom(),
                new FinalMaskSettings.Mask.Settings.Fragment(),
                new FinalMaskSettings.Mask.Settings.Sudoku(),
                new FinalMaskSettings.Mask.Settings.DomainSetting(),
                new FinalMaskSettings.Mask.Settings.PasswordSetting(),
                new FinalMaskSettings.Mask.Settings.Noise(),
                FinalMaskSettings.Mask.Settings.PasswordSetting.fromJson(json),
            );
        }
        if (type === 'xdns') {
            return new FinalMaskSettings.Mask.Settings(
                [],
                new FinalMaskSettings.Mask.Settings.HeaderCustom(),
                new FinalMaskSettings.Mask.Settings.UdpHeaderCustom(),
                new FinalMaskSettings.Mask.Settings.Fragment(),
                new FinalMaskSettings.Mask.Settings.Sudoku(),
                new FinalMaskSettings.Mask.Settings.DomainSetting(),
                new FinalMaskSettings.Mask.Settings.PasswordSetting(),
                new FinalMaskSettings.Mask.Settings.Noise(),
                new FinalMaskSettings.Mask.Settings.PasswordSetting(),
                FinalMaskSettings.Mask.Settings.DomainSetting.fromJson(json),
            );
        }
        if (type === 'xicmp') {
            return new FinalMaskSettings.Mask.Settings(
                [],
                new FinalMaskSettings.Mask.Settings.HeaderCustom(),
                new FinalMaskSettings.Mask.Settings.UdpHeaderCustom(),
                new FinalMaskSettings.Mask.Settings.Fragment(),
                new FinalMaskSettings.Mask.Settings.Sudoku(),
                new FinalMaskSettings.Mask.Settings.DomainSetting(),
                new FinalMaskSettings.Mask.Settings.PasswordSetting(),
                new FinalMaskSettings.Mask.Settings.Noise(),
                new FinalMaskSettings.Mask.Settings.PasswordSetting(),
                new FinalMaskSettings.Mask.Settings.DomainSetting(),
                FinalMaskSettings.Mask.Settings.Xicmp.fromJson(json),
            );
        }
        if (FinalMaskSettings.Mask.Settings.noSettingsTypes().includes(type)) {
            return new FinalMaskSettings.Mask.Settings();
        }
        const entries = [];
        Object.keys(ObjectUtil.isEmpty(json) ? {} : json).forEach(key => {
            const value = json[key];
            entries.push({
                name: key,
                value: typeof value === 'object' && value !== null ? JSON.stringify(value) : `${value}`,
            });
        });
        return new FinalMaskSettings.Mask.Settings(entries);
    }

    static noSettingsTypes() {
        return ['header-dtls', 'header-srtp', 'header-utp', 'header-wechat', 'header-wireguard', 'mkcp-original'];
    }

    toJson(type = '', protocol = '') {
        if (type === 'header-custom') {
            return protocol === 'udp' ? this.udpHeaderCustom.toJson() : this.tcpHeaderCustom.toJson();
        }
        if (type === 'fragment') {
            return this.fragment.toJson();
        }
        if (type === 'sudoku') {
            return this.sudoku.toJson();
        }
        if (type === 'header-dns') {
            return this.headerDns.toJson();
        }
        if (type === 'mkcp-aes128gcm') {
            return this.mkcpAes128Gcm.toJson();
        }
        if (type === 'noise') {
            return this.noise.toJson();
        }
        if (type === 'salamander') {
            return this.salamander.toJson();
        }
        if (type === 'xdns') {
            return this.xdns.toJson();
        }
        if (type === 'xicmp') {
            return this.xicmp.toJson();
        }
        if (FinalMaskSettings.Mask.Settings.noSettingsTypes().includes(type)) {
            return {};
        }
        const json = {};
        this.entries.forEach(entry => {
            if (ObjectUtil.isEmpty(entry.name)) {
                return;
            }
            json[entry.name] = FinalMaskSettings.Mask.Settings.parseValue(entry.value);
        });
        return json;
    }
};

FinalMaskSettings.Mask.Settings.HeaderCustom = class extends XrayCommonClass {
    constructor(
        clients = [[new FinalMaskSettings.Mask.Settings.HeaderCustom.PacketSetting()]],
        servers = [[new FinalMaskSettings.Mask.Settings.HeaderCustom.PacketSetting()]],
        errors = [[new FinalMaskSettings.Mask.Settings.HeaderCustom.PacketSetting()]],
    ) {
        super();
        this.clients = clients;
        this.servers = servers;
        this.errors = errors;
    }

    static defaultGroup() {
        return [new FinalMaskSettings.Mask.Settings.HeaderCustom.PacketSetting()];
    }

    addClientsGroup() {
        this.clients.push(FinalMaskSettings.Mask.Settings.HeaderCustom.defaultGroup());
    }

    removeClientsGroup(index) {
        if (this.clients.length <= 1) {
            this.clients.splice(0, 1, FinalMaskSettings.Mask.Settings.HeaderCustom.defaultGroup());
            return;
        }
        this.clients.splice(index, 1);
    }

    addClient(index) {
        this.clients[index].push(new FinalMaskSettings.Mask.Settings.HeaderCustom.PacketSetting());
    }

    removeClient(groupIndex, index) {
        if (this.clients[groupIndex].length <= 1) {
            this.clients[groupIndex].splice(0, 1, new FinalMaskSettings.Mask.Settings.HeaderCustom.PacketSetting());
            return;
        }
        this.clients[groupIndex].splice(index, 1);
    }

    addServersGroup() {
        this.servers.push(FinalMaskSettings.Mask.Settings.HeaderCustom.defaultGroup());
    }

    removeServersGroup(index) {
        if (this.servers.length <= 1) {
            this.servers.splice(0, 1, FinalMaskSettings.Mask.Settings.HeaderCustom.defaultGroup());
            return;
        }
        this.servers.splice(index, 1);
    }

    addServer(index) {
        this.servers[index].push(new FinalMaskSettings.Mask.Settings.HeaderCustom.PacketSetting());
    }

    removeServer(groupIndex, index) {
        if (this.servers[groupIndex].length <= 1) {
            this.servers[groupIndex].splice(0, 1, new FinalMaskSettings.Mask.Settings.HeaderCustom.PacketSetting());
            return;
        }
        this.servers[groupIndex].splice(index, 1);
    }

    addErrorsGroup() {
        this.errors.push(FinalMaskSettings.Mask.Settings.HeaderCustom.defaultGroup());
    }

    removeErrorsGroup(index) {
        if (this.errors.length <= 1) {
            this.errors.splice(0, 1, FinalMaskSettings.Mask.Settings.HeaderCustom.defaultGroup());
            return;
        }
        this.errors.splice(index, 1);
    }

    addError(index) {
        this.errors[index].push(new FinalMaskSettings.Mask.Settings.HeaderCustom.PacketSetting());
    }

    removeError(groupIndex, index) {
        if (this.errors[groupIndex].length <= 1) {
            this.errors[groupIndex].splice(0, 1, new FinalMaskSettings.Mask.Settings.HeaderCustom.PacketSetting());
            return;
        }
        this.errors[groupIndex].splice(index, 1);
    }

    static fromJson(json = {}) {
        const toGroups = groups => {
            if (ObjectUtil.isEmpty(groups) || groups.length === 0) {
                return [FinalMaskSettings.Mask.Settings.HeaderCustom.defaultGroup()];
            }
            return groups.map(group => {
                if (ObjectUtil.isEmpty(group) || group.length === 0) {
                    return FinalMaskSettings.Mask.Settings.HeaderCustom.defaultGroup();
                }
                return group.map(setting => FinalMaskSettings.Mask.Settings.HeaderCustom.PacketSetting.fromJson(setting));
            });
        };
        return new FinalMaskSettings.Mask.Settings.HeaderCustom(
            toGroups(json.clients),
            toGroups(json.servers),
            toGroups(json.errors),
        );
    }

    toJson() {
        return {
            clients: this.clients.map(group => group.map(setting => setting.toJson())),
            servers: this.servers.map(group => group.map(setting => setting.toJson())),
            errors: this.errors.map(group => group.map(setting => setting.toJson())),
        };
    }
};

FinalMaskSettings.Mask.Settings.HeaderCustom.PacketSetting = class extends XrayCommonClass {
    constructor(
        delay = 0,
        rand = 0,
        randRange = '0-255',
        type = 'array',
        packet = [],
    ) {
        super();
        this.delay = delay;
        this.rand = rand;
        this.randRange = randRange;
        this.type = type;
        this.packet = packet;
    }

    setRand(value = 0) {
        this.rand = ObjectUtil.isEmpty(value) ? 0 : value;
        if (this.rand > 0) {
            this.packet = [];
        }
    }

    addPacket(value = '') {
        this.rand = 0;
        this.packet.push(value);
    }

    removePacket(index) {
        this.packet.splice(index, 1);
    }

    static fromJson(json = {}) {
        return new FinalMaskSettings.Mask.Settings.HeaderCustom.PacketSetting(
            ObjectUtil.isEmpty(json.delay) ? 0 : json.delay,
            ObjectUtil.isEmpty(json.rand) ? 0 : json.rand,
            ObjectUtil.isEmpty(json.randRange) ? '0-255' : json.randRange,
            ObjectUtil.isEmpty(json.type) ? 'array' : json.type,
            ObjectUtil.isEmpty(json.packet) ? [] : json.packet,
        );
    }

    toJson() {
        return {
            delay: this.delay,
            rand: this.rand,
            randRange: this.randRange,
            type: this.type,
            packet: ObjectUtil.clone(this.packet),
        };
    }
};

FinalMaskSettings.Mask.Settings.UdpHeaderCustom = class extends XrayCommonClass {
    constructor(
        client = [new FinalMaskSettings.Mask.Settings.UdpHeaderCustom.PacketSetting()],
        server = [new FinalMaskSettings.Mask.Settings.UdpHeaderCustom.PacketSetting()],
    ) {
        super();
        this.client = client;
        this.server = server;
    }

    addClient() {
        this.client.push(new FinalMaskSettings.Mask.Settings.UdpHeaderCustom.PacketSetting());
    }

    removeClient(index) {
        if (this.client.length <= 1) {
            this.client.splice(0, 1, new FinalMaskSettings.Mask.Settings.UdpHeaderCustom.PacketSetting());
            return;
        }
        this.client.splice(index, 1);
    }

    addServer() {
        this.server.push(new FinalMaskSettings.Mask.Settings.UdpHeaderCustom.PacketSetting());
    }

    removeServer(index) {
        if (this.server.length <= 1) {
            this.server.splice(0, 1, new FinalMaskSettings.Mask.Settings.UdpHeaderCustom.PacketSetting());
            return;
        }
        this.server.splice(index, 1);
    }

    static fromJson(json = {}) {
        const toSettings = settings => {
            if (ObjectUtil.isEmpty(settings) || settings.length === 0) {
                return [new FinalMaskSettings.Mask.Settings.UdpHeaderCustom.PacketSetting()];
            }
            return settings.map(setting => FinalMaskSettings.Mask.Settings.UdpHeaderCustom.PacketSetting.fromJson(setting));
        };
        return new FinalMaskSettings.Mask.Settings.UdpHeaderCustom(
            toSettings(json.client),
            toSettings(json.server),
        );
    }

    toJson() {
        return {
            client: this.client.map(setting => setting.toJson()),
            server: this.server.map(setting => setting.toJson()),
        };
    }
};

FinalMaskSettings.Mask.Settings.UdpHeaderCustom.PacketSetting = class extends XrayCommonClass {
    constructor(
        rand = 0,
        randRange = '0-255',
        type = 'array',
        packet = [],
    ) {
        super();
        this.rand = rand;
        this.randRange = randRange;
        this.type = type;
        this.packet = packet;
    }

    setRand(value = 0) {
        this.rand = ObjectUtil.isEmpty(value) ? 0 : value;
        if (this.rand > 0) {
            this.packet = [];
        }
    }

    addPacket(value = '') {
        this.rand = 0;
        this.packet.push(value);
    }

    removePacket(index) {
        this.packet.splice(index, 1);
    }

    static fromJson(json = {}) {
        return new FinalMaskSettings.Mask.Settings.UdpHeaderCustom.PacketSetting(
            ObjectUtil.isEmpty(json.rand) ? 0 : json.rand,
            ObjectUtil.isEmpty(json.randRange) ? '0-255' : json.randRange,
            ObjectUtil.isEmpty(json.type) ? 'array' : json.type,
            ObjectUtil.isEmpty(json.packet) ? [] : json.packet,
        );
    }

    toJson() {
        return {
            rand: this.rand,
            randRange: this.randRange,
            type: this.type,
            packet: ObjectUtil.clone(this.packet),
        };
    }
};

FinalMaskSettings.Mask.Settings.Fragment = class extends XrayCommonClass {
    constructor(
        packets = 'tlshello',
        length = '100-200',
        delay = '10-20',
        maxSplit = '3-6',
    ) {
        super();
        this.packets = packets;
        this.length = length;
        this.delay = delay;
        this.maxSplit = maxSplit;
    }

    static fromJson(json = {}) {
        return new FinalMaskSettings.Mask.Settings.Fragment(
            ObjectUtil.isEmpty(json.packets) ? 'tlshello' : json.packets,
            ObjectUtil.isEmpty(json.length) ? '100-200' : json.length,
            ObjectUtil.isEmpty(json.delay) ? '10-20' : json.delay,
            ObjectUtil.isEmpty(json.maxSplit) ? '3-6' : json.maxSplit,
        );
    }

    toJson() {
        return {
            packets: this.packets,
            length: this.length,
            delay: this.delay,
            maxSplit: this.maxSplit,
        };
    }
};

FinalMaskSettings.Mask.Settings.Sudoku = class extends XrayCommonClass {
    constructor(
        password = RandomUtil.randomSeq(16),
        ascii = '',
        customTable = '',
        customTables = [''],
        paddingMin = 0,
        paddingMax = 0,
    ) {
        super();
        this.password = password;
        this.ascii = ascii;
        this.customTable = customTable;
        this.customTables = customTables;
        this.paddingMin = paddingMin;
        this.paddingMax = paddingMax;
    }

    refreshPassword() {
        this.password = RandomUtil.randomSeq(16);
    }

    addCustomTable(value = '') {
        this.customTables.push(value);
    }

    removeCustomTable(index) {
        if (this.customTables.length <= 1) {
            this.customTables.splice(0, 1, '');
            return;
        }
        this.customTables.splice(index, 1);
    }

    static fromJson(json = {}) {
        return new FinalMaskSettings.Mask.Settings.Sudoku(
            ObjectUtil.isEmpty(json.password) ? RandomUtil.randomSeq(16) : json.password,
            json.ascii,
            json.customTable,
            ObjectUtil.isEmpty(json.customTables) || json.customTables.length === 0 ? [''] : json.customTables,
            ObjectUtil.isEmpty(json.paddingMin) ? 0 : json.paddingMin,
            ObjectUtil.isEmpty(json.paddingMax) ? 0 : json.paddingMax,
        );
    }

    toJson() {
        return {
            password: this.password,
            ascii: this.ascii,
            customTable: this.customTable,
            customTables: ObjectUtil.clone(this.customTables),
            paddingMin: this.paddingMin,
            paddingMax: this.paddingMax,
        };
    }
};

FinalMaskSettings.Mask.Settings.DomainSetting = class extends XrayCommonClass {
    constructor(domain = 'www.example.com') {
        super();
        this.domain = domain;
    }

    static fromJson(json = {}) {
        return new FinalMaskSettings.Mask.Settings.DomainSetting(
            ObjectUtil.isEmpty(json.domain) ? 'www.example.com' : json.domain,
        );
    }

    toJson() {
        return {
            domain: this.domain,
        };
    }
};

FinalMaskSettings.Mask.Settings.PasswordSetting = class extends XrayCommonClass {
    constructor(password = RandomUtil.randomSeq(16)) {
        super();
        this.password = password;
    }

    refreshPassword() {
        this.password = RandomUtil.randomSeq(16);
    }

    static fromJson(json = {}) {
        return new FinalMaskSettings.Mask.Settings.PasswordSetting(
            ObjectUtil.isEmpty(json.password) ? RandomUtil.randomSeq(16) : json.password,
        );
    }

    toJson() {
        return {
            password: this.password,
        };
    }
};

FinalMaskSettings.Mask.Settings.Noise = class extends XrayCommonClass {
    constructor(
        reset = 0,
        noise = [new FinalMaskSettings.Mask.Settings.Noise.PacketSetting()],
    ) {
        super();
        this.reset = reset;
        this.noise = noise;
    }

    addNoise() {
        this.noise.push(new FinalMaskSettings.Mask.Settings.Noise.PacketSetting());
    }

    removeNoise(index) {
        if (this.noise.length <= 1) {
            this.noise.splice(0, 1, new FinalMaskSettings.Mask.Settings.Noise.PacketSetting());
            return;
        }
        this.noise.splice(index, 1);
    }

    static fromJson(json = {}) {
        return new FinalMaskSettings.Mask.Settings.Noise(
            ObjectUtil.isEmpty(json.reset) ? 0 : json.reset,
            ObjectUtil.isEmpty(json.noise) || json.noise.length === 0
                ? [new FinalMaskSettings.Mask.Settings.Noise.PacketSetting()]
                : json.noise.map(setting => FinalMaskSettings.Mask.Settings.Noise.PacketSetting.fromJson(setting)),
        );
    }

    toJson() {
        return {
            reset: this.reset,
            noise: this.noise.map(setting => setting.toJson()),
        };
    }
};

FinalMaskSettings.Mask.Settings.Noise.PacketSetting = class extends XrayCommonClass {
    constructor(
        rand = '1-8192',
        randRange = '0-255',
        type = 'array',
        packet = [],
        delay = '10-20',
    ) {
        super();
        this.rand = rand;
        this.randRange = randRange;
        this.type = type;
        this.packet = packet;
        this.delay = delay;
    }

    setRand(value = '1-8192') {
        this.rand = ObjectUtil.isEmpty(value) ? '1-8192' : value;
        if (!ObjectUtil.isEmpty(this.rand)) {
            this.packet = [];
        }
    }

    addPacket(value = '') {
        this.rand = '';
        this.packet.push(value);
    }

    removePacket(index) {
        this.packet.splice(index, 1);
    }

    static fromJson(json = {}) {
        return new FinalMaskSettings.Mask.Settings.Noise.PacketSetting(
            ObjectUtil.isEmpty(json.rand) ? '1-8192' : json.rand,
            ObjectUtil.isEmpty(json.randRange) ? '0-255' : json.randRange,
            ObjectUtil.isEmpty(json.type) ? 'array' : json.type,
            ObjectUtil.isEmpty(json.packet) ? [] : json.packet,
            ObjectUtil.isEmpty(json.delay) ? '10-20' : json.delay,
        );
    }

    toJson() {
        return {
            rand: this.rand,
            randRange: this.randRange,
            type: this.type,
            packet: ObjectUtil.clone(this.packet),
            delay: this.delay,
        };
    }
};

FinalMaskSettings.Mask.Settings.Xicmp = class extends XrayCommonClass {
    constructor(
        listenIp = '0.0.0.0',
        id = 0,
    ) {
        super();
        this.listenIp = listenIp;
        this.id = id;
    }

    static fromJson(json = {}) {
        return new FinalMaskSettings.Mask.Settings.Xicmp(
            ObjectUtil.isEmpty(json.listenIp) ? '0.0.0.0' : json.listenIp,
            ObjectUtil.isEmpty(json.id) ? 0 : json.id,
        );
    }

    toJson() {
        return {
            listenIp: this.listenIp,
            id: this.id,
        };
    }
};

FinalMaskSettings.QuicParams = class extends XrayCommonClass {
    constructor(
        congestion = 'force-brutal',
        debug = false,
        brutalUp = '60 mbps',
        brutalDown = '0',
        udpHop = new FinalMaskSettings.QuicParams.UdpHop(),
        initStreamReceiveWindow = 8388608,
        maxStreamReceiveWindow = 8388608,
        initConnectionReceiveWindow = 20971520,
        maxConnectionReceiveWindow = 20971520,
        maxIdleTimeout = 30,
        keepAlivePeriod = 0,
        disablePathMTUDiscovery = false,
        maxIncomingStreams = 1024,
    ) {
        super();
        this.congestion = congestion;
        this.debug = debug;
        this.brutalUp = brutalUp;
        this.brutalDown = brutalDown;
        this.udpHop = udpHop;
        this.initStreamReceiveWindow = initStreamReceiveWindow;
        this.maxStreamReceiveWindow = maxStreamReceiveWindow;
        this.initConnectionReceiveWindow = initConnectionReceiveWindow;
        this.maxConnectionReceiveWindow = maxConnectionReceiveWindow;
        this.maxIdleTimeout = maxIdleTimeout;
        this.keepAlivePeriod = keepAlivePeriod;
        this.disablePathMTUDiscovery = disablePathMTUDiscovery;
        this.maxIncomingStreams = maxIncomingStreams;
    }

    static fromJson(json = {}) {
        return new FinalMaskSettings.QuicParams(
            ObjectUtil.isEmpty(json.congestion) ? 'force-brutal' : json.congestion,
            ObjectUtil.isEmpty(json.debug) ? false : json.debug,
            ObjectUtil.isEmpty(json.brutalUp) ? '60 mbps' : json.brutalUp,
            ObjectUtil.isEmpty(json.brutalDown) ? '0' : json.brutalDown,
            FinalMaskSettings.QuicParams.UdpHop.fromJson(json.udpHop),
            ObjectUtil.isEmpty(json.initStreamReceiveWindow) ? 8388608 : json.initStreamReceiveWindow,
            ObjectUtil.isEmpty(json.maxStreamReceiveWindow) ? 8388608 : json.maxStreamReceiveWindow,
            ObjectUtil.isEmpty(json.initConnectionReceiveWindow) ? 20971520 : json.initConnectionReceiveWindow,
            ObjectUtil.isEmpty(json.maxConnectionReceiveWindow) ? 20971520 : json.maxConnectionReceiveWindow,
            ObjectUtil.isEmpty(json.maxIdleTimeout) ? 30 : json.maxIdleTimeout,
            ObjectUtil.isEmpty(json.keepAlivePeriod) ? 0 : json.keepAlivePeriod,
            ObjectUtil.isEmpty(json.disablePathMTUDiscovery) ? false : json.disablePathMTUDiscovery,
            ObjectUtil.isEmpty(json.maxIncomingStreams) ? 1024 : json.maxIncomingStreams,
        );
    }

    get isEmpty() {
        const defaults = new FinalMaskSettings.QuicParams();
        return this.congestion === defaults.congestion
            && this.debug === defaults.debug
            && this.brutalUp === defaults.brutalUp
            && this.brutalDown === defaults.brutalDown
            && this.initStreamReceiveWindow === defaults.initStreamReceiveWindow
            && this.maxStreamReceiveWindow === defaults.maxStreamReceiveWindow
            && this.initConnectionReceiveWindow === defaults.initConnectionReceiveWindow
            && this.maxConnectionReceiveWindow === defaults.maxConnectionReceiveWindow
            && this.maxIdleTimeout === defaults.maxIdleTimeout
            && this.keepAlivePeriod === defaults.keepAlivePeriod
            && this.disablePathMTUDiscovery === defaults.disablePathMTUDiscovery
            && this.maxIncomingStreams === defaults.maxIncomingStreams
            && this.udpHop != undefined
            && this.udpHop.isEmpty;
    }

    toJson() {
        return {
            congestion: this.congestion,
            debug: this.debug,
            brutalUp: this.brutalUp,
            brutalDown: this.brutalDown,
            udpHop: this.udpHop.toJson(),
            initStreamReceiveWindow: this.initStreamReceiveWindow,
            maxStreamReceiveWindow: this.maxStreamReceiveWindow,
            initConnectionReceiveWindow: this.initConnectionReceiveWindow,
            maxConnectionReceiveWindow: this.maxConnectionReceiveWindow,
            maxIdleTimeout: this.maxIdleTimeout,
            keepAlivePeriod: this.keepAlivePeriod,
            disablePathMTUDiscovery: this.disablePathMTUDiscovery,
            maxIncomingStreams: this.maxIncomingStreams,
        };
    }

    summary() {
        return `congestion:${this.congestion}, up:${this.brutalUp}, down:${this.brutalDown}, udpHop:${this.udpHop.ports}/${this.udpHop.interval}`;
    }
};

FinalMaskSettings.QuicParams.UdpHop = class extends XrayCommonClass {
    constructor(
        ports = '20000-50000',
        interval = '5-10',
    ) {
        super();
        this.ports = ports;
        this.interval = interval;
    }

    static fromJson(json = {}) {
        return new FinalMaskSettings.QuicParams.UdpHop(
            ObjectUtil.isEmpty(json.ports) ? '20000-50000' : json.ports,
            ObjectUtil.isEmpty(json.interval) ? '5-10' : json.interval,
        );
    }

    get isEmpty() {
        return this.ports === '20000-50000' && this.interval === '5-10';
    }

    toJson() {
        return {
            ports: this.ports,
            interval: this.interval,
        };
    }
};

class TlsStreamSettings extends XrayCommonClass {
    constructor(serverName = '',
        rejectUnknownSni = false,
        minVersion = TLS_VERSION_OPTION.TLS10,
        maxVersion = TLS_VERSION_OPTION.TLS12,
        cipherSuites = '',
        certificates = [new TlsStreamSettings.Cert()],
        alpn = [''],
        echServerKeys = '',
        echForceQuery = 'none',
        settings = [new TlsStreamSettings.Settings()]) {
        super();
        this.sni = serverName;
        this.rejectUnknownSni = rejectUnknownSni;
        this.minVersion = minVersion;
        this.maxVersion = maxVersion;
        this.cipherSuites = cipherSuites instanceof Array ? cipherSuites.join(':') : cipherSuites.split(':');
        this.certs = certificates;
        this.alpn = alpn;
        this.echServerKeys = echServerKeys;
        this.echForceQuery = echForceQuery;
        this.settings = TlsStreamSettings.normalizeSettings(settings);
    }

    static normalizeSettings(settings) {
        let values = settings;
        if (!(values instanceof Array)) {
            values = ObjectUtil.isEmpty(values) ? [new TlsStreamSettings.Settings()] : [values];
        }
        if (values.length === 0) {
            values.push(new TlsStreamSettings.Settings());
        }
        if (!(values[0] instanceof TlsStreamSettings.Settings)) {
            values[0] = TlsStreamSettings.Settings.fromJson(values[0]);
        }
        Object.defineProperty(values, 'fingerprint', {
            get() {
                return this[0].fingerprint;
            },
            set(value) {
                this[0].fingerprint = value;
            },
            configurable: true,
        });
        Object.defineProperty(values, 'echConfigList', {
            get() {
                return this[0].echConfigList;
            },
            set(value) {
                this[0].echConfigList = value;
            },
            configurable: true,
        });
        return values;
    }

    addCert(cert = new TlsStreamSettings.Cert()) {
        this.certs.push(cert);
    }

    removeCert(index) {
        this.certs.splice(index, 1);
    }

    static fromJson(json = {}) {
        let certs;
        let settings = [new TlsStreamSettings.Settings()];
        if (!ObjectUtil.isEmpty(json.certificates)) {
            certs = json.certificates.map(cert => TlsStreamSettings.Cert.fromJson(cert));
        }

        if (!ObjectUtil.isEmpty(json.settings)) {
            let value = json.settings[0] || json.settings;
            settings = [TlsStreamSettings.Settings.fromJson(value)];
        }

        return new TlsStreamSettings(
            json.serverName,
            json.rejectUnknownSni,
            json.minVersion,
            json.maxVersion,
            json.cipherSuites,
            certs,
            json.alpn,
            json.echServerKeys,
            json.echForceQuery,
            settings,
        );
    }

    toJson() {
        return {
            serverName: this.sni,
            rejectUnknownSni: this.rejectUnknownSni,
            minVersion: this.minVersion,
            maxVersion: this.maxVersion,
            cipherSuites: this.cipherSuites instanceof Array ? this.cipherSuites.join(':') : this.cipherSuites.split(':'),
            certificates: TlsStreamSettings.toJsonArray(this.certs),
            alpn: this.alpn,
            echServerKeys: this.echServerKeys,
            echForceQuery: this.echForceQuery,
            settings: TlsStreamSettings.toJsonArray(this.settings),
        };
    }
}

TlsStreamSettings.Cert = class extends XrayCommonClass {
    constructor(useFile = true,
        ocspStapling = 3600,
        certificateFile = '',
        keyFile = '',
        certificate = '',
        key = '',
        oneTimeLoading = false,
        usage = USAGE_OPTION.ENCIPHERMENT,
        buildChain = false,
    ) {
        super();
        this.useFile = useFile;
        this.ocspStapling = ocspStapling;
        this.certFile = certificateFile;
        this.keyFile = keyFile;
        this.cert = certificate instanceof Array ? certificate.join('\n') : certificate;
        this.key = key instanceof Array ? key.join('\n') : key;
        this.oneTimeLoading = oneTimeLoading;
        this.usage = usage;
        this.buildChain = buildChain

    }

    static fromJson(json = {}) {
        if ('certificateFile' in json && 'keyFile' in json) {
            return new TlsStreamSettings.Cert(
                true,
                json.ocspStapling,
                json.certificateFile,
                json.keyFile,
                '',
                '',
                json.oneTimeLoading,
                json.usage,
                json.buildChain,
            );
        } else {
            return new TlsStreamSettings.Cert(
                false,
                json.ocspStapling,
                '', '',
                json.certificate.join('\n'),
                json.key.join('\n'),
                json.oneTimeLoading,
                json.usage,
                json.buildChain,
            );
        }
    }

    toJson() {
        if (this.useFile) {
            return {
                ocspStapling: this.ocspStapling,
                certificateFile: this.certFile,
                keyFile: this.keyFile,
                oneTimeLoading: this.oneTimeLoading,
                usage: this.usage,
                buildChain: this.buildChain,
            };
        } else {
            return {
                ocspStapling: this.ocspStapling,
                certificate: this.cert.split('\n'),
                key: this.key.split('\n'),
                oneTimeLoading: this.oneTimeLoading,
                usage: this.usage,
                buildChain: this.buildChain,
            };
        }
    }
};

TlsStreamSettings.Settings = class extends XrayCommonClass {
    constructor(
        fingerprint = UTLS_FINGERPRINT.UTLS_CHROME,
        echConfigList = '',
    ) {
        super();
        this.fingerprint = fingerprint;
        this.echConfigList = echConfigList;
    }
    static fromJson(json = {}) {
        return new TlsStreamSettings.Settings(
            json.fingerprint,
            json.echConfigList,
        );
    }
    toJson() {
        return {
            fingerprint: this.fingerprint,
            echConfigList: this.echConfigList
        };
    }
};

class ReaLITyStreamSettings extends XrayCommonClass {
    constructor(show = false,
        fingerprint = UTLS_FINGERPRINT.UTLS_CHROME,
        target = 'www.lovelive-anime.jp:443',
        xver = 0,
        serverNames = 'lovelive-anime.jp\nwww.lovelive-anime.jp',
        privateKey = '',
        publicKey = '',
        mldsa65Seed = '',
        mldsa65Verify = '',
        minClientVer = '',
        maxClientVer = '',
        maxTimeDiff = 0,
        shortIds = RandomUtil.randowShortId(),
    ) {
        super();
        this.show = show;
        this.fingerprint = fingerprint;
        this.target = target;
        this.xver = xver;
        this.serverNames = serverNames instanceof Array ? serverNames.join('\n') : serverNames;
        this.privateKey = privateKey
        this.publicKey = publicKey
        this.mldsa65Seed = mldsa65Seed;
        this.mldsa65Verify = mldsa65Verify;
        this.minClientVer = minClientVer;
        this.maxClientVer = maxClientVer;
        this.maxTimeDiff = maxTimeDiff;
        this.shortIds = shortIds instanceof Array ? shortIds.join('\n') : shortIds;

    }

    refreshShortIds() {
        this.shortIds = RandomUtil.randowShortId();
    }

    static fromJson(json = {}) {
        return new ReaLITyStreamSettings(
            json.show,
            json.fingerprint,
            json.target,
            json.xver,
            json.serverNames,
            json.privateKey,
            json.publicKey,
            json.mldsa65Seed,
            json.mldsa65Verify,
            json.minClientVer,
            json.maxClientVer,
            json.maxTimeDiff,
            json.shortIds,
        );
    }

    toJson() {
        return {
            show: this.show,
            fingerprint: this.fingerprint,
            target: this.target,
            xver: this.xver,
            serverNames: this.serverNames.split('\n'),
            privateKey: this.privateKey,
            publicKey: this.publicKey,
            mldsa65Seed: this.mldsa65Seed,
            mldsa65Verify: this.mldsa65Verify,
            minClientVer: this.minClientVer,
            maxClientVer: this.maxClientVer,
            maxTimeDiff: this.maxTimeDiff,
            shortIds: this.shortIds.split('\n'),
        };
    }
}

class SockoptStreamSettings extends XrayCommonClass {
    constructor(mark = 0,
        tcpMaxSeg = 1440,
        tcpFastOpen = false,
        tproxy = "off",
        domainStrategy = DOMAIN_STRATEGY.AsIs,
        dialerProxy = "",
        acceptProxyProtocol = false,
        tcpKeepAliveInterval = 0,
        tcpKeepAliveIdle = 0,
        tcpUserTimeout = 10000,
        tcpcongestion = "",
        _interface = "",
        V6Only = false,
        tcpWindowClamp = 600,
        TcpMptcp = true,
        tcpNoDelay = false,
    ) {
        super();
        this.mark = mark;
        this.tcpMaxSeg = tcpMaxSeg;
        this.tcpFastOpen = tcpFastOpen;
        this.tproxy = tproxy;
        this.domainStrategy = domainStrategy;
        this.dialerProxy = dialerProxy;
        this.acceptProxyProtocol = acceptProxyProtocol;
        this.tcpKeepAliveInterval = tcpKeepAliveInterval;
        this.tcpKeepAliveIdle = tcpKeepAliveIdle;
        this.tcpUserTimeout = tcpUserTimeout;
        this.tcpcongestion = tcpcongestion;
        this.interface = _interface instanceof Array ? this.interface : _interface;
        this.V6Only = V6Only;
        this.tcpWindowClamp = tcpWindowClamp;
        this.TcpMptcp = TcpMptcp;
        this.tcpNoDelay = tcpNoDelay;
    }

    static fromJson(json = {}) {
        if (Object.keys(json).length === 0) return undefined;
        return new SockoptStreamSettings(
            json.mark,
            json.tcpMaxSeg,
            json.tcpFastOpen,
            json.tproxy,
            json.domainStrategy,
            json.dialerProxy,
            json.acceptProxyProtocol,
            json.tcpKeepAliveInterval,
            json.tcpKeepAliveIdle,
            json.tcpUserTimeout,
            json.tcpcongestion,
            json.interface,
            json.V6Only,
            json.tcpWindowClamp,
            json.TcpMptcp,
            json.tcpNoDelay,
        );
    }

    toJson() {
        return {
            mark: this.mark,
            tcpMaxSeg: this.tcpMaxSeg,
            tcpFastOpen: this.tcpFastOpen,
            tproxy: this.tproxy,
            domainStrategy: this.domainStrategy,
            dialerProxy: this.dialerProxy,
            acceptProxyProtocol: this.acceptProxyProtocol,
            tcpKeepAliveInterval: this.tcpKeepAliveInterval,
            tcpKeepAliveIdle: this.tcpKeepAliveIdle,
            tcpUserTimeout: this.tcpUserTimeout,
            tcpcongestion: this.tcpcongestion,
            interface: this.interface,
            V6Only: this.V6Only,
            tcpWindowClamp: this.tcpWindowClamp,
            TcpMptcp: this.TcpMptcp,
            tcpNoDelay: this.tcpNoDelay,
        };
    }
}


class StreamSettings extends XrayCommonClass {
    constructor(network = 'tcp',
        security = 'none',
        tlsSettings = new TlsStreamSettings(),
        realitySettings = new ReaLITyStreamSettings(),
        tcpSettings = new TcpStreamSettings(),
        rawSettings = new TcpStreamSettings(),
        kcpSettings = new KcpStreamSettings(),
        wsSettings = new WsStreamSettings(),
        grpcSettings = new GrpcStreamSettings(),
        httpupgradeSettings = new HttpUpgradeStreamSettings(),
        xhttpSettings = new xHTTPStreamSettings(),
        hysteriaSettings = new HysteriaStreamSettings(),
        finalmaskSettings = new FinalMaskSettings(),
        sockopt = undefined,
        finalmaskSwitch = false,
    ) {
        super();
        this.network = network;
        this.security = security;
        this.tls = tlsSettings;
        this.reality = realitySettings;
        this.tcp = tcpSettings;
        this.raw = rawSettings;
        this.kcp = kcpSettings;
        this.ws = wsSettings;
        this.grpc = grpcSettings;
        this.httpupgrade = httpupgradeSettings;
        this.xhttp = xhttpSettings;
        this.hysteria = hysteriaSettings;
        this.finalmask = finalmaskSettings;
        this.sockopt = sockopt;
        this._finalmaskSwitch = finalmaskSwitch || (this.finalmask != undefined && !this.finalmask.isEmpty);
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

    get sockoptSwitch() {
        return this.sockopt != undefined;
    }

    set sockoptSwitch(value) {
        this.sockopt = value ? new SockoptStreamSettings() : undefined;
    }

    get finalmaskSwitch() {
        return this._finalmaskSwitch;
    }

    set finalmaskSwitch(value) {
        this._finalmaskSwitch = value;
        if (value && this.finalmask == undefined) {
            this.finalmask = new FinalMaskSettings();
        }
    }

    static fromJson(json = {}) {
        const finalmask = FinalMaskSettings.fromJson(json.finalmask);
        return new StreamSettings(
            json.network,
            json.security,
            TlsStreamSettings.fromJson(json.tlsSettings),
            ReaLITyStreamSettings.fromJson(json.realitySettings),
            TcpStreamSettings.fromJson(json.tcpSettings),
            TcpStreamSettings.fromJson(json.rawSettings),
            KcpStreamSettings.fromJson(json.kcpSettings),
            WsStreamSettings.fromJson(json.wsSettings),
            GrpcStreamSettings.fromJson(json.grpcSettings),
            HttpUpgradeStreamSettings.fromJson(json.httpupgradeSettings),
            xHTTPStreamSettings.fromJson(json.xhttpSettings),
            HysteriaStreamSettings.fromJson(json.hysteriaSettings),
            finalmask,
            SockoptStreamSettings.fromJson(json.sockopt),
            !finalmask.isEmpty,
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
            rawSettings: network === 'raw' ? this.raw.toJson() : undefined,
            kcpSettings: network === 'kcp' ? this.kcp.toJson() : undefined,
            wsSettings: network === 'ws' ? this.ws.toJson() : undefined,
            grpcSettings: network === 'grpc' ? this.grpc.toJson() : undefined,
            httpupgradeSettings: network === 'httpupgrade' ? this.httpupgrade.toJson() : undefined,
            xhttpSettings: network === 'xhttp' ? this.xhttp.toJson() : undefined,
            hysteriaSettings: network === 'hysteria' ? this.hysteria.toJson() : undefined,
            finalmask: this.finalmaskSwitch && this.finalmask != undefined && !this.finalmask.isEmpty ? this.finalmask.toJson() : undefined,
            sockopt: this.sockopt != undefined ? this.sockopt.toJson() : undefined,
        };
    }
}

class Sniffing extends XrayCommonClass {
    constructor(
        enabled = false,
        destOverride = ['http', 'tls', 'quic', 'fakedns'],
        metadataOnly = false,
        domainsExcluded = [],
        routeOnly = false
    ) {
        super();
        this.enabled = enabled;
        this.destOverride = destOverride;
        this.metadataOnly = metadataOnly;
        this.domainsExcluded = Array.isArray(domainsExcluded)
            ? domainsExcluded.join('\n')
            : (typeof domainsExcluded === 'string' ? domainsExcluded : '');
        this.routeOnly = routeOnly;
    }

    static fromJson(json = {}) {
        let destOverride = ObjectUtil.clone(json.destOverride);
        if (!ObjectUtil.isEmpty(destOverride) && !ObjectUtil.isArrEmpty(destOverride)) {
            if (ObjectUtil.isEmpty(destOverride[0])) {
                destOverride = ['http', 'tls', 'quic', 'fakedns'];
            }
        }

        let domainsExcluded = json.domainsExcluded;
        if (typeof domainsExcluded === 'string') {
            domainsExcluded = domainsExcluded.split('\n').map(s => s.trim()).filter(Boolean);
        }

        return new Sniffing(
            !!json.enabled,
            destOverride,
            json.metadataOnly,
            domainsExcluded,
            json.routeOnly
        );
    }

    toJson() {
        return {
            enabled: this.enabled,
            destOverride: this.destOverride,
            metadataOnly: this.metadataOnly,
            domainsExcluded: typeof this.domainsExcluded === 'string'
                ? this.domainsExcluded.split('\n').map(s => s.trim()).filter(Boolean)
                : [],
            routeOnly: this.routeOnly,
        };
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
        this.syncHysteriaAuth();
    }

    get protocol() {
        return this._protocol;
    }

    set protocol(protocol) {
        this._protocol = protocol;
        this.settings = Inbound.Settings.getSettings(protocol);
        if (protocol === Protocols.TROJAN) {
            if (this.network === "tcp" || this.network === "raw") {
                this.tls = true;
            }
        }
        if (protocol === Protocols.HYSTERIA) {
            this.stream.network = 'hysteria';
            this.reality = false;
            this.tls = true;
            this.syncHysteriaAuth();
        }
    }

    syncHysteriaAuth() {
        if (this.protocol !== Protocols.HYSTERIA || ObjectUtil.isEmpty(this.stream?.hysteria) || ObjectUtil.isEmpty(this.settings?.clients) || this.settings.clients.length === 0) {
            return;
        }
        let auth = this.settings.clients[0].auth;
        if (ObjectUtil.isEmpty(auth)) {
            auth = this.stream.hysteria.auth;
        }
        if (ObjectUtil.isEmpty(auth)) {
            auth = RandomUtil.randomUUID();
        }
        this.settings.clients[0].auth = auth;
        this.stream.hysteria.auth = auth;
    }

    get tls() {
        return this.stream.security === 'tls';
    }

    set tls(isTls) {
        if (isTls) {
            this.stream.security = 'tls';
            if (this.protocol === Protocols.VLESS) {
                this.authentication = false;
            }
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
            if (this.protocol === Protocols.VLESS) {
                this.authentication = false;
            }
        } else {
            this.stream.security = 'none';
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
    get isRaw() {
        return this.network === "raw";
    }
    get isWs() {
        return this.network === "ws";
    }

    get isKcp() {
        return this.network === "kcp";
    }

    get isGrpc() {
        return this.network === "grpc";
    }

    get isHttpupgrade() {
        return this.network === "httpupgrade";
    }
    get isXHTTP() {
        return this.network === "xhttp";
    }
    get isHysteria() {
        return this.network === "hysteria";
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

    get hysteriaAuth() {
        switch (this.protocol) {
            case Protocols.HYSTERIA:
                this.syncHysteriaAuth();
                return this.settings.clients[0].auth;
            default:
                return "";
        }
    }

    set hysteriaAuth(auth) {
        if (this.protocol !== Protocols.HYSTERIA) {
            return;
        }
        const value = ObjectUtil.isEmpty(auth) ? '' : auth;
        this.settings.clients[0].auth = value;
        this.stream.hysteria.auth = value;
    }

    refreshHysteriaAuth() {
        if (this.protocol !== Protocols.HYSTERIA) {
            return;
        }
        this.settings.clients[0].refreshAuth();
        this.stream.hysteria.auth = this.settings.clients[0].auth;
    }

    get hysteriaMasqueradeType() {
        if (this.stream.hysteria && this.stream.hysteria.masquerade) {
            return this.stream.hysteria.masquerade.type;
        }
        return "";
    }

    get hysteriaPortHoppingPorts() {
        if (this.stream.hysteria && this.stream.hysteria.portHopping && this.stream.hysteria.portHopping.enabled) {
            return this.stream.hysteria.portHopping.ports;
        }
        return "";
    }

    get hysteriaUdpMaskType() {
        if (!this.stream.finalmaskSwitch) {
            return "";
        }
        if (this.stream.finalmask && this.stream.finalmask.udp.length > 0) {
            return this.stream.finalmask.udp[0].type;
        }
        return "";
    }

    get finalmaskTcpMaskTypes() {
        if (!this.stream.finalmaskSwitch) {
            return "";
        }
        if (!this.stream.finalmask || this.stream.finalmask.tcp.length === 0) {
            return "";
        }
        return this.stream.finalmask.tcp
            .map(mask => mask.type)
            .filter(type => !ObjectUtil.isEmpty(type))
            .join(', ');
    }

    get finalmaskTcpMaskDetails() {
        if (!this.stream.finalmaskSwitch) {
            return "";
        }
        if (!this.stream.finalmask || this.stream.finalmask.tcp.length === 0) {
            return "";
        }
        return this.stream.finalmask.tcp
            .map(mask => mask.summary('tcp'))
            .filter(summary => !ObjectUtil.isEmpty(summary))
            .join(' | ');
    }

    get finalmaskUdpMaskTypes() {
        if (!this.stream.finalmaskSwitch) {
            return "";
        }
        if (!this.stream.finalmask || this.stream.finalmask.udp.length === 0) {
            return "";
        }
        return this.stream.finalmask.udp
            .map(mask => mask.type)
            .filter(type => !ObjectUtil.isEmpty(type))
            .join(', ');
    }

    get finalmaskUdpMaskDetails() {
        if (!this.stream.finalmaskSwitch) {
            return "";
        }
        if (!this.stream.finalmask || this.stream.finalmask.udp.length === 0) {
            return "";
        }
        return this.stream.finalmask.udp
            .map(mask => mask.summary('udp'))
            .filter(summary => !ObjectUtil.isEmpty(summary))
            .join(' | ');
    }

    get finalmaskQuicCongestion() {
        if (!this.stream.finalmaskSwitch) {
            return "";
        }
        if (this.stream.finalmask && this.stream.finalmask.quicParams) {
            return this.stream.finalmask.quicParams.congestion;
        }
        return "";
    }

    get finalmaskQuicSummary() {
        if (!this.stream.finalmaskSwitch) {
            return "";
        }
        if (this.stream.finalmask && this.stream.finalmask.quicParams) {
            return this.stream.finalmask.quicParams.summary();
        }
        return "";
    }

    get finalmaskUdpHopPorts() {
        if (!this.stream.finalmaskSwitch) {
            return "";
        }
        if (this.stream.finalmask && this.stream.finalmask.quicParams && this.stream.finalmask.quicParams.udpHop) {
            return this.stream.finalmask.quicParams.udpHop.ports;
        }
        return "";
    }

    get hysteriaTcpMaskTypes() {
        return this.finalmaskTcpMaskTypes;
    }

    get hysteriaUdpMaskTypes() {
        return this.finalmaskUdpMaskTypes;
    }

    get hysteriaQuicCongestion() {
        return this.finalmaskQuicCongestion;
    }

    get hysteriaUdpHopPorts() {
        return this.finalmaskUdpHopPorts;
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
            return this.stream.tls.sni;
        }
        return "";
    }

    get host() {
        if (this.isTcp) {
            return this.stream.tcp.request.getHeader("Host");
        } else if (this.isRaw) {
            return this.stream.raw.request.getHeader("Host");
        } else if (this.isWs) {
            return this.stream.ws.getHeader("Host");
        } else if (this.isH2) {
            return this.stream.http.host[0];
        } else if (this.isHttpupgrade) {
            return this.stream.httpupgrade.host;
        } else if (this.isXHTTP) {
            return this.stream.xhttp.host;
        }
        return null;
    }

    get path() {
        if (this.isTcp) {
            return this.stream.tcp.request.path[0];
        } else if (this.isRaw) {
            return this.stream.raw.request.path[0];
        } else if (this.isWs) {
            return this.stream.ws.path;
        } else if (this.isH2) {
            return this.stream.http.path[0];
        } else if (this.isHttpupgrade) {
            return this.stream.httpupgrade.path;
        } else if (this.isXHTTP) {
            return this.stream.xhttp.path;
        }
        return null;
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
            case Protocols.HYSTERIA:
                break;
            default:
                return false;
        }

        switch (this.network) {
            case "tcp":
            case "raw":
            case "ws":
            case "grpc":
            case "httpupgrade":
            case "xhttp":
            case "hysteria":
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
                break;
            default:
                return false;
        }
        return ['tcp', 'raw', 'grpc', 'httpupgrade', 'xhttp'].indexOf(this.network) !== -1;
        //return this.network === "tcp";
    }

    canEnableAuthentication() {
        return this.protocol === Protocols.VLESS && ['tcp', 'raw', 'xhttp', 'grpc'].indexOf(this.network) !== -1;
    }

    get authentication() {
        return this.protocol === Protocols.VLESS && !ObjectUtil.isEmpty(this.settings.selectedAuth);
    }

    set authentication(enabled) {
        if (this.protocol !== Protocols.VLESS) {
            return;
        }

        if (enabled) {
            if (!this.settings.selectedAuth) {
                this.settings.selectedAuth = 'X25519, not Post-Quantum';
            }
            if (!this.settings.decryption) {
                this.settings.decryption = 'none';
            }
            if (!this.settings.encryption) {
                this.settings.encryption = 'none';
            }
            this.tls = false;
            this.reality = false;
            return;
        }

        this.settings.selectedAuth = undefined;
        this.settings.decryption = 'none';
        this.settings.encryption = '';
    }

    // canSockopt() {
    //     switch (this.protocol) {
    //         case Protocols.VLESS:
    //         case Protocols.TROJAN:
    //         case Protocols.SHADOWSOCKS:
    //         case Protocols.VMESS:
    //             break;
    //         default:
    //             return false;
    //     }
    //     return ['tcp', 'http', 'grpc', 'ws'].indexOf(this.network) !== -1;
    //     //return this.network === "tcp";
    // }

    canEnableStream() {
        switch (this.protocol) {
            case Protocols.VMESS:
            case Protocols.VLESS:
            case Protocols.SHADOWSOCKS:
            case Protocols.TROJAN:
            case Protocols.HYSTERIA:
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
        let authority = '';
        let sni = '';
        let mode = '';
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
        } else if (network === 'raw') {
            let raw = this.stream.raw;
            type = raw.type;
            if (type === 'http') {
                let request = raw.request;
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
        } else if (network === 'grpc') {
            path = this.stream.grpc.serviceName;
            authority = this.stream.grpc.authority;
            if (this.stream.grpc.multiMode) {
                type = 'multi'
            }
        } else if (network === 'httpupgrade') {
            let httpupgrade = this.stream.httpupgrade;
            path = httpupgrade.path;
            host = httpupgrade.host;
            let index = httpupgrade.headers.findIndex(header => header.name.toLowerCase() === 'host');
            if (index >= 0) {
                host = httpupgrade.headers[index].value;
            }
        } else if (network === 'xhttp') {
            const xhttp = this.stream.xhttp;
            path = xhttp.path;
            host = xhttp.host;
            let index = xhttp.headers.findIndex(header => header.name.toLowerCase() === 'host');
            if (index >= 0) {
                host = xhttp.headers[index].value;
            };
            mode = xhttp.mode;
        }

        if (this.stream.security === 'tls' && !ObjectUtil.isEmpty(this.stream.tls.sni)) {
            sni = this.stream.tls.sni;
        }
        if (address.startsWith('/')) {
            let host = window.location.hostname; // hostname 一般不带 []

            // 确保去除方括号（万一）
            if (host.startsWith('[') && host.endsWith(']')) {
                host = host.slice(1, -1);
            }

            address = host;
        }

        // 这里再做一次清理（保险）
        if (address.startsWith('[') && address.endsWith(']')) {
            address = address.slice(1, -1);
        }
        let obj = {
            v: '2',
            ps: remark,
            add: address,
            port: this.port,
            id: this.settings.vmesses[0].id,
            net: network,
            type: type,
            host: host,
            path: path,
            ...(network === 'xhttp' && { mode: mode }),
            authority: authority,
            tls: this.stream.security,
            sni: sni,
        };
        if (this.stream.security === 'tls') {
            if (!ObjectUtil.isEmpty(this.stream.tls.settings.fingerprint)) {
                obj.fp = this.stream.tls.settings.fingerprint;
            }
            if (this.stream.tls.alpn.length > 0) {
                obj.alpn = this.stream.tls.alpn.join(',');
            }
        }
        return 'vmess://' + base64(JSON.stringify(obj, null, 2));
    }

    genVLESSLink(address = '', remark = '') {
        const settings = this.settings;
        const uuid = settings.vlesses[0].id;
        const port = this.port;
        const type = this.stream.network;
        // const encryption = this.encryption;
        const params = new Map();
        params.set("type", this.stream.network);
        params.set("encryption", this.settings.encryption);
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
            case "raw":
                const raw = this.stream.raw;
                if (raw.type === 'http') {
                    const request = raw.request;
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
            case "grpc":
                const grpc = this.stream.grpc;
                params.set("serviceName", grpc.serviceName);
                params.set("authority", grpc.authority);
                if (grpc.multiMode) {
                    params.set("mode", "multi");
                }
                break;
            case "httpupgrade":
                const httpupgrade = this.stream.httpupgrade;
                params.set("path", httpupgrade.path);
                params.set("host", httpupgrade.host);
                const httpupgradeIndex = httpupgrade.headers.findIndex(header => header.name.toLowerCase() === 'host');
                if (httpupgradeIndex >= 0) {
                    const host = httpupgrade.headers[httpupgradeIndex].value;
                    params.set("host", host);
                }
                break;
            case "xhttp":
                const xhttp = this.stream.xhttp;
                params.set("path", xhttp.path);
                params.set("host", xhttp.host);
                const xhttpIndex = xhttp.headers.findIndex(header => header.name.toLowerCase() === 'host');
                if (xhttpIndex >= 0) {
                    const host = xhttp.headers[xhttpIndex].value;
                    params.set("host", host);
                };
                params.set("mode", xhttp.mode);
                break;
        }

        if (this.tls) {
            params.set("security", "tls");
            if (this.stream.isTls) {
                params.set("fp", this.stream.tls.settings.fingerprint);
                params.set("alpn", this.stream.tls.alpn);
                if (!ObjectUtil.isEmpty(this.stream.tls.sni)) {
                    params.set("sni", this.stream.tls.sni);
                }
                if (this.stream.tls.settings.echConfigList?.length > 0) {
                    params.set("ech", this.stream.tls.settings.echConfigList);
                }
                if (type === "tcp" && this.settings.vlesses[0].flow.length > 0) {
                    params.set("flow", this.settings.vlesses[0].flow);
                }
                if (type === "raw" && this.settings.vlesses[0].flow.length > 0) {
                    params.set("flow", this.settings.vlesses[0].flow);
                }
            }
        }

        if (this.stream.security === 'reality') {
            if (!ObjectUtil.isArrEmpty(this.stream.reality.serverNames)) {
                // params.set("sni", this.stream.reality.serverNames.split(/,|，|\s+/)[0]);
                params.set("sni", ObjectUtil.generateSid(this.stream.reality.serverNames));
            }
            if (this.stream.reality.publicKey != "") {
                params.set("pbk", this.stream.reality.publicKey);

            }
            if (this.stream.reality.mldsa65Verify != "") {
                params.set("pqv", this.stream.reality.mldsa65Verify);

            }
            if (this.stream.network === 'tcp') {
                params.set("flow", this.settings.vlesses[0].flow);
            }
            if (this.stream.network === 'raw') {
                params.set("flow", this.settings.vlesses[0].flow);
            }
            // var shortIds1 = this.stream.reality.shortIds.split(/,|，|\s+/);
            // var index1 = Math.floor(Math.random() * shortIds1.length);
            // var value1 = shortIds1[index1];
            params.set("sid", ObjectUtil.generateSid(this.stream.reality.shortIds));

            if (this.stream.reality.fingerprint != "") {
                params.set("fp", this.stream.reality.fingerprint);
            }
        }
        if (address.startsWith('/')) {
            address = window.location.hostname; // 使用当前域名
        }
        const link = `vless://${uuid}@${address}:${port}`;
        const url = new URL(link);
        for (const [key, value] of params) {
            url.searchParams.set(key, value)
        }
        url.hash = encodeURIComponent(remark);
        return url.toString();
    }

    genSSLink(address = '', forceTls, remark = '') {
        const settings = this.settings;
        const type = this.stream.network;
        const security = forceTls === 'same' ? this.stream.security : forceTls;

        const params = new Map();

        // ⚠️ 不要给 tcp 强行加 type
        if (type && type !== 'tcp') {
            params.set('type', type);
        }

        const safe = v => {
            if (v === undefined || v === null) return '';
            return String(v).trim();
        };

        const safePath = p => {
            p = safe(p);
            if (!p) return '';
            return p.startsWith('/') ? p : '/' + p;
        };

        switch (type) {
            case 'tcp': {
                const tcp = this.stream.tcp;
                if (tcp?.type === 'http') {
                    const req = tcp.request;
                    params.set('path', safe(req.path.join(',')));
                    const h = req.headers.find(v => v.name.toLowerCase() === 'host');
                    if (h) params.set('host', safe(h.value));
                    params.set('headerType', 'http');
                }
                break;
            }

            case 'raw': {
                const raw = this.stream.raw;
                if (raw?.type === 'http') {
                    const req = raw.request;
                    params.set('path', safe(req.path.join(',')));
                    const h = req.headers.find(v => v.name.toLowerCase() === 'host');
                    if (h) params.set('host', safe(h.value));
                    params.set('headerType', 'http');
                }
                break;
            }

            case 'kcp': {
                const kcp = this.stream.kcp;
                params.set('headerType', safe(kcp.type));
                if (kcp.seed) params.set('seed', safe(kcp.seed));
                break;
            }

            case 'ws': {
                const ws = this.stream.ws;
                params.set('path', safePath(ws.path));
                const h = ws.headers.find(v => v.name.toLowerCase() === 'host');
                if (h) params.set('host', safe(h.value));
                break;
            }

            case 'grpc': {
                const grpc = this.stream.grpc;
                if (grpc.serviceName)
                    params.set('serviceName', safe(grpc.serviceName));
                if (grpc.authority)
                    params.set('authority', safe(grpc.authority));
                if (grpc.multiMode)
                    params.set('mode', 'multi');
                break;
            }

            case 'httpupgrade': {
                const h = this.stream.httpupgrade;
                params.set('path', safePath(h.path));
                if (h.host) params.set('host', safe(h.host));
                const hh = h.headers.find(v => v.name.toLowerCase() === 'host');
                if (hh) params.set('host', safe(hh.value));
                break;
            }

            case 'xhttp': {
                const x = this.stream.xhttp;
                params.set('path', safePath(x.path));
                if (x.host) params.set('host', safe(x.host));
                if (x.mode) params.set('mode', safe(x.mode));
                break;
            }
        }

        // TLS
        if (security === 'tls') {
            params.set("security", "tls");
            if (this.stream.isTls) {
                params.set("fp", this.stream.tls.settings.fingerprint);
                params.set("alpn", this.stream.tls.alpn);
                if (this.stream.tls.settings.echConfigList?.length > 0) {
                    params.set("ech", this.stream.tls.settings.echConfigList);
                }
                if (!ObjectUtil.isEmpty(this.stream.tls.sni)) {
                    params.set("sni", this.stream.tls.sni);
                }
            }
        }

        // address fallback
        if (!address || address.startsWith('/')) {
            address = window.location.hostname;
        }

        const isBlake3 =
            settings.method === SSMethods.BLAKE3_AES_128_GCM ||
            settings.method === SSMethods.BLAKE3_AES_256_GCM ||
            settings.method === SSMethods.BLAKE3_CHACHA20_POLY1305;

        let link;

        if (isBlake3) {
            // ✅ BLAKE3：password 必须 encode
            link =
                `ss://${settings.method}:` +
                `${encodeURIComponent(settings.password)}` +
                `@${address}:${this.port}`;
        } else {
            const userinfo =
                `${settings.method}:${settings.password}@${address}:${this.port}`;
            link = `ss://${safeBase64(userinfo)}`;
        }

        // 拼 query
        const query = [...params.entries()]
            .filter(([_, v]) => v !== '')
            .map(([k, v]) =>
                `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
            )
            .join('&');

        if (query) link += `?${query}`;

        if (remark) link += `#${encodeURIComponent(remark)}`;

        return link;
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
            case "raw":
                const raw = this.stream.raw;
                if (raw.type === 'http') {
                    const request = raw.request;
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
            case "grpc":
                const grpc = this.stream.grpc;
                params.set("serviceName", grpc.serviceName);
                params.set("authority", grpc.authority);
                if (grpc.multiMode) {
                    params.set("mode", "multi");
                }
                break;
            case "httpupgrade":
                const httpupgrade = this.stream.httpupgrade;
                params.set("path", httpupgrade.path);
                params.set("host", httpupgrade.host);
                const httpUpgradeIndex = httpupgrade.headers.findIndex(header => header.name.toLowerCase() === 'host');
                if (httpUpgradeIndex >= 0) {
                    const host = httpupgrade.headers[httpUpgradeIndex].value;
                    params.set("host", host);
                }
                break;
            case "xhttp":
                const xhttp = this.stream.xhttp;
                params.set("path", xhttp.path);
                params.set("host", xhttp.host);
                const xhttpIndex = xhttp.headers.findIndex(header => header.name.toLowerCase() === 'host');
                if (xhttpIndex >= 0) {
                    const host = xhttp.headers[xhttpIndex].value;
                    params.set("host", host);
                };
                params.set("mode", xhttp.mode);
                break;
        }

        if (this.tls) {
            params.set("security", "tls");
            if (this.stream.isTls) {
                params.set("fp", this.stream.tls.settings.fingerprint);
                params.set("alpn", this.stream.tls.alpn);
                if (this.stream.tls.settings.echConfigList?.length > 0) {
                    params.set("ech", this.stream.tls.settings.echConfigList);
                }
                if (!ObjectUtil.isEmpty(this.stream.tls.sni)) {
                    params.set("sni", this.stream.tls.sni);
                }
            }
        }

        if (this.stream.security === 'reality') {
            if (!ObjectUtil.isArrEmpty(this.stream.reality.serverNames)) {
                // params.set("sni", this.stream.reality.serverNames.split(/,|，|\s+/)[0]);
                params.set("sni", ObjectUtil.generateSid(this.stream.reality.serverNames));
            }
            if (this.stream.reality.publicKey != "") {
                params.set("pbk", this.stream.reality.publicKey);
            }
            if (this.stream.reality.mldsa65Verify != "") {
                params.set("pqv", this.stream.reality.mldsa65Verify);

            }
            // var shortIds1 = this.stream.reality.shortIds.split(/,|，|\s+/);
            // var index1 = Math.floor(Math.random() * shortIds1.length);
            // var value1 = shortIds1[index1];
            params.set("sid", ObjectUtil.generateSid(this.stream.reality.shortIds));

            if (this.stream.reality.fingerprint != "") {
                params.set("fp", this.stream.reality.fingerprint);
            }
        }
        if (address.startsWith('/')) {
            address = window.location.hostname; // 使用当前域名
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
        this.syncHysteriaAuth();
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
            case Protocols.SOCKS: return new Inbound.SocksSettings(protocol);
            case Protocols.HTTP: return new Inbound.HttpSettings(protocol);
            case Protocols.HYSTERIA: return new Inbound.HysteriaSettings(protocol);
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
            case Protocols.SOCKS: return Inbound.SocksSettings.fromJson(json);
            case Protocols.HTTP: return Inbound.HttpSettings.fromJson(json);
            case Protocols.HYSTERIA: return Inbound.HysteriaSettings.fromJson(json);
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
    constructor(id = RandomUtil.randomUUID()) {
        super();
        this.id = id;
    }

    refreshId() {
        this.id = RandomUtil.randomUUID();
    }

    static fromJson(json = {}) {
        return new Inbound.VmessSettings.Vmess(
            json.id,
        );
    }
};

Inbound.VLESSSettings = class extends Inbound.Settings {
    constructor(protocol,
        vlesses = [new Inbound.VLESSSettings.VLESS()],
        decryption = 'none',
        encryption = "none",
        fallbacks = [],
        selectedAuth = undefined,
    ) {
        super(protocol);
        this.vlesses = vlesses;
        this.decryption = decryption;
        this.encryption = encryption;
        this.fallbacks = fallbacks;
        this.selectedAuth = selectedAuth;
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
            json.encryption,
            Inbound.VLESSSettings.Fallback.fromJson(json.fallbacks),
            json.selectedAuth,
        );
    }

    toJson() {
        const json = {
            clients: Inbound.VLESSSettings.toJsonArray(this.vlesses),
            decryption: ObjectUtil.isEmpty(this.decryption) ? 'none' : this.decryption,
        };

        if (this.fallbacks && this.fallbacks.length > 0) {
            json['fallbacks'] = Inbound.VLESSSettings.toJsonArray(this.fallbacks);
        }
        if (this.selectedAuth) {
            json['selectedAuth'] = this.selectedAuth;
            if (this.encryption) {
                json['encryption'] = this.encryption;
            }
        }

        return json;
    }
};

Inbound.VLESSSettings.VLESS = class extends XrayCommonClass {

    constructor(id = RandomUtil.randomUUID(), flow = "") {
        super();
        this.id = id;
        this.flow = flow;
    }

    refreshId() {
        this.id = RandomUtil.randomUUID();
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

    refreshPassword() {
        this.password = RandomUtil.randomSeq(10);
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
        password = btoa(RandomUtil.randomSeq(32)),
        network = 'tcp,udp'
    ) {
        super(protocol);
        this.method = method;
        this.password = password;
        this.network = network;
    }

    refreshPassword() {
        this.password = btoa(RandomUtil.randomSeq(32));
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

    refreshPassword() {
        this.pass = RandomUtil.randomSeq(10);
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

    refreshPassword() {
        this.pass = RandomUtil.randomSeq(10);
    }

    static fromJson(json = {}) {
        return new Inbound.HttpSettings.HttpAccount(json.user, json.pass);
    }
};

Inbound.HysteriaSettings = class extends Inbound.Settings {
    constructor(protocol, version = 2, clients = [new Inbound.HysteriaSettings.Client()]) {
        super(protocol);
        this.version = version;
        this.clients = clients;
    }

    static fromJson(json = {}) {
        const clients = Array.isArray(json.clients) && json.clients.length > 0
            ? json.clients.map(client => Inbound.HysteriaSettings.Client.fromJson(client))
            : [new Inbound.HysteriaSettings.Client()];
        return new Inbound.HysteriaSettings(
            Protocols.HYSTERIA,
            ObjectUtil.isEmpty(json.version) ? 2 : json.version,
            clients,
        );
    }

    toJson() {
        return {
            version: this.version,
            clients: Inbound.HysteriaSettings.toJsonArray(this.clients),
        };
    }
};

Inbound.HysteriaSettings.Client = class extends XrayCommonClass {
    constructor(auth = RandomUtil.randomUUID(), level = 0, email = `${RandomUtil.randomLowerAndNum(10)}@xray.com`) {
        super();
        this.auth = auth;
        this.level = level;
        this.email = email;
    }

    refreshAuth() {
        this.auth = RandomUtil.randomUUID();
    }

    refreshEmail() {
        this.email = `${RandomUtil.randomLowerAndNum(10)}@xray.com`;
    }

    toJson() {
        return {
            auth: this.auth,
            level: this.level,
            email: this.email,
        };
    }

    static fromJson(json = {}) {
        return new Inbound.HysteriaSettings.Client(
            json.auth,
            ObjectUtil.isEmpty(json.level) ? 0 : json.level,
            json.email,
        );
    }
};
