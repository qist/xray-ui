class HttpUtil {
    static _handleMsg(msg) {
        if (!(msg instanceof Msg)) {
            return;
        }
        if (msg.msg === "") {
            return;
        }
        if (msg.success) {
            Vue.prototype.$message.success(msg.msg);
        } else {
            Vue.prototype.$message.error(msg.msg);
        }
    }

    static _respToMsg(resp) {
        const data = resp.data;
        if (data == null) {
            return new Msg(true);
        } else if (typeof data === 'object') {
            if (data.hasOwnProperty('success')) {
                return new Msg(data.success, data.msg, data.obj);
            } else {
                return data;
            }
        } else {
            return new Msg(false, 'unknown data:', data);
        }
    }

    static async get(url, data, options) {
        let msg;
        try {
            const resp = await axios.get(url, data, options);
            msg = this._respToMsg(resp);
        } catch (e) {
            msg = new Msg(false, e.toString());
        }
        this._handleMsg(msg);
        return msg;
    }

    static async post(url, data, options) {
        let msg;
        try {
            const resp = await axios.post(url, data, options);
            msg = this._respToMsg(resp);
        } catch (e) {
            msg = new Msg(false, e.toString());
        }
        this._handleMsg(msg);
        return msg;
    }

    static async postWithModal(url, data, modal) {
        if (modal) {
            modal.loading(true);
        }
        const msg = await this.post(url, data);
        if (modal) {
            modal.loading(false);
            if (msg instanceof Msg && msg.success) {
                modal.close();
            }
        }
        return msg;
    }
}

class PromiseUtil {

    static async sleep(timeout) {
        await new Promise(resolve => {
            setTimeout(resolve, timeout)
        });
    }

}

const seq = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g',
    'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y', 'z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'A', 'B', 'C', 'D', 'E', 'F', 'G',
    'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z'
];

const shortIdSeq = [
    'a', 'b', 'c', 'd', 'e', 'f',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
];

const x25519Map = new Map(
    [
        ['AC3G8vkuUGjas_vrr0mz6M5eBHTOHAkJABMw_QOgpXQ', "TDSN4W_qfi4mjAFPKY1pJGBY7A3tTkFu4PvF_TPfgyM"],
        ['YNxnx_BUzWIVKkwl9CaNNV_SxXQTiBPZv3yjkx1MKkc', "UCFLNt1076MwdH-qS9XFrB4YfqHoviSmv1zli4S9O1I"],
        ['MGH6yhCwNeSYjFJuCCTdbYq3Hbr4PHpkPJP_jpYcPXc', "aMaFySj6BRWHZzcBeB2oCeR1rS66ZTdSOD37iOmVQhE"],
        ['OAtNHfPuIpXAsEozdjXY4nfyM-ljY7N5-Z58g-gBflw', "LwMLRgV9fb81j3kU3qXfheUusKCWsvhjm57v_G4baFs"],
        ['oAPDUmrCf_bT2xSf-qL6TqqYRlUjx3gqxs3H_iZVVXs', 'BnzB787jnNTFKYW4py2OHZy0Fip6W2H4Ei68z9aCKzw'],
        ['uM5BaWSaXmRONR1xebjvR8jU3vmvpBQZn1LLibNikEE', 'e_0js7suIOoZnfkk4xN8kP3OoophPDN_74tJ4s5s7FU'],
        ['CGdRCXgkgT-EzT3GsL1UsyLCKq1UqnCpnXsxduKxk0A', '6zhvuflgNY80Nb-OYY95Z8x4Crql3wFMbtuaD2wWngM'],
        ['eMtM8y_0NLyxCQy7f8ADwuXrnHPL5O4v58PzzJynoWM', 'dN9027rv4fm0JM_0E3dr4_DUU5PZOs0ufW123blL20E'],
        ['KOsk9XhaG1zXrzxJ0uceoGLNpjB3AD5ZndMoegqxTlQ', 'fmzxJ4yRxeK9mE2Qe6MWsZhbSKwxW9SPOMmVfxgnTX0'],
        ['OLyV_UL24hID6iR2dCwT5ZtjP9505hy201PYgVZjDVs', 'P_LQAI9X6q5940-uf5MjHOMWJsWEiWApCdsFl2h4nlE'],
        ['4L-d70Y-st54bQsiBc2uy4HU4rpCjohiPCJCivYsKkY', 'GYRCcYvd5TUUQFmd_t8y23L4S-ItHbzQXiSwwl81nAs'],
        ['gJTKZLQJcb2AIT1iwtMvCXXhRGFv8SyM1agTXZd_P14', 'lGLYyRUbr8JAJkYEg5zOWnUxP8HjJ_MwQa1_tfnHdGc'],
        ['iPgjM4ojIkSVwFG-jxFIULYSbzEhQT2_i32jzXIcDnE', 'YBr4GaN7fKFCgdK3ofSxuQSYkhLkKrbJEeoI1g_4EVM'],
        ['CGFUXhSq58wepQZCQpO-Uw4ceR5yFk6qwan0Ryxua2I', 'o0OqsTqMyqmB4xblg740Pc3XQfSSZXg38cx1eZRSNnk'],
        ['QNcn7jwiq8w7D9vc1ceaFdkmw7ReHlrCKXhEUO0cgXY', 'Kfdh5usxjm4TcNGDlhUYC9iUQkKlwVfGwDQsp1kIVkE'],
        ['UKkz_IIwnXinuiUEob-Nb7fpcjJnLTfrfKddIu2t9kQ', '_btpuRJt3atUaryk1-F0ZrwFll0ypr7SKIlhHkGVwjg'],
        ['UOnOa7NBah8CMUWm5aRkwMvfSMX7PfWLmKx6IThQj1c', '2MjYqK75TJNgHPPtCFjuWtGecKBBOn38Voj1WkOzmws'],
        ['kAK-vrB-KCKOZaE3udMr--N7BxhfcpszQkz7nygBT2w', '8PCQkKQ5G-phCOeScALAN_8mLI6yZrqmWX5cAy8Umxk'],
        ['uHMhLC95UIQDLCEhiOVmenbrbP7S1wqYp5gGPyzEmGE', 'exjAIo848vzTm9EZ64Qu1OIcsC0b7XFS1aU40UnmNhk'],
        ['kFE497WjTwBoqoVDzSw1IxU2tStwc6AN3PkI-fq081M', '6GgzvNPC7wnDeDeFiqpHfstNj6BTRYbTEp3aIuKaOyI'],
        ['kDXvqJusiJJ2eyZsAwZjgzemhvvYn3KAZoZUEgOfP0g', 'jAT_AKaQbhQWAClYmYO-W3c1aGd7pAYsHimlahxyYW8'],
        ['WJHJDDQEjy05IL5_0FzDl2reGHxviIvzeeTa73amwUU', 'DM2XI6R9cVr1owcB4syN9MmOeh2-KUCc01JoweFM114'],
        ['cJSJ51OPSog1WV4aCNWcDhh_zj4fgfwEBxEbqb5ALlE', 'ZcqZCG5W_5yFsTDOBKoQh180OY2o2PMaax7MDAGuP1I'],
        ['WCfKKqCbSkv1F_yKJzC3H1h1EHbHsaQ6GJf7hx3dnUY', 'cD60mJQdtgJ3smsQN6OOlJ0ZPEOCZrP7-FA7PTZfCQ4'],
        ['GLlAavQTKBMb90D9SX7m3L85uAB4W4LBs11-WuUaHFk', 'v0J3yFQyLnZ7Yj6cyPvMy4MaCcWxLPy_6Ny6URXjZ2k'],
    ]
);

class RandomUtil {

    static randomIntRange(min, max) {
        return parseInt(Math.random() * (max - min) + min, 10);
    }

    static randomInt(n) {
        return this.randomIntRange(0, n);
    }

    static randomSeq(count) {
        let str = '';
        for (let i = 0; i < count; ++i) {
            str += seq[this.randomInt(62)];
        }
        return str;
    }

    static randomShortIdSeq(count) {
        let str = '';
        for (let i = 0; i < count; ++i) {
            str += shortIdSeq[this.randomInt(16)];
        }
        return str;
    }

    static randomLowerAndNum(count) {
        let str = '';
        for (let i = 0; i < count; ++i) {
            str += seq[this.randomInt(36)];
        }
        return str;
    }

    static randomMTSecret() {
        let str = '';
        for (let i = 0; i < 32; ++i) {
            let index = this.randomInt(16);
            if (index <= 9) {
                str += index;
            } else {
                str += seq[index - 10];
            }
        }
        return str;
    }

