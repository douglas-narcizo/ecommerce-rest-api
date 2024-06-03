const cartRouter = require('express').Router();
const cartCtl = require('../controllers/cart');
const orderCtl = require('../controllers/order');

cartRouter.route('/')
.get( cartCtl.getByUserId )
.post( cartCtl.addToCart );

cartRouter.route('/:cartId')
.get( cartCtl.getById )
.post( cartCtl.addToCart )
// .put(  )
.delete( cartCtl.deleteById );

cartRouter.route('/:cartId/checkout')
.post( orderCtl.create );

module.exports = cartRouter;
