const products = [
    { id: 1, name: "Camiseta Oficial Robert's", price: 45.99, img: "camiseta.jpeg" },
    { id: 2, name: "Dorsal Personalizado 99", price: 55.00, img: "dorsal.jpeg" },
    { id: 3, name: "Camiseta de Tirantes", price: 29.99, img: "camiseta tirantes.png" },
    { id: 4, name: "Pack Gorra + Accesorios", price: 35.50, img: "gorra.png" },
    { id: 5, name: "Guantes de Portero Pro", price: 40.00, img: "guantes portero.jpg" },
    { id: 6, name: "Pantalón Portero Largo", price: 38.00, img: "pantalón portero.png" },
    { id: 7, name: "Pantalón Corto Blanco", price: 25.00, img: "pantalones cortos blancos.jpeg" },
    { id: 8, name: "Chándal Entrenamiento", price: 65.00, img: "pantalones largos verdes.jpeg" }
];

let cart = [];

// Cargar productos en la web
function loadProducts() {
    const list = document.getElementById('product-list');
    products.forEach(p => {
        list.innerHTML += `
            <div class="product-card">
                <img src="${p.img}" alt="${p.name}">
                <h3>${p.name}</h3>
                <p class="price">${p.price}€</p>
                <button class="btn-add" onclick="addToCart(${p.id})">Añadir al Carrito</button>
            </div>
        `;
    });
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const exist = cart.find(item => item.id === id);

    if (exist) {
        exist.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    const cartContainer = document.getElementById('cart-items');
    const count = document.getElementById('cart-count');
    const total = document.getElementById('cart-total');
    
    cartContainer.innerHTML = "";
    let totalPrecio = 0;
    let totalItems = 0;

    cart.forEach(item => {
        totalPrecio += item.price * item.quantity;
        totalItems += item.quantity;
        cartContainer.innerHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:5px;">
                <span>${item.name} (x${item.quantity})</span>
                <span>${(item.price * item.quantity).toFixed(2)}€</span>
            </div>
        `;
    });

    count.innerText = totalItems;
    total.innerText = totalPrecio.toFixed(2);
}

function checkout() {
    if (cart.length === 0) {
        alert("El carrito está vacío");
        return;
    }
    alert("¡Compra con éxito! Gracias por confiar en RataCalva FC.");
    cart = [];
    updateCartUI();
    toggleCart();
}

window.onload = loadProducts;