'use strict';
// DATA
const ICONS = {
  back: '<path d="M15 5l-7 7 7 7"/>', heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z"/>',
  bell: '<path d="M6 16v-5a6 6 0 0112 0v5l2 2H4zM10 20h4"/>', search: '<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', check: '<path d="M5 12l5 5 9-10"/>',
  pin: '<path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'
};
const ic = n => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
const art = (em, hue) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},70%,90%)"/><stop offset="1" stop-color="hsl(${hue},55%,72%)"/></linearGradient></defs><rect width="200" height="200" fill="url(#g)"/><text x="100" y="128" font-size="96" text-anchor="middle">${em}</text></svg>`);
const SAUCES = [{ name: 'Teriyaki', price: 0 }, { name: 'Yakiniku', price: 0 }];
const TOPPINGS = [{ name: 'Omelet', price: 2 }, { name: 'Sausage', price: 3 }, { name: 'Cheese', price: 5 }];
const mk = (id, name, cats, price, em, hue, description) => ({ id, name, category: cats[0], cats, price, image: `images/${id}.jpg`, fallback: art(em, hue), description, sauces: SAUCES, toppings: TOPPINGS });
const PRODUCTS = [
  mk(1, 'Squid Sweet and Sour Salad', ['Featured', 'Seafood'], 19.99, '🦑', 150, 'Crisp greens with tender squid in a tangy sweet-and-sour dressing.'),
  mk(2, 'Black Pepper Beef Lumpia', ['Top of Week', 'Asian'], 27.12, '🥟', 20, 'Crunchy rolls filled with peppery beef and vegetables.'),
  mk(3, 'Japan Hainanese Sashimi', ['Featured', 'Japanese', 'Seafood'], 39.99, '🍣', 350, 'Fresh-cut sashimi served over fragrant Hainanese rice.'),
  mk(4, 'Hot & Sour Corn', ['Soup'], 20.99, '🌽', 45, 'Silky corn soup with a warm peppery kick.'),
  mk(5, 'Hongkong Hainanese', ['Asian'], 14.99, '🍗', 30, 'Poached chicken with ginger rice and chili sauce.'),
  mk(6, 'Singapura Hainanese', ['Featured', 'Asian'], 24.99, '🍚', 90, 'Roasted chicken, garlic rice and a light broth.'),
  mk(7, 'Chicken Teriyaki', ['Top of Week', 'Japanese'], 16.5, '🍱', 10, 'Glazed grilled chicken with rice and pickled vegetables.'),
  mk(8, 'Seafood Tom Yum', ['Soup', 'Seafood'], 22.5, '🍲', 200, 'Hot and sour broth with prawns, squid and mushrooms.'),
  mk(9, 'Grilled Garlic Prawns', ['Seafood', 'Top of Week'], 29, '🍤', 15, 'Charred prawns brushed with garlic butter.'),
  mk(10, 'Miso Ramen', ['Soup', 'Japanese', 'Top of Week'], 18.75, '🍜', 40, 'Rich miso broth, springy noodles and soft egg.')
];
const CATEGORIES = ['All', 'Featured', 'Top of Week', 'Soup', 'Seafood', 'Japanese', 'Asian', 'Favorites'];
const ADDRESSES = [
  { label: 'Home', title: 'Utama Street no. 14', line: 'Utama Street no. 14, Rumbai', dist: '2.4 km' },
  { label: 'Offices', title: 'Utama Street No.20', line: 'Dumbo Street No.20, Dumbo, New York 10001, United States of America', dist: '5.1 km' },
  { label: 'Others', title: 'Harbor Road no. 7', line: 'Harbor Road no. 7, Rumbai', dist: '3.8 km' }
];
const STAGES = ['Order Confirmed', 'Preparing Food', 'Out for Delivery', 'Delivered'];
const PAYMENTS = ['Cash', 'Credit/Debit Card', 'Online Payment'];
const SHIPPING = 2;

// Real photo missing? fall back to the emoji art
window.addEventListener('error', e => { const t = e.target; if (t.tagName !== 'IMG') return; const p = PRODUCTS.find(x => t.getAttribute('src') === x.image); if (p && t.src !== p.fallback) t.src = p.fallback; }, true);

// STATE
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };
const S = {
  cart: load('Aget.cart', []), favs: load('Aget.favs', []), dark: load('Aget.dark', false),
  addr: load('Aget.addr', ADDRESSES[0]), user: load('Aget.user', null), orders: load('Aget.orders', []),
  pay: load('Aget.pay', 'Cash'), page: 'splash', cat: 'All', q: '', D: null, flow: 'signup', pending: null, tmp: null, timer: null, mfns: []
};
const persist = () => { store('Aget.cart', S.cart); store('Aget.favs', S.favs); store('Aget.addr', S.addr); store('Aget.user', S.user); store('Aget.orders', S.orders); store('Aget.pay', S.pay); };

