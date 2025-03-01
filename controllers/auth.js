const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');
const pool = require('../db');
const userCtl = require('../controllers/user');

module.exports = (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
          return done(null, false, { message: 'No user with that email' });
        }

        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return done(null, {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name
          });
        } else {
          return done(null, false, { message: 'Incorrect password' });
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.use(
    new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:4000/api/user/google/callback'
    },
    async (token, tokenSecret, profile, done) => {
      try {
        await userCtl.getOneByGoogleId(profile, done);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.use(
    new FacebookStrategy({
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: 'http://localhost:4000/api/user/facebook/callback',
      profileFields: ['id', 'name', 'picture', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        await userCtl.getOneByFacebookId(profile, done);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const userResult = await pool.query('SELECT id, email, first_name AS "firstName", last_name AS "lastName", picture FROM users WHERE id = $1', [id]);
      if (userResult.rows.length === 0) {
        return done(new Error('User not found'));
      }
      done(null, userResult.rows[0]); //.id); 
    } catch (err) {
      done(err);
    }
  });
};
