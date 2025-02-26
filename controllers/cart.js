const pool = require('../db');

// ----- HELPER: retrieve product info from table "products"
const cartProdutcsInfo = async (cartId) => {
    try {
        const cartItemsInfo = await pool.query(`
            SELECT cart_items.id, cart_id AS "cartId", product_id AS "productId", qty, name, price, description, category, preview
            FROM cart_items
            INNER JOIN products
            ON products.id = cart_items.product_id
            WHERE cart_id = $1
            ORDER BY cart_items.id;`,
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
            'SELECT id, cart_id AS "cartId", product_id AS "productId", qty FROM cart_items WHERE cart_id = $1',
            [cartId]
        );
        if (cartItemsResult.rows.length === 0) {
            return {
                items: [],
                total: 0,
            };
        }
        const cartProducts = await cartProdutcsInfo(cartId);
        const total = cartProducts.map(item => item.subtotal).reduce((a, b) => a + b, 0).toFixed(2);
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
            'SELECT id, user_id AS "userId", created, modified FROM carts WHERE id = $1',
            [cartId]
        );
        if (cartResult.rows.length === 0) {
            return null;
        }
        const cart = cartResult.rows[0];
        cartResult = await getCartItems(cartId);
        cart.items = cartResult.items;
        cart.itemsCount = cart.items.map(item => item.qty).reduce((a, b) => a + b, 0);
        cart.total = cartResult.total;
        return cart;
    } catch (err) {
        return err;
    }
}

const addToCart = async (req, res) => {
    const { productId, qty } = req.body;
    let { cartId } = req.params;
    const userId = req.user ? req.user.id : null;
    try {
        let cart;
        let cartResult;

        if (cartId) {
            // If a cartId is provided, select it
            cartResult = await pool.query(
                'SELECT id, user_id AS "userId", created, modified FROM carts WHERE id = $1',
                [cartId]
            );
            cart = cartResult.rows[0];
        } else if (userId) {
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
        } else {
            // If user is not logged and no cartId is provided, create a new empty cart without user
            cartResult = await pool.query(
                'INSERT INTO carts (created) VALUES (NOW()) RETURNING id, user_id AS "userId", created, modified'
            );
            cart = cartResult.rows[0];
        }

        // Look if current product is already in the cart
        const cartItemResult = await pool.query(
            'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
            [cart.id, productId]
        );

        // If that product is already in the cart, update it, and if not, add to cart
        let cartItems;
        if (cartItemResult.rows.length === 0) {
            cartItems = await pool.query(`
                INSERT INTO cart_items (cart_id, product_id, qty)
                VALUES ($1, $2, $3)
                RETURNING id, cart_id AS "cartId", product_id AS "productId", qty`,
                [cart.id, productId, qty]
            );
        } else if (cartItemResult.rows[0].qty + qty <= 0) {
            cartItems = await pool.query(`
                DELETE FROM cart_items
                WHERE cart_id = $1 AND product_id = $2
                RETURNING id, cart_id AS "cartId", product_id AS "productId", qty`,
                [cart.id, productId]
            );
        } else {
            cartItems = await pool.query(`
                UPDATE cart_items SET qty = qty + $3
                WHERE cart_id = $1 AND product_id = $2
                RETURNING id, cart_id AS "cartId", product_id AS "productId", qty`,
                [cart.id, productId, qty]
            );
        }
        cartItems = await cartProdutcsInfo(cart.id);
        // Update cart modification timestamp
        cartResult = await pool.query(`
            UPDATE carts SET modified = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, user_id AS "userId", created, modified`,
            [cart.id]
        );
        cart = cartResult.rows[0];
        cart.items = cartItems;
        cart.itemsCount = cartItems.map(item => item.qty).reduce((a, b) => a + b, 0);
        cart.total = cartItems.map(item => item.subtotal).reduce((a, b) => a + b, 0).toFixed(2);
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
        const userId = req.user.id;
        let cartResult = await pool.query(
            'SELECT id, user_id AS "userId", created, modified FROM carts WHERE user_id = $1',
            [userId]
        );
        if (cartResult.rows.length === 0) {
            return null; // res.status(404).json({ message: 'Cart not found for this user' });
        }
        const cart = cartResult.rows[0];
        cartResult = await getCartItems(cart.id);
        cart.items = cartResult.items;
        cart.itemsCount = cart.items.map(item => item.qty).reduce((a, b) => a + b, 0);
        cart.total = cartResult.total;
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteByUserId = async (req, res) => {
    if (!req.user) {
        return res.status(404).json({ message: 'Please log in first!' });
    }
    try {
      const userId = req.user.id;
      const result = await pool.query(
        'DELETE FROM carts WHERE user_id = $1',
        [userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No cart found for this user' });
      }
      res.status(204).send(); //(200).json({ message: 'Cart deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message }); //({ message: 'Server error', error: err.message });
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

const updateById = async (req, res) => {
    if (!req.user) {
        return res.status(404).json({ message: 'Please log in first!' });
    }
    const { cartId } = req.params;
    const userId = req.user.id;
    try {
      const result = await pool.query(
        'UPDATE carts SET user_id = $1, modified = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, user_id AS "userId", created, modified',
        [userId, cartId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Cart not found' });
      }
      const updatedCart = await getCart(cartId) // result.rows[0];
      res.status(200).json(updatedCart);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
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
  deleteByUserId,
  getById,
  updateById,
  deleteById
};