// DOM ELEMENTS
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app'), nav = $('#nav'), modal = $('#modal'), site = $('#site'), foot = $('#foot');
const money = n => '$' + Number(n).toFixed(2);
const byId = id => PRODUCTS.find(p => p.id === Number(id));
const NAV_PAGES = ['home', 'menu', 'cart', 'profile'];
const BARE_PAGES = ['splash', 'onb1', 'onb2', 'login', 'signup', 'otp', 'forgot', 'success'];

// NAVIGATION
function showPage(name, p = {}, push = true) {
  clearInterval(S.timer);
  if (name === 'detail') { const pr = byId(p.id); if (!pr) return showPage('home'); S.D = { id: pr.id, qty: 1, sauce: pr.sauces[0].name, tops: [] }; }
  S.page = name;
  if (push) history.pushState({ name, id: p.id }, '', '#' + name);
  render();
}
function render() {
  app.innerHTML = T[S.page]();
  app.className = 'screen s-' + S.page;
  window.scrollTo(0, 0);
  site.hidden = foot.hidden = BARE_PAGES.includes(S.page);
  document.title = 'Aget – ' + S.page.charAt(0).toUpperCase() + S.page.slice(1);
  $$('[data-nav]', nav).forEach(b => b.dataset.nav === S.page ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
  if (S.page === 'menu' || S.page === 'home') setTimeout(refreshLists, S.page === 'menu' ? 350 : 0);
  if (S.page === 'tracking') startTracking();
  updateBadge();
}
window.addEventListener('popstate', e => { closeModal(); e.state ? showPage(e.state.name, { id: e.state.id }, false) : showPage('home', {}, false); });

// PRODUCTS
function productCard(p) {
  const f = S.favs.includes(p.id);
  return `<article class="card"><button class="fav" data-act="fav" data-id="${p.id}" aria-pressed="${f}" aria-label="Toggle favorite ${p.name}">${ic('heart')}</button>
  <button class="cardbtn" data-act="open" data-id="${p.id}"><div class="im"><img src="${p.image}" alt="${p.name}" loading="lazy"></div><h3>${p.name}</h3><span class="price">${money(p.price)}</span></button></article>`;
}
function filterProducts() {
  const q = S.q.trim().toLowerCase();
  return PRODUCTS.filter(p => (S.cat === 'All' || (S.cat === 'Favorites' ? S.favs.includes(p.id) : p.cats.includes(S.cat))) && p.name.toLowerCase().includes(q));
}
function refreshLists() {
  const grid = $('#grid'), top = $('#topweek');
  if (grid) { const l = filterProducts(); grid.innerHTML = l.length ? l.map(productCard).join('') : '<p class="empty">No food found</p>'; }
  if (top) {
    const q = S.q.trim().toLowerCase();
    const l = PRODUCTS.filter(p => q ? p.name.toLowerCase().includes(q) : p.cats.includes('Top of Week'));
    top.innerHTML = l.length ? l.map(productCard).join('') : '<p class="empty">No food found</p>';
  }
}

// CART
function addToCart(id, opt = {}) {
  const p = byId(id), sauce = opt.sauce || p.sauces[0].name, tops = [...(opt.tops || [])].sort();
  const key = [id, sauce, tops.join('+')].join('|');
  const unit = p.price + tops.reduce((s, t) => s + TOPPINGS.find(x => x.name === t).price, 0);
  const ex = S.cart.find(i => i.key === key);
  if (ex) ex.qty += opt.qty || 1; else S.cart.push({ key, id, sauce, tops, unit, qty: opt.qty || 1 });
  updateCartUI(); toast('Added to cart');
}
function removeFromCart(key) { S.cart = S.cart.filter(i => i.key !== key); updateCartUI(); toast('Removed from cart'); }
function increaseQuantity(key) { const i = S.cart.find(x => x.key === key); if (i) i.qty++; updateCartUI(true); }
function decreaseQuantity(key) { const i = S.cart.find(x => x.key === key); if (i && i.qty > 1) i.qty--; updateCartUI(true); }
const calculateSubtotal = () => S.cart.reduce((s, i) => s + i.unit * i.qty, 0);
const calculateShipping = () => (S.cart.length ? SHIPPING : 0);
const calculateTotal = () => calculateSubtotal() + calculateShipping();
function updateCartUI(bump) {
  persist(); updateBadge();
  if (S.page === 'cart') { const y = window.scrollY; render(); window.scrollTo(0, y); if (bump) $$('.qty output', app).forEach(o => o.classList.add('bump')); }
}
function updateBadge() {
  const n = S.cart.reduce((s, i) => s + i.qty, 0), b = $('#badge');
  b.textContent = n; b.hidden = !n;
}
const itemMeta = i => `${i.sauce}${i.tops.length ? ' + ' + i.tops.join(', ') : ''}`;
const totalsHTML = (sub, ship, tot) => `<div class="row"><span class="muted">Subtotal</span><span>${money(sub)}</span></div><div class="row"><span class="muted">Shipping</span><span>${money(ship)}</span></div><div class="row total"><span>Total Payment</span><span>${money(tot)}</span></div>`;
function detailTotal() {
  const p = byId(S.D.id);
  return (p.price + S.D.tops.reduce((s, t) => s + TOPPINGS.find(x => x.name === t).price, 0)) * S.D.qty;
}
function updateDetail() {
  $('#dq').textContent = S.D.qty; $('#dminus').disabled = S.D.qty <= 1;
  $('#dcta').textContent = `Add to Cart (${money(detailTotal())})`;
}

// FAVORITES
function toggleFav(id) {
  const on = S.favs.includes(id);
  S.favs = on ? S.favs.filter(x => x !== id) : [...S.favs, id];
  persist(); toast(on ? 'Removed from favorites' : 'Added to favorites');
  $$(`[data-act=fav][data-id="${id}"]`).forEach(b => { b.setAttribute('aria-pressed', !on); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); });
  if (S.page === 'menu' && S.cat === 'Favorites') refreshLists();
}

