# 修改日志 2026-08-01

## 今日提交 (2026-08-01)

### 42ac0a6 | qist
**chore: 将 sqlite 依赖从 glebarez 替换为 qist/sqlite v1.12.0 并升级版本号至 26.08.01**

变更文件：
- `config/version` — 版本号 26.07.18 → 26.08.01
- `database/db.go` — import 路径改为 github.com/qist/sqlite
- `v2ui/db.go` — import 路径改为 github.com/qist/sqlite
- `go.mod` — 依赖 github.com/glebarez/sqlite v1.11.0 → github.com/qist/sqlite v1.12.0
- `go.sum` — 对应 hash 更新

5 files changed, 48 insertions(+), 24 deletions(-)

### cad798c | anupamme (mediratta@gmail.com)
**fix: V-001 security vulnerability** （由 OrbisAI Security 自动生成）

变更文件：
- `web/session/session.go` — 为 GetLoginUser 的类型断言增加 ok 检查防 panic

问题：该补丁仅加了 ok 检查，但原始 `obj.(model.User)` 的值类型断言方向本身是对的，
并未真正修复；且声称的“鉴权绕过 panic”场景在本仓库实际不会触发（详见下方 12dbfe7）。

### 22a1a8b | qist
Merge pull request #402 from anupamme/fix-repo-xray-ui-session-type-assertion-auth-bypass

### 8d7b294 | qist
Merge pull request #401 from qist/dependabot/github_actions/docker/login-action-4.5.2

### 4ec7757 | dependabot[bot] (2026-07-31 延续合并)
**Bump docker/login-action from 4 to 4.5.2**
- `.github/workflows/docker.yml`

---

## 12dbfe7 | qist （本地验证后提交，tag v26.08.01-fix1）

**fix: 修正 GetLoginUser 类型断言 —— 经本地 gob 实测确认应断言为值类型 model.User**

排查过程：
- anupamme 的修复把 `obj.(model.User)` 改为带 ok 检查，方向正确但描述夸大。
- 一度将断言改为 `*model.User`（指针），本地编译通过，但实际登录失败。
- 经最小复现测试（模拟 gorilla/sessions 的 gob 序列化路径）确认：
  - `SetLoginUser` 存入 `*model.User`，但因 `gob.Register(model.User{})` 注册的是**值类型**，
    gob 解码回 `interface{}` 时得到的是 `model.User`（值），`model.User` 断言 ok=true，
    `*model.User` 断言 ok=false。
  - 故断言成指针会导致 GetLoginUser 永远返回 nil → 登录失效。
- 最终结论：恢复值类型断言 `obj.(model.User)` 并保留 ok 检查，既防 panic 又能正确取登录用户。

验证：
- `go build ./...` 通过
- `go vet ./web/session/` 通过
- gob 实测：decoded type = model.User，model.User ok=true，*model.User ok=false

变更文件：
- `web/session/session.go` — GetLoginUser 使用 `obj.(model.User)` 值类型断言 + ok 检查

---

## 今日 tag
- v26.08.01 （42ac0a6，sqlite 替换 + 版本号）
- v26.08.01-fix1 （12dbfe7，session 登录修复）
