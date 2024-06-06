const pool = require('../db');
const { getCart } = require('./cart');

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
            SELECT id, product_id, qty
            FROM order_items
            WHERE order_id = $1;`,
            [orderId]
        );
        orderItemsInfo.rows.forEach(async item => {
            await pool.query(`
                UPDATE products
                SET stock = stock - $2
                WHERE id = $1`,
                [item.productId, item.qty]
            );
        });
        return orderItemsInfo.rows;
    } catch (err) {
        return err;
    }
}

const create = async (req, res, next) => {
    const { cartId } = req.params;
    const userId = req.user;

    const cart = await getCart(cartId);
    if (!cart) {
        return res.status(400).send({ message: 'The order is empty!' });
    }
    if (!userId) {
        return res.status(400).send({ message: 'Please login first!' });
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
                item => `(${order.id},${item.productId},${item.qty})`
            ).join(",");
        await pool.query(`
            INSERT INTO order_items (order_id, product_id, qty)
            VALUES ${newOrderArray}
            RETURNING id, order_id AS "orderId", product_id AS "productId", qty`
        );
        // Get items details and attach them to order
        const itemsDetails = await orderProdutcsInfo(order.id);
        order.items = itemsDetails;

        // ----- PAYMENT TIME RIGHT HERE !!! -----

        console.log('Payment time!!!');
        // ------------ On payment OK ------------

        // -------- Update products stock --------
        console.log('Updating products stock!!');
        await updateProductsStock(order.id);

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

module.exports = {
    create,
    getByUserId,
    getById,
    updateById,
    deleteById
}
