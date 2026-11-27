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
  /* ===== 容器阶级：容量 / 解锁里程碑 / 文案 / 特效 =====
     need  = 累计入袋数达到该值自动升级容器
     cap   = 当前容器最多暂存多少坨（冲水才进背包）
     label = 冲水按钮文案（尽量短，手机端放得下）
     fx    = 冲水特效档位：ripple / wave / surge / cosmic
  */
  VESSELS: [
    { name:'蹲坑',   short:'蹲坑', cap:5,           need:0,             verb:'冲',   label:'冲蹲坑',   icon:'🚽', fx:'ripple' },
    { name:'马桶',   short:'马桶', cap:20,          need:5,             verb:'冲',   label:'冲马桶',   icon:'🚽', fx:'ripple' },
    { name:'小水池', short:'水池', cap:100,         need:20,            verb:'放水', label:'放水池',   icon:'💧', fx:'wave' },
    { name:'游泳池', short:'泳池', cap:500,         need:100,           verb:'排水', label:'排泳池',   icon:'🏊', fx:'wave' },
    { name:'人工湖', short:'湖',   cap:2000,        need:500,           verb:'泄洪', label:'泄洪湖',   icon:'🌊', fx:'wave' },
    { name:'水库',   short:'水库', cap:10000,       need:2000,          verb:'开闸', label:'开水闸',   icon:'🌊', fx:'surge' },
    { name:'江河',   short:'江',   cap:50000,       need:10000,         verb:'开江', label:'开江',     icon:'🌊', fx:'surge' },
    { name:'大海',   short:'海',   cap:200000,      need:50000,         verb:'倾海', label:'倾海',     icon:'🌊', fx:'surge' },
    { name:'星海',   short:'星海', cap:1000000,     need:200000,        verb:'回流', label:'星海回流', icon:'🌌', fx:'cosmic' },
    { name:'银河',   short:'银河', cap:5000000,     need:1000000,       verb:'倒灌', label:'银河倒灌', icon:'🌌', fx:'cosmic' },
    { name:'宇宙',   short:'宇宙', cap:20000000,    need:5000000,       verb:'重启', label:'重启宇宙', icon:'🌌', fx:'cosmic' },
    { name:'多元宇宙', short:'多元', cap:100000000, need:20000000,      verb:'折叠', label:'折叠多元', icon:'🌀', fx:'cosmic' },
    { name:'超宇宙', short:'超宇', cap:500000000,   need:100000000,     verb:'归零', label:'归零超宇', icon:'🌀', fx:'cosmic' },
    { name:'永恒之海', short:'永恒', cap:2500000000, need:500000000,    verb:'轮回', label:'轮回永恒', icon:'♾️', fx:'cosmic' },
    { name:'混沌',   short:'混沌', cap:10000000000, need:2500000000,    verb:'重铸', label:'混沌重铸', icon:'🌀', fx:'cosmic' },
    { name:'太虚',   short:'太虚', cap:50000000000, need:10000000000,   verb:'归寂', label:'太虚归寂', icon:'🌀', fx:'cosmic' },
    { name:'无垠',   short:'无垠', cap:250000000000, need:50000000000,  verb:'淹没', label:'无垠淹没', icon:'♾️', fx:'cosmic' },
    { name:'终焉',   short:'终焉', cap:1000000000000, need:250000000000, verb:'清算', label:'终焉清算', icon:'♾️', fx:'cosmic' },
    { name:'起源',   short:'起源', cap:5000000000000, need:1000000000000, verb:'重启', label:'起源重启', icon:'✨', fx:'cosmic' },
    { name:'归一',   short:'归一', cap:25000000000000, need:5000000000000, verb:'归一', label:'万物归一', icon:'✨', fx:'cosmic' }
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
