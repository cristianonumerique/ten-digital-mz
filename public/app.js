// Carrinho de compras
let cart = [];

// Elementos do DOM
const cartItemsContainer = document.getElementById('cart-items');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');
const addToCartButtons = document.querySelectorAll('.btn-add');

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    setupAddToCartButtons();
});

function setupAddToCartButtons() {
    addToCartButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = btn.dataset.productId;
            const productName = btn.dataset.productName;
            const productPrice = parseFloat(btn.dataset.productPrice);
            
            addToCart(productId, productName, productPrice);
        });
    });
}

function addToCart(id, name, price) {
    // Verificar se produto já está no carrinho
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id,
            name,
            price,
            quantity: 1
        });
    }
    
    saveCart();
    updateCart();
    
    // Feedback visual
    alert(`✅ ${name} adicionado ao carrinho!`);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCart();
}

function updateQuantity(id, quantity) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = Math.max(1, quantity);
        saveCart();
        updateCart();
    }
}

function updateCart() {
    // Limpar container
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Carrinho vazio</p>';
        subtotalEl.textContent = '$0.00';
        taxEl.textContent = '$0.00';
        totalEl.textContent = '$0.00';
        return;
    }
    
    // Adicionar items
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
            </div>
            <div>
                <strong>$${itemTotal.toFixed(2)}</strong>
            </div>
            <div class="cart-item-actions">
                <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                <button onclick="removeFromCart('${item.id}')">Remover</button>
            </div>
        `;
        cartItemsContainer.appendChild(itemEl);
    });
    
    // Calcular totais
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% de imposto
    const total = subtotal + tax;
    
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem('cart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCart();
    }
}

// Expor função global para remover items
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
