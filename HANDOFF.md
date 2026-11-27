# 拉屎大作战 — AI 协作交接文档

> 面向接手的 AI：读完本文档即可独立改代码、验证、部署、推送、迭代。
> 面向用户的简介见 `README.md`。

---

## 0. 一句话现状

H5 长按憋屎小游戏，**纯静态**（无构建步骤）。**2026-11-27 新增便池存档**：便池最多 5 坨、满池点「🚽 冲马桶」才转入背包；`ls_save_v1` 持久化 `bag/toilet`，刷新后屎堆原样恢复，旧 `ls_best` 迁移为背包起始值，云端按 ≤50 分段同步。线上双地址：短地址 `github.io`（iframe 包装）→ 内嵌 CloudBase 静态托管的游戏本体。账号系统走 CloudBase PG 模式。最近一次提交 `187f8a0`（2026-11-27，打赏入口 + 内嵌广告位），玩法为「按住蓄力、捏满一坨即飞出落进地上的屎堆、计 1 分、松手退回」。飞出的屎是与角色完全相同的造型（带脸/皮肤/眨眼），走 JS 真抛物线 + 挤压弹射（duang）+ 粒子爆发，飞出瞬间带惊奇脸（charge 320ms），原坨立即清空回种子态。屎堆最多 20 坨，重置清空。变现：HUD 顶栏 💖「支持作者」打赏入口 + 三种内嵌广告位（底部 banner / 结算插屏 / 开屏·复活），均由 `config.js` 的 `SUPPORT` / `ADS` 驱动；当前线上为空配置降级态（不显示任何广告、不打断玩法），填配置后跑 `deploy.ps1` 生效（详见 §10）。

---

## 1. 必须遵守的约定

1. **改完必须验证**：用真机浏览器（Playwright）验证，不要只做静态检查。见 §4。
2. **改完必须部署**：改 `game.html`/`game.js`/`cloud.js`/`config.js` 后跑 `deploy.ps1`，否则线上不变。见 §5。
3. **改完必须推送**：用镜像推送（见 §5.2），本机直连 GitHub 不通。
4. **不要动的东西**：
   - `config.js` 的 `ENV`（环境 ID）——除非换环境。
   - `cloud.js` 的账号表逻辑与 `ls_users` 表结构——已跑通，改了要重配数据库。
   - `index.html`（根目录）——它是 iframe 包装页，短地址靠它；游戏本体是 `game.html`。
5. **文件命名**：临时脚本用 `_` 前缀（如 `_verify.js`），**迭代结束必须清理**，不要提交。
6. **不要主动改玩法门槛**：短按不计分、长按憋满才计分是当前产品决策（用户 2026-11-26 确认）。

---

## 2. 环境与工具

| 项 | 值 / 路径 |
|---|---|
| 工作区 | `c:/Users/Administrator/CodeBuddy/20261121180127`（临时脚本放这里） |
| 项目目录 | `c:/Users/Administrator/CodeBuddy/拉屎` |
| Node | `C:\Users\Administrator\.workbuddy\binaries\node\versions\22.22.2\node.exe`（无系统 node 命令；但 node 已在用户 PATH，直接用 `node` 通常可行） |
| Playwright | playwright-core 已装在 `C:\Users\Administrator\CodeBuddy\20260402085532\node_modules`，需设 `$env:NODE_PATH` 指向它 |
| 浏览器 | `C:\Users\Administrator\.cache\hyperframes\chrome\chrome-headless-shell\win64-152.0.7977.30\chrome-headless-shell-win64\chrome-headless-shell.exe` |
| 本地静态服务 | `python -m http.server 8130 --bind 127.0.0.1`，工作目录设为项目目录 |
| CloudBase CLI | `tcb` 已全局安装且**凭据已持久化登录**（`tcb env list` 可见 `la-shi-d9g35yrnaef3ef5b9`） |
| 环境 ID | `la-shi-d9g35yrnaef3ef5b9` |
| CloudBase 托管域名 | `https://la-shi-d9g35yrnaef3ef5b9-1359624150.tcloudbaseapp.com/` |
| GitHub 仓库 | `https://github.com/kegaiisyou/la-shi` |
| Git remote | `https://gh-proxy.com/https://github.com/kegaiisyou/la-shi.git`（镜像，非直连） |

