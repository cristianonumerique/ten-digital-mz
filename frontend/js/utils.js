// Funções auxiliares

// Formatar moeda
function formatCurrency(value, currency = 'MZN') {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: currency
  }).format(value);
}

// Formatar data
function formatDate(date) {
  return new Intl.DateTimeFormat('pt-MZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

// Validar email
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Gerar ID único
function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Armazenar no localStorage
const Storage = {
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  clear() {
    localStorage.clear();
  }
};

// Logging com estilos
function log(message, type = 'info') {
  const styles = {
    info: 'color: #3498db; font-weight: bold;',
    success: 'color: #27ae60; font-weight: bold;',
    error: 'color: #e74c3c; font-weight: bold;',
    warning: 'color: #f39c12; font-weight: bold;'
  };
  console.log(`%c${message}`, styles[type] || styles.info);
}
