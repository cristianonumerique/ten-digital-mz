const express = require('express');
const router = express.Router();
const Database = require('../config/database');
const jwt = require('jsonwebtoken');

const db = new Database();
db.init();

// Middleware de autenticação ADMIN
const authenticateAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    // Em produção, verificar se é admin no database
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Acesso não autorizado' });
  }
};

// ESTATÍSTICAS
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalOrders = await db.get('SELECT COUNT(*) as count FROM orders');
    const totalRevenue = await db.get('SELECT SUM(totalPrice) as sum FROM orders WHERE paymentStatus = "paid"');
    const pendingOrders = await db.get('SELECT COUNT(*) as count FROM orders WHERE paymentStatus = "pending"');
    const totalProducts = await db.get('SELECT COUNT(*) as count FROM products WHERE active = 1');

    res.json({
      totalOrders: totalOrders?.count || 0,
      totalRevenue: totalRevenue?.sum || 0,
      pendingOrders: pendingOrders?.count || 0,
      totalProducts: totalProducts?.count || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar estatísticas' });
  }
});

// LISTAR TODOS OS PEDIDOS
router.get('/orders', authenticateAdmin, async (req, res) => {
  try {
    const orders = await db.all(`
      SELECT o.*, p.name as productName, u.email as userEmail
      FROM orders o
      JOIN products p ON o.productId = p.id
      JOIN users u ON o.userId = u.id
      ORDER BY o.createdAt DESC
    `);

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar pedidos' });
  }
});

// LISTAR TODOS OS UTILIZADORES
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await db.all('SELECT id, email, name, createdAt FROM users ORDER BY createdAt DESC');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar utilizadores' });
  }
});

// RELATÓRIO DE VENDAS
router.get('/reports/sales', authenticateAdmin, async (req, res) => {
  try {
    const sales = await db.all(`
      SELECT
        strftime('%Y-%m', o.createdAt) as month,
        COUNT(*) as orders,
        SUM(o.totalPrice) as revenue
      FROM orders o
      WHERE o.paymentStatus = 'paid'
      GROUP BY month
      ORDER BY month DESC
    `);

    res.json({ sales });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

module.exports = router;
