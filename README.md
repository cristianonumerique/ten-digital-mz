# Ten Digital Moçambique

Plataforma de e-commerce com integração de Stripe, PayPal e Chat IA.

## 🚀 Funcionalidades

- ✅ Pagamentos com Stripe
- ✅ Pagamentos com PayPal
- ✅ Chat com IA (OpenAI)
- ✅ Autenticação de usuários
- ✅ Gestão de produtos e pedidos

## 📋 Requisitos

- Node.js 14+
- npm ou yarn

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/cristianonumerique/ten-digital-mz.git
cd ten-digital-mz
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

4. **Adicione suas credenciais no arquivo `.env`**
```
OPENAI_API_KEY=sua_chave_openai
STRIPE_PUBLIC_KEY=sua_chave_publica_stripe
STRIPE_SECRET_KEY=sua_chave_secreta_stripe
PAYPAL_CLIENT_ID=seu_client_id_paypal
PAYPAL_SECRET=seu_secret_paypal
```

## 🚀 Como executar

```bash
npm start
```

Para desenvolvimento com nodemon:
```bash
npm run dev
```

Acesse: http://localhost:3000

## 📂 Estrutura de Arquivos

```
├── routes/
│   ├── stripe.js        # Rotas de pagamento Stripe
│   ├── paypal.js        # Rotas de pagamento PayPal
│   └── chat.js          # Rotas de chat IA
├── public/
│   ├── app-payments.js  # Integração de pagamentos (cliente)
│   ├── app-chat.js      # Chat IA (cliente)
│   └── index.html       # Página principal
├── server.js            # Servidor Express
├── package.json         # Dependências
└── .env.example         # Variáveis de ambiente (template)
```

## 🔒 Segurança

- ⚠️ **NUNCA** compartilhe suas API keys
- Use `.env` para armazenar credenciais (não commitir)
- Use GitHub Secrets para CI/CD
- Valide todas as solicitações no backend

## 🛠️ GitHub Secrets (para CI/CD)

Vá para: `Settings → Secrets and variables → Actions`

Adicione:
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `PAYPAL_SECRET`

## 📚 Documentação

- [Stripe](https://stripe.com/docs)
- [PayPal](https://developer.paypal.com/docs)
- [OpenAI](https://platform.openai.com/docs)

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no GitHub.

## 📄 Licença

MIT
