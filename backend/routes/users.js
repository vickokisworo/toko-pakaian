/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Manajemen pengguna (Admin only)
 */

const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateToken = require("../middleware/authenticate");
const authorizeRoles = require("../middleware/authorization");
const bcrypt = require("bcryptjs");

// ======================== GET SEMUA USER ========================
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Ambil semua pengguna (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar pengguna
 */
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const users = await pool.query(
        "SELECT id, nama, email, role, is_active, created_at FROM users ORDER BY created_at DESC"
      );
      res.json(users.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ======================== GET MY PROFILE ========================
/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Ambil data profile user yang sedang login
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data profile user
 */
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT id, nama, email, role, is_active, created_at FROM users WHERE id=$1",
      [req.user.id],
    );
    if (!user.rows.length)
      return res.status(404).json({ error: "User tidak ditemukan" });
    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================== GET USER BY ID ========================
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Ambil data user berdasarkan ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID user yang ingin diambil
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Data pengguna ditemukan
 *       404:
 *         description: User tidak ditemukan
 */
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await pool.query(
        "SELECT id, nama, email, role, is_active, created_at FROM users WHERE id=$1",
        [id]
      );
      if (!user.rows.length)
        return res.status(404).json({ error: "User tidak ditemukan" });
      res.json(user.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ======================== CREATE USER ========================
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Tambahkan user baru (Admin only)
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
 *             properties:
 *               nama:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, kasir, pelanggan]
 *     responses:
 *       201:
 *         description: User berhasil ditambahkan
 *       400:
 *         description: Email sudah digunakan
 */
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { nama, email, password, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await pool.query(
        "INSERT INTO users (nama, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, nama, email, role",
        [nama, email, hashedPassword, role || "pelanggan"]
      );
      res.status(201).json(newUser.rows[0]);
    } catch (err) {
      if (err.code === "23505")
        return res.status(400).json({ error: "Email sudah digunakan" });
      res.status(500).json({ error: err.message });
    }
  }
);

// ======================== UPDATE USER ========================
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID user yang akan diperbarui
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
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, kasir, pelanggan]
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User berhasil diperbarui
 *       404:
 *         description: User tidak ditemukan
 */
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { nama, email, password, role, is_active } = req.body;
      let hashedPassword = password ? await bcrypt.hash(password, 10) : null;

      const updatedUser = await pool.query(
        `UPDATE users SET 
       nama = COALESCE($1, nama),
       email = COALESCE($2, email),
       password = COALESCE($3, password),
       role = COALESCE($4, role),
       is_active = COALESCE($5, is_active),
       updated_at = CURRENT_TIMESTAMP
     WHERE id=$6 RETURNING id, nama, email, role, is_active`,
        [nama, email, hashedPassword, role, is_active, id]
      );
      if (!updatedUser.rows.length)
        return res.status(404).json({ error: "User tidak ditemukan" });
      res.json(updatedUser.rows[0]);
    } catch (err) {
      if (err.code === "23505")
        return res.status(400).json({ error: "Email sudah digunakan" });
      res.status(500).json({ error: err.message });
    }
  }
);

// ======================== DELETE USER ========================
/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Hapus user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID user yang akan dihapus
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User berhasil dihapus
 *       404:
 *         description: User tidak ditemukan
 */
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await pool.query(
        "DELETE FROM users WHERE id=$1 RETURNING id",
        [id]
      );
      if (!deleted.rows.length)
        return res.status(404).json({ error: "User tidak ditemukan" });
      res.json({ message: "User berhasil dihapus" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
