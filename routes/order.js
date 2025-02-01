const orderRouter = require('express').Router();
const orderCtl = require('../controllers/order');

orderRouter.route('/')
.get( orderCtl.getByUserId );

orderRouter.route('/create-payment-intent')
.post( orderCtl.createPaymentIntet );

orderRouter.route('/:orderId')
.get( orderCtl.getById )
.put( orderCtl.updateById )
.delete( orderCtl.deleteById );

module.exports = orderRouter;

/**
 * @swagger
 * /api/order/{orderId}:
 *   get:
 *     summary: returns the identified order object
 *     tags: [orders]
 *     parameters:
 *       - name: orderId
 *         in: path
 *         description: the ID of the order
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "01234567-89ab-cdef-0123-456789abcedf"
 *     responses:
 *       200:
 *         description: OK - the order object is returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/order'
 *       404:
 *         description: order not found
 *   put:
 *     summary: UPDATES info in the provided order
 *     tags: [orders]
 *     parameters:
 *       - name: orderId
 *         in: path
 *         description: ID of order to update
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "01234567-89ab-cdef-0123-456789abcedf"
 *     responses:
 *       201:
 *         description: Order was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/order'
 *       400:
 *         description: Bad request
 *   delete:
 *     summary: DELETEs the order with provided ID
 *     tags: [orders]
 *     parameters:
 *       - name: orderId
 *         in: path
 *         description: ID of order to delete
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "01234567-89ab-cdef-0123-456789abcedf"
 *     responses:
 *       204:
 *         description: No content - order deleted
 *       500:
 *         description: Server error
 * /api/order/create-payment-intent:
 *   post:
 *     summary: Create a payment intent for the order
 *     tags: [orders]
 *     parameters:
 *       - name: orderId
 *         in: path
 *         description: ID of the order to create a payment intent for
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "01234567-89ab-cdef-0123-456789abcedf"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                       description: The item's description
 *                       example: "xl-tshirt"
 *                     amount:
 *                       type: number
 *                       required: true
 *                       description: The item's price
 *                       example: 1000
 *     responses:
 *       200:
 *         description: OK - Payment intent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *                   description: The client secret for the payment intent
 *                   example: "pi_1F8vJg2eZvKYlo2C1z0g1z0g_secret_123456"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     order:
 *       type: object
 *       required:
 *         - userId
 *         - items
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Auto-generated id of the order
 *           example: "01234567-89ab-cdef-0123-456789abcedf"
 *         userId:
 *           type: integer
 *           format: int64
 *           description: The id of the user who owns the order
 *           example: 1
 *         total:
 *           type: number
 *           description: The sum of the prices for all items in the order
 *           example: 1.98
 *         status:
 *           type: string
 *           description: The current status of the order
 *           example: "pending"
 *         created:
 *           type: string
 *           description: The timestamp when the order was created
 *           example: "2024-05-22T23:11:53.308Z"
 *         modified:
 *           type: string
 *           description: The timestamp when the order was last updated
 *           example: "2024-05-22T23:11:53.308Z"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/orderItem'
 *     orderItem:
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
 *         qty:
 *           type: integer
 *           format: int32
 *           description: The quantity of the product in the order
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
 *           description: The price of the product multiplied by its quantity in the order 
 *           example: 1.98
 */