// SEARCH
document.addEventListener('input', e => {
  const t = e.target;
  if (t.matches('[data-search]')) { S.q = t.value; refreshLists(); }
  if (t.matches('.otp input')) {
    t.value = t.value.replace(/\D/g, '').slice(-1);
    if (t.value && t.nextElementSibling) t.nextElementSibling.focus();
  }
});

// AUTH
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const setErr = (form, name, msg) => { const el = $(`[data-err="${name}"]`, form); if (el) el.textContent = msg || ''; return !msg; };
const maskEmail = e => e ? e.replace(/^(.).*(@.*)$/, '$1•••••$2') : 'a•••••@mail.com';
function checkFields(f, rules) {
  return rules.map(([n, ok, msg]) => setErr(f, n, ok(f.elements[n].value.trim()) ? '' : msg)).every(Boolean);
}
const FORMS = {
  login(f) {
    if (!checkFields(f, [['email', v => EMAIL_RE.test(v), 'Enter a valid email address'], ['password', v => v.length >= 6, 'Password must be at least 6 characters']])) return;
    S.user = { name: f.elements.email.value.split('@')[0], email: f.elements.email.value.trim() };
    persist(); toast('Welcome back!'); showPage('home');
  },
  signup(f) {
    if (!checkFields(f, [['name', v => v.length >= 2, 'Enter your name'], ['email', v => EMAIL_RE.test(v), 'Enter a valid email address'], ['password', v => v.length >= 6, 'Password must be at least 6 characters']])) return;
    S.pending = { name: f.elements.name.value.trim(), email: f.elements.email.value.trim() };
    S.flow = 'signup'; showPage('otp');
  },
  otp(f) {
    const code = $$('.otp input', f).map(i => i.value).join('');
    if (code.length < 4) return setErr(f, 'otp', 'Enter the 4-digit code');
    if (S.flow === 'signup') showPage('success');
    else { toast('Reset link sent'); showPage('login'); }
  },
  forgot() { S.flow = 'reset'; S.pending = { email: 'sara@Aget.com' }; showPage('otp'); }
};
document.addEventListener('submit', e => { e.preventDefault(); FORMS[e.target.dataset.form]?.(e.target); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Backspace' && e.target.matches('.otp input') && !e.target.value && e.target.previousElementSibling) e.target.previousElementSibling.focus();
});

