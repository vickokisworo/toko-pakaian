const pool = require("../config/db");

async function migrate() {
    try {
        console.log("Starting migration...");
        await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS image VARCHAR(255)");
        console.log("Migration successful: Added 'image' column to 'products' table.");
    } catch (err) {
        console.error("Migration failed:", err.message);
    } finally {
        pool.end();
    }
}

migrate();
