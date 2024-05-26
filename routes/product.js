const productRouter = require('express').Router();
// const pool = require('../db'); APAGAR !!!
const productCtl = require('../controllers/product');

/* APAGAR TAMBEM !!!
const productController = require('../controllers/productController');

productRouter.get('/', productController.getAllProducts);
productRouter.post('/', productController.createProduct);
*/

productRouter.route('/')
.get( productCtl.getAll )
.post( productCtl.create );

productRouter.route('/:productId')
.get( productCtl.getOneById )
.put( productCtl.updateById )
.delete( productCtl.deleteById );

module.exports = productRouter;
