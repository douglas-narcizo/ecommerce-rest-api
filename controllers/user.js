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

/* --- obsolete admin function to return all users list ---
const getAll = async (req, res) => {
  if (req.user) {
    try {
      const result = await pool.query('SELECT id, email, first_name AS "firstName", last_name AS "lastName" FROM users');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(400).json({ message: 'Please login first!' });
  }
}
 */

const getOneById = async (req, res) => {
  const { userId } = req.params;
  if (req.user == userId) {
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

const updateById = async (req, res) => {
  const { userId } = req.body;
  const { email, password, firstName, lastName } = req.body;
  
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
//  getAll,
  getOneById,
  updateById,
  deleteById
}
