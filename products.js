const express = require('express');
const router = express.Router();
const Database = require('../config/database');

const db = new Database();
db.init();

// LISTAR TODOS OS PRODUTOS
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    let sql = 'SELECT * FROM products WHERE active = 1';
    const params = [];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY createdAt DESC';
    const products = await db.all(sql, params);

    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Erro ao carregar produtos' });
  }
});

// OBTER UM PRODUTO
router.get('/:id', async (req, res) => {
  try {
    const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar produto' });
  }
});

// ADICIONAR PRODUTO (ADMIN)
router.post('/', async (req, res) => {
  try {
    const { name, description, category, price, stock, image, region, supplier } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Nome, categoria e preço são obrigatórios' });
    }

    const result = await db.run(
      'INSERT INTO products (name, description, category, price, stock, image, region, supplier) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description || '', category, price, stock || 999, image || '', region || '', supplier || '']
    );

    res.status(201).json({
      message: 'Produto criado com sucesso',
      product: { id: result.id, name, category, price }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// ATUALIZAR PRODUTO (ADMIN)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, stock, image, active } = req.body;

    await db.run(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image = ?, active = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, price, stock, image, active !== undefined ? active : 1, req.params.id]
    );

    res.json({ message: 'Produto atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// DELETAR PRODUTO (ADMIN)
router.delete('/:id', async (req, res) => {
  try {
    await db.run('UPDATE products SET active = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Produto removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover produto' });
  }
});

module.exports = router;
