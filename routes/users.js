var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth.controller');
const { catchAsyncHandle } = require('../middlewares/error.middleware');
const passport = require('passport');

passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:process.env.GOOGLE_OUATH_REDIRECT_URL,
    passReqToCallback:true
  },
  function(request, accessToken, refreshToken, profile, done) {
    return done(err,user)
  }
));

router.get('/auth/google',
  passport.authenticate('google', { 
    scope:
      [ 'email', 'profile' ] 
    }
  )
);

app.get( '/auth/google/callback',
  passport.authenticate( 'google', {
      successRedirect: '/auth/google/success',
      failureRedirect: '/auth/google/failure'  
  }),
  catchAsyncHandle(authController.logInGoogle)
);

module.exports = router;
