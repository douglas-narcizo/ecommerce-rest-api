const userRouter = require('express').Router();
const passport = require('passport');
const userCtl = require('../controllers/user');

// Register User
userRouter.route('/register')
.post( userCtl.register );

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

// Login User
userRouter.route('/login')
.post( passport.authenticate('local'),
  (req, res) => {
    res.status(200).json(req.user);
});

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
 */

// Google Authentication
userRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /api/user/google:
 *   get:
 *     summary: Initiates Google authentication
 *     tags: [user]
 *     responses:
 *       302:
 *         description: Redirects to Google for authentication
 */

// Google Callback
userRouter.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {    // async (req, res) => {
    res.redirect('http://localhost:3000/user');
  }
);

/**
 * @swagger
 * /api/user/google/callback:
 *   get:
 *     summary: Handles Google authentication callback
 *     tags: [user]
 *     responses:
 *       302:
 *         description: Redirects to home page on successful authentication
 *       401:
 *         description: Unauthorized - authentication failed
 */

// Verify Session
userRouter.route('/verify-session')
.get((req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user); //{ message: 'Authenticated' });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

/**
 * @swagger
 * /api/user/verify-session:
 *   get:
 *     summary: returns the authentication status for the current session
 *     tags: [user]
 *     responses:
 *       200:
 *         description: OK - user is authenticated
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
 *       401:
 *         description: not authenticated
 */

// Logout User
userRouter.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.status(200).json({ message: 'Logged out' });
  });
});

/**
 * @swagger
 * /api/user/logout:
 *   post:
 *     summary: logs out current logged in user session
 *     tags: [user]
 *     responses:
 *       200:
 *         description: Successful operation
 */

userRouter.route('/')
.get( userCtl.getOneById )
.put( userCtl.updateById )
.delete( userCtl.deleteById );

module.exports = userRouter;

/**
 * @swagger
 * /api/user:
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