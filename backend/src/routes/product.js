const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const { auth, isAdmin } = require('../middleware/auth');

router.get('/produtos', productController.getProducts);
router.get('/produtos/:id', productController.getProduct);

router.post('/produtos', auth, isAdmin, productController.createProduct);
router.put('/produtos/:id', auth, isAdmin, productController.updateProduct);
router.delete('/produtos/:id', auth, isAdmin, productController.deleteProduct);

module.exports = router;
