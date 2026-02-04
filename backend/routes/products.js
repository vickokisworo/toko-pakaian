const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateToken = require("../middleware/authenticate");
const authorizeRoles = require("../middleware/authorization");

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API untuk manajemen produk
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Mendapatkan semua produk
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar produk berhasil diambil.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "kasir", "pelanggan"),
  async (req, res) => {
    try {
      const { kategori, search } = req.query;
      let params = [];
      let where = [];
      let base = `SELECT p.*, c.nama_kategori 
         FROM products p 
         LEFT JOIN categories c ON p.kategori_id = c.id`;

      if (kategori) {
        params.push(kategori);
        where.push(`p.kategori_id = $${params.length}`);
      }

      if (search) {
        // if numeric, allow searching by id
        if (!isNaN(Number(search))) {
          params.push(Number(search));
          where.push(`p.id = $${params.length}`);
        } else {
          params.push(`%${search}%`);
          where.push(`p.nama_produk ILIKE $${params.length}`);
        }
      }

      if (where.length) base += ` WHERE ${where.join(" AND ")}`;
      base += " ORDER BY p.created_at DESC";

      const result = await pool.query(base, params);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Mendapatkan detail produk berdasarkan ID (Admin & Kasir)
 *     tags: [Products]
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
 *         description: Detail produk ditemukan.
 *       404:
 *         description: Produk tidak ditemukan.
 */
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "kasir", "pelanggan"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT p.*, c.nama_kategori 
         FROM products p 
         LEFT JOIN categories c ON p.kategori_id = c.id 
         WHERE p.id = $1`,
        [id],
      );
      if (!result.rows.length)
        return res.status(404).json({ message: "Produk tidak ditemukan." });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Menambahkan produk baru (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_produk:
 *                 type: string
 *                 example: Laptop ASUS VivoBook
 *               harga:
 *                 type: number
 *                 example: 7500000
 *               stok:
 *                 type: integer
 *                 example: 10
 *               kategori_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Produk berhasil ditambahkan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { nama_produk, harga, stok, kategori_id } = req.body;
      const newProduct = await pool.query(
        `INSERT INTO products (nama_produk, harga, stok, kategori_id) 
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [nama_produk, harga, stok, kategori_id],
      );
      res.status(201).json(newProduct.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Mengupdate data produk (Admin only)
 *     tags: [Products]
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
 *               nama_produk:
 *                 type: string
 *               harga:
 *                 type: number
 *               stok:
 *                 type: integer
 *               kategori_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Produk berhasil diperbarui.
 *       404:
 *         description: Produk tidak ditemukan.
 */
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { nama_produk, harga, stok, kategori_id } = req.body;

      const updated = await pool.query(
        `UPDATE products 
         SET nama_produk=$1, harga=$2, stok=$3, kategori_id=$4 
         WHERE id=$5 RETURNING *`,
        [nama_produk, harga, stok, kategori_id, id],
      );

      if (!updated.rows.length)
        return res.status(404).json({ message: "Produk tidak ditemukan." });

      res.json(updated.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Menghapus produk (Admin only)
 *     tags: [Products]
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
 *         description: Produk berhasil dihapus.
 *       404:
 *         description: Produk tidak ditemukan.
 */
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await pool.query(
        "DELETE FROM products WHERE id=$1 RETURNING *",
        [id],
      );
      if (!deleted.rows.length)
        return res.status(404).json({ message: "Produk tidak ditemukan." });
      res.json({ message: "Produk berhasil dihapus" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
