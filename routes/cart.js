const cartRouter = require('express').Router();
const cartCtl = require('../controllers/cart');

/*
const cartController = require('../controllers/cartController');

cartRouter.get('/', cartController.getAllProducts);
cartRouter.post('/', cartController.createProduct);
*/

cartRouter.route('/')
.get( cartCtl.getByUserId )
.post( cartCtl.addToCart )
// .put( cartCtl.addToCart )
.delete( cartCtl.deleteById );

cartRouter.route('/:user_id')
.get( cartCtl.getByUserId )
.post(  )
.put(  )
.delete(  );
/*

cartRouter.route('/:cart_id')
.get(  )
.post(  )
.put(  )
.delete(  );
*/

module.exports = cartRouter;
