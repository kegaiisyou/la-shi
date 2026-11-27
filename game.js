(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     1. 皮肤：手工调色板（同一个矢量角色，换配色而不是滤镜）
     ============================================================ */
  var SKINS = [
    { id:'classic', name:'经典屎',  need:0,   body:'#A9713C', dark:'#6E421F', light:'#C78B51', blush:'#E98B7A' },
    { id:'gold',    name:'黄金屎',  need:10,  body:'#E5B945', dark:'#9E7414', light:'#FFE59A', blush:'#FFB987' },
    { id:'jade',    name:'翡翠屎',  need:30,  body:'#5CB48A', dark:'#2E7A56', light:'#A5E3C1', blush:'#F2A3A3' },
    { id:'ice',     name:'冰爽屎',  need:60,  body:'#8CCDEC', dark:'#447796', light:'#DCF2FF', blush:'#A8D8F5' },
    { id:'grape',   name:'紫晶屎',  need:100, body:'#A88BD8', dark:'#5E4A93', light:'#D8C7F2', blush:'#EAA0D2' },
    { id:'lava',    name:'岩浆屎',  need:150, body:'#C74E2B', dark:'#78220F', light:'#FF9B4A', blush:'#FF7A45' },
    { id:'rainbow', name:'彩虹屎',  need:200, body:'#D06ABA', dark:'#7A3A78', light:'#FFC7EF', blush:'#FF8FD2', rainbow:true },
    { id:'shades',  name:'墨镜屎',  need:250, needC:15, body:'#A9713C', dark:'#6E421F', light:'#C78B51', blush:'#E98B7A', deco:'shades' },
    { id:'super',   name:'超人屎',  need:300, needC:30, body:'#A9713C', dark:'#6E421F', light:'#C78B51', blush:'#E98B7A', deco:'super' }
  ];
  var curSkin = 'classic';
  try { curSkin = localStorage.getItem('ls_skin') || 'classic'; } catch (e) {}
  function skinById(id) { for (var i = 0; i < SKINS.length; i++) if (SKINS[i].id === id) return SKINS[i]; return SKINS[0]; }

  /* ---- 角色：四段软体（底层 / 中层带脸 / 上层 / 卷尖），各自独立形变 ---- */
  function tierShade(rx, ry, cy) {
    return /* 落在下一层上的接触阴影 */ '<ellipse class="p-dark" cx="105" cy="' + (cy + ry * 0.76) + '" rx="' + (rx * 0.7) + '" ry="' + (ry * 0.13) +
             '" opacity=".16" style="filter:blur(5px)"/>' +
           /* 本层顶部的受光边 */ '<ellipse class="p-light" cx="105" cy="' + (cy - ry * 0.54) + '" rx="' + (rx * 0.72) + '" ry="' + (ry * 0.17) +
             '" opacity=".24" style="filter:blur(6px)"/>' +
           /* 侧面高光 */ '<ellipse class="gloss" cx="' + (105 - rx * 0.5) + '" cy="' + (cy - ry * 0.05) + '" rx="' + (rx * 0.26) + '" ry="' + (ry * 0.24) +
             '" opacity=".12" transform="rotate(-16 ' + (105 - rx * 0.5) + ' ' + (cy - ry * 0.05) + ')" style="filter:blur(5px)"/>';
  }
  function tiers() {
    return '<g class="tier t4"><ellipse class="p-t4" cx="105" cy="164" rx="68" ry="38"/>' + tierShade(68, 38, 164) + '</g>' +
      '<g class="tier t3"><ellipse class="p-t3" cx="105" cy="126" rx="46" ry="30"/>' + tierShade(46, 30, 126) +
        face() + decoShades() + decoSuper() + '</g>' +
      '<g class="tier t2"><ellipse class="p-t2" cx="105" cy="98" rx="29" ry="20"/>' + tierShade(29, 20, 98) + '</g>' +
      '<g class="tier t1"><path class="p-t1" d="M98 88 C92 70 100 54 114 49 C126 45 135 54 129 63 C123 72 114 77 112 89 Z"/>' +
        '<ellipse class="p-light" cx="120" cy="56" rx="8" ry="5" opacity=".28" transform="rotate(14 120 56)" style="filter:blur(4px)"/>' +
      '</g>';
  }
  function face() {
    return '<g class="face">' +
      '<ellipse class="p-blush" cx="72" cy="136" rx="9" ry="5.2" opacity=".4"/>' +
      '<ellipse class="p-blush" cx="138" cy="136" rx="9" ry="5.2" opacity=".4"/>' +
      '<g class="eyes">' +
        '<g class="eye"><ellipse class="eye-w" cx="89" cy="120" rx="7" ry="8.6"/>' +
          '<ellipse class="eye-p" cx="89.6" cy="121" rx="5" ry="6.1"/>' +
          '<ellipse class="eye-g" cx="87" cy="117.5" rx="2" ry="2"/></g>' +
        '<g class="eye"><ellipse class="eye-w" cx="121" cy="120" rx="7" ry="8.6"/>' +
          '<ellipse class="eye-p" cx="120.4" cy="121" rx="5" ry="6.1"/>' +
          '<ellipse class="eye-g" cx="118" cy="117.5" rx="2" ry="2"/></g>' +
      '</g>' +
      '<g class="mouth-smile"><path d="M97 141.5 Q105 150.5 113 141.5" fill="none" stroke="#2E1C0F" stroke-width="3.4" stroke-linecap="round"/></g>' +
      '<g class="mouth-open">' +
        '<ellipse cx="105" cy="146" rx="9" ry="10.5" fill="#3B2213"/>' +
        '<ellipse cx="105" cy="151.5" rx="5.2" ry="4.2" fill="#E2797A" opacity=".9"/>' +
      '</g>' +
    '</g>';
  }
  function decoShades() {
    return '<g class="deco deco-shades">' +
      '<rect x="72" y="111" width="30" height="18" rx="8" fill="#241611"/>' +
      '<rect x="108" y="111" width="30" height="18" rx="8" fill="#241611"/>' +
      '<rect x="99" y="117" width="12" height="5" fill="#241611"/>' +
      '<rect x="56" y="114" width="17" height="5" rx="2.5" fill="#241611"/>' +
      '<rect x="137" y="114" width="17" height="5" rx="2.5" fill="#241611"/>' +
      '<path d="M77 114 L83 116" stroke="#7C6A5E" stroke-width="2.4" opacity=".9"/>' +
      '<path d="M113 114 L119 116" stroke="#7C6A5E" stroke-width="2.4" opacity=".9"/>' +
    '</g>';
  }
  function decoSuper() {
    return '<g class="deco deco-super">' +
      '<ellipse cx="88" cy="118" rx="10" ry="8.5" fill="#D9433F"/>' +
      '<ellipse cx="122" cy="118" rx="10" ry="8.5" fill="#D9433F"/>' +
      '<rect x="96" y="113" width="18" height="7" fill="#D9433F"/>' +
      '<path d="M85 115 L91 117" stroke="#FFE8DC" stroke-width="2.6" opacity=".95"/>' +
      '<path d="M119 115 L125 117" stroke="#FFE8DC" stroke-width="2.6" opacity=".95"/>' +
    '</g>';
  }
  /* 披风：单独一层，只在超人皮肤显示 */
  function capeMarkup() {
    return '<g class="capeSlot">' +
      '<path d="M62 202 C60 162 86 132 132 118 C158 90 184 64 200 56 C206 104 204 158 196 209 Z" fill="#D9433F"/>' +
      '<path d="M62 202 C60 162 86 132 132 118 C120 148 112 176 112 209 L58 209 Z" fill="#B3332F" opacity=".45"/>' +
    '</g>';
  }

  function charMarkup() {
    return '<svg class="poop-svg" viewBox="0 0 210 210" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      capeMarkup() +
      tiers() +
    '</svg>';
  }
  /* 色板：从 body 向 light / dark 混出四层，保证换皮肤时层次依旧成立 */
  function mixHex(a, b, t) {
    var A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
    var r = Math.round(((A >> 16) & 255) * (1 - t) + ((B >> 16) & 255) * t);
    var g = Math.round(((A >> 8) & 255) * (1 - t) + ((B >> 8) & 255) * t);
    var bl = Math.round((A & 255) * (1 - t) + (B & 255) * t);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
  }
  function varsStyle(s) {
    return '--body:' + s.body + ';--dark:' + s.dark + ';--light:' + s.light + ';--blush:' + s.blush +
      ';--t1:' + mixHex(s.body, s.light, .5) + ';--t2:' + mixHex(s.body, s.light, .22) +
      ';--t3:' + s.body + ';--t4:' + mixHex(s.body, s.dark, .18) +
      ';--core:' + mixHex(s.body, s.dark, .34);
  }
  function skinPreview(s) {
    return '<svg viewBox="0 0 210 210" class="skin-' + s.id + (s.rainbow ? ' rainbow' : '') + '" ' +
      'style="' + varsStyle(s) + '">' + tiers() + '</svg>';
  }

  /* ---- 落地屎：和玩家捏的完全同一坨（四段软体 + 脸 + 皮肤），飞出后堆在地上 ---- */
  function landedMarkup(skin) {
    return '<svg class="poop-svg skin-' + skin.id + (skin.rainbow ? ' rainbow' : '') + '" viewBox="0 0 210 210" xmlns="http://www.w3.org/2000/svg">' +
      capeMarkup() + tiers() + '</svg>';
  }
  function spawnLandedPoop(skin, combo, dir, instant) {
    var pile = $('poopPile');
    if (!pile) return;
    var i = landed.length, row = Math.floor(i / 5), col = i % 5;
    var pw = pile.clientWidth || 340, ph = pile.clientHeight || 300;
    var sz = 46 - row * 2;
    var pr = poop.getBoundingClientRect(), plr = pile.getBoundingClientRect();
    var x0 = pr.left + pr.width / 2 - plr.left;
    var y0 = pr.top + pr.height * 0.5 - plr.top;
    var x1 = pw * (0.15 + col * 0.18 + (row % 2 ? 0.045 : 0) + (Math.random() - .5) * 0.025);
    var y1 = ph - 24 - row * 19 + (Math.random() - .5) * 4;
    var rot = (Math.random() - .5) * 14 + (dir || 0) * 8;
    /* 真抛物线：给一个向上的初速度，重力把它拉回目标点 */
    var g = 2100, rise = 68 + Math.random() * 34;
    var vy0 = -Math.sqrt(2 * g * rise);
    var disc = vy0 * vy0 - 2 * g * (y0 - y1);
    var T = (-vy0 + Math.sqrt(disc)) / g;
    if (!(T > .2 && T < 1.4)) T = .7;
    var vx = (x1 - x0) / T;
    var el = document.createElement('div');
    el.className = 'landed-poop' + (combo >= 8 ? ' hot' : '') + (instant ? ' instant' : '');
    el.style.cssText = varsStyle(skin) +
      ';width:' + sz + 'px;height:' + sz + 'px;z-index:' + (10 + i) +
      ';--rot:' + rot.toFixed(1) + 'deg;--flydur:' + T.toFixed(3) + 's;';
    el.innerHTML = '<div class="poop-inner">' + landedMarkup(skin) + '</div>';
    el.style.transform = 'translate(' + (x0 - sz / 2).toFixed(1) + 'px,' + (y0 - sz / 2).toFixed(1) + 'px)';
    pile.appendChild(el);
    landed.push(el);
    if (!instant) flyers.push({ el: el, x0: x0, y0: y0, vx: vx, vy0: vy0, g: g, t: 0, T: T, sz: sz });
    if (landed.length > MAX_LANDED) {
      var old = landed.shift();
      old.classList.add('gone');
      setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 340);
    }
    return el;
  }
  function clearLanded() {
    var pile = $('poopPile');
    if (pile) pile.innerHTML = '';
    landed.length = 0; flyers.length = 0;
  }
  /* 刷新后把存档里的便池坨数原样摆回去，不播飞出动画 */
  function restorePile() {
    var skin = skinById(curSkin);
    for (var i = 0; i < toilet; i++) spawnLandedPoop(skin, 0, 0, true);
  }

  /* 一坨飞走后，原地回到初始种子状态，等待玩家重新捏下一坨 */
  function resetToSeed() {
    pile = 0; pq = 0; drop = 0; lastPile = -1; lastGrow = -1;
    for (var i = 0; i < T.length; i++) {
      var t = T[i]; t.oy = 0; t.vo = 0; t.sq = 1; t.vs = 0; t.lx = 0; t.vl = 0; t.rot = 0; t.vr = 0;
    }
    waveQ.length = 0;
    ch.sx = 1; ch.sy = 1; ch.vx = 0; ch.vy = 0; ch.rot = 0; ch.vr = 0;
  }

  function applySkin(flash) {
    var s = skinById(curSkin);
    var svg = $('poop').querySelector('.poop-svg');
    svg.setAttribute('style', varsStyle(s));
    svg.setAttribute('class', 'poop-svg skin-' + s.id + (s.rainbow ? ' rainbow' : ''));
    if (flash) {
      var c = anchor();
      ring(c.x, c.y, 26, 'rgba(255,255,255,.95)', 5);
      pulse();
    }
  }

  /* ============================================================
     2. 状态
     ============================================================ */
  var TOILET_CAP = 5, SAVE_KEY = 'ls_save_v1';
  var bag = 0, toilet = 0, lv = 1, best = 0, cloudOn = false, saveTimer = null;
  function need(n) { return 10 * n * n; }
  function levelFrom(n) { var l = 1; while (n >= need(l)) l++; return l; }
  var landed = [], flyers = [], MAX_LANDED = TOILET_CAP;
  function clampInt(v, min, max) { v = parseInt(v, 10); if (!isFinite(v)) v = min; return Math.max(min, Math.min(max, v)); }
  function loadSave() {
    try {
      var o = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (o) { bag = clampInt(o.bag, 0, 1000000000); toilet = clampInt(o.toilet, 0, TOILET_CAP); }
    } catch (e) {}
    var oldBest = localBest();                 /* 旧版单局最高分迁移为背包起始值，不丢老进度 */
    if (oldBest > bag) bag = oldBest;
    if (bag > 0) setLocalBest(bag);
    best = bag;
    lv = levelFrom(bag);
  }
  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, bag: bag, toilet: toilet })); } catch (e) {}
    setLocalBest(bag);
  }

  /* ============================================================
     3. 画布与粒子
     ============================================================ */
  var stage = $('stage'), poop = $('poop'), shadowEl = $('charShadow'), gameEl = $('game');
  var lastFade = -1;
  var RV = [0.0, 0.07, 0.20, 0.38];   /* t4 先出土，往上依次冒出；前段长全、留时间展示完整形态 */
  var RSPAN = [0.12, 0.20, 0.22, 0.24];
  var fx = $('fx'), bgfx = $('bgfx');
  var fx2d = fx.getContext('2d'), bg2d = bgfx.getContext('2d');
  var CW = 0, CH = 0, DPR = 1;
  var parts = [], bubs = [];

  function fitCanvas() {
    DPR = Math.min(window.devicePixelRatio || 1, 1.75);
    var r = stage.getBoundingClientRect();
    CW = Math.round(r.width); CH = Math.round(r.height);
    [[fx, fx2d], [bgfx, bg2d]].forEach(function (p) {
      p[0].width = Math.round(CW * DPR); p[0].height = Math.round(CH * DPR);
      p[0].style.width = CW + 'px'; p[0].style.height = CH + 'px';
      p[1].setTransform(DPR, 0, 0, DPR, 0, 0);
    });
    if (!bubs.length) seedBubbles();
  }
  function seedBubbles() {
    bubs = [];
    for (var i = 0; i < 12; i++) {
      bubs.push({
        x: Math.random() * CW, y: Math.random() * CH,
        r: 1.6 + Math.random() * 4.2,
        vy: 6 + Math.random() * 16,
        a: .16 + Math.random() * .3,
        ph: Math.random() * 6.28
      });
    }
  }
  function anchor() {
    var r = stage.getBoundingClientRect();
    return { x: r.width / 2, y: r.height * 0.52 };
  }
  function push(p) { if (parts.length > 250) parts.shift(); parts.push(p); }

  function ring(x, y, r, color, w, grow, fade) {
    push({ t: 'ring', x: x, y: y, s: r, gs: grow || 210, w: w || 4,
           a: 1, f: fade || 1.5, r: 0, rv: 0, c: color, g: 0, vx: 0, vy: 0 });
  }
  function drops(x, y, skin, n, power) {
    power = power || 1;
    var cnt = RM ? 2 : (4 + Math.floor(Math.random() * 3)) * power;
    for (var i = 0; i < cnt; i++) {
      var ang = -Math.PI / 2 + (Math.random() - .5) * 2.1;
      var sp = (60 + Math.random() * 190) * power;
      push({ t: 'drop', x: x + (Math.random() - .5) * 24, y: y + 6,
             vx: Math.cos(ang) * sp * 1.5, vy: Math.sin(ang) * sp,
             g: 460, s: 2.4 + Math.random() * 4.2, r: 0, rv: (Math.random() - .5) * 14,
             a: .95, f: 1.0 + Math.random() * .5, c: Math.random() > .45 ? skin.body : skin.dark });
    }
  }
  function sparks(x, y, skin, n, power) {
    power = power || 1;
    var cnt = RM ? 2 : (3 + Math.floor(Math.random() * 3)) * power;
    for (var i = 0; i < cnt; i++) {
      var ang = Math.random() * Math.PI * 2;
      var sp = (70 + Math.random() * 210) * power;
      push({ t: 'star', x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * .8,
             g: 120, s: 3 + Math.random() * 5, r: Math.random() * 3, rv: (Math.random() - .5) * 10,
             a: 1, f: 1.6, c: 'rgba(255,240,200,.95)', gs: 0 });
    }
  }
  function confetti(x, y, n) {
    var cols = ['#E9A33C', '#D9433F', '#5CB48A', '#8CCDEC', '#A88BD8', '#FFE08A'];
    for (var i = 0; i < (RM ? 8 : n); i++) {
      var ang = -Math.PI / 2 + (Math.random() - .5) * 2.4;
      var sp = 180 + Math.random() * 300;
      push({ t: 'conf', x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
             g: 520, s: 4 + Math.random() * 5, r: Math.random() * 3, rv: (Math.random() - .5) * 18,
             a: 1, f: .85, c: cols[i % cols.length] });
    }
  }

  function drawStar(g, s) {
    g.beginPath();
    g.moveTo(0, -s);
    g.quadraticCurveTo(s * .18, -s * .18, s, 0);
    g.quadraticCurveTo(s * .18, s * .18, 0, s);
    g.quadraticCurveTo(-s * .18, s * .18, -s, 0);
    g.quadraticCurveTo(-s * .18, -s * .18, 0, -s);
    g.closePath();
    g.fill();
  }

  /* ============================================================
     4. 弹簧：角色的形变全部由物理驱动
     ============================================================ */
  var ch = { sx: 1, sy: 1, vx: 0, vy: 0, rot: 0, vr: 0 };
  var shake = 0, tsec = 0, lastT = 0, pile = 0, drop = 0, lastPile = -1, lastM = -1;
  /* 长按挤压：pq = 当前这一节的挤出进度(0~1)，按住涨、松手退；pile = 已经挤出来并落定的部分 */
  var pressing = false, pq = 0, lastGrow = -1, gaugeEl = null, gaugeFill = null;
  var T = [], waveQ = [];
  var pageHidden = false, frameSkip = 0, tierSkip = 0;
  document.addEventListener('visibilitychange', function () {
    pageHidden = document.hidden;
    lastT = 0;
  });

  /* 四段软体骨架：越往上弹簧越软、迟滞越大 → 形变像波一样从堆底传到尖 */
  var RIG = [
    { sel: '.t4', origin: 202, rest: 0,  amp: 0.6, k: 0.36, dp: 0.84, sway: 0.10,  sl: 0.86, lim: 6 },
    { sel: '.t3', origin: 156, rest: 6,  amp: 1.0, k: 0.28, dp: 0.87, sway: 0.08,  sl: 0.87, lim: 11 },
    { sel: '.t2', origin: 118, rest: 12, amp: 1.4, k: 0.22, dp: 0.89, sway: 0.06,  sl: 0.88, lim: 15 },
    { sel: '.t1', origin: 88,  rest: 18, amp: 1.8, k: 0.17, dp: 0.90, sway: 0.045, sl: 0.89, lim: 14 }
  ];

  function buildRig() {
    T = RIG.map(function (r) {
      return {
        el: poop.querySelector('.tier' + r.sel), origin: r.origin, rest: r.rest,
        amp: r.amp, k: r.k, dp: r.dp, kl: r.sway, sl: r.sl, lim: r.lim,
        oy: 0, vo: 0, sq: 1, vs: 0, lx: 0, vl: 0, rot: 0, vr: 0
      };
    });
  }

  function later(ms, fn) { waveQ.push({ at: tsec + ms / 1000, fn: fn }); }
  function runWave() {
    for (var i = waveQ.length - 1; i >= 0; i--) {
      if (tsec >= waveQ[i].at) { var f = waveQ[i].fn; waveQ.splice(i, 1); f(); }
    }
  }
  /* 冲量式推动：只给速度，位移交给弹簧 → 自然带回弹和跟随（这才是 duang 的来源） */
  function tierPush(t, up, sqz, sway, spin) {
    if (!t || !t.el) return;
    t.vo = Math.max(-6, Math.min(6, t.vo - up));       /* 连点时限速，避免冲量叠加把堆顶甩飞 */
    t.sq = Math.max(0.60, Math.min(1.45, sqz));
    t.lx = Math.max(-22, Math.min(22, t.lx + (sway || 0)));
    t.rot = Math.max(-14, Math.min(14, t.rot + (spin || 0)));
  }

  /* 一次“挤”：先被压扁（充气变宽变矮）→ 弹簧顶起来纵向拉长 → 顶尖最后被拉长冒头 → 整坨回摆 */
  function squeeze(power, dir) {
    var P = power || 1, D = dir || 0;
    ch.sy = Math.min(ch.sy, 0.88);          /* 瞬时压扁：被从下面顶了一下 */
    ch.sx = Math.max(ch.sx, 1.10);          /* 同时变宽 */
    ch.vy = Math.max(-0.22, Math.min(0.22, ch.vy - 0.13 * P));                      /* 向上冲量：弹簧会把它顶过头再回摆 */
    ch.vx = 0.02 * P;
    ch.vr += D * 0.35 * P;
    pile = Math.min(1.02, pile + 0.34 * P); drop = Math.min(12, drop + 6 * P);  /* 一坨落下来：整体先沉一下再被顶起 */

    later(0,   function () { tierPush(T[0], 1.2 * P, 0.90, D * 0.4 * P, 0.6 * P); });
    later(40,  function () { tierPush(T[1], 3.0 * P, 0.94, D * 0.9 * P, -1.2 * P); });
    later(85,  function () { tierPush(T[2], 3.6 * P, 0.96, D * 1.4 * P, 2.6 * P); });
    later(135, function () { tierPush(T[3], 4.2 * P, 1.18, D * 1.8 * P, 6.0 * P); });  /* 尖：被拉长冒出来 */
    later(190, function () { tierPush(T[3], 1.6 * P, 1.08, 0, -2.0 * P); });           /* 再送一下，让拉长多撑一会儿 */
  }
  function pulse(a) {
    shake = Math.max(shake, a || 7);
  }

  function tick(now) {
    requestAnimationFrame(tick);
    if (pageHidden) { lastT = 0; return; }
    var dt = lastT ? Math.min((now - lastT) / 1000, .05) : .016;
    lastT = now; tsec += dt;
    var d = dt * 60;

    /* 按住 → 一节一节往外挤；松手 → 原路退回，屎又被憋回去 */
    var pressActive = false;
    if (pressing) {
      pq += dt * 1.15;
      pressActive = true;
      if (pq >= 1) { pq = 0; burst(null, true); }
    } else if (pq > 0) {
      pq -= dt * 0.92;
      if (pq <= 0) { pq = 0; drop = Math.min(12, drop + 2); }
      pressActive = true;
    }
    /* 显示量：已落定的堆 + 正在挤出的那一节 */
    var grow = Math.min(1.2, pile + pq * 0.95);
    var kGrow = Math.pow(grow, 0.5);
    if (gaugeFill) {
      gaugeFill.style.transform = 'scaleY(' + pq.toFixed(3) + ')';
      var gOp = (pressing || pq > 0.015) ? 1 : 0;
      if (gaugeEl.__op !== gOp) { gaugeEl.__op = gOp; gaugeEl.style.opacity = gOp; }
    }

    /* 角色弹簧 */
    runWave();
    var kx = 0.30, ky = 0.26, dampX = Math.pow(0.84, d), dampY = Math.pow(0.86, d);
    ch.vx += (1 - ch.sx) * kx * d; ch.vx *= dampX; ch.sx += ch.vx * d;
    ch.vy += (1 - ch.sy) * ky * d; ch.vy *= dampY; ch.sy += ch.vy * d;
    ch.vr += (0 - ch.rot) * 0.28 * d; ch.vr *= Math.pow(0.80, d); ch.rot += ch.vr * d;

    /* 四段软体：每段自己弹，形变从堆底传到尖 */
    var idleSway = RM ? 0 : Math.sin(tsec * 1.35) * 1.1;
    /* 活跃度：有弹簧在动 / 有待触发的波 / 有堆叠 -> 每帧写；否则隔帧写（静止摆动 30fps 足够） */
    var activeTier = pressActive || waveQ.length > 0 || Math.abs(pile - lastPile) > 0.001 || drop > 0.5 ||
      Math.abs(ch.sx - 1) > .004 || Math.abs(ch.sy - 1) > .004 || Math.abs(ch.rot) > .004 ||
      Math.abs(ch.vx) > .004 || Math.abs(ch.vy) > .004;
    if (!activeTier) {
      for (var ai = 0; ai < T.length; ai++) {
        var ag = T[ai];
        if (Math.abs(ag.oy) > .08 || Math.abs(ag.vo) > .02 || Math.abs(ag.sq - 1) > .008 ||
            Math.abs(ag.vs) > .01 || Math.abs(ag.lx) > .08 || Math.abs(ag.vl) > .02 ||
            Math.abs(ag.rot) > .08 || Math.abs(ag.vr) > .02) { activeTier = true; break; }
      }
    }
    tierSkip = (tierSkip + 1) % 2;
    var writeTier = activeTier || tierSkip === 0;
    for (var ti = 0; ti < T.length; ti++) {
      var tg = T[ti];
      tg.vo += (0 - tg.oy) * tg.k * d; tg.vo *= Math.pow(tg.dp, d); tg.oy += tg.vo * d;
      tg.vs += (1 - tg.sq) * 0.46 * d; tg.vs *= Math.pow(0.76, d); tg.sq += tg.vs * d;
      tg.vl += (0 - tg.lx) * tg.kl * d; tg.vl *= Math.pow(tg.sl, d); tg.lx += tg.vl * d;
      tg.vr += (0 - tg.rot) * 0.22 * d; tg.vr *= Math.pow(0.80, d); tg.rot += tg.vr * d;
      /* 位移硬上限：保证任何情况下四段都咬在一起，不会散架 */
      if (tg.oy < -tg.lim) { tg.oy = -tg.lim; if (tg.vo < 0) tg.vo = 0; }
      if (tg.oy > 10) { tg.oy = 10; if (tg.vo > 0) tg.vo = 0; }
      if (tg.sq < 0.62) { tg.sq = 0.62; if (tg.vs < 0) tg.vs = 0; }
      if (tg.sq > 1.40) { tg.sq = 1.40; if (tg.vs > 0) tg.vs = 0; }
      if (!writeTier) continue;
      var restUp = tg.rest * pile * 0.25;
      var sway = tg.lx + idleSway * tg.amp * 0.75;
      var tsx = 1 + (1 - tg.sq) * 0.44;
      /* 堆底两层随成长张开：一开始是细细一条探出来，堆满才撑成宽底盘 */
      if (ti === 0) tsx *= 0.62 + kGrow * 0.20;
      else if (ti === 1) tsx *= 0.78 + kGrow * 0.14;
      /* 出生阈值：每段从自己的底部往上长出来，没轮到的段高度为 0 */
      var rv = (grow - RV[ti]) / RSPAN[ti];
      rv = rv < 0 ? 0 : (rv > 1 ? 1 : rv);
      rv = rv * rv * (3 - 2 * rv);            /* 平滑起步，不会一条线突然弹出来 */
      tsx *= 0.58 + rv * 0.42;
      if (tg.el) tg.el.setAttribute('transform',
        'translate(' + sway.toFixed(2) + ',' + (tg.oy - restUp).toFixed(2) + ')' +
        ' translate(105,' + tg.origin + ') scale(' + tsx.toFixed(3) + ',' + (tg.sq * rv).toFixed(3) + ')' +
        ' rotate(' + tg.rot.toFixed(2) + ') translate(-105,' + (-tg.origin) + ')');
      if (tg.el && writeTier) tg.el.style.opacity = rv < 0.015 ? '0' : '1';
    }

    var baseX = 1, baseY = 1;
    lastPile = pile;
    /* 憋的时候整坨被往下压一点点，松手弹回来 */
    var pressSquash = 1 - Math.min(pq, 0.8) * 0.10;
    var sink = 0 + drop;   /* 屁股坐在原地，长高全靠往上堆 */
    /* 水线随成长下移：越堆越满，淹得越少 */
    var m0 = 93, m1 = 99.5;
    if (m0 !== lastM) {
      lastM = m0;
      poop.style.setProperty('--msk', m0.toFixed(1) + '%');
      poop.style.setProperty('--mend', m1.toFixed(1) + '%');
    }
    var bob = RM ? 0 : Math.sin(tsec * 1.55) * 2.4 + Math.sin(tsec * 0.83) * 1.2;
    drop *= Math.pow(0.78, d); if (drop < 0.3) drop = 0;
    poop.style.transform =
      'translateY(' + (bob + sink).toFixed(2) + 'px) rotate(' + ch.rot.toFixed(2) + 'deg) ' +
      'scale(' + (ch.sx * baseX).toFixed(3) + ',' + (ch.sy * baseY * pressSquash).toFixed(3) + ')';
    var fadeIn = Math.min(1, 0.34 + grow * 2.9);
    if (fadeIn !== lastFade) { lastFade = fadeIn; poop.style.opacity = fadeIn.toFixed(2); }
    shadowEl.style.transform = 'scale(' + (0.92 + (ch.sx * baseX - 1) * 0.5).toFixed(3) + ',' +
      (0.92 - (ch.sy * baseY - 1) * 0.3).toFixed(3) + ')';
    shadowEl.style.opacity = Math.min(1, grow * 3.2) * Math.max(.35, 1 - Math.abs(ch.sx - 1) * .8);
    shadowEl.style.width = (62 + Math.min(grow, 1.2) * 62).toFixed(0) + 'px';

    /* 飞行屎：JS 驱动真抛物线位移（内层 CSS 负责挤压弹射与落地回弹） */
    for (var f = flyers.length - 1; f >= 0; f--) {
      var fl = flyers[f];
      fl.t += dt;
      if (fl.t >= fl.T) { fl.t = fl.T; flyers.splice(f, 1); }
      var fx = fl.x0 + fl.vx * fl.t;
      var fy = fl.y0 + fl.vy0 * fl.t + 0.5 * fl.g * fl.t * fl.t;
      fl.el.style.transform = 'translate(' + (fx - fl.sz / 2).toFixed(1) + 'px,' + (fy - fl.sz / 2).toFixed(1) + 'px)';
    }

    /* 震屏 */
    if (shake > 0.4) {
      shake *= Math.pow(0.82, d);
      gameEl.style.transform = 'translate(' + (Math.random() - .5) * shake + 'px,' +
        (Math.random() - .5) * shake + 'px)';
    } else if (shake !== 0) {
      shake = 0; gameEl.style.transform = '';
    }

    /* 背景气泡：30fps 节流绘制（背景低频即可，省一半 clear/fill） */
    frameSkip = (frameSkip + 1) % 2;
    if (frameSkip === 0) {
      bg2d.clearRect(0, 0, CW, CH);
      for (var i = 0; i < bubs.length; i++) {
        var b = bubs[i];
        b.y -= b.vy * dt * 2;
        if (b.y < -8) { b.y = CH + 8; b.x = Math.random() * CW; }
        bg2d.globalAlpha = b.a * (0.7 + 0.3 * Math.sin(tsec * 1.4 + b.ph));
        bg2d.fillStyle = '#FFFFFF';
        bg2d.beginPath();
        bg2d.arc(b.x + Math.sin(tsec * .7 + b.ph) * 6, b.y, b.r, 0, 6.283);
        bg2d.fill();
      }
      bg2d.globalAlpha = 1;
    }

    /* 前景粒子：没有粒子时完全跳过 clear/draw，避免每帧空转 */
    if (parts.length) {
    fx2d.clearRect(0, 0, CW, CH);
    for (var j = parts.length - 1; j >= 0; j--) {
      var p = parts[j];
      p.vy += p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.s += (p.gs || 0) * dt;
      p.r += (p.rv || 0) * dt;
      p.a -= p.f * dt;
      if (p.a <= 0 || p.y > CH + 90) { parts.splice(j, 1); continue; }
      fx2d.globalAlpha = Math.max(0, Math.min(1, p.a));
      fx2d.save();
      fx2d.translate(p.x, p.y); fx2d.rotate(p.r);
      if (p.t === 'drop') {
        fx2d.fillStyle = p.c;
        fx2d.beginPath(); fx2d.ellipse(0, 0, p.s, p.s * 1.2, 0, 0, 6.283); fx2d.fill();
      } else if (p.t === 'ring') {
        fx2d.strokeStyle = p.c; fx2d.lineWidth = Math.max(1, p.w * p.a);
        fx2d.beginPath(); fx2d.arc(0, 0, p.s, 0, 6.283); fx2d.stroke();
      } else if (p.t === 'star') {
        fx2d.fillStyle = p.c; drawStar(fx2d, p.s);
      } else if (p.t === 'conf') {
        fx2d.fillStyle = p.c;
        fx2d.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .64);
      }
      fx2d.restore();
    }
    fx2d.globalAlpha = 1;
    }
  }

  /* ============================================================
     5. 音效（WebAudio 合成，无外部资源）
     ============================================================ */
  var AC = null, master = null, noiseBuf = null, muted = false;
  try { muted = localStorage.getItem('ls_mute') === '1'; } catch (e) {}
  $('soundBtn').textContent = muted ? '🔇' : '🔊';

  function audioReady() {
    if (AC) { if (AC.state === 'suspended') AC.resume(); return true; }
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) return false;
    AC = new C();
    master = AC.createGain();
    master.gain.value = 0.55;
    master.connect(AC.destination);
    var len = Math.floor(AC.sampleRate * 0.4);
    noiseBuf = AC.createBuffer(1, len, AC.sampleRate);
    var data = noiseBuf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    return true;
  }
  function tone(freq, to, dur, type, vol) {
    if (muted || !audioReady()) return;
    var o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, AC.currentTime);
    o.frequency.exponentialRampToValueAtTime(Math.max(30, to), AC.currentTime + dur);
    var peak = vol || .12;
    g.gain.setValueAtTime(.0008, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(peak, AC.currentTime + Math.min(.012, dur * .25));
    g.gain.exponentialRampToValueAtTime(.0008, AC.currentTime + dur);
    o.connect(g); g.connect(master);
    o.start(); o.stop(AC.currentTime + dur + .02);
  }
  function noise(freq, dur, vol) {
    if (muted || !audioReady()) return;
    var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
    s.buffer = noiseBuf;
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.4;
    var peak = vol || .18;
    g.gain.setValueAtTime(.0008, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(peak, AC.currentTime + Math.min(.01, dur * .2));
    g.gain.exponentialRampToValueAtTime(.0008, AC.currentTime + dur);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(); s.stop(AC.currentTime + dur);
  }
  function sfxTap(combo) {
    var base = 430 + Math.min(combo, 14) * 34;
    noise(760 + Math.min(combo, 14) * 22, .07, .16);
    tone(base, base * .52, .11, 'sine', .14);
    if (combo >= 5) tone(base * 2.02, base * 1.7, .05, 'triangle', .05);
  }
  function sfxLevel() {
    [0, 90, 180, 300].forEach(function (t, i) {
      setTimeout(function () { tone([523, 659, 784, 1046][i], [523, 659, 784, 1046][i] * 1.01, .26, 'triangle', .1); }, t);
    });
  }
  function sfxUnlock() { tone(680, 1020, .22, 'triangle', .12); setTimeout(function () { tone(1020, 1360, .18, 'sine', .08); }, 130); }
  function sfxFlush() {
    noise(520, .34, .20); tone(620, 190, .3, 'sine', .13);
    setTimeout(function () { tone(300, 120, .22, 'sine', .08); }, 120);
  }

  var soundBtn = $('soundBtn');
  soundBtn.onclick = function () {
    muted = !muted;
    try { localStorage.setItem('ls_mute', muted ? '1' : '0'); } catch (e) {}
    soundBtn.textContent = muted ? '🔇' : '🔊';
    if (!muted) { audioReady(); sfxTap(1); }
    toast(muted ? '已静音' : '音效已开启');
  };

  /* ============================================================
     6. 提示 / 飘字
     ============================================================ */
  var bannerEl = $('banner'), toastEl = $('toast'), toastTimer = null;
  function banner(text) {
    bannerEl.textContent = text;
    bannerEl.classList.remove('show'); void bannerEl.offsetWidth;
    bannerEl.classList.add('show');
    setTimeout(function () { bannerEl.classList.remove('show'); }, 1600);
  }
  function toast(text) {
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 1700);
  }
  function popNum(text, skin, combo) {
    var r = stage.getBoundingClientRect();
    var c = anchor();
    var el = document.createElement('div');
    el.className = 'pop-num';
    var scale = 1 + Math.min(combo, 20) * 0.055;
    el.textContent = text;
    el.style.fontSize = (24 * scale).toFixed(1) + 'px';
    el.style.left = (r.left + c.x + (Math.random() - .5) * 58) + 'px';
    el.style.top = (r.top + c.y - 74 - Math.random() * 12) + 'px';
    el.style.setProperty('--dx', ((Math.random() - .5) * 46).toFixed(0) + 'px');
    if (combo >= 18) el.style.color = '#FFC46B';
    else if (combo >= 8) el.style.color = '#FFE27A';
    document.body.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 860);
  }

  /* ============================================================
     7. 点击主循环
     ============================================================ */
  var combo = 0, comboTimer = null, comboT = 0;
  var comboEl = $('combo'), comboNum = $('comboNum');

  function burst(ev) {
    if (toilet >= TOILET_CAP) { pressing = false; pq = 0; return; }
    var skin = skinById(curSkin);
    var c = anchor();
    var r = stage.getBoundingClientRect();
    var dir = 0;
    if (ev && typeof ev.clientX === 'number' && ev.clientX) {
      dir = (ev.clientX - (r.left + c.x)) / (r.width / 2);
    }
    dir = Math.max(-1, Math.min(1, dir));

    /* 连击计时 */
    var now = performance.now();
    if (now - comboT < 1150) combo++; else combo = 1;
    comboT = now;
    clearTimeout(comboTimer);
    comboTimer = setTimeout(function () {
      combo = 0; comboEl.classList.remove('on', 'hot', 'blaze');
    }, 1150);


    var hintEl = $('hint'); if (hintEl) hintEl.classList.add('gone');
    pulse(combo >= 10 ? 9 : 0);

    /* 飞出瞬间的粒子爆发 */
    drops(c.x, c.y + 30, skin, 2, 1.25);
    if (!RM) sparks(c.x, c.y - 16, skin, combo >= 5 ? 3 : 2, 1.25);
    ring(c.x, c.y + 26, 12, 'rgba(255,247,228,.72)', 3, 170, 2.4);
    if (!RM) confetti(c.x, c.y + 6, combo >= 5 ? 8 : 5);
    var flyEl = spawnLandedPoop(skin, combo, dir);
    /* 原坨立刻消失，只留飞出去的这一坨 */
    resetToSeed();

    /* 惊奇表情跟着飞出去的屎：张嘴 → 320ms 后恢复笑脸 */
    if (flyEl) {
      flyEl.classList.add('charge');
      setTimeout(function () { flyEl.classList.remove('charge'); }, 320);
    }

    popNum('+1', skin, combo);
    sfxTap(combo);
    if (combo > 0 && combo % 5 === 0 && navigator.vibrate) navigator.vibrate(12);

    /* 连击 UI */
    if (combo >= 3) {
      comboNum.textContent = combo;
      comboEl.classList.toggle('on', true);
      comboEl.classList.toggle('hot', combo >= 8 && combo < 18);
      comboEl.classList.toggle('blaze', combo >= 18);
      if (combo === 8 || combo === 18) {
        var c2 = anchor();
        ring(c2.x, c2.y + 10, 30, combo >= 18 ? 'rgba(255,150,70,.95)' : 'rgba(255,214,140,.95)', 6, 320, 1.3);
        pulse(combo >= 18 ? 12 : 7);
      }
      if (combo === 15) unlockByCombo('shades');
      if (combo === 30) { banner('手感火热！'); unlockByCombo('super'); }
    }

    /* 便池：先存 5 坨，冲水后才进背包 */
    toilet++;
    persist();
    if (ADS.INTERSTITIAL && ADS.INTERSTITIAL.EVERY > 0) {
      adBurstCount++;
      if (adBurstCount % ADS.INTERSTITIAL.EVERY === 0) {
        setTimeout(function () { showAd(ADS.INTERSTITIAL, '跳过'); }, 380);
      }
    }
    $('toiletPct').classList.remove('bump'); void $('toiletPct').offsetWidth;
    $('toiletPct').classList.add('bump');
    if (toilet === TOILET_CAP) {
      banner('便池满了 · 冲马桶入袋！');
      toast('点「冲马桶」把这 5 坨收进背包');
      pulse(8);
    }
    render();
  }

  /* 按住蓄力：按住就一直挤，挤满一节「啪」地落下来；松手原路退回 */
  gaugeEl = $('gauge'); gaugeFill = $('gaugeFill');
  var lastFullTip = 0;
  function pressOn(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (toilet >= TOILET_CAP) {
      var t = performance.now();
      if (t - lastFullTip > 1400) { lastFullTip = t; toast('便池满了，先冲马桶吧！'); }
      return;
    }
    pressing = true;
    var h = $('hint'); if (h) h.classList.add('gone');
    if (!AC && !muted) { try { audioReady(); } catch (err) {} }
  }
  function pressOff() { pressing = false; }
  poop.addEventListener('pointerdown', pressOn);
  window.addEventListener('pointerup', pressOff);
  window.addEventListener('pointercancel', pressOff);

  poop.addEventListener('keydown', function (e) {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault(); pressOn(null); }
  });
  poop.addEventListener('keyup', function (e) {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault(); pressOff(); }
  });
  poop.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  function doReset() {
    toilet = 0; combo = 0; pile = 0; drop = 0; pq = 0; pressing = false;
    T.forEach(function (t) { t.oy = 0; t.vo = 0; t.sq = 1; t.vs = 0; t.lx = 0; t.vl = 0; t.rot = 0; t.vr = 0; });
    comboEl.classList.remove('on', 'hot', 'blaze');
    clearLanded();
    persist(); render();
    toast('便池已清空，背包不受影响');
  }
  /* 冲马桶：便池里的 1~5 坨一次性转入背包，并升等级 / 同步云端 */
  function flushToilet() {
    if (toilet <= 0) { toast('便池是空的，先憋几坨～'); return; }
    var n = toilet, pileEl = $('poopPile'), c = anchor();
    landed.slice().forEach(function (el) { el.classList.add('flushed'); });
    if (pileEl) pileEl.classList.add('flushing');
    setTimeout(function () { clearLanded(); if (pileEl) pileEl.classList.remove('flushing'); }, 460);
    toilet = 0;
    var oldBag = bag;
    bag += n; best = bag;
    persist(); scheduleSave();
    ring(c.x, c.y + 26, 22, 'rgba(150,225,255,.95)', 8, 520, 1.1);
    confetti(c.x, c.y + 10, 22);
    sfxFlush(); pulse(11);
    if (navigator.vibrate) navigator.vibrate([24, 40, 18]);
    banner('冲马桶！+' + n + ' 入袋');
    var newLv = levelFrom(bag);
    if (newLv > lv) {
      lv = newLv;
      setTimeout(function () {
        banner('LEVEL UP · Lv.' + lv); sfxLevel();
        confetti(c.x, c.y + 6, 40);
        ring(c.x, c.y + 20, 20, 'rgba(255,220,150,.95)', 9, 420, 1);
        pulse(14);
      }, 480);
    }
    for (var i = 0; i < SKINS.length; i++) {
      if (oldBag < SKINS[i].need && bag >= SKINS[i].need) {
        setTimeout(function (name) {
          return function () { banner('解锁 · ' + name); sfxUnlock(); confetti(anchor().x, anchor().y, 26); };
        }(SKINS[i].name), 900);
        renderSkins();
        break;
      }
    }
    render();
  }
  $('flush').addEventListener('click', flushToilet);
  $('reset').addEventListener('click', function () {
    if (adValid(ADS.REVIVE)) { adAfterClose = doReset; showAd(ADS.REVIVE, '继续游戏'); }
    else doReset();
  });

  /* ============================================================
     8. 渲染 UI
     ============================================================ */
  function localBest() { try { return parseInt(localStorage.getItem('ls_best') || '0', 10) || 0; } catch (e) { return 0; } }
  function setLocalBest(v) { try { localStorage.setItem('ls_best', v); } catch (e) {} }

  function render() {
    $('score').textContent = bag;
    $('barLv').textContent = 'Lv.' + lv;
    $('barPct').textContent = bag + ' / ' + need(lv);
    var from = need(lv - 1), to = need(lv);
    $('bar').style.width = Math.min(100, Math.max(0, (bag - from) / (to - from) * 100)) + '%';
    $('best').textContent = bag;
    $('toiletPct').textContent = toilet + ' / ' + TOILET_CAP;
    var slots = $('toiletSlots').children;
    for (var i = 0; i < slots.length; i++) slots[i].classList.toggle('on', i < toilet);
    var has = toilet > 0, fb = $('flush');
    fb.disabled = !has;                      /* 有 1~5 坨就能冲，满 5 只是高亮提示 */
    fb.classList.toggle('ready', toilet >= TOILET_CAP);
    fb.textContent = has ? '🚽 冲马桶 +' + toilet : '🚽 冲马桶 0/' + TOILET_CAP;
  }

  /* ============================================================
     9. 账号
     ============================================================ */
  function refreshUser() {
    var me = window.CloudAuth.me();
    if (me) {
      $('userinfo').innerHTML = '<span class="name">' + me.nickname + '</span> <span class="badge">' + (cloudOn ? '云端' : '本地') + '</span>';
      $('useracts').innerHTML = '<button id="logout" class="sm ghost">退出</button>';
      $('logout').onclick = function () {
        window.CloudAuth.logout();
        refreshUser(); render(); renderSkins();
        toast('已退出登录');
      };
    } else {
      $('userinfo').innerHTML = '未登录 <span class="badge" id="mode">' + (cloudOn ? '云端' : '本地') + '</span>';
      $('useracts').innerHTML = '<button id="login" class="sm ghost">登录 / 注册</button>';
      $('login').onclick = openAuth;
    }
    if ($('mode')) $('mode').textContent = cloudOn ? '云端' : '本地';
  }

  /* 云端 best 触发器限制单次增量 ≤50：老档迁移时分段追平，避免一次写大数被拒 */
  function syncBagToCloud() {
    var me = window.CloudAuth.me();
    if (!cloudOn || !me) return;
    var guard = 0;
    function step() {
      if (guard++ > 200) return;
      window.CloudAuth.pullBest(me.user).then(function (b) {
        if (b >= bag) return;
        var next = Math.min(bag, b + 50);
        window.CloudAuth.pushBest(me.user, next).then(function (done) {
          if (done && next < bag) setTimeout(step, 60);
        });
      });
    }
    step();
  }
  function scheduleSave() {
    var me = window.CloudAuth.me();
    if (!cloudOn || !me) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(syncBagToCloud, (window.LS_CONFIG && window.LS_CONFIG.SAVE_DEBOUNCE_MS) || 1500);
  }

  /* ============================================================
     10. 皮肤面板
     ============================================================ */
  var comboBest = 0;
  try { comboBest = parseInt(localStorage.getItem('ls_combo_best') || '0', 10) || 0; } catch (e) {}
  function unlocked(s) { return best >= s.need || (s.needC && comboBest >= s.needC); }
  /* 连击成就解锁：不用攒到高分，连击达标即可提前拿到皮肤 */
  function unlockByCombo(id) {
    var s = skinById(id);
    if (!s || !s.needC) return;
    if (comboBest >= s.needC) return;
    comboBest = Math.max(comboBest, s.needC);
    try { localStorage.setItem('ls_combo_best', comboBest); } catch (e) {}
    banner('成就解锁 · ' + s.name);
    sfxUnlock(); confetti(anchor().x, anchor().y, 30);
    renderSkins();
  }
  function renderSkins() {
    $('skinGrid').innerHTML = SKINS.map(function (s) {
      var ok = unlocked(s);
      var on = s.id === curSkin;
      var cls = 'skin-item' + (on ? ' on' : '') + (ok ? '' : ' locked');
      var cond = ok ? (on ? '使用中' : '已解锁') :
        (s.needC ? ('最高分 ' + s.need + ' 或连击 ' + s.needC) : ('最高分 ' + s.need));
      var lock = ok ? '' : '<span class="lock-tag">🔒</span>';
      return '<div class="' + cls + '" data-skin="' + s.id + '">' + lock +
        '<span class="pv">' + skinPreview(s) + '</span>' +
        '<div class="skin-name">' + s.name + '</div>' +
        '<div class="skin-cond">' + cond + '</div></div>';
    }).join('');
    Array.prototype.forEach.call($('skinGrid').querySelectorAll('[data-skin]'), function (item) {
      item.onclick = function () {
        var s = skinById(item.getAttribute('data-skin'));
        if (!unlocked(s)) {
          toast('最高分达到 ' + s.need + ' 才能解锁「' + s.name + '」');
          return;
        }
        if (s.id === curSkin) { toast('正在使用「' + s.name + '」'); return; }
        curSkin = s.id;
        try { localStorage.setItem('ls_skin', curSkin); } catch (e) {}
        applySkin(true); renderSkins();
        sfxUnlock();
        toast('已换上「' + s.name + '」');
      };
    });
  }
  $('skin').onclick = function () { renderSkins(); $('skinOverlay').classList.add('show'); };
  $('skinClose').onclick = function () { $('skinOverlay').classList.remove('show'); };
  $('skinOverlay').addEventListener('click', function (e) { if (e.target === this) { this.classList.remove('show'); } });

  /* ============================================================
     11. 登录 UI
     ============================================================ */
  var authMode = 'login';
  function setAuthMode(m) {
    authMode = m;
    $('tabLogin').className = m === 'login' ? 'on' : '';
    $('tabReg').className = m === 'reg' ? 'on' : '';
    $('authTitle').textContent = m === 'login' ? '登录' : '注册';
    $('authSubmit').textContent = m === 'login' ? '登录' : '注册';
    $('authMsg').textContent = '';
  }
  function openAuth() { $('authOverlay').classList.add('show'); setAuthMode('login'); setTimeout(function(){ $('au').focus(); }, 120); }
  $('tabLogin').onclick = function () { setAuthMode('login'); };
  $('tabReg').onclick = function () { setAuthMode('reg'); };
  $('authClose').onclick = function () { $('authOverlay').classList.remove('show'); };
  $('authOverlay').addEventListener('click', function (e) { if (e.target === this) this.classList.remove('show'); });

  $('authSubmit').onclick = function () {
    var u = $('au').value, p = $('ap').value;
    $('authMsg').textContent = '处理中…';
    var fn = authMode === 'login' ? window.CloudAuth.login : window.CloudAuth.register;
    fn(u, p).then(function (res) {
      $('authMsg').textContent = res.msg || '';
      if (!res.ok) return;
      if (authMode === 'reg') { setAuthMode('login'); return; }
      $('authOverlay').classList.remove('show');
      refreshUser();
      toast('欢迎回来，' + (res.me ? res.me.nickname : ''));
      if (res.me && cloudOn) {
        window.CloudAuth.pullBest(res.me.user).then(function (b) {
          if (b > bag) { bag = b; best = bag; persist(); render(); renderSkins(); }
          else if (b < bag) scheduleSave();
        });
      }
    });
  };

  /* ============================================================
     12. 排行榜 UI
     ============================================================ */
  $('rank').onclick = function () {
    bootCloud();
    $('rankOverlay').classList.add('show');
    $('rankList').innerHTML = '<div class="rank-empty">' + (cloudOn ? '加载中…' : '云端功能加载中，请稍候') + '</div>';
    if (!cloudOn) {
      $('rankList').innerHTML = '<div class="rank-empty">未启用云端模式，暂无排行榜</div>';
      return;
    }
    window.CloudAuth.ranking(20).then(function (rows) {
      if (!rows.length) { $('rankList').innerHTML = '<div class="rank-empty">暂无云端记录 · 登录后点击即可上榜</div>'; return; }
      var me = window.CloudAuth.me();
      $('rankList').innerHTML = rows.map(function (r, i) {
        var cls = 'rank-row' + (i === 0 ? ' top1' : '') + ((me && r.user === me.user) ? ' me' : '');
        return '<div class="' + cls + '"><span class="no">' + (i + 1) + '</span>' +
          '<span class="nm">' + r.nickname + '</span><span class="sc">💩 ' + r.best + '</span></div>';
      }).join('');
    });
  };
  $('rankClose').onclick = function () { $('rankOverlay').classList.remove('show'); };
  $('rankOverlay').addEventListener('click', function (e) { if (e.target === this) this.classList.remove('show'); });

  /* ============================================================
     12.5 支持作者（打赏入口：配置来自 config.js 的 SUPPORT）
     ============================================================ */
  var SUP = (window.LS_CONFIG && window.LS_CONFIG.SUPPORT) || {};
  function supEsc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  var supBtn = $('supportBtn');
  if (supBtn && SUP.ENABLED === false) supBtn.style.display = 'none';
  if (supBtn) supBtn.onclick = function () {
    var html = '';
    if (SUP.AFDIAN) {
      html += '<a class="support-main" href="' + supEsc(SUP.AFDIAN) + '" target="_blank" rel="noopener">🙏 去爱发电支持作者</a>';
    }
    var qrs = '';
    if (SUP.WECHAT_QR) {
      qrs += '<div class="support-qr"><img src="' + supEsc(SUP.WECHAT_QR) + '" alt="微信收款码"><b>微信</b><small>长按保存 / 截图扫码</small></div>';
    }
    if (SUP.ALIPAY_QR) {
      qrs += '<div class="support-qr"><img src="' + supEsc(SUP.ALIPAY_QR) + '" alt="支付宝收款码"><b>支付宝</b><small>长按保存 / 截图扫码</small></div>';
    }
    if (qrs) html += '<div class="support-qrs">' + qrs + '</div>';
    if (!html) html = '<div class="support-empty">作者还没设置收款方式～<br>把游戏分享给朋友，就是最大的支持！</div>';
    $('supportNote').textContent = SUP.NOTE || '如果玩得开心，欢迎支持一下作者～';
    $('supportBody').innerHTML = html;
    $('supportOverlay').classList.add('show');
  };
  $('supportClose').onclick = function () { $('supportOverlay').classList.remove('show'); };
  $('supportOverlay').addEventListener('click', function (e) { if (e.target === this) this.classList.remove('show'); });

  /* ============================================================
     12.6 内嵌广告位（配置来自 config.js 的 ADS）
     ============================================================ */
  var ADS = (window.LS_CONFIG && window.LS_CONFIG.ADS) || {};
  var adBurstCount = 0, adAfterClose = null;
  var AD_OPEN_KEY = 'ls_ad_open_shown';
  function adValid(cfg) { return ADS.ENABLED !== false && !!(cfg && cfg.IMAGE); }
  function adDismiss() {
    $('adOverlay').classList.remove('show');
    var f = adAfterClose; adAfterClose = null;
    if (f) f();
  }
  function showAd(cfg, fallbackClose) {
    if (!adValid(cfg) || $('adOverlay').classList.contains('show')) return false;
    $('adTitle').textContent = cfg.TITLE || '赞助';
    $('adText').textContent = cfg.TEXT || '';
    var img = $('adImg');
    img.onerror = function () { this.style.display = 'none'; };
    img.style.display = ''; img.src = cfg.IMAGE;
    var link = $('adLink');
    if (cfg.LINK) { link.href = supEsc(cfg.LINK); link.setAttribute('target', '_blank'); link.setAttribute('rel', 'noopener'); }
    else { link.removeAttribute('href'); link.removeAttribute('target'); }
    $('adClose').textContent = cfg.CLOSE_TEXT || fallbackClose || '跳过';
    $('adOverlay').classList.add('show');
    return true;
  }
  $('adClose').onclick = adDismiss;
  $('adOverlay').addEventListener('click', function (e) { if (e.target === this) adDismiss(); });
  (function () {
    var el = $('adBanner'), cfg = ADS.BANNER;
    if (!adValid(cfg)) { el.style.display = 'none'; return; }
    el.innerHTML = '<img src="' + supEsc(cfg.IMAGE) + '" alt="广告">' +
      (cfg.TEXT ? '<span class="ab-text">' + supEsc(cfg.TEXT) + '</span>' : '');
    if (cfg.LINK) { el.href = supEsc(cfg.LINK); el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
    el.style.display = 'block';
  })();

  /* ============================================================
     13. 启动
     ============================================================ */
  /* 手机长按不选中文字 / 不弹 iOS 菜单（输入框除外） */
  document.addEventListener('selectstart', function (e) {
    var tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.preventDefault) e.preventDefault();
  });

  $('poop').innerHTML = charMarkup();
  buildRig();
  applySkin(false);
  fitCanvas();
  loadSave();
  restorePile();
  requestAnimationFrame(tick);
  window.addEventListener('resize', function () { fitCanvas(); });
  window.addEventListener('orientationchange', function () { setTimeout(fitCanvas, 180); });

  /* 云端 SDK 异步加载：首屏不等 CDN，SDK 就绪后补启用云账号 */
  function bootCloud() {
    if (cloudOn) return;
    if (window.CloudAuth && window.CloudAuth.init()) {
      cloudOn = true;
      refreshUser();
      var m = window.CloudAuth.me();
      if (m) {
        window.CloudAuth.pullBest(m.user).then(function (b) {
          if (b > bag) { bag = b; best = bag; persist(); render(); renderSkins(); }
          else if (b < bag) scheduleSave();
        });
      }
    }
  }
  bootCloud();
  best = bag;
  render(); renderSkins();
  window.addEventListener('cloudbase-ready', bootCloud);
  /* 事件可能在监听注册前触发，用标志兜底 */
  if (window.__sdkReady || typeof window.cloudbase !== 'undefined') bootCloud();
  /* 开屏广告：会话内只弹一次，不阻塞首屏 */
  if (adValid(ADS.OPEN)) {
    var showOpen = true;
    if (ADS.OPEN.ONCE_PER_SESSION !== false) {
      try { showOpen = sessionStorage.getItem(AD_OPEN_KEY) !== '1'; } catch (e) {}
    }
    if (showOpen) {
      try { sessionStorage.setItem(AD_OPEN_KEY, '1'); } catch (e) {}
      setTimeout(function () { showAd(ADS.OPEN, '跳过'); }, 600);
    }
  }
})();