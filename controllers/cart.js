const pool = require('../db');

// ----- HELPER: retrieve product info from table "products"
const cartProdutcsInfo = async (cartId) => {
    try {
        const cartItemsInfo = await pool.query(`
            SELECT cart_items.id, cart_id, product_id, qty, name, price, description, category
            FROM cart_items
            INNER JOIN products
            ON products.id = cart_items.product_id
            WHERE cart_id = $1;`,
            [cartId]
        );
        cartItemsInfo.rows.forEach(item => item.subtotal = item.qty * item.price);
        return cartItemsInfo.rows;
    } catch (err) {
        return err;
    }
}

const addToCart = async (req, res) => {
    const { user_id, product_id, qty } = req.body;
    try {
        // Try to find user's cart
        const cartResult = await pool.query(
            'SELECT * FROM carts WHERE user_id = $1',
            [user_id]
        );

        // If a cart doesn't exist, create one
        let cart;
        if (cartResult.rows.length === 0) {
            const newCartResult = await pool.query(
                'INSERT INTO carts (user_id) VALUES ($1) RETURNING *',
                [user_id]
            );
            cart = newCartResult.rows[0];
        } else {
            cart = cartResult.rows[0];
        }

        // Look if current product is already in the cart
        const cartItemResult = await pool.query(
            'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
            [cart.id, product_id]
        );

        // If product is found, update it, and if not, add to cart
        let cartItems;
        if (cartItemResult.rows.length === 0) {
            cartItems = await pool.query(`
                INSERT INTO cart_items (cart_id, product_id, qty)
                VALUES ($1, $2, $3)
                RETURNING *`,
                [cart.id, product_id, qty]
            );
        } else {
            cartItems = await pool.query(`
                UPDATE cart_items SET qty = qty + $3
                WHERE cart_id = $1 AND product_id = $2
                RETURNING *`, //  WHERE cart_id = $1
                [cart.id, product_id, qty]
            );
        }
        cartItems = await cartProdutcsInfo(cart.id);
        res.status(201).json({
            cart,
            items: cartItems,
        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getByUserId = async (req, res) => {
    const { user_id } = req.params;
    try {
        const cartResult = await pool.query(
            'SELECT * FROM carts WHERE user_id = $1',
            [user_id]
        );
        if (cartResult.rows.length === 0) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        const cart = cartResult.rows[0];
        const cartItemsResult = await pool.query(
            'SELECT * FROM cart_items WHERE cart_id = $1',
            [cart.id]
        );
        if (cartItemsResult.rows.length === 0) {
            cart.total = 0;
            return res.json({
                cart,
                items: [],
            });
        }
        const cartProducts = await cartProdutcsInfo(cart.id);
        cart.total = cartProducts.map(item => item.subtotal).reduce((a, b) => a + b, 0);
        res.json({
            cart,
            items: cartProducts,
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
    addToCart,
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