// Configurações
const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let filtroAtual = 'todos';

// Inicializar app
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Ten Digital MZ iniciado');
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
        const produtos = await response.json();
        displayProducts(produtos);
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
                ${produto.image ? `<img src="${produto.image}" alt="${produto.name}">` : '🎮'}
            </div>
            <div class="produto-info">
                <h3>${produto.name}</h3>
                <p>${produto.description || ''}</p>
                <div class="produto-price">${produto.price.toFixed(2)} ${produto.currency}</div>
                <button onclick="buyProduct('${produto._id}')">Comprar Agora</button>
            </div>
        </div>
    `).join('');
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

// Comprar produto
function buyProduct(productId) {
    if (!currentUser) {
        openLoginModal();
        return;
    }
    
    console.log('Comprando produto:', productId);
    // Será implementado com integração de pagamento
    alert('Funcionalidade de compra em desenvolvimento!');
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
            alert('✅ Conta criada com sucesso! Faça login para continuar.');
            switchTab('login');
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
        // Validar token
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

    // Adicionar mensagem do usuário
    addChatMessage(message, 'user');
    input.value = '';

    // Enviar para IA
    sendToGemini(message);
}

function addChatMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `<p>${text}</p>`;
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
