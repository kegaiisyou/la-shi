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
