# CoreFusion Public Beta Invitation

> xray-ui is no longer maintained and will be archived as a read-only repository. The main project going forward is CoreFusion. You are welcome to try it in a test environment, report problems, and write tutorials or record videos.

Other languages: [中文](CoreFusion试用与建议.md) · [Русский](CoreFusion-Trial.ru.md) · [فارسی](CoreFusion-Trial.fa.md)

## 1. What happens to xray-ui

- This project (xray-ui) is **no longer maintained** and will soon become a **read-only repository**.
- Existing deployments keep working, but will receive no new features, compatibility fixes or security updates.
- Once the repository is archived, issues will be closed as well. If something still needs discussion, please use the CoreFusion repository.

CoreFusion: <https://github.com/qist/corefusion>

## 2. What CoreFusion is

It is a separate product line, not an "upgrade" of xray-ui:

| | xray-ui (this project) | CoreFusion |
|---|---|---|
| Scope | Single-host panel for the local Xray | Panel + Agent multi-node operations panel |
| Fits | One VPS, personal use, lightweight | Multiple nodes, publishing subscriptions |
| Core | Xray-core | Xray-core + sing-box |
| Operations | — | Plans/orders/portal, automatic certificates, traffic quotas and rate limits, WAF, audit logs, i18n |

If you only run one machine for yourself, keep using your current panel. If you have several nodes or need to sell subscriptions, try CoreFusion on a test machine.

## 3. Current stage

**Public beta.**

Paths that already work:

- Installation, setup wizard, panel login and upgrades
- Multi-node Agent: coming online, reconnecting, config delivery
- Xray and sing-box cores; common protocols and transports (VLESS + Reality, Hysteria2, TUIC, WS, gRPC, XHTTP, ...)
- Subscription output (Clash/Mihomo inline and provider modes, sing-box, Xray, Base64)
- Plan templates, subscription binding, expiry and traffic limits, customer portal
- Automatic certificate issuance and renewal, distribution to nodes
- Traffic accounting and rate limiting

But it is **not ready for large-scale operations**:

- Many edge cases have never been tested; problems are expected
- Data structures and APIs may change between versions; upgrades are not guaranteed to be backward compatible
- No SLA, no guaranteed recovery time
- **Do not use it for real business, paid services or production**; validate with a test machine, test domains and test accounts first

## 4. How to try it

> About 10 minutes to get started. Use a test machine or spare VPS only. Do not overwrite a machine already running xray-ui; if you need both, use a separate directory and ports.

```bash
curl -fsSL https://raw.githubusercontent.com/qist/corefusion/main/scripts/install.sh -o install.sh
sudo bash install.sh
```

When installation finishes, the terminal prints the setup wizard URL and a one-time token (valid for 2 hours). Open the URL, create the administrator, set the panel port, then log in.

Common options:

```bash
sudo bash install.sh --lang en                    # installer output language: zh|en|fa|ru
sudo bash install.sh --version v0.13.0-beta.96    # pin a version
sudo bash install.sh --mirror https://ghproxy.net # download accelerator
```

Suggested path:

1. Setup wizard: database (SQLite is fine) → data directory → encryption key → core installation → proxy (none / Nginx / Caddy) → site and domains → certificates → save and restart
2. Add a node: Node Management → New Server
3. Deploy the Agent: click Bootstrap, run the printed command as root on the target node
4. Protocol Center: get one VLESS + Reality or Hysteria2 inbound working first
5. Subscriptions: create a subscription format, then bind plans and subscriptions in Client Management
6. Client: import the subscription into Clash Verge / Mihomo / sing-box and verify nodes and groups

## 5. Feedback: issues only, no PRs

During the beta, **Pull Requests are not accepted**. The code changes quickly, and reviewing/merging external PRs costs more than it saves. Thanks for understanding.

- Bugs / errors: open an issue at <https://github.com/qist/corefusion/issues> using the bug report template
- Feature requests / UX feedback: also an issue, prefix the title with `[Feature]`
- If it helps triage, mention "from xray-ui testing"

Please include:

- Version: run `corefusion --version` on the panel
- OS and architecture (e.g. Debian 12 / amd64, container or not)
- Reproduction steps (as short as possible)
- Relevant logs: panel `journalctl -u corefusion -n 200 --no-pager`; node `journalctl -u corefusion-agent -n 200 --no-pager`

## 6. Languages and translations

The panel UI ships **16 languages**:

| Language | Code | Language | Code |
|---|---|---|---|
| Simplified Chinese | zh-CN | Traditional Chinese | zh-TW |
| English | en | Japanese | ja |
| Korean | ko | German | de |
| French | fr | Spanish | es |
| Portuguese | pt | Russian | ru |
| Arabic | ar | Persian | fa |
| Indonesian | id | Thai | th |
| Turkish | tr | Vietnamese | vi |

Documentation follows the same set: project README, user guide and API docs live under `docs/`. The installer's own output supports 4 languages (zh / en / fa / ru); the UI language can be switched after logging in.

Most translations were produced with machine assistance, so **wording and terminology may be inaccurate**, especially networking/proxy terms. If you find a problem, open an issue with:

- the language (e.g. ja / de / ru)
- the page or the translation key
- your suggested wording

Native-level corrections are merged with priority.

## 7. Tutorials and videos are welcome

The project is early, and "someone else can follow this and get it working" material is more valuable than any feature right now.

- Written tutorials, step-by-step guides, videos, blog posts and channel content are all welcome
- It does not need to be complete; one real scenario (install, Reality, Hysteria2, subscriptions, portal, certificates, ...) is already useful
- When done, open an issue in the CoreFusion repository with the link so it can be listed in the docs or README
- Please state the version you used (`corefusion --version`) so readers are not misled by later changes
- Never include real subscription URLs, tokens, private keys or server passwords in a tutorial

## 8. Known limitations

- There is no one-click import from xray-ui for configs or accounts; migration means configuring the new environment
- Panel and Agent communicate over mTLS; an expired node certificate requires re-Bootstrap (expected behavior, not a panel failure)
- Back up the `data/` directory (database, certificates, runtime config) before upgrading a beta
- For subscription, payment and certificate features, validate with test domains and test accounts first

## 9. Closing

The project is still early and rough in many places. Trying it, describing problems clearly, or writing a tutorial someone else can follow is the most useful help it can get.

Thank you.
