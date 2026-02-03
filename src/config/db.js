const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres", // ganti dengan username PostgreSQL kamu
  host: "localhost", // atau IP server PostgreSQL
  database: "toko_online", // nama database kamu
  password: "postgres", // password PostgreSQL
  port: 5432, // default port
});

module.exports = pool;
