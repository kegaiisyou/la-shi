# 拉屎大作战

H5 点击小游戏。点击 💩 累计分数、升级；接入腾讯云 CloudBase（PG 模式）后可**跨设备登录、云端存分、排行榜**。

## 快速体验（本地模式）

双击 `index.html` 即可玩，或 `python -m http.server 8000` 后访问 `http://localhost:8000`。
未配置 CloudBase 时数据只存浏览器 `localStorage`，换设备会丢。

## 接入 CloudBase 账号系统

> 你的环境是 **PG 模式**（新建环境默认如此），必须用 SQL 建表 + `app.rdb()`，不能用旧版文档型集合。

### 1. 拿环境 ID

控制台 → 左侧「环境管理」或顶部环境下拉，复制完整环境 ID（形如 `la-shi-8gxxxxxx`，不是显示名 `la-shi`）。

### 2. 开启匿名登录

控制台 → **身份认证** → 登录方式 → 打开 **匿名登录**。
（底部"待办事项"里那条「已配置·匿名登录」就是它。）

### 3. 建表 + 权限（SQL 编辑器）

控制台 → 左侧 **PostgreSQL** → SQL 编辑器 / 数据管理，执行：

```sql
CREATE TABLE IF NOT EXISTS public.ls_users (
  id bigserial PRIMARY KEY,
  user text UNIQUE NOT NULL,
  nickname text NOT NULL,
  salt text NOT NULL,
  pass text NOT NULL,
  best integer NOT NULL DEFAULT 0,
  created_at bigint NOT NULL
);

ALTER TABLE public.ls_users ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.ls_users TO authenticated;
GRANT SELECT ON public.ls_users TO anon;
GRANT SELECT ON public.ls_users TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.ls_users_id_seq TO authenticated;

-- 允许登录用户读全部（排行榜）与写自己的记录
CREATE POLICY ls_read ON public.ls_users FOR SELECT TO authenticated USING (true);
CREATE POLICY ls_insert ON public.ls_users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY ls_update ON public.ls_users FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY ls_anon_read ON public.ls_users FOR SELECT TO anon USING (true);
```

> 说明：这是小游戏级别方案——所有登录用户可读排行榜、可新增/更新记录（密码已加盐哈希）。若要严格隔离用户数据，可把 `ls_update` 的 USING 加上 `user = current_setting('request.jwt.claims',true)::json->>'sub'` 之类的约束。

### 4. 填环境 ID

编辑 `config.js`：

```js
window.LS_CONFIG = {
  ENV: '你的环境 ID',   // ← 改这里
  TABLE: 'ls_users',
  SAVE_DEBOUNCE_MS: 1500
};
```

重新部署即可注册/登录、云端同步最高分、查看排行榜。

## 账号机制

- 用户名转小写、去非法字符（2-20 字符）；密码 SHA-256 + 随机盐哈希，不明文存库。
- 登录态存 localStorage，刷新免登录；点「退出」清除。
- 最高分变更防抖 1.5 秒写入；登录时拉取云端最高分与本机取大值。
- 排行榜按 `best` 倒序取前 20。

## 文件结构

| 文件 | 作用 |
|------|------|
| `index.html` | 游戏界面 + 登录/注册/排行榜 UI |
| `cloud.js` | CloudBase PG 账号层（匿名登录 + rdb 读写） |
| `config.js` | 环境 ID 与参数配置 |
| `README.md` | 本文档 |

## GitHub

仓库：https://github.com/kegaiisyou/la-shi
本机 `github.com:443` 直连不通，remote 已设为镜像 `https://gh-proxy.com/https://github.com/kegaiisyou/la-shi.git`。
