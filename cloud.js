/* CloudBase PG 模式账号层
 * 使用 app.rdb()（Supabase 风格）+ 匿名登录 + 自建账号表 ls_users
 * 暴露 window.CloudAuth
 * 注意：username 才是字段名（user 是 PG 保留字）；本地登录态仍用 me.user
 */
(function () {
  var CFG = window.LS_CONFIG || {};
  var app = null, db = null, cloud = false;

  function enabled() { return !!(CFG.ENV && typeof window.cloudbase !== 'undefined'); }

  function init() {
    if (!enabled()) return false;
    try {
      app = window.cloudbase.init({ env: CFG.ENV });
      db = app.rdb();
      cloud = true;
      return true;
    } catch (e) {
      console.warn('[CloudBase] init failed', e);
      cloud = false;
      return false;
    }
  }

  function ensureAuth() {
    if (!cloud) return Promise.resolve(false);
    var auth = typeof app.auth === 'function' ? app.auth() : app.auth;
    if (auth.hasLoginState && auth.hasLoginState()) return Promise.resolve(true);
    return auth.signInAnonymously().then(function () { return true; });
  }

  /* 当前匿名登录的 uid（JWT sub），用于把账号绑定到一个匿名身份，防止脚本批量注册 */
  function anonUid() {
    if (!cloud) return Promise.resolve('');
    try {
      var auth = typeof app.auth === 'function' ? app.auth() : app.auth;
      function pick(st) { return (st && st.user && (st.user.sub || st.user.uid)) ? String(st.user.sub || st.user.uid) : ''; }
      if (auth.getLoginState) {
        return Promise.resolve(auth.getLoginState()).then(function (st) {
          return pick(st);
        }).catch(function () { return ''; });
      }
      if (auth.getCurrentUser) {
        return Promise.resolve(auth.getCurrentUser()).then(pick).catch(function () { return ''; });
      }
    } catch (e) {}
    return Promise.resolve('');
  }

  function errMsg(e) { return (e && (e.message || e.msg)) || String(e); }

  function hash(pass, salt) {
    var bytes = new TextEncoder().encode(salt + '|' + pass);
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

  function send(q) {
    return Promise.resolve(q).then(function (res) {
      if (res && res.error) throw new Error(res.error.message || String(res.error));
      return res || {};
    });
  }

  function register(username, password) {
    var u = sanitize(username);
    if (u.length < 2) return Promise.resolve({ ok: false, msg: '用户名至少 2 个字符' });
    var pe = passCheck(password);
    if (pe) return Promise.resolve({ ok: false, msg: pe });
    if (!cloud) return Promise.resolve({ ok: false, msg: '未启用云端模式' });

    return ensureAuth().then(function () {
      return anonUid();
    }).then(function (uid) {
      if (!uid) return { ok: false, msg: '无法获取设备身份，请稍后重试' };
      /* 一个匿名身份只允许注册一个账号（数据库唯一索引兜底） */
      return send(db.from(CFG.TABLE).select('id').eq('anon_uid', uid)).then(function (bound) {
        if (bound.data && bound.data.length) return { ok: false, msg: '当前设备已注册过账号，请勿重复注册' };
        return send(db.from(CFG.TABLE).select('id').eq('username', u)).then(function (res) {
          if (res.data && res.data.length) return { ok: false, msg: '用户名已被占用' };
          var salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
          return hash(password, salt).then(function (h) {
            return send(db.from(CFG.TABLE).insert({
              username: u, nickname: u, salt: salt, pass: h,
              best: 0, created_at: Date.now(), anon_uid: uid
            })).then(function () { return { ok: true, msg: '注册成功，请登录' }; });
          });
        });
      });
    }).catch(function (e) { return { ok: false, msg: errMsg(e) }; });
  }

  function login(username, password) {
    var u = sanitize(username);
    if (!cloud) return Promise.resolve({ ok: false, msg: '未启用云端模式' });
    return ensureAuth().then(function () {
      return send(db.from(CFG.TABLE).select('id,username,nickname,salt,pass,best').eq('username', u));
    }).then(function (res) {
      var rec = res.data && res.data[0];
      if (!rec) return { ok: false, msg: '用户不存在' };
      return hash(password, rec.salt).then(function (h) {
        if (h !== rec.pass) return { ok: false, msg: '密码错误' };
        var me = { user: u, nickname: rec.nickname || u };
        try { localStorage.setItem('ls_me', JSON.stringify(me)); } catch (e) {}
        return claimDevice(u, password).then(function (bound) {
          return { ok: true, msg: '登录成功', me: me, bound: bound };
        });
      });
    }).catch(function (e) { return { ok: false, msg: errMsg(e) }; });
  }

  function logout() { try { localStorage.removeItem('ls_me'); } catch (e) {} }

  function me() {
    try { var s = localStorage.getItem('ls_me'); return s ? JSON.parse(s) : null; }
    catch (e) { return null; }
  }

  function pullBest(username) {
    var u = sanitize(username);
    if (!cloud || !u) return Promise.resolve(0);
    return ensureAuth().then(function () {
      return send(db.from(CFG.TABLE).select('best').eq('username', u));
    }).then(function (res) {
      return (res.data && res.data[0] && res.data[0].best) || 0;
    }).catch(function () { return 0; });
  }

  /* 把云端分数对齐到本地值（可升可降）；RLS 只允许改自己那行 */
  function setBest(username, value) {
    var v = Math.max(0, Math.floor(Number(value) || 0)), u = sanitize(username);
    if (!cloud || !u) return Promise.resolve(false);
    return ensureAuth().then(function () {
      return send(db.from(CFG.TABLE).select('id').eq('username', u));
    }).then(function (res) {
      var rec = res.data && res.data[0];
      if (!rec) return false;
      return send(db.from(CFG.TABLE).update({ best: v }).eq('id', rec.id)).then(function () {
        return send(db.from(CFG.TABLE).select('best').eq('id', rec.id)).then(function (check) {
          return !!(check.data && check.data[0] && Number(check.data[0].best) === v);
        });
      });
    }).catch(function () { return false; });
  }
  function pushBest(username, best) { return setBest(username, best); }

  /* 换设备后登录：服务端用密码校验身份，把账号重新绑到当前匿名 uid */
  function claimDevice(username, password) {
    var u = sanitize(username);
    if (!cloud || !u) return Promise.resolve(false);
    return ensureAuth().then(function () {
      return send(db.rpc('ls_claim_device', { p_username: u, p_password: String(password || '') }));
    }).then(function (res) { return !!(res && res.data === true); })
      .catch(function () { return false; });
  }

  /* 重置账号分数：排行榜按 best 排序，清成 0 即从榜上消失 */
  function resetBest(username) { return setBest(username, 0); }

  function ranking(limit) {
    limit = limit || 10;
    if (!cloud) return Promise.resolve([]);
    return ensureAuth().then(function () {
      return send(db.from(CFG.TABLE).select('username,nickname,best').order('best', { ascending: false }).limit(limit));
    }).then(function (res) {
      return (res.data || []).map(function (r) {
        return { nickname: r.nickname || r.username, best: r.best || 0, user: r.username };
      });
    }).catch(function () { return []; });
  }

  window.CloudAuth = {
    init: init, isCloud: function () { return cloud; },
    register: register, login: login, logout: logout, me: me,
    pullBest: pullBest, pushBest: pushBest, setBest: setBest, resetBest: resetBest,
    claimDevice: claimDevice, ranking: ranking
  };
})();
