/* ============================================================================
   Special's Restro & Cafe — application layer
   ----------------------------------------------------------------------------
   Everything reactive: hash router, cart, filters, delivery checkout, order
   tracking, reservations, and all the motion wiring.

   Dependencies are all optional and feature-detected:
     SRC.Art     (assets/js/art.js)     — generated dish artwork
     SRC.Hero3D  (assets/js/hero3d.js)  — WebGL hero
     THREE / gsap / ScrollTrigger / Lenis — CDN, enhancement only
   The site is fully usable if every one of them fails to load.
   ========================================================================== */
(function () {
  'use strict';

  /* ═════════════════════════════════════════════════════════════ utilities */
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const B  = SRC.BUSINESS;
  const D  = B.delivery;
  const MENU = SRC.MENU;
  const CATS = SRC.CATEGORIES;
  const byId = {};
  MENU.forEach(m => { byId[m.id] = m; });

  const html = document.documentElement;
  const reduced = html.classList.contains('rm');

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function rupee(n) {
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function debounce(fn, ms) {
    let t; return function () { const a = arguments, c = this; clearTimeout(t); t = setTimeout(() => fn.apply(c, a), ms); };
  }
  function hash32(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0);
  }
  function store(key, val) {
    try {
      if (val === undefined) { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  function art(cfg, label) {
    if (SRC.Art && SRC.Art.render) return SRC.Art.render(cfg, { label: label });
    return '<div class="art art--none" aria-hidden="true"></div>';
  }
  function tel() { return 'tel:' + B.phone.replace(/[^\d+]/g, ''); }
  function cat(id) { return CATS.filter(c => c.id === id)[0] || { label: id, icon: '🍴', blurb: '' }; }

  /* ═══════════════════════════════════════════════════════ reactive store */
  const state = {
    page: 'home',
    /* cart lines: { key, id, qty, opts:[addonId] } */
    cart: store('src.cart') || [],
    q: '', diet: 'all', tag: 'all', cat: 'all', sort: 'popular', maxPrice: 420,
    mode: 'delivery', slot: 'asap', schedTime: '', pay: 'upi', tip: 0,
    coupon: null,
    order: null
  };

  const subs = {};
  function on(chan, fn) { (subs[chan] = subs[chan] || []).push(fn); }
  function emit(chan) {
    (subs[chan] || []).forEach(fn => { try { fn(state); } catch (e) { console.warn('[render:' + chan + ']', e); } });
  }
  function set(patch, chans) {
    Object.keys(patch).forEach(k => { state[k] = patch[k]; });
    (chans || []).forEach(emit);
  }

  /* ═════════════════════════════════════════════════════════════── toasts */
  const toastHost = $('[data-toasts]');
  function toast(msg, kind, extra) {
    if (!toastHost) return;
    const t = document.createElement('div');
    t.className = 'toast' + (kind ? ' toast--' + kind : '');
    t.innerHTML = '<span class="toast__i" aria-hidden="true">' +
      (kind === 'bad' ? '⚠' : kind === 'info' ? 'ℹ' : '✓') + '</span><div><b>' + esc(msg) + '</b>' +
      (extra ? '<small>' + esc(extra) + '</small>' : '') + '</div>';
    toastHost.appendChild(t);
    requestAnimationFrame(() => t.classList.add('in'));
    setTimeout(() => {
      t.classList.remove('in');
      setTimeout(() => t.remove(), 420);
    }, kind === 'bad' ? 4200 : 2800);
    while (toastHost.children.length > 4) toastHost.firstChild.remove();
  }

  /* ══════════════════════════════════════════════════════════════─ theme */
  (function theme() {
    const btn = $('[data-theme-toggle]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      store('src.theme', next);
      toast(next === 'light' ? 'Daylight mode' : 'Late-night mode', 'info');
    });
  })();

  /* ════════════════════════════════════════════════════════ opening hours */
  function minutesNow() {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }
  function fmtMin(m) {
    m = ((m % 1440) + 1440) % 1440;
    let h = Math.floor(m / 60), mm = m % 60;
    const ap = h >= 12 ? 'pm' : 'am';
    h = h % 12; if (h === 0) h = 12;
    return h + ':' + (mm < 10 ? '0' : '') + mm + ' ' + ap;
  }
  function openState() {
    const now = minutesNow();
    const o = B.hours.openMin, c = B.hours.closeMin;         /* c may exceed 1440 */
    const isOpen = (now >= o && now < c) || (c > 1440 && now < (c - 1440));
    let mins;
    if (isOpen) {
      mins = (now < o) ? (c - 1440 - now) : (c - now);
    } else {
      mins = (now < o) ? (o - now) : (1440 - now + o);
    }
    return { open: isOpen, mins: mins, opensAt: fmtMin(o), closesAt: fmtMin(c) };
  }
  function paintStatus() {
    const s = openState();
    const soon = s.open && s.mins <= 60;
    const label = s.open
      ? (soon ? 'Closing in ' + s.mins + ' min' : 'Open now · closes ' + s.closesAt)
      : 'Closed · opens ' + s.opensAt;
    $$('[data-status-pill]').forEach(p => {
      p.classList.toggle('is-open', s.open);
      p.classList.toggle('is-soon', !!soon);
      p.classList.toggle('is-shut', !s.open);
      const sp = p.querySelector('span'); if (sp) sp.textContent = label;
    });
    const nowEl = $('[data-hours-now]');
    if (nowEl) {
      nowEl.innerHTML = s.open
        ? '<b class="ok">Open right now</b> — the kitchen closes at ' + s.closesAt + '.'
        : '<b class="no">Closed right now</b> — we open at ' + s.opensAt + '.';
    }
  }

  /* ═══════════════════════════════════════════════════════════════─ cart */
  function lineKey(id, opts) { return id + '|' + (opts || []).slice().sort().join(','); }
  function addonsFor(id) { return SRC.ADDONS[byId[id] ? byId[id].cat : ''] || []; }
  function addonPrice(id, opts) {
    const list = addonsFor(id);
    return (opts || []).reduce((s, o) => {
      const a = list.filter(x => x.id === o)[0];
      return s + (a ? a.price : 0);
    }, 0);
  }
  function linePrice(line) { return (byId[line.id].price + addonPrice(line.id, line.opts)); }
  function addonLabels(line) {
    const list = addonsFor(line.id);
    return (line.opts || []).map(o => {
      const a = list.filter(x => x.id === o)[0];
      return a ? a.label : o;
    });
  }
  function cartCount() { return state.cart.reduce((s, l) => s + l.qty, 0); }
  function subtotal() { return state.cart.reduce((s, l) => s + linePrice(l) * l.qty, 0); }

  function persist() { store('src.cart', state.cart); }

  function addToCart(id, qty, opts, quiet) {
    if (!byId[id]) return;
    qty = qty || 1;
    opts = (opts || []).slice().sort();
    const k = lineKey(id, opts);
    const found = state.cart.filter(l => l.key === k)[0];
    if (found) found.qty = Math.min(30, found.qty + qty);
    else state.cart.push({ key: k, id: id, qty: qty, opts: opts });
    persist();
    emit('cart');
    if (!quiet) {
      toast(byId[id].name + ' added', 'good', qty + ' × ' + rupee(byId[id].price + addonPrice(id, opts)));
      if (hero3d) hero3d.pulse(0.9);
      bumpCart();
    }
  }
  function setQty(key, qty) {
    const l = state.cart.filter(x => x.key === key)[0];
    if (!l) return;
    if (qty <= 0) state.cart = state.cart.filter(x => x.key !== key);
    else l.qty = Math.min(30, qty);
    persist();
    emit('cart');
  }
  function clearCart() {
    state.cart = [];
    state.coupon = null;
    persist();
    emit('cart');
    toast('Bag emptied', 'info');
  }

  function bumpCart() {
    const b = $('[data-cart-open]');
    if (!b) return;
    b.classList.remove('pop');
    void b.offsetWidth;
    b.classList.add('pop');
  }

  /* ───────────────────────────────────────────────────────────── bill math */
  function bill() {
    const st = subtotal();
    const c = state.coupon ? SRC.COUPONS[state.coupon] : null;
    let disc = 0, freeShip = false;
    if (c && st >= c.min) {
      if (c.type === 'pct')  disc = Math.min(c.cap || Infinity, Math.round(st * c.value / 100));
      if (c.type === 'flat') disc = Math.min(c.value, st);
      if (c.type === 'ship') freeShip = true;
    }
    const pack = state.mode === 'dinein' ? 0 : D.packaging;
    let ship = 0, shipFree = false;
    if (state.mode === 'delivery') {
      shipFree = st >= D.freeAbove || freeShip;
      ship = shipFree ? 0 : D.fee;
    }
    const slot = SRC.SLOTS.filter(s => s.id === state.slot)[0];
    const rush = (state.mode === 'delivery' && slot) ? slot.extra : 0;
    const net  = Math.max(0, st - disc);
    const gst  = Math.round((net + pack) * D.gstRate);
    const tip  = state.mode === 'delivery' ? state.tip : 0;
    const total = net + pack + ship + rush + gst + tip;
    return { st, disc, pack, ship, shipFree, rush, gst, tip, total, coupon: c };
  }

  /* ═════════════════════════════════════════════════════ cart UI renders */
  function lineRow(l, compact) {
    const it = byId[l.id];
    const ads = addonLabels(l);
    return '<div class="line' + (compact ? ' line--sm' : '') + '" data-key="' + esc(l.key) + '">' +
      (compact ? '' : '<div class="line__art" data-art-id="' + it.id + '"></div>') +
      '<div class="line__mid">' +
        '<b>' + esc(it.name) + '</b>' +
        (ads.length ? '<small class="line__ads">+ ' + esc(ads.join(', ')) + '</small>' : '') +
        '<small class="line__unit">' + rupee(linePrice(l)) + ' each</small>' +
      '</div>' +
      '<div class="line__right">' +
        '<div class="qty qty--sm">' +
          '<button data-dec="' + esc(l.key) + '" aria-label="One less ' + esc(it.name) + '">−</button>' +
          '<b>' + l.qty + '</b>' +
          '<button data-inc="' + esc(l.key) + '" aria-label="One more ' + esc(it.name) + '">+</button>' +
        '</div>' +
        '<span class="line__amt">' + rupee(linePrice(l) * l.qty) + '</span>' +
        '<button class="line__x" data-rm="' + esc(l.key) + '" aria-label="Remove ' + esc(it.name) + '">Remove</button>' +
      '</div>' +
    '</div>';
  }

  function paintFreebar(barSel, fillSel, textSel) {
    const bar = $(barSel), fill = $(fillSel), text = $(textSel);
    if (!bar) return;
    const st = subtotal(), need = D.freeAbove - st;
    const p = clamp(st / D.freeAbove, 0, 1);
    if (fill) fill.style.width = (p * 100).toFixed(1) + '%';
    bar.classList.toggle('is-done', need <= 0);
    if (text) {
      text.innerHTML = need <= 0
        ? '🎉 Delivery is <b>free</b> on this order'
        : 'Add <b>' + rupee(need) + '</b> more for free delivery';
    }
  }

  function renderCart() {
    const n = cartCount(), st = subtotal();
    $$('[data-cart-count],[data-cart-count-2]').forEach(e => { e.textContent = n; });
    const openBtn = $('[data-cart-open]');
    if (openBtn) openBtn.classList.toggle('has-items', n > 0);

    const body = $('[data-cart-body]'), empty = $('[data-cart-empty]'), foot = $('[data-cart-foot]');
    if (body) {
      body.innerHTML = state.cart.map(l => lineRow(l)).join('');
      lazyArt(body);
    }
    if (empty) empty.hidden = n > 0;
    if (foot) foot.hidden = n === 0;
    const sub = $('[data-cart-subtotal]'); if (sub) sub.textContent = rupee(st);
    paintFreebar('[data-freebar-2]', '[data-freebar-fill-2]', '[data-freebar-text-2]');

    /* mobile order bar */
    const ob = $('[data-obar]');
    if (ob) {
      ob.hidden = n === 0 || state.page === 'delivery';
      $('[data-obar-count]').textContent = n + (n === 1 ? ' item' : ' items');
      $('[data-obar-total]').textContent = rupee(st);
    }
    /* re-mark add buttons in the grid */
    $$('[data-add]').forEach(btn => {
      const has = state.cart.some(l => l.id === btn.getAttribute('data-add'));
      btn.classList.toggle('is-in', has);
    });
    emit('bill');
  }
  on('cart', renderCart);

  /* cart drawer open/close */
  const scrim = $('[data-scrim]'), cartEl = $('[data-cart]');
  let lastFocus = null;
  function openCart(v) {
    if (!cartEl) return;
    if (v) {
      lastFocus = document.activeElement;
      cartEl.hidden = false; scrim.hidden = false;
      requestAnimationFrame(() => { cartEl.classList.add('in'); scrim.classList.add('in'); });
      html.classList.add('locked');
      const c = $('[data-cart-close]'); if (c) c.focus();
    } else {
      cartEl.classList.remove('in'); scrim.classList.remove('in');
      html.classList.remove('locked');
      setTimeout(() => { if (!cartEl.classList.contains('in')) { cartEl.hidden = true; scrim.hidden = true; } }, 340);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
  }

  /* ═══════════════════════════════════════════════ generated art, lazily */
  const artIO = ('IntersectionObserver' in window) ? new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      paintArt(en.target);
      artIO.unobserve(en.target);
    });
  }, { rootMargin: '320px 0px' }) : null;

  function paintArt(el) {
    if (el.dataset.done) return;
    const id = el.getAttribute('data-art-id');
    const it = byId[id];
    if (!it) return;
    el.innerHTML = art(it.art, it.name);
    el.dataset.done = '1';
    el.classList.add('art-in');
  }
  function lazyArt(root) {
    $$('[data-art-id]', root || document).forEach(el => {
      if (el.dataset.done) return;
      if (artIO) artIO.observe(el); else paintArt(el);
    });
  }

  /* ═══════════════════════════════════════════════════════════════─ MENU */
  function tagBadge(t) {
    const map = {
      bestseller: ['⭐', 'Bestseller'], chefs: ['👨‍🍳', "Chef's special"],
      'new': ['🆕', 'New'], spicy: ['🌶', 'Spicy'], light: ['🌿', 'Lighter']
    };
    const m = map[t]; if (!m) return '';
    return '<span class="tag tag--' + t + '">' + m[0] + ' ' + m[1] + '</span>';
  }
  function flames(n) {
    if (!n) return '';
    return '<span class="flames" title="Spice level ' + n + ' of 3">' + '🌶'.repeat(n) + '</span>';
  }
  function highlight(text, q) {
    if (!q) return esc(text);
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }

  function matches(it) {
    if (state.diet === 'veg' && it.diet !== 'veg') return false;
    if (state.diet === 'egg' && it.diet !== 'egg') return false;
    if (state.tag !== 'all' && (it.tags || []).indexOf(state.tag) < 0) return false;
    if (state.cat !== 'all' && it.cat !== state.cat) return false;
    if (it.price > state.maxPrice) return false;
    const q = state.q.trim().toLowerCase();
    if (q) {
      const hay = (it.name + ' ' + it.desc + ' ' + cat(it.cat).label + ' ' + (it.tags || []).join(' ')).toLowerCase();
      if (hay.indexOf(q) < 0) return false;
    }
    return true;
  }
  function sortItems(list) {
    const a = list.slice();
    const s = state.sort;
    if (s === 'low')    a.sort((x, y) => x.price - y.price);
    else if (s === 'high') a.sort((x, y) => y.price - x.price);
    else if (s === 'rating') a.sort((x, y) => y.rating - x.rating || y.votes - x.votes);
    else if (s === 'az') a.sort((x, y) => x.name.localeCompare(y.name));
    else a.sort((x, y) => (y.votes * y.rating) - (x.votes * x.rating));
    return a;
  }

  function dishCard(it) {
    const q = state.q.trim();
    return '<article class="dish" data-dish="' + it.id + '" tabindex="0" role="button" aria-label="' + esc(it.name) + ', ' + rupee(it.price) + '. Open details">' +
      '<div class="dish__art" data-art-id="' + it.id + '"></div>' +
      '<div class="dish__badges">' + (it.tags || []).map(tagBadge).join('') + '</div>' +
      '<div class="dish__body">' +
        '<div class="dish__head">' +
          '<span class="dot dot--' + it.diet + '" title="' + (it.diet === 'veg' ? 'Vegetarian' : 'Contains egg') + '"></span>' +
          '<h3>' + highlight(it.name, q) + '</h3>' +
        '</div>' +
        '<p class="dish__desc">' + highlight(it.desc, q) + '</p>' +
        '<div class="dish__meta">' +
          '<span class="score">★ ' + it.rating.toFixed(1) + '</span>' +
          '<span>' + it.votes + ' orders</span>' +
          '<span>' + it.kcal + ' kcal</span>' +
          flames(it.spice) +
        '</div>' +
        '<div class="dish__foot">' +
          '<b class="dish__price">' + rupee(it.price) + '</b>' +
          '<button class="btn btn--primary btn--sm" data-add="' + it.id + '">Add' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function renderMenu() {
    const grid = $('[data-menu-grid]');
    if (!grid) return;
    const shown = MENU.filter(matches);
    const groups = [];
    CATS.forEach(c => {
      const items = sortItems(shown.filter(i => i.cat === c.id));
      if (items.length) groups.push({ c: c, items: items });
    });

    grid.innerHTML = groups.map(g =>
      '<section class="grp" id="grp-' + g.c.id + '" data-grp="' + g.c.id + '">' +
        '<header class="grp__head">' +
          '<h2><span aria-hidden="true">' + g.c.icon + '</span> ' + esc(g.c.label) + ' <i>' + g.items.length + '</i></h2>' +
          '<p>' + esc(g.c.blurb) + '</p>' +
        '</header>' +
        '<div class="grp__grid">' + g.items.map(dishCard).join('') + '</div>' +
      '</section>'
    ).join('');

    lazyArt(grid);
    revealScan(grid);

    const empty = $('[data-menu-empty]');
    if (empty) empty.hidden = shown.length > 0;
    grid.hidden = shown.length === 0;

    const rc = $('[data-result-count]');
    if (rc) {
      rc.innerHTML = shown.length === MENU.length
        ? 'All <b>' + MENU.length + '</b> dishes · ' + groups.length + ' sections'
        : 'Showing <b>' + shown.length + '</b> of ' + MENU.length + ' dishes';
    }
    const dirty = state.q || state.diet !== 'all' || state.tag !== 'all' || state.cat !== 'all' || state.maxPrice < 420;
    $$('[data-reset]').forEach(b => { b.hidden = !dirty; });

    /* category rail counts */
    $$('[data-cat-rail] button').forEach(b => {
      const id = b.getAttribute('data-cat');
      const n = id === 'all' ? shown.length : shown.filter(i => i.cat === id).length;
      const c = b.querySelector('i'); if (c) c.textContent = n;
      b.classList.toggle('is-on', state.cat === id);
      b.classList.toggle('is-zero', n === 0);
    });
    renderCart();
  }
  on('menu', renderMenu);

  function resetFilters() {
    set({ q: '', diet: 'all', tag: 'all', cat: 'all', maxPrice: 420, sort: 'popular' }, []);
    const s = $('[data-search]'); if (s) s.value = '';
    const p = $('[data-price]'); if (p) p.value = 420;
    const po = $('[data-price-out]'); if (po) po.textContent = '₹420';
    const so = $('[data-sort]'); if (so) so.value = 'popular';
    $$('[data-diet]').forEach(b => b.classList.toggle('is-on', b.getAttribute('data-diet') === 'all'));
    $$('[data-tag]').forEach(b => b.classList.toggle('is-on', b.getAttribute('data-tag') === 'all'));
    const x = $('[data-search-clear]'); if (x) x.hidden = true;
    emit('menu');
  }

  function buildCatRail() {
    const rail = $('[data-cat-rail]');
    if (!rail) return;
    rail.innerHTML = '<button data-cat="all" class="is-on"><span aria-hidden="true">✦</span> Everything <i>68</i></button>' +
      CATS.map(c => '<button data-cat="' + c.id + '"><span aria-hidden="true">' + c.icon + '</span> ' + esc(c.label) + ' <i>0</i></button>').join('');
    rail.addEventListener('click', e => {
      const b = e.target.closest('button[data-cat]');
      if (!b) return;
      set({ cat: b.getAttribute('data-cat') }, ['menu']);
      const grid = $('[data-menu-grid]');
      const head = $('.mhead');
      if (grid) {
        const y = (head ? head.offsetTop + head.offsetHeight : grid.offsetTop) - 90;
        smoothTo(Math.max(0, y));
      }
    });
  }

  function wireMenuTools() {
    const s = $('[data-search]'), x = $('[data-search-clear]');
    if (s) {
      s.addEventListener('input', debounce(() => {
        set({ q: s.value }, ['menu']);
        if (x) x.hidden = !s.value;
      }, 150));
    }
    if (x) x.addEventListener('click', () => { s.value = ''; x.hidden = true; set({ q: '' }, ['menu']); s.focus(); });

    $$('[data-diet]').forEach(b => b.addEventListener('click', () => {
      $$('[data-diet]').forEach(o => o.classList.remove('is-on'));
      b.classList.add('is-on');
      set({ diet: b.getAttribute('data-diet') }, ['menu']);
    }));
    $$('[data-tag]').forEach(b => b.addEventListener('click', () => {
      $$('[data-tag]').forEach(o => o.classList.remove('is-on'));
      b.classList.add('is-on');
      set({ tag: b.getAttribute('data-tag') }, ['menu']);
    }));
    const so = $('[data-sort]');
    if (so) so.addEventListener('change', () => set({ sort: so.value }, ['menu']));
    const pr = $('[data-price]'), po = $('[data-price-out]');
    if (pr) pr.addEventListener('input', () => {
      if (po) po.textContent = rupee(pr.value);
      set({ maxPrice: +pr.value }, ['menu']);
    });
    $$('[data-reset],[data-reset-2]').forEach(b => b.addEventListener('click', resetFilters));

    document.addEventListener('keydown', e => {
      if (e.key === '/' && state.page === 'menu' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault(); if (s) { s.focus(); s.select(); }
      }
    });
  }

  /* delegated clicks for dish cards, add buttons, cart rows */
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) { e.stopPropagation(); addToCart(add.getAttribute('data-add')); return; }

    const dish = e.target.closest('[data-dish]');
    if (dish) { openItem(dish.getAttribute('data-dish')); return; }

    const inc = e.target.closest('[data-inc]');
    if (inc) { const k = inc.getAttribute('data-inc'); const l = state.cart.filter(x => x.key === k)[0]; if (l) setQty(k, l.qty + 1); return; }
    const dec = e.target.closest('[data-dec]');
    if (dec) { const k = dec.getAttribute('data-dec'); const l = state.cart.filter(x => x.key === k)[0]; if (l) setQty(k, l.qty - 1); return; }
    const rm = e.target.closest('[data-rm]');
    if (rm) { setQty(rm.getAttribute('data-rm'), 0); toast('Removed', 'info'); return; }

    const cp = e.target.closest('[data-copy]');
    if (cp) {
      const txt = cp.getAttribute('data-copy');
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => toast('Address copied', 'good'), () => toast('Copy failed', 'bad'));
      else toast(txt, 'info');
      return;
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const dish = e.target.closest && e.target.closest('[data-dish]');
    if (dish && e.target === dish) { e.preventDefault(); openItem(dish.getAttribute('data-dish')); }
  });

  /* ═══════════════════════════════════════════════════════ item modal 3D */
  const modal = $('[data-item-modal]');
  const flip = $('[data-flip]');
  let modalItem = null, modalQty = 1, modalOpts = [];

  function modalTotal() {
    if (!modalItem) return 0;
    return (modalItem.price + addonPrice(modalItem.id, modalOpts)) * modalQty;
  }
  function paintModalFoot() {
    const qv = $('[data-qv]', modal); if (qv) qv.textContent = modalQty;
    const ab = $('[data-modal-add]', modal);
    if (ab) ab.innerHTML = 'Add to order · <b>' + rupee(modalTotal()) + '</b>';
  }
  function openItem(id) {
    const it = byId[id];
    if (!it || !modal) return;
    modalItem = it; modalQty = 1; modalOpts = [];
    const c = cat(it.cat);
    const adds = addonsFor(id);

    $('[data-modal-front]', modal).innerHTML =
      '<div class="mo">' +
        '<div class="mo__art">' + art(it.art, it.name) +
          '<div class="mo__badges">' + (it.tags || []).map(tagBadge).join('') + '</div>' +
        '</div>' +
        '<div class="mo__body">' +
          '<span class="mo__cat"><span aria-hidden="true">' + c.icon + '</span> ' + esc(c.label) + '</span>' +
          '<h2 id="moTitle"><span class="dot dot--' + it.diet + '"></span>' + esc(it.name) + '</h2>' +
          '<div class="mo__meta"><span class="score">★ ' + it.rating.toFixed(1) + '</span><span>' + it.votes + ' orders</span><span>' + it.kcal + ' kcal</span>' + flames(it.spice) + '</div>' +
          '<p class="mo__desc">' + esc(it.desc) + '</p>' +
          (adds.length ? '<div class="mo__adds"><h4>Make it yours</h4>' + adds.map(a =>
            '<label class="ad"><input type="checkbox" data-addon="' + a.id + '"><span>' + esc(a.label) + '</span><b>' + (a.price ? '+' + rupee(a.price) : 'Free') + '</b></label>'
          ).join('') + '</div>' : '') +
          '<div class="mo__foot">' +
            '<div class="qty"><button data-q="-" aria-label="Fewer">−</button><b data-qv>1</b><button data-q="+" aria-label="More">+</button></div>' +
            '<button class="btn btn--primary btn--lg" data-modal-add>Add to order</button>' +
          '</div>' +
          '<button class="linky" data-flip-btn>How we make it <span aria-hidden="true">→</span></button>' +
        '</div>' +
      '</div>';

    const notes = [
      c.blurb,
      it.diet === 'veg' ? 'Pure vegetarian — no egg, no meat, separate prep board.' : 'Contains egg. Ask and we will suggest an eggless swap.',
      it.spice === 0 ? 'Not spicy at all.' : it.spice === 1 ? 'Gently spiced — kid friendly.' : it.spice === 2 ? 'Properly spiced, but balanced with dairy.' : 'Full heat. We will tone it down on request.',
      'Roughly ' + it.kcal + ' kcal as plated. Portions are built for one to share lightly.',
      'Travels well: ' + (['hot-coffee', 'tea'].indexOf(it.cat) >= 0 ? 'double-cupped with a sealed lid.' :
        ['mains', 'continental'].indexOf(it.cat) >= 0 ? 'gravy goes into a leak-proof jar, garnish packed apart.' :
        it.cat === 'breads' ? 'wrapped in butter paper so it stays soft.' :
        'sealed in a vented box so the crust keeps its bite.')
    ];
    $('[data-modal-back]', modal).innerHTML =
      '<div class="mo mo--back">' +
        '<span class="mo__cat">Behind the dish</span>' +
        '<h3>' + esc(it.name) + '</h3>' +
        '<ul class="ticks">' + notes.map(n => '<li>' + esc(n) + '</li>').join('') + '</ul>' +
        '<p class="fine">Allergens: prepared in a kitchen that handles milk, wheat, nuts and egg.</p>' +
        '<button class="linky" data-flip-btn><span aria-hidden="true">←</span> Back to ordering</button>' +
      '</div>';

    if (flip) flip.classList.remove('is-back');
    paintModalFoot();
    modal.hidden = false; scrim.hidden = false;
    requestAnimationFrame(() => { modal.classList.add('in'); scrim.classList.add('in'); });
    html.classList.add('locked');
    const cl = $('[data-modal-close]', modal); if (cl) cl.focus();
  }
  function closeItem() {
    if (!modal) return;
    modal.classList.remove('in');
    if (!cartEl || !cartEl.classList.contains('in')) { scrim.classList.remove('in'); html.classList.remove('locked'); }
    setTimeout(() => {
      if (!modal.classList.contains('in')) modal.hidden = true;
      if (!scrim.classList.contains('in')) scrim.hidden = true;
    }, 320);
    modalItem = null;
  }
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) return closeItem();
      if (e.target.closest('[data-modal-close]')) return closeItem();
      if (e.target.closest('[data-flip-btn]')) { flip.classList.toggle('is-back'); return; }
      const q = e.target.closest('[data-q]');
      if (q) { modalQty = clamp(modalQty + (q.getAttribute('data-q') === '+' ? 1 : -1), 1, 30); paintModalFoot(); return; }
      const ab = e.target.closest('[data-modal-add]');
      if (ab) { addToCart(modalItem.id, modalQty, modalOpts); closeItem(); return; }
    });
    modal.addEventListener('change', e => {
      const cb = e.target.closest('[data-addon]');
      if (!cb) return;
      const id = cb.getAttribute('data-addon');
      modalOpts = cb.checked ? modalOpts.concat([id]) : modalOpts.filter(o => o !== id);
      paintModalFoot();
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (modal && !modal.hidden) closeItem();
    else if (cartEl && cartEl.classList.contains('in')) openCart(false);
    else if (html.classList.contains('nav-open')) toggleBurger(false);
  });

  /* ══════════════════════════════════════════════════════════── DELIVERY */
  function paintModes() {
    $$('[data-modes] button').forEach(b => b.classList.toggle('is-on', b.getAttribute('data-mode') === state.mode));
    const del = state.mode === 'delivery';
    $$('[data-addr-only]').forEach(e => { e.style.display = del ? '' : 'none'; });
    const t = $('[data-addr-title]');
    if (t) t.textContent = del ? 'Where are we delivering?' :
      state.mode === 'drive' ? 'Who is picking up at the window?' : 'Whose table is this for?';
    const slots = $('[data-slots]');
    if (slots) slots.parentElement.querySelector('.step__h').innerHTML = '<i>3</i> ' + (del ? 'When?' : 'Ready by?');
    emit('bill');
  }
  function paintSlots() {
    const wrap = $('[data-slots]');
    if (!wrap) return;
    wrap.innerHTML = SRC.SLOTS.map(s => {
      const note = s.id === 'asap'
        ? (state.mode === 'drive' ? 'ready in ~12 min' : state.mode === 'dinein' ? 'ready in ~15 min' : s.note)
        : s.note;
      return '<button data-slot="' + s.id + '"' + (state.slot === s.id ? ' class="is-on"' : '') + '>' +
        '<b>' + esc(s.label) + '</b><small>' + esc(note) + '</small>' +
        (s.extra ? '<i>+' + rupee(s.extra) + '</i>' : '') + '</button>';
    }).join('');
    const sched = $('[data-sched]');
    if (sched) sched.hidden = state.slot !== 'later';
  }
  function buildSchedTimes() {
    const sel = $('[data-sched-times]');
    if (!sel) return;
    const now = minutesNow();
    let start = Math.ceil((now + 45) / 30) * 30;
    const out = [];
    for (let m = start; m <= 24 * 60; m += 30) out.push(fmtMin(m));
    if (!out.length) out.push('Tomorrow, ' + fmtMin(B.hours.openMin));
    sel.innerHTML = out.map(o => '<option>' + esc(o) + '</option>').join('');
    state.schedTime = out[0];
    sel.addEventListener('change', () => { state.schedTime = sel.value; });
  }
  function buildAreas() {
    const sel = $('[data-areas]');
    if (!sel) return;
    sel.innerHTML = D.areas.map(a => '<option>' + esc(a) + '</option>').join('') +
      '<option value="other">Somewhere else in Jamnagar</option>';
  }
  function paintCouponHints() {
    const h = $('[data-coupon-hints]');
    if (!h) return;
    h.innerHTML = Object.keys(SRC.COUPONS).map(k => {
      const c = SRC.COUPONS[k];
      return '<button class="cpn__chip' + (state.coupon === k ? ' is-on' : '') + '" data-usecoupon="' + k + '" title="' + esc(c.label) + '">' + k + '</button>';
    }).join('');
  }
  function applyCoupon(codeRaw) {
    const code = String(codeRaw || '').trim().toUpperCase();
    const msg = $('[data-coupon-msg]');
    const c = SRC.COUPONS[code];
    if (!code) { state.coupon = null; if (msg) msg.innerHTML = ''; paintCouponHints(); emit('bill'); return; }
    if (!c) {
      state.coupon = null;
      if (msg) msg.innerHTML = '<span class="no">“' + esc(code) + '” isn\'t a code we recognise.</span>';
      toast('Coupon not recognised', 'bad');
    } else if (subtotal() < c.min) {
      state.coupon = null;
      if (msg) msg.innerHTML = '<span class="no">' + esc(code) + ' needs a ' + rupee(c.min) + ' order — you are ' + rupee(c.min - subtotal()) + ' short.</span>';
      toast('Order too small for ' + code, 'bad', 'Minimum ' + rupee(c.min));
    } else {
      state.coupon = code;
      if (msg) msg.innerHTML = '<span class="ok">' + esc(code) + ' applied — ' + esc(c.label) + '</span>';
      toast(code + ' applied', 'good', c.label);
    }
    paintCouponHints();
    emit('bill');
  }

  function renderBill() {
    const list = $('[data-sum-list]'), empty = $('[data-sum-empty]'), rest = $('[data-sum-rest]');
    const n = cartCount();
    if (list) { list.innerHTML = state.cart.map(l => lineRow(l, true)).join(''); }
    if (empty) empty.hidden = n > 0;
    if (rest) rest.hidden = n === 0;
    paintFreebar('[data-freebar]', '[data-freebar-fill]', '[data-freebar-text]');

    const b = bill();
    const dl = $('[data-bill]');
    if (dl) {
      const rows = [['Item total', rupee(b.st)]];
      if (b.disc) rows.push(['Coupon ' + state.coupon, '− ' + rupee(b.disc), 'ok']);
      if (b.pack) rows.push(['Packaging', rupee(b.pack)]);
      if (state.mode === 'delivery') rows.push(['Delivery ' + (b.shipFree ? '' : '(' + D.radiusKm + ' km radius)'), b.shipFree ? 'FREE' : rupee(b.ship), b.shipFree ? 'ok' : '']);
      if (b.rush) rows.push(['Priority kitchen slot', rupee(b.rush)]);
      rows.push(['GST &amp; charges (5%)', rupee(b.gst)]);
      if (b.tip) rows.push(['Rider tip', rupee(b.tip)]);
      dl.innerHTML = rows.map(r => '<div class="bill__r' + (r[2] ? ' ' + r[2] : '') + '"><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>').join('') +
        '<div class="bill__r bill__r--tot"><dt>To pay</dt><dd>' + rupee(b.total) + '</dd></div>';
    }
    const ot = $('[data-order-total]'); if (ot) ot.textContent = rupee(b.total);
    const fine = $('[data-order-fine]');
    const short = D.minOrder - b.st;
    if (fine) {
      fine.innerHTML = n === 0 ? '' :
        (state.mode === 'delivery' && short > 0)
          ? '<span class="no">Minimum delivery order is ' + rupee(D.minOrder) + ' — add ' + rupee(short) + ' more.</span>'
          : state.pay === 'cod' ? 'Pay ' + rupee(b.total) + ' in cash at the door.' :
            state.mode === 'delivery' ? 'Arriving in about ' + (state.slot === 'rush' ? 20 : D.etaMin) + ' minutes after confirmation.' :
            state.mode === 'drive' ? 'We will hold it at the Airport Road window for 20 minutes.' :
            'We will start cooking when you check in at the desk.';
    }
    const po = $('[data-place-order]');
    if (po) po.disabled = n === 0 || (state.mode === 'delivery' && short > 0);
  }
  on('bill', renderBill);

  function wireDelivery() {
    const modes = $('[data-modes]');
    if (modes) modes.addEventListener('click', e => {
      const b = e.target.closest('button[data-mode]');
      if (!b) return;
      set({ mode: b.getAttribute('data-mode') }, []);
      paintModes(); paintSlots();
    });
    const slots = $('[data-slots]');
    if (slots) slots.addEventListener('click', e => {
      const b = e.target.closest('button[data-slot]');
      if (!b) return;
      set({ slot: b.getAttribute('data-slot') }, []);
      paintSlots(); emit('bill');
    });
    const pays = $('[data-pays]');
    if (pays) pays.addEventListener('click', e => {
      const b = e.target.closest('button[data-pay]');
      if (!b) return;
      $$('button', pays).forEach(o => o.classList.remove('is-on'));
      b.classList.add('is-on');
      set({ pay: b.getAttribute('data-pay') }, ['bill']);
    });
    const tips = $('[data-tips]');
    if (tips) tips.addEventListener('click', e => {
      const b = e.target.closest('button[data-tip]');
      if (!b) return;
      $$('button', tips).forEach(o => o.classList.remove('is-on'));
      b.classList.add('is-on');
      set({ tip: +b.getAttribute('data-tip') }, ['bill']);
    });
    const ca = $('[data-coupon-apply]'), ci = $('[data-coupon]');
    if (ca) ca.addEventListener('click', () => applyCoupon(ci ? ci.value : ''));
    if (ci) ci.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(ci.value); } });
    const hints = $('[data-coupon-hints]');
    if (hints) hints.addEventListener('click', e => {
      const b = e.target.closest('[data-usecoupon]');
      if (!b) return;
      const code = b.getAttribute('data-usecoupon');
      if (ci) ci.value = code;
      applyCoupon(code);
    });
    const po = $('[data-place-order]');
    if (po) po.addEventListener('click', placeOrder);
    const tc = $('[data-track-close]');
    if (tc) tc.addEventListener('click', () => { stopTracking(); $('[data-track]').hidden = true; smoothTo(0); });
  }

  /* ────────────────────────────────────────────────────────────── ordering */
  function validateAddress() {
    const f = $('[data-address-form]');
    if (!f) return null;
    const g = n => (f.elements[n] ? String(f.elements[n].value || '').trim() : '');
    const bad = [];
    if (g('name').length < 2) bad.push('name');
    if (!/^[6-9]\d{9}$/.test(g('phone').replace(/\D/g, '').slice(-10))) bad.push('phone');
    if (state.mode === 'delivery' && g('line1').length < 6) bad.push('line1');
    $$('input,select', f).forEach(i => i.classList.remove('bad'));
    bad.forEach(n => { if (f.elements[n]) f.elements[n].classList.add('bad'); });
    if (bad.length) {
      const first = f.elements[bad[0]];
      if (first) { first.focus(); smoothTo(Math.max(0, f.getBoundingClientRect().top + window.pageYOffset - 120)); }
      toast(bad.indexOf('phone') >= 0 && bad.length === 1 ? 'That mobile number looks off' : 'A few details are missing', 'bad',
        'Check the highlighted fields');
      return null;
    }
    return {
      name: g('name'), phone: g('phone'), line1: g('line1'),
      area: g('area'), landmark: g('landmark'), notes: g('notes'),
      contactless: f.elements.contactless ? f.elements.contactless.checked : true,
      cutlery: f.elements.cutlery ? f.elements.cutlery.checked : false
    };
  }

  function placeOrder() {
    if (!cartCount()) { toast('Your bag is empty', 'bad'); return; }
    const b = bill();
    if (state.mode === 'delivery' && b.st < D.minOrder) {
      toast('Minimum delivery order is ' + rupee(D.minOrder), 'bad'); return;
    }
    const who = validateAddress();
    if (!who) return;

    const id = 'SP' + String(hash32(who.phone + Date.now()) % 100000).padStart(5, '0');
    state.order = {
      id: id, who: who, mode: state.mode, slot: state.slot, pay: state.pay,
      total: b.total, items: state.cart.slice(), placedAt: Date.now()
    };
    store('src.lastOrder', { id: id, total: b.total, at: Date.now() });

    toast('Order ' + id + ' confirmed', 'good', rupee(b.total) + ' · ' + (state.pay === 'cod' ? 'pay on delivery' : 'payment received'));
    if (hero3d) hero3d.pulse(1.4);
    startTracking();
    state.cart = [];
    state.coupon = null;
    persist();
    emit('cart');
  }

  /* ───────────────────────────────────────────────────────────── tracking */
  let trackTimers = [], bikeRaf = 0, routeLen = 0;
  function stopTracking() {
    trackTimers.forEach(clearTimeout); trackTimers = [];
    cancelAnimationFrame(bikeRaf);
  }
  function setRoute(p) {
    const path = $('[data-route-path]'), fill = $('[data-route-fill]'), bike = $('[data-route-bike]');
    if (!path || !fill || !bike || !path.getTotalLength) return;
    if (!routeLen) routeLen = path.getTotalLength();
    fill.style.strokeDasharray = routeLen;
    fill.style.strokeDashoffset = routeLen * (1 - p);
    const pt = path.getPointAtLength(routeLen * clamp(p, 0, 1));
    bike.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')');
  }
  function animRoute(from, to, ms) {
    cancelAnimationFrame(bikeRaf);
    if (reduced) { setRoute(to); return; }
    const t0 = performance.now();
    (function step(t) {
      const k = clamp((t - t0) / ms, 0, 1);
      const e = 1 - Math.pow(1 - k, 3);
      setRoute(from + (to - from) * e);
      if (k < 1) bikeRaf = requestAnimationFrame(step);
    })(t0);
  }

  function startTracking() {
    const wrap = $('[data-track]');
    if (!wrap || !state.order) return;
    stopTracking();
    routeLen = 0;
    wrap.hidden = false;

    const o = state.order;
    $('[data-track-id]').textContent = o.id;
    const etaMins = o.slot === 'rush' ? 20 : o.mode === 'drive' ? 12 : o.mode === 'dinein' ? 15 : D.etaMin;
    $('[data-track-eta]').textContent = fmtMin(minutesNow() + etaMins);

    const steps = SRC.TRACK_STEPS;
    $('[data-track-steps]').innerHTML = steps.map((s, i) =>
      '<li data-step="' + s.id + '"><i>' + (i + 1) + '</i><div><b>' + esc(s.title) + '</b><small>' + esc(s.note) + '</small></div><em></em></li>'
    ).join('');

    smoothTo(Math.max(0, wrap.getBoundingClientRect().top + window.pageYOffset - 70));

    const total = reduced ? 4000 : 21000;
    const per = total / (steps.length - 1);
    steps.forEach((s, i) => {
      trackTimers.push(setTimeout(() => {
        const li = $('[data-step="' + s.id + '"]');
        $$('[data-track-steps] li').forEach((n, j) => {
          n.classList.toggle('is-done', j < i);
          n.classList.toggle('is-now', j === i);
        });
        if (li) li.classList.add('is-done');
        if (i === steps.length - 1) $$('[data-track-steps] li').forEach(n => { n.classList.add('is-done'); n.classList.remove('is-now'); });
        $('[data-track-state]').textContent =
          i < 2 ? 'in the queue' : i < 4 ? 'on the fire' : i < 5 ? 'sealed and moving' : 'at your door';
        $('[data-track-note]').textContent = s.note;
        animRoute(Math.max(0, (i - 1) / (steps.length - 1)), i / (steps.length - 1), per * 0.9);
        if (i === steps.length - 1) {
          toast('Delivered — enjoy!', 'good', 'Order ' + o.id);
          const em = $('[data-track-eta]'); if (em) em.textContent = 'Delivered';
        }
      }, i * per));
    });
    setRoute(0);
  }

  /* ══════════════════════════════════════════════════════════════─ HOME  */
  function buildServices() {
    const w = $('[data-services]');
    if (!w) return;
    w.innerHTML = SRC.SERVICES.map((s, i) =>
      '<article class="svcard" data-reveal style="--i:' + i + '" tabindex="0">' +
        '<div class="svcard__in">' +
          '<div class="svcard__f svcard__f--front"><span class="svcard__ic" aria-hidden="true">' + s.icon + '</span><h3>' + esc(s.title) + '</h3><p>' + esc(s.line) + '</p><i class="svcard__hint">tap to turn</i></div>' +
          '<div class="svcard__f svcard__f--back"><p>' + esc(s.back) + '</p>' +
            (s.id === 'reserve' ? '<a class="linky" href="#reserve" data-jump="reserve">Book a table →</a>' :
             s.id === 'order-online' ? '<a class="linky" href="#/menu" data-link="menu">See the menu →</a>' :
             s.id === 'no-contact' ? '<a class="linky" href="#/delivery" data-link="delivery">Order delivery →</a>' :
             '<a class="linky" href="#visit" data-jump="visit">How to find us →</a>') +
          '</div>' +
        '</div>' +
      '</article>'
    ).join('');
    w.addEventListener('click', e => {
      const c = e.target.closest('.svcard');
      if (c && !e.target.closest('a')) c.classList.toggle('is-flipped');
    });
    w.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const c = e.target.closest('.svcard');
      if (c) { e.preventDefault(); c.classList.toggle('is-flipped'); }
    });
  }

  function buildTicker() {
    const t = $('[data-ticker]');
    if (!t) return;
    const picks = MENU.filter(m => (m.tags || []).indexOf('bestseller') >= 0).map(m => m.name);
    const words = picks.length ? picks : MENU.slice(0, 12).map(m => m.name);
    const one = words.map(w => '<span>' + esc(w) + '</span><i>✦</i>').join('');
    t.innerHTML = one + one;
  }

  function buildJourney() {
    const w = $('[data-journey]');
    if (!w) return;
    w.innerHTML = SRC.JOURNEY.map(j =>
      '<article class="jstep" data-reveal><span class="jstep__n">' + j.n + '</span><h3>' + esc(j.title) + '</h3><p>' + esc(j.body) + '</p></article>'
    ).join('');
  }

  function buildGallery() {
    const w = $('[data-gallery]');
    if (!w) return;
    w.innerHTML = SRC.GALLERY.map((g, i) =>
      '<figure class="gtile tilt" data-tilt data-reveal style="--i:' + i + '">' +
        '<div class="gtile__art">' + art(g.art, g.caption) + '</div>' +
        '<figcaption>' + esc(g.caption) + '</figcaption>' +
      '</figure>'
    ).join('');
  }

  function buildStarBars() {
    const w = $('[data-star-bars]');
    if (!w) return;
    const sp = B.starSplit, tot = B.reviews;
    w.innerHTML = [5, 4, 3, 2, 1].map(k => {
      const n = sp[k] || 0, p = (n / tot * 100);
      return '<div class="bar" data-reveal><span>' + k + '★</span>' +
        '<div class="bar__t"><i style="--w:' + p.toFixed(1) + '%"></i></div>' +
        '<b>' + n.toLocaleString('en-IN') + '</b></div>';
    }).join('');
  }

  function buildHours() {
    const w = $('[data-hours-list]');
    if (!w) return;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    w.innerHTML = days.map((d, i) =>
      '<li' + (i === today ? ' class="is-today"' : '') + '><span>' + d + (i === today ? ' <i>today</i>' : '') + '</span><b>' + B.hours.label + '</b></li>'
    ).join('');
  }

  function buildFaq() {
    const w = $('[data-faq]');
    if (!w) return;
    w.innerHTML = SRC.FAQ.map((f, i) =>
      '<div class="qa" data-reveal>' +
        '<button class="qa__q" aria-expanded="false" data-qa="' + i + '"><span>' + esc(f.q) + '</span><i aria-hidden="true"></i></button>' +
        '<div class="qa__a" style="height:0"><p>' + esc(f.a) + '</p></div>' +
      '</div>'
    ).join('');
    w.addEventListener('click', e => {
      const b = e.target.closest('.qa__q');
      if (!b) return;
      const qa = b.parentElement, panel = qa.querySelector('.qa__a');
      const open = qa.classList.contains('is-open');
      $$('.qa.is-open', w).forEach(o => {
        o.classList.remove('is-open');
        o.querySelector('.qa__a').style.height = '0px';
        o.querySelector('.qa__q').setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        qa.classList.add('is-open');
        panel.style.height = panel.scrollHeight + 'px';
        b.setAttribute('aria-expanded', 'true');
      }
    });
  }

  function buildFooterCats() {
    const w = $('[data-foot-cats]');
    if (!w) return;
    w.innerHTML = CATS.slice(0, 8).map(c =>
      '<li><a href="#/menu" data-link="menu" data-gocat="' + c.id + '">' + esc(c.label) + '</a></li>'
    ).join('') + '<li><a href="#/menu" data-link="menu"><b>All 68 dishes →</b></a></li>';
    w.addEventListener('click', e => {
      const a = e.target.closest('[data-gocat]');
      if (a) set({ cat: a.getAttribute('data-gocat') }, ['menu']);
    });
  }

  function buildPickCard() {
    const wrap = $('[data-pick-card]');
    if (!wrap) return;
    const pool = MENU.filter(m => (m.tags || []).indexOf('chefs') >= 0);
    const list = pool.length ? pool : MENU;
    const pick = list[new Date().getDate() % list.length];
    $('[data-pick-art]').innerHTML = art(pick.art, pick.name);
    $('[data-pick-name]').textContent = pick.name;
    $('[data-pick-desc]').textContent = pick.desc;
    $('[data-pick-price]').innerHTML = rupee(pick.price) + ' <small>· ★ ' + pick.rating.toFixed(1) + '</small>';
    const add = $('[data-pick-add]');
    if (add) add.addEventListener('click', () => addToCart(pick.id));
  }

  function buildMaps() {
    $$('[data-maps-link]').forEach(a => { a.href = B.mapsUrl; });
    $$('[data-call-link]').forEach(a => { a.href = tel(); a.title = B.phone; });
    const load = $('[data-map-load]'), live = $('[data-map-live]'), artBox = $('[data-map-art]');
    if (!load) return;
    load.addEventListener('click', () => {
      live.hidden = false;
      live.innerHTML = '<iframe title="Google map showing Special\'s Restro & Cafe on Airport Road, Jamnagar" ' +
        'src="' + B.mapsEmbed + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
      artBox.classList.add('is-hidden');
      requestAnimationFrame(() => live.classList.add('in'));
    });
  }

  /* ─────────────────────────────────────────────────── reviews carousel */
  function buildReviews() {
    const track = $('[data-review-track]'), dots = $('[data-rev-dots]');
    if (!track) return;
    const R = SRC.REVIEWS;
    track.innerHTML = R.map(r =>
      '<article class="rev">' +
        '<div class="rev__stars" aria-label="' + r.stars + ' out of 5">' + '★'.repeat(r.stars) + '<span>' + '★'.repeat(5 - r.stars) + '</span></div>' +
        '<blockquote>' + esc(r.text) + '</blockquote>' +
        '<footer><span class="rev__av" aria-hidden="true">' + esc(r.name.charAt(0)) + '</span><div><b>' + esc(r.name) + '</b><small>' + esc(r.when) + ' · Google review</small></div></footer>' +
      '</article>'
    ).join('');
    if (dots) dots.innerHTML = R.map((_, i) => '<button data-revdot="' + i + '"' + (i ? '' : ' class="is-on"') + ' aria-label="Review ' + (i + 1) + '"></button>').join('');

    let idx = 0, timer = 0;
    function goTo(i) {
      idx = (i + R.length) % R.length;
      track.style.transform = 'translate3d(' + (-idx * 100) + '%,0,0)';
      $$('[data-revdot]').forEach((d, j) => d.classList.toggle('is-on', j === idx));
    }
    function auto() { clearInterval(timer); if (!reduced) timer = setInterval(() => goTo(idx + 1), 6500); }
    const p = $('[data-rev-prev]'), n = $('[data-rev-next]');
    if (p) p.addEventListener('click', () => { goTo(idx - 1); auto(); });
    if (n) n.addEventListener('click', () => { goTo(idx + 1); auto(); });
    if (dots) dots.addEventListener('click', e => {
      const b = e.target.closest('[data-revdot]');
      if (b) { goTo(+b.getAttribute('data-revdot')); auto(); }
    });
    const host = $('[data-reviews]');
    host.addEventListener('pointerenter', () => clearInterval(timer));
    host.addEventListener('pointerleave', auto);
    goTo(0); auto();
  }

  /* ───────────────────────────────────────────── 3D coverflow carousel */
  function buildFlow() {
    const stage = $('[data-flow-stage]'), dots = $('[data-flow-dots]'), host = $('[data-flow]');
    if (!stage) return;
    const picks = MENU.filter(m => (m.tags || []).indexOf('bestseller') >= 0)
      .sort((a, b2) => (b2.votes * b2.rating) - (a.votes * a.rating)).slice(0, 9);
    const list = picks.length ? picks : MENU.slice(0, 9);

    stage.innerHTML = list.map((it, i) =>
      '<article class="fcard" data-fi="' + i + '" data-dish="' + it.id + '" tabindex="-1">' +
        '<div class="fcard__art" data-art-id="' + it.id + '"></div>' +
        '<div class="fcard__body">' +
          '<span class="fcard__cat">' + cat(it.cat).icon + ' ' + esc(cat(it.cat).label) + '</span>' +
          '<h3>' + esc(it.name) + '</h3>' +
          '<p>' + esc(it.desc) + '</p>' +
          '<div class="fcard__foot"><b>' + rupee(it.price) + '</b><span class="score">★ ' + it.rating.toFixed(1) + ' · ' + it.votes + '</span>' +
          '<button class="btn btn--primary btn--sm" data-add="' + it.id + '">Add</button></div>' +
        '</div>' +
      '</article>'
    ).join('');
    lazyArt(stage);
    if (dots) dots.innerHTML = list.map((_, i) => '<button data-fdot="' + i + '"' + (i ? '' : ' class="is-on"') + ' aria-label="Dish ' + (i + 1) + '"></button>').join('');

    const cards = $$('.fcard', stage);
    let idx = 0, drag = null;

    function layout(offset) {
      offset = offset || 0;
      cards.forEach((c, i) => {
        const d = i - idx + offset;
        const ad = Math.abs(d);
        const x = d * 30;
        const z = -ad * 190;
        const ry = clamp(-d * 26, -46, 46);
        c.style.transform = 'translate3d(' + x + '%,' + (ad * 1.4) + '%,' + z + 'px) rotateY(' + ry + 'deg) scale(' + (1 - ad * 0.06) + ')';
        c.style.opacity = ad > 3 ? 0 : (1 - ad * 0.22);
        c.style.zIndex = 50 - Math.round(ad * 10);
        c.style.pointerEvents = ad < 0.5 ? 'auto' : 'none';
        c.classList.toggle('is-front', Math.abs(d) < 0.5);
      });
      $$('[data-fdot]').forEach((b, i) => b.classList.toggle('is-on', i === idx));
    }
    function go(i) { idx = clamp(i, 0, cards.length - 1); layout(0); }

    const pv = $('[data-flow-prev]'), nx = $('[data-flow-next]');
    if (pv) pv.addEventListener('click', () => go(idx - 1));
    if (nx) nx.addEventListener('click', () => go(idx + 1));
    if (dots) dots.addEventListener('click', e => {
      const b = e.target.closest('[data-fdot]');
      if (b) go(+b.getAttribute('data-fdot'));
    });
    host.setAttribute('tabindex', '0');
    host.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); }
    });
    stage.addEventListener('pointerdown', e => {
      if (e.target.closest('button')) return;
      drag = { x: e.clientX, id: e.pointerId };
      stage.classList.add('is-drag');
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    });
    stage.addEventListener('pointermove', e => {
      if (!drag) return;
      layout(-(e.clientX - drag.x) / 260);
    });
    function endDrag(e) {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      drag = null;
      stage.classList.remove('is-drag');
      if (Math.abs(dx) > 60) go(idx + (dx < 0 ? 1 : -1)); else layout(0);
    }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) + 4) { e.preventDefault(); go(idx + (e.deltaX > 0 ? 1 : -1)); }
    }, { passive: false });

    layout(0);
  }

  /* ═════════════════════════════════════════════════════ reserve a table */
  function buildReserve() {
    const f = $('[data-reserve-form]');
    if (!f) return;
    const times = $('[data-resv-times]'), guests = $('[data-resv-guests]');
    const out = [];
    for (let m = B.hours.openMin + 60; m <= 23 * 60 + 30; m += 30) out.push(fmtMin(m));
    times.innerHTML = out.map(t => '<option' + (t === '8:00 pm' ? ' selected' : '') + '>' + t + '</option>').join('');
    let g = '';
    for (let i = 1; i <= 20; i++) g += '<option value="' + i + '"' + (i === 2 ? ' selected' : '') + '>' + i + (i === 1 ? ' guest' : ' guests') + (i === 20 ? '+' : '') + '</option>';
    guests.innerHTML = g;

    const d = new Date();
    f.elements.date.value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    f.elements.date.min = f.elements.date.value;

    const avail = $('[data-resv-avail]');
    function paintAvail() {
      const key = f.elements.date.value + times.value + f.elements.area.value;
      const h = hash32(key);
      const left = 2 + (h % 7);
      const busy = (h % 10) > 6;
      avail.className = 'resv__avail ' + (busy ? 'is-busy' : 'is-free');
      avail.innerHTML = busy
        ? '<b>Filling fast</b> — only <b>' + left + '</b> table' + (left === 1 ? '' : 's') + ' left in ' + esc(f.elements.area.value) + ' at ' + esc(times.value) + '.'
        : '<b>Plenty of room</b> — ' + left + ' tables free in ' + esc(f.elements.area.value) + ' at ' + esc(times.value) + '.';
    }
    ['change', 'input'].forEach(ev => f.addEventListener(ev, paintAvail));
    paintAvail();

    f.addEventListener('submit', e => {
      e.preventDefault();
      const name = f.elements.name.value.trim();
      const phone = f.elements.phone.value.replace(/\D/g, '').slice(-10);
      $$('input,select', f).forEach(i => i.classList.remove('bad'));
      let bad = false;
      if (name.length < 2) { f.elements.name.classList.add('bad'); bad = true; }
      if (!/^[6-9]\d{9}$/.test(phone)) { f.elements.phone.classList.add('bad'); bad = true; }
      if (!f.elements.date.value) { f.elements.date.classList.add('bad'); bad = true; }
      if (bad) { toast('Check the highlighted fields', 'bad'); return; }

      const code = 'SP-' + String(hash32(name + phone + f.elements.date.value) % 9000 + 1000);
      const done = $('[data-resv-done]');
      done.hidden = false;
      done.innerHTML = '<div class="resv__ok">' +
        '<span class="resv__tick" aria-hidden="true">✓</span>' +
        '<h4>Table held for ' + esc(name.split(' ')[0]) + '</h4>' +
        '<p>' + esc(f.elements.guests.value) + ' guests · ' + esc(f.elements.date.value) + ' at ' + esc(times.value) + ' · ' + esc(f.elements.area.value) + '</p>' +
        '<p class="mono">Booking ' + code + '</p>' +
        '<small>We will call ' + esc(phone.replace(/(\d{5})(\d{5})/, '$1 $2')) + ' if anything changes. Reservation is held 20 minutes past the slot.</small>' +
        '</div>';
      requestAnimationFrame(() => done.classList.add('in'));
      toast('Table reserved · ' + code, 'good', f.elements.date.value + ' at ' + times.value);
      if (hero3d) hero3d.pulse(1.1);
      smoothTo(Math.max(0, done.getBoundingClientRect().top + window.pageYOffset - 160));
    });
  }

  /* ══════════════════════════════════════════════════════════════ MOTION */
  /* ── reveals: our own IntersectionObserver so it never depends on GSAP */
  const revealIO = ('IntersectionObserver' in window) ? new IntersectionObserver(es => {
    es.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      revealIO.unobserve(en.target);
      if (en.target.hasAttribute('data-count')) runCounter(en.target);
      $$('[data-count]', en.target).forEach(runCounter);
      $$('.bar__t i', en.target).forEach(i => { i.style.width = i.style.getPropertyValue('--w'); });
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;

  function revealScan(root) {
    $$('[data-reveal]', root || document).forEach(el => {
      if (el.classList.contains('in')) return;
      if (revealIO) revealIO.observe(el); else el.classList.add('in');
    });
    $$('[data-count]', root || document).forEach(el => {
      if (el.dataset.counted) return;
      if (revealIO) revealIO.observe(el); else runCounter(el);
    });
  }

  function runCounter(el) {
    if (!el || el.dataset.counted) return;
    el.dataset.counted = '1';
    const to = parseFloat(el.getAttribute('data-count'));
    if (isNaN(to)) return;
    const dec = +(el.getAttribute('data-dec') || 0);
    if (reduced) { el.textContent = dec ? to.toFixed(dec) : to.toLocaleString('en-IN'); return; }
    const dur = 1100, t0 = performance.now();
    (function step(t) {
      const k = clamp((t - t0) / dur, 0, 1);
      const e = 1 - Math.pow(1 - k, 3);
      const v = to * e;
      el.textContent = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN');
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ── 3D tilt */
  function initTilt() {
    if (reduced || matchMedia('(hover: none)').matches) return;
    document.addEventListener('pointermove', e => {
      const c = e.target.closest && e.target.closest('[data-tilt]');
      if (!c) return;
      const r = c.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      c.style.setProperty('--rx', (-py * 12).toFixed(2) + 'deg');
      c.style.setProperty('--ry', (px * 14).toFixed(2) + 'deg');
      c.style.setProperty('--mx', ((px + 0.5) * 100).toFixed(1) + '%');
      c.style.setProperty('--my', ((py + 0.5) * 100).toFixed(1) + '%');
      c.classList.add('tilting');
    }, { passive: true });
    document.addEventListener('pointerout', e => {
      const c = e.target.closest && e.target.closest('[data-tilt]');
      if (!c) return;
      c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg');
      c.classList.remove('tilting');
    }, { passive: true });
  }

  /* ── magnetic buttons */
  function initMagnetic() {
    if (reduced || matchMedia('(hover: none)').matches) return;
    $$('[data-magnetic]').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--tx', ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + 'px');
        b.style.setProperty('--ty', ((e.clientY - r.top - r.height / 2) * 0.24).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', () => {
        b.style.setProperty('--tx', '0px'); b.style.setProperty('--ty', '0px');
      });
    });
  }

  /* ── custom cursor */
  function initCursor() {
    const c = $('[data-cursor]');
    if (!c || reduced || matchMedia('(hover: none)').matches) return;
    html.classList.add('has-cursor');
    const dot = c.querySelector('b'), ring = c.querySelector('s');
    let tx = innerWidth / 2, ty = innerHeight / 2, rx = tx, ry = ty;
    document.addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      dot.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)';
      const hot = e.target.closest && e.target.closest('a,button,[data-dish],[role="button"],input,select');
      c.classList.toggle('is-hot', !!hot);
    }, { passive: true });
    (function loop() {
      rx += (tx - rx) * 0.16; ry += (ty - ry) * 0.16;
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerdown', () => c.classList.add('is-down'));
    document.addEventListener('pointerup', () => c.classList.remove('is-down'));
  }

  /* ── scroll-linked bits: progress bar, nav shrink, journey fill, hero 3D */
  let hero3d = null;
  function initScrollFx() {
    const bar = $('[data-scroll-bar]');
    const nav = $('[data-nav]');
    const jFill = $('[data-journey-fill]');
    const jWrap = $('.journey');
    const heroEl = $('[data-hero]');
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.pageYOffset || html.scrollTop;
        const max = Math.max(1, html.scrollHeight - innerHeight);
        if (bar) bar.style.transform = 'scaleX(' + (y / max).toFixed(4) + ')';
        if (nav) nav.classList.toggle('is-stuck', y > 24);

        if (heroEl && hero3d && state.page === 'home') {
          const hr = heroEl.getBoundingClientRect();
          hero3d.setScroll(clamp(-hr.top / Math.max(1, hr.height), 0, 1));
        }
        if (jFill && jWrap) {
          const r = jWrap.getBoundingClientRect();
          const p = clamp((innerHeight * 0.72 - r.top) / Math.max(1, r.height * 0.86), 0, 1);
          jFill.style.transform = 'scaleY(' + p.toFixed(3) + ')';
        }
        $$('[data-par]').forEach(el => {
          const r = el.getBoundingClientRect();
          const k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
          el.style.setProperty('--py', (k * -(+el.getAttribute('data-par') || 0.2) * 100).toFixed(1) + 'px');
        });
      });
    }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();
  }

  /* ── smooth scroll (Lenis when present, native otherwise) */
  let lenis = null;
  function initLenis() {
    if (reduced || !window.Lenis) return;
    try {
      lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
      function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      html.classList.add('lenis-on');
      if (window.ScrollTrigger) {
        lenis.on('scroll', window.ScrollTrigger.update);
      }
    } catch (e) { lenis = null; }
  }
  function smoothTo(y) {
    if (lenis) { lenis.scrollTo(y, { duration: 1.0 }); return; }
    try { window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' }); }
    catch (e) { window.scrollTo(0, y); }
  }

  /* ── GSAP flourishes (enhancement only) */
  function initGsap() {
    if (reduced || !window.gsap) return;
    const g = window.gsap;
    try {
      if (window.ScrollTrigger) g.registerPlugin(window.ScrollTrigger);

      g.set('.hero__title .ln span', { yPercent: 116, opacity: 0 });
      g.to('.hero__title .ln span', {
        yPercent: 0, opacity: 1, duration: 1.15, ease: 'expo.out', stagger: 0.11, delay: 0.15
      });
      g.from('.hero__sub, .ratebar, .hero__cta, .hero__chips, .pills', {
        y: 26, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.5
      });
      g.from('.pickcard', { y: 46, opacity: 0, rotateY: -14, duration: 1.2, ease: 'power3.out', delay: 0.62 });

      if (window.ScrollTrigger) {
        g.utils.toArray('.sec__head .h2').forEach(h => {
          g.from(h, {
            y: 34, opacity: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: h, start: 'top 88%' }
          });
        });
        g.to('.hero__inner', {
          yPercent: -14, opacity: 0.25, ease: 'none',
          scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true }
        });
        g.ticker.lagSmoothing(0);
      }
    } catch (e) { /* GSAP is optional */ }
  }

  function initHero3d() {
    const cv = $('[data-hero-canvas]');
    if (!cv || !SRC.Hero3D) return;
    hero3d = SRC.Hero3D.init(cv);
    const heroEl = $('[data-hero]');
    if (heroEl) heroEl.classList.toggle('has-3d', !!hero3d);
    if (hero3d) {
      /* clicking the canvas gives the scene a shove */
      cv.addEventListener('pointerdown', () => hero3d.pulse(1.0));
    }
  }

  /* ══════════════════════════════════════════════════════════════ ROUTER */
  const PAGES = ['home', 'menu', 'delivery'];
  const curtain = $('[data-curtain]');
  let routing = false;

  function pageFromHash() {
    const h = (location.hash || '').replace(/^#\/?/, '').split('?')[0];
    return PAGES.indexOf(h) >= 0 ? h : 'home';
  }

  function swap(page) {
    /* scoped to .page so the `data-page` mirror on <html> isn't matched */
    $$('.page[data-page]').forEach(s => s.classList.toggle('is-active', s.getAttribute('data-page') === page));
    $$('[data-link]').forEach(a => a.classList.toggle('is-current', a.getAttribute('data-link') === page));
    state.page = page;
    html.setAttribute('data-page', page);
    document.title = (page === 'menu' ? 'Full menu · 68 dishes — ' : page === 'delivery' ? 'Home delivery — ' : '') +
      "Special's Restro & Cafe, Jamnagar";
    if (page === 'menu') { buildCatRail(); emit('menu'); }
    if (page === 'delivery') { paintModes(); paintSlots(); paintCouponHints(); emit('bill'); }
    revealScan(document);
    lazyArt(document);
    renderCart();
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    if (window.ScrollTrigger) { try { window.ScrollTrigger.refresh(); } catch (e) {} }
  }

  function route(first) {
    const page = pageFromHash();
    if (!first && page === state.page) return;
    if (first || reduced || !curtain) { swap(page); return; }
    if (routing) { swap(page); return; }
    routing = true;
    curtain.classList.add('is-in');
    setTimeout(() => {
      swap(page);
      curtain.classList.remove('is-in');
      curtain.classList.add('is-out');
      setTimeout(() => { curtain.classList.remove('is-out'); routing = false; }, 620);
    }, 430);
  }

  addEventListener('hashchange', () => route(false));

  /* internal links */
  document.addEventListener('click', e => {
    const jump = e.target.closest('[data-jump]');
    if (jump) {
      e.preventDefault();
      const id = jump.getAttribute('data-jump');
      const doJump = () => {
        const t = document.getElementById(id);
        if (t) smoothTo(Math.max(0, t.getBoundingClientRect().top + window.pageYOffset - 74));
      };
      toggleBurger(false);
      if (state.page !== 'home') { location.hash = '#/home'; setTimeout(doJump, 620); }
      else doJump();
      return;
    }
    const link = e.target.closest('[data-link]');
    if (link) {
      toggleBurger(false);
      if (cartEl && cartEl.classList.contains('in')) openCart(false);
      const p = link.getAttribute('data-link');
      if (('#/' + p) === location.hash) { e.preventDefault(); smoothTo(0); }
      /* otherwise let the hash change drive the router */
    }
  });

  /* ═══════════════════════════════════════════════════════════ nav / misc */
  function toggleBurger(v) {
    const b = $('[data-burger]');
    const open = v === undefined ? !html.classList.contains('nav-open') : v;
    html.classList.toggle('nav-open', open);
    if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function wireChrome() {
    const b = $('[data-burger]');
    if (b) b.addEventListener('click', () => toggleBurger());
    const co = $('[data-cart-open]'); if (co) co.addEventListener('click', () => openCart(true));
    const cc = $('[data-cart-close]'); if (cc) cc.addEventListener('click', () => openCart(false));
    if (scrim) scrim.addEventListener('click', () => {
      if (modal && !modal.hidden) closeItem();
      openCart(false);
    });
    const cl = $('[data-cart-clear]'); if (cl) cl.addEventListener('click', clearCart);
    const chk = $('[data-cart-checkout]'); if (chk) chk.addEventListener('click', () => openCart(false));
    const y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();
  }

  /* ══════════════════════════════════════════════════════════════── boot */
  function boot() {
    wireChrome();
    buildServices();
    buildTicker();
    buildJourney();
    buildGallery();
    buildStarBars();
    buildHours();
    buildFaq();
    buildFooterCats();
    buildPickCard();
    buildMaps();
    buildReviews();
    buildFlow();
    buildReserve();

    buildCatRail();
    wireMenuTools();
    buildAreas();
    buildSchedTimes();
    paintModes();
    paintSlots();
    paintCouponHints();
    wireDelivery();

    paintStatus();
    setInterval(paintStatus, 30000);

    initTilt();
    initMagnetic();
    initCursor();
    initLenis();
    initScrollFx();
    initHero3d();
    initGsap();

    route(true);
    revealScan(document);
    lazyArt(document);
    renderCart();

    if (state.cart.length) {
      toast('Welcome back', 'info', cartCount() + ' item' + (cartCount() === 1 ? '' : 's') + ' still in your bag');
    }
    html.classList.add('ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* expose a small console handle for tinkering */
  window.SPECIALS = {
    state: state, add: addToCart, bill: bill, toast: toast,
    go: p => { location.hash = '#/' + p; }
  };
})();
