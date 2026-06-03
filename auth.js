const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('../config/database');

const db = new Database();
db.init();

// REGISTRO
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password e nome são obrigatórios' });
    }

    // Verificar se email já existe
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email já registado' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserir utilizador
    const result = await db.run(
      'INSERT INTO users (email, password, name, phone) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, phone || '']
    );

    const token = jwt.sign({ id: result.id, email }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '30d'
    });

    res.status(201).json({
      message: 'Utilizador registado com sucesso',
      token,
      user: { id: result.id, email, name }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erro ao registar utilizador' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password são obrigatórios' });
    }

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Email ou password inválido' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou password inválido' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '30d'
    });

    res.json({
      message: 'Login bem-sucedido',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro ao efetuar login' });
  }
});

// VERIFICAR TOKEN
router.post('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
});

// RECUPERAR PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(404).json({ error: 'Email não encontrado' });
    }

    // Aqui você geraria um link de reset e enviaria por email
    // Por agora, retornamos um token temporário
    const resetToken = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1h'
    });

    res.json({
      message: 'Link de recuperação enviado para o seu email',
      resetToken // Em produção, envie isto por email apenas
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao recuperar password' });
  }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'secret');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, decoded.id]);

    res.json({ message: 'Password atualizada com sucesso' });
  } catch (error) {
    res.status(400).json({ error: 'Token inválido ou expirado' });
  }
});

module.exports = router;
