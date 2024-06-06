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
      id              SERIAL          PRIMARY KEY,
      email           VARCHAR(50)     NOT NULL,      
      password        TEXT            NOT NULL,
      first_name      VARCHAR(50)     NOT NULL,
      last_name       VARCHAR(50)     NOT NULL,
      is_admin        BOOL            DEFAULT FALSE
    );
  `

  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id              SERIAL          PRIMARY KEY,
      name            VARCHAR(50)     NOT NULL,
      category        VARCHAR(50),
      price           REAL,
      description     VARCHAR(250),
      stock           INT
    );
  `

  const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS orders (
      id              SERIAL          PRIMARY KEY,
      user_id         INT             NOT NULL,
      total           REAL,
      status          VARCHAR(15)     DEFAULT 'pending',
      created         TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
      modified        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `

  const createOrderItemsTable = `
    CREATE TABLE IF NOT EXISTS order_items (
      id              SERIAL          PRIMARY KEY,
      order_id        INT,
      product_id      INT,
      qty             INT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `

  const createCartsTable = `
    CREATE TABLE IF NOT EXISTS carts (
      id              SERIAL          PRIMARY KEY,
      user_id         INT,
      created         TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
      modified        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `

  const createCartItemsTable = `
    CREATE TABLE IF NOT EXISTS cart_items (
      id              SERIAL          PRIMARY KEY,
      cart_id         INT,
      product_id      INT,
      qty             INT,
      FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `

  const createUpdateModifiedProcedure = `
    CREATE OR REPLACE FUNCTION update_modified()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.modified = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `

  const createUpdateCartTrigger = `
    CREATE TRIGGER set_modified_cart
    BEFORE UPDATE ON carts
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified();
  `

  const createUpdateOrderTrigger = `
    CREATE TRIGGER set_modified_order
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified();
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
    await db.query(createUpdateModifiedProcedure);
    await db.query(createUpdateCartTrigger);
    await db.query(createUpdateOrderTrigger);

    await db.end();

  } catch(err) {
    console.log("ERROR CREATING ONE OR MORE TABLES: ", err);
  }

}

createTables();