const pool = require('../db');

const create = async (req, res) => {
  const { name, price, description, category, stock, preview } = req.body;
  console.log(req.body);
  try {
    const result = await pool.query(`
      INSERT INTO products (name, price, description, category, stock, preview)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [name, price, description, category, stock, preview]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

const getList = async (req, res) => {
  const { category } = req.query;
  try {
    let result;
    if (category) {
      result = await pool.query(
        'SELECT * FROM products WHERE category = $1',
        [category]
      );
    } else {
      result = await pool.query('SELECT * FROM products');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

const getOneById = async (req, res) => {
  const { productId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Product not found!' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

const updateById = async (req, res) => {
  const { productId } = req.params;
  const { name, price, description, category, stock, preview } = req.body;
  const fields = [];
  const values = [];

  if (name) {
    fields.push('name');
    values.push(name);
  }
  if (price) {
    fields.push('price');
    values.push(price);
  }
  if (description) {
    fields.push('description');
    values.push(description);
  }
  if (category) {
    fields.push('category');
    values.push(category);
  }
  if (stock) {
    fields.push('stock');
    values.push(stock);
  }
  if (preview) {
    fields.push('preview');
    values.push(preview);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  try {
    const result = await pool.query(`
      UPDATE products
      SET ${setClause}
      WHERE id = $${fields.length + 1}
      RETURNING *`,
      [...values, productId]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

const deleteById = async (req, res) => {
  const { productId } = req.params;
  try {
    await pool.query(
      'DELETE FROM products WHERE id = $1',
      [productId]
    );
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  create,
  getList,
  getOneById,
  updateById,
  deleteById
}
