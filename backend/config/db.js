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

// Sinkronisasi tabel: Kembalikan tabel ke user_favorites
pool.query('ALTER TABLE IF EXISTS user_wishlists RENAME TO user_favorites;').catch(() => {});
pool.query(`
  CREATE TABLE IF NOT EXISTS user_favorites (
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );
`).catch(() => {});

module.exports = pool;
