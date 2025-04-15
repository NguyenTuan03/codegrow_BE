var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth.controller');
const { catchAsyncHandle } = require('../middlewares/error.middleware');
const passport = require('passport');
const AuthMiddleware = require('../middlewares/auth.middleware');
const GoogleStrategy = require("passport-google-oauth2").Strategy;
router.get('/',
  catchAsyncHandle(AuthMiddleware),
  (req,res) => {
  res.send('<a href="/auth/login/google">Google</a>')
}) 
passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:process.env.GOOGLE_OAUTH_REDIRECT_URL,
    passReqToCallback:true
  },  
  function(request, accessToken, refreshToken, profile, done) {
    return done(null,profile)
  }
));
passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});
 
router.use(passport.initialize());
router.use(passport.session());
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to the system with email and password
 *     tags:
 *      - Auth
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
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mySecurePass123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *       401:
 *         description: Invalid email or password
 */
router.post('/login',
  catchAsyncHandle(authController.logIn)
)
router.get('/refresh-token',
  catchAsyncHandle(authController.refreshToken)
)
/**
 * @swagger
 * /auth/login/google:
 *   get:
 *     summary: Return google page
 *     tags:
 *      - Auth
 *     responses:
 *       200:
 *         description: Return google page
 */
router.get('/login/google',
  passport.authenticate('google', { 
    scope:
      [ 'email', 'profile' ] 
    }
  )
);
/**
 * @swagger
 * /auth/login/google/callback:
 *   get:
 *     summary: Callback from Google login
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logged in successfully
 */
router.get('/login/google/callback',
  passport.authenticate("google", { failureRedirect: "/" }),
  catchAsyncHandle(authController.logInGoogle)
);
/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: 
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mySecret123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
router.post('/signup', 
  catchAsyncHandle(authController.signUp)
)
/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verify email token and authenticate user
 *     tags: 
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: ya29.A0ARrdaM...
 *     responses:
 *       200:
 *         description: User verified successfully
 *       401:
 *         description: Invalid or expired token
 */
router.post('/verify-email',
  catchAsyncHandle(authController.Verify)
)
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send password reset email
 *     tags: 
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: Email not found
 */

router.post('/forgot-password',
  catchAsyncHandle(authController.forgotPassword)
)
/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset user's password with token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newpass
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123resetToken
 *               newpass:
 *                 type: string
 *                 format: password
 *                 example: newStrongPassword!1
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */

router.post('/reset-password',
  catchAsyncHandle(authController.resetPassword)
)
module.exports = router;
