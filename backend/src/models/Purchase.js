const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  purchaseId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'MZN'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'wallet', 'manual'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pendente', 'completo', 'falhou', 'reembolsado'],
    default: 'pendente'
  },
  stripeTransactionId: String,
  paypalTransactionId: String,
  redeemCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RedeemCode'
  },
  deliveryStatus: {
    type: String,
    enum: ['nao-enviado', 'enviado', 'entregue'],
    default: 'nao-enviado'
  },
  deliveredAt: Date,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Purchase', PurchaseSchema);
