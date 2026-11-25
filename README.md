# 拉屎大作战

一个 H5 点击小游戏。点击 💩 累计分数、按平方曲线升级；接入腾讯云 CloudBase 后可**跨设备登录、云端存分、排行榜**。

## 快速体验（本地模式）

双击 `index.html` 即可玩，或：

```bash
python -m http.server 8000
# 打开 http://localhost:8000
```

未配置 CloudBase 时数据只存在浏览器 `localStorage`，换设备会丢。

## 接入 CloudBase 账号系统（4 步）

### 1. 创建环境

进入 [腾讯云 CloudBase 控制台](https://console.cloud.tencent.com/tcb)，新建环境（按量计费，有免费额度）。记下**环境 ID**，形如 `la-shi-8gxxxxxx`。

### 2. 开启匿名登录

控制台 → **登录授权**（身份认证）→ 登录方式 → 打开 **匿名登录**。
（本游戏用匿名登录取得数据库访问权，用户账号由游戏自己管理，无需配置 SMTP 邮箱。）

### 3. 建数据库集合

控制台 → **数据库** → 新建集合，名字填 `ls_users`。
权限建议先设为「**所有用户可读，所有用户可写**」（小游戏够用；正式产品可配合安全规则收紧）。

### 4. 填环境 ID

编辑 `config.js`：

```js
window.LS_CONFIG = {
  ENV: '你的环境 ID',   // ← 改这里
  COLLECTION: 'ls_users',
  SAVE_DEBOUNCE_MS: 1500
};
```

重新部署到 GitHub Pages 后即可注册/登录、云端同步最高分、查看排行榜。

## 账号机制说明

- 注册时用户名转小写、去除非法字符；密码用 Web Crypto SHA-256 **加随机盐**哈希后存库，不明文保存。
- 登录态（用户名/昵称）存浏览器 `localStorage`，刷新不用重新登录；点「退出」清除。
- 最高分变更防抖 1.5 秒写入云端；登录时拉取云端最高分与本机比较取大值。
- 排行榜按 `best` 倒序取前 20。

> 注意：这是**小游戏级别**的账号方案，不是金融级鉴权。密码哈希在前端完成，安全规则全开时他人可读取集合数据。若要严谨隔离，建议后续改用 CloudBase 邮箱登录 + 安全规则「仅创建者可读写」。

## 文件结构

| 文件 | 作用 |
|------|------|
| `index.html` | 游戏界面 + 登录/注册/排行榜 UI |
| `cloud.js` | CloudBase 账号层（注册/登录/读写分数/排行榜） |
| `config.js` | 环境 ID 与参数配置 |
| `README.md` | 本文档 |

## GitHub

仓库：https://github.com/kegaiisyou/la-shi

本机 `github.com:443` 直连不通，remote 已设为镜像地址 `https://gh-proxy.com/https://github.com/kegaiisyou/la-shi.git`。推送时若需要凭据，用 Windows 凭据管理器里 `git:https://github.com`（用户 `kegaiisyou`）即可。
