# 拉屎大作战

H5 长按憋屎小游戏。按住 💩 蓄力、憋满一格掉一坨；便池最多存 5 坨，点「冲马桶」后这 5 坨一起进背包（永久累计），刷新或关页都不丢。带账号系统，可跨设备登录、云端同步背包数、排行榜。

> **AI 协作接手**：请读 [`HANDOFF.md`](HANDOFF.md)——含环境、验证、部署、推送、坑与迭代历史的完整工作流。

## 访问地址

**https://kegaiisyou.github.io/la-shi/** （短地址，推荐）

该页是 iframe 包装，内嵌 CloudBase 静态托管的游戏本体：
`https://la-shi-d9g35yrnaef3ef5b9-1359624150.tcloudbaseapp.com/`

> 为什么用 iframe：GitHub Pages 域名（`github.io`）无法加入 CloudBase 免费版的跨域白名单，从它直接请求会被 CORS 拦截。用 iframe 后游戏在 CloudBase 自己的域名下运行，跨域自动放行，用户看到的地址仍是短的 GitHub Pages 地址。

## 容器与背包（存档）

- **容器**：`localStorage.ls_save_v1` 存 `bag`（累计入袋数）、`toilet`（当前容器里的坨数）和 `vesselLevel`（手动升级的档位）；刷新后屎堆原样恢复。
- **手动升级**：默认永远是「夜壶」，不会随分数自动升级。底部「⬆️ 升级 → 下一档」按钮测试期免费推进，升级条件后续再加。`VESSELS[i].need` 目前只是预留字段。
- **20 档容器（按真实容量从小到大）**：夜壶 → 水箱 → 马桶 → 洗手池 → 便槽 → 蹲坑 → 浴缸 → 小水池 → 游泳池 → 池塘 → 湖泊 → 水库 → 江河 → 大海 → 海洋 → 海沟 → 地下海 → 银河 → 星海 → 宇宙。容量 5 → 20 → 80 → … → 1.37 万亿。
- **容量依据**：夜壶约 2.5 升（旧时「每壶能承载 5 斤左右尿液」）；马桶水箱常见 3～6 升、老式 12 升；浴缸满水 230～320 升；家用蓄水池 2～50 立方米；标准泳池约 1890～2500 吨。最高三档收在银河 → 星海 → 宇宙。
- **显示**：容量 ≤8 画格子；>8 只显示数字 + 进度条，超过 1 万用「万 / 亿 / 万亿」紧凑格式；画面最多显示 8 坨，旁边数字标签提示待入袋数量。
- **冲水**：容器里有 1~cap 坨都能冲，满容器按钮高亮；文案和特效按档位变化（冲蹲坑 / 倒夜壶 / 放水箱 / 开水闸 / 倾海 / 调水…）。
- **背包**：页面大数字、`ls_best`、皮肤、等级和云端排行榜统一按累计入袋数计算；「重置账号」经确认后清空背包、容器、皮肤解锁、连击成就、自动助手设置和云端排行榜（`best` 清零），登录态保留。
- **旧档兼容**：老 `ls_best` 自动迁移；老存档没有 `vesselLevel` 时默认夜壶，但会选一个装得下当前存量的最小档，避免刷新丢屎。云端 `ls_users.best` 已扩为 `bigint`。

## 小屎崽助手（自动产出 · 原型）

- 主角左边的小屎崽会按墙钟自动挤屎：默认每 2 分钟一坨，进度环 + 「下坨 mm:ss」倒计时显示状态；产出时挤压、吐出 💩，屎照样飞出落地。
- **容器满了就停产**，不攒零散进度；冲水或升级容器后重新计时。底部「🤖 小屎崽：开/关」可随时切换。
- **离线补算**：玩家离开（关页面/切后台）后按真实时间补产，当前上限 10 分钟；超过上限只算 10 分钟，回到前台/刷新时一次性入容器。用 `setInterval` 墙钟轮询而非 `requestAnimationFrame`（后台会暂停）。
- **离线归来结算卡**：离开 ≥1 分钟且有产出/撞上限/容器满时弹出，列出「离开时长 / 实际补算 / 补了几坨 / 离线上限」，撞上限会明确写出超出多少没算。卡内「⬆️ 升级离线时长」按 `AUTO.OFFLINE_TIERS`（10 分 → 30 分 → 1 小时 → 4 小时 → 24 小时）免费推进，测试期和容器升级一样先跑通，结果写入 `autoOfflineMs`。
- 配置在 `config.js` 的 `AUTO`（`INTERVAL_MS` / `OFFLINE_CAP_MS` / `OFFLINE_TIERS`）；存档 `ls_save_v1` 为 `v:3`，包含 `autoOn`、`lastAutoAt`、`autoOfflineMs`。

## 账号系统

- 环境：CloudBase PG 模式，环境 ID `la-shi-d9g35yrnaef3ef5b9`
- 认证：匿名登录 + 自建账号表（`ls_users`）
- 密码：SHA-256 + 随机盐哈希，不明文存库
- 登录态：localStorage，刷新免登录
- 排行榜：按 `best`（累计入袋数）倒序 Top 20；未登录不会上榜，冲水后即时同步，打开榜单时还会补同步一次
- 防批量注册：注册时把当前匿名登录 uid（JWT `sub`）写入 `anon_uid` 列，唯一索引保证**一个设备身份只能注册一个账号**
- 分数保护：RLS 行级隔离（anon 只能更新自己 `anon_uid = auth.uid()` 的那一行）+ 触发器限制单次提交增量 ≤50、`anon_uid` 绑定后不可改

## 支持作者（打赏入口）

游戏内 HUD 右上角 💖 可打开支持面板。个人无执照方案，不接广告联盟，走爱发电 / 微信 / 支付宝收款码。

在 `config.js` 的 `SUPPORT` 中填写：

- `AFDIAN`：爱发电主页链接（个人可开，无需执照）
- `WECHAT_QR` / `ALIPAY_QR`：收款码图片，可填完整 URL 或 `data:image/png;base64,...`（后者改完跑 `deploy.ps1` 即可，无需单独传图）
- `ENABLED: false` 可隐藏入口

填完跑一次 `powershell -ExecutionPolicy Bypass -File deploy.ps1` 上线。留空时面板显示「把游戏分享给朋友」的降级文案，不会报错。

## 内嵌广告位

游戏内预留三种自建广告位，全部在 `config.js` 的 `ADS` 里配「图片 + 链接 + 文案」，留空就不显示，不影响玩法：

- `BANNER`：footer 底部常驻 banner
- `INTERSTITIAL.EVERY`：每 N 次爆屎弹一次插屏（0=关闭）
- `OPEN`：开屏广告，`ONCE_PER_SESSION` 控制同一会话只弹一次
- `REVIVE`：点「重新开始」时先弹广告，关掉后才真正重置

每个位填 `IMAGE`（URL 或 base64）才生效，`LINK` 是点击跳转，`CLOSE_TEXT` 是关闭按钮文案。个人无执照不接广告联盟，这些位可用来推自己的产品或接商单。

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