**关键环境坑（务必记住）**：
- `github.com:443` 直连不通，git push 必须走 `gh-proxy.com` 镜像。
- 本机 `replace_in_file` 对本项目文件曾出现"假成功"，**改文件一律用 Python 原生 IO 写回并核对**：`io.open(p,'w',encoding='utf-8',newline='')`。行尾用 `raw.replace('\r\n','\n')` 归一化，写回时按原风格还原。
- PowerShell `Get-Content` 读中文文件需指定编码，否则可能被守卫拦截或乱码。
- `delete_file` 工具只能删工作区内的文件；项目目录在外，删临时文件用 Python `os.remove`。
- 用户 API 密钥（SecretId/SecretKey）曾提供过，但**不要写进任何文件**；CLI 登录态已持久化，正常部署不需要密钥。若 CLI 凭据丢失，需向用户重新索取。

---

## 3. 架构与文件职责

```
拉屎/
├── index.html        # 短地址入口：iframe 包装，指向 CloudBase 托管域名（不要当游戏本体改）
├── docs/index.html   # 备用 iframe 包装页（Pages 曾切到 /docs，后切回 /，保留作备份）
├── game.html         # 游戏本体结构：CSS + SVG 角色模板 + DOM 骨架（无内联 JS）
├── game.js           # 全部游戏逻辑：弹簧物理/粒子/音效/皮肤/账号 UI/长按蓄力
├── cloud.js          # CloudBase 账号层：匿名登录 + rdb（Supabase 风格）读写 ls_users
├── config.js         # ENV / TABLE / SAVE_DEBOUNCE_MS / SUPPORT（打赏）/ ADS（广告位）
├── deploy.ps1        # 一键部署脚本：上传 4 文件到 CloudBase 静态托管
├── README.md         # 面向用户的说明
└── HANDOFF.md        # 本文档（面向 AI）
```

**线上链路**：
```
用户 → github.io/la-shi/ (iframe 包装)
     → CloudBase 托管域名 (game.html as index.html)
     → game.js 内 window.CloudAuth (cloud.js)
     → CloudBase rdb → ls_users 表
```

**为什么用 iframe**：CloudBase 免费版不能把 `github.io` 加进跨域白名单（跨域设置要付费版），直接在 GitHub Pages 调 API 会被 CORS 拦。iframe 让游戏跑在 CloudBase 自己域名下，跨域自动放行，用户仍看到短地址。

---

## 4. 标准迭代流程（每次改动都走一遍）

### 4.1 改代码
- 视觉/CSS/SVG 结构 → `game.html`
- 玩法/动画/粒子/音效/交互 → `game.js`
- 账号/数据库 → `cloud.js`（改前先读 §6 坑）
- 环境参数 → `config.js`
- 用 Python 原生 IO 写回，改完 `node --check game.js cloud.js config.js`（game.html 是 HTML 不用 check）

### 4.2 真机验证（必做）

起本地服务（若未运行）：
```powershell
Start-Process -FilePath "python" -ArgumentList "-m http.server 8130 --bind 127.0.0.1" -WorkingDirectory "c:/Users/Administrator/CodeBuddy/拉屎" -WindowStyle Hidden
```

