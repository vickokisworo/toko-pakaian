const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateToken = require("../middleware/authenticate");
const authorizeRoles = require("../middleware/authorization");

/**
 * @swagger
 * tags:
 *   name: Transaksi
 *   description: API untuk manajemen transaksi penjualan
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Mendapatkan semua transaksi
 *     tags: [Transaksi]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar transaksi berhasil diambil.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "kasir", "pelanggan"),
  async (req, res) => {
    try {
      const user_id = req.user.id;
      const user_role = req.user.role;

      if (user_role === "pelanggan") {
        // pelanggan hanya lihat riwayat transaksinya sendiri (yang dibuat oleh akun pelanggan tersebut)
        const transactions = await pool.query(
          "SELECT * FROM transactions WHERE kasir_id = $1 ORDER BY tanggal DESC",
          [user_id],
        );
        return res.json(transactions.rows);
      }

      const transactions = await pool.query(
        "SELECT * FROM transactions ORDER BY tanggal DESC",
      );
      res.json(transactions.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Mendapatkan detail transaksi berdasarkan ID
 *     tags: [Transaksi]
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
 *         description: Detail transaksi ditemukan.
 *       403:
 *         description: Tidak memiliki akses ke transaksi ini.
 *       404:
 *         description: Transaksi tidak ditemukan.
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;

    // ✅ VALIDATE ID IS A NUMBER
    const transactionId = parseInt(id);
    if (isNaN(transactionId)) {
      return res.status(400).json({
        error: "Invalid transaction ID. ID must be a number.",
        received: id,
      });
    }

    const transaksi = await pool.query(
      `SELECT 
           t.id,
           t.kode_transaksi,
           t.total_harga,
           t.jumlah_bayar,
           t.kembalian,
           t.tanggal,
           t.kasir_id,
           u.nama AS kasir_nama
         FROM transactions t
         LEFT JOIN users u ON t.kasir_id = u.id
         WHERE t.id = $1`,
      [transactionId],
    );

    if (transaksi.rows.length === 0) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan." });
    }

    // Pelanggan hanya bisa lihat transaksi sendiri (yang dibuat oleh mereka)
    if (user_role === "pelanggan" && transaksi.rows[0].kasir_id !== user_id) {
      return res.status(403).json({
        error: "Akses ditolak: Anda hanya bisa melihat transaksi milik Anda.",
      });
    }

    const items = await pool.query(
      `SELECT 
           ti.product_id,
           p.nama_produk,
           ti.qty,
           ti.harga_satuan,
           ti.subtotal
         FROM transaction_items ti
         LEFT JOIN products p ON ti.product_id = p.id
         WHERE ti.transaction_id = $1`,
      [transactionId],
    );

    const result = {
      ...transaksi.rows[0],
      items: items.rows,
    };

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

/**
 * @swagger
 * /api/transactions/kode/{kode_transaksi}:
 *   get:
 *     summary: Cari transaksi berdasarkan kode transaksi
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kode_transaksi
 *         schema:
 *           type: string
 *         required: true
 *         description: "Kode transaksi (contoh: TRX-20251116-247)"
 *     responses:
 *       200:
 *         description: Transaksi ditemukan
 *       404:
 *         description: Tidak ditemukan
 */
