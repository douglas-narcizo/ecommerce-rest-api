const pool = require('../db');
// const passport = require('passport');
const bcrypt = require('bcryptjs');

/*=========================================
/   REGISTER USER  -  [POST]
/   auth. required: no
/   endpoint: /users/register
/   req.body: {
/       "email":"johndoe@example.com",
/       "password":"MyGoodPwd",
/       "first_name":"John",
/       "last_name":"Doe"
/     }
/ ========================================= */
const register = async (req, res) => {
  const { email, password, first_name, last_name } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const newUser = await pool.query(`
      INSERT INTO users (email, password, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, first_name, last_name`,
      [email, hash, first_name, last_name]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/*=========================================
/   GET ALL USERS  -  [GET]
/   auth. required: yes
/   endpoint: /users
/   req.body: no
/ ========================================= */
const getAll = async (req, res) => {
  if (req.user) {
    try {
      const result = await pool.query('SELECT id, email, first_name, last_name FROM users');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(400).json({ message: 'Please login first!' });
  }
}


/*=========================================
/   GET USER  -  [GET]
/   auth. required: yes
/   endpoint: /users/{userId}
/   req.body: no
/ ========================================= */
const getOneById = async (req, res) => {
  const { userId } = req.params;
  if (req.user == userId) {
    try {
      const result = await pool.query(`
        SELECT id, email, first_name, last_name
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

/*=========================================
/   UPDATE USER  -  [PUT]
/   auth. required: yes
/   endpoint: /users/{userId}
/   req.body: {
/       ["email":"johndoe@example.com"],
/       ["password":"MyGoodPwd"],
/       ["first_name":"John"],
/       ["last_name":"Doe"]
/     }  --  (only changed properties are needed)
/ ========================================= */
const updateById = async (req, res) => {
  const { userId } = req.params;
  const { email, password, first_name, last_name } = req.body;
  
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
  if (first_name) {
    fields.push('first_name');
    values.push(first_name);
  }
  if (last_name) {
    fields.push('last_name');
    values.push(last_name);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  console.log(setClause);
  console.log(`UPDATE users SET ${setClause} WHERE id = $${fields.length + 1}`, [...values, userId]);

  try {
    await pool.query(`
      UPDATE users
      SET ${setClause}
      WHERE id = $${fields.length + 1}`,
      [...values, userId]
    );
    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

const deleteById = async (req, res) => {
  const { userId } = req.params;
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
  getAll,
//  create,
  getOneById,
  updateById,
  deleteById
}

/*========== TEST DATA ==========
{"id":1,"email":"matraca@trica.com","password":"alue23skj","first_name":"Matraca","last_name":"Trica"}
{"id":2,"email":"naba@bisco.com","password":"asi3210ij$","first_name":"Naba","last_name":"Bisco"}
{"id":3,"email":"johndoe@example.com","password":"MyGoodPwd","first_name":"John","last_name":"Doe"}
{"id":4,"email":"ohmygod@heaven.com","password":"MyGodPwd","first_name":"Jesus","last_name":"Nazarian"}
{"id":5,"email":"earth@galaxy.com","password":"blueplanet","first_name":"Mighty","last_name":"Planet"}
*/