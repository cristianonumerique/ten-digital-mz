// Variáveis globais
const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let filtroAtual = 'todos';
let stripe = null;
let elements = null;

// Inicializar app
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Ten Digital MZ iniciado');
    
    // Inicializar Stripe
    stripe = Stripe('pk_live_sua_chave_publica'); // Substituir pela chave real
    
    loadProducts();
    checkUserSession();
    setupEventListeners();
});

// Setup de event listeners
function setupEventListeners() {
    // Filtros de produtos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filtroAtual = e.target.dataset.filter;
            filterProducts();
        });
    });
}

// Carregar produtos
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/produtos`);
        const data = await response.json();
        displayProducts(data.products);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        document.getElementById('productsList').innerHTML = 
            '<p>Erro ao carregar produtos. Tente novamente.</p>';
    }
}

// Exibir produtos
function displayProducts(produtos) {
    const container = document.getElementById('productsList');
    
    if (!produtos || produtos.length === 0) {
        container.innerHTML = '<p>Nenhum produto disponível.</p>';
        return;
    }

    container.innerHTML = produtos.map(produto => `
        <div class="produto-card" data-category="${produto.category}">
            <div class="produto-image">
                ${produto.image ? `<img src="${produto.image}" alt="${produto.name}">` : getProductEmoji(produto.category)}
            </div>
            <div class="produto-info">
                <h3>${produto.name}</h3>
                <p>${produto.description || ''}</p>
                <div class="produto-price">${produto.price.toFixed(2)} ${produto.currency}</div>
                <button onclick="openCheckout('${produto._id}', '${produto.name}', ${produto.price})">Comprar Agora</button>
            </div>
        </div>
    `).join('');
}

// Emoji por categoria
function getProductEmoji(category) {
    const emojis = {
        'recarga': '📱',
        'gift-card': '🎮',
        'streaming': '📺'
    };
    return `<div style="font-size: 3rem;">${emojis[category] || '🎁'}</div>`;
}

// Filtrar produtos
function filterProducts() {
    const cards = document.querySelectorAll('.produto-card');
    cards.forEach(card => {
        if (filtroAtual === 'todos' || card.dataset.category === filtroAtual) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Abrir checkout
async function openCheckout(productId, productName, price) {
    if (!currentUser) {
        openLoginModal();
        return;
    }

    try {
        showLoading('Processando seu pagamento...');
        
        const response = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        const data = await response.json();
        hideLoading();

        if (response.ok) {
            // Redirecionar para Stripe Checkout
            const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });
            
            if (result.error) {
                alert('❌ ' + result.error.message);
            }
        } else {
            alert('❌ Erro ao iniciar pagamento: ' + data.message);
        }
    } catch (error) {
        hideLoading();
        console.error('Erro:', error);
        alert('❌ Erro ao processar pagamento');
    }
}

// Verificar pagamento após retorno
async function checkPaymentAfterRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const purchaseId = urlParams.get('purchase_id');

    if (sessionId && purchaseId) {
        try {
            showLoading('Verificando pagamento...');
            
            const response = await fetch(`${API_URL}/verify-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ sessionId, purchaseId })
            });

            const data = await response.json();
            hideLoading();

            if (response.ok) {
                showSuccessMessage(`
                    ✅ Pagamento confirmado!
                    <br>Seu código: <strong>${data.redeemCode}</strong>
                    <br>Verifique seu email para mais detalhes.
                `);
                // Limpar URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                alert('❌ Erro ao verificar pagamento: ' + data.message);
            }
        } catch (error) {
            hideLoading();
            console.error('Erro:', error);
        }
    }
}

// Resgatar código
async function redeemCode() {
    const code = document.getElementById('redeemCode').value.trim().toUpperCase();
    const messageDiv = document.getElementById('redeemMessage');

    if (!code) {
        showMessage('Por favor, insira um código válido', 'error', messageDiv);
        return;
    }

    if (!currentUser) {
        openLoginModal();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/redeem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ code })
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('✅ Código resgatado com sucesso!', 'success', messageDiv);
            document.getElementById('redeemCode').value = '';
        } else {
            showMessage(`❌ ${result.message || 'Erro ao resgatar código'}`, 'error', messageDiv);
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('❌ Erro ao processar requisição', 'error', messageDiv);
    }
}

