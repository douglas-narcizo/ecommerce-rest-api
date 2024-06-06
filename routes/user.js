const userRouter = require('express').Router();
const passport = require('passport');
const userCtl = require('../controllers/user');

/**
 * @swagger
 * tags:
 *   name: users
 *   description: The Users managing API
 */

// Register User
userRouter.route('/register')
.post( userCtl.register );

// Login User
userRouter.route('/login')
.post( passport.authenticate('local', { failureRedirect: "/login" }),
  (req, res) => {
    //res.status(200).json(req.user);
    res.status(200).redirect(`/api/users/${req.user.id}`);
});

// Logout User
userRouter.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.status(200).json({ message: 'Logged out' });
  });
});

userRouter.route('/')
.get( userCtl.getAll );

userRouter.route('/:userId')
.get( userCtl.getOneById )
.put( userCtl.updateById )
.delete( userCtl.deleteById );


module.exports = userRouter;

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: the endpoint to register a new user
 *     tags: [users]
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
 * /api/users/login:
 *   post:
 *     summary: logs user into the system
 *     tags: [users]
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
 * /api/users/logout:
 *   post:
 *     summary: logs out current logged in user session
 *     tags: [users]
 *     description: ''
 *     parameters: []
 *     responses:
 *       default:
 *         description: Successful operation
 */

/**
 * @swagger
 * /api/users/{userId}:
 *   put:
 *     summary: UPDATES a user's info
 *     tags: [users]
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID of user to update
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
 *     summary: returns the identified user object
 *     tags: [users]
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: the ID of the user
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
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
 *     tags: [users]
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID of user to delete
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
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
 *           type: integer
 *           format: int64
 *           description: The user's ID
 *           example: 1
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