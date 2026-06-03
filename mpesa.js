require('dotenv').config();
const axios = require('axios');

const {
  MPESA_BASE,
  MPESA_CLIENT_ID,
  MPESA_CLIENT_SECRET
} = process.env;

function assertEnv() {
  const missing = [];
  if (!MPESA_BASE) missing.push('MPESA_BASE');
  if (!MPESA_CLIENT_ID) missing.push('MPESA_CLIENT_ID');
  if (!MPESA_CLIENT_SECRET) missing.push('MPESA_CLIENT_SECRET');
  if (missing.length) {
    throw new Error(
      `Missing environment variables: ${missing.join(', ')}.\n` +
      'Create a .env file from .env.example and do not commit secrets to Git.'
    );
  }
}

async function getToken() {
  const url = `${MPESA_BASE.replace(/\/$/, '')}/oauth/token`;
  const auth = Buffer.from(`${MPESA_CLIENT_ID}:${MPESA_CLIENT_SECRET}`).toString('base64');

  const response = await axios.post(
    url,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 15000
    }
  );

  if (!response.data) {
    throw new Error(`Token response was empty from ${url}`);
  }

  return response.data.access_token || response.data.token || response.data.accessToken;
}

async function fetchAllPayments(token) {
  const url = `${MPESA_BASE.replace(/\/$/, '')}/payments/mpesa/get/all`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    },
    timeout: 15000
  });

  return response.data;
}

(async () => {
  try {
    assertEnv();
    console.log('Obtendo token de acesso...');

    const token = await getToken();
    if (!token) {
      throw new Error('Não foi possível obter access_token. Verifique o retorno do servidor.');
    }

    console.log('Token obtido com sucesso. Buscando pagamentos MPesa...');
    const data = await fetchAllPayments(token);

    console.log('Resultado do endpoint /payments/mpesa/get/all:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('Erro na API:', error.response.status);
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Erro:', error.message);
    }
    process.exit(1);
  }
})();