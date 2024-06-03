const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const pool = require('../db');

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
            first_name: user.first_name,
            last_name: user.last_name
            // , authenticated: true
          });
        } else {
          return done(null, false, { message: 'Incorrect password' });
        }
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
      const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      if (userResult.rows.length === 0) {
        return done(new Error('User not found'));
      }
      /*
      const user = {
        id: userResult.rows[0].id,
      //  email: userResult.rows[0].email,
      //  first_name: userResult.rows[0].first_name,
      //  last_name: userResult.rows[0].last_name,
      //  is_admin: userResult.rows[0].is_admin
      }
      */
      // console.log(user);
      done(null, userResult.rows[0].id); 
    } catch (err) {
      done(err);
    }
  });
};
