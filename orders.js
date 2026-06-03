const express = require('express');
const router = express.Router();
const Database = require('../config/database');
const jwt = require('jsonwebtoken');

const db = new Database();
db.init();

// Middleware de autenticação
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// CRIAR PEDIDO
router.post('/', authenticate, async (req, res) => {
  try {
    const { productId, quantity, paymentMethod, email } = req.body;

    // Obter produto
    const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Calcular total
    const totalPrice = product.price * (quantity || 1);

    // Criar pedido
    const result = await db.run(
      'INSERT INTO orders (userId, productId, quantity, totalPrice, paymentMethod, email, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.userId, productId, quantity || 1, totalPrice, paymentMethod, email, 'pending']
    );

    res.status(201).json({
      message: 'Pedido criado com sucesso',
      order: {
        id: result.id,
        product: product.name,
        totalPrice,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

// OBTER PEDIDOS DO UTILIZADOR
router.get('/user/history', authenticate, async (req, res) => {
  try {
    const orders = await db.all(
      `SELECT o.*, p.name as productName, p.category
       FROM orders o
       JOIN products p ON o.productId = p.id
       WHERE o.userId = ?
       ORDER BY o.createdAt DESC`,
      [req.userId]
    );

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Erro ao carregar pedidos' });
  }
});

// OBTER PEDIDO ESPECÍFICO
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await db.get(
      'SELECT * FROM orders WHERE id = ? AND userId = ?',
      [req.params.id, req.userId]
    );

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Obter código de entrega
    const delivery = await db.get(
      'SELECT code FROM delivery_codes WHERE orderId = ?',
      [req.params.id]
    );

    res.json({
      order,
      deliveryCode: delivery ? delivery.code : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar pedido' });
  }
});

module.exports = router;
