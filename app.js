/* =====================================================
   RATACALVA FC — Tienda Oficial | app.js
   ===================================================== */

// ── STATE ──
let cart = JSON.parse(localStorage.getItem('rc_cart') || '[]');
let products = [];
let currentFilter = 'all';

// ── LOAD DATA ──
async function loadProducts() {
  try {
    const res = await fetch('products.json');
    const data = await res.json();
    products = data.products;
    renderFeatured();
    renderOffers();
    renderCollection();
  } catch (e) {
    console.error('Error loading products:', e);
  }
}

// ── PAGES ──
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
  // Close mobile menu
  document.getElementById('navLinks').classList.remove('mobile-open');
  return false;
}

// ── MOBILE MENU ──
function toggleMobileMenu() {
  document.getElementById('navLinks').classList.toggle('mobile-open');
}

// ── RENDER PRODUCTS ──
function createProductCard(product) {
  const sizesHtml = product.sizes.map((s, i) =>
    `<button class="size-opt${i === 0 ? ' selected' : ''}" onclick="selectSize(this, ${product.id})">${s}</button>`
  ).join('');

  return `
    <div class="product-card" id="card-${product.id}">
      <div class="product-img-wrap">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        ${product.discount ? `<span class="product-discount">-${product.discount}%</span>` : ''}
      </div>
      <div class="product-info">
        <div class="product-category">${getCategoryLabel(product.category)}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-desc">${product.description}</div>
        <div class="product-pricing">
          <span class="product-price">${product.price.toFixed(2)}€</span>
          ${product.originalPrice ? `<span class="product-original">${product.originalPrice.toFixed(2)}€</span>` : ''}
        </div>
        <div class="product-size-selector">
          <label>Talla</label>
          <div class="size-options" data-product="${product.id}">
            ${sizesHtml}
          </div>
        </div>
        <button class="add-to-cart" onclick="addToCart(${product.id})" id="atc-${product.id}">
          🛒 Añadir al Carrito
        </button>
      </div>
    </div>
  `;
}

function getCategoryLabel(cat) {
  const map = {
    camisetas: 'Camisetas',
    pantalones: 'Pantalones',
    portero: 'Portero',
    accesorios: 'Accesorios',
    ropa: 'Ropa',
    calzado: 'Calzado'
  };
  return map[cat] || cat;
}

function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  const featured = products.filter(p => p.featured);
  grid.innerHTML = featured.map(createProductCard).join('');
}

function renderOffers() {
  const grid = document.getElementById('offersGrid');
  if (!grid) return;
  // Sort by discount descending
  const sorted = [...products].sort((a, b) => (b.discount || 0) - (a.discount || 0));
  grid.innerHTML = sorted.map(createProductCard).join('');
}

function renderCollection(filter = 'all') {
  const grid = document.getElementById('collectionGrid');
  if (!grid) return;
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
  grid.innerHTML = filtered.map(createProductCard).join('');
}

function filterProducts(cat, btn) {
  currentFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderCollection(cat);
}

// ── SIZE SELECTION ──
function selectSize(btn, productId) {
  const container = btn.closest('.size-options');
  container.querySelectorAll('.size-opt').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function getSelectedSize(productId) {
  const container = document.querySelector(`.size-options[data-product="${productId}"]`);
  if (!container) return null;
  const selected = container.querySelector('.size-opt.selected');
  return selected ? selected.textContent : null;
}

// ── CART ──
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const size = getSelectedSize(productId) || product.sizes[0];

  const existing = cart.find(item => item.id === productId && item.size === size);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
      qty: 1
    });
  }

  saveCart();
  updateCartUI();
  showToast(`✅ ${product.name} añadido al carrito`);

  // Button feedback
  const btn = document.getElementById(`atc-${productId}`);
  if (btn) {
    btn.textContent = '✓ ¡Añadido!';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = '🛒 Añadir al Carrito';
      btn.classList.remove('added');
    }, 1500);
  }
}

function addPackToCart() {
  const PACK_PRICE = 54.99; // Precio oferta flash mostrado en el banner
  const imgProduct = products.find(p => p.id === 1);
  const existing = cart.find(item => item.id === 'pack-jugador');
  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      id: 'pack-jugador',
      name: 'Pack Jugador Completo (Camiseta + Short + Dorsal)',
      price: PACK_PRICE,
      image: imgProduct ? imgProduct.image : '',
      size: 'M',
      qty: 1
    });
  }
  saveCart();
  updateCartUI();
  showToast('✅ Pack Jugador añadido al carrito');
  toggleCart();
}

function removeFromCart(id, size) {
  cart = cart.filter(item => !(String(item.id) === String(id) && item.size === size));
  saveCart();
  updateCartUI();
}

