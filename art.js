/* ============================================================================
   Special's Restro & Cafe — generated dish artwork
   ----------------------------------------------------------------------------
   Every dish "photo" on this site is drawn procedurally as inline SVG. Nothing
   is fetched, so the site looks complete offline and nothing ever 404s.

   Usage:  el.innerHTML = SRC.Art.render(item.art, { label: item.name })

   To use real photography instead, give a menu item a `photo` URL — app.js
   layers the <img> on top of this artwork and falls back to it on error.
   ========================================================================== */
window.SRC = window.SRC || {};

SRC.Art = (function () {
  'use strict';

  /* ---------------------------------------------------------------- palettes
     [0] darkest  [1] dark  [2] mid  [3] light  [4] lightest   + accent       */
  const TONES = {
    mocha:     { c: ['#1d1209', '#3a2214', '#6d4126', '#b07a4c', '#f2e0c8'], a: '#d99a55' },
    caramel:   { c: ['#2a1707', '#573010', '#a2661f', '#e5a94f', '#fbe8c8'], a: '#f3b95c' },
    cream:     { c: ['#3a2a18', '#6b5334', '#b39a6e', '#e8dbbd', '#fdf6e6'], a: '#e9c98a' },
    chocolate: { c: ['#150c07', '#2e180f', '#57291a', '#8a4a2c', '#e4c9ad'], a: '#a75f34' },
    chai:      { c: ['#2a1a0d', '#4d2e17', '#8c5a2c', '#c99a5f', '#f5e3c8'], a: '#d9a05b' },
    saffron:   { c: ['#33200a', '#63400f', '#b8801c', '#f0b73f', '#fff0cf'], a: '#ffc457' },
    mango:     { c: ['#3a2405', '#6e4408', '#c07f0c', '#f5bb2a', '#fff2cd'], a: '#ffcb43' },
    berry:     { c: ['#2a0c1c', '#54132f', '#9b2350', '#dd5a86', '#ffdfe8'], a: '#ff7fa5' },
    mint:      { c: ['#08251c', '#0e4433', '#1c7d5c', '#4dbf95', '#d8f6e9'], a: '#63d7a9' },
    spinach:   { c: ['#12200c', '#25401a', '#43702c', '#7aa84f', '#e2f0cf'], a: '#8ec25c' },
    tomato:    { c: ['#2c0b06', '#5a150c', '#a52a17', '#e0512f', '#ffdcc9'], a: '#f26b3f' },
    chilli:    { c: ['#300604', '#5f0f09', '#ad2110', '#e34a26', '#ffd9c6'], a: '#ff6a3c' },
    curry:     { c: ['#33210a', '#5e3c10', '#a86f1d', '#dfa63a', '#ffeccb'], a: '#f0b64d' },
    tandoori:  { c: ['#2e0f07', '#5d2110', '#a34019', '#dd7333', '#ffe2c4'], a: '#f2853a' },
    charcoal:  { c: ['#0f0f11', '#1e1e22', '#3a3a42', '#6b6b76', '#dcdce2'], a: '#8c8c99' }
  };

  const SURFACES = {
    wood:   { top: '#7d4d28', bot: '#301708', ink: 'rgba(0,0,0,.30)', lift: 'rgba(255,225,190,.10)' },
    marble: { top: '#f7f2ea', bot: '#d5cabb', ink: 'rgba(120,108,94,.28)', lift: 'rgba(255,255,255,.55)' },
    slate:  { top: '#474d52', bot: '#12161a', ink: 'rgba(0,0,0,.35)', lift: 'rgba(255,255,255,.10)' },
    dark:   { top: '#1c130d', bot: '#070505', ink: 'rgba(0,0,0,.45)', lift: 'rgba(255,200,140,.10)' }
  };

  const CERAMIC = ['#ffffff', '#efe7dc', '#cdc0b1', '#9d9084'];

  /* --------------------------------------------------------------- plumbing */
  let seq = 0;

  function rng(seed) {
    let s = 2166136261;
    for (let i = 0; i < seed.length; i++) { s ^= seed.charCodeAt(i); s = Math.imul(s, 16777619); }
    return function () {
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
      return ((s >>> 0) % 100000) / 100000;
    };
  }

  function Builder(key) { this.k = key; this.d = []; this.b = []; }
  Builder.prototype.id = function (n) { return this.k + '_' + n; };
  Builder.prototype.u = function (n) { return 'url(#' + this.k + '_' + n + ')'; };
  Builder.prototype.def = function (m) { this.d.push(m); return this; };
  Builder.prototype.add = function (m) { this.b.push(m); return this; };
  Builder.prototype.lg = function (n, stops, x1, y1, x2, y2) {
    this.def('<linearGradient id="' + this.id(n) + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' +
      stops.map(s => '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>').join('') +
      '</linearGradient>');
    return this;
  };
  Builder.prototype.rg = function (n, stops, cx, cy, r) {
    this.def('<radialGradient id="' + this.id(n) + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' +
      stops.map(s => '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>').join('') +
      '</radialGradient>');
    return this;
  };
  Builder.prototype.clip = function (n, markup) {
    this.def('<clipPath id="' + this.id(n) + '">' + markup + '</clipPath>');
    return this;
  };

  const ell = (cx, cy, rx, ry, fill, extra) =>
    '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"' + (extra || '') + '/>';
  const cir = (cx, cy, r, fill, extra) =>
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' + (extra || '') + '/>';
  const rr = (x, y, w, h, r, fill, extra) =>
    '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '" fill="' + fill + '"' + (extra || '') + '/>';
  const pth = (d, fill, extra) => '<path d="' + d + '" fill="' + fill + '"' + (extra || '') + '/>';
  const ln = (x1, y1, x2, y2, stroke, w, extra) =>
    '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + stroke + '" stroke-width="' + w + '" stroke-linecap="round"' + (extra || '') + '/>';
  const grp = (transform, inner) => '<g transform="' + transform + '">' + inner + '</g>';

  /* Small reusable garnishes ------------------------------------------------ */
  function leaf(x, y, rot, sc, col) {
    return grp('translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + sc + ')',
      pth('M0 0 C 12 -14 34 -16 44 -2 C 34 12 12 14 0 0 Z', col) +
      '<path d="M2 0 L 40 -1" stroke="rgba(0,0,0,.25)" stroke-width="1.6" fill="none"/>');
  }
  function lemonWedge(x, y, rot, sc) {
    return grp('translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + sc + ')',
      pth('M0 0 A 34 34 0 0 1 34 34 L 0 34 Z', '#f6d34a') +
      pth('M4 4 A 27 27 0 0 1 30 30 L 4 30 Z', '#fdf0a8') +
      '<path d="M6 18 L 26 18 M 18 8 L 18 28" stroke="#e6bc2f" stroke-width="1.6"/>' +
      pth('M0 0 A 34 34 0 0 1 34 34', 'none', ' stroke="#c9a11f" stroke-width="3"'));
  }
  function steamPuff(x, y, sc, delay, op) {
    return '<path class="art-steam" style="--d:' + delay + 's" opacity="' + (op || .5) + '" transform="translate(' + x + ' ' + y + ') scale(' + sc + ')" ' +
      'd="M0 0 C -16 -26 16 -40 0 -66 C -14 -90 12 -102 2 -126" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/>';
  }
  function shadowUnder(b, cx, cy, rx, ry, strength) {
    b.rg('sh', [[0, '#000', strength || .55], [.62, '#000', (strength || .55) * .45], [1, '#000', 0]], .5, .5, .5);
    b.add(ell(cx, cy, rx, ry, b.u('sh')));
  }

  /* -------------------------------------------------------------- backdrops */
  function backdrop(b, s, t, seed) {
    const r = rng(seed);
    b.lg('bg', [[0, s.top], [1, s.bot]], 0, 0, 0, 1);
    b.add('<rect width="600" height="440" fill="' + b.u('bg') + '"/>');

    if (s === SURFACES.wood) {
      for (let i = 0; i < 5; i++) {
        const y = 40 + i * 92;
        b.add(ln(0, y, 600, y + (r() * 10 - 5), s.ink, 3));
        b.add(ln(0, y + 5, 600, y + 5 + (r() * 8 - 4), s.lift, 2));
      }
      for (let i = 0; i < 7; i++) {
        const x = r() * 600, y = r() * 440;
        b.add('<path d="M' + x + ' ' + y + ' q 40 ' + (10 + r() * 20) + ' 90 2" stroke="rgba(0,0,0,.14)" stroke-width="2" fill="none"/>');
      }
    } else if (s === SURFACES.marble) {
      b.add('<path d="M-20 90 C 140 40 250 150 420 96 C 500 70 560 110 620 82" stroke="' + s.ink + '" stroke-width="3" fill="none" opacity=".7"/>');
      b.add('<path d="M-20 300 C 120 250 220 350 390 300 C 480 274 550 320 620 290" stroke="' + s.ink + '" stroke-width="2" fill="none" opacity=".55"/>');
      b.add('<path d="M120 -10 C 150 120 90 240 160 450" stroke="' + s.ink + '" stroke-width="1.6" fill="none" opacity=".45"/>');
    } else if (s === SURFACES.slate) {
      for (let i = 0; i < 16; i++) {
        b.add(cir(r() * 600, r() * 440, .8 + r() * 2.2, 'rgba(255,255,255,.10)'));
      }
      b.add('<path d="M0 0 L 600 0 L 600 120 L 0 300 Z" fill="rgba(255,255,255,.035)"/>');
    }

    b.rg('glow', [[0, '#fff', .30], [1, '#fff', 0]], .26, .10, .72);
    b.add('<rect width="600" height="440" fill="' + b.u('glow') + '"/>');
    b.rg('accentGlow', [[0, t.a, .18], [1, t.a, 0]], .78, .88, .6);
    b.add('<rect width="600" height="440" fill="' + b.u('accentGlow') + '"/>');
  }

  function vignette(b) {
    b.rg('vig', [[.5, '#000', 0], [1, '#000', .42]], .5, .48, .78);
    b.add('<rect width="600" height="440" fill="' + b.u('vig') + '"/>');
  }

  /* ============================== RENDERERS ============================== */

  /* Top-down cup on a saucer — the whole hot-coffee family ----------------- */
  function cupTop(b, t, a) {
    const sc = a.cup || 1;
    shadowUnder(b, 300, 268, 186 * sc, 168 * sc, .5);

    b.rg('saucer', [[0, CERAMIC[0]], [.62, CERAMIC[1]], [1, CERAMIC[2]]], .34, .28, .8);
    b.rg('cup', [[0, CERAMIC[0]], [.7, CERAMIC[1]], [1, CERAMIC[3]]], .34, .26, .82);
    b.rg('liq', [[0, t.c[2]], [.55, t.c[1]], [1, t.c[0]]], .36, .3, .78);

    const inner = [];
    inner.push(ell(300, 246, 178, 164, b.u('saucer')));
    inner.push(ell(300, 246, 178, 164, 'none', ' stroke="rgba(0,0,0,.16)" stroke-width="2"'));
    inner.push(ell(300, 244, 134, 122, 'rgba(0,0,0,.07)'));
    inner.push(ell(300, 238, 118, 108, b.u('cup')));
    inner.push(ell(300, 238, 118, 108, 'none', ' stroke="rgba(0,0,0,.14)" stroke-width="2.5"'));
    inner.push(ell(300, 240, 100, 91, 'rgba(0,0,0,.10)'));
    inner.push(ell(300, 240, 95, 86, b.u('liq')));

    /* latte art */
    const foam = a.foam || 'rosetta';
    const cw = 'rgba(255,246,232,.94)';
    if (foam === 'rosetta') {
      inner.push('<path d="M300 168 C 296 200 296 250 300 312" stroke="' + cw + '" stroke-width="9" fill="none" stroke-linecap="round"/>');
      for (let i = 0; i < 6; i++) {
        const y = 190 + i * 22, w = 62 - i * 6;
        inner.push('<path d="M300 ' + y + ' q -' + w + ' 6 -' + (w - 14) + ' 22" stroke="' + cw + '" stroke-width="7" fill="none" stroke-linecap="round"/>');
        inner.push('<path d="M300 ' + y + ' q ' + w + ' 6 ' + (w - 14) + ' 22" stroke="' + cw + '" stroke-width="7" fill="none" stroke-linecap="round"/>');
      }
      inner.push(ell(300, 172, 16, 20, cw));
    } else if (foam === 'heart') {
      inner.push(pth('M300 300 C 232 250 226 196 262 178 C 284 167 300 184 300 198 C 300 184 316 167 338 178 C 374 196 368 250 300 300 Z', cw));
      inner.push(ell(300, 176, 12, 9, cw));
      inner.push('<circle cx="252" cy="196" r="30" fill="rgba(120,74,40,.10)"/>');
    } else if (foam === 'swirl') {
      inner.push('<path d="M300 240 m -8 0 a 8 8 0 1 1 16 0 a 22 22 0 1 1 -38 0 a 36 36 0 1 1 62 0 a 52 52 0 1 1 -84 0 a 68 68 0 1 1 112 0" ' +
        'fill="none" stroke="' + cw + '" stroke-width="7" stroke-linecap="round"/>');
    } else { /* crema */
      inner.push(ell(300, 240, 88, 79, 'rgba(240,196,140,.55)'));
      inner.push(ell(300, 240, 62, 55, 'rgba(255,222,176,.35)'));
      const r = rng('crema');
      for (let i = 0; i < 16; i++) {
        const ang = r() * 6.283, rad = r() * 74;
        inner.push(cir(300 + Math.cos(ang) * rad, 240 + Math.sin(ang) * rad * .9, 1.6 + r() * 3.4, 'rgba(255,232,200,.5)'));
      }
    }

    /* rim shine + cup shine */
    inner.push('<path d="M214 200 A 100 92 0 0 1 300 152" stroke="rgba(255,255,255,.55)" stroke-width="7" fill="none" stroke-linecap="round"/>');
    inner.push('<path d="M204 264 A 118 108 0 0 1 236 176" stroke="rgba(255,255,255,.35)" stroke-width="5" fill="none" stroke-linecap="round"/>');

    b.add(grp('translate(300 246) scale(' + sc + ') translate(-300 -246)', inner.join('')));

    /* spoon + stray beans on the saucer */
    b.lg('steel', [[0, '#f4f6f8'], [.5, '#c3cbd2'], [1, '#8f9aa3']], 0, 0, 1, 1);
    b.add(grp('translate(452 300) rotate(-24)',
      rr(0, 0, 76, 9, 4.5, b.u('steel')) + ell(-14, 4.5, 18, 12, b.u('steel')) + ell(-14, 3, 12, 7.5, 'rgba(0,0,0,.14)')));
    b.lg('bean', [[0, t.c[3]], [1, t.c[0]]], 0, 0, 1, 1);
    [[124, 344, -18], [162, 366, 26], [96, 372, 8]].forEach(p => {
      b.add(grp('translate(' + p[0] + ' ' + p[1] + ') rotate(' + p[2] + ')',
        ell(0, 0, 15, 10, b.u('bean')) + '<path d="M-13 0 q 13 -6 26 0" stroke="rgba(0,0,0,.45)" stroke-width="2" fill="none"/>'));
    });
  }

  /* Three-quarter mug with steam ------------------------------------------ */
  function cupSide(b, t, a) {
    shadowUnder(b, 300, 356, 170, 34, .6);
    b.rg('plate', [[0, CERAMIC[0]], [1, CERAMIC[2]]], .35, .3, .8);
    b.add(ell(300, 348, 158, 40, b.u('plate')));
    b.add(ell(300, 344, 122, 28, 'rgba(0,0,0,.10)'));

    b.lg('mug', [[0, CERAMIC[3]], [.16, CERAMIC[0]], [.55, CERAMIC[1]], [1, CERAMIC[3]]], 0, 0, 1, 0);
    /* handle behind the body */
    b.add('<path d="M372 214 c 58 -6 62 82 -2 82" fill="none" stroke="' + b.u('mug') + '" stroke-width="20" stroke-linecap="round"/>');
    b.add('<path d="M372 214 c 58 -6 62 82 -2 82" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="6" stroke-linecap="round"/>');

    b.add(pth('M220 196 L 232 320 q 4 26 68 26 q 64 0 68 -26 L 380 196 Z', b.u('mug')));
    b.add(pth('M240 210 L 250 316 q 2 14 50 14 q 48 0 50 -14 L 360 210 Z', 'rgba(255,255,255,.16)'));

    /* liquid */
    b.rg('liq2', [[0, t.c[2]], [.6, t.c[1]], [1, t.c[0]]], .38, .3, .8);
    b.add(ell(300, 196, 80, 24, CERAMIC[2]));
    b.add(ell(300, 197, 71, 20, b.u('liq2')));
    b.add('<path d="M244 192 A 72 20 0 0 1 300 180" stroke="rgba(255,255,255,.4)" stroke-width="4" fill="none" stroke-linecap="round"/>');
    b.add(ell(300, 196, 80, 24, 'none', ' stroke="rgba(255,255,255,.5)" stroke-width="3"'));

    if (a.tone === 'chocolate') {
      [[276, 190], [306, 186], [292, 200], [322, 196]].forEach((p, i) =>
        b.add(rr(p[0], p[1], 22, 15, 5, i % 2 ? '#fff8ee' : '#ffeedd')));
      b.add(cir(300, 178, 0, 'none'));
    } else {
      b.add(ell(300, 195, 46, 12, 'rgba(255,240,220,.45)'));
    }

    /* rim shine */
    b.add(pth('M226 236 L 232 312 q 1 8 8 12 L 238 236 Z', 'rgba(255,255,255,.35)'));

    if (a.steam !== false) {
      b.add(grp('translate(272 168)', steamPuff(0, 0, .9, 0, .42)));
      b.add(grp('translate(306 158)', steamPuff(0, 0, 1.1, .8, .34)));
      b.add(grp('translate(336 172)', steamPuff(0, 0, .8, 1.6, .3)));
    }

    /* a couple of beans / cinnamon on the plate */
    b.lg('bean2', [[0, t.c[3]], [1, t.c[0]]], 0, 0, 1, 1);
    b.add(grp('translate(430 342) rotate(14)', rr(0, 0, 84, 12, 6, b.u('bean2')) + ln(6, 6, 78, 6, 'rgba(0,0,0,.35)', 2)));
    b.add(grp('translate(150 348) rotate(-12)', ell(0, 0, 16, 11, b.u('bean2')) + '<path d="M-14 0 q 14 -6 28 0" stroke="rgba(0,0,0,.45)" stroke-width="2" fill="none"/>'));
  }

  /* Clay kulhad / glass tumbler of chai ----------------------------------- */
  function kulhad(b, t, a) {
    shadowUnder(b, 300, 348, 132, 28, .58);

    if (a.glass) {
      b.add(pth('M244 176 L 256 330 q 44 12 88 0 L 356 176 Z', 'rgba(255,255,255,.12)'));
      b.rg('kliq', [[0, t.c[3]], [.6, t.c[2]], [1, t.c[1]]], .4, .2, .85);
      b.add(pth('M252 214 L 258 328 q 42 11 84 0 L 348 214 Z', b.u('kliq')));
      b.add(ell(300, 214, 48, 12, 'rgba(255,255,255,.28)'));
      b.add(pth('M244 176 L 256 330 q 44 12 88 0 L 356 176 Z', 'none', ' stroke="rgba(255,255,255,.42)" stroke-width="3"'));
      b.add(pth('M260 190 L 268 320', 'none', ' stroke="rgba(255,255,255,.4)" stroke-width="5" stroke-linecap="round"'));
      /* almond slivers floating */
      [[286, 220, -20], [312, 226, 18], [300, 214, 40]].forEach(p =>
        b.add(grp('translate(' + p[0] + ' ' + p[1] + ') rotate(' + p[2] + ')', ell(0, 0, 11, 5, '#f4e6cd'))));
    } else {
      b.lg('clay', [[0, '#b0703f'], [.2, '#8f5027'], [.62, '#6d3a1b'], [1, '#4a2510']], 0, 0, 1, 0);
      b.add(pth('M238 182 L 258 328 q 42 14 84 0 L 362 182 Z', b.u('clay')));
      b.add(ell(300, 182, 62, 17, '#7d451f'));
      b.rg('chai', [[0, t.c[3]], [.55, t.c[2]], [1, t.c[1]]], .38, .3, .8);
      b.add(ell(300, 184, 53, 13, b.u('chai')));
      b.add(ell(300, 183, 30, 7, 'rgba(255,240,215,.35)'));
      b.add(ell(300, 182, 62, 17, 'none', ' stroke="rgba(255,255,255,.20)" stroke-width="3"'));
      b.add(pth('M246 210 L 262 320', 'none', ' stroke="rgba(255,255,255,.18)" stroke-width="7" stroke-linecap="round"'));
      /* fired-clay speckle */
      const r = rng('kulhad');
      for (let i = 0; i < 22; i++) b.add(cir(250 + r() * 100, 195 + r() * 130, .8 + r() * 1.8, 'rgba(0,0,0,.20)'));
    }

    if (a.steam !== false) {
      b.add(grp('translate(276 158)', steamPuff(0, 0, .85, .2, .40)));
      b.add(grp('translate(308 148)', steamPuff(0, 0, 1.05, 1.0, .32)));
    }
    if (a.smoke) {
      b.rg('smk', [[0, '#fff', .22], [1, '#fff', 0]], .5, .5, .5);
      b.add(ell(300, 130, 130, 70, b.u('smk')));
      b.add(grp('translate(340 164)', steamPuff(0, 0, 1.3, 1.7, .26)));
    }

    /* biscuits + spices on the side */
    b.lg('bisc', [[0, '#e8bd7d'], [1, '#b6822f']], 0, 0, 0, 1);
    b.add(grp('translate(410 322) rotate(-9)', rr(0, 0, 74, 26, 6, b.u('bisc')) +
      '<g fill="rgba(0,0,0,.25)">' + [10, 24, 38, 52, 66].map(x => cir(x, 8, 2.2, 'rgba(0,0,0,.25)') + cir(x, 18, 2.2, 'rgba(0,0,0,.25)')).join('') + '</g>'));
    b.add(grp('translate(160 330)', cir(0, 0, 13, '#5a3316') + '<path d="M-13 0 L 13 0 M 0 -13 L 0 13 M -9 -9 L 9 9 M -9 9 L 9 -9" stroke="#8d5a2c" stroke-width="3"/>'));
    b.add(leaf(122, 300, -24, .5, '#3f7a2f'));
  }

  /* Tall glass — cold coffee, frappe, shake, smoothie, mocktail, lassi ---- */
  function tallGlass(b, t, a) {
    const layers = a.layers == null ? 2 : a.layers;
    shadowUnder(b, 300, 372, 128, 26, .6);

    const gx = a.jar
      ? 'M234 150 L 234 336 q 0 20 66 20 q 66 0 66 -20 L 366 150 Z'
      : 'M232 132 L 248 340 q 6 18 52 18 q 46 0 52 -18 L 368 132 Z';
    b.clip('gc', '<path d="' + gx + '"/>');

    b.add(pth(gx, 'rgba(255,255,255,.10)'));

    /* liquid layers, darkest at the bottom */
    const bands = [];
    if (layers <= 1) bands.push([132, 358, t.c[2]]);
    else if (layers === 2) { bands.push([236, 358, t.c[1]]); bands.push([150, 250, t.c[3]]); }
    else { bands.push([280, 358, t.c[0]]); bands.push([200, 292, t.c[2]]); bands.push([146, 212, t.c[3]]); }

    b.add('<g clip-path="' + b.u('gc') + '">');
    bands.forEach((bd, i) => {
      b.lg('lay' + i, [[0, bd[2]], [1, i === 0 ? t.c[0] : bd[2]]], 0, 0, 1, .4);
      b.add('<rect x="220" y="' + bd[0] + '" width="164" height="' + (bd[1] - bd[0]) + '" fill="' + b.u('lay' + i) + '"/>');
    });
    /* soft blend edges */
    bands.slice(1).forEach((bd, i) => b.add(ell(300, bd[1], 84, 10, 'rgba(255,255,255,.12)')));

    if (a.ice) {
      const r = rng('ice' + a.tone);
      for (let i = 0; i < a.ice; i++) {
        const x = 244 + r() * 100, y = 170 + r() * 150, rot = r() * 60 - 30;
        b.add(grp('translate(' + x + ' ' + y + ') rotate(' + rot + ')',
          rr(-19, -19, 38, 38, 7, 'rgba(255,255,255,.30)') +
          rr(-13, -13, 16, 16, 4, 'rgba(255,255,255,.34)')));
      }
    }
    if (a.crumb) {
      const r = rng('crumb');
      for (let i = 0; i < 18; i++) b.add(rr(240 + r() * 116, 160 + r() * 170, 4 + r() * 7, 4 + r() * 6, 2, 'rgba(70,42,24,.72)'));
    }
    if (a.mint) {
      const r = rng('mintbits');
      for (let i = 0; i < 5; i++) b.add(leaf(248 + r() * 96, 190 + r() * 130, r() * 360, .34, 'rgba(52,120,64,.85)'));
      for (let i = 0; i < 3; i++) b.add(cir(256 + r() * 92, 210 + r() * 110, 8, 'rgba(230,240,140,.5)'));
    }
    /* vertical glass shine inside the liquid */
    b.add(rr(252, 140, 12, 210, 6, 'rgba(255,255,255,.22)'));
    b.add('</g>');

    /* whipped cream dome */
    if (a.whip) {
      b.rg('whip', [[0, '#fffdf7'], [1, '#e8d9c2']], .35, .3, .8);
      b.add(pth('M236 136 c 0 -26 22 -30 30 -18 c 6 -22 30 -26 38 -10 c 8 -20 34 -18 34 4 c 16 -4 26 12 18 24 Z', b.u('whip')));
      b.add(cir(266, 118, 20, b.u('whip')));
      b.add(cir(300, 108, 24, b.u('whip')));
      b.add(cir(334, 120, 19, b.u('whip')));
      b.add(pth('M300 90 c 8 -14 -6 -22 -2 -32 c 10 6 18 20 8 32 Z', b.u('whip')));
      if (a.drizzle) {
        b.add('<path d="M252 122 q 20 16 46 6 q 26 -10 50 4" stroke="' + t.a + '" stroke-width="7" fill="none" stroke-linecap="round"/>');
        b.add('<path d="M266 136 q 16 20 40 10" stroke="' + t.c[1] + '" stroke-width="5" fill="none" stroke-linecap="round"/>');
      }
      if (a.tone === 'berry' || a.tone === 'mango') b.add(cir(300, 88, 12, t.a) + cir(296, 84, 4, 'rgba(255,255,255,.5)'));
    }

    /* glass outline + rim */
    b.add(pth(gx, 'none', ' stroke="rgba(255,255,255,.45)" stroke-width="3.5"'));
    b.add(ell(300, a.jar ? 150 : 132, a.jar ? 66 : 68, 15, 'none', ' stroke="rgba(255,255,255,.55)" stroke-width="3.5"'));
    if (a.jar) {
      b.add(rr(228, 132, 144, 22, 6, 'rgba(224,214,198,.85)'));
      b.add(ln(232, 143, 368, 143, 'rgba(0,0,0,.18)', 3));
    }

    /* straw */
    if (a.straw) {
      b.add(grp('translate(330 76) rotate(14)',
        rr(0, 0, 15, 250, 7, t.a) +
        '<g opacity=".55">' + [20, 56, 92, 128, 164, 200].map(y => rr(0, y, 15, 14, 4, '#ffffff')).join('') + '</g>'));
    }

    /* condensation */
    const r2 = rng('cond');
    for (let i = 0; i < 8; i++) b.add(ell(240 + r2() * 120, 170 + r2() * 170, 2 + r2() * 3, 3 + r2() * 5, 'rgba(255,255,255,.22)'));
    /* reflection puddle */
    b.add(ell(300, 366, 108, 12, 'rgba(255,255,255,.10)'));
  }

  /* Breakfast plate — waffle / omelette / scramble / pancake / poha bowl -- */
  function breakfastPlate(b, t, a) {
    const style = a.style || 'waffle';
    shadowUnder(b, 300, 276, 190, 158, .5);
    b.rg('pl', [[0, CERAMIC[0]], [.66, CERAMIC[1]], [1, CERAMIC[2]]], .34, .28, .82);
    b.add(ell(300, 244, 186, 168, b.u('pl')));
    b.add(ell(300, 244, 186, 168, 'none', ' stroke="rgba(0,0,0,.14)" stroke-width="2"'));
    b.add(ell(300, 244, 152, 136, 'rgba(0,0,0,.05)'));

    if (style === 'waffle') {
      b.lg('wf', [[0, t.c[3]], [.55, t.c[2]], [1, t.c[1]]], 0, 0, .6, 1);
      b.add(grp('translate(300 244) rotate(-8)', (function () {
        let m = rr(-112, -96, 224, 192, 18, b.u('wf'));
        for (let i = 1; i < 5; i++) {
          m += ln(-112 + i * 44.8, -96, -112 + i * 44.8, 96, 'rgba(0,0,0,.30)', 8);
          m += ln(-112, -96 + i * 38.4, 112, -96 + i * 38.4, 'rgba(0,0,0,.30)', 8);
        }
        m += rr(-112, -96, 224, 192, 18, 'none', ' stroke="rgba(0,0,0,.22)" stroke-width="4"');
        return m;
      })()));
      b.add(pth('M214 244 q 40 54 92 44 q 60 -12 90 26 q -40 34 -104 24 q -66 -10 -78 -94 Z', 'rgba(196,116,26,.55)'));
      b.add(rr(272, 168, 56, 34, 6, '#fff3cf'));
      b.add(rr(272, 168, 56, 12, 6, '#fffbee'));
      [[236, 292, '#5b3fa8'], [262, 314, '#7b4fd1'], [352, 296, '#c0335e'], [330, 320, '#e0526f']].forEach(p =>
        b.add(cir(p[0], p[1], 15, p[2]) + cir(p[0] - 5, p[1] - 6, 5, 'rgba(255,255,255,.45)')));
      b.add(leaf(370, 200, -30, .7, '#3f8f3a'));
      b.add(ell(300, 190, 60, 8, 'rgba(255,255,255,.35)'));
    } else if (style === 'omelette') {
      b.lg('om', [[0, '#ffe07a'], [.5, '#f5bb2a'], [1, '#d99306']], 0, 0, .5, 1);
      b.add(pth('M182 250 q 24 -76 122 -78 q 106 -2 118 76 q -8 70 -120 72 q -112 2 -120 -70 Z', b.u('om')));
      b.add(pth('M212 232 q 40 -46 96 -44 q 62 2 84 44 q -34 -22 -92 -20 q -56 2 -88 20 Z', 'rgba(255,255,255,.28)'));
      b.add(pth('M300 258 q 42 -6 70 12 q -34 22 -74 16 q -44 -6 -66 -20 q 30 -12 70 -8 Z', '#f7c95a'));
      /* cheese ooze */
      b.add(pth('M258 262 q 34 26 84 8 q -18 34 -56 30 q -34 -4 -28 -38 Z', '#ffcf5c'));
      [[240, 226], [340, 236], [286, 292]].forEach(p => b.add(grp('translate(' + p[0] + ' ' + p[1] + ') rotate(20)', ell(0, 0, 13, 5, '#d1332a'))));
      const r = rng('om');
      for (let i = 0; i < 14; i++) b.add(cir(210 + r() * 180, 200 + r() * 100, 2.4, '#2f6d2a'));
      b.add(grp('translate(392 296) rotate(18)', pth('M0 0 L 78 -14 L 66 34 Z', '#e2b877') + pth('M6 4 L 68 -8 L 60 26 Z', '#f6e2b8')));
    } else if (style === 'scramble') {
      b.add(grp('translate(300 268) rotate(-6)', pth('M-120 20 L -108 -34 L 116 -50 L 128 6 Z', '#d8a75c') +
        pth('M-112 12 L -102 -28 L 108 -42 L 118 -2 Z', '#f3dfb4')));
      const r = rng('scr');
      for (let i = 0; i < 18; i++) {
        const x = 214 + r() * 176, y = 196 + r() * 68;
        b.add(ell(x, y, 14 + r() * 10, 10 + r() * 7, i % 3 ? '#f2b52c' : '#ffd25c'));
      }
      b.add(ell(300, 214, 76, 26, 'rgba(255,236,170,.4)'));
      for (let i = 0; i < 16; i++) {
        const x = 220 + r() * 168, y = 190 + r() * 60;
        b.add(ln(x, y, x + 16, y - 4, '#e5a021', 2.4));
      }
      for (let i = 0; i < 10; i++) b.add(cir(228 + r() * 150, 196 + r() * 56, 2.6, '#2f6d2a'));
      b.add(lemonWedge(384, 300, 20, .7));
    } else if (style === 'pancake') {
      b.lg('pc', [[0, t.c[3]], [1, t.c[2]]], 0, 0, 0, 1);
      [[300, 292, 118], [300, 258, 112], [300, 226, 105], [300, 198, 96]].forEach((p, i) => {
        b.add(ell(p[0], p[1], p[2], p[2] * .32, t.c[1]));
        b.add(ell(p[0], p[1] - 6, p[2], p[2] * .32, b.u('pc')));
        b.add(ell(p[0], p[1] - 8, p[2] * .7, p[2] * .18, 'rgba(255,240,205,.35)'));
      });
      b.add(rr(276, 168, 50, 26, 5, '#fff6d8'));
      b.add(pth('M282 190 q 22 22 -2 40 q 40 -6 56 -34 q 22 30 44 12 q 6 44 -46 46 q -60 2 -52 -64 Z', 'rgba(180,100,18,.65)'));
      [[212, 268, '#3d2b8a'], [232, 300, '#5a3fb0'], [388, 262, '#a52347'], [368, 300, '#cf3f5e']].forEach(p =>
        b.add(cir(p[0], p[1], 14, p[2]) + cir(p[0] - 4, p[1] - 5, 4.5, 'rgba(255,255,255,.4)')));
      b.add(leaf(340, 158, -20, .6, '#3f8f3a'));
    } else { /* poha bowl */
      b.rg('bowl', [[0, CERAMIC[0]], [1, CERAMIC[2]]], .35, .3, .8);
      b.add(ell(300, 244, 150, 132, b.u('bowl')));
      b.add(ell(300, 248, 126, 108, '#e8dccb'));
      b.rg('poha', [[0, t.c[3]], [1, t.c[2]]], .38, .3, .8);
      b.add(ell(300, 248, 118, 100, b.u('poha')));
      const r = rng('poha');
      for (let i = 0; i < 34; i++) {
        const ang = r() * 6.283, rad = r() * 104;
        b.add(ell(300 + Math.cos(ang) * rad, 248 + Math.sin(ang) * rad * .84, 5 + r() * 4, 3 + r() * 2.4, r() > .7 ? '#fff3d2' : '#f6d98f',
          ' transform="rotate(' + (r() * 90) + ' ' + (300 + Math.cos(ang) * rad) + ' ' + (248 + Math.sin(ang) * rad * .84) + ')"'));
      }
      for (let i = 0; i < 22; i++) {
        const x = 226 + r() * 148, y = 190 + r() * 110;
        b.add('<path d="M' + x + ' ' + y + ' q 14 -6 28 2" stroke="#e9a72c" stroke-width="2.4" fill="none"/>');
      }
      for (let i = 0; i < 10; i++) b.add(cir(238 + r() * 124, 200 + r() * 96, 2.8, '#2f6d2a'));
      b.add(lemonWedge(414, 296, 24, .68));
      b.add(grp('translate(206 306) rotate(-24)', pth('M0 0 q 20 -8 44 4 q -22 12 -44 -4 Z', '#c8341f')));
    }
  }

  /* Stacked things — burger / sandwich / club / wrap ---------------------- */
  function stack(b, t, a) {
    const style = a.style || 'burger';
    shadowUnder(b, 300, 358, 172, 30, .6);

    if (style === 'burger') {
      b.lg('bun', [[0, '#f0bd6d'], [.45, '#dc9c40'], [1, '#a86a22']], 0, 0, .4, 1);
      b.add(ell(300, 344, 130, 22, '#b8792c'));
      b.add(pth('M170 344 q 0 -30 130 -30 q 130 0 130 30 Z', b.u('bun')));           /* bottom bun */
      b.add(pth('M176 314 q 26 -16 124 -16 q 98 0 124 16 q -24 12 -124 12 q -100 0 -124 -12 Z', '#3f8f3a'));  /* lettuce base */
      b.add(pth('M176 314 q 22 -26 56 -12 q 26 -22 60 -6 q 30 -20 62 0 q 30 -6 30 18 q -28 12 -104 12 q -76 0 -104 -12 Z', '#4fa63e'));
      [[236, 292], [300, 288], [364, 292]].forEach(p => { b.add(cir(p[0], p[1], 30, '#cf3120')); b.add(cir(p[0], p[1], 21, '#e8604a')); b.add(cir(p[0], p[1], 9, '#f9b6a4')); });
      b.lg('patty', [[0, t.c[2]], [.5, t.c[1]], [1, t.c[0]]], 0, 0, .3, 1);
      b.add(rr(176, 246, 248, 44, 22, b.u('patty')));
      b.add(pth('M182 252 q 40 -12 118 -10 q 78 2 118 12', 'none', ' stroke="rgba(255,255,255,.20)" stroke-width="5"'));
      /* cheese with drips */
      b.add(pth('M170 240 L 430 240 L 412 262 q -16 26 -34 2 q -18 30 -38 2 q -20 30 -40 0 q -20 28 -38 -2 q -18 22 -34 -4 Z', '#ffc244'));
      b.add(pth('M170 240 L 430 240 L 424 250 L 176 250 Z', '#ffd873'));
      b.add(pth('M176 240 q 22 -14 62 -12 q 34 -20 62 -4 q 30 -16 62 2 q 40 -2 62 14 Z', '#4fa63e'));
      b.add(pth('M164 232 q 0 -74 136 -74 q 136 0 136 74 Z', b.u('bun')));            /* top bun */
      b.add(pth('M186 200 q 24 -34 114 -34 q 90 0 114 34', 'none', ' stroke="rgba(255,255,255,.22)" stroke-width="8"'));
      [[236, 194, -14], [274, 178, 8], [316, 174, -6], [356, 190, 16], [300, 202, 0], [206, 214, -20], [392, 212, 18]].forEach(p =>
        b.add(ell(p[0], p[1], 10, 5.4, '#fff1cf', ' transform="rotate(' + p[2] + ' ' + p[0] + ' ' + p[1] + ')"')));
      /* skewer */
      b.add(grp('translate(300 118)', rr(-3, 0, 6, 60, 3, '#8a6234') + cir(0, -8, 13, '#4f7a2c') + cir(0, -8, 5, '#c33')));
    } else if (style === 'wrap') {
      b.lg('tort', [[0, '#f4dcae'], [.5, '#e2c283'], [1, '#b98f47']], 0, 0, .4, 1);
      [[218, 40], [382, -34]].forEach((p, i) => {
        b.add(grp('translate(' + p[0] + ' 250) rotate(' + p[1] + ')', (function () {
          let m = rr(-52, -110, 104, 220, 26, b.u('tort'));
          m += pth('M-52 -104 q 52 -26 104 0 L 52 -70 q -52 -26 -104 0 Z', '#fbeccb');
          /* cut face filling */
          m += ell(0, -110, 52, 18, '#e8cf9d');
          m += ell(0, -110, 40, 13, i ? t.c[2] : t.c[3]);
          m += ell(-12, -112, 12, 7, '#fff2d4');
          m += ell(14, -108, 10, 6, '#4fa63e');
          m += ell(2, -104, 9, 5, '#cf3120');
          m += pth('M-46 -40 q 46 18 92 0', 'none', ' stroke="rgba(0,0,0,.16)" stroke-width="4"');
          m += pth('M-44 10 q 44 18 88 0', 'none', ' stroke="rgba(0,0,0,.14)" stroke-width="4"');
          const r = rng('char' + i);
          for (let j = 0; j < 10; j++) m += ell(-40 + r() * 80, -80 + r() * 170, 7 + r() * 6, 4 + r() * 3, 'rgba(120,70,20,.35)');
          return m;
        })()));
      });
      /* parchment band */
      b.add(grp('translate(218 292) rotate(40)', rr(-56, -34, 112, 68, 6, 'rgba(250,246,236,.92)') + ln(-46, 0, 46, 0, 'rgba(0,0,0,.10)', 3)));
      b.add(leaf(300, 350, -14, .6, '#3f8f3a'));
    } else {
      /* sandwich / club: standing triangles */
      const decks = style === 'club' ? 3 : 2;
      const fill = [t.c[2], '#f7d774', '#4fa63e', '#cf3120'];
      [[214, -8, 1], [372, 8, .94]].forEach((pos, idx) => {
        b.add(grp('translate(' + pos[0] + ' 262) rotate(' + pos[1] + ') scale(' + pos[2] + ')', (function () {
          let m = '';
          const h = decks === 3 ? 46 : 40;
          for (let d = 0; d < decks; d++) {
            const y = 96 - d * (h + 26);
            m += pth('M-108 ' + y + ' L 108 ' + y + ' L 0 ' + (y - h * 2.1) + ' Z', '#f0d9a8');
            m += pth('M-96 ' + (y - 6) + ' L 96 ' + (y - 6) + ' L 0 ' + (y - h * 1.9) + ' Z', '#fdf1d4');
            /* filling stripe under each deck */
            m += pth('M-104 ' + (y + 2) + ' L 104 ' + (y + 2) + ' L 96 ' + (y + 16) + ' L -96 ' + (y + 16) + ' Z', fill[d % fill.length]);
            m += pth('M-100 ' + (y + 12) + ' q 50 12 100 0 q 50 -12 96 2 L 92 ' + (y + 24) + ' L -96 ' + (y + 24) + ' Z', fill[(d + 2) % fill.length]);
          }
          /* grill marks */
          const r = rng('grill' + idx);
          for (let j = 0; j < 6; j++) {
            const yy = 40 - j * 22;
            m += ln(-70 + r() * 20, yy, 70 - r() * 20, yy - 12, 'rgba(120,70,20,.35)', 5);
          }
          m += pth('M-108 96 L 108 96 L 0 -' + (decks === 3 ? 116 : 88) + ' Z', 'none', ' stroke="rgba(0,0,0,.12)" stroke-width="3"');
          return m;
        })()));
      });
      b.add(grp('translate(214 132) rotate(6)', rr(-3, 0, 6, 44, 3, '#8a6234') + cir(0, -6, 11, '#4f7a2c')));
      if (style === 'club') {
        b.add(grp('translate(468 328) rotate(-16)', pth('M0 0 q 30 -24 58 -4 q -6 30 -34 30 q -28 0 -24 -26 Z', '#f0c45a')));
      }
      b.add(grp('translate(120 336)', ell(0, 0, 44, 14, 'rgba(255,255,255,.35)') + ell(0, -2, 34, 10, '#e8f0d0')));
    }
  }

  /* Top-down wood-fired pizza with one slice pulled out ------------------- */
  function pizzaTop(b, t, a) {
    const tops = a.toppings || ['cheese'];
    shadowUnder(b, 300, 272, 190, 168, .5);

    b.lg('crust', [[0, '#f0c274'], [.5, '#d79d43'], [1, '#9c6520']], 0, 0, .4, 1);
    b.rg('sauce', [[0, t.c[3]], [.6, t.c[2]], [1, t.c[1]]], .38, .32, .8);
    b.rg('chz', [[0, '#fff6d8'], [.6, '#f7dd9e'], [1, '#e0b458']], .36, .3, .82);

    function toppingsOn(cx, cy, rad, seedKey) {
      const r = rng(seedKey);
      let m = '';
      const n = 14;
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * 6.283 + r() * .5, dist = rad * (.28 + r() * .62);
        const x = cx + Math.cos(ang) * dist, y = cy + Math.sin(ang) * dist * .94;
        const kind = tops[i % tops.length];
        if (kind === 'basil') m += leaf(x - 12, y, r() * 360, .52, '#33772c');
        else if (kind === 'cheese') m += ell(x, y, 16 + r() * 8, 11 + r() * 5, 'rgba(255,250,226,.88)');
        else if (kind === 'paneer') m += rr(x - 13, y - 11, 26, 22, 5, '#fff5e0') + rr(x - 13, y - 11, 26, 8, 4, 'rgba(228,150,60,.5)');
        else if (kind === 'onion') m += '<path d="M' + (x - 16) + ' ' + y + ' a 16 16 0 0 1 32 0" stroke="#c9b6dd" stroke-width="5" fill="none"/>';
        else if (kind === 'pepper') m += '<circle cx="' + x + '" cy="' + y + '" r="12" fill="none" stroke="#3f8f3a" stroke-width="6"/>';
        else if (kind === 'mushroom') m += pth('M' + (x - 14) + ' ' + y + ' a 14 11 0 0 1 28 0 Z', '#e6d3b4') + rr(x - 4, y, 8, 10, 3, '#d8c39e');
        else if (kind === 'olive') m += cir(x, y, 11, '#2c2436') + cir(x, y, 4.4, '#8b3b2f');
        else if (kind === 'corn') m += ell(x, y, 9, 7, '#f6c22c') + ell(x - 2, y - 2, 3.4, 2.6, '#fee596');
        else if (kind === 'jalapeno') m += '<circle cx="' + x + '" cy="' + y + '" r="11" fill="none" stroke="#4c9a34" stroke-width="6"/>' + cir(x, y, 3, '#dfe9b0');
        else if (kind === 'chilli') m += ln(x - 8, y - 5, x + 8, y + 5, '#c62f18', 4);
      }
      return m;
    }

    /* main pie, with a wedge removed */
    b.add(grp('', (function () {
      let m = '';
      m += pth('M300 272 L 300 92 A 180 180 0 1 1 173 218 Z', b.u('crust'));
      m += pth('M300 272 L 300 128 A 144 144 0 1 1 199 233 Z', b.u('sauce'));
      m += pth('M300 272 L 300 136 A 136 136 0 1 1 205 236 Z', b.u('chz'));
      const r = rng('leopard' + a.tone);
      for (let i = 0; i < 16; i++) {
        const ang = 1.2 + r() * 5.2, x = 300 + Math.cos(ang) * (162 + r() * 12), y = 272 + Math.sin(ang) * (162 + r() * 12);
        m += ell(x, y, 8 + r() * 7, 6 + r() * 5, 'rgba(70,36,10,.45)', ' transform="rotate(' + (r() * 180) + ' ' + x + ' ' + y + ')"');
      }
      m += toppingsOn(300, 272, 128, 'pie' + a.tone);
      /* slice cuts */
      for (let i = 1; i < 7; i++) {
        const ang = -1.5708 + i * (5.2 / 7);
        m += ln(300, 272, 300 + Math.cos(ang) * 172, 272 + Math.sin(ang) * 172, 'rgba(90,50,16,.22)', 3);
      }
      return m;
    })()));

    /* pulled slice */
    b.add(grp('translate(52 -30) rotate(-6 300 272)', (function () {
      let m = pth('M300 272 L 300 92 A 180 180 0 0 1 427 218 Z', b.u('crust'));
      m += pth('M300 272 L 300 128 A 144 144 0 0 1 401 233 Z', b.u('sauce'));
      m += pth('M300 272 L 300 136 A 136 136 0 0 1 396 236 Z', b.u('chz'));
      m += toppingsOn(340, 202, 66, 'slice' + a.tone);
      m += pth('M300 92 A 180 180 0 0 1 427 218', 'none', ' stroke="rgba(90,50,16,.35)" stroke-width="4"');
      return m;
    })()));
    /* cheese stretch */
    b.add('<path d="M318 176 q 26 26 8 58 M336 188 q 24 22 4 52" stroke="rgba(255,246,214,.8)" stroke-width="7" fill="none" stroke-linecap="round"/>');
    b.add(ell(300, 272, 8, 8, 'rgba(0,0,0,.10)'));
  }

  /* Pasta in a wide bowl -------------------------------------------------- */
  function pastaBowl(b, t, a) {
    shadowUnder(b, 300, 292, 196, 148, .55);
    b.rg('pb', [[0, CERAMIC[0]], [.7, CERAMIC[1]], [1, CERAMIC[3]]], .34, .28, .82);
    b.add(ell(300, 250, 194, 158, b.u('pb')));
    b.add(ell(300, 250, 194, 158, 'none', ' stroke="rgba(0,0,0,.16)" stroke-width="2"'));
    b.add(ell(300, 254, 156, 124, 'rgba(0,0,0,.10)'));

    const sauceCol = a.sauce === 'white' ? ['#fff4dd', '#efdcb6', '#d6bd8e']
      : a.sauce === 'pink' ? ['#f6b9a2', '#e28a6c', '#c26244']
        : [t.c[3], t.c[2], t.c[1]];
    b.rg('ps', [[0, sauceCol[0]], [.6, sauceCol[1]], [1, sauceCol[2]]], .38, .32, .8);
    b.add(ell(300, 254, 150, 118, b.u('ps')));

    if (a.baked) {
      b.rg('bake', [[0, '#ffe7a8'], [.7, '#e9bd5f'], [1, '#c48f30']], .36, .3, .8);
      b.add(ell(300, 250, 142, 110, b.u('bake')));
      const r = rng('bake');
      for (let i = 0; i < 18; i++) {
        const ang = r() * 6.283, rad = r() * 122;
        b.add(ell(300 + Math.cos(ang) * rad, 250 + Math.sin(ang) * rad * .78, 7 + r() * 8, 5 + r() * 6, 'rgba(110,58,14,.42)'));
      }
      b.add(ell(300, 236, 90, 44, 'rgba(255,255,255,.14)'));
    } else {
      /* strands / penne */
      const r = rng('pasta' + a.tone);
      const noodle = a.sauce === 'red' ? '#f6e3b8' : '#fbeed0';
      for (let i = 0; i < 9; i++) {
        const x0 = 200 + r() * 60, y0 = 210 + r() * 80;
        b.add('<path d="M' + x0 + ' ' + y0 + ' C ' + (x0 + 70) + ' ' + (y0 - 60) + ', ' + (x0 + 140) + ' ' + (y0 + 70) + ', ' + (x0 + 190) + ' ' + (y0 - 10) + '" ' +
          'stroke="' + noodle + '" stroke-width="' + (11 + r() * 4) + '" fill="none" stroke-linecap="round" opacity="' + (.82 + r() * .18) + '"/>');
      }
      for (let i = 0; i < 7; i++) {
        const x = 214 + r() * 172, y = 202 + r() * 104, rot = r() * 180;
        b.add(grp('translate(' + x + ' ' + y + ') rotate(' + rot + ')',
          rr(-24, -13, 48, 26, 12, noodle) + ell(-24, 0, 6, 13, 'rgba(180,140,90,.4)') + ell(24, 0, 6, 13, 'rgba(180,140,90,.4)')));
      }
      b.add(ell(300, 250, 132, 100, 'none', ' stroke="rgba(255,255,255,.10)" stroke-width="14"'));
    }

    /* garnish */
    b.add(leaf(268, 200, -18, .82, '#33772c'));
    b.add(leaf(330, 300, 160, .66, '#3f8f3a'));
    const r2 = rng('parm');
    for (let i = 0; i < 9; i++) {
      const x = 220 + r2() * 160, y = 196 + r2() * 116;
      b.add(pth('M' + x + ' ' + y + ' l 16 -4 l 4 12 l -16 4 Z', 'rgba(255,250,232,.92)', ' transform="rotate(' + (r2() * 90) + ' ' + x + ' ' + y + ')"'));
    }
    for (let i = 0; i < 12; i++) b.add(cir(226 + r2() * 150, 200 + r2() * 106, 2, 'rgba(40,26,14,.7)'));
    if (a.sauce === 'red') for (let i = 0; i < 6; i++) b.add(ln(230 + r2() * 140, 210 + r2() * 90, 244 + r2() * 140, 214 + r2() * 90, '#c62f18', 3));
  }

  /* Slate board with tandoori skewers, or a cast-iron sizzler ------------- */
  function skewerSlate(b, t, a) {
    const sizzler = a.style === 'sizzler';
    shadowUnder(b, 300, 372, 220, 32, .6);

    if (sizzler) {
      b.add(grp('translate(300 300)', rr(-250, -18, 500, 62, 12, '#7a4a26') + rr(-250, -18, 500, 14, 8, '#96603a')));
    }

    b.lg('slate', [[0, '#4d5257'], [.5, '#282c30'], [1, '#14171a']], 0, 0, .3, 1);
    if (sizzler) {
      b.add(ell(300, 250, 214, 132, '#1b1e21'));
      b.add(ell(300, 244, 208, 126, b.u('slate')));
      b.add(ell(300, 244, 208, 126, 'none', ' stroke="rgba(255,255,255,.16)" stroke-width="4"'));
      /* rice bed */
      b.rg('mx', [[0, '#ffd98a'], [1, '#d99a3a']], .4, .34, .8);
      b.add(ell(272, 246, 122, 76, b.u('mx')));
      const r = rng('mex');
      for (let i = 0; i < 40; i++) {
        const ang = r() * 6.283, rad = r() * 112;
        b.add(ell(272 + Math.cos(ang) * rad, 246 + Math.sin(ang) * rad * .6, 5 + r() * 3, 2.6, r() > .6 ? '#fff3d0' : '#f0b23c'));
      }
      for (let i = 0; i < 12; i++) b.add(rr(200 + r() * 150, 208 + r() * 74, 10, 7, 3, i % 2 ? '#7a3a22' : '#3f8f3a'));
      b.add(ell(272, 226, 84, 30, 'rgba(255,250,220,.32)'));
      /* beans + veg */
      b.add(ell(408, 260, 62, 40, '#4a2416'));
      for (let i = 0; i < 10; i++) b.add(ell(378 + r() * 60, 244 + r() * 32, 9, 6, '#6b3520'));
      b.add(pth('M340 200 q 34 -18 66 4 q -28 24 -66 -4 Z', '#c9342a'));
      b.add(leaf(196, 200, -22, .62, '#3f8f3a'));
    } else {
      b.add(rr(56, 116, 488, 244, 22, '#0f1214'));
      b.add(rr(62, 110, 476, 240, 20, b.u('slate')));
      const r0 = rng('slatechips');
      for (let i = 0; i < 20; i++) b.add(cir(80 + r0() * 440, 130 + r0() * 200, 1 + r0() * 2.4, 'rgba(255,255,255,.12)'));

      const cubeCol = a.style === 'malai' ? ['#fff6e2', '#f0dcb4', '#d3b884'] : [t.c[3], t.c[2], t.c[1]];
      b.lg('cube', [[0, cubeCol[0]], [.55, cubeCol[1]], [1, cubeCol[2]]], 0, 0, .4, 1);

      [[168, -12], [300, 4], [432, -8]].forEach((sk, si) => {
        b.add(grp('translate(' + sk[0] + ' 236) rotate(' + sk[1] + ')', (function () {
          let m = rr(-9, -150, 18, 300, 9, '#b9c2c9') + rr(-4, -150, 5, 300, 3, '#eef3f6');
          const r = rng('sk' + si);
          for (let i = 0; i < 4; i++) {
            const y = -108 + i * 70;
            m += rr(-46, y, 92, 60, 16, b.u('cube'));
            m += rr(-46, y, 92, 18, 12, 'rgba(255,255,255,.22)');
            for (let j = 0; j < 4; j++) m += ell(-34 + r() * 68, y + 10 + r() * 40, 8 + r() * 6, 5 + r() * 4, 'rgba(60,24,8,.42)');
            if (i < 3) m += rr(-30, y + 60, 60, 12, 6, i % 2 ? '#c9b6dd' : '#4fa63e');
          }
          return m;
        })()));
      });

      /* chutney, onion, lemon */
      b.add(ell(112, 328, 46, 22, '#cdd6db'));
      b.add(ell(112, 324, 38, 17, a.style === 'malai' ? '#f6e2a8' : '#3f8f3a'));
      b.add(ell(112, 322, 20, 8, 'rgba(255,255,255,.25)'));
      [[478, 318, 0], [500, 336, 20]].forEach(p => b.add('<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="30" ry="12" fill="none" stroke="#d9c7e8" stroke-width="6" transform="rotate(' + p[2] + ' ' + p[0] + ' ' + p[1] + ')"/>'));
      b.add(lemonWedge(196, 320, 18, .7));
      b.add(leaf(392, 322, -24, .6, '#3f8f3a'));
    }

    if (a.sizzle) {
      b.rg('hot', [[0, t.a, .35], [1, t.a, 0]], .5, .6, .55);
      b.add('<rect width="600" height="440" fill="' + b.u('hot') + '"/>');
      b.add(grp('translate(200 150)', steamPuff(0, 0, 1.2, .1, .34)));
      b.add(grp('translate(300 128)', steamPuff(0, 0, 1.5, .9, .28)));
      b.add(grp('translate(410 152)', steamPuff(0, 0, 1.1, 1.7, .3)));
    }
  }

  /* Copper/ceramic bowl of gravy ----------------------------------------- */
  function curryBowl(b, t, a) {
    shadowUnder(b, 300, 300, 190, 142, .55);
    b.rg('cb', [[0, CERAMIC[0]], [.66, CERAMIC[1]], [1, CERAMIC[3]]], .32, .26, .84);
    b.add(ell(300, 252, 182, 150, b.u('cb')));
    b.add(ell(300, 252, 182, 150, 'none', ' stroke="rgba(0,0,0,.16)" stroke-width="2.5"'));
    b.add(ell(300, 256, 148, 118, 'rgba(0,0,0,.12)'));
    b.rg('cur', [[0, t.c[3]], [.5, t.c[2]], [1, t.c[1]]], .38, .3, .82);
    b.add(ell(300, 256, 142, 112, b.u('cur')));
    b.add(ell(300, 240, 96, 52, 'rgba(255,255,255,.10)'));

    const r = rng('curry' + a.tone);
    const ch = a.chunks || 'cubes';
    if (ch === 'cubes') {
      for (let i = 0; i < 6; i++) {
        const ang = r() * 6.283, rad = 24 + r() * 88;
        const x = 300 + Math.cos(ang) * rad, y = 256 + Math.sin(ang) * rad * .72;
        b.add(grp('translate(' + x + ' ' + y + ') rotate(' + (r() * 60 - 30) + ')',
          rr(-24, -20, 48, 40, 7, '#fff6e4') + rr(-24, -20, 48, 12, 6, '#fffdf6') + rr(-18, 6, 36, 8, 4, 'rgba(220,160,80,.35)')));
      }
    } else if (ch === 'balls') {
      for (let i = 0; i < 4; i++) {
        const ang = r() * 6.283, rad = 26 + r() * 76;
        const x = 300 + Math.cos(ang) * rad, y = 256 + Math.sin(ang) * rad * .7;
        b.add(cir(x, y, 27, '#f3ddb8') + cir(x - 8, y - 9, 9, 'rgba(255,255,255,.5)') + ell(x, y + 20, 24, 8, 'rgba(90,50,20,.2)'));
      }
    } else if (ch === 'nuts') {
      for (let i = 0; i < 8; i++) {
        const ang = r() * 6.283, rad = 20 + r() * 92;
        const x = 300 + Math.cos(ang) * rad, y = 256 + Math.sin(ang) * rad * .72;
        b.add(pth('M0 0 q 16 -18 30 -4 q -6 20 -30 4 Z', '#f7e6bf', ' transform="translate(' + x + ' ' + y + ') rotate(' + (r() * 360) + ')"'));
      }
    } else if (ch === 'peppers') {
      for (let i = 0; i < 8; i++) {
        const ang = r() * 6.283, rad = 22 + r() * 92;
        const x = 300 + Math.cos(ang) * rad, y = 256 + Math.sin(ang) * rad * .72;
        b.add(pth('M0 -6 q 20 -12 40 2 q -20 14 -40 -2 Z', i % 2 ? '#3f8f3a' : '#d33a22', ' transform="translate(' + x + ' ' + y + ') rotate(' + (r() * 360) + ')"'));
      }
      for (let i = 0; i < 5; i++) {
        const x = 240 + r() * 120, y = 210 + r() * 90;
        b.add(rr(x, y, 36, 12, 6, '#f0e2f2'));
      }
    } else if (ch === 'sev') {
      b.add(ell(300, 240, 116, 66, 'rgba(255,215,140,.55)'));
      for (let i = 0; i < 46; i++) {
        const x = 200 + r() * 200, y = 200 + r() * 106;
        b.add('<path d="M' + x + ' ' + y + ' q 16 -5 32 2" stroke="#f3bf4a" stroke-width="2.6" fill="none" stroke-linecap="round"/>');
      }
    }

    if (a.cream) {
      b.add('<path d="M300 256 m 0 -8 a 8 8 0 1 1 -0.1 0 m 8 8 a 26 26 0 1 1 -52 0 a 48 48 0 1 1 96 0 a 70 70 0 1 1 -140 0" ' +
        'fill="none" stroke="rgba(255,251,240,.85)" stroke-width="8" stroke-linecap="round"/>');
      b.add(rr(280, 196, 40, 26, 6, '#fffbe8'));
    }
    for (let i = 0; i < 6; i++) {
      const x = 226 + r() * 150, y = 208 + r() * 90;
      b.add(cir(x, y, 3 + r() * 4, 'rgba(255,190,90,.55)'));
    }
    b.add(leaf(258, 206, -16, .62, '#3f8f3a'));
    b.add(leaf(346, 296, 168, .52, '#33772c'));
    b.add(grp('translate(300 214)', steamPuff(-30, 0, .7, .3, .22) + steamPuff(24, 6, .6, 1.1, .18)));

    /* spoon resting on the rim */
    b.lg('sp', [[0, '#f4f6f8'], [.5, '#c3cbd2'], [1, '#8f9aa3']], 0, 0, 1, 1);
    b.add(grp('translate(470 322) rotate(-28)', rr(0, 0, 92, 11, 5, b.u('sp')) + ell(-16, 5, 22, 14, b.u('sp')) + ell(-16, 3, 15, 9, 'rgba(0,0,0,.14)')));
  }

  /* Bread — naan / paratha / roti in a cloth-lined basket ----------------- */
  function breadBasket(b, t, a) {
    const style = a.style || 'naan';
    shadowUnder(b, 300, 336, 200, 44, .6);

    /* woven basket */
    b.lg('bask', [[0, '#c99457'], [1, '#7a4c22']], 0, 0, 0, 1);
    b.add(ell(300, 300, 208, 88, b.u('bask')));
    for (let i = 0; i < 14; i++) {
      const x = 100 + i * 29;
      b.add('<path d="M' + x + ' 262 q 8 40 0 76" stroke="rgba(0,0,0,.22)" stroke-width="4" fill="none"/>');
    }
    b.add(ell(300, 276, 198, 78, '#8d5c2a'));
    b.add(pth('M118 268 q 60 -34 182 -34 q 122 0 182 34 q -50 26 -182 26 q -132 0 -182 -26 Z', '#f4ece0'));
    b.add(pth('M150 260 q 46 12 88 -6 q 44 20 86 -2 q 34 16 60 4', 'none', ' stroke="rgba(0,0,0,.10)" stroke-width="5"'));

    b.lg('dough', [[0, '#fbe6bb'], [.42, '#f0cd86'], [1, '#c08f3c']], 0, 0, .4, 1);
    const spots = (cx, cy, w, h, key, n) => {
      const r = rng(key); let m = '';
      for (let i = 0; i < (n || 16); i++) {
        const x = cx - w / 2 + r() * w, y = cy - h / 2 + r() * h;
        m += ell(x, y, 5 + r() * 9, 3.6 + r() * 6, 'rgba(96,52,12,' + (.22 + r() * .35) + ')', ' transform="rotate(' + (r() * 180) + ' ' + x + ' ' + y + ')"');
      }
      return m;
    };

    if (style === 'naan') {
      b.add(grp('translate(292 214) rotate(-8)', (function () {
        let m = pth('M-140 26 C -150 -34 -86 -74 -6 -76 C 78 -78 148 -40 146 6 C 144 52 74 82 -8 80 C -80 78 -132 66 -140 26 Z', b.u('dough'));
        m += pth('M-120 12 C -122 -24 -70 -54 -6 -56 C 60 -58 118 -30 118 2', 'none', ' stroke="rgba(255,255,255,.35)" stroke-width="6"');
        m += spots(0, 4, 260, 130, 'naan', 22);
        m += ell(-20, -22, 70, 26, 'rgba(255,232,180,.45)');
        return m;
      })()));
      /* butter sheen + brush */
      b.add(ell(276, 202, 96, 34, 'rgba(255,214,120,.30)'));
      if (a.cheese) {
        b.add(pth('M320 200 q 30 20 8 52 M348 194 q 26 24 4 56 M292 206 q 26 22 6 52', 'none', ' stroke="rgba(255,246,214,.92)" stroke-width="9" stroke-linecap="round"'));
        b.add(pth('M282 178 q 60 -26 104 6 q -46 34 -104 -6 Z', '#ffeec4'));
      }
      b.add(rr(268, 168, 34, 22, 5, '#fff6d8'));
    } else if (style === 'paratha') {
      b.add(grp('translate(300 208)', (function () {
        let m = ell(0, 0, 148, 104, b.u('dough'));
        for (let i = 1; i <= 5; i++) {
          m += '<ellipse cx="0" cy="0" rx="' + (148 - i * 24) + '" ry="' + (104 - i * 17) + '" fill="none" stroke="rgba(140,86,26,.35)" stroke-width="4"/>';
        }
        m += '<path d="M-148 0 a 148 104 0 0 1 296 0" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="6"/>';
        m += spots(0, 0, 280, 180, 'para', 18);
        m += ell(-30, -34, 62, 24, 'rgba(255,236,190,.5)');
        return m;
      })()));
      b.add(ell(300, 178, 40, 16, 'rgba(255,214,120,.45)'));
    } else {
      b.add(grp('translate(300 210) rotate(6)', (function () {
        let m = ell(0, 0, 142, 100, '#e5c58b');
        m += ell(0, -4, 138, 96, b.u('dough'));
        m += spots(0, 0, 260, 170, 'roti', 26);
        m += ell(-24, -30, 66, 26, 'rgba(255,240,206,.45)');
        m += '<ellipse cx="0" cy="0" rx="138" ry="96" fill="none" stroke="rgba(90,48,10,.35)" stroke-width="4"/>';
        return m;
      })()));
      b.add(rr(280, 172, 30, 20, 5, '#fff6d8'));
    }
    b.add(grp('translate(300 174)', steamPuff(-40, 0, .6, .4, .18) + steamPuff(40, 4, .55, 1.2, .16)));
  }

  /* Biryani / jeera rice ------------------------------------------------- */
  function riceMound(b, t, a) {
    const biryani = (a.style || 'biryani') === 'biryani';
    shadowUnder(b, 300, 320, 200, 118, .55);

    if (biryani) {
      b.lg('cop', [[0, '#e8a55f'], [.45, '#b76a28'], [1, '#7a3f13']], 0, 0, .3, 1);
      b.add(ell(300, 272, 196, 130, b.u('cop')));
      b.add(ell(300, 272, 196, 130, 'none', ' stroke="rgba(255,220,170,.5)" stroke-width="4"'));
      b.add(ell(300, 276, 164, 104, '#5d3313'));
    } else {
      b.rg('rp', [[0, CERAMIC[0]], [.7, CERAMIC[1]], [1, CERAMIC[3]]], .34, .28, .82);
      b.add(ell(300, 268, 192, 136, b.u('rp')));
      b.add(ell(300, 268, 192, 136, 'none', ' stroke="rgba(0,0,0,.15)" stroke-width="2"'));
      b.add(ell(300, 272, 158, 106, 'rgba(0,0,0,.07)'));
    }

    b.rg('rice', [[0, '#fffaee'], [.6, '#f3e4c4'], [1, '#d9c191']], .38, .28, .84);
    b.add(pth('M148 300 C 158 206 226 158 300 158 C 376 158 442 206 452 300 C 400 328 200 328 148 300 Z', b.u('rice')));

    const r = rng('rice' + a.style);
    for (let i = 0; i < 54; i++) {
      const x = 160 + r() * 280, y = 176 + r() * 118;
      const col = biryani ? (r() > .62 ? '#f7c24a' : (r() > .35 ? '#fffaee' : '#e8d3a4')) : (r() > .8 ? '#e8d3a4' : '#fffaee');
      b.add(ell(x, y, 8 + r() * 5, 3.2 + r() * 1.6, col, ' transform="rotate(' + (r() * 180 - 90) + ' ' + x + ' ' + y + ')"'));
    }
    if (biryani) {
      for (let i = 0; i < 6; i++) {
        const x = 196 + r() * 210, y = 182 + r() * 96;
        b.add('<path d="M' + x + ' ' + y + ' q 12 10 26 4" stroke="#e0641c" stroke-width="3.2" fill="none" stroke-linecap="round"/>');
      }
      for (let i = 0; i < 5; i++) {
        const x = 210 + r() * 190, y = 190 + r() * 92;
        b.add(pth('M0 0 q 16 -18 30 -4 q -6 20 -30 4 Z', '#f0dcae', ' transform="translate(' + x + ' ' + y + ') rotate(' + (r() * 360) + ')"'));
      }
      for (let i = 0; i < 8; i++) {
        const x = 200 + r() * 200, y = 196 + r() * 90;
        b.add('<path d="M' + x + ' ' + y + ' q 20 -8 40 2" stroke="#a4531c" stroke-width="4" fill="none" stroke-linecap="round"/>');
      }
      b.add(grp('translate(392 214) rotate(24)', pth('M0 0 q 34 -16 66 2 q -32 20 -66 -2 Z', '#4f7a2c')));
      [[248, 196], [352, 240]].forEach(p => b.add(grp('translate(' + p[0] + ' ' + p[1] + ')', cir(0, 0, 6, '#4a2a14') + ln(0, 0, 0, -10, '#4a2a14', 3))));
      b.add(leaf(226, 236, -20, .58, '#3f8f3a'));
      /* raita katori */
      b.add(ell(486, 316, 62, 34, '#dfe6ea'));
      b.add(ell(486, 312, 52, 27, '#fbfaf3'));
      const r2 = rng('raita');
      for (let i = 0; i < 8; i++) b.add(cir(462 + r2() * 48, 300 + r2() * 22, 3.2, '#e9b83c'));
      b.add(leaf(470, 300, -30, .34, '#3f8f3a'));
    } else {
      for (let i = 0; i < 26; i++) b.add(cir(180 + r() * 240, 180 + r() * 112, 2.4, '#4c3113'));
      for (let i = 0; i < 7; i++) {
        const x = 200 + r() * 200, y = 190 + r() * 96;
        b.add('<path d="M' + x + ' ' + y + ' q 20 -8 40 2" stroke="#b96c22" stroke-width="4" fill="none" stroke-linecap="round"/>');
      }
      b.add(leaf(340, 196, -24, .6, '#3f8f3a'));
    }
    b.add(grp('translate(300 150)', steamPuff(-46, 0, .7, .2, .2) + steamPuff(46, 6, .62, 1.0, .18)));
  }

  /* Dessert — lava cake / tiramisu jar / cheesecake slice ---------------- */
  function dessertPlate(b, t, a) {
    const style = a.style || 'slice';
    shadowUnder(b, 300, 320, 186, 96, .55);

    if (style !== 'jar') {
      b.rg('dp', [[0, CERAMIC[0]], [.68, CERAMIC[1]], [1, CERAMIC[3]]], .34, .28, .82);
      b.add(ell(300, 280, 190, 108, b.u('dp')));
      b.add(ell(300, 280, 190, 108, 'none', ' stroke="rgba(0,0,0,.15)" stroke-width="2"'));
    }

    if (style === 'lava') {
      /* molten flood */
      b.add(pth('M170 292 q 40 44 130 42 q 96 -2 132 -40 q 8 40 -60 54 q -96 20 -160 -6 q -50 -20 -42 -50 Z', '#3a1b0d'));
      b.lg('cake', [[0, '#6b3a20'], [.5, '#3f1f10'], [1, '#22100a']], 0, 0, .4, 1);
      b.add(ell(268, 272, 96, 34, '#2a1409'));
      b.add(rr(172, 194, 192, 82, 16, b.u('cake')));
      b.add(ell(268, 194, 96, 34, '#4c2513'));
      /* cracked centre with lava */
      b.add(pth('M226 190 q 42 -22 84 -2 q -12 34 -44 34 q -34 0 -40 -32 Z', '#8a4a1c'));
      b.add(pth('M240 196 q 30 -12 58 0 q -8 22 -30 22 q -24 0 -28 -22 Z', '#c9711f'));
      b.add(pth('M300 214 q 26 34 -8 62 q -36 30 6 46 q 60 -26 62 -60 q 2 -34 -60 -48 Z', '#a0561a'));
      b.add(ell(268, 292, 88, 22, 'rgba(0,0,0,.25)'));
      /* scoop */
      b.add(cir(414, 250, 52, '#fdf4e2'));
      b.add(cir(400, 234, 20, 'rgba(255,255,255,.55)'));
      b.add(ell(414, 296, 50, 14, 'rgba(120,90,60,.2)'));
      b.add(grp('translate(414 194) rotate(-14)', rr(-8, -46, 16, 52, 4, '#e2b877') + ln(-4, -40, -4, -6, 'rgba(0,0,0,.15)', 2)));
      b.add(leaf(360, 214, -30, .6, '#3f8f3a'));
      const r = rng('dust');
      for (let i = 0; i < 22; i++) b.add(cir(190 + r() * 220, 320 + r() * 40, 1.6 + r() * 1.6, 'rgba(255,255,255,.45)'));
    } else if (style === 'jar') {
      shadowUnder(b, 300, 366, 120, 24, .55);
      const jg = 'M226 128 L 226 336 q 0 22 74 22 q 74 0 74 -22 L 374 128 Z';
      b.clip('jc', '<path d="' + jg + '"/>');
      b.add(pth(jg, 'rgba(255,255,255,.10)'));
      b.add('<g clip-path="' + b.u('jc') + '">');
      const layers = [[300, 358, '#f6ead2'], [268, 302, '#6b452a'], [228, 270, '#fbf3e2'], [190, 230, '#5c3a22'], [150, 192, '#fdf7ea']];
      layers.forEach(l => b.add('<rect x="214" y="' + l[0] + '" width="176" height="' + (l[1] - l[0]) + '" fill="' + l[2] + '"/>'));
      layers.forEach(l => b.add(ell(300, l[0], 76, 9, 'rgba(255,255,255,.14)')));
      b.add(rr(240, 132, 12, 214, 6, 'rgba(255,255,255,.20)'));
      b.add('</g>');
      b.add(ell(300, 150, 74, 20, '#fffaf0'));
      const r = rng('cocoa');
      for (let i = 0; i < 34; i++) b.add(cir(236 + r() * 128, 140 + r() * 18, 1.4 + r() * 2, 'rgba(72,40,20,.7)'));
      b.add(pth(jg, 'none', ' stroke="rgba(255,255,255,.45)" stroke-width="3.5"'));
      b.add(rr(218, 112, 164, 24, 7, 'rgba(226,214,196,.9)'));
      b.add(ln(222, 124, 378, 124, 'rgba(0,0,0,.16)', 3));
      b.lg('spn', [[0, '#f4f6f8'], [.5, '#c3cbd2'], [1, '#8f9aa3']], 0, 0, 1, 1);
      b.add(grp('translate(410 300) rotate(-70)', rr(0, 0, 96, 11, 5, b.u('spn')) + ell(-16, 5, 22, 14, b.u('spn'))));
      b.add(cir(300, 138, 9, '#7a2e3c'));
    } else {
      /* cheesecake wedge */
      b.add(grp('translate(300 258) rotate(-6)', (function () {
        let m = pth('M-130 60 L 118 60 L 96 96 L -108 96 Z', '#b9832f');      /* biscuit base */
        m += pth('M-130 60 L 118 60 L 118 -46 q -124 -28 -248 0 Z', '#fdf3dd'); /* body */
        m += pth('M-130 -6 L 118 -6 L 118 -46 q -124 -28 -248 0 Z', '#fff9ec');
        m += pth('M-130 -46 q 124 -28 248 0 q -8 26 -124 26 q -116 0 -124 -26 Z', t.c[3]); /* compote */
        m += pth('M-118 -44 q 40 22 108 12 q 62 -8 118 8 q -10 24 -114 24 q -104 0 -112 -44 Z', t.c[2]);
        m += pth('M-130 60 L 118 60', 'none', ' stroke="rgba(0,0,0,.10)" stroke-width="3"');
        for (let i = 0; i < 5; i++) m += cir(-90 + i * 48, -54 - (i % 2) * 8, 12, t.c[1]) + cir(-94 + i * 48, -58 - (i % 2) * 8, 4, 'rgba(255,255,255,.45)');
        return m;
      })()));
      b.add(pth('M180 320 q 60 26 130 22 q 74 -4 118 -26 q -6 26 -60 34 q -84 12 -140 0 q -50 -10 -48 -30 Z', t.c[2]));
      b.add(leaf(384, 226, -34, .62, '#3f8f3a'));
      const r = rng('sugar');
      for (let i = 0; i < 20; i++) b.add(cir(196 + r() * 210, 190 + r() * 40, 1.5 + r() * 1.4, 'rgba(255,255,255,.6)'));
    }
  }

  /* Sundae / gulab jamun / sizzling brownie ------------------------------ */
  function sundae(b, t, a) {
    const style = a.style || 'default';
    shadowUnder(b, 300, 356, 176, 36, .6);

    if (style === 'jamun') {
      b.rg('jb', [[0, CERAMIC[0]], [.7, CERAMIC[1]], [1, CERAMIC[3]]], .34, .28, .82);
      b.add(ell(300, 264, 186, 128, b.u('jb')));
      b.add(ell(300, 264, 186, 128, 'none', ' stroke="rgba(0,0,0,.15)" stroke-width="2"'));
      b.rg('rab', [[0, '#fffbee'], [.6, '#f7ead0'], [1, '#e2cf9f']], .38, .3, .82);
      b.add(ell(300, 268, 152, 100, b.u('rab')));
      b.lg('jam', [[0, '#8d4a1c'], [.5, '#5e2c0e'], [1, '#33170a']], 0, 0, .4, 1);
      [[240, 254], [330, 232], [312, 296]].forEach(p => {
        b.add(ell(p[0], p[1] + 22, 46, 14, 'rgba(120,70,26,.28)'));
        b.add(cir(p[0], p[1], 46, b.u('jam')));
        b.add(ell(p[0] - 14, p[1] - 18, 18, 11, 'rgba(255,220,170,.5)'));
      });
      const r = rng('jamun');
      for (let i = 0; i < 7; i++) {
        const x = 200 + r() * 200, y = 210 + r() * 110;
        b.add('<path d="M' + x + ' ' + y + ' q 12 8 26 3" stroke="#e0641c" stroke-width="3" fill="none" stroke-linecap="round"/>');
      }
      for (let i = 0; i < 14; i++) b.add(ell(210 + r() * 180, 212 + r() * 108, 6, 3.4, '#8fbe58', ' transform="rotate(' + (r() * 180) + ' ' + (210 + r() * 180) + ' ' + (212 + r() * 108) + ')"'));
      b.add(pth('M400 208 q 26 -18 44 4 q -20 24 -44 -4 Z', '#d9557f'));
      b.add(grp('translate(300 196)', steamPuff(-34, 0, .62, .3, .22) + steamPuff(30, 4, .55, 1.1, .18)));
    } else if (style === 'sizzler') {
      b.add(grp('translate(300 308)', rr(-244, -14, 488, 58, 12, '#7a4a26') + rr(-244, -14, 488, 13, 8, '#96603a')));
      b.lg('cast', [[0, '#4d5257'], [.5, '#25292d'], [1, '#12161a']], 0, 0, .3, 1);
      b.add(ell(300, 254, 206, 116, '#15181b'));
      b.add(ell(300, 248, 200, 110, b.u('cast')));
      b.add(ell(300, 248, 200, 110, 'none', ' stroke="rgba(255,255,255,.14)" stroke-width="4"'));
      b.lg('brn', [[0, '#6b3a20'], [.5, '#3f1f10'], [1, '#20100a']], 0, 0, .4, 1);
      b.add(rr(174, 196, 172, 92, 12, '#1d0e07'));
      b.add(rr(170, 190, 172, 92, 12, b.u('brn')));
      b.add(rr(170, 190, 172, 22, 10, 'rgba(255,225,190,.14)'));
      const r = rng('walnut');
      for (let i = 0; i < 8; i++) b.add(pth('M0 0 q 14 -14 26 -2 q -6 16 -26 2 Z', '#c79a5c', ' transform="translate(' + (186 + r() * 138) + ' ' + (204 + r() * 66) + ') rotate(' + (r() * 360) + ')"'));
      b.add(cir(392, 224, 50, '#fdf4e2'));
      b.add(cir(378, 208, 19, 'rgba(255,255,255,.55)'));
      b.add(pth('M356 182 q 30 -22 66 -4 q 34 18 24 52 q -26 -30 -50 -28 q -28 2 -40 -20 Z', '#3d1d0c'));
      b.add(pth('M300 178 q 44 20 92 6 q 48 -14 88 12 q -40 30 -96 20 q -58 -10 -84 -38 Z', '#5a2a10'));
      b.add(grp('translate(220 150)', steamPuff(0, 0, 1.1, .1, .3)));
      b.add(grp('translate(320 130)', steamPuff(0, 0, 1.4, .9, .26)));
      b.add(grp('translate(420 150)', steamPuff(0, 0, 1.0, 1.7, .28)));
      b.rg('hot2', [[0, t.a, .3], [1, t.a, 0]], .5, .58, .55);
      b.add('<rect width="600" height="440" fill="' + b.u('hot2') + '"/>');
    } else {
      const tg = 'M226 150 L 252 320 q 4 18 48 18 q 44 0 48 -18 L 374 150 Z';
      b.add(pth(tg, 'rgba(255,255,255,.12)'));
      b.clip('sg', '<path d="' + tg + '"/>');
      b.add('<g clip-path="' + b.u('sg') + '">');
      b.add('<rect x="220" y="220" width="164" height="120" fill="' + t.c[2] + '"/>');
      b.add('</g>');
      [[268, 176, '#fdf4e2'], [332, 168, t.c[3]], [300, 138, '#f6e2c8']].forEach(p => {
        b.add(cir(p[0], p[1], 44, p[2]));
        b.add(cir(p[0] - 13, p[1] - 15, 15, 'rgba(255,255,255,.45)'));
      });
      b.add(pth('M240 150 q 60 34 122 8 q 40 -16 20 28 q -70 34 -142 -4 Z', t.c[1]));
      b.add(pth(tg, 'none', ' stroke="rgba(255,255,255,.45)" stroke-width="3.5"'));
      b.add(grp('translate(352 112) rotate(22)', rr(-9, -60, 18, 66, 5, '#e2b877') + ln(-4, -52, -4, -8, 'rgba(0,0,0,.15)', 2)));
      b.add(cir(300, 104, 13, '#c22f45') + ln(300, 92, 308, 74, '#4f7a2c', 3));
      const r = rng('sprink');
      for (let i = 0; i < 16; i++) b.add(rr(250 + r() * 100, 120 + r() * 60, 8, 3.4, 2, ['#f2c14b', '#e2654f', '#4fa63e', '#5aa8dd'][i % 4],
        ' transform="rotate(' + (r() * 180) + ' ' + (250 + r() * 100) + ' ' + (120 + r() * 60) + ')"'));
    }
  }

  /* Paper cone / basket — fries, nachos, kebab --------------------------- */
  function cone(b, t, a) {
    const style = a.style || 'fries';
    shadowUnder(b, 300, 358, 178, 32, .6);

    if (style === 'fries') {
      b.lg('fry', [[0, '#ffe08a'], [.5, '#f0b83f'], [1, '#c2851c']], 0, 0, .4, 1);
      const r = rng('fries');
      for (let i = 0; i < 13; i++) {
        const rot = -46 + i * 7 + r() * 6, len = 130 + r() * 70;
        b.add(grp('translate(' + (250 + i * 8) + ' 300) rotate(' + rot + ')',
          rr(-11, -len, 22, len, 5, b.u('fry')) + rr(-6, -len + 8, 8, len - 20, 3, 'rgba(255,255,255,.25)')));
      }
      /* paper cone */
      b.add(pth('M186 234 L 414 234 L 372 356 q -72 22 -144 0 Z', '#faf5ea'));
      b.add(pth('M186 234 L 414 234 L 404 268 L 196 268 Z', '#e94b3c'));
      b.add(pth('M196 290 L 404 290 L 398 312 L 202 312 Z', '#e94b3c'));
      b.add(pth('M186 234 L 414 234 L 372 356 q -72 22 -144 0 Z', 'none', ' stroke="rgba(0,0,0,.14)" stroke-width="3"'));
      /* cheese + garnish over the fries */
      b.add(pth('M234 210 q 50 34 118 12 q 46 -16 34 22 q -68 40 -156 4 q -30 -14 4 -38 Z', '#ffc244'));
      for (let i = 0; i < 12; i++) b.add(ln(240 + r() * 130, 170 + r() * 70, 250 + r() * 130, 176 + r() * 70, '#c62f18', 3.4));
      for (let i = 0; i < 14; i++) b.add(cir(240 + r() * 130, 172 + r() * 70, 3, '#4fa63e'));
      b.add(ell(474, 330, 44, 22, '#dfe6ea'));
      b.add(ell(474, 326, 36, 17, '#c9301c'));
    } else if (style === 'nachos') {
      b.rg('nb', [[0, CERAMIC[0]], [.7, CERAMIC[1]], [1, CERAMIC[3]]], .34, .28, .82);
      b.add(ell(300, 274, 192, 122, b.u('nb')));
      b.add(ell(300, 274, 192, 122, 'none', ' stroke="rgba(0,0,0,.15)" stroke-width="2"'));
      b.lg('chip', [[0, '#ffdf9c'], [.5, '#eec257'], [1, '#c19023']], 0, 0, .4, 1);
      const r = rng('nachos');
      for (let i = 0; i < 9; i++) {
        const x = 186 + i * 30 + r() * 12, y = 214 + r() * 70, rot = -40 + r() * 80;
        b.add(grp('translate(' + x + ' ' + y + ') rotate(' + rot + ')',
          pth('M-42 34 L 42 34 L 0 -40 Z', b.u('chip')) + pth('M-30 26 L 30 26 L 0 -22 Z', 'rgba(255,255,255,.22)')));
      }
      b.add(pth('M196 250 q 62 40 132 16 q 52 -18 42 24 q -76 44 -170 6 q -34 -16 -4 -46 Z', '#ffc244'));
      for (let i = 0; i < 8; i++) b.add(pth('M0 0 q 22 -12 40 4 q -20 16 -40 -4 Z', '#c9301c', ' transform="translate(' + (216 + r() * 160) + ' ' + (216 + r() * 70) + ') rotate(' + (r() * 360) + ')"'));
      for (let i = 0; i < 9; i++) b.add('<circle cx="' + (222 + r() * 150) + '" cy="' + (218 + r() * 66) + '" r="10" fill="none" stroke="#4c9a34" stroke-width="5"/>');
      b.add(ell(404, 236, 44, 26, '#fffaf0'));
      for (let i = 0; i < 10; i++) b.add(cir(228 + r() * 150, 222 + r() * 60, 2.6, '#2f6d2a'));
    } else { /* kebab */
      b.rg('kb', [[0, CERAMIC[0]], [.7, CERAMIC[1]], [1, CERAMIC[3]]], .34, .28, .82);
      b.add(ell(300, 268, 190, 126, b.u('kb')));
      b.add(ell(300, 268, 190, 126, 'none', ' stroke="rgba(0,0,0,.15)" stroke-width="2"'));
      b.lg('kp', [[0, '#8fc25c'], [.5, '#57902f'], [1, '#2f5c1c']], 0, 0, .4, 1);
      const r = rng('kebab');
      [[228, 244], [312, 218], [372, 276], [268, 300]].forEach((p, i) => {
        b.add(ell(p[0], p[1] + 16, 46, 12, 'rgba(60,80,30,.25)'));
        b.add(cir(p[0], p[1], 46, b.u('kp')));
        b.add(cir(p[0], p[1], 38, 'rgba(255,255,255,.10)'));
        for (let j = 0; j < 6; j++) b.add(ell(p[0] - 30 + r() * 60, p[1] - 26 + r() * 52, 6 + r() * 5, 4 + r() * 3, 'rgba(40,60,16,.4)'));
        b.add(cir(p[0] - 14, p[1] - 16, 12, 'rgba(255,255,255,.2)'));
      });
      b.add(ell(478, 314, 48, 24, '#dfe6ea'));
      b.add(ell(478, 310, 40, 19, '#3f8f3a'));
      b.add(lemonWedge(146, 306, 22, .66));
      [[440, 210, 0], [468, 226, 18]].forEach(p => b.add('<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="28" ry="11" fill="none" stroke="#d9c7e8" stroke-width="6"/>'));
      b.add(leaf(200, 226, -22, .58, '#3f8f3a'));
    }
  }

  const KINDS = {
    cupTop, cupSide, kulhad, tallGlass, breakfastPlate, stack,
    pizzaTop, pastaBowl, skewerSlate, curryBowl, breadBasket,
    riceMound, dessertPlate, sundae, cone
  };

  /* ------------------------------------------------------------------ API */
  function render(art, opts) {
    art = art || {};
    opts = opts || {};
    const t = TONES[art.tone] || TONES.caramel;
    const s = SURFACES[art.surface] || SURFACES.wood;
    const b = new Builder('ar' + (seq++).toString(36));

    backdrop(b, s, t, (art.kind || 'x') + (art.tone || 'y') + (art.style || 'z'));
    (KINDS[art.kind] || curryBowl)(b, t, art);
    vignette(b);

    const label = (opts.label || '').replace(/[<>&"]/g, '');
    return '<svg class="art" viewBox="0 0 600 440" preserveAspectRatio="xMidYMid slice" role="img" ' +
      'aria-label="' + (label ? 'Illustration of ' + label : 'Dish illustration') + '" focusable="false">' +
      '<defs>' + b.d.join('') + '</defs>' + b.b.join('') + '</svg>';
  }

  return { render: render, TONES: TONES, SURFACES: SURFACES };
})();
