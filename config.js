/* ============================================================
   拉屎大作战 - CloudBase 配置（PG 模式）
   ------------------------------------------------------------
   1. ENV 已填入你的环境 ID
   2. 控制台 → 身份认证 → 登录方式 → 开启「匿名登录」
   3. 控制台 → PostgreSQL → SQL 编辑器，执行 README 里的建表 SQL
   4. 重新部署到 GitHub Pages
   ============================================================ */
window.LS_CONFIG = {
  ENV: 'la-shi-d9g35yrnaef3ef5b9',   // ← 你的 CloudBase 环境 ID
  TABLE: 'ls_users',
  SAVE_DEBOUNCE_MS: 1500,
  /* ===== 小屎崽助手（自动产出）=====
     ENABLED       : 首次进入时默认开/关，玩家可在底部按钮随时切换
     INTERVAL_MS   : 在线每多少毫秒挤出一坨（原型先给 2 分钟，方便看效果）
     OFFLINE_CAP_MS: 玩家离开时最多补算多久的产出（当前 10 分钟，后续可升级）
     满容器会立即停产且不攒进度；冲水/升级容器后重新计时。
  */
  AUTO: {
    ENABLED: true,
    INTERVAL_MS: 120000,
    OFFLINE_CAP_MS: 600000
  },
  /* ===== 容器阶级：按真实容量从小到大排序 =====
     参考：夜壶约2.5L / 马桶水箱3~6L(老式12L) / 浴缸230~320L /
           家用蓄水池2~50m³ / 标准泳池约1890~2500吨
     最高三档收在 银河 → 星海 → 宇宙。
     need  = 预留的未来升级条件（当前测试阶段由「升级容器」按钮免费推进）
     cap   = 当前容器最多暂存多少坨（冲水才进背包）
     label = 冲水按钮文案（尽量短，手机端放得下）
     fx    = 冲水特效档位：ripple / wave / surge / abyss / cosmic
  */
  VESSELS: [
    { name:'夜壶',     short:'夜壶',   cap:5,             need:0,             verb:'倒',   label:'倒夜壶',   icon:'🏺', fx:'ripple' },
    { name:'水箱',     short:'水箱',   cap:20,            need:5,             verb:'放',   label:'放水箱',   icon:'🚰', fx:'ripple' },
    { name:'马桶',     short:'马桶',   cap:80,            need:20,            verb:'冲',   label:'冲马桶',   icon:'🚽', fx:'ripple' },
    { name:'洗手池',   short:'洗手池', cap:320,           need:80,            verb:'放',   label:'放洗手池', icon:'🚰', fx:'wave' },
    { name:'便槽',     short:'便槽',   cap:1280,          need:320,           verb:'冲',   label:'冲便槽',   icon:'🪣', fx:'wave' },
    { name:'蹲坑',     short:'蹲坑',   cap:5120,          need:1280,          verb:'冲',   label:'冲蹲坑',   icon:'🚽', fx:'wave' },
    { name:'浴缸',     short:'浴缸',   cap:20480,         need:5120,          verb:'放',   label:'放浴缸',   icon:'🛁', fx:'wave' },
    { name:'小水池',   short:'水池',   cap:81920,         need:20480,         verb:'放',   label:'放水池',   icon:'💧', fx:'wave' },
    { name:'游泳池',   short:'泳池',   cap:327680,        need:81920,         verb:'排',   label:'排泳池',   icon:'🏊', fx:'surge' },
    { name:'池塘',     short:'池塘',   cap:1310720,       need:327680,        verb:'排',   label:'排池塘',   icon:'🌿', fx:'surge' },
    { name:'湖泊',     short:'湖泊',   cap:5242880,       need:1310720,       verb:'泄',   label:'泄湖泊',   icon:'🏞️', fx:'surge' },
    { name:'水库',     short:'水库',   cap:20971520,      need:5242880,       verb:'开闸', label:'开水闸',   icon:'🌊', fx:'surge' },
    { name:'江河',     short:'江',     cap:83886080,      need:20971520,      verb:'开江', label:'开江',     icon:'🌊', fx:'surge' },
    { name:'大海',     short:'海',     cap:335544320,     need:83886080,      verb:'倾海', label:'倾海',     icon:'🌊', fx:'surge' },
    { name:'海洋',     short:'洋',     cap:1342177280,    need:335544320,     verb:'倾洋', label:'倾洋',     icon:'🌊', fx:'abyss' },
    { name:'海沟',     short:'海沟',   cap:5368709120,    need:1342177280,    verb:'灌',   label:'灌海沟',   icon:'🕳️', fx:'abyss' },
    { name:'地下海',   short:'地下海', cap:21474836480,   need:5368709120,    verb:'灌',   label:'灌地下海', icon:'🕳️', fx:'abyss' },
    { name:'银河',     short:'银河',   cap:85899345920,   need:21474836480,   verb:'倒灌', label:'银河倒灌', icon:'🌌', fx:'cosmic' },
    { name:'星海',     short:'星海',   cap:343597383680,  need:85899345920,   verb:'回流', label:'星海回流', icon:'🌌', fx:'cosmic' },
    { name:'宇宙',     short:'宇宙',   cap:1374389534720, need:343597383680,  verb:'重启', label:'重启宇宙', icon:'🌌', fx:'cosmic' }
  ],
  /* ===== 打赏 / 赞助入口（个人无执照可用；留空也不会报错）=====
     AFDIAN   : 爱发电主页链接，如 https://afdian.net/a/你的名字
     WECHAT_QR: 微信收款码图片，可填完整 URL，也可填 data:image/png;base64,...（改完跑 deploy.ps1 即可，无需单独传图）
     ALIPAY_QR: 支付宝收款码图片，写法同上
     ENABLED  : 设 false 可完全隐藏入口
  */
  SUPPORT: {
    ENABLED: true,
    AFDIAN: '',
    WECHAT_QR: '',
    ALIPAY_QR: '',
    NOTE: '如果玩得开心，欢迎支持一下作者～'
  },
  /* ===== 内嵌广告位（个人自建广告位；每个位填 IMAGE 才生效，留空不显示）=====
     IMAGE  : 图片地址，可填完整 URL 或 data:image/png;base64,...（base64 写法无需单独传图）
     LINK   : 点击跳转链接（留空则不可点）
     TEXT   : 图片下方 / 弹窗内文案
     INTERSTITIAL.EVERY : 每 N 次爆屎弹一次插屏（0=关闭）
     OPEN.ONCE_PER_SESSION : 同一浏览器会话只弹一次开屏
     REVIVE : 点「重新开始」时先弹，关掉后才真正重置
  */
  ADS: {
    ENABLED: true,
    BANNER: { IMAGE: '', LINK: '', TEXT: '' },
    INTERSTITIAL: { EVERY: 0, IMAGE: '', LINK: '', TEXT: '', TITLE: '赞助', CLOSE_TEXT: '跳过' },
    OPEN: { IMAGE: '', LINK: '', TEXT: '', TITLE: '赞助', CLOSE_TEXT: '跳过', ONCE_PER_SESSION: true },
    REVIVE: { IMAGE: '', LINK: '', TEXT: '', TITLE: '赞助', CLOSE_TEXT: '继续游戏' }
  }
};