function updateQty(id, size, delta) {
  const item = cart.find(i => String(i.id) === String(id) && i.size === size);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  updateCartUI();
}

function saveCart() {
  try { localStorage.setItem('rc_cart', JSON.stringify(cart)); } catch(e) {}
}

function updateCartUI() {
  const badge = document.getElementById('cartBadge');
  const total = cart.reduce((s, i) => s + i.qty, 0);
  badge.textContent = total;
  badge.classList.toggle('show', total > 0);

  renderCartItems();
  const footer = document.getElementById('cartFooter');
  if (footer) footer.style.display = cart.length ? '' : 'none';

  const totalEl = document.getElementById('cartTotal');
  if (totalEl) {
    const sum = cart.reduce((s, i) => s + i.price * i.qty, 0);
    totalEl.textContent = sum.toFixed(2) + '€';
  }
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Tu carrito está vacío</p>
        <p style="font-size:.8rem;margin-top:.5rem;">Añade productos para empezar</p>
      </div>`;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-size">Talla: ${item.size}</div>
        <div class="cart-item-price">${(item.price * item.qty).toFixed(2)}€</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQty('${item.id}', '${item.size}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty('${item.id}', '${item.size}', 1)">+</button>
          <button class="cart-item-remove" onclick="removeFromCart('${item.id}', '${item.size}')">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleCart() {
  document.getElementById('cartOverlay').classList.toggle('open');
  document.getElementById('cartSidebar').classList.toggle('open');
}

// ── CHECKOUT ──
function checkout() {
  if (cart.length === 0) return;

  const orderNum = '#RC-' + Math.floor(10000 + Math.random() * 90000);
  document.getElementById('orderNumber').textContent = orderNum;

  const summary = cart.map(i => `
    <div style="display:flex;justify-content:space-between;padding:.3rem 0;border-bottom:1px solid var(--gray-light);">
      <span>${i.name} (${i.size}) x${i.qty}</span>
      <strong>${(i.price * i.qty).toFixed(2)}€</strong>
    </div>
  `).join('');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('orderSummary').innerHTML = summary +
    `<div style="display:flex;justify-content:space-between;padding:.5rem 0;font-weight:700;font-size:1rem;">
      <span>TOTAL</span><strong style="color:var(--green);">${total.toFixed(2)}€</strong>
    </div>`;

  // Clear cart
  cart = [];
  saveCart();
  updateCartUI();

  // Close cart, open modal
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('successModal').classList.add('open');
}

function closeModal() {
  document.getElementById('successModal').classList.remove('open');
}

// ── CONTACT FORM ──
function sendContact() {
  const name = document.getElementById('cf-name').value.trim();
  const email = document.getElementById('cf-email').value.trim();
  const subject = document.getElementById('cf-subject').value;
  const message = document.getElementById('cf-message').value.trim();

  if (!name || !email || !subject || !message) {
    showToast('⚠️ Por favor, rellena todos los campos');
    return;
  }

  // Simulate send
  showToast('✅ Mensaje enviado. ¡Te responderemos pronto!');
  document.getElementById('cf-name').value = '';
  document.getElementById('cf-surname').value = '';
  document.getElementById('cf-email').value = '';
  document.getElementById('cf-subject').value = '';
  document.getElementById('cf-message').value = '';
}

// ── TOAST ──
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── COUNTDOWN ──
function startCountdown() {
  // 12h countdown
  let target = new Date();
  target.setHours(target.getHours() + 12, 0, 0, 0);

  function tick() {
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) { target = new Date(Date.now() + 12 * 3600000); return; }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const pad = n => String(n).padStart(2, '0');
    const cdh = document.getElementById('cd-h');
    const cdm = document.getElementById('cd-m');
    const cds = document.getElementById('cd-s');
    if (cdh) cdh.textContent = pad(h);
    if (cdm) cdm.textContent = pad(m);
    if (cds) cds.textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartUI();
  startCountdown();

  // Close modal on overlay click
  document.getElementById('successModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
});

/* =====================================================
   AUTH — Login / Registro / Sesión
   ===================================================== */

// ── STATE ──
let currentUser = JSON.parse(localStorage.getItem('rc_user') || 'null');

// ── MODAL CONTROLS ──
function toggleAuthModal() {
  const overlay = document.getElementById('authOverlay');
  const modal   = document.getElementById('authModal');
  const isOpen  = modal.classList.contains('open');
  if (isOpen) { closeAuthModal(); return; }

  // Show correct panel
  if (currentUser) {
    showAuthPanel('user');
    updateUserPanel();
  } else {
    showAuthPanel('login');
  }
  overlay.classList.add('open');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  document.getElementById('authOverlay').classList.remove('open');
  document.getElementById('authModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ── PANEL / TAB ──
function showAuthPanel(panel) {
  // Hide tabs for user panel
  const tabs = document.querySelector('.auth-tabs');
  tabs.style.display = panel === 'user' ? 'none' : '';

  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById('form' + panel.charAt(0).toUpperCase() + panel.slice(1)).classList.add('active');
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
  showAuthPanel(tab);
}

// ── PASSWORD TOGGLE ──
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

// ── PASSWORD STRENGTH ──
function checkPwStrength(val) {
  const el = document.getElementById('pwStrength');
  if (!el) return;
  let score = 0;
  if (val.length >= 6)  score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const levels = [
    { w: '0%',   c: 'transparent' },
    { w: '25%',  c: '#e74c3c' },
    { w: '50%',  c: '#e67e22' },
    { w: '75%',  c: '#f1c40f' },
    { w: '100%', c: '#2ecc71' },
  ];
  const lvl = levels[Math.min(score, 4)];
  el.style.setProperty('--pw-width', lvl.w);
  el.style.setProperty('--pw-color', lvl.c);
}

// ── LOGIN ──
function handleLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) { showToast('⚠️ Rellena todos los campos'); return; }
  if (!email.includes('@')) { showToast('⚠️ Email no válido'); return; }

  // Check registered users
  const users = JSON.parse(localStorage.getItem('rc_users') || '[]');
  const user  = users.find(u => u.email === email);
  if (!user) { showToast('❌ Usuario no encontrado. ¿Tienes cuenta?'); return; }
  if (user.password !== btoa(password)) { showToast('❌ Contraseña incorrecta'); return; }

  setSession(user);
  showToast(`✅ ¡Bienvenido de vuelta, ${user.name}!`);
  showAuthPanel('user');
  updateUserPanel();
}

// ── REGISTER ──
function handleRegister() {
  const name     = document.getElementById('reg-name').value.trim();
  const surname  = document.getElementById('reg-surname').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const password2= document.getElementById('reg-password2').value;
  const terms    = document.getElementById('reg-terms').checked;

  if (!name || !surname || !email || !password || !password2) {
    showToast('⚠️ Rellena todos los campos'); return;
  }
  if (!email.includes('@')) { showToast('⚠️ Email no válido'); return; }
  if (password.length < 6)  { showToast('⚠️ La contraseña debe tener al menos 6 caracteres'); return; }
  if (password !== password2) { showToast('⚠️ Las contraseñas no coinciden'); return; }
  if (!terms) { showToast('⚠️ Debes aceptar los términos y condiciones'); return; }

  const users = JSON.parse(localStorage.getItem('rc_users') || '[]');
  if (users.find(u => u.email === email)) {
    showToast('❌ Ya existe una cuenta con ese email'); return;
  }

  const newUser = { name, surname, email, password: btoa(password), createdAt: new Date().toISOString() };
  users.push(newUser);
  localStorage.setItem('rc_users', JSON.stringify(users));

  setSession(newUser);
  showToast(`✅ ¡Cuenta creada! Bienvenido/a, ${name}!`);
  showAuthPanel('user');
  updateUserPanel();
}

// ── LOGOUT ──
function handleLogout() {
  currentUser = null;
  localStorage.removeItem('rc_user');
  updateAuthNavBtn();
  closeAuthModal();
  showToast('👋 Sesión cerrada. ¡Hasta pronto!');
}

// ── FORGOT ──
function showForgot() {
  const email = document.getElementById('login-email').value.trim();
  if (!email) { showToast('⚠️ Introduce tu email primero'); return; }
  showToast(`📧 Se enviaría un enlace de recuperación a ${email}`);
}

// ── SESSION ──
function setSession(user) {
  currentUser = user;
  localStorage.setItem('rc_user', JSON.stringify(user));
  updateAuthNavBtn();
}

function updateAuthNavBtn() {
  const btn   = document.getElementById('authNavBtn');
  const label = document.getElementById('authNavLabel');
  if (!btn || !label) return;
  if (currentUser) {
    label.textContent = currentUser.name;
    btn.style.background = 'rgba(45,122,58,.3)';
    btn.style.borderColor = 'var(--green)';
  } else {
    label.textContent = 'Entrar';
    btn.style.background = '';
    btn.style.borderColor = '';
  }
}

function updateUserPanel() {
  if (!currentUser) return;
  const initials = (currentUser.name[0] + (currentUser.surname ? currentUser.surname[0] : '')).toUpperCase();
  document.getElementById('userAvatar').textContent = initials;
  document.getElementById('userName').textContent   = currentUser.name + ' ' + (currentUser.surname || '');
  document.getElementById('userEmail').textContent  = currentUser.email;
}

// ── INIT AUTH ──
document.addEventListener('DOMContentLoaded', () => {
  updateAuthNavBtn();
  if (currentUser) updateUserPanel();
});
