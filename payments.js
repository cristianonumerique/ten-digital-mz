const express = require('express');
const router = express.Router();
const Database = require('../config/database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

const db = new Database();
db.init();

// INICIAR PAGAMENTO COM STRIPE
router.post('/stripe/checkout', async (req, res) => {
  try {
    const { orderId, amount, email } = req.body;

    // Criar session de pagamento
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Produto Digital',
            },
            unit_amount: Math.round(amount * 100), // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?orderId=${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      customer_email: email,
      metadata: {
        orderId: orderId.toString()
      }
    });

    // Atualizar pedido com sessionId
    await db.run('UPDATE orders SET paymentStatus = ? WHERE id = ?', ['processing', orderId]);

    res.json({
      sessionId: session.id,
      message: 'Sessão de pagamento criada'
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Erro ao criar sessão de pagamento' });
  }
});

// WEBHOOK DO STRIPE (chamado após pagamento bem-sucedido)
router.post('/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_dummy');

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata.orderId;

      // Atualizar status do pedido
      await db.run('UPDATE orders SET paymentStatus = ? WHERE id = ?', ['paid', orderId]);

      // Gerar e enviar código
      await generateAndDeliverCode(orderId);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// PAGAMENTO COM PAYPAL
router.post('/paypal/checkout', async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    // Aqui você integraria o PayPal SDK
    // Por agora, simulamos
    res.json({
      clientId: process.env.PAYPAL_CLIENT_ID,
      message: 'Pronto para pagamento PayPal'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar pagamento PayPal' });
  }
});

// PAGAMENTO COM M-PESA
router.post('/mpesa/checkout', async (req, res) => {
  try {
    const { orderId, amount, phone } = req.body;

    // Aqui você integraria a API do M-Pesa (Vodacom MZ)
    // Exemplo com axios:
    // const response = await axios.post('https://api.vodacom.co.mz/api/v1/payments', {...})

    res.json({
      message: 'Pedido M-Pesa enviado',
      status: 'pending',
      note: 'Confirme o pagamento na sua app M-Pesa'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar pagamento M-Pesa' });
  }
});

// FUNÇÃO AUXILIAR - Gerar e entregar código
async function generateAndDeliverCode(orderId) {
  try {
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) return;

    // Gerar código aleatório
    const code = 'TENDIGITAL-' + Math.random().toString(36).substring(2, 15).toUpperCase();

    // Salvar código
    await db.run(
      'INSERT INTO delivery_codes (orderId, code, type) VALUES (?, ?, ?)',
      [orderId, code, 'redemption']
    );

    // TODO: Enviar por email usando nodemailer
    console.log(`✅ Código gerado para pedido ${orderId}: ${code}`);

    // Marcar como entregue
    await db.run(
      'UPDATE orders SET deliveryStatus = ?, deliveredAt = CURRENT_TIMESTAMP WHERE id = ?',
      ['delivered', orderId]
    );
  } catch (error) {
    console.error('Generate code error:', error);
  }
}

module.exports = router;