写验证脚本到工作区（示例骨架）：
```js
const { chromium } = require('playwright-core');
(async () => {
  const exe = 'C:\\Users\\Administrator\\.cache\\hyperframes\\chrome\\chrome-headless-shell\\win64-152.0.7977.30\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
  const browser = await chromium.launch({ executablePath: exe });
  const page = await browser.newPage({ viewport: { width: 390, height: 780 }, hasTouch: true, isMobile: true });
  const errs = [], cerr = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') cerr.push(m.text()); });
  await page.goto('http://127.0.0.1:8130/game.html?t=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1800);
  // ... 这里放针对本次改动的断言 ...
  console.log(JSON.stringify({ /* 结果 */, errs, cerr }, null, 2));
  await browser.close();
})();
```
运行：
```powershell
cd "c:/Users/Administrator/CodeBuddy/20261121180127"
$env:NODE_PATH = "C:\Users\Administrator\CodeBuddy\20260402085532\node_modules"
node _verify.js
```
要求：`errs` 和 `cerr` 都必须为空。

**当前玩法的验证要点**：
- 短按（pointerdown 立刻 pointerup）= **不计分**（产品决策）
- 长按约 0.87 秒憋满 = 计 1 分；按住 2 秒 ≈ 2 分
- 连击 15 解锁墨镜、连击 30 解锁超人（`window` 上无直接 API，靠 `localStorage.ls_combo_best` 和皮肤面板 `.locked` 判断）
- 皮肤切换后 `localStorage.ls_skin` 持久化
- 页面 `document.hidden=true` 时动画暂停
- 云端模式：短地址（iframe）内 frame 的 `#mode` 显示「云端」

**动画元素验证坑**：角色有 idle 摆动，`locator.click()` 会因元素"不稳定"超时——用 `page.evaluate` 派发 `PointerEvent` 或 `click({force:true})`。

### 4.3 部署到线上
```powershell
powershell -ExecutionPolicy Bypass -File "c:/Users/Administrator/CodeBuddy/拉屎/deploy.ps1"
```
脚本把 4 个文件传上去（本地 `game.html` → 云端 `/index.html`）。**Game.js 等改动必须跑这个，否则线上不变。**

线上验证（短地址 + iframe）：
```js
await page.goto('https://kegaiisyou.github.io/la-shi/?v=' + Date.now(), { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);
const frame = page.frames()[1]; // iframe 内的游戏页
// 在 frame 上做断言，如 frame.locator('#poop svg .tier').count()
```

### 4.4 推送 GitHub（镜像 + token）

`gh` CLI 未安装；git credential（Windows 凭据管理器）里有 `kegaiisyou` 的 token，但 `git credential fill` 在 PowerShell 直接管道会失败，需用 bat 文件：

创建临时 `_cred.bat`（工作区）：
```bat
@echo off
echo protocol=https> "%TEMP%\gitcred.txt"
echo host=github.com>> "%TEMP%\gitcred.txt"
echo.>> "%TEMP%\gitcred.txt"
git credential fill < "%TEMP%\gitcred.txt" > "%TEMP%\gitcredout.txt" 2>"%TEMP%\gitcrederr.txt"
del "%TEMP%\gitcred.txt"
```

创建临时 `_push.ps1`（工作区），读 token（不打印）、commit、走镜像 push、还原 remote：
```powershell
cmd /c "<工作区>/_cred.bat" 2>$null | Out-Null
$credPath = Join-Path $env:TEMP 'gitcredout.txt'
$lines = Get-Content $credPath
[System.IO.File]::Delete($credPath)
[System.IO.File]::Delete((Join-Path $env:TEMP 'gitcrederr.txt'))
$tok = ($lines | Where-Object { $_ -like 'password=*' }) -replace 'password=',''
$repo = "c:/Users/Administrator/CodeBuddy/拉屎"
& git -C $repo add -A 2>&1 | Out-Null
& git -C $repo commit -m "<描述>" 2>&1 | Out-Null
$url = "https://kegaiisyou:$tok@gh-proxy.com/https://github.com/kegaiisyou/la-shi.git"
$env:GIT_TERMINAL_PROMPT = '0'
& git -C $repo push $url main 2>&1 | Out-Null
& git -C $repo remote set-url origin "https://gh-proxy.com/https://github.com/kegaiisyou/la-shi.git"
```

