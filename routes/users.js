var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth.controller');
const { catchAsyncHandle } = require('../middlewares/error.middleware');
const passport = require('passport');
const GoogleStrategy = require("passport-google-oauth2").Strategy;
router.get('/',(req,res) => {
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
router.get('/login/google',
  passport.authenticate('google', { 
    scope:
      [ 'email', 'profile' ] 
    }
  )
);

router.get('/login/google/callback',
  passport.authenticate("google", { failureRedirect: "/" }),
  catchAsyncHandle(authController.logInGoogle)
);

module.exports = router;
