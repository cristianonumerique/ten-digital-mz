// Carregar dados do dashboard
document.addEventListener('DOMContentLoaded', loadDashboard);

async function loadDashboard() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        const user = data.user;

        // Atualizar cabeçalho
        document.getElementById('userName').textContent = `Olá, ${user.name}!`;

        // Stats
        document.getElementById('totalPurchases').textContent = user.purchases.length;
        const totalSpent = user.purchases.reduce((sum, p) => sum + p.totalAmount, 0);
        document.getElementById('totalSpent').textContent = `${totalSpent.toFixed(2)} MZN`;
        document.getElementById('activeCodes').textContent = user.redeemedCodes.filter(c => c.status !== 'usado').length;
        document.getElementById('usedCodes').textContent = user.redeemedCodes.filter(c => c.status === 'usado').length;

        // Account Info
        document.getElementById('accountName').textContent = user.name;
        document.getElementById('accountEmail').textContent = user.email;
        document.getElementById('accountDate').textContent = new Date(user.createdAt).toLocaleDateString('pt-MZ');

        // Compras
        loadPurchases(user.purchases);

        // Códigos
        loadCodes(user.redeemedCodes);
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        alert('Erro ao carregar dados');
    }
}

function loadPurchases(purchases) {
    const container = document.getElementById('purchasesList');
    
    if (purchases.length === 0) {
        container.innerHTML = '<p>Nenhuma compra realizada ainda.</p>';
        return;
    }

    container.innerHTML = purchases.map(p => `
        <div class="purchase-item">
            <div class="purchase-info">
                <h4>${p.product.name}</h4>
                <p><strong>ID:</strong> ${p.purchaseId}</p>
                <p><strong>Data:</strong> ${new Date(p.createdAt).toLocaleDateString('pt-MZ')}</p>
            </div>
            <div class="purchase-status">
                <p><strong>${p.totalAmount.toFixed(2)} MZN</strong></p>
                <span class="badge badge-${p.paymentStatus}">${p.paymentStatus}</span>
            </div>
        </div>
    `).join('');
}

function loadCodes(codes) {
    const container = document.getElementById('codesList');
    
    if (codes.length === 0) {
        container.innerHTML = '<p>Nenhum código resgatado ainda.</p>';
        return;
    }

    container.innerHTML = codes.map(c => `
        <div class="code-item">
            <div class="code-info">
                <h4>${c.product.name}</h4>
                <p><strong>Código:</strong> ${c.code}</p>
                <p><strong>Data de Resgate:</strong> ${new Date(c.redeemedAt).toLocaleDateString('pt-MZ')}</p>
            </div>
            <div class="code-status">
                <span class="badge badge-${c.status}">${c.status}</span>
            </div>
        </div>
    `).join('');
}

function switchDashboardTab(tab) {
    document.querySelectorAll('.dashboard-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    document.querySelectorAll('.dashboard-tabs + .tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(tab + 'Tab').classList.add('active');
}