> push 时 PowerShell 会把 git 的 stderr 进度包装成 NativeCommandError 红字，但只要输出有 `main -> main` 就是成功。

### 4.5 收尾
- 删除工作区所有 `_*.js`/`_*.ps1`/`_*.bat`/`_*.py` 临时脚本（用 `delete_file`）
- 更新 `README.md`（若玩法/地址/部署方式变化）
- 更新本文档 §0 现状与 §7 历史

---

## 5. 账号系统（CloudBase PG 模式）

- **环境**：PG 模式（新建环境默认），数据库是 PostgreSQL，**不是**旧版文档型集合。
- **初始化**：`app = cloudbase.init({ env })`；`db = app.rdb()`（Supabase 风格 `.from().select()/.eq()/.insert()/.update()`）。
- **认证**：`app.auth().signInAnonymously()`，JWT 角色是 **`anon`**（不是 `authenticated`）。
- **表**：`public.ls_users`，列：`id / username / nickname / salt / pass / best / created_at`。
  - 坑：`user` 是 PG 保留字，列名必须是 `username`。
  - 坑：必须给 `anon` 授予 INSERT/UPDATE 权限 + RLS policy，否则注册报 `permission denied`（详见 README）。
- **密码**：`salt + '|' + pass` 的 SHA-256，前端算，不明文存库。
- **登录态**：localStorage `ls_me`，刷新免登录。
- **分数**：`ls_best` 本地最高分；登录后 `pushBest` 防抖 1.5s 写云端；排行榜按 `best` 倒序 Top 20。
- **跨设备域名**：`github.io` 无法加白名单（要付费版），靠 iframe 绕过；本地 localhost 默认放行。

---

## 6. 历史坑与已修问题（别重复踩）

| 问题 | 根因 | 现状 |
|---|---|---|
| 点击/Q弹动画不生效 | `.idle` 动画定义在 `.pop` 之后，CSS 覆盖了点击动画 | 已修（`!important` + 弹簧物理驱动） |
| 注册报 `permission denied` | 匿名登录 JWT 角色是 `anon`，只给 `authenticated` 授了写权限 | 已补 `anon` 的 GRANT + POLICY |
| `user` 列报错 | PG 保留字 | 已改 `username` |
| 线上 CORS 拦截 | github.io 不在白名单且免费版不能加 | 已用 iframe 包装绕过 |
| GitHub Pages 换 source 后不刷新 | CDN 缓存顽固 | 已改回根目录 index.html 做包装，不用 /docs |
| 游戏大改后线上没变 | 忘了跑 deploy.ps1 | 每次改完必跑 |
| `game.js` 有 BOM | 编辑器保存带 `\ufeff` | 已去，注意别再加 |
| 皮肤面板关闭后提示消失 | `classList.add('gone')` 与 `style.display=''` 两套机制混用 | 已统一为只用 `gone` class |
| idle 动画导致 Playwright 点击超时 | 元素一直在动，被判"不稳定" | 用 `force:true` 或 `dispatchEvent` |
| 动画元素静止时仍每帧写 DOM | 4 段 tier 每帧 setAttribute | 已加活跃度判定，静止隔帧写 |
| 临时截图/脚本混入仓库 | 豆包改版时留下 `_*.png`/`_*.py` | 迭代结束必须清理 |
| 防刷榜不能靠 RLS 的 JWT sub | 实测 CloudBase PG 网关不把 JWT `sub` 注入 `request.jwt.claim.sub`（RLS 里为 NULL），云函数客户端调用默认 `EXCEED_AUTHORITY` | 改用 `anon_uid` 唯一索引 + 触发器增量上限；彻底防刷榜需控制台配置云函数权限后服务端写分 |

---

## 7. 迭代历史（git log）

