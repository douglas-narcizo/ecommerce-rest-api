// --------------------------------------
//   This module is executed only once
//    at API installation process to
//    initialize the Database schema
// --------------------------------------

const { Client } = require('pg')
const { DB } = require('./config')

const createTables = async () => {

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id              INT             SERIAL PRIMARY KEY,
      email           VARCHAR(50)     NOT NULL,      
      password        TEXT            NOT NULL,
      first_name      VARCHAR(50)     NOT NULL,
      last_name       VARCHAR(50)     NOT NULL
    );
  `

  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id              INT             SERIAL PRIMARY KEY,
      name            VARCHAR(50)     NOT NULL,
      category        VARCHAR(50)     NOT NULL,
      price           REAL            NOT NULL,
      description     VARCHAR(250),
      stock           INT             NOT NULL
    );
  `

  const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS orders (
      id              INT             SERIAL PRIMARY KEY,
      user_id         INT             NOT NULL,
      status          VARCHAR(20)     NOT NULL,
      created         DATE,
      modified        DATE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `

  const createOrderItemsTable = `
    CREATE TABLE IF NOT EXISTS orderItems (
      id              INT             SERIAL PRIMARY KEY,
      order_id        INT             NOT NULL,
      product_id      INT             NOT NULL,
      qty             INT             NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `

  const createCartsTable = `
    CREATE TABLE IF NOT EXISTS carts (
      id              INT             SERIAL PRIMARY KEY,
      user_id         INT             NOT NULL,
      created         DATE,
      modified        DATE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `

  const createCartItemsTable = `
    CREATE TABLE IF NOT EXISTS cartItems (
      id              INT             SERIAL PRIMARY KEY,
      cart_id         INT             NOT NULL,
      product_id      INT             NOT NULL,
      qty             INT             NOT NULL,
      FOREIGN KEY (cart_id) REFERENCES carts(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `

  try {
    const db = new Client({
      user: DB.PGUSER,
      host: DB.PGHOST,
      database: DB.PGDATABASE,
      password: DB.PGPASSWORD,
      port: DB.PGPORT
    });

    await db.connect();

    // Create tables on database
    await db.query(createUsersTable);
    await db.query(createProductsTable);
    await db.query(createOrdersTable);
    await db.query(createOrderItemsTable);
    await db.query(createCartsTable);
    await db.query(createCartItemsTable);

    await db.end();

  } catch(err) {
    console.log("ERROR CREATING ONE OR MORE TABLES: ", err);
  }

}

createTables();