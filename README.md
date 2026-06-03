# 🎮 Ten Digital MZ - Plataforma de Recargas, Gift Cards e Streaming

Plataforma completa para venda de recargas de telefone, gift cards e acesso a streaming com sistema de resgate de códigos e ativação por email.

## ✨ Funcionalidades

- ✅ Sistema de resgate de códigos
- ✅ Ativação por email
- ✅ Recargas (telefone, internet)
- ✅ Gift Cards (jogos, streaming)
- ✅ Acesso a Streaming
- ✅ Chat IA com Gemini
- ✅ Painel de administrador
- ✅ Sistema de pagamento integrado
- ✅ Relatórios e estatísticas

## 📁 Estrutura do Projeto

```
ten-digital-mz/
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── config/         # Configurações (DB, email, etc)
│   │   ├── controllers/    # Controladores das rotas
│   │   ├── models/         # Modelos de dados
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Autenticação, validação
│   │   ├── services/       # Lógica de negócio
│   │   └── app.js          # Arquivo principal
│   ├── .env.example        # Variáveis de ambiente
│   └── package.json
│
├── frontend/               # Frontend HTML/CSS/JS
│   ├── index.html          # Página inicial
│   ├── css/
│   │   ├── style.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── app.js          # JS principal
│   │   ├── api.js          # Chamadas à API
│   │   ├── gemini.js       # Integração com Gemini
│   │   └── utils.js        # Funções auxiliares
│   ├── pages/
│   │   ├── dashboard.html
│   │   ├── compra.html
│   │   ├── resgate.html
│   │   └── admin.html
│   └── assets/             # Imagens, ícones
│
├── database/               # Scripts de banco de dados
│   ├── schema.sql
│   └── seed.js
│
└── docs/                   # Documentação
    ├── API.md
    ├── SETUP.md
    └── FLOW.md
```

## 🚀 Stack Tecnológico

- **Backend:** Node.js + Express
- **Database:** MongoDB / Firebase
- **Frontend:** HTML5 + CSS3 + JavaScript
- **IA:** Google Gemini API
- **Email:** Nodemailer / SendGrid
- **Payment:** Stripe / PayPal
- **Hosting:** Heroku / DigitalOcean / Firebase

## 📋 Começar

1. Clone o repositório
2. Configure `.env`
3. Instale dependências: `npm install`
4. Inicie o servidor: `npm start`
5. Acesse `http://localhost:3000`

## 📚 Documentação

- [Guia de Setup](docs/SETUP.md)
- [API Reference](docs/API.md)
- [Fluxo de Negócio](docs/FLOW.md)

## 📄 Licença

MIT

---

Desenvolvido com ❤️ para Ten Digital MZ
