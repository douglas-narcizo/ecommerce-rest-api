const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const passport = require('passport')
require ('./controllers/auth')(passport)
// const cors = require('cors')

require('dotenv').config()

// Routers imports
const userRouter = require('./routes/user')
const productRouter = require('./routes/product')
const cartRouter = require('./routes/cart')
const orderRouter = require('./routes/order')

// Testing if it works - from .ENV   APAGAR !!!
// const PORT = process.env.PORT;
const { PORT, SESSION_SECRET } = require('./config');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
//app.use(passport.authenticate('session')); APAGAR !!!

app.use('/users', userRouter);
app.use('/products', productRouter);
app.use('/cart', cartRouter);
app.use('/orders', orderRouter);

// render index.html for root URL
app.use(express.static('public'));

app.get('/admin', (req, res) => {
  res.json({ info: 'Admin route for e-commerce API' }) // test route
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}.`)
})

/* EXEMPLOS DO BOSS MACHINE   ------   APAGAR!!!

// Mount your existing apiRouter below at the '/api' path.
app.use('/api', apiRouter);


const apiRouter = express.Router();

const minionsRouter = require('./minions.js');
const ideasRouter = require('./ideas.js');
const meetingsRouter = require('./meetings.js');

// MINIONS ROUTES ----- ----- -----
apiRouter.use('/minions', minionsRouter);

// IDEAS ROUTES ----- ----- -----
apiRouter.use('/ideas', ideasRouter);

// MEETINGS ROUTES ----- ----- -----
apiRouter.use('/meetings', meetingsRouter);
*/