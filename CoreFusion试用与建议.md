# CoreFusion 公开测试邀请

> xray-ui 不再维护，并会改为只读仓库。后续主力项目是 CoreFusion，欢迎在测试环境试用、反馈问题，也欢迎写教程、录视频。

其他语言：[English](CoreFusion-Trial.en.md) · [Русский](CoreFusion-Trial.ru.md) · [فارسی](CoreFusion-Trial.fa.md)

## 1. xray-ui 的后续安排

- 本项目（xray-ui）**停止维护**，并将在近期改为**只读仓库**。
- 已有部署可以继续使用，但不再有新功能、兼容性修复与安全更新。
- 仓库转为只读后，issue 也会关闭；还有需要讨论的内容，请到 CoreFusion 仓库。

CoreFusion：<https://github.com/qist/corefusion>

## 2. CoreFusion 是什么

它和 xray-ui 不是同一条产品线，也不是「升级版」：

| | xray-ui（本项目） | CoreFusion |
|---|---|---|
| 定位 | 单机面板，管理本机 Xray | Panel + Agent 的多节点运营面板 |
| 适合 | 一台 VPS、自用、轻量 | 多台节点、需要对外提供订阅 |
| 内核 | Xray-core | Xray-core + sing-box |
| 运营能力 | — | 套餐/订单/门户、证书自动签发、流量配额与限速、WAF、审计日志、多语言 |

如果只是一台机器自用，继续用现有面板即可；有多台节点或需要「卖订阅」，再拿测试机试 CoreFusion。

## 3. 现在处于什么阶段

**公开测试阶段（beta）。**

已经能跑通的主要路径：

- 安装、初始化向导、面板登录与版本升级
- 多节点 Agent 上线、断线重连、配置下发
- Xray 与 sing-box 双内核；常见协议与传输（VLESS + Reality、Hysteria2、TUIC、WS、gRPC、XHTTP 等）
- 订阅输出（Clash/Mihomo 的内联与 provider 模式、sing-box、Xray、Base64）
- 套餐模板、订阅绑定、到期与流量限制、客户门户
- 证书自动签发与续期、分发到节点
- 流量统计与限速

但它**还不具备大规模运营的条件**：

- 大量边界场景没有测试过，遇到问题是正常的
- 数据结构和接口可能随版本调整，升级不保证向后兼容
- 没有 SLA，不承诺故障恢复时间
- **请勿直接用于正式业务、收费业务或生产环境**；先用测试机、测试域名、测试账号验证

## 4. 怎么试

> 建议 10 分钟内跑通。只在测试机 / 备用 VPS 上试，不要覆盖正在跑 xray-ui 的机器；需要并存请用独立目录与端口。

```bash
curl -fsSL https://raw.githubusercontent.com/qist/corefusion/main/scripts/install.sh -o install.sh
sudo bash install.sh
```

安装完成后终端会打印初始化向导地址与一次性令牌（有效期 2 小时），浏览器打开后按向导创建管理员、设置端口即可登录。

常用参数：

```bash
sudo bash install.sh --lang en                    # 安装脚本输出语言：zh|en|fa|ru
sudo bash install.sh --version v0.13.0-beta.96    # 指定版本
sudo bash install.sh --mirror https://ghproxy.net # 下载加速
```

建议的上手顺序：

1. 初始化向导：数据库（默认 SQLite 即可）→ 数据目录 → 加密密钥 → 核心安装 → 代理（不使用 / Nginx / Caddy）→ 站点与域名 → 证书 → 保存并重启
2. 添加节点：节点管理 → 新增服务器
3. 部署 Agent：保存后点 Bootstrap，把命令复制到目标节点用 root 执行
4. 协议中心：先跑通一个 VLESS + Reality 或 Hysteria2 入站
5. 订阅：订阅格式 → 客户管理里绑定套餐与订阅
6. 客户端：把订阅导入 Clash Verge / Mihomo / sing-box，确认节点与分组正常

## 5. 反馈方式：只收 issue，不收 PR

测试阶段**不接收 Pull Request**。当前代码改动很快，外部 PR 的合并与回归成本高于收益，请理解。

- Bug / 报错：到 <https://github.com/qist/corefusion/issues> 新建 issue，使用仓库自带的问题报告模板
- 功能建议 / 体验问题：同样开 issue，标题加 `[建议]` 前缀
- 方便归类的话，注明「来自 xray-ui 测试」

提 issue 时请附上：

- 版本号：面板执行 `corefusion --version`
- 系统与架构（例如 Debian 12 / amd64，是否容器）
- 复现步骤（越短越好）
- 相关日志：面板 `journalctl -u corefusion -n 200 --no-pager`；节点 `journalctl -u corefusion-agent -n 200 --no-pager`

## 6. 多语言支持与翻译

面板界面目前提供 **16 种语言**：

| 语言 | 代码 | 语言 | 代码 |
|---|---|---|---|
| 简体中文 | zh-CN | 繁体中文 | zh-TW |
| 英语 | en | 日语 | ja |
| 韩语 | ko | 德语 | de |
| 法语 | fr | 西班牙语 | es |
| 葡萄牙语 | pt | 俄语 | ru |
| 阿拉伯语 | ar | 波斯语 | fa |
| 印尼语 | id | 泰语 | th |
| 土耳其语 | tr | 越南语 | vi |

文档也按同样的语言提供，包括项目介绍（README）、用户指南与 API 文档，都在仓库的 `docs/` 目录下。安装脚本本身的输出支持 4 种语言（zh / en / fa / ru）；面板登录后可在设置里切换界面语言。

这些语言多数是机器翻译辅助完成的，**术语和语句不一定准确**，尤其是网络/代理相关的专业词汇。发现翻译问题欢迎提 issue，附上：

- 语言（如 ja / de / ru）
- 页面位置或文案 key
- 你建议的准确译文

能提供母语级译文的，会优先合入语言包。

## 7. 欢迎写教程、录视频

项目还在早期，比任何功能都更需要「别人能照着做通」的材料。

- 文字教程、图文步骤、视频、博客、频道内容都欢迎
- 不必写得很完整，能跑通一个真实场景（安装、Reality、Hysteria2、订阅、门户、证书……）就有价值
- 完成后可以到 CoreFusion 仓库开 issue 附上链接，方便收录到文档或 README
- 请标注所用版本号（`corefusion --version`），避免后续版本变化让教程失效
- 教程里请勿贴真实的订阅链接、Token、证书私钥或服务器密码

## 8. 已知限制

- 暂不提供从 xray-ui 一键导入配置或账号的工具，迁移需要在新环境重新配置
- 面板与 Agent 之间使用 mTLS；节点证书过期后需要重新 Bootstrap（属预期行为，不是面板故障）
- beta 版本升级前请备份 `data/` 目录（数据库、证书、运行时配置）
- 涉及订阅、支付、证书的功能，请先用测试域名与测试账号验证

## 9. 最后

项目还在早期，很多地方不完善。愿意花时间试、并把问题说清楚，或者写一份别人能照着做通的教程，就是对它最大的帮助。

谢谢。
