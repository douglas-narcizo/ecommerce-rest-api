const cartRouter = require('express').Router();
const cartCtl = require('../controllers/cart');
const orderCtl = require('../controllers/order');

cartRouter.route('/')
.get( cartCtl.getByUserId )
.post( cartCtl.addToCart )
.delete( cartCtl.deleteByUserId );

cartRouter.route('/:cartId')
.get( cartCtl.getById )
.post( cartCtl.addToCart )
.put( cartCtl.updateById )
.delete( cartCtl.deleteById );

cartRouter.route('/:cartId/checkout')
.post( orderCtl.create );

module.exports = cartRouter;

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: this route is intended to be used when you DON'T have a CART ID, when the first product ia added.
 *     tags: [cart]
 *     requestBody:
 *       required: true
 *       description: If a user is logged in, their ID is retrieved from session and attached to the request
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *                 format: int64
 *                 example: 1
 *               qty:
 *                 type: integer
 *                 format: int32
 *                 example: 1
 *     responses:
 *       201:
 *         description: Product was successfully added to / updated in the cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/cart'
 *       400:
 *         description: Bad request
 *   get:
 *     summary: use this endpoint to get the shopping cart object for the current user, if logged in.
 *     tags: [cart]
 *     requestBody:
 *       description: If user is logged in, their ID is retrieved from session and attached to the request
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: the User ID must be provided by the user session - the user must be signed in
 *                 example: "01234567-89ab-cdef-0123-456789abcedf"
 *     responses:
 *       200:
 *         description: OK - the cart object is returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/cart'
 *       400:
 *         description: Cart not found
 *   delete:
 *     summary: DELETEs the cart for the current user, if logged in
 *     tags: [cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: the ID of the user whose cart should be deleted
 *                 example: "01234567-89ab-cdef-0123-456789abcedf"
 *     responses:
 *       204:
 *         description: No content - cart deleted
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/cart/{cartId}:
 *   post:
 *     summary: a POST request to this endpoint ADDS or UPDATES a product in the provided shopping cart
 *     tags: [cart]
 *     parameters:
 *       - name: cartId
 *         in: path
 *         description: ID of cart to update
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       201:
 *         description: Product was successfully added to / updated in the cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/cart'
 *       400:
 *         description: Bad request
 *   get:
 *     summary: a GET request to this endpoint returns the identified shopping cart object
 *     tags: [cart]
 *     parameters:
 *       - name: cartId
 *         in: path
 *         description: the ID of the cart
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       200:
 *         description: OK - the cart object is returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/cart'
 *       404:
 *         description: Cart not found
 *   delete:
 *     summary: DELETEs the cart with provided ID
 *     tags: [cart]
 *     parameters:
 *       - name: cartId
 *         in: path
 *         description: ID of cart to delete
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       204:
 *         description: No content - cart deleted
 *       500:
 *         description: Server error
 *   put:
 *     summary: a PUT request to this endpoint updates the userId associated with the provided shopping cart
 *     tags: [cart]
 *     parameters:
 *       - name: cartId
 *         in: path
 *         description: ID of cart to update
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 format: int64
 *                 description: The new userId to associate with the cart
 *                 example: 1
 *     responses:
 *       200:
 *         description: Cart was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/cart'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/cart/{cartId}/checkout:
 *   post:
 *     summary: creates an order from the provided shopping cart
 *     tags: [cart]
 *     parameters:
 *       - name: cartId
 *         in: path
 *         description: ID of the cart to checkout
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: integer
 *                 format: int64
 *                 description: the User ID must be provided by the user session - the user must be signed in
 *                 example: 1
 *     responses:
 *       201:
 *         description: An order was created from the current cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/cart'
 *       400:
 *         description: Bad request

 */

/**
 * @swagger
 * components:
 *   schemas:
 *     cart:
 *       type: object
 *       required:
 *         - userId
 *         - items
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: Auto-generated id of the cart
 *           example: 1
 *         userId:
 *           type: integer
 *           format: int64
 *           description: The id of the user who owns the cart
 *           example: 1
 *         created:
 *           type: string
 *           description: The timestamp when the cart was created
 *           example: "2024-05-22T23:11:53.308Z"
 *         modified:
 *           type: string
 *           description: The timestamp when the cart was last updated
 *           example: "2024-05-22T23:11:53.308Z"
 *         total: 
 *           type: number
 *           description: The sum of the prices for all items in the cart
 *           example: 1.98
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/cartItem'
 *     cartItem:
 *       type: object
 *       required:
 *         - productId
 *         - qty
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: The item's ID
 *           example: 1
 *         cartId:
 *           type: integer
 *           format: int64
 *           description: The ID of the cart
 *           example: 1
 *         productId:
 *           type: integer
 *           format: int64
 *           description: The id of the product
 *           example: 1
 *         qty:
 *           type: integer
 *           format: int32
 *           description: The quantity of the product in the cart
 *           example: 2
 *         name:
 *           type: string
 *           description: The product's name
 *           example: "pencil"
 *         price:
 *           type: number
 *           description: Product's price per unit
 *           example: 0.99
 *         description:
 *           type: string
 *           description: The product's description
 *           example: "An excellent tool to write"
 *         category:
 *           type: string
 *           description: The category of the product
 *           example: "stationery"
 *         subtotal:
 *           type: number
 *           description: The price of the product multiplied by its quantity in the cart 
 *           example: 1.98
 */