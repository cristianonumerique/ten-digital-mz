const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendEmail } = require('../services/email');

// Registrar novo usuário
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validar
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Por favor, preencha todos os campos' });
    }

    // Verificar se usuário existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Criar usuário
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Gerar token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Enviar email de boas-vindas
    await sendEmail({
      to: email,
      subject: 'Bem-vindo ao Ten Digital MZ!',
      template: 'welcome',
      data: { name }
    });

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erro ao registrar:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, preencha todos os campos' });
    }

    // Buscar usuário
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    // Verificar senha
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    // Gerar token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
};

// Get user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('purchases')
      .populate('redeemedCodes.product');

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        walletBalance: user.walletBalance,
        purchases: user.purchases,
        redeemedCodes: user.redeemedCodes
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
};
