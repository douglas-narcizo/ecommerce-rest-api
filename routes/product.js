const productRouter = require('express').Router();
const productCtl = require('../controllers/product');

/**
 * @swagger
 * tags:
 *   name: products
 *   description: The Products managing API
 */
 
productRouter.route('/')
.get( productCtl.getList )
.post( productCtl.create );

productRouter.route('/:productId')
.get( productCtl.getOneById )
.put( productCtl.updateById )
.delete( productCtl.deleteById );

module.exports = productRouter;

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: returns a list of products, queried by category
 *     tags: [products]
 *     parameters:
 *       - in: query
 *         name: category
 *         description: Categories to filter by
 *         required: false
 *         explode: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: OK - a list of products is returned
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/product'
 *       400:
 *         description: Bad request
 *   post:
 *     summary: a POST request to this endpoint ADDS a product in the shop
 *     tags: [products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 description: The product's name
 *                 example: "pencil"
 *               price:
 *                 type: number
 *                 description: Product's price per unit
 *                 example: 0.99
 *               description:
 *                 type: string
 *                 description: The product's description
 *                 example: "An excellent tool to write"
 *               category:
 *                 type: string
 *                 description: The category of the product
 *                 example: "stationery"
 *               stock:
 *                 type: integer
 *                 format: int32
 *                 description: The available stock of the product in the shop
 *                 example: 2
 *     responses:
 *       201:
 *         description: Product was successfully added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/product'
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /api/products/{productId}:
 *   put:
 *     summary: UPDATES a product in the shop
 *     tags: [products]
 *     parameters:
 *       - name: productId
 *         in: path
 *         description: ID of product to update
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: Product successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/product'
 *       400:
 *         description: Bad request
 *   get:
 *     summary: returns the identified product object
 *     tags: [products]
 *     parameters:
 *       - name: productId
 *         in: path
 *         description: the ID of the product
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: OK - the product object is returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/product'
 *       404:
 *         description: product not found
 *   delete:
 *     summary: DELETEs the product with provided ID
 *     tags: [products]
 *     parameters:
 *       - name: productId
 *         in: path
 *         description: ID of product to delete
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: No content - product deleted
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The item's ID
 *           example: "01234567-89ab-cdef-0123-456789abcedf"
 *         name:
 *           type: string
 *           description: The product's name
 *           example: "pencil"
 *         category:
 *           type: string
 *           description: The category of the product
 *           example: "stationery"
 *         price:
 *           type: number
 *           description: Product's price per unit
 *           example: 0.99
 *         description:
 *           type: string
 *           description: The product's description
 *           example: "An excellent tool to write"
 *         stock:
 *           type: integer
 *           format: int32
 *           description: The quantity of the product in the cart
 *           example: 2
 *         preview:
 *           type: string
 *           description: URL for product's preview image
 *           example: "../images/pencil.jpg"
 */