// API helpers
const API = {
  url: 'http://localhost:3000/api',
  
  async request(endpoint, options = {}) {
    const url = `${this.url}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();
      return { status: response.status, data };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Auth
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  // Produtos
  getProducts(category = '') {
    const query = category ? `?category=${category}` : '';
    return this.request(`/produtos${query}`);
  },

  getProduct(id) {
    return this.request(`/produtos/${id}`);
  },

  // Resgate
  redeemCode(code) {
    return this.request('/redeem', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  },

  // Chat
  chat(message) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }
};
