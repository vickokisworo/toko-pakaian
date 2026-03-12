const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateToken = require("../middleware/authenticate");
const authorizeRoles = require("../middleware/authorization");

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API untuk manajemen kategori
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
            const result = await pool.query("SELECT * FROM categories ORDER BY nama_kategori ASC");
            res.json(result.rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
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
 *             required:
 *               - nama_kategori
 *             properties:
 *               nama_kategori:
 *                 type: string
 *                 example: Pakaian Pria
 *     responses:
 *       201:
 *         description: Kategori berhasil ditambahkan.
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
            const result = await pool.query(
                "INSERT INTO categories (nama_kategori) VALUES ($1) RETURNING *",
                [nama_kategori],
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Mengupdate data kategori (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
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
 *               nama_kategori:
 *                 type: string
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
            const result = await pool.query(
                "UPDATE categories SET nama_kategori = $1 WHERE id = $2 RETURNING *",
                [nama_kategori, id],
            );
            if (!result.rows.length)
                return res.status(404).json({ message: "Kategori tidak ditemukan." });
            res.json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Menghapus kategori (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kategori berhasil dihapus.
 *       400:
 *         description: Kategori sedang digunakan oleh produk.
 *       404:
 *         description: Kategori tidak ditemukan.
 */
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { id } = req.params;

            // Check if category is used by any product
            const productCheck = await pool.query(
                "SELECT id FROM products WHERE kategori_id = $1 LIMIT 1",
                [id],
            );
            if (productCheck.rows.length > 0) {
                return res.status(400).json({
                    message: "Kategori tidak dapat dihapus karena masih digunakan oleh produk."
                });
            }

            const result = await pool.query(
                "DELETE FROM categories WHERE id = $1 RETURNING *",
                [id],
            );
            if (!result.rows.length)
                return res.status(404).json({ message: "Kategori tidak ditemukan." });
            res.json({ message: "Kategori berhasil dihapus" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
);

module.exports = router;
