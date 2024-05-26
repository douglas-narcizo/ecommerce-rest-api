const pool = require('../db');

const getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Test body:
// {"email":"johndoe@example.com","password":"MyGoodPwd","first_name":"John","last_name":"Doe"}

const create = async (req, res) => {
  const { email, password, first_name, last_name } = req.body;
//  console.log(req.body);
  try {
    const result = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [email, password, first_name, last_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

const getOneById = async (req, res) => {
}

const updateById = async (req, res) => {
}

const deleteById = async (req, res) => {
}

module.exports = {
  getAll,
  create,
  getOneById,
  updateById,
  deleteById
}