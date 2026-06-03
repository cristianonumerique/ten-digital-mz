const Product = require('../models/Product');

// Listar todos os produtos
exports.getProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;

    let query = { isActive: true };
    if (category && category !== 'todos') {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ message: 'Erro ao listar produtos' });
  }
};

// Obter produto por ID
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ message: 'Erro ao buscar produto' });
  }
};

// Criar produto (admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, category, subcategory, price, currency, description, features, image } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' });
    }

    const product = new Product({
      name,
      category,
      subcategory,
      price,
      currency,
      description,
      features,
      image
    });

    await product.save();

    res.status(201).json({
      message: 'Produto criado com sucesso',
      product
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ message: 'Erro ao criar produto' });
  }
};

// Atualizar produto (admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.json({
      message: 'Produto atualizado com sucesso',
      product
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ message: 'Erro ao atualizar produto' });
  }
};

// Deletar produto (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ message: 'Erro ao deletar produto' });
  }
};
