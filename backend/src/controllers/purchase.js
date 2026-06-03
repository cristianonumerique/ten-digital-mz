const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const RedeemCode = require('../models/RedeemCode');
const User = require('../models/User');
const { sendEmail } = require('../services/email');
const { v4: uuidv4 } = require('uuid');

// Criar checkout session (Stripe)
exports.createCheckoutSession = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user._id;

    // Validar produto
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // Calcular total
    const totalAmount = product.price * quantity * 100; // em centavos

    // Criar Purchase pendente
    const purchase = new Purchase({
      purchaseId: `TEN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      user: userId,
      product: productId,
      quantity,
      price: product.price,
      totalAmount: totalAmount / 100,
      currency: product.currency,
      paymentMethod: 'stripe',
      paymentStatus: 'pendente'
    });

    await purchase.save();

    // Criar sessão Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: product.currency.toLowerCase(),
            product_data: {
              name: product.name,
              description: product.description,
              images: product.image ? [product.image] : []
            },
            unit_amount: parseInt(product.price * 100)
          },
          quantity
        }
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/sucesso?session_id={CHECKOUT_SESSION_ID}&purchase_id=${purchase._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancelado`,
      customer_email: req.user.email,
      metadata: {
        purchase_id: purchase._id.toString(),
        product_id: productId
      }
    });

    // Guardar ID da sessão Stripe
    purchase.stripeTransactionId = session.id;
    await purchase.save();

    res.json({
      sessionId: session.id,
      url: session.url,
      purchaseId: purchase._id
    });
  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    res.status(500).json({ message: 'Erro ao criar checkout' });
  }
};

// Verificar pagamento
exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId, purchaseId } = req.body;

    // Verificar sessão Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Pagamento não confirmado' });
    }

    // Atualizar purchase
    const purchase = await Purchase.findByIdAndUpdate(
      purchaseId,
      { paymentStatus: 'completo' },
      { new: true }
    ).populate('product user');

    if (!purchase) {
      return res.status(404).json({ message: 'Compra não encontrada' });
    }

    // Gerar código de resgate
    const redeemCode = new RedeemCode({
      product: purchase.product._id,
      status: 'ativo'
    });
    await redeemCode.save();

    purchase.redeemCode = redeemCode._id;
    purchase.deliveryStatus = 'enviado';
    purchase.deliveredAt = new Date();
    await purchase.save();

    // Adicionar à lista de compras do usuário
    await User.findByIdAndUpdate(
      purchase.user._id,
      { $push: { purchases: purchase._id } }
    );

    // Enviar email com código
    await sendEmail({
      to: purchase.user.email,
      subject: `Seu código de ${purchase.product.name} está pronto!`,
      template: 'purchase-confirmation',
      data: {
        name: purchase.user.name,
        product: purchase.product.name,
        code: redeemCode.code,
        purchaseId: purchase.purchaseId
      }
    });

    res.json({
      message: 'Pagamento confirmado com sucesso!',
      purchase,
      redeemCode: redeemCode.code
    });
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    res.status(500).json({ message: 'Erro ao verificar pagamento' });
  }
};

// Listar minhas compras
exports.getMyPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.user._id })
      .populate('product')
      .populate('redeemCode')
      .sort({ createdAt: -1 });

    res.json({ purchases });
  } catch (error) {
    console.error('Erro ao listar compras:', error);
    res.status(500).json({ message: 'Erro ao listar compras' });
  }
};

// Get purchase details
exports.getPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('product')
      .populate('redeemCode')
      .populate('user');

    if (!purchase) {
      return res.status(404).json({ message: 'Compra não encontrada' });
    }

    // Verificar se é o dono da compra
    if (purchase.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    res.json({ purchase });
  } catch (error) {
    console.error('Erro ao buscar compra:', error);
    res.status(500).json({ message: 'Erro ao buscar compra' });
  }
};
