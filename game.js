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

  /* ---- 角色形状（四层调色 + union 剪影里的光影 + 五官 + 装饰） ---- */
  function tiers() {
    return '<ellipse class="p-t4" cx="105" cy="166" rx="72" ry="36"/>' +
           '<ellipse class="p-t3" cx="105" cy="128" rx="52" ry="31"/>' +
           '<ellipse class="p-t2" cx="105" cy="95" rx="36" ry="25"/>' +
           '<path class="p-t1" d="M97 86 C91 67 99 50 115 44 C128 39 138 49 131 59 C124 69 115 75 113 88 Z"/>';
  }
  function clipShape() {
    return '<ellipse cx="105" cy="166" rx="72" ry="36"/>' +
           '<ellipse cx="105" cy="128" rx="52" ry="31"/>' +
           '<ellipse cx="105" cy="95" rx="36" ry="25"/>' +
           '<path d="M97 86 C91 67 99 50 115 44 C128 39 138 49 131 59 C124 69 115 75 113 88 Z"/>';
  }
  function shadows() {
    return /* 底面投影 */ '<ellipse class="p-dark" cx="105" cy="199" rx="73" ry="25" opacity=".45" style="filter:blur(7px)"/>' +
           /* 层与层之间的接缝阴影 */ '<ellipse class="p-dark" cx="105" cy="148" rx="44" ry="10" opacity=".22" style="filter:blur(5px)"/>' +
           '<ellipse class="p-dark" cx="105" cy="112" rx="30" ry="8" opacity=".18" style="filter:blur(4px)"/>' +
           /* 每层顶部的受光边 */ '<ellipse class="p-light" cx="105" cy="122" rx="43" ry="7" opacity=".3" style="filter:blur(5px)"/>' +
           '<ellipse class="p-light" cx="105" cy="90" rx="29" ry="6" opacity=".28" style="filter:blur(4px)"/>' +
           '<ellipse class="p-light" cx="122" cy="52" rx="10" ry="6" opacity=".34" style="filter:blur(3px)"/>' +
           /* 侧面高光 */ '<ellipse class="gloss" cx="72" cy="86" rx="20" ry="8" opacity=".2" transform="rotate(-20 72 86)" style="filter:blur(5px)"/>' +
           '<ellipse class="gloss" cx="76" cy="120" rx="16" ry="7" opacity=".16" transform="rotate(-14 76 120)" style="filter:blur(5px)"/>' +
           '<ellipse class="gloss" cx="80" cy="154" rx="18" ry="8" opacity=".13" transform="rotate(-10 80 154)" style="filter:blur(6px)"/>';
  }
  function face() {
    return '<g class="face">' +
      '<ellipse class="p-blush" cx="74" cy="137" rx="9.5" ry="5.5" opacity=".42"/>' +
      '<ellipse class="p-blush" cx="136" cy="137" rx="9.5" ry="5.5" opacity=".42"/>' +
      '<g class="eyes">' +
        '<g class="eye"><ellipse class="eye-w" cx="88" cy="120" rx="7.5" ry="9"/>' +
          '<ellipse class="eye-p" cx="89.5" cy="121" rx="4.4" ry="5.4"/>' +
          '<ellipse class="eye-g" cx="86.5" cy="117" rx="1.7" ry="1.7"/></g>' +
        '<g class="eye"><ellipse class="eye-w" cx="122" cy="120" rx="7.5" ry="9"/>' +
          '<ellipse class="eye-p" cx="123.5" cy="121" rx="4.4" ry="5.4"/>' +
          '<ellipse class="eye-g" cx="120.5" cy="117" rx="1.7" ry="1.7"/></g>' +
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
      '<defs><clipPath id="poopClip">' + clipShape() + '</clipPath></defs>' +
      capeMarkup() +
      '<g clip-path="url(#poopClip)">' + tiers() + shadows() + '</g>' +
      face() + decoShades() + decoSuper() +
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
      ';--t1:' + mixHex(s.body, s.light, .62) + ';--t2:' + mixHex(s.body, s.light, .3) +
      ';--t3:' + s.body + ';--t4:' + mixHex(s.body, s.dark, .26);
  }
  function skinPreview(s) {
    var inner = tiers() + shadows() + face();
    if (s.deco === 'shades') inner += decoShades();
    if (s.deco === 'super') inner += decoSuper();
    return '<svg viewBox="0 0 210 210" class="' + (s.rainbow ? 'rainbow' : '') + '" ' +
      'style="' + varsStyle(s) + '">' + inner + '</svg>';
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
  var score = 0, lv = 1, best = 0, cloudOn = false, saveTimer = null;
  function need(n) { return 10 * n * n; }

  /* ============================================================
     3. 画布与粒子
     ============================================================ */
  var stage = $('stage'), poop = $('poop'), shadowEl = $('charShadow'), gameEl = $('game');
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
  var shake = 0, tsec = 0, lastT = 0;
  var pageHidden = false, frameSkip = 0;
  document.addEventListener('visibilitychange', function () {
    pageHidden = document.hidden;
    lastT = 0;
  });

  function hit(power, dir) {
    ch.sx = 1 + 0.26 * power;
    ch.sy = 1 - 0.24 * power;
    ch.vx = 0; ch.vy = 0;
    ch.vr = (dir || 0) * 0.9 * power;
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

    /* 角色弹簧 */
    var kx = 0.34, ky = 0.30, damp = Math.pow(0.72, d);
    ch.vx += (1 - ch.sx) * kx * d; ch.vx *= damp; ch.sx += ch.vx * d;
    ch.vy += (1 - ch.sy) * ky * d; ch.vy *= damp; ch.sy += ch.vy * d;
    ch.vr += (0 - ch.rot) * 0.28 * d; ch.vr *= Math.pow(0.74, d); ch.rot += ch.vr * d;

    var bob = RM ? 0 : Math.sin(tsec * 1.55) * 2.6 + Math.sin(tsec * 0.83) * 1.3;
    poop.style.transform =
      'translateY(' + bob.toFixed(2) + 'px) rotate(' + ch.rot.toFixed(2) + 'deg) ' +
      'scale(' + ch.sx.toFixed(3) + ',' + ch.sy.toFixed(3) + ')';
    shadowEl.style.transform = 'scale(' + (0.92 + (ch.sx - 1) * 0.55).toFixed(3) + ',' +
      (0.92 - (ch.sy - 1) * 0.4).toFixed(3) + ')';
    shadowEl.style.opacity = Math.max(.35, 1 - Math.abs(ch.sx - 1) * .8);

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

  function doTap(ev) {
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
    hit(1, dir);
    pulse(combo >= 10 ? 9 : 0);

    drops(c.x, c.y + 34, skin, 1);
    if (!RM) sparks(c.x, c.y - 20, skin, combo >= 5 ? 2 : 1);
    ring(c.x, c.y + 30, 10, 'rgba(255,247,228,.62)', 2.5, 120, 2.6);

    /* 嘴巴张开 + 眼睛放大 */
    poop.classList.add('charge');
    clearTimeout(doTap._ct);
    doTap._ct = setTimeout(function () { poop.classList.remove('charge'); }, 320);

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

    /* 计分 */
    score++;
    $('score').classList.remove('bump'); void $('score').offsetWidth;
    $('score').classList.add('bump');

    if (score > best) {
      best = score; setLocalBest(best); scheduleSave();
      for (var i = 0; i < SKINS.length; i++) {
        if (SKINS[i].need === best) {
          banner('解锁 · ' + SKINS[i].name);
          sfxUnlock();
          confetti(c.x, c.y + 10, 26);
          renderSkins();
          break;
        }
      }
    }
    while (score >= need(lv)) {
      lv++;
      banner('LEVEL UP · Lv.' + lv);
      sfxLevel();
      confetti(c.x, c.y + 6, 40);
      ring(c.x, c.y + 20, 20, 'rgba(255,220,150,.95)', 9, 420, 1);
      pulse(14);
      if (navigator.vibrate) navigator.vibrate([18, 40, 26]);
    }
    render();
  }

  /* 用 pointerdown 保证「按下即有反馈」；键盘可达 */
  poop.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    if (!AC && !muted) audioReady();
    doTap(e);
  });
  poop.addEventListener('keydown', function (e) {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault(); doTap(null); }
  });
  poop.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  $('reset').addEventListener('click', function () {
    score = 0; lv = 1; combo = 0;
    comboEl.classList.remove('on', 'hot', 'blaze');
    render();
    toast('已重新开始');
  });

  /* ============================================================
     8. 渲染 UI
     ============================================================ */
  function localBest() { try { return parseInt(localStorage.getItem('ls_best') || '0', 10) || 0; } catch (e) { return 0; } }
  function setLocalBest(v) { try { localStorage.setItem('ls_best', v); } catch (e) {} }

  function render() {
    $('score').textContent = score;
    $('barLv').textContent = 'Lv.' + lv;
    $('barPct').textContent = score + ' / ' + need(lv);
    var from = need(lv - 1), to = need(lv);
    $('bar').style.width = Math.min(100, Math.max(0, (score - from) / (to - from) * 100)) + '%';
    $('best').textContent = best;
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
        best = localBest(); refreshUser(); render(); renderSkins();
        toast('已退出登录');
      };
    } else {
      $('userinfo').innerHTML = '未登录 <span class="badge" id="mode">' + (cloudOn ? '云端' : '本地') + '</span>';
      $('useracts').innerHTML = '<button id="login" class="sm ghost">登录 / 注册</button>';
      $('login').onclick = openAuth;
    }
    if ($('mode')) $('mode').textContent = cloudOn ? '云端' : '本地';
  }

  function scheduleSave() {
    var me = window.CloudAuth.me();
    if (!cloudOn || !me) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      window.CloudAuth.pushBest(me.user, best);
    }, (window.LS_CONFIG && window.LS_CONFIG.SAVE_DEBOUNCE_MS) || 1500);
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
  $('skinOverlay').addEventListener('click', function (e) { if (e.target === this) this.classList.remove('show'); });

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
          var newBest = b > localBest() ? b : localBest();
          if (newBest !== best) { best = newBest; setLocalBest(best); render(); renderSkins(); }
        });
      }
    });
  };

  /* ============================================================
     12. 排行榜 UI
     ============================================================ */
  $('rank').onclick = function () {
    $('rankOverlay').classList.add('show');
    $('rankList').innerHTML = '<div class="rank-empty">加载中…</div>';
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
     13. 启动
     ============================================================ */
  $('poop').innerHTML = charMarkup();
  applySkin(false);
  fitCanvas();
  requestAnimationFrame(tick);
  window.addEventListener('resize', function () { fitCanvas(); });
  window.addEventListener('orientationchange', function () { setTimeout(fitCanvas, 180); });

  cloudOn = window.CloudAuth.init();
  refreshUser();
  var me = window.CloudAuth.me();
  if (cloudOn && me) {
    window.CloudAuth.pullBest(me.user).then(function (b) {
      if (b > 0) { best = b; setLocalBest(best); render(); renderSkins(); }
    });
  } else {
    best = localBest();
  }
  render(); renderSkins();
})();