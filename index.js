const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const session = require('express-session')
const setupSwagger = require('./swagger')
const passport = require('passport')
require ('./controllers/auth')(passport)

require('dotenv').config()
const { PORT, SESSION_SECRET } = require('./config');

// Routers imports
const userRouter = require('./routes/user')
const productRouter = require('./routes/product')
const cartRouter = require('./routes/cart')
const orderRouter = require('./routes/order')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Configure session
app.use(
  session({  
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);

setupSwagger(app);

// render index.html for root URL
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}.`)
})