router.get(
  "/kode/:kode_transaksi",
  authenticateToken,
  authorizeRoles("admin", "kasir"),
  async (req, res) => {
    try {
      const { kode_transaksi } = req.params;

      const transaksi = await pool.query(
        `SELECT * FROM transactions WHERE kode_transaksi = $1`,
        [kode_transaksi],
      );

      if (transaksi.rows.length === 0) {
        return res.status(404).json({ message: "Transaksi tidak ditemukan." });
      }

      const items = await pool.query(
        `SELECT 
           ti.*, 
           p.nama_produk
         FROM transaction_items ti
         JOIN products p ON ti.product_id = p.id
         WHERE ti.transaction_id = $1`,
        [transaksi.rows[0].id],
      );

      res.json({
        transaksi: transaksi.rows[0],
        items: items.rows,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Terjadi kesalahan server." });
    }
  },
);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Membuat transaksi baru
 *     description: Dapat dilakukan oleh role **admin**, **kasir**, dan **pelanggan**.
 *     tags: [Transaksi]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jumlah_bayar:
 *                 type: number
 *                 example: 150000
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       example: 1
 *                     qty:
 *                       type: integer
 *                       example: 2
 *                     harga_satuan:
 *                       type: number
 *                       example: 50000
 *     responses:
 *       201:
 *         description: Transaksi berhasil dibuat.
 *       400:
 *         description: Data tidak valid atau jumlah bayar kurang.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.post(
  "/",
  authenticateToken,
  authorizeRoles("kasir", "pelanggan"), // ✅ FIXED: Admin removed
  async (req, res) => {
    try {
      const { jumlah_bayar, items } = req.body;
      const user_id = req.user.id;

      // ✅ VALIDATE INPUT
      if (!items || items.length === 0) {
        return res
          .status(400)
          .json({ message: "Daftar items tidak boleh kosong." });
      }

      if (!jumlah_bayar || isNaN(jumlah_bayar) || jumlah_bayar <= 0) {
        return res
          .status(400)
          .json({ message: "Jumlah bayar harus berupa angka positif." });
      }

      // Validate each item
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.product_id || isNaN(item.product_id)) {
          return res
            .status(400)
            .json({ message: `Item ${i + 1}: product_id tidak valid.` });
        }
        if (!item.qty || isNaN(item.qty) || item.qty <= 0) {
          return res
            .status(400)
            .json({
              message: `Item ${i + 1}: qty harus berupa angka positif.`,
            });
        }
        if (
          !item.harga_satuan ||
          isNaN(item.harga_satuan) ||
          item.harga_satuan < 0
        ) {
          return res
            .status(400)
            .json({ message: `Item ${i + 1}: harga_satuan tidak valid.` });
        }
      }

      // Buat kode transaksi otomatis
      const kode_transaksi = `TRX-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}-${Math.floor(Math.random() * 1000)}`;

      // Hitung total harga
      let total_harga = 0;
      for (let item of items) {
        item.subtotal = item.qty * item.harga_satuan;
        total_harga += item.subtotal;
      }

      // Hitung kembalian
      const kembalian = jumlah_bayar - total_harga;
      if (kembalian < 0) {
        return res
          .status(400)
          .json({ message: "Jumlah bayar kurang dari total harga." });
      }

      // Simpan transaksi utama
      const trx = await pool.query(
        `INSERT INTO transactions 
          (kode_transaksi, kasir_id, total_harga, jumlah_bayar, kembalian)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [kode_transaksi, user_id, total_harga, jumlah_bayar, kembalian],
      );

      const transaction_id = trx.rows[0].id;

      // Simpan items transaksi
      for (let item of items) {
        await pool.query(
          `INSERT INTO transaction_items 
            (transaction_id, product_id, qty, harga_satuan, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            transaction_id,
            item.product_id,
            item.qty,
            item.harga_satuan,
            item.subtotal,
          ],
        );
      }

      res.status(201).json({
        message: "Transaksi berhasil dibuat.",
        transaksi: {
          ...trx.rows[0],
          items,
        },
      });
    } catch (err) {
      console.error("Error buat transaksi:", err);
      res
        .status(500)
        .json({ message: "Gagal membuat transaksi.", error: err.message });
    }
  },
);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Mengupdate transaksi (Admin & Kasir only)
 *     description: Hanya role **admin** dan **kasir** yang dapat memperbarui transaksi.
 *     tags: [Transaksi]
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
 *               jumlah_bayar:
 *                 type: number
 *                 example: 200000
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       example: 1
 *                     qty:
 *                       type: integer
 *                       example: 3
 *                     harga_satuan:
 *                       type: number
 *                       example: 50000
 *     responses:
 *       200:
 *         description: Transaksi berhasil diperbarui.
 *       404:
 *         description: Transaksi tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("kasir"), // ✅ FIXED: Admin removed
  async (req, res) => {
    try {
      const { id } = req.params;
      const { jumlah_bayar, items } = req.body;
      const kasir_id = req.user.id;

      // ✅ VALIDATE ID IS A NUMBER
      const transactionId = parseInt(id);
      if (isNaN(transactionId)) {
        return res.status(400).json({
          message: "Invalid transaction ID. ID must be a number.",
          received: id,
        });
      }

      if (!items || items.length === 0) {
        return res
          .status(400)
          .json({ message: "Daftar items tidak boleh kosong." });
      }

      let total_harga = 0;
      for (let item of items) {
        item.subtotal = item.qty * item.harga_satuan;
        total_harga += item.subtotal;
      }

      const kembalian = jumlah_bayar - total_harga;
      if (kembalian < 0) {
        return res
          .status(400)
          .json({ message: "Jumlah bayar kurang dari total harga." });
      }

      const updateTransaksi = await pool.query(
        `UPDATE transactions
         SET total_harga = $1,
             jumlah_bayar = $2,
             kembalian = $3,
             kasir_id = $4,
             tanggal = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [total_harga, jumlah_bayar, kembalian, kasir_id, transactionId],
      );

      if (updateTransaksi.rows.length === 0) {
        return res.status(404).json({ message: "Transaksi tidak ditemukan." });
      }

      await pool.query(
        `DELETE FROM transaction_items WHERE transaction_id = $1`,
        [transactionId],
      );

      for (let item of items) {
        await pool.query(
          `INSERT INTO transaction_items 
            (transaction_id, product_id, qty, harga_satuan, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            transactionId,
            item.product_id,
            item.qty,
            item.harga_satuan,
            item.subtotal,
          ],
        );
      }

      res.json({
        message: "Transaksi berhasil diperbarui.",
        transaksi: {
          ...updateTransaksi.rows[0],
          items,
        },
      });
    } catch (err) {
      console.error("Error update transaksi:", err);
      res.status(500).json({ message: "Terjadi kesalahan server." });
    }
  },
);

/**
 * DELETE transaksi (admin & kasir only)
 */
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("kasir"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // ✅ VALIDATE ID IS A NUMBER
      const transactionId = parseInt(id);
      if (isNaN(transactionId)) {
        return res.status(400).json({
          message: "Invalid transaction ID. ID must be a number.",
          received: id,
        });
      }

      const deleted = await pool.query(
        "DELETE FROM transactions WHERE id=$1 RETURNING *",
        [transactionId],
      );
      if (!deleted.rows.length) {
        return res.status(404).json({ message: "Transaksi tidak ditemukan." });
      }
      res.json({ message: "Transaksi berhasil dihapus." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Terjadi kesalahan server." });
    }
  },
);

module.exports = router;
