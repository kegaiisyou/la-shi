# 拉屎大作战

H5 点击小游戏。点击 💩 累计分数、升级；接入腾讯云 CloudBase（PG 模式）后可**跨设备登录、云端存分、排行榜**。

## 快速体验（本地模式）

双击 `index.html` 即可玩，或 `python -m http.server 8000` 后访问 `http://localhost:8000`。
未配置 CloudBase 时数据只存浏览器 `localStorage`，换设备会丢。

## 线上地址

https://kegaiisyou.github.io/la-shi/

## CloudBase 配置（已完成）

- 环境 ID：`la-shi-d9g35yrnaef3ef5b9`（已填入 `config.js`）
- 匿名登录：已开启
- PG 模式：新版控制台无「Web 安全域名」选项，无需配置

### 建表 SQL（注意 `username` 不是 `user`，`user` 是 PG 保留字）

控制台 → 左侧 **PostgreSQL** → SQL 编辑器，粘贴执行，弹窗点 **「仍要执行」**：

```sql
CREATE TABLE IF NOT EXISTS public.ls_users (
  id bigserial PRIMARY KEY,
  username text UNIQUE NOT NULL,
  nickname text NOT NULL,
  salt text NOT NULL,
  pass text NOT NULL,
  best integer NOT NULL DEFAULT 0,
  created_at bigint NOT NULL
);

ALTER TABLE public.ls_users ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.ls_users TO authenticated;
GRANT SELECT ON public.ls_users TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.ls_users_id_seq TO authenticated;

CREATE POLICY ls_read ON public.ls_users FOR SELECT TO authenticated USING (true);
CREATE POLICY ls_insert ON public.ls_users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY ls_update ON public.ls_users FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY ls_anon_read ON public.ls_users FOR SELECT TO anon USING (true);
```

> 如果之前执行过带 `user` 列的旧 SQL 并部分成功，先执行 `DROP TABLE IF EXISTS public.ls_users CASCADE;` 再执行上面整段。

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
