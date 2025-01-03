const userRouter = require('express').Router();
const passport = require('passport');
const userCtl = require('../controllers/user');

/**
 * @swagger
 * tags:
 *   name: user
 *   description: The Users managing API
 */

// Register User
userRouter.route('/register')
.post( userCtl.register );

// Login User
userRouter.route('/login')
.post( passport.authenticate('local'),
  (req, res) => {
    res.status(200).json(req.user);
});

// Logout User
userRouter.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.status(200).json({ message: 'Logged out' });
  });
});


userRouter.route('/:userId')
.get( userCtl.getOneById )
.put( userCtl.updateById )
.delete( userCtl.deleteById );

module.exports = userRouter;

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: register a new user's account
 *     tags: [user]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email used to create user account
 *                 example: "john@email.com"
 *               password:
 *                 type: string
 *                 example: "12345"
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   format: int64
 *                   description: Auto-generated user ID
 *                   example: 10
 *                 email:
 *                   type: string
 *                   example: "john@email.com"
 *                 firstName:
 *                   type: string
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   example: "Doe"
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: logs user into the system
 *     tags: [user]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email used to create user account
 *                 example: "john@email.com"
 *               password:
 *                 type: string
 *                 example: "12345"
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   format: int64
 *                   description: User ID
 *                   example: 10
 *                 email:
 *                   type: string
 *                   example: "john@email.com"
 *                 firstName:
 *                   type: string
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   example: "Doe"
 * /api/user/logout:
 *   post:
 *     summary: logs out current logged in user session
 *     tags: [user]
 *     description: ''
 *     parameters: []
 *     responses:
 *       default:
 *         description: Successful operation
 */

/**
 * @swagger
 * /api/user/:
 *   put:
 *     summary: UPDATES a user's info
 *     tags: [user]
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
 *                 description: ID of user to update
 *                 example: "01234567-89ab-cdef-0123-456789abcedf"
 *               email:
 *                 type: string
 *                 description: The email that is used to log into user account
 *                 example: "john@email.com"
 *               password:
 *                 type: string
 *                 example: "12345"
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *     responses:
 *       201:
 *         description: user successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user'
 *       400:
 *         description: Bad request
 *   get:
 *     summary: returns the currently logged user object
 *     tags: [user]
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
 *                 description: the ID of the user to be retrieved
 *                 example: "01234567-89ab-cdef-0123-456789abcedf"
 *     responses:
 *       200:
 *         description: OK - the user object is returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user'
 *       404:
 *         description: user not found
 *   delete:
 *     summary: DELETEs the user with provided ID
 *     tags: [user]
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
 *                 description: the ID of the user to be deleted
 *                 example: "01234567-89ab-cdef-0123-456789abcedf"
 *     responses:
 *       204:
 *         description: No content - user deleted
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     user:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The user's ID
 *           example: "01234567-89ab-cdef-0123-456789abcedf"
 *         email:
 *           type: string
 *           description: The email used to create user account and log in
 *           example: "john@email.com"
 *         password:
 *           type: string
 *           example: "12345"
 *         firstName:
 *           type: string
 *           example: "John"
 *         lastName:
 *           type: string
 *           example: "Doe"
 */