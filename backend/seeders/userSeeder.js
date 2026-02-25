require("dotenv").config();
const { Client } = require("pg");
const bcrypt = require("bcrypt");

async function seedUsers() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL");

    const hashedPassword = await bcrypt.hash("password", 10);

    const users = [
      {
        nama: "Kasir 1",
        email: "kasir1@mail.com",
        password: hashedPassword,
        role: "kasir",
      },
    ];

    for (const user of users) {
      await client.query(
        `INSERT INTO users (nama, email, password, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING`,
        [user.nama, user.email, user.password, user.role]
      );
    }

    console.log("🎉 Admin users seeded!");
  } catch (err) {
    console.error("❌ Seeder error:", err);
  } finally {
    await client.end();
  }
}

seedUsers();