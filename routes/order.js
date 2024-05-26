const orderRouter = require('express').Router();

orderRouter.route('/')
.get((req, res, next) => {
    res.send('At your orders!')
})
.post();

module.exports = orderRouter;

/*
const productRouter = require('express').Router();
const productCtl = require('../controllers/product');

productRouter.route('/')
.get( productCtl.getAll )
.post( productCtl.create );

productRouter.route('/:productId')
.get( productCtl.getOneById )
.put( productCtl.updateById )
.delete( productCtl.deleteById );

module.exports = productRouter;
*/