// Mostrar mensagem
function showMessage(text, type, element) {
    element.textContent = text;
    element.className = type;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Login
async function loginUser() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            closeLoginModal();
            alert('✅ Login realizado com sucesso!');
            updateNavbar();
            location.reload();
        } else {
            alert('❌ ' + (data.message || 'Erro ao fazer login'));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro ao processar login');
    }
}

// Registrar
async function registerUser() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

    if (!name || !email || !password || !passwordConfirm) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    if (password !== passwordConfirm) {
        alert('As senhas não conferem');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            closeLoginModal();
            alert('✅ Conta criada com sucesso!');
            updateNavbar();
            location.reload();
        } else {
            alert('❌ ' + (data.message || 'Erro ao criar conta'));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro ao processar registro');
    }
}

// Verificar sessão do usuário
function checkUserSession() {
    const token = localStorage.getItem('token');
    if (token) {
        fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.user) {
                currentUser = data.user;
                updateNavbar();
            }
        })
        .catch(() => {
            localStorage.removeItem('token');
        });
    }
}

// Atualizar navbar
function updateNavbar() {
    const btnLogin = document.querySelector('.btn-login');
    if (currentUser) {
        btnLogin.textContent = `👤 ${currentUser.name}`;
        btnLogin.onclick = showUserMenu;
    }
}

// Modal de Login
function openLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
    // Limpar campos
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerPasswordConfirm').value = '';
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tab + 'Tab').classList.add('active');
    document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
}

// Chat IA
function toggleChat() {
    document.getElementById('chatBox').classList.toggle('hidden');
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    addChatMessage(message, 'user');
    input.value = '';

    sendToGemini(message);
}

function addChatMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `<p>${escapeHtml(text)}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Scroll suave
function scrollTo(selector) {
    document.querySelector(selector).scrollIntoView({ behavior: 'smooth' });
}

// Logout
function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    alert('Você saiu da sua conta');
    location.reload();
}

// Menu do usuário
function showUserMenu() {
    const menu = `
        <div style="position: absolute; top: 100%; right: 0; background: white; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); min-width: 200px; z-index: 1000;">
            <a href="javascript:openDashboard()" style="display: block; padding: 10px 20px; text-decoration: none; color: #333; border-bottom: 1px solid #eee;">📊 Dashboard</a>
            <a href="javascript:openMyPurchases()" style="display: block; padding: 10px 20px; text-decoration: none; color: #333; border-bottom: 1px solid #eee;">🛒 Minhas Compras</a>
            <a href="javascript:logout()" style="display: block; padding: 10px 20px; text-decoration: none; color: #e74c3c;">🚪 Sair</a>
        </div>
    `;
    alert('Menu: Dashboard | Minhas Compras | Sair');
}

// Dashboard
async function openDashboard() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        
        alert(`
📊 Dashboard

Nome: ${data.user.name}
Email: ${data.user.email}
Compras: ${data.user.purchases.length}
Códigos Resgatados: ${data.user.redeemedCodes.length}
Saldo: ${data.user.walletBalance.toFixed(2)} MZN
        `);
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Minhas compras
async function openMyPurchases() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_URL}/purchases`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        
        let message = '🛒 Minhas Compras\n\n';
        if (data.purchases.length === 0) {
            message += 'Nenhuma compra realizada ainda.';
        } else {
            data.purchases.forEach(p => {
                message += `${p.product.name} - ${p.totalAmount} MZN - ${p.paymentStatus}\n`;
            });
        }
        alert(message);
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Loading
function showLoading(text = 'Processando...') {
    let loadingDiv = document.getElementById('loading');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading';
        loadingDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px; box-shadow: 0 5px 30px rgba(0,0,0,0.3); z-index: 9999;';
        document.body.appendChild(loadingDiv);
    }
    loadingDiv.innerHTML = `<p>${text}</p><div style="text-align: center; margin-top: 10px;">⏳</div>`;
    loadingDiv.style.display = 'block';
}

function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) loadingDiv.style.display = 'none';
}

// Mensagem de sucesso
function showSuccessMessage(message) {
    const div = document.createElement('div');
    div.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #10b981; color: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 30px rgba(0,0,0,0.3); z-index: 9999; max-width: 400px; text-align: center;';
    div.innerHTML = message;
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.remove();
    }, 5000);
}

// Escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Verificar pagamento ao carregar página
window.addEventListener('load', checkPaymentAfterRedirect);
