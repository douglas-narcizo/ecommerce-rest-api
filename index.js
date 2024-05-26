const express = require('express')
const app = express()
const bodyParser = require('body-parser')
require('dotenv').config()

// Routers imports
const userRouter = require('./routes/user')
const productRouter = require('./routes/product')
const cartRouter = require('./routes/cart')
const orderRouter = require('./routes/order')

// To be moved to .ENV
const PORT = process.env.PORT;

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/user', userRouter);
app.use('/product', productRouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);

app.get('/', (req, res) => {
  res.json({ info: 'Root for my Postgres e-commerce API' })
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}.`)
})

/* EXEMPLOS DO BOSS MACHINE

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