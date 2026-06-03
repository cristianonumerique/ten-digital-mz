const RedeemCode = require('../models/RedeemCode');
const User = require('../models/User');
const Product = require('../models/Product');
const { sendEmail } = require('../services/email');

// Resgatar código
exports.redeemCode = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    if (!code) {
      return res.status(400).json({ message: 'Código é obrigatório' });
    }

    // Buscar código
    const redeemCode = await RedeemCode.findOne({ 
      code: code.toUpperCase(),
      status: 'ativo'
    }).populate('product');

    if (!redeemCode) {
      return res.status(404).json({ message: 'Código inválido ou já foi usado' });
    }

    // Verificar expiração
    if (new Date() > redeemCode.expiresAt) {
      redeemCode.status = 'expirado';
      await redeemCode.save();
      return res.status(400).json({ message: 'Código expirado' });
    }

    // Marcar como usado
    redeemCode.status = 'usado';
    redeemCode.redeemedBy = userId;
    redeemCode.redeemedAt = new Date();
    await redeemCode.save();

    // Adicionar aos códigos resgatados do usuário
    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          redeemedCodes: {
            code: redeemCode.code,
            product: redeemCode.product._id,
            redeemedAt: new Date()
          }
        }
      }
    );

    // Enviar email de confirmação
    const user = await User.findById(userId);
    await sendEmail({
      to: user.email,
      subject: `Código resgatado com sucesso - ${redeemCode.product.name}`,
      template: 'code-redeemed',
      data: {
        name: user.name,
        product: redeemCode.product.name,
        code: redeemCode.code
      }
    });

    res.json({
      success: true,
      message: 'Código resgatado com sucesso!',
      product: {
        name: redeemCode.product.name,
        category: redeemCode.product.category,
        subcategory: redeemCode.product.subcategory
      }
    });
  } catch (error) {
    console.error('Erro ao resgatar código:', error);
    res.status(500).json({ message: 'Erro ao resgatar código' });
  }
};

// Verificar código (sem autenticação)
exports.checkCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Código é obrigatório' });
    }

    const redeemCode = await RedeemCode.findOne({
      code: code.toUpperCase()
    }).populate('product');

    if (!redeemCode) {
      return res.json({ valid: false, message: 'Código não encontrado' });
    }

    const isValid = redeemCode.status === 'ativo' && new Date() <= redeemCode.expiresAt;

    res.json({
      valid: isValid,
      product: isValid ? redeemCode.product.name : null,
      status: redeemCode.status
    });
  } catch (error) {
    console.error('Erro ao verificar código:', error);
    res.status(500).json({ message: 'Erro ao verificar código' });
  }
};

// Listar códigos resgatados do usuário
exports.getRedeemedCodes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('redeemedCodes.product');

    res.json({
      redeemedCodes: user.redeemedCodes
    });
  } catch (error) {
    console.error('Erro ao listar códigos:', error);
    res.status(500).json({ message: 'Erro ao listar códigos' });
  }
};

// [ADMIN] Criar códigos de resgate em lote
exports.createRedeemCodes = async (req, res) => {
  try {
    const { productId, quantity = 1, expiresIn = 365 } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ message: 'Dados inválidos' });
    }

    // Verificar se produto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // Criar códigos
    const codes = [];
    for (let i = 0; i < quantity; i++) {
      const code = new RedeemCode({
        product: productId,
        expiresAt: new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)
      });
      await code.save();
      codes.push(code.code);
    }

    res.status(201).json({
      message: `${quantity} códigos criados com sucesso`,
      codes,
      quantity
    });
  } catch (error) {
    console.error('Erro ao criar códigos:', error);
    res.status(500).json({ message: 'Erro ao criar códigos' });
  }
};

// [ADMIN] Listar todos os códigos
exports.getAllRedeemCodes = async (req, res) => {
  try {
    const { status, productId, page = 1, limit = 50 } = req.query;

    let query = {};
    if (status) query.status = status;
    if (productId) query.product = productId;

    const skip = (page - 1) * limit;
    const total = await RedeemCode.countDocuments(query);
    const codes = await RedeemCode.find(query)
      .populate('product')
      .populate('redeemedBy', 'name email')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.json({
      codes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar códigos:', error);
    res.status(500).json({ message: 'Erro ao listar códigos' });
  }
};
