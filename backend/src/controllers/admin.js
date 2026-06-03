const Purchase = require('../models/Purchase');
const RedeemCode = require('../models/RedeemCode');
const User = require('../models/User');
const Product = require('../models/Product');

// Dashboard stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPurchases = await Purchase.countDocuments({ paymentStatus: 'completo' });
    const totalRevenue = await Purchase.aggregate([
      { $match: { paymentStatus: 'completo' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalCodes = await RedeemCode.countDocuments();
    const usedCodes = await RedeemCode.countDocuments({ status: 'usado' });
    const activeCodes = await RedeemCode.countDocuments({ status: 'ativo' });

    res.json({
      stats: {
        totalUsers,
        totalPurchases,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCodes,
        usedCodes,
        activeCodes,
        conversionRate: totalUsers > 0 ? ((totalPurchases / totalUsers) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar stats:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas' });
  }
};

// Listar todas as vendas
exports.getSales = async (req, res) => {
  try {
    const { startDate, endDate, status, page = 1, limit = 50 } = req.query;

    let query = {};
    if (status) query.paymentStatus = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const total = await Purchase.countDocuments(query);
    const sales = await Purchase.find(query)
      .populate('user', 'name email')
      .populate('product', 'name category')
      .populate('redeemCode')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.json({
      sales,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({ message: 'Erro ao listar vendas' });
  }
};

// Listar usuários
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;
    const total = await User.countDocuments();
    const users = await User.find()
      .select('-password')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
};

// Relatório de vendas por categoria
exports.getSalesByCategory = async (req, res) => {
  try {
    const sales = await Purchase.aggregate([
      { $match: { paymentStatus: 'completo' } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productData'
        }
      },
      { $unwind: '$productData' },
      {
        $group: {
          _id: '$productData.category',
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({ salesByCategory: sales });
  } catch (error) {
    console.error('Erro ao buscar vendas por categoria:', error);
    res.status(500).json({ message: 'Erro ao buscar relatório' });
  }
};

// Relatório de receita
exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let match = { paymentStatus: 'completo' };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const revenue = await Purchase.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({ revenue });
  } catch (error) {
    console.error('Erro ao buscar receita:', error);
    res.status(500).json({ message: 'Erro ao buscar receita' });
  }
};
