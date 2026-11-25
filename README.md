# 拉屎大作战

H5 点击小游戏。点击 💩 累计分数、升级；带账号系统，可跨设备登录、云端存分、排行榜。

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

## 文件结构

| 文件 | 作用 |
|------|------|
| `index.html` | 短地址入口（iframe 包装页） |
| `game.html` | 游戏本体（本地开发用，含 UI + 逻辑） |
| `cloud.js` | CloudBase 账号层（匿名登录 + rdb 读写） |
| `config.js` | 环境 ID 与参数配置 |
| `docs/index.html` | 备用 iframe 包装页 |
| `README.md` | 本文档 |

## 部署说明

### 游戏本体改了之后

1. 改 `game.html` / `cloud.js` / `config.js`
2. 上传到 CloudBase 静态托管（注意 CloudBase 用的是 `index.html` 作为入口，所以本地 `game.html` 上传时要传成 `/index.html`）：
   ```
   tcb hosting deploy <本地game.html> /index.html -e la-shi-d9g35yrnaef3ef5b9
   tcb hosting deploy cloud.js /cloud.js -e la-shi-d9g35yrnaef3ef5b9
   tcb hosting deploy config.js /config.js -e la-shi-d9g35yrnaef3ef5b9
   ```
3. 短地址（GitHub Pages）无需改动，它只是 iframe 包装

### 数据库权限（已配置）

```
GRANT SELECT, INSERT, UPDATE ON public.ls_users TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.ls_users_id_seq TO anon;
CREATE POLICY ls_anon_read ON public.ls_users FOR SELECT TO anon USING (true);
CREATE POLICY ls_anon_insert ON public.ls_users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY ls_anon_update ON public.ls_users FOR UPDATE TO anon USING (true) WITH CHECK (true);
```

> 关键坑：匿名登录的 JWT 角色是 `anon` 不是 `authenticated`，必须给 `anon` 授予读写权限，否则注册报 `permission denied for table ls_users`。

## GitHub

仓库：https://github.com/kegaiisyou/la-shi
本机 `github.com:443` 直连不通，remote 已设为镜像 `https://gh-proxy.com/https://github.com/kegaiisyou/la-shi.git`。
