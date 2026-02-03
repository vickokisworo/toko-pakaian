const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateToken = require("../middleware/authenticate");
const authorizeRoles = require("../middleware/authorization");

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API untuk manajemen kategori produk
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Mendapatkan semua kategori
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar kategori berhasil diambil.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "kasir", "pelanggan"),
  async (req, res) => {
    try {
      const categories = await pool.query(
        "SELECT * FROM categories ORDER BY created_at DESC"
      );
      res.json(categories.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Mendapatkan detail kategori berdasarkan ID (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID kategori
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail kategori ditemukan.
 *       404:
 *         description: Kategori tidak ditemukan.
 */
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        "SELECT * FROM categories WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Kategori tidak ditemukan." });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Terjadi kesalahan server." });
    }
  }
);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Menambahkan kategori baru (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_kategori:
 *                 type: string
 *                 example: Elektronik
 *     responses:
 *       201:
 *         description: Kategori berhasil dibuat.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { nama_kategori } = req.body;
      const newCat = await pool.query(
        "INSERT INTO categories (nama_kategori) VALUES ($1) RETURNING *",
        [nama_kategori]
      );
      res.status(201).json(newCat.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Mengupdate kategori berdasarkan ID (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID kategori
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_kategori:
 *                 type: string
 *                 example: Komputer & Laptop
 *     responses:
 *       200:
 *         description: Kategori berhasil diperbarui.
 *       404:
 *         description: Kategori tidak ditemukan.
 */
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { nama_kategori } = req.body;
      const updated = await pool.query(
        "UPDATE categories SET nama_kategori=$1 WHERE id=$2 RETURNING *",
        [nama_kategori, id]
      );
      if (!updated.rows.length)
        return res.status(404).json({ error: "Kategori tidak ditemukan" });
      res.json(updated.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Hapus kategori (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID kategori yang akan dihapus
 *     responses:
 *       200:
 *         description: Kategori berhasil dihapus
 *       400:
 *         description: Kategori sedang dipakai oleh produk
 *       404:
 *         description: Kategori tidak ditemukan
 */

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // cek dulu apakah kategori dipakai
      const used = await pool.query(
        "SELECT id FROM products WHERE kategori_id = $1 LIMIT 1",
        [id]
      );

      if (used.rows.length > 0) {
        return res.status(400).json({
          error:
            "Kategori tidak bisa dihapus karena masih digunakan oleh produk",
        });
      }

      const deleted = await pool.query(
        "DELETE FROM categories WHERE id=$1 RETURNING *",
        [id]
      );

      if (!deleted.rows.length) {
        return res.status(404).json({
          error: "Kategori tidak ditemukan",
        });
      }

      res.json({ message: "Kategori berhasil dihapus" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
