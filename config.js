const dotenv = require('dotenv')

dotenv.config();

module.exports = {
    PORT: process.env.PORT,
    DB: {
      PGHOST: process.env.PGHOST,
      PGDATABASE: process.env.PGDATABASE,
      PGUSER: process.env.PGUSER,
      PGPASSWORD: process.env.PGPASSWORD,
      PGPORT: process.env.PGPORT
    },
    SESSION_SECRET: process.env.SESSION_SECRET,
    STRIPE_SECRET: process.env.STRIPE_SECRET
  }
