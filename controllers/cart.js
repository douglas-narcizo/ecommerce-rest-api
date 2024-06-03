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

// ----- HELPER: retrieve cart items
const getCartItems = async (cartId) => {
    try {
        const cartItemsResult = await pool.query(
            'SELECT * FROM cart_items WHERE cart_id = $1',
            [cartId]
        );
        if (cartItemsResult.rows.length === 0) {
            return {
                items: [],
                total: 0,
            };
        }
        const cartProducts = await cartProdutcsInfo(cartId);
        const total = cartProducts.map(item => item.subtotal).reduce((a, b) => a + b, 0);
        return {
            items: cartProducts,
            total: total,
        };
    } catch (err) {
        return err;
    }
}

const getCart = async (cartId) => {
    try {
        let cartResult = await pool.query(
            'SELECT * FROM carts WHERE id = $1',
            [cartId]
        );
        if (cartResult.rows.length === 0) {
            return null;
        }
        const cart = cartResult.rows[0];
        cartResult = await getCartItems(cartId);
        cart.total = cartResult.total;
        cart.items = cartResult.items
        return cart;
    } catch (err) {
        return err;
    }
}

const addToCart = async (req, res) => {
    const { product_id, qty } = req.body;
    let { cartId } = req.params;
    const userId = req.user;
    try {
        let cart;
        let cartResult;

        if (userId) {
            // Try to find a cart for current user
            cartResult = await pool.query(
                'SELECT * FROM carts WHERE user_id = $1',
                [userId]
            );
            // If user doesn't have a cart, create one
            if (cartResult.rows.length === 0) {
                const newCartResult = await pool.query(
                    'INSERT INTO carts (user_id, created) VALUES ($1, CURRENT_TIMESTAMP) RETURNING *',
                    [userId]
                );
                cart = newCartResult.rows[0];
            } else {
                cart = cartResult.rows[0];
            }
        } else if (cartId) {
            // If a cartId is provided, select it
            cartResult = await pool.query(
                'SELECT * FROM carts WHERE id = $1',
                [cartId]
            );
            cart = cartResult.rows[0];
        } else {
            // If user is not logged and no cartId is provided, create a new empty cart without user
            cartResult = await pool.query(
                'INSERT INTO carts (created) VALUES (NOW()) RETURNING *'
            );
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
        } else if (cartItemResult.rows[0].qty + qty <= 0) {
            cartItems = await pool.query(`
                DELETE FROM cart_items
                WHERE cart_id = $1 AND product_id = $2
                RETURNING *`,
                [cart.id, product_id]
            );
        } else {
            cartItems = await pool.query(`
                UPDATE cart_items SET qty = qty + $3
                WHERE cart_id = $1 AND product_id = $2
                RETURNING *`,
                [cart.id, product_id, qty]
            );
        }
        cartItems = await cartProdutcsInfo(cart.id);
        // Update cart modification timestamp
        cartResult = await pool.query(`
            UPDATE carts SET modified = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [cart.id]
        );
        cart = cartResult.rows[0];
        cart.total = cartItems.map(item => item.subtotal).reduce((a, b) => a + b, 0).toFixed(2);
        cart.items = cartItems;
        res.status(201).json(cart);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getByUserId = async (req, res) => {
    if (!req.user) {
        return res.status(404).json({ message: 'Please log in first!' });
    }
    try {
        const userId = req.user;
        let cartResult = await pool.query(
            'SELECT * FROM carts WHERE user_id = $1',
            [userId]
        );
        if (cartResult.rows.length === 0) {
            return res.status(404).json({ message: 'Cart not found for this user' });
        }
        const cart = cartResult.rows[0];
        cartResult = await getCartItems(cart.id);
        cart.total = cartResult.total;
        cart.items = cartResult.items;
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getById = async (req, res) => {
    const { cartId } = req.params;
    try {
        const cart = await getCart(cartId);
        if (cart) {
            res.status(200).json(cart);
        } else {
            res.status(404).json({ message: 'Cart not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const deleteById = async (req, res) => {
    const { cartId } = req.params;
    try {
      await pool.query(
        'DELETE FROM carts WHERE id = $1',
        [cartId]
      );
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

module.exports = {
    getCart,
    addToCart,
    getByUserId,
    getById,
    deleteById
}

/*
SAMPLE DATA FOR TESTING PURPOSES:

user_id, product_id, qty
{"user_id":1,"product_id":2,"qty":3}

*/