// CHECKOUT
function placeOrder() {
  if (!S.cart.length) return toast('Your cart is empty');
  if (!S.addr) return toast('Select a delivery address');
  if (!S.pay) return toast('Choose a payment method');
  const order = {
    id: '#' + String(Math.floor(10000000 + Math.random() * 90000000)), items: S.cart.map(i => ({ ...i })), subtotal: calculateSubtotal(), shipping: calculateShipping(),
    total: calculateTotal(), addr: S.addr, pay: S.pay, eta: '10 - 15 mins', stage: 0
  };
  S.orders.unshift(order); S.cart = []; persist(); updateBadge();
  toast('Order placed successfully'); showPage('confirm');
}
function startTracking() {
  const o = S.orders[0];
  if (!o || o.stage >= 3) return;
  S.timer = setInterval(() => { o.stage++; persist(); render(); if (o.stage >= 3) clearInterval(S.timer); }, 5000);
}

// DARK MODE
function applyTheme() { document.documentElement.dataset.theme = S.dark ? 'dark' : 'light'; store('Aget.dark', S.dark); }

// MODALS
function openModal(title, body, actions = []) {
  $('#mTitle').textContent = title; $('#mBody').innerHTML = body;
  const box = $('#mActions'); box.innerHTML = ''; S.mfns = [];
  actions.forEach(a => { const b = document.createElement('button'); b.className = 'btn ' + (a.cls || ''); b.textContent = a.label; b.onclick = () => { a.fn?.(); if (!a.keep) closeModal(); }; box.append(b); });
  modal.hidden = false; $('.iconbtn', modal).focus();
}
function closeModal() { modal.hidden = true; }
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
const pickAddress = () => openModal('Change address', ADDRESSES.map((a, i) => `<button class="rowbtn" data-act="pickAddr" data-i="${i}"><span><strong>${a.label}</strong><br><small class="muted">${a.line}</small></span>${S.addr.line === a.line ? ic('check') : ''}</button>`).join(''));
const pickPayment = () => openModal('Payment method', PAYMENTS.map(p => `<button class="rowbtn" data-act="setPay" data-v="${p}"><span>${p}</span>${S.pay === p ? ic('check') : ''}</button>`).join(''));

// TOASTS
function toast(msg) {
  const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
  $('#toasts').append(el); setTimeout(() => el.remove(), 2200);
}

