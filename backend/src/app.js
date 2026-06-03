const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const purchaseRoutes = require('./routes/purchase');
const redeemRoutes = require('./routes/redeem');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');

const app = express();

// Conectar banco de dados
connectDB();

// Middleware de segurança
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rotas de Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Ten Digital MZ API',
    version: '1.0.0'
  });
});

// Rotas da API
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', purchaseRoutes);
app.use('/api', redeemRoutes);
app.use('/api', chatRoutes);
app.use('/api', adminRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.stack);
  res.status(err.status || 500).json({ 
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? '✅ Configurado' : '❌ NÃO configurado'}`);
  console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ Configurado' : '❌ NÃO configurado'}`);
  console.log(`🤖 Gemini: ${process.env.GEMINI_API_KEY ? '✅ Configurado' : '❌ NÃO configurado'}`);
  console.log(`📧 Email: ${process.env.EMAIL_USER ? '✅ Configurado' : '❌ NÃO configurado'}`);
  console.log('\n✨ Sistema pronto! Comece a vender!\n');
});

module.exports = app;
