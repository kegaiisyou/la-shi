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
  /* ===== 容器阶级：容量 / 文案 / 特效 =====
     need  = 预留的未来升级条件（当前测试阶段由「升级容器」按钮免费推进）
     cap   = 当前容器最多暂存多少坨（冲水才进背包）
     label = 冲水按钮文案（尽量短，手机端放得下）
     fx    = 冲水特效档位：ripple / wave / surge / abyss
  */
  VESSELS: [
    { name:'蹲坑',     short:'蹲坑',   cap:5,           need:0,           verb:'冲',   label:'冲蹲坑',   icon:'🚽', fx:'ripple' },
    { name:'便槽',     short:'便槽',   cap:12,          need:5,           verb:'冲',   label:'冲便槽',   icon:'🪣', fx:'ripple' },
    { name:'夜壶',     short:'夜壶',   cap:20,          need:12,          verb:'倒',   label:'倒夜壶',   icon:'🏺', fx:'ripple' },
    { name:'马桶',     short:'马桶',   cap:35,          need:20,          verb:'冲',   label:'冲马桶',   icon:'🚽', fx:'ripple' },
    { name:'水箱',     short:'水箱',   cap:60,          need:35,          verb:'放',   label:'放水箱',   icon:'🚰', fx:'wave' },
    { name:'洗手池',   short:'洗手池', cap:100,         need:60,          verb:'放',   label:'放洗手池', icon:'🚰', fx:'wave' },
    { name:'浴缸',     short:'浴缸',   cap:180,         need:100,         verb:'放',   label:'放浴缸',   icon:'🛁', fx:'wave' },
    { name:'小水池',   short:'水池',   cap:300,         need:180,         verb:'放',   label:'放水池',   icon:'💧', fx:'wave' },
    { name:'游泳池',   short:'泳池',   cap:500,         need:300,         verb:'排',   label:'排泳池',   icon:'🏊', fx:'wave' },
    { name:'池塘',     short:'池塘',   cap:800,         need:500,         verb:'排',   label:'排池塘',   icon:'🌿', fx:'surge' },
    { name:'湖泊',     short:'湖泊',   cap:1500,        need:800,         verb:'泄',   label:'泄湖泊',   icon:'🏞️', fx:'surge' },
    { name:'水库',     short:'水库',   cap:5000,        need:1500,        verb:'开闸', label:'开水闸',   icon:'🌊', fx:'surge' },
    { name:'江河',     short:'江',     cap:20000,       need:5000,        verb:'开江', label:'开江',     icon:'🌊', fx:'surge' },
    { name:'大海',     short:'海',     cap:100000,      need:20000,       verb:'倾海', label:'倾海',     icon:'🌊', fx:'surge' },
    { name:'海洋',     short:'洋',     cap:500000,      need:100000,      verb:'倾洋', label:'倾洋',     icon:'🌊', fx:'abyss' },
    { name:'深海',     short:'深海',   cap:2000000,     need:500000,      verb:'排',   label:'排深海',   icon:'🌊', fx:'abyss' },
    { name:'海沟',     short:'海沟',   cap:10000000,    need:2000000,     verb:'灌',   label:'灌海沟',   icon:'🕳️', fx:'abyss' },
    { name:'地下海',   short:'地下海', cap:50000000,    need:10000000,    verb:'灌',   label:'灌地下海', icon:'🕳️', fx:'abyss' },
    { name:'超级水库', short:'大水库', cap:250000000,   need:50000000,    verb:'开闸', label:'开大闸',   icon:'🏗️', fx:'abyss' },
    { name:'全球水网', short:'水网',   cap:1000000000,  need:250000000,   verb:'调水', label:'调水',     icon:'💧', fx:'abyss' }
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