// SCREENS
const field = (n, label, type, ph, val = '') => `<div class="field"><label for="${n}">${label}</label><input id="${n}" name="${n}" type="${type}" placeholder="${ph}" value="${val}" autocomplete="${n}"><span class="err" data-err="${n}" role="alert"></span></div>`;
const pwField = () => `<div class="field"><label for="password">Password</label><div class="pw"><input id="password" name="password" type="password" placeholder="Min. 6 characters" autocomplete="current-password"><button type="button" data-act="eye" aria-label="Show password">${ic('eye')}</button></div><span class="err" data-err="password" role="alert"></span></div>`;
const backBar = () => `<div class="top"><button class="iconbtn" data-act="back" aria-label="Go back">${ic('back')}</button></div>`;
const addrCard = (act = 'go" data-to="location') => `<button class="addr" data-act="${act}"><small>Delivery to ${S.addr.label}</small><strong>${S.addr.line.split(',').slice(0, 2).join(',')}</strong><small>${S.addr.dist}</small></button>`;
const searchBox = ph => `<div class="search">${ic('search')}<input type="search" data-search placeholder="${ph}" aria-label="${ph}" value="${S.q}"></div>`;
const onb = n => {
  const d = [['All your favorite foods', 'Order your favorite menu with easy, on-demand delivery', '🍜', 'Continue', 'onb2'], ['Get delivery at your doorstep', 'Your ready order will be delivered quickly by our courier', '🛵', 'Get Started', 'signup']][n - 1];
  return `<section class="onb"><div class="circle" role="img" aria-label="${d[0]}">${d[2]}</div><div class="dots"><i class="${n === 1 ? 'on' : ''}"></i><i class="${n === 2 ? 'on' : ''}"></i></div><h1>${d[0]}</h1><p class="muted">${d[1]}</p><div><button class="btn" data-act="go" data-to="${d[4]}">${d[3]}</button><button class="btn ghost" data-act="go" data-to="login">Sign in</button></div></section>`;
};
const T = {
  splash: () => '<section class="splash"><div class="logo" aria-hidden="true">🍲</div><h1>Aget</h1><p>Food Delivery</p></section>',
  onb1: () => onb(1), onb2: () => onb(2),
  login: () => `<section class="pad auth"><h1>Welcome Back 👋</h1><p class="muted">Sign in to your account</p><form data-form="login" novalidate>${field('email', 'Email', 'email', 'you@example.com')}${pwField()}
    <div class="between"><button type="button" class="link" data-act="go" data-to="forgot">Forgot Password?</button></div><button class="btn" type="submit">Login</button></form>
    <div class="social"><button class="btn ghost" data-act="social" data-v="Google">Sign in with Google</button><button class="btn ghost" data-act="social" data-v="Apple">Sign in with Apple</button></div>
    <p class="center muted">Don't have an account? <button class="link" data-act="go" data-to="signup">Sign Up</button></p></section>`,
  signup: () => `<section class="pad auth">${backBar()}<h1>Sign Up</h1><p class="muted">Create account and choose favorite menu</p><form data-form="signup" novalidate>${field('name', 'Name', 'text', 'Your name')}${field('email', 'Email', 'email', 'you@example.com')}${pwField()}
    <div class="between"></div><button class="btn" type="submit">Register</button></form><p class="center muted">Have an account? <button class="link" data-act="go" data-to="login">Sign In</button></p>
    <p class="center muted"><small>By clicking Register, you agree to our <strong>Terms</strong> and <strong>Data Policy</strong>.</small></p></section>`,
  otp: () => `<section class="pad auth">${backBar()}<h1>Verification Email</h1><p class="muted">Enter the 4-digit code we sent to ${maskEmail(S.pending?.email)}</p>
    <form data-form="otp" novalidate><div class="otp" role="group" aria-label="Verification code">${['2', '8', '5', ''].map((v, i) => `<input inputmode="numeric" maxlength="1" value="${v}" aria-label="Digit ${i + 1}" autocomplete="one-time-code">`).join('')}</div><span class="err center" data-err="otp" role="alert"></span>
    <p class="center muted">Didn't receive a code? <button type="button" class="link" data-act="resend">Resend</button></p><div class="between"></div><button class="btn" type="submit">Continue</button></form></section>`,
  forgot: () => `<section class="pad auth">${backBar()}<h1>Forgot Password</h1><p class="muted">Select which contact details should we use to reset your password</p>
    <form data-form="forgot"><div role="radiogroup" aria-label="Contact method"><button type="button" class="opt" role="radio" aria-checked="true" data-act="opt"><span class="em">✉️</span><span><strong>Email</strong><br><small class="muted">Send code to s•••@Aget.com</small></span></button>
    <button type="button" class="opt" role="radio" aria-checked="false" data-act="opt"><span class="em">📱</span><span><strong>Phone Number</strong><br><small class="muted">Send code to +1 ••• ••• 4821</small></span></button></div>
    <div class="between"></div><button class="btn" type="submit">Continue</button></form></section>`,
  success: () => `<section class="success"><div class="tick">${ic('check')}</div><h1>Congratulations!</h1><p class="muted">Your account is complete, please enjoy the best menu from us.</p><button class="btn" data-act="start">Get Started</button></section>`,
  home: () => `<section class="pad"><div class="top"><h1>Home</h1><button class="iconbtn" data-act="bell" aria-label="Notifications">${ic('bell')}</button></div>${searchBox('Search on Aget')}${addrCard()}
    <div class="promo"><div><h2>Chicken Teriyaki</h2><b>Discount 25%</b><button class="btn" data-act="open" data-id="7">Order Now</button></div><div class="art"><img src="${byId(7).image}" alt="Chicken Teriyaki"></div></div>
    <div class="sec"><h2>Top of Week</h2><button class="link" data-act="go" data-to="menu">See all</button></div><div class="hs" id="topweek"></div></section>`,
  menu: () => `<section class="pad"><div class="top"><h1>Menu</h1></div><p class="muted">Our Food</p><h2 style="font-size:24px;margin:2px 0 16px">Special For You</h2>${searchBox('Search Your Menus')}
    <div class="tabs" role="tablist">${CATEGORIES.map(c => `<button class="tab" role="tab" data-act="cat" data-c="${c}" aria-selected="${c === S.cat}">${c}</button>`).join('')}</div>
    <div class="grid" id="grid">${'<div class="skel"></div>'.repeat(4)}</div></section>`,
  detail: () => {
    const p = byId(S.D.id), f = S.favs.includes(p.id);
    return `<div class="dtop"><button class="iconbtn" data-act="back" aria-label="Go back">${ic('back')}</button><button class="iconbtn fav" style="position:static" data-act="fav" data-id="${p.id}" aria-pressed="${f}" aria-label="Toggle favorite">${ic('heart')}</button></div>
    <div class="hero"><img src="${p.image}" alt="${p.name}"></div><section class="pad"><div class="dhead"><div><h1>${p.name}</h1><p class="muted">${p.cats.includes('Japanese') ? 'Japanese' : p.category} food</p><p class="price" style="font-size:20px">${money(p.price)}</p></div>
    <div class="qty"><button id="dminus" data-act="dq" data-d="-1" aria-label="Decrease quantity" disabled>−</button><output id="dq" aria-live="polite">1</output><button data-act="dq" data-d="1" aria-label="Increase quantity">+</button></div></div>
    <p class="muted">${p.description}</p><h2 style="margin:20px 0 4px;font-size:16px">Sauce</h2>${p.sauces.map((s, i) => `<label class="choice">${s.name}<input type="radio" name="sauce" value="${s.name}" ${i === 0 ? 'checked' : ''}></label>`).join('')}
    <h2 style="margin:20px 0 4px;font-size:16px">Add a Topping?</h2>${p.toppings.map(t => `<label class="choice"><span>${t.name} <span class="muted">+$${t.price}</span></span><input type="checkbox" name="top" value="${t.name}"></label>`).join('')}</section>
    <div class="cta-bar"><button class="btn" id="dcta" data-act="addDetail">Add to Cart (${money(p.price)})</button></div>`;
  },
  location: () => {
    S.tmp = S.tmp || { ...S.addr };
    return `<section class="pad">${backBar()}<div class="map" role="img" aria-label="Map showing delivery location"><span class="pin">${ic('pin')}</span></div><h2>Detail Address</h2><p style="font-weight:600;margin-top:8px">${S.tmp.title}</p><p class="muted">${S.tmp.line}</p>
    <button class="btn ghost" style="margin-top:12px" data-act="addrChange">Change</button><h2 style="margin-top:20px;font-size:16px">Save address as</h2>
    <div class="chips">${ADDRESSES.map(a => `<button class="chip" data-act="saveAs" data-l="${a.label}" aria-pressed="${S.tmp.label === a.label}">${a.label}</button>`).join('')}</div><button class="btn" data-act="confirmAddr">Confirmation</button></section>`;
  },
  cart: () => `<section class="pad"><div class="top"><h1>My Cart</h1></div>${addrCard()}<h2 style="margin-bottom:12px">Your Order (${S.cart.length})</h2>${S.cart.length ? S.cart.map(i => { const p = byId(i.id); return `<div class="item"><div class="im"><img src="${p.image}" alt="${p.name}"></div><div class="info"><h3>${p.name}</h3><small>${itemMeta(i)}</small><span class="price">${money(i.unit * i.qty)}</span></div>
    <div><div class="qty"><button data-act="cdec" data-k="${i.key}" aria-label="Decrease quantity">−</button><output>${i.qty}</output><button data-act="cinc" data-k="${i.key}" aria-label="Increase quantity">+</button></div><button class="rm" data-act="crm" data-k="${i.key}">Remove</button></div></div>`; }).join('') +
    `<div class="sum">${totalsHTML(calculateSubtotal(), calculateShipping(), calculateTotal())}</div><button class="btn" data-act="go" data-to="checkout">Place Order</button>` : `<p class="empty">Your cart is empty.</p><button class="btn" data-act="go" data-to="menu">Browse menu</button>`}</section>`,
  checkout: () => `<section class="pad">${backBar()}<h1 style="margin-bottom:16px">Checkout</h1><h2 style="font-size:16px;margin-bottom:8px">Delivery address</h2>${addrCard('addrChange')}
    <h2 style="font-size:16px;margin-bottom:8px">Order summary</h2><div class="sum">${S.cart.map(i => `<div class="row"><span>${i.qty} × ${byId(i.id).name}</span><span>${money(i.unit * i.qty)}</span></div>`).join('') || '<p class="muted">No items</p>'}</div>
    <h2 style="font-size:16px;margin-bottom:8px">Payment method</h2><button class="rowbtn" data-act="payPick"><span>${S.pay}</span><span class="link">Change</span></button>
    <div class="sum"><div class="row"><span class="muted">Subtotal</span><span>${money(calculateSubtotal())}</span></div><div class="row"><span class="muted">Delivery fee</span><span>${money(calculateShipping())}</span></div><div class="row total"><span>Total</span><span>${money(calculateTotal())}</span></div></div>
    <button class="btn" data-act="place">Place Order</button></section>`,
  confirm: () => { const o = S.orders[0]; if (!o) return T.home();
    return `<section class="pad"><div class="center"><div class="tick" style="width:80px;height:80px">${ic('check')}</div><h1 style="margin-top:14px">Thank you 👋</h1><p class="muted">We Received Your Order</p><p style="font-weight:700;font-size:18px;margin-top:6px">${o.id}</p></div>
    <h2 style="margin:20px 0 8px;font-size:16px">Order Details</h2>${o.items.map(i => `<div class="item"><div class="im"><img src="${byId(i.id).image}" alt="${byId(i.id).name}"></div><div class="info"><h3>${byId(i.id).name}</h3><small>Qty ${i.qty}</small></div><span class="price">${money(i.unit * i.qty)}</span></div>`).join('')}
    <div class="sum">${totalsHTML(o.subtotal, o.shipping, o.total)}<div class="row"><span class="muted">Delivery time</span><strong>${o.eta}</strong></div></div><button class="btn" data-act="go" data-to="tracking">Track Order</button><button class="btn ghost" data-act="cancel">Cancel</button></section>`; },
  tracking: () => { const o = S.orders[0]; if (!o) return `<section class="pad">${backBar()}<p class="empty">No active order.</p><button class="btn" data-act="go" data-to="menu">Order food</button></section>`;
    return `<section class="pad">${backBar()}<h1>Order Status</h1><p class="muted">${o.id}</p><div class="sum"><div class="bar" role="progressbar" aria-valuenow="${o.stage + 1}" aria-valuemin="1" aria-valuemax="4"><i style="width:${(o.stage + 1) * 25}%"></i></div>
    <p style="margin-top:10px">Estimated delivery <strong>${o.stage >= 3 ? 'Arrived' : o.eta}</strong></p></div><ol class="timeline">${STAGES.map((s, i) => `<li class="${i <= o.stage ? 'done' : ''}">${s}</li>`).join('')}</ol>
    <div class="sum"><small class="muted">Delivery address</small><p style="font-weight:600">${o.addr.line}</p></div><button class="btn ghost" data-act="go" data-to="home">Back to home</button></section>`; },
  profile: () => { const u = S.user || { name: 'Guest', email: 'guest@Aget.com' };
    const r = (a, l, extra = '') => `<button class="rowbtn" data-act="${a}"><span>${l}</span>${extra || '<span class="muted">›</span>'}</button>`;
    return `<section class="pad"><div class="top"><h1>Profile</h1></div><div class="center" style="margin:0 0 20px"><div class="avatar" aria-hidden="true">${u.name[0].toUpperCase()}</div><h2>${u.name}</h2><p class="muted">${u.email}</p></div>
    ${r('orders', 'My Orders')}${r('favs', 'Favorites')}${r('addrs', 'Addresses')}${r('payPick', 'Payment Methods')}${r('notif', 'Notifications')}
    <button class="rowbtn" role="switch" aria-checked="${S.dark}" data-act="theme"><span>Dark Mode</span><span class="switch" aria-hidden="true" ${''} aria-checked="${S.dark}"></span></button>${r('help', 'Help Center')}<button class="rowbtn" data-act="logout" style="color:var(--danger)">Logout</button></section>`; }
};

