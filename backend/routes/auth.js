const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/authenticate");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoint untuk autentikasi dan manajemen akun pengguna
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrasi akun baru (Khusus Pelanggan)
 *     tags: [Auth]
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
 *                 example: "Pelanggan Baru"
 *               email:
 *                 type: string
 *                 example: "pelanggan@mail.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Registrasi berhasil
 *       400:
 *         description: Email sudah digunakan
 *       500:
 *         description: Kesalahan server
 */
router.post("/register", async (req, res) => {
  try {
    const { nama, email, password } = req.body;
    // Strict rule: Public registration is ALWAYS for customers
    const role = "pelanggan";

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      `INSERT INTO users (nama, email, password, role)
       VALUES ($1,$2,$3,$4) RETURNING id, nama, email, role`,
      [nama, email, hashedPassword, role],
    );
    res
      .status(201)
      .json({ message: "Register berhasil", user: newUser.rows[0] });
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ error: "Email sudah digunakan" });
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login pengguna dengan email dan password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "kasirbaru@mail.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login berhasil, mengembalikan token JWT
 *       401:
 *         description: Password salah
 *       404:
 *         description: User tidak ditemukan
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (!result.rows.length)
      return res.status(404).json({ error: "User tidak ditemukan" });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Password salah" });

    // ✅ hanya access token, tidak simpan refresh token ke DB
    const accessToken = jwt.sign(
      { id: user.id, role: user.role, nama: user.nama },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" },
    );

    // ✅ refresh token dibuat hanya untuk client (tanpa disimpan di DB)
    const refreshToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" },
    );

    // ✅ Simpan refresh token ke database
    await pool.query("UPDATE users SET refresh_token=$1 WHERE id=$2", [
      refreshToken,
      user.id,
    ]);

    res.json({
      message: "Login berhasil",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nama: user.nama,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Memperbarui access token menggunakan refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Access token baru berhasil dibuat
 *       403:
 *         description: Refresh token tidak valid
 *       401:
 *         description: Refresh token tidak ditemukan
 */
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ error: "Refresh token tidak ditemukan" });

  // ✅ Cek apakah refresh token ada di database
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE refresh_token=$1",
      [refreshToken],
    );
    if (!result.rows.length)
      return res
        .status(403)
        .json({ error: "Refresh token tidak valid atau sudah logout" });

    const user = result.rows[0];

    // Verify token validity
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err)
        return res
          .status(403)
          .json({ error: "Refresh token expired atau tidak valid" });

      const newAccessToken = jwt.sign(
        { id: user.id, role: user.role, nama: user.nama },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" },
      );
      res.json({ accessToken: newAccessToken });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (hapus token dari sisi client)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Logout berhasil
 *       400:
 *         description: Refresh token diperlukan
 */
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ error: "Refresh token diperlukan" });

  try {
    // ✅ Update database set refresh_token NULL
    await pool.query("UPDATE users SET refresh_token=NULL WHERE refresh_token=$1", [
      refreshToken,
    ]);
    res.json({ message: "Logout berhasil" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/auth/me/wishlist:
 *   get:
 *     summary: Mendapatkan produk favorit milik user yang sedang login
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data produk favorit (null jika belum diset)
 *       401:
 *         description: Token tidak valid
 */
router.get("/me/wishlist", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT uf.product_id as wishlist_id, p.*, c.nama_kategori
       FROM user_wishlists uf
       JOIN products p ON p.id = uf.product_id
       LEFT JOIN categories c ON c.id = p.kategori_id
       WHERE uf.user_id = $1`,
      [req.user.id]
    );
    res.json({ wishlists: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/auth/me/wishlist:
 *   put:
 *     summary: Set atau hapus produk favorit user yang sedang login
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 3
 *     responses:
 *       200:
 *         description: Favorit berhasil diupdate
 *       404:
 *         description: Produk tidak ditemukan
 */
router.post("/me/wishlist", authenticateToken, async (req, res) => {
  const { product_id } = req.body;
  if (!product_id) return res.status(400).json({ error: "product_id is required" });
  try {
    const check = await pool.query("SELECT id FROM products WHERE id=$1", [product_id]);
    if (!check.rows.length) return res.status(404).json({ error: "Produk tidak ditemukan" });

    await pool.query(
      "INSERT INTO user_wishlists (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [req.user.id, product_id]
    );
    res.json({ message: "Produk ditambahkan ke Wishlist", product_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/auth/me/wishlist/{id}:
 *   delete:
 *     summary: Menghapus produk dari daftar favorit user
 *     tags: [Auth]
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
 *         description: Wishlist berhasil dihapus
 *       500:
 *         description: Kesalahan server
 */
router.delete("/me/wishlist/:id", authenticateToken, async (req, res) => {
  const product_id = req.params.id;
  try {
    await pool.query(
      "DELETE FROM user_wishlists WHERE user_id=$1 AND product_id=$2",
      [req.user.id, product_id]
    );
    res.json({ message: "Wishlist dihapus", product_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
