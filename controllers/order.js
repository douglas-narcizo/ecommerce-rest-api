const pool = require('../db');

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

const addToOrder = async (req, res) => {
    const { user_id, product_id, qty } = req.body;
    try {
        // Try to find user's order
        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE user_id = $1',
            [user_id]
        );

        // If a order doesn't exist, create one
        let order;
        if (orderResult.rows.length === 0) {
            const neworderResult = await pool.query(
                'INSERT INTO orders (user_id) VALUES ($1) RETURNING *',
                [user_id]
            );
            order = neworderResult.rows[0];
        } else {
            order = orderResult.rows[0];
        }

        // Look if current product is already in the order
        const orderItemResult = await pool.query(
            'SELECT * FROM order_items WHERE order_id = $1 AND product_id = $2',
            [order.id, product_id]
        );

        // If product is found, update it, and if not, add to order
        let orderItems;
        if (orderItemResult.rows.length === 0) {
            orderItems = await pool.query(`
                INSERT INTO order_items (order_id, product_id, qty)
                VALUES ($1, $2, $3)
                RETURNING *`,
                [order.id, product_id, qty]
            );
        } else {
            orderItems = await pool.query(`
                UPDATE order_items SET qty = qty + $3
                WHERE order_id = $1 AND product_id = $2
                RETURNING *`, //  WHERE order_id = $1
                [order.id, product_id, qty]
            );
        }
        orderItems = await orderProdutcsInfo(order.id);
        res.status(201).json({
            order: order,
            items: orderItems,
        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getByUserId = async (req, res) => {
    const { user_id } = req.params;
    try {
        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE user_id = $1',
            [user_id]
        );
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const order = orderResult.rows[0];
        const orderItemsResult = await pool.query(
            'SELECT * FROM order_items WHERE order_id = $1',
            [order.id]
        );
        if (orderItemsResult.rows.length === 0) {
            order.total = 0;
            return res.json({
                order,
                items: [],
            });
        }
        const orderProducts = await orderProdutcsInfo(order.id);
        order.total = orderProducts.map(item => item.subtotal).reduce((a, b) => a + b, 0);
        res.json({
            order,
            items: orderProducts,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getById = async (req, res) => {
}

const deleteById = async (req, res) => {
}

module.exports = {
    addToOrder,
    getByUserId,
    getById,
    deleteById
}

/*
SAMPLE DATA FOR TESTING PURPOSES:

user_id, product_id, qty
{"user_id":1,"product_id":2,"qty":3}

user_id

*/