// ACTIONS
const ACT = {
  go: b => { if (b.dataset.to === 'location') S.tmp = null; showPage(b.dataset.to); },
  back: () => (history.length > 1 && history.state ? history.back() : showPage('home')),
  eye: b => { const i = b.previousElementSibling; const s = i.type === 'password'; i.type = s ? 'text' : 'password'; b.setAttribute('aria-label', s ? 'Hide password' : 'Show password'); },
  social: b => { S.user = { name: 'Sara', email: 'sara@Aget.com' }; persist(); toast(`Signed in with ${b.dataset.v}`); showPage('home'); },
  opt: b => $$('.opt').forEach(o => o.setAttribute('aria-checked', o === b)),
  resend: () => toast('New code sent'),
  start: () => { S.user = { name: S.pending?.name || 'Sara', email: S.pending?.email || 'sara@Aget.com' }; persist(); showPage('home'); },
  bell: () => openModal('Notifications', '<p class="rowbtn">🎉 25% off Chicken Teriyaki today</p><p class="rowbtn">🛵 Free delivery on orders over $50</p>'),
  fav: b => toggleFav(Number(b.dataset.id)),
  open: b => showPage('detail', { id: Number(b.dataset.id) }),
  cat: b => { S.cat = b.dataset.c; $$('.tab').forEach(t => t.setAttribute('aria-selected', t === b)); refreshLists(); },
  dq: b => { S.D.qty = Math.max(1, S.D.qty + Number(b.dataset.d)); updateDetail(); },
  addDetail: () => { addToCart(S.D.id, S.D); },
  cinc: b => increaseQuantity(b.dataset.k), cdec: b => decreaseQuantity(b.dataset.k), crm: b => removeFromCart(b.dataset.k),
  addrChange: pickAddress,
  pickAddr: b => { const a = ADDRESSES[b.dataset.i]; if (S.page === 'location') { S.tmp = { ...a }; render(); } else { S.addr = { ...a }; persist(); render(); toast('Address updated'); } closeModal(); },
  saveAs: b => { const a = ADDRESSES.find(x => x.label === b.dataset.l); S.tmp = { ...a }; render(); },
  confirmAddr: () => { S.addr = { ...S.tmp }; S.tmp = null; persist(); toast('Address updated'); ACT.back(); },
  payPick: pickPayment,
  setPay: b => { S.pay = b.dataset.v; persist(); toast(`Payment: ${S.pay}`); closeModal(); if (S.page === 'checkout') render(); },
  place: placeOrder,
  cancel: () => openModal('Cancel order?', '<p class="muted">Your order will be cancelled and removed.</p>', [{ label: 'Yes, cancel order', cls: 'danger', fn: () => { S.orders.shift(); persist(); toast('Order cancelled'); showPage('home'); } }, { label: 'Keep order', cls: 'ghost' }]),
  orders: () => openModal('My Orders', S.orders.length ? S.orders.map(o => `<p class="rowbtn"><span><strong>${o.id}</strong><br><small class="muted">${STAGES[o.stage]}</small></span><span class="price">${money(o.total)}</span></p>`).join('') : '<p class="empty">No orders yet.</p>'),
  favs: () => { S.cat = 'Favorites'; S.q = ''; showPage('menu'); },
  addrs: () => { S.tmp = null; showPage('location'); },
  notif: () => toast('Notifications are on'),
  help: () => openModal('Help Center', '<p class="rowbtn">📞 Call us: +1 555 0100</p><p class="rowbtn">✉️ help@Aget.example</p>'),
  theme: () => { S.dark = !S.dark; applyTheme(); render(); },
  logout: () => openModal('Log out?', '<p class="muted">You will need to sign in again to order.</p>', [{ label: 'Logout', cls: 'danger', fn: () => { S.user = null; persist(); S.q = ''; showPage('login'); } }, { label: 'Cancel', cls: 'ghost' }]),
  closeModal
};
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b) ACT[b.dataset.act]?.(b, e); });
document.addEventListener('change', e => {
  if (!S.D || S.page !== 'detail') return;
  if (e.target.name === 'sauce') S.D.sauce = e.target.value;
  if (e.target.name === 'top') S.D.tops = $$('[name=top]:checked').map(i => i.value);
  updateDetail();
});

// INITIALIZATION
function init() {
  applyTheme(); updateBadge();
  history.replaceState({ name: 'splash' }, '', '#splash');
  render();
  setTimeout(() => showPage(S.user ? 'home' : 'onb1', {}, false), 1500);
}
init();