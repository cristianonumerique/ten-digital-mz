// Admin Dashboard

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    loadAdminDashboard();
});

function checkAdminAccess() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    // Verificar se é admin (pode ser expandido)
}

async function loadAdminDashboard() {
    const token = localStorage.getItem('token');
    
    try {
        // Stats
        const statsRes = await fetch('http://localhost:3000/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const statsData = await statsRes.json();
        
        document.getElementById('statsUsers').textContent = statsData.stats.totalUsers;
        document.getElementById('statsPurchases').textContent = statsData.stats.totalPurchases;
        document.getElementById('statsRevenue').textContent = statsData.stats.totalRevenue.toFixed(2) + ' MZN';
        document.getElementById('statsActiveCodes').textContent = statsData.stats.activeCodes;

        // Produtos
        const prodRes = await fetch('http://localhost:3000/api/produtos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const prodData = await prodRes.json();
        loadProductsList(prodData.products);
        populateProductSelect(prodData.products);

        // Vendas
        loadSales();
        
        // Códigos
        loadCodesAdmin();
        
        // Usuários
        loadUsersAdmin();
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

function loadProductsList(products) {
    const container = document.getElementById('produtosList');
    container.innerHTML = products.map(p => `
        <div class="product-item">
            <h3>${p.name}</h3>
            <p><strong>Categoria:</strong> ${p.category}</p>
            <p><strong>Preço:</strong> ${p.price} ${p.currency}</p>
            <button class="btn-small" onclick="editProduct('${p._id}')">Editar</button>
            <button class="btn-small danger" onclick="deleteProduct('${p._id}')">Deletar</button>
        </div>
    `).join('');
}

function loadSales() {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:3000/api/admin/sales', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById('vendasList');
        if (data.sales.length === 0) {
            container.innerHTML = '<p>Nenhuma venda registrada</p>';
            return;
        }
        container.innerHTML = data.sales.map(s => `
            <div class="sale-item">
                <h4>${s.product.name}</h4>
                <p><strong>Cliente:</strong> ${s.user.name}</p>
                <p><strong>Valor:</strong> ${s.totalAmount} ${s.currency}</p>
                <p><strong>Status:</strong> <span class="badge badge-${s.paymentStatus}">${s.paymentStatus}</span></p>
                <p><strong>Data:</strong> ${new Date(s.createdAt).toLocaleDateString('pt-MZ')}</p>
            </div>
        `).join('');
    })
    .catch(error => console.error('Erro:', error));
}

function loadCodesAdmin() {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:3000/api/admin/redeem-codes', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById('codigosList');
        if (data.codes.length === 0) {
            container.innerHTML = '<p>Nenhum código registrado</p>';
            return;
        }
        container.innerHTML = data.codes.map(c => `
            <div class="code-item">
                <h4>${c.code}</h4>
                <p><strong>Produto:</strong> ${c.product.name}</p>
                <p><strong>Status:</strong> <span class="badge badge-${c.status}">${c.status}</span></p>
                <p><strong>Criado:</strong> ${new Date(c.createdAt).toLocaleDateString('pt-MZ')}</p>
            </div>
        `).join('');
    })
    .catch(error => console.error('Erro:', error));
}

function loadUsersAdmin() {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:3000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById('usuariosList');
        if (data.users.length === 0) {
            container.innerHTML = '<p>Nenhum usuário registrado</p>';
            return;
        }
        container.innerHTML = data.users.map(u => `
            <div class="user-item">
                <h4>${u.name}</h4>
                <p><strong>Email:</strong> ${u.email}</p>
                <p><strong>Membro desde:</strong> ${new Date(u.createdAt).toLocaleDateString('pt-MZ')}</p>
            </div>
        `).join('');
    })
    .catch(error => console.error('Erro:', error));
}

function populateProductSelect(products) {
    const select = document.getElementById('productSelect');
    select.innerHTML = '<option value="">Selecione Produto</option>' + 
        products.map(p => `<option value="${p._id}">${p.name}</option>`).join('');
}

function switchAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tab + 'Tab').classList.add('active');
    
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(n => n.classList.remove('active'));
    event.target.classList.add('active');
}

function openAddProductModal() {
    document.getElementById('addProductModal').classList.remove('hidden');
}

function openGenerateCodesModal() {
    document.getElementById('generateCodesModal').classList.remove('hidden');
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

async function saveProduct(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    
    const product = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value
    };
    
    try {
        const response = await fetch('http://localhost:3000/api/produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(product)
        });
        
        if (response.ok) {
            alert('✅ Produto salvo com sucesso!');
            closeModals();
            loadAdminDashboard();
        } else {
            alert('❌ Erro ao salvar produto');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function generateCodes(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    
    const data = {
        productId: document.getElementById('productSelect').value,
        quantity: parseInt(document.getElementById('codeQuantity').value),
        expiresIn: parseInt(document.getElementById('codeExpires').value)
    };
    
    try {
        const response = await fetch('http://localhost:3000/api/admin/redeem-codes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(`✅ ${result.quantity} códigos gerados com sucesso!\n\nCódigos:\n${result.codes.join('\n')}`);
            closeModals();
            loadCodesAdmin();
        } else {
            alert('❌ Erro ao gerar códigos');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

function filterSales() {
    // Implementar filtro
}

function filterCodes() {
    // Implementar filtro
}

function deleteProduct(id) {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
        const token = localStorage.getItem('token');
        fetch(`http://localhost:3000/api/produtos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (res.ok) {
                alert('✅ Produto deletado!');
                loadAdminDashboard();
            }
        })
        .catch(error => console.error('Erro:', error));
    }
}

function editProduct(id) {
    alert('Funcionalidade de edição em desenvolvimento');
}
