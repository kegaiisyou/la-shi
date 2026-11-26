# 拉屎大作战

H5 长按憋屎小游戏。按住 💩 蓄力、憋满一格掉一坨计分；带账号系统，可跨设备登录、云端存分、排行榜。

> **AI 协作接手**：请读 [`HANDOFF.md`](HANDOFF.md)——含环境、验证、部署、推送、坑与迭代历史的完整工作流。

## 访问地址

**https://kegaiisyou.github.io/la-shi/** （短地址，推荐）

该页是 iframe 包装，内嵌 CloudBase 静态托管的游戏本体：
`https://la-shi-d9g35yrnaef3ef5b9-1359624150.tcloudbaseapp.com/`

> 为什么用 iframe：GitHub Pages 域名（`github.io`）无法加入 CloudBase 免费版的跨域白名单，从它直接请求会被 CORS 拦截。用 iframe 后游戏在 CloudBase 自己的域名下运行，跨域自动放行，用户看到的地址仍是短的 GitHub Pages 地址。

## 账号系统

- 环境：CloudBase PG 模式，环境 ID `la-shi-d9g35yrnaef3ef5b9`
- 认证：匿名登录 + 自建账号表（`ls_users`）
- 密码：SHA-256 + 随机盐哈希，不明文存库
- 登录态：localStorage，刷新免登录
- 排行榜：按 `best` 倒序 Top 20
- 防批量注册：注册时把当前匿名登录 uid（JWT `sub`）写入 `anon_uid` 列，唯一索引保证**一个设备身份只能注册一个账号**
- 分数保护：RLS 行级隔离（anon 只能更新自己 `anon_uid = auth.uid()` 的那一行）+ 触发器限制单次提交增量 ≤50、`anon_uid` 绑定后不可改

## 文件结构

| 文件 | 作用 |
|------|------|
| `index.html` | 短地址入口（iframe 包装页） |
| `game.html` | 游戏本体结构（UI + SVG 角色模板） |
| `game.js` | 游戏逻辑（渲染/动画/粒子/音效/皮肤/账号 UI） |
| `cloud.js` | CloudBase 账号层（匿名登录 + rdb 读写） |
| `config.js` | 环境 ID 与参数配置 |
| `docs/index.html` | 备用 iframe 包装页 |
| `README.md` | 本文档 |

## 部署说明

### 游戏本体改了之后（一键部署）

改完 `game.html` / `game.js` / `cloud.js` / `config.js` 后，在项目目录运行：

```
powershell -ExecutionPolicy Bypass -File deploy.ps1
```

脚本会自动把 4 个文件上传到 CloudBase 静态托管（本地 `game.html` 传成云端 `/index.html`）。
前提：本机 `tcb` CLI 已登录（`tcb env list` 能看到 `la-shi-d9g35yrnaef3ef5b9`），凭据由 CLI 持久化保存，无需密钥。

短地址（GitHub Pages）无需改动，它只是 iframe 包装。只有改短地址页面本身才需要 git 提交推送。

### 数据库权限（已配置）

```
GRANT SELECT, INSERT, UPDATE ON public.ls_users TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.ls_users_id_seq TO anon;
CREATE POLICY ls_anon_read ON public.ls_users FOR SELECT TO anon USING (true);
CREATE POLICY ls_anon_insert ON public.ls_users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY ls_anon_update ON public.ls_users FOR UPDATE TO anon USING (anon_uid = auth.uid()) WITH CHECK (anon_uid = auth.uid());
CREATE POLICY ls_update ON public.ls_users FOR UPDATE TO authenticated USING (anon_uid = auth.uid()) WITH CHECK (anon_uid = auth.uid());

-- 防批量注册：一个匿名身份只能注册一个账号
ALTER TABLE public.ls_users ADD COLUMN IF NOT EXISTS anon_uid text;
CREATE UNIQUE INDEX IF NOT EXISTS ls_users_anon_uid_uniq ON public.ls_users(anon_uid) WHERE anon_uid IS NOT NULL;

-- 分数保护：单次增量 ≤50、anon_uid 不可改
CREATE OR REPLACE FUNCTION public.ls_users_guard() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.anon_uid IS DISTINCT FROM NEW.anon_uid THEN
    RAISE EXCEPTION 'anon_uid immutable';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.best > OLD.best AND NEW.best - OLD.best > 50 THEN
    RAISE EXCEPTION 'score jump too large';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.best < 0 THEN
    RAISE EXCEPTION 'negative score';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_ls_users_guard ON public.ls_users;
CREATE TRIGGER trg_ls_users_guard BEFORE UPDATE ON public.ls_users FOR EACH ROW EXECUTE FUNCTION public.ls_users_guard();
```

> 关键坑：匿名登录的 JWT 角色是 `anon` 不是 `authenticated`，必须给 `anon` 授予读写权限，否则注册报 `permission denied for table ls_users`。

> 刷榜防护（2026-11-26 已根治）：`auth.uid()` 在 Web 匿名登录态下**确实返回当前用户 JWT sub**（实测与 `auth.getLoginState().user.sub` 一致），只是此前查错了 setting 键 `request.jwt.claim.sub`（该键确为 NULL）。因此 UPDATE 策略收紧为 `anon_uid = auth.uid()`：任一玩家**只能改自己账号那一行**，无法改别人分数。实测：A 改自己 best 成功、改 B 的 best 返回 0 行。配合增量 ≤50 触发器，既防篡改他人，也防单次暴涨。
>
> 说明：无需云函数服务端写分。此前尝试 OPA 放通 Web 匿名 `callFunction` 失败（此 PG 环境 `tcbopenapi` 链路下 `anon` 身份调用云函数被平台默认拒绝，OPA 用户 allow 无法覆盖），行级隔离是更简洁可靠的方案。
>
> 旧账号兼容：`anon_uid` 为 NULL 的历史账号（如早期测试号）不再能被任何人更新分数——这是预期行为，真实玩家账号注册时均已绑定。

## GitHub

仓库：https://github.com/kegaiisyou/la-shi
本机 `github.com:443` 直连不通，remote 已设为镜像 `https://gh-proxy.com/https://github.com/kegaiisyou/la-shi.git`。
