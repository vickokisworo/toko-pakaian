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

// Auto migrate tabel favorite menjadi wishlist jika belum dirubah
pool.query('ALTER TABLE IF EXISTS user_favorites RENAME TO user_wishlists;').catch(err => console.log("Migrasi wishlist opsional dilewati"));

module.exports = pool;
