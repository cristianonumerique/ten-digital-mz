const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const RedeemCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4().substring(0, 8).toUpperCase()
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  status: {
    type: String,
    enum: ['ativo', 'usado', 'expirado', 'cancelado'],
    default: 'ativo'
  },
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  redeemedAt: Date,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  notes: String // Notas adicionais
});

// Index para buscar códigos ativos
RedeemCodeSchema.index({ code: 1, status: 1 });

module.exports = mongoose.model('RedeemCode', RedeemCodeSchema);
