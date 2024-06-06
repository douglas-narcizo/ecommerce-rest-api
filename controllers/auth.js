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

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const userResult = await pool.query('SELECT id, email, first_name AS "firstName", last_name AS "lastName" FROM users WHERE id = $1', [id]);
      if (userResult.rows.length === 0) {
        return done(new Error('User not found'));
      }
      done(null, userResult.rows[0].id); 
    } catch (err) {
      done(err);
    }
  });
};
