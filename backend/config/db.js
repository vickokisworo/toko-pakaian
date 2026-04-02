const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "toko_pakaian",
        password: process.env.DB_PASSWORD || "postgres",
        port: process.env.DB_PORT || 5432,
      }
);

// Sinkronisasi tabel: Pastikan tabel user_wishlists tersedia
pool.query('ALTER TABLE IF EXISTS user_favorites RENAME TO user_wishlists;').catch(() => {});
pool.query(`
  CREATE TABLE IF NOT EXISTS user_wishlists (
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id)
  );
`).catch(() => {});

module.exports = pool;
