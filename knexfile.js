// Update with your config settings.
require("dotenv").config();

module.exports = {
  client: "pg",
  connection: {
    host: process.env.APP_DB_HOST,
    port: process.env.APP_DB_PORT,
    user: process.env.APP_DB_USER,
    password: process.env.APP_DB_PASSWORD,
    database: process.env.APP_DB_DATABASE
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: "knex_migrations"
  }
};
