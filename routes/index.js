// ESTE AQUI POR ENQUANTO NAO VAI ROLAR !!!
// POSSIVELMENTE APAGAR !!!

// const authRouter = require('./auth');
const userRouter = require('./user');
const productRouter = require('./product');
const cartRouter = require('./cart');
const orderRouter = require('./order');

// module.exports = (app, passport) => { … SUBSTITUIR qdo tiver autorizacao
module.exports = async (app) => {
  // authRouter(app, passport);
  userRouter(app);
  productRouter(app);
  cartRouter(app);
  orderRouter(app);
}