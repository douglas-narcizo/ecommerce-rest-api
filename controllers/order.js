const pool = require('../db');
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const { getCart } = require('./cart');

// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripe = require('stripe')(stripeSecretKey);

// ----- HELPER: retrieve product info from table "products"
const orderProdutcsInfo = async (orderId) => {
    try {
        const orderItemsInfo = await pool.query(`
            SELECT order_items.id, qty, name, price, description, category
            FROM order_items
            INNER JOIN products
            ON products.id = order_items.product_id
            WHERE order_id = $1;`,
            [orderId]
        );
        orderItemsInfo.rows.forEach(item => item.subtotal = item.qty * item.price);
        return orderItemsInfo.rows;
    } catch (err) {
        return err;
    }
}

// ----- HELPER: retrieve order details
const getOrder = async (orderId) => {
    try {
        const orderResult = await pool.query(
            'SELECT id, user_id AS "userId", total, status, created, modified FROM orders WHERE id = $1',
            [orderId]
        );
        if (orderResult.rows.length === 0) {
            return null;
        }
        const order = orderResult.rows[0];
        const orderProducts = await orderProdutcsInfo(order.id);
        order.total = orderProducts.map(item => item.subtotal).reduce((a, b) => a + b, 0);
        order.items = orderProducts;
        return order;
    } catch (err) {
        return err;
    }
}

// ----- HELPER: update products stock upon order success
const updateProductsStock = async (orderId) => {
    try {
        const orderItemsInfo = await pool.query(`
            SELECT id, product_id AS "productId", qty
            FROM order_items
            WHERE order_id = $1;`,
            [orderId]
        );
        orderItemsInfo.rows.forEach(async item => {
            await pool.query(`
                UPDATE products
                SET stock = stock - $2
                WHERE id = $1;`,
                [item.productId, item.qty]
            );
        });
        return orderItemsInfo.rows;
    } catch (err) {
        return err;
    }
}

const create = async (req, res, next) => {
    if (!req.user) {
        return res.status(400).send({ message: 'Please login first!' });
    }
    const { cartId } = req.params;
    const userId = req.user.id;

    const cart = await getCart(cartId);
    if (!cart) {
        return res.status(400).send({ message: 'The order is empty!' });
    }
    try {
        // Create order
        const orderResult = await pool.query(
            'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id, user_id AS "userId", total, status, created, modified',
            [userId, cart.total]
        );
        if (orderResult.rows.length === 0) {
            return res.status(500).json({ message: err.message });
        }
        const order = orderResult.rows[0];
        // Populate order_items with cart_items
        const newOrderArray = cart.items.map(
                item => `(${order.id},'${item.productId}',${item.qty})`
            ).join(",");
        await pool.query(`
            INSERT INTO order_items (order_id, product_id, qty)
            VALUES ${newOrderArray}
            RETURNING id, order_id AS "orderId", product_id AS "productId", qty`
        );
        // Get items details and attach them to order
        const itemsDetails = await orderProdutcsInfo(order.id);
        order.items = itemsDetails;

        /* ----- PAYMENT TIME RIGHT HERE !!! -----

        console.log('Payment time!!!');
        // ------------ On payment OK ------------

        // -------- Update products stock --------
        console.log('Updating products stock!!');
        await updateProductsStock(order.id); */

        return res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

const getByUserId = async (req, res) => {
    const userId = req.user;
    if (!userId) {
        return res.status(400).send({ message: 'Please login first!' });
    }
    try {
        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE user_id = $1',
            [userId]
        );
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const order = await getOrder(orderResult.rows[0].id);
        if (order) {
            return res.status(200).json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getById = async (req, res) => {
    const userId = req.user;
    if (!userId) {
        return res.status(400).send({ message: 'Please login first!' });
    }
    const { orderId } = req.params;
    try {
        const order = await getOrder(orderId);
        if (order) {
            res.status(200).json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const updateById = async (req, res) => {
    const { orderId } = req.params;
    const { total, status } = req.body;
    const fields = [];
    const values = [];
  
    if (total) {
      fields.push('total');
      values.push(total);
    }
    if (status) {
      fields.push('status');
      values.push(status);
    }
  
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    try {
      const result = await pool.query(`
        UPDATE orders
        SET ${setClause}
        WHERE id = $${fields.length + 1}
        RETURNING id, user_id AS "userId", total, status, created, modified`,
        [...values, orderId]
      );
      res.status(200).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

const deleteById = async (req, res) => {
    const userId = req.user;
    if (!userId) {
        return res.status(400).send({ message: 'Please login first!' });
    }
    const { orderId } = req.params;
    try {
      await pool.query(
        'DELETE FROM orders WHERE id = $1',
        [orderId]
      );
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

const createPaymentIntet = async (req, res) => {
    const { items } = req.body;
  
    const calculateOrderAmount = (items) => {
      // Calculate the order total on the server to prevent
      // people from directly manipulating the amount on the client
      let total = 0;
      items.forEach((item) => {
        total += item.price * item.qty;
      });
      total = Math.round(total * 100);
      return total;
    };

    calculateOrderAmount(items);
    // res.send({ message: 'Payment intent created successfully' });
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: "usd",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });
  
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  }

module.exports = {
    create,
    getByUserId,
    getById,
    updateById,
    deleteById,
    createPaymentIntet,
    updateProductsStock
}
