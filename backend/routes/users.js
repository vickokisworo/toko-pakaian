const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const authenticateToken = require("../middleware/authenticate");
const authorizeRoles = require("../middleware/authorization");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API untuk manajemen pengguna (Khusus Admin)
 */

router.use(authenticateToken);
router.use(authorizeRoles("admin"));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Mendapatkan semua user (Khusus Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, nama, email, role FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Mendapatkan user berdasarkan ID (Khusus Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 *       404:
 *         description: User tidak ditemukan
 */
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, nama, email, role FROM users WHERE id=$1", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "User tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Menambahkan user baru (Khusus Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nama
 *               - email
 *               - password
 *               - role
 *             properties:
 *               nama:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Berhasil menambahkan user
 */
router.post("/", async (req, res) => {
  const { nama, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (nama, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, nama, email, role",
      [nama, email, hashedPassword, role || "pelanggan"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(400).json({ error: "Email sudah digunakan" });
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Mengubah data user (Khusus Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Berhasil mengubah data
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nama, email, role, password } = req.body;
  try {
    let result;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      result = await pool.query(
        "UPDATE users SET nama=$1, email=$2, role=$3, password=$4 WHERE id=$5 RETURNING id, nama, email, role",
        [nama, email, role, hashedPassword, id]
      );
    } else {
      result = await pool.query(
        "UPDATE users SET nama=$1, email=$2, role=$3 WHERE id=$4 RETURNING id, nama, email, role",
        [nama, email, role, id]
      );
    }
    if (!result.rows.length) return res.status(404).json({ error: "User tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(400).json({ error: "Email sudah digunakan" });
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Menghapus user (Khusus Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil menghapus data
 *       404:
 *         description: User tidak ditemukan
 */
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM users WHERE id=$1 RETURNING id", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "User tidak ditemukan" });
    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