    static randomUUID() {
        let d = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
    }

    static randowShortId() {
        let str = '' + '\n';
        str += (this.randomShortIdSeq(2) + '\n')
        str += (this.randomShortIdSeq(4) + '\n')
        str += (this.randomShortIdSeq(6) + '\n')
        str += (this.randomShortIdSeq(8) + '\n')
        str += (this.randomShortIdSeq(10) + '\n')
        str += (this.randomShortIdSeq(12) + '\n')
        str += (this.randomShortIdSeq(14) + '\n')
        str += this.randomShortIdSeq(16)
        return str;
    }

    static randomX25519PrivateKey() {
        let num = x25519Map.size;
        let index = this.randomInt(num);
        let cntr = 0;
        for (let key of x25519Map.keys()) {
            if (cntr++ === index) {
                return key;
            }
        }
    }

    static randomX25519PublicKey(key) {
        return x25519Map.get(key)
    }
}

class ObjectUtil {

    static getPropIgnoreCase(obj, prop) {
        for (const name in obj) {
            if (!obj.hasOwnProperty(name)) {
                continue;
            }
            if (name.toLowerCase() === prop.toLowerCase()) {
                return obj[name];
            }
        }
        return undefined;
    }

    static deepSearch(obj, key) {
        if (obj instanceof Array) {
            for (let i = 0; i < obj.length; ++i) {
                if (this.deepSearch(obj[i], key)) {
                    return true;
                }
            }
        } else if (obj instanceof Object) {
            for (let name in obj) {
                if (!obj.hasOwnProperty(name)) {
                    continue;
                }
                if (this.deepSearch(obj[name], key)) {
                    return true;
                }
            }
        } else {
            return obj.toString().indexOf(key) >= 0;
        }
        return false;
    }

    static isEmpty(obj) {
        return obj === null || obj === undefined || obj === '';
    }

    static isArrEmpty(arr) {
        return !this.isEmpty(arr) && arr.length === 0;
    }

    static copyArr(dest, src) {
        dest.splice(0);
        for (const item of src) {
            dest.push(item);
        }
    }

    static clone(obj) {
        let newObj;
        if (obj instanceof Array) {
            newObj = [];
            this.copyArr(newObj, obj);
        } else if (obj instanceof Object) {
            newObj = {};
            for (const key of Object.keys(obj)) {
                newObj[key] = obj[key];
            }
        } else {
            newObj = obj;
        }
        return newObj;
    }

    static deepClone(obj) {
        let newObj;
        if (obj instanceof Array) {
            newObj = [];
            for (const item of obj) {
                newObj.push(this.deepClone(item));
            }
        } else if (obj instanceof Object) {
            newObj = {};
            for (const key of Object.keys(obj)) {
                newObj[key] = this.deepClone(obj[key]);
            }
        } else {
            newObj = obj;
        }
        return newObj;
    }

    static cloneProps(dest, src, ...ignoreProps) {
        if (dest == null || src == null) {
            return;
        }
        const ignoreEmpty = this.isArrEmpty(ignoreProps);
        for (const key of Object.keys(src)) {
            if (!src.hasOwnProperty(key)) {
                continue;
            } else if (!dest.hasOwnProperty(key)) {
                continue;
            } else if (src[key] === undefined) {
                continue;
            }
            if (ignoreEmpty) {
                dest[key] = src[key];
            } else {
                let ignore = false;
                for (let i = 0; i < ignoreProps.length; ++i) {
                    if (key === ignoreProps[i]) {
                        ignore = true;
                        break;
                    }
                }
                if (!ignore) {
                    dest[key] = src[key];
                }
            }
        }
    }

    static delProps(obj, ...props) {
        for (const prop of props) {
            if (prop in obj) {
                delete obj[prop];
            }
        }
    }

    static execute(func, ...args) {
        if (!this.isEmpty(func) && typeof func === 'function') {
            func(...args);
        }
    }

    static orDefault(obj, defaultValue) {
        if (obj == null) {
            return defaultValue;
        }
        return obj;
    }

    static equals(a, b) {
        for (const key in a) {
            if (!a.hasOwnProperty(key)) {
                continue;
            }
            if (!b.hasOwnProperty(key)) {
                return false;
            } else if (a[key] !== b[key]) {
                return false;
            }
        }
        return true;
    }

}
