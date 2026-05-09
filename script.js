const PRODUCTS = [
  { id:1,  name:'Camiseta de Juego',          category:'Equipación',      price:49.99, oldPrice:64.99,  img:'img/camiseta.jpeg',              offer:true,  badge:'-23%' },
  { id:2,  name:'Camiseta de Tirantes',        category:'Equipación',      price:39.99, oldPrice:49.99,  img:'img/camiseta_tirantes.png',       offer:true,  badge:'-20%' },
  { id:3,  name:'Dorsal Oficial',              category:'Personalización', price:14.99, oldPrice:null,   img:'img/dorsal.jpeg',                offer:false, badge:null   },
  { id:4,  name:'Gorra Ratacalva FC',          category:'Accesorios',      price:29.99, oldPrice:39.99,  img:'img/gorra.png',                  offer:true,  badge:'-25%' },
  { id:5,  name:'Guantes de Portero',          category:'Portero',         price:54.99, oldPrice:null,   img:'img/guantes_portero.jpg',        offer:false, badge:null   },
  { id:6,  name:'Pantalón de Portero',         category:'Portero',         price:59.99, oldPrice:74.99,  img:'img/pantalon_portero.png',       offer:true,  badge:'-20%' },
  { id:7,  name:'Pantalones Cortos Blancos',   category:'Equipación',      price:24.99, oldPrice:null,   img:'img/pantalones_cortos_blancos.jpeg', offer:false, badge:null },
  { id:8,  name:'Pantalones Largos Verdes',    category:'Entrenamiento',   price:44.99, oldPrice:54.99,  img:'img/pantalones_largos_verdes.jpeg',  offer:true,  badge:'-18%' },
  { id:9,  name:'Sudadera Ratacalva',          category:'Fan Shop',        price:69.99, oldPrice:null,   img:'img/sudadera.png',               offer:false, badge:null   },
  { id:10, name:'Zapatillas Indoor Pro',       category:'Calzado',         price:89.99, oldPrice:109.99, img:'img/zapatillas_indoor.jpg',      offer:true,  badge:'-18%' }
];

let cart = [];

// ---- NAVIGATION ----
function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
  window.scrollTo(0, 0);
}

// ---- CARD FACTORY ----
function createCard(p) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
    <div class="product-img-wrap"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
    <div class="product-info">
      <div class="product-category">${p.category}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-price-row">
        <span class="price-current">${p.price.toFixed(2).replace('.',',')} €</span>
        ${p.oldPrice ? `<span class="price-old">${p.oldPrice.toFixed(2).replace('.',',')} €</span>` : ''}
      </div>
      <div class="qty-row">
        <span class="qty-label">Cant.:</span>
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty(${p.id},-1)">−</button>
          <input class="qty-input" id="qty-${p.id}" type="number" value="1" min="1" max="99">
          <button class="qty-btn" onclick="changeQty(${p.id},1)">+</button>
        </div>
      </div>
      <button class="add-cart-btn" id="addbtn-${p.id}" onclick="addToCart(${p.id})">🛒 Añadir al carrito</button>
    </div>`;
  return card;
}

function changeQty(id, delta) {
  const input = document.getElementById('qty-' + id);
  if (!input) return;
  let val = parseInt(input.value) + delta;
  if (val < 1) val = 1;
  if (val > 99) val = 99;
  input.value = val;
}

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  const input = document.getElementById('qty-' + id);
  const qty = input ? (parseInt(input.value) || 1) : 1;
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ ...product, qty });
  updateCartUI();
  const btn = document.getElementById('addbtn-' + id);
  if (btn) {
    btn.innerHTML = '✓ ¡Añadido!';
    btn.classList.add('added');
    setTimeout(() => { btn.innerHTML = '🛒 Añadir al carrito'; btn.classList.remove('added'); }, 1500);
  }
  showToast(`"${product.name}" añadido al carrito 🛒`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
}

function updateCartUI() {
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s,i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartTotal').textContent = total.toFixed(2).replace('.', ',') + ' €';
  const body = document.getElementById('cartBody');
  if (!cart.length) {
    body.innerHTML = `<div class="cart-empty"><div class="emoji">🛒</div><p>Tu carrito está vacío.<br>¡Añade productos para empezar!</p></div>`;
    return;
  }
  body.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${(item.price*item.qty).toFixed(2).replace('.',',')} €</div>
        <div class="cart-item-qty">Cantidad: ${item.qty} × ${item.price.toFixed(2).replace('.',',')} €</div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
    </div>`).join('');
}

function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
}

function checkout() {
  if (!cart.length) { showToast('Tu carrito está vacío 😅'); return; }
  toggleCart();
  document.getElementById('successModal').classList.add('open');
  cart = [];
  updateCartUI();
}

function closeModal() { document.getElementById('successModal').classList.remove('open'); }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function submitForm() { showToast('Mensaje enviado ✉️ ¡Gracias!'); }

// ---- INIT ----
PRODUCTS.filter(p => p.offer).forEach(p => document.getElementById('offersGrid').appendChild(createCard(p)));
PRODUCTS.forEach(p => document.getElementById('allGrid').appendChild(createCard(p)));
