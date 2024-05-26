const userRouter = require('express').Router();

const userCtl = require('../controllers/user');

userRouter.route('/')
.get( userCtl.getAll )
.post( userCtl.create );

userRouter.route('/:userId')
.get( userCtl.getOneById )
.put( userCtl.updateById )
.delete( userCtl.deleteById );

module.exports = userRouter;