```
（未提交）feat: 便池存档 + 冲马桶入袋（ls_save_v1，满 5 冲水，best 改累计入袋口径）
187f8a0 feat: 打赏入口 💖「支持作者」+ 三种内嵌广告位（config.js SUPPORT / ADS 驱动）
2b38e77 feat: 捏出即飞走的屎堆 + 抛物线弹射 + 惊奇表情 + 长按防选中
60585c3 feat: 长按蓄力憋屎玩法 + 压力仪表 + 修 hint 恢复 bug
834a72a feat: 四段软体角色 + 堆叠效果（豆包美术）+ 修 BOM 与静止隔帧写入
b9812da perf: 粒子空转跳过/30fps背景/页面隐藏暂停 + 连击解锁皮肤 + JS 拆分为 game.js
2c3c1c3 feat: 挤出拉长动画 + 拉丝效果 + 墨镜屎/超人屎皮肤
c5ea92e feat: Q弹点击动画 + 7 款皮肤（按最高分解锁）
db332e7 feat: 添加一键部署脚本 deploy.ps1 并更新文档
```

187f8a0 feat: 打赏入口 💖「支持作者」+ 三种内嵌广告位（config.js SUPPORT / ADS 驱动，含 outputs 测评报告存档）
更早：iframe 包装、CloudBase PG 适配、username 列名修复等（见 `git log`）。

**美术来源**：`game.html` 的 SVG 角色与多轮视觉迭代由「豆包」完成；接入/修复/部署由本 AI 完成。后续美术协作可继续让豆包改 `game.html` 的 SVG/CSS，但**改完必须走 §4 验证+部署+推送流程**。

---

## 8. 当前玩法速查（改玩法前先读）

- 交互：**pointerdown 开始按住**，持续约 0.87 秒憋满 → `burst()` 一坨飞出落地堆着、+1 坨进便池（满 5 才冲水入袋）；未满松手 → 憋回去（pq 回落）。飞出的屎 = 双层元素：外层 flyers 数组在 tick 里跑抛物线位移（vx 匀速 + vy0 向上 + g=2100），内层 CSS `poopLaunch` 负责压扁→弹射→落地回弹（时长 `--flydur` 与 JS 飞行时间同步）。`resetToSeed()` 必须**立即**调用（不能延迟，否则出现两坨），惊奇表情靠给飞出的 el 加 `charge` class 320ms 实现。
- 长按防选中：`*` 全局 `-webkit-user-select:none; user-select:none; -webkit-touch-callout:none;` + `selectstart` 拦截（INPUT/TEXTAREA 除外，登录框要能打字）。
- 连击：1.15 秒内连续爆出累计 combo；15 解锁墨镜、30 解锁超人（`unlockByCombo`）。
- 皮肤：9 款，按 `best`（= `bag` 累计入袋数）或 `comboBest`（`ls_combo_best`）解锁；彩虹有流光动画；墨镜/超人是 SVG 装饰。
- 升级：`need(n) = 10 * n²`；`lv` 由 `bag` 反算（`levelFrom()`），冲水后一次性升级，不再按单局分数。
- 存档：`ls_save_v1 = {v:1,bag,toilet}`；`bag` 同时镜像到 `ls_best` 与云端 `best`。满池拦截在 `pressOn()` 和 `burst()` 双保险；冲水函数 `flushToilet()`；刷新恢复用 `restorePile()` 的 `instant` 模式（不播飞行动画）。
- 音效：WebAudio 合成（无外部音频文件），有静音开关 `ls_mute`。
- 无障碍：尊重 `prefers-reduced-motion`；角色可键盘操作（Space/Enter）。

---

---

## 9. 刷榜漏洞根治（2026-11-26）

**问题**：旧 UPDATE policy 是 `USING(true) WITH CHECK(true)`，anon 可直接改任意用户 `best`，只受"单次增量 ≤50"触发器限制——攻击者反复调用即可把任何人刷上榜首。

**探索过的死路**：原计划开云函数权限走服务端写分。实测此 PG 环境 Web 匿名登录态 `callFunction` 在 `tcbopenapi` 链路下被平台默认拒绝（`EXCEED_AUTHORITY`）；OPA 策略（用 `tcb policy set`）无论 `allow if {true}` / `allow if {rt==functions, at==anon}` 都无法覆盖——deny 规则能回显生效、allow 不能翻盘。`DescribeResourcePermission`/`ModifyResourcePermission` 均报"当前 API 不支持 PostgreSQL 环境"。**结论：此环境 Web 匿名不能调云函数，别再走这条路。**

**关键突破**：数据库**有 `auth.uid()` 函数**（`auth` schema），Web 匿名登录态下它返回当前 JWT sub（实测与 `auth.getLoginState().user.sub` 完全一致）。此前误判"RLS 拿不到 uid"是因为查了 `current_setting('request.jwt.claim.sub')`（该键确为 NULL）——**正确姿势是用 `auth.uid()`**。

**最终方案**：RLS 行级隔离，无需云函数、无需改客户端代码：
```sql
DROP POLICY IF EXISTS ls_anon_update ON public.ls_users;
CREATE POLICY ls_anon_update ON public.ls_users FOR UPDATE TO anon
  USING (anon_uid = auth.uid()) WITH CHECK (anon_uid = auth.uid());
DROP POLICY IF EXISTS ls_update ON public.ls_users;
CREATE POLICY ls_update ON public.ls_users FOR UPDATE TO authenticated
  USING (anon_uid = auth.uid()) WITH CHECK (anon_uid = auth.uid());
```
- 玩家只能改自己 `anon_uid = auth.uid()` 那一行，改别人返回 0 行（RLS 静默过滤，不报错）。
- 配合既有触发器（增量 ≤50、anon_uid 不可变、best 非负）。
- **实测**：两个独立匿名身份 A/B，A 改自己 best→成功(30)，A 改 B→`data:[]`；线上全流程（注册/登录/pullBest/pushBest=42/排行榜命中）全绿、0 pageerror。

**副作用**：`anon_uid IS NULL` 的历史账号（早期测试号）不再能被任何人改分——预期行为，真实玩家注册时均绑定。

**环境残留状态**：
- OPA 策略当前为 `package authz.user / allow if { true }`（全放行，游戏不用云函数，无影响；无删除命令只能 set）。
- 探针云函数 `lsProbe` 已删除；诊断函数 `dbg_my_uid*` 已删除；测试账号已清空。
- 临时文件 `cloudbaserc.json` / `functions/` 及 `_*.py`/`_*.js` 探针在收尾时清理。

**最后更新**：2026-11-26（RLS 行级隔离根治刷榜）

---

## 10. 打赏 / 赞助入口 + 内嵌广告位（2026-11-26）

个人无执照方案，**不接广告联盟**（资质+备案+流量门槛高，单页 H5 收益低），走爱发电 / 微信 / 支付宝收款码。

- 入口：`game.html` HUD 顶栏 `.hud-acts` 内的 `#supportBtn`（💖）；面板 `#supportOverlay`。
- 配置：`config.js` 的 `SUPPORT = { ENABLED, AFDIAN, WECHAT_QR, ALIPAY_QR, NOTE }`。
  - `AFDIAN`：爱发电主页链接（个人可开，无需执照）。
  - `WECHAT_QR` / `ALIPAY_QR`：收款码图片，可填完整 URL 或 `data:image/png;base64,...`（**base64 写法无需额外传图**，改完跑 `deploy.ps1` 即可）。
  - `ENABLED: false` 完全隐藏入口；全部留空时面板显示「分享给朋友」降级文案，不报错。
- 逻辑：`game.js` 第 12.5 节读 `window.LS_CONFIG.SUPPORT` 动态渲染；`supEsc()` 做属性转义；关闭按钮 + 点遮罩均可用。
- 部署：改 `config.js` 后必须跑 `deploy.ps1`（它会上载 config.js 到云端）。
- 验证：`_verify_support.js`（已清理）真机覆盖空配置 / 有配置 / 两种关闭 / 皮肤面板回归，0 pageerror + 0 consoleError；线上 iframe 同样通过。

