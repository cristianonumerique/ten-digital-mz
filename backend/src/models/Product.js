const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, forneça um nome do produto'],
    trim: true
  },
  description: String,
  category: {
    type: String,
    enum: ['recarga', 'gift-card', 'streaming'],
    required: true
  },
  subcategory: String, // Ex: 'Vodacom', 'EA Play', 'Netflix'
  price: {
    type: Number,
    required: [true, 'Por favor, forneça um preço']
  },
  currency: {
    type: String,
    default: 'MZN'
  },
  image: String,
  description_long: String,
  features: [String], // Características do produto
  stock: {
    type: Number,
    default: 999999 // Produtos digitais tem estoque ilimitado
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);
