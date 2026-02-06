const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateToken = require("../middleware/authenticate");
const authorizeRoles = require("../middleware/authorization");

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: API untuk laporan penjualan
 */

/**
 * @swagger
 * /api/reports/sales:
 *   get:
 *     summary: Mendapatkan laporan penjualan (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Laporan penjualan berhasil diambil
 *       403:
 *         description: Akses ditolak
 *       500:
 *         description: Terjadi kesalahan server
 */
router.get(
    "/sales",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            // 1. Total Revenue (All Time)
            const totalRevenueResult = await pool.query(
                "SELECT COALESCE(SUM(total_harga), 0) as total FROM transactions"
            );
            const totalRevenue = parseFloat(totalRevenueResult.rows[0].total);

            // 2. Today's Revenue
            const todayRevenueResult = await pool.query(
                `SELECT COALESCE(SUM(total_harga), 0) as total 
         FROM transactions 
         WHERE DATE(tanggal) = CURRENT_DATE`
            );
            const todayRevenue = parseFloat(todayRevenueResult.rows[0].total);

            // 3. Yesterday's Revenue
            const yesterdayRevenueResult = await pool.query(
                `SELECT COALESCE(SUM(total_harga), 0) as total 
         FROM transactions 
         WHERE DATE(tanggal) = CURRENT_DATE - INTERVAL '1 day'`
            );
            const yesterdayRevenue = parseFloat(yesterdayRevenueResult.rows[0].total);

            // 4. Calculate Percentage Change
            let percentageChange = 0;
            if (yesterdayRevenue > 0) {
                percentageChange = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
            } else if (todayRevenue > 0) {
                percentageChange = 100; // If yesterday was 0 but today has sales
            }

            // 5. Best Selling Product (Top 1)
            const bestSellerResult = await pool.query(
                `SELECT 
           p.id,
           p.nama_produk,
           p.image,
           SUM(ti.qty) as total_qty,
           SUM(ti.subtotal) as total_revenue
         FROM transaction_items ti
         JOIN products p ON ti.product_id = p.id
         GROUP BY p.id, p.nama_produk, p.image
         ORDER BY total_qty DESC
         LIMIT 1`
            );

            const bestSeller = bestSellerResult.rows.length > 0
                ? {
                    id: bestSellerResult.rows[0].id,
                    nama_produk: bestSellerResult.rows[0].nama_produk,
                    image: bestSellerResult.rows[0].image,
                    total_qty: parseInt(bestSellerResult.rows[0].total_qty),
                    total_revenue: parseFloat(bestSellerResult.rows[0].total_revenue)
                }
                : null;

            res.json({
                totalRevenue,
                todayRevenue,
                yesterdayRevenue,
                percentageChange: parseFloat(percentageChange.toFixed(2)),
                bestSeller
            });
        } catch (err) {
            console.error("Error fetching sales report:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

module.exports = router;
