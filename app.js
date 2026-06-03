const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalSub = document.getElementById('modal-sub');
const modalEmail = document.getElementById('modal-email');
const uidGroup = document.getElementById('uid-group');
const uidLabel = document.getElementById('uid-label');
const modalUid = document.getElementById('modal-uid');
const modalPrice = document.getElementById('modal-price');
const packageOptions = document.getElementById('package-options');
const payMethods = document.querySelectorAll('.pay-method');
const mpesaInfo = document.getElementById('mpesa-info');
const stripeForm = document.getElementById('stripe-form');
const paypalContainer = document.getElementById('paypal-button-container');
const payButton = document.getElementById('btn-pay');
const spinner = document.getElementById('pay-spinner');
const toastEl = document.getElementById('toast');
const chatWidget = document.getElementById('chat-widget');
const chatToggle = document.getElementById('chat-toggle');
const chatClose = document.getElementById('chat-close');
const chatSend = document.getElementById('chat-send');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

let selectedMethod = 'mpesa';
let activeProduct = { name: '', price: 0, category: '' };

const PRODUCTS = {
  "Free Fire 100 Diamantes": { category: 'ff', type: 'code', info: 'Código oficial Garena enviado por email ou WhatsApp após confirmação.' },
  "Free Fire 310 Diamantes": { category: 'ff', type: 'code', info: 'Código oficial Garena enviado por email ou WhatsApp após confirmação.' },
  "Free Fire 520 Diamantes": { category: 'ff', type: 'code', info: 'Código oficial Garena enviado por email ou WhatsApp após confirmação.' },
  "Free Fire 1060 Diamantes": { category: 'ff', type: 'code', info: 'Código oficial Garena enviado por email ou WhatsApp após confirmação.' },
  "Free Fire 2180 Diamantes": { category: 'ff', type: 'code', info: 'Código oficial Garena enviado por email ou WhatsApp após confirmação.' },
  "Free Fire 5600 Diamantes": { category: 'ff', type: 'code', info: 'Código oficial Garena enviado por email ou WhatsApp após confirmação.' },
  "Google Play R$10 Brasil": { category: 'gc', type: 'code', info: 'Gift card Google Play oficial enviado por email.' },
  "PlayStation R$100 Brasil": { category: 'gc', type: 'code', info: 'Gift card PSN oficial enviado por email.' },
  "Apple iTunes $10 USA": { category: 'gc', type: 'code', info: 'Gift card Apple oficial enviado por email.' },
  "Xbox R$50 Brasil": { category: 'gc', type: 'code', info: 'Gift card Xbox oficial enviado por email.' },
  "Netflix Premium 1 Mes": { category: 'st', type: 'account', info: 'Acesso ou conta de streaming enviado por email após confirmação.' },
  "Spotify Premium": { category: 'st', type: 'account', info: 'Acesso ou conta de streaming enviado por email após confirmação.' },
  "Disney+ Premium": { category: 'st', type: 'account', info: 'Acesso ou conta de streaming enviado por email após confirmação.' },
  "YouTube Premium": { category: 'st', type: 'account', info: 'Acesso ou conta de streaming enviado por email após confirmação.' },
  "HBO Max Ultimate": { category: 'st', type: 'account', info: 'Acesso ou conta de streaming enviado por email após confirmação.' },
  "Amazon Prime": { category: 'st', type: 'account', info: 'Acesso Prime oficial enviado por email após confirmação.' },
  "Steam R$20 Brasil": { category: 'ga', type: 'code', info: 'Gift card Steam oficial enviado por email.' },
  "PUBG 600 UC": { category: 'ga', type: 'code', info: 'Voucher PUBG Mobile oficial enviado por email.' },
  "Adicao PayPal $10": { category: 'in', type: 'code', info: 'Crédito PayPal oficial enviado por email após confirmação.' },
  "Amazon $25 USA": { category: 'in', type: 'code', info: 'Gift card Amazon oficial enviado por email.' },
  "Gift Card USA": { category: 'gc', type: 'code', info: 'Gift card oficial EUA enviado por email.' },
  "Gift Card Brasil": { category: 'gc', type: 'code', info: 'Gift card oficial Brasil enviado por email.' },
  "Gift Card Portugal": { category: 'gc', type: 'code', info: 'Gift card oficial Portugal enviado por email.' },
  "Gift Card Reino Unido": { category: 'gc', type: 'code', info: 'Gift card oficial Reino Unido enviado por email.' },
  "Gift Card Africa do Sul": { category: 'gc', type: 'code', info: 'Gift card oficial África do Sul enviado por email.' },
  "Gift Card Canada": { category: 'gc', type: 'code', info: 'Gift card oficial Canadá enviado por email.' },
  "Gift Card Australia": { category: 'gc', type: 'code', info: 'Gift card oficial Austrália enviado por email.' },
  "Gift Card Alemanha": { category: 'gc', type: 'code', info: 'Gift card oficial Alemanha enviado por email.' },
  "Gift Card Dubai UAE": { category: 'gc', type: 'code', info: 'Gift card oficial Dubai/UAE enviado por email.' },
  "Gift Card Franca": { category: 'gc', type: 'code', info: 'Gift card oficial França enviado por email.' },
  "Adicao Internacional": { category: 'in', type: 'account', info: 'Solicitação de adição internacional; instruções e entrega oficial por email.' }
};

