# 📋 Guia de Setup - Ten Digital MZ

## Pré-requisitos

- Node.js v14+
- npm ou yarn
- MongoDB (local ou Atlas)
- Chaves de API para Stripe, SendGrid, Gemini

## Instalação Rápida

### 1. Clone o repositório
```bash
git clone https://github.com/cristianonumerique/ten-digital-mz.git
cd ten-digital-mz
```

### 2. Setup do Backend

```bash
cd backend
npm install
cp .env.example .env
```

#### Configure o `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ten-digital-mz
JWT_SECRET=sua-chave-super-segura-123
GEMINI_API_KEY=sua-chave-gemini
STRIPE_SECRET_KEY=sk_live_...
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-app
```

### 3. Inicie o servidor
```bash
npm run dev
```

O backend estará em `http://localhost:3000`

### 4. Frontend
O frontend é servido estaticamente. Abra `frontend/index.html` em um navegador.

Para desenvolvimento com live-reload, use:
```bash
npx http-server frontend
```

## Configurações Importantes

### MongoDB
Se não tiver MongoDB local:
- Crie uma conta em https://www.mongodb.com/cloud/atlas
- Copie a connection string
- Coloque no `.env` como `MONGODB_URI`

### Google Gemini
1. Acesse https://ai.google.dev/
2. Crie um projeto e obtenha a chave de API
3. Configure em `.env`

### Stripe
1. Acesse https://stripe.com
2. Obtenha suas chaves de teste/produção
3. Configure em `.env`

### Email (Gmail)
1. Ative 2FA na sua conta Google
2. Gere uma [Senha de App](https://myaccount.google.com/apppasswords)
3. Use a senha de app no `.env`

## Estrutura de Pastas

```
backend/
├── src/
│   ├── config/      # Configurações
│   ├── models/      # Schema MongoDB
│   ├── routes/      # Endpoints da API
│   ├── controllers/ # Lógica das rotas
│   └── middleware/  # Auth, validação
└── app.js          # Arquivo principal

frontend/
├── index.html      # Página principal
├── css/            # Estilos
├── js/             # Scripts
└── assets/         # Imagens
```

## Comandos Úteis

```bash
# Iniciar servidor (desenvolvimento)
npm run dev

# Executar testes
npm test

# Popular banco com dados de teste
npm run seed
```

## Troubleshooting

### "Cannot find module 'express'"
```bash
cd backend
rm -rf node_modules
npm install
```

### "MongoDB connection failed"
- Verificar se MongoDB está rodando
- Verificar connection string no `.env`

### Cors errors
- Verificar se `FRONTEND_URL` está correto no `.env`

## Próximos Passos

1. ✅ Setup completo
2. 📝 Configure os dados iniciais
3. 🚀 Crie sua primeira compra
4. 💰 Integre pagamento real
5. 🌍 Deploy

Sucesso! 🎉
