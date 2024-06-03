const orderRouter = require('express').Router();
const orderCtl = require('../controllers/order');

orderRouter.route('/')
.get( orderCtl.getByUserId );
/*  (req, res, next) => {
        if (req.user) {
            res.send('At your orders!');
        } else {
            res.status(403).json({ msg: "Please login to view your orders" });
        }
    } */

orderRouter.route('/:orderId')
.get( orderCtl.getById )
.put( orderCtl.updateById )
.delete( orderCtl.deleteById );

module.exports = orderRouter;
