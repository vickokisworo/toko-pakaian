const pool = require("../config/db");
const bcrypt = require("bcryptjs");

async function seedUsers() {
  try {
    console.log("🚀 Starting Seeder...");

    const hashedPassword = await bcrypt.hash("password", 10);

    const users = [
      {
        nama: "Admin Utama",
        email: "admin@mail.com",
        password: hashedPassword,
        role: "admin",
      },
      {
        nama: "Kasir Toko",
        email: "kasir@mail.com",
        password: hashedPassword,
        role: "kasir",
      },
    ];

    for (const user of users) {
      await pool.query(
        `INSERT INTO users (nama, email, password, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET
         nama = EXCLUDED.nama,
         password = EXCLUDED.password,
         role = EXCLUDED.role`,
        [user.nama, user.email, user.password, user.role]
      );
      console.log(`✅ User ${user.role} (${user.email}) seeded!`);
    }

    console.log("🎉 Seeding completed successfully!");
  } catch (err) {
    console.error("❌ Seeder error:", err.message);
  } finally {
    await pool.end();
  }
}

seedUsers();