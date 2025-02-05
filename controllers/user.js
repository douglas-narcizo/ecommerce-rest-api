const pool = require('../db');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const newUser = await pool.query(`
      INSERT INTO users (email, password, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, first_name AS "firstName", last_name AS "lastName"`,
      [email, hash, firstName, lastName]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

const getOneById = async (req, res) => {
  const { userId } = req.body;
  if (req.user && req.user.id == userId) {
    try {
      const result = await pool.query(`
        SELECT id, email, first_name AS "firstName", last_name AS "lastName"
        FROM users
        WHERE id = $1`,
        [userId]);
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'User not found!' });
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      res.status(400).json({ message: err.message });
    }      
  } else {
    res.status(400).json({ message: 'Please login first!' });
  }
}

const getOneByGoogleId = async (profile, done) => {
  try {
    const result = await pool.query(`
      SELECT id, email, first_name AS "firstName", last_name AS "lastName"
      FROM users
      WHERE google ->> 'id' = $1`,
      [profile.id]);

    if (result.rows.length === 0) {
      // User does not exist, create a new user
      const profileData = {
        id: profile.id,
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        picture: profile.photos[0].value,
      };
      const newUser = await pool.query(`
        INSERT INTO users (google, email, first_name, last_name)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, first_name AS "firstName", last_name AS "lastName"`,
        [profileData, profileData.email, profileData.firstName, profileData.lastName]);

      return done(null, newUser.rows[0]);
    } else {
      // User found, return the user
      return done(null, result.rows[0]);
    }
  } catch (err) {
    return done(err);
  }
};

const getOneByFacebookId = async (profile, done) => {
  try {
    const result = await pool.query(`
      SELECT id, email, first_name AS "firstName", last_name AS "lastName"
      FROM users
      WHERE facebook ->> 'id' = $1`,
      [profile.id]);

    if (result.rows.length === 0) {
      // User does not exist, create a new user
      const profileData = {
        id: profile.id,
        email: profile.id, // email: profile.emails[0].value,
        firstName: profile.name.givenName, // profile.displayName.split(' ')[0]
        lastName:  profile.name.familyName // profile.displayName.split(' ').pop()
      };
      const newUser = await pool.query(`
        INSERT INTO users (facebook, email, first_name, last_name)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, first_name AS "firstName", last_name AS "lastName"`,
        [profileData, profileData.email, profileData.firstName, profileData.lastName]);

      return done(null, newUser.rows[0]);
    } else {
      // User found, return the user
      return done(null, result.rows[0]);
    }
  } catch (err) {
    return done(err);
  }
};

const updateById = async (req, res) => {
  const { userId, email, password, firstName, lastName } = req.body;
  
  const fields = [];
  const values = [];

  if (email) {
    fields.push('email');
    values.push(email);
  }
  if (password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    fields.push('password');
    values.push(hash);
  }
  if (firstName) {
    fields.push('first_name');
    values.push(firstName);
  }
  if (lastName) {
    fields.push('last_name');
    values.push(lastName);
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

  try {
    const result = await pool.query(`
      UPDATE users
      SET ${setClause}
      WHERE id = $1
      RETURNING id, email, first_name AS "firstName", last_name AS "lastName"`,
      [userId, ...values]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found!' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteById = async (req, res) => {
  const { userId } = req.body;
  try {
    await pool.query(
      'DELETE FROM users WHERE id = $1',
      [userId]
    );
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  register,
  getOneById,
  getOneByGoogleId,
  getOneByFacebookId,
  updateById,
  deleteById
}
