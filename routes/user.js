const userRouter = require('express').Router();
const passport = require('passport');
// const bcrypt = require('bcryptjs');
const userCtl = require('../controllers/user');

// ----- OPEN ROUTES -----

// Register User
userRouter.route('/register')
.post( userCtl.register );

// Login User
userRouter.route('/login')
.post( passport.authenticate('local', { failureRedirect: "/login" }),
  (req, res) => {
    //res.status(200).json(req.user);
    res.status(200).redirect(`/users/${req.user.id}`);
});

// Logout User
userRouter.route('/logout')
.post( async (req, res) => {
  req.logout();
  res.status(200).json({ message: 'Logged out' });
});

// ----- AUTHENTICATED ROUTES -----

// ----- ROTAS ANTERIORES APAGAR !!! esse comentário se for manter o código !!!

userRouter.route('/')
.get( userCtl.getAll );

userRouter.route('/:userId')
.get( userCtl.getOneById )
.put( userCtl.updateById )
.delete( userCtl.deleteById );

userRouter.route('/:userId/checkout')
.get( userCtl.getOneById )
.put( userCtl.updateById )
.delete( userCtl.deleteById );



module.exports = userRouter;