function init() {
  selectPayMethod('mpesa');

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });

  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
  }

  if (chatToggle) chatToggle.addEventListener('click', toggleChat);
  if (chatClose) chatClose.addEventListener('click', closeChat);
  if (chatSend) chatSend.addEventListener('click', sendChat);
  if (chatInput) chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') sendChat();
  });
}

function filterProd(category, button) {
  const cards = document.querySelectorAll('.prod-card');
  const tabs = document.querySelectorAll('.tab-btn');

  tabs.forEach((tab) => tab.classList.remove('active'));
  if (button) button.classList.add('active');

  cards.forEach((card) => {
    const cardCat = card.dataset.cat;
    if (category === 'all' || cardCat === category) {
      card.style.display = 'grid';
    } else {
      card.style.display = 'none';
    }
  });
}

function openModal(name, price, category) {
  activeProduct = { name, price, category };
  const product = PRODUCTS[name] || {};
  modalTitle.textContent = `Comprar: ${name}`;
  modalSub.textContent = product.info || `Informe seu email para receber o código ou acesso automático.`;
  modalEmail.value = '';
  modalUid.value = '';
  modalPrice.innerHTML = `${price} <small>MT</small>`;
  uidGroup.style.display = category === 'ff' || category === 'ga' ? 'block' : 'none';
  uidLabel.textContent = category === 'ff' ? 'ID do Jogador' : 'Identificador';
  payButton.disabled = false;
  payButton.querySelector('.btn-label').textContent = 'Finalizar Compra';
  populatePackageDetails(name, price, category);
  modal.classList.add('open');
  modal.style.display = 'flex';
  selectPayMethod(selectedMethod);
}

function populatePackageDetails(name, price, category) {
  if (!packageOptions) return;
  const product = PRODUCTS[name] || {};
  const codeNote = category === 'ff' ? ' Código Free Fire: código numérico de 12 a 16 caracteres.' : '';
  packageOptions.innerHTML = `
    <div class="form-group package-detail-box">
      <label>Pacote selecionado</label>
      <div class="package-detail">${name} — ${price} MT</div>
      <p class="package-note">${product.info || ''}${codeNote}</p>
    </div>
  `;
}

function closeModal() {
  modal.classList.remove('open');
  modal.style.display = 'none';
}