### 内嵌广告位（`config.js` 的 `ADS`）

同样走个人无执照方案：**不接广告联盟**（资质/备案/iframe/流量门槛），自建广告位，图片+链接配置化，留空完全不显示。

- 四种配置：`BANNER`（footer 底部常驻矮条）、`INTERSTITIAL.EVERY`（每 N 次爆屎弹一次插屏，0=关闭）、`OPEN`（开屏，`ONCE_PER_SESSION` 会话去重）、`REVIVE`（点「重新开始」时先弹，关掉才真正重置）。
- 每个位填 `IMAGE` 才生效；`LINK` 点击跳转、`TEXT` 文案、`TITLE` 标题、`CLOSE_TEXT` 关闭按钮文案。
- 插屏/开屏/复活共用 `#adOverlay` 动态渲染；`#adClose` 和点遮罩都可关闭。复活广告的关闭回调 `adAfterClose` 执行真正的 `doReset()`，所以分数在广告关掉前保持不变。
- `adBurstCount` 在 `burst()` 的 `toilet++` 后累加；`ADS.ENABLED:false` 或 `IMAGE` 留空时全部不生效，玩法零影响。
- 验证：`_verify_ads.js`（已清理）真机覆盖空配置降级 / banner 渲染 / 插屏触发与关闭 / 复活拦截与重置 / 开屏会话去重 / 皮肤与打赏回归，0 pageerror + 0 consoleError。

---

## 11. 便池存档 + 冲马桶入袋（2026-11-27）

**需求**：玩家每次重开网页便便归零；改成有上限的便池（5 坨），满 5 后点「冲马桶」才把 5 坨转入背包。

**口径变更（必须记住）**：`best` 不再是"单局最高分"（便池上限 5 会让皮肤/等级/榜单全废），而是**累计入袋数 `bag`**。页面大数字、`ls_best`、皮肤解锁、`levelFrom(bag)`、云端 `ls_users.best`、排行榜全部同口径。旧 `ls_best` 迁移为 `bag` 起始值，不丢老进度。

**实现要点**：
- `game.js` 状态：`TOILET_CAP=5`、`bag`、`toilet`、`SAVE_KEY='ls_save_v1'`；`loadSave()`/`persist()` 读写 `{v:1,bag,toilet}`，并镜像 `ls_best`。
- `burst()`：满池直接 return（`pressOn()` 也拦并 toast）；正常一坨只 `toilet++`，不升等级、不解锁皮肤。
- `flushToilet()`：`toilet<=0` 提示；把 `landed` 元素加 `.flushed` 播冲走动画，460ms 后 `clearLanded()`；`bag += toilet`、`toilet=0`、`persist()`、`scheduleSave()`，再统一处理升级/解锁/音效/震动/飘字。
- 解锁判定改成 `oldBag < need && bag >= need`，避免冲水跨过整 5 时漏解锁。
- 「重新开始」`doReset()` 只清便池，不动背包。
- 刷新恢复：`spawnLandedPoop(..., instant=true)` 直接落位并加 `.instant` 关掉飞出动画；`restorePile()` 在启动 `loadSave()` 之后调用。
- 云端 `best` 有单次增量 ≤50 的触发器，`syncBagToCloud()` 用 `pullBest` + `pushBest` 每轮最多 +50 分段追平（老档 300 分也能上云）；`scheduleSave()` 防抖后调它。登录/启动时云端值更高则覆盖本地，更低则反向分段同步。

**验证**：`_verify_toilet.js`（临时脚本，验证后清理）真机 8 项全绿：初始态、5 坨入池、刷新保留 5 坨+落地堆、满池拦截、冲水后 bag=5/toilet=0、存档写入、再刷新保留、旧档 `ls_best=37` 迁移；0 pageerror + 0 consoleError。满池截图 `_toilet_full.png` 检查布局无溢出。
