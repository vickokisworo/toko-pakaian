const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateToken = require("../middleware/authenticate");
const authorizeRoles = require("../middleware/authorization");

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: "API untuk manajemen transaksi (Kasir: CRUD, Admin: READ ONLY)"
 */

router.use(authenticateToken);

// Middleware khusus read-only admin dan full kasir
const authorizeKasirOrAdmin = authorizeRoles("kasir", "admin");
const authorizeKasirOnly = authorizeRoles("kasir");

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Mendapatkan semua transaksi (Kasir & Admin)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil data transaksi
 */
router.get("/", authorizeKasirOrAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.*, u.nama as nama_kasir
       FROM transactions t
       LEFT JOIN users u ON t.kasir_id = u.id
       ORDER BY t.tanggal DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Mendapatkan detail transaksi beserta itemnya (Kasir & Admin)
 *     tags: [Transactions]
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
 *         description: Transaksi tidak ditemukan
 */
router.get("/:id", authorizeKasirOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const txResult = await pool.query(
            `SELECT t.*, u.nama as nama_kasir
       FROM transactions t
       LEFT JOIN users u ON t.kasir_id = u.id
       WHERE t.id = $1`,
            [id]
        );

        if (!txResult.rows.length) {
            return res.status(404).json({ error: "Transaksi tidak ditemukan" });
        }

        const itemsResult = await pool.query(
            `SELECT ti.*, p.nama_produk, p.gambar
       FROM transaction_items ti
       LEFT JOIN products p ON ti.product_id = p.id
       WHERE ti.transaction_id = $1`,
            [id]
        );

        const transaction = txResult.rows[0];
        transaction.items = itemsResult.rows;

        res.json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Membuat transaksi baru (Khusus Kasir)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jumlah_bayar
 *               - items
 *             properties:
 *               jumlah_bayar:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     qty:
 *                       type: integer
 *                     harga_satuan:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Transaksi berhasil dibuat
 */
router.post("/", authorizeKasirOnly, async (req, res) => {
    const { jumlah_bayar, items } = req.body;
    const kasir_id = req.user.id;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: "Item transaksi tidak boleh kosong" });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Calculate total price
        let total_harga = 0;
        for (let item of items) {
            if (!item.subtotal) {
                item.subtotal = item.qty * item.harga_satuan;
            }
            total_harga += item.subtotal;
        }

        const kembalian = jumlah_bayar - total_harga;

        // Generate kode transaksi (maksimal 20 karakter)
        // Date.now() adalah 13 karakter, ditambah "TRX-" (4), menjadi 17 karakter yang muat untuk VARCHAR(20)
        const kode_transaksi = `TRX-${Date.now()}`;

        const txResult = await client.query(
            `INSERT INTO transactions (kode_transaksi, kasir_id, total_harga, jumlah_bayar, kembalian)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [kode_transaksi, kasir_id, total_harga, jumlah_bayar, kembalian]
        );

        const transactionId = txResult.rows[0].id;

        for (let item of items) {
            await client.query(
                `INSERT INTO transaction_items (transaction_id, product_id, qty, harga_satuan, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
                [transactionId, item.product_id, item.qty, item.harga_satuan, item.subtotal]
            );

            // Kurangi stok produk
            await client.query(
                `UPDATE products SET stok = stok - $1 WHERE id = $2`,
                [item.qty, item.product_id]
            );
        }

        await client.query("COMMIT");
        res.status(201).json(txResult.rows[0]);
    } catch (err) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});


/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Menghapus transaksi beserta itemnya (Khusus Kasir)
 *     tags: [Transactions]
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
 *         description: Transaksi berhasil dihapus
 */
router.delete("/:id", authorizeKasirOnly, async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Ambil item transaksi u/ mengembalikan stok
        const itemsResult = await client.query(
            "SELECT product_id, qty FROM transaction_items WHERE transaction_id = $1",
            [id]
        );

        // Kembalikan stok produk
        for (let item of itemsResult.rows) {
            await client.query(
                "UPDATE products SET stok = stok + $1 WHERE id = $2",
                [item.qty, item.product_id]
            );
        }

        // Hapus item dan transaksi
        await client.query("DELETE FROM transaction_items WHERE transaction_id = $1", [id]);
        const deleteResult = await client.query("DELETE FROM transactions WHERE id = $1 RETURNING id", [id]);

        if (!deleteResult.rows.length) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Transaksi tidak ditemukan" });
        }

        await client.query("COMMIT");
        res.json({ message: "Transaksi berhasil dihapus dan stok dikembalikan" });
    } catch (err) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Memperbarui transaksi (Khusus Kasir)
 *     tags: [Transactions]
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
 *             required:
 *               - jumlah_bayar
 *               - items
 *     responses:
 *       200:
 *         description: Transaksi berhasil diperbarui
 *       404:
 *         description: Transaksi tidak ditemukan
 */
router.put("/:id", authorizeKasirOnly, async (req, res) => {
    const { id } = req.params;
    const { jumlah_bayar, items } = req.body;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Cek apakah transaksi ada
        const txCheck = await client.query("SELECT * FROM transactions WHERE id = $1", [id]);
        if (!txCheck.rows.length) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Transaksi tidak ditemukan" });
        }

        // 2. Ambil item lama untuk mengembalikan stok
        const oldItems = await client.query("SELECT product_id, qty FROM transaction_items WHERE transaction_id = $1", [id]);
        for (let item of oldItems.rows) {
            await client.query("UPDATE products SET stok = stok + $1 WHERE id = $2", [item.qty, item.product_id]);
        }

        // 3. Hapus item lama
        await client.query("DELETE FROM transaction_items WHERE transaction_id = $1", [id]);

        // 4. Hitung total harga baru dan masukkan item baru
        let total_harga = 0;
        for (let item of items) {
            const subtotal = item.qty * item.harga_satuan;
            total_harga += subtotal;

            await client.query(
                `INSERT INTO transaction_items (transaction_id, product_id, qty, harga_satuan, subtotal)
                 VALUES ($1, $2, $3, $4, $5)`,
                [id, item.product_id, item.qty, item.harga_satuan, subtotal]
            );

            // Kurangi stok produk baru
            await client.query("UPDATE products SET stok = stok - $1 WHERE id = $2", [item.qty, item.product_id]);
        }

        const kembalian = jumlah_bayar - total_harga;

        // 5. Update header transaksi
        const updateTx = await client.query(
            `UPDATE transactions 
             SET total_harga = $1, jumlah_bayar = $2, kembalian = $3, tanggal = NOW()
             WHERE id = $4 RETURNING *`,
            [total_harga, jumlah_bayar, kembalian, id]
        );

        await client.query("COMMIT");
        res.json(updateTx.rows[0]);
    } catch (err) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

module.exports = router;