function selectPayMethod(method) {
  selectedMethod = method;
  payMethods.forEach((item) => {
    item.classList.toggle('active', item.dataset.method === method);
  });

  if (method === 'mpesa') {
    mpesaInfo.style.display = 'block';
    stripeForm.classList.add('hidden');
    paypalContainer.classList.add('hidden');
    payButton.style.display = 'inline-flex';
    payButton.querySelector('.btn-label').textContent = 'Finalizar com M-Pesa';
  } else if (method === 'paypal') {
    mpesaInfo.style.display = 'none';
    stripeForm.classList.add('hidden');
    paypalContainer.classList.remove('hidden');
    paypalContainer.innerHTML = '<div class="paypal-placeholder" style="padding:14px;background:#f8f9fc;border:1px solid #dce7f5;border-radius:10px;color:#1f3e72;font-size:13px;">Após clicar em finalizar, receberá instruções para pagamento via PayPal e envio seguro do código por email.</div>';
    payButton.style.display = 'inline-flex';
    payButton.querySelector('.btn-label').textContent = 'Finalizar com PayPal';
  } else if (method === 'stripe') {
    mpesaInfo.style.display = 'none';
    stripeForm.classList.remove('hidden');
    paypalContainer.classList.add('hidden');
    payButton.style.display = 'inline-flex';
    payButton.querySelector('.btn-label').textContent = 'Finalizar com Stripe';
  }
}

function finalizarCompra() {
  const email = modalEmail.value.trim();
  if (!email || !validateEmail(email)) {
    showToast('Informe um email válido para continuar.', 'error');
    modalEmail.focus();
    return;
  }

  if ((activeProduct.category === 'ff' || activeProduct.category === 'ga') && !modalUid.value.trim()) {
    showToast('Informe o ID do jogador para completar a entrega.', 'error');
    modalUid.focus();
    return;
  }

  payButton.disabled = true;
  spinner.style.display = 'inline-block';
  payButton.querySelector('.btn-label').textContent = 'Processando...';

  setTimeout(() => {
    spinner.style.display = 'none';
    payButton.disabled = false;
    payButton.querySelector('.btn-label').textContent = 'Finalizar Compra';
    closeModal();

    const product = PRODUCTS[activeProduct.name] || {};
    const isAccount = product.type === 'account' || activeProduct.category === 'st';
    const deliveryType = isAccount ? 'Acesso / conta digital' : 'Código de resgate';
    const deliveryNote = product.info || (isAccount ? 'Acesso oficial será enviado por email após confirmação de pagamento.' : 'Código oficial será enviado por email após confirmação de pagamento.');

    showToast(`Compra de ${activeProduct.name} concluída! Verifique seu email para a entrega oficial.`, 'success');

    const order = {
      id: `pedido_${Date.now()}`,
      product: activeProduct.name,
      amountMT: activeProduct.price,
      paymentMethod: selectedMethod,
      email,
      uid: modalUid.value.trim(),
      deliveryType,
      deliveryNote,
      date: new Date().toLocaleString('pt-BR'),
    };

    console.log(order);
  }, 1200);
}

function validateEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function showToast(message, type = 'success') {
  toastEl.textContent = message;
  toastEl.className = `toast show ${type}`;
  clearTimeout(showToast.hideTimer);
  showToast.hideTimer = setTimeout(() => {
    toastEl.className = 'toast';
  }, 3500);
}


function toggleChat() {
  chatWidget.classList.toggle('open');
  const isOpen = chatWidget.classList.contains('open');
  chatWidget.setAttribute('aria-hidden', !isOpen);
}

function closeChat() {
  chatWidget.classList.remove('open');
  chatWidget.setAttribute('aria-hidden', 'true');
}

function sendChat() {
  const text = chatInput.value.trim();
  if (!text) return;

  appendMessage(text, 'user');
  chatInput.value = '';
  setTimeout(() => {
    appendMessage('Obrigado pela mensagem! Em breve responderemos ou encaminharemos um contato via WhatsApp.', 'agent');
  }, 700);
}

function appendMessage(text, type) {
  const message = document.createElement('div');
  message.className = `chat-message ${type}`;
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

window.filterProd = filterProd;
window.openModal = openModal;
window.closeModal = closeModal;
window.selectPayMethod = selectPayMethod;
window.finalizarCompra = finalizarCompra;

init();
