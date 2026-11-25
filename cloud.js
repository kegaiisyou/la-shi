/* CloudBase 账号层：SDK 匿名登录 + 自建账号表（用户名 + 加盐哈希密码）
 * 暴露 window.CloudAuth，API：
 *   init() -> bool                 是否云端模式
 *   isCloud() -> bool
 *   register(user, pass) -> {ok,msg}
 *   login(user, pass) -> {ok,msg}
 *   logout()
 *   me() -> {user,nickname}|null
 *   pullBest(user) -> number      从云端读取最高分
 *   pushBest(user, best)          写入最高分
 *   ranking(limit) -> [{nickname,best}]
 */
(function () {
  var CFG = window.LS_CONFIG || {};
  var app = null, db = null, cloud = false;

  function enabled() { return !!(CFG.ENV && typeof window.cloudbase !== 'undefined'); }

  function init() {
    if (!enabled()) return false;
    try {
      app = window.cloudbase.init({ env: CFG.ENV });
      db = app.database();
      cloud = true;
      return true;
    } catch (e) {
      console.warn('[CloudBase] init failed', e);
      cloud = false;
      return false;
    }
  }

  // 确保处于匿名登录态（用于读写数据库）
  function ensureAuth() {
    if (!cloud) return Promise.resolve(false);
    var auth = app.auth({ persistence: 'local' });
    if (auth.hasLoginState()) return Promise.resolve(true);
    return auth.signInAnonymously().then(function () { return true; });
  }

  function errMsg(e) { return (e && (e.message || e.msg)) || String(e); }

  // 简单加盐哈希（Web Crypto SHA-256，够小游戏用；非金融级）
  function hash(pass, salt) {
    var input = salt + '|' + pass;
    var bytes = new TextEncoder().encode(input);
    return crypto.subtle.digest('SHA-256', bytes).then(function (buf) {
      var hex = '';
      new Uint8Array(buf).forEach(function (b) { hex += ('0' + b.toString(16)).slice(-2); });
      return hex;
    });
  }

  function sanitize(u) {
    return String(u || '').trim().toLowerCase().replace(/[^a-z0-9_\u4e00-\u9fa5]/g, '').slice(0, 20);
  }

  function passCheck(p) {
    p = String(p || '');
    if (p.length < 6) return '密码至少 6 位';
    if (p.length > 32) return '密码最多 32 位';
    return null;
  }

  function register(username, password) {
    var u = sanitize(username);
    if (u.length < 2) return Promise.resolve({ ok: false, msg: '用户名至少 2 个字符' });
    var pe = passCheck(password);
    if (pe) return Promise.resolve({ ok: false, msg: pe });
    if (!cloud) return Promise.resolve({ ok: false, msg: '未启用云端模式' });

    return ensureAuth().then(function () {
      return db.collection(CFG.COLLECTION).where({ user: u }).get();
    }).then(function (res) {
      if (res.data && res.data.length) return { ok: false, msg: '用户名已被占用' };
      var salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
      return hash(password, salt).then(function (h) {
        return db.collection(CFG.COLLECTION).add({
          user: u, nickname: sanitize(username) || u, salt: salt, pass: h,
          best: 0, createdAt: Date.now()
        }).then(function () { return { ok: true, msg: '注册成功，请登录' }; });
      });
    }).catch(function (e) { return { ok: false, msg: errMsg(e) }; });
  }

  function login(username, password) {
    var u = sanitize(username);
    if (!cloud) return Promise.resolve({ ok: false, msg: '未启用云端模式' });
    return ensureAuth().then(function () {
      return db.collection(CFG.COLLECTION).where({ user: u }).get();
    }).then(function (res) {
      var rec = res.data && res.data[0];
      if (!rec) return { ok: false, msg: '用户不存在' };
      return hash(password, rec.salt).then(function (h) {
        if (h !== rec.pass) return { ok: false, msg: '密码错误' };
        var me = { user: u, nickname: rec.nickname || u };
        try { localStorage.setItem('ls_me', JSON.stringify(me)); } catch (e) {}
        return { ok: true, msg: '登录成功', me: me };
      });
    }).catch(function (e) { return { ok: false, msg: errMsg(e) }; });
  }

  function logout() {
    try { localStorage.removeItem('ls_me'); } catch (e) {}
  }

  function me() {
    try {
      var s = localStorage.getItem('ls_me');
      return s ? JSON.parse(s) : null;
    } catch (e) { return null; }
  }

  function pullBest(username) {
    if (!cloud) return Promise.resolve(0);
    return ensureAuth().then(function () {
      return db.collection(CFG.COLLECTION).where({ user: username }).get();
    }).then(function (res) {
      return (res.data && res.data[0] && res.data[0].best) || 0;
    }).catch(function () { return 0; });
  }

  function pushBest(username, best) {
    if (!cloud || !username) return Promise.resolve(false);
    return ensureAuth().then(function () {
      return db.collection(CFG.COLLECTION).where({ user: username }).get();
    }).then(function (res) {
      var rec = res.data && res.data[0];
      if (!rec) return false;
      if (best <= (rec.best || 0)) return false;
      return db.collection(CFG.COLLECTION).doc(rec._id).update({ best: best }).then(function () { return true; });
    }).catch(function () { return false; });
  }

  function ranking(limit) {
    limit = limit || 10;
    if (!cloud) return Promise.resolve([]);
    return ensureAuth().then(function () {
      return db.collection(CFG.COLLECTION).orderBy('best', 'desc').limit(limit).get();
    }).then(function (res) {
      return (res.data || []).map(function (r) {
        return { nickname: r.nickname || r.user, best: r.best || 0, user: r.user };
      });
    }).catch(function () { return []; });
  }

  window.CloudAuth = {
    init: init, isCloud: function () { return cloud; },
    register: register, login: login, logout: logout, me: me,
    pullBest: pullBest, pushBest: pushBest, ranking: ranking
  };
})();
