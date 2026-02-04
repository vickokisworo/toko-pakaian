# 🔐 Role-Based Access Control (RBAC) Documentation

Sistem ini menggunakan 3 role dengan tingkat akses berbeda. Semua endpoint dilindungi JWT authentication + role-based authorization.

---

## 📋 Role Definitions

### 1. ADMIN ⚙️

**Full access ke semua endpoint untuk manajemen sistem**

**Kewenangan:**

- ✅ Users Management (CRUD - Create, Read, Update, Delete)
- ✅ Products Management (CRUD)
- ✅ Categories Management (CRUD)
- ✅ View ALL Transactions
- ✅ Edit & View Detail Transactions

**Use Case:** Owner, Manager, Super Admin

---

### 2. KASIR 💼

**Akses operasional untuk menjalankan transaksi penjualan**

**Kewenangan:**

- ❌ Users Management (Tidak ada akses)
- ✅ View Products (lihat katalog & stok)
- ✅ View Categories (lihat kategori produk)
- ✅ Create Transactions (buat penjualan baru)
- ✅ View Transactions (lihat semua transaksi)
- ✅ Edit Transactions (ubah transaksi)

**Batasan:**

- Tidak bisa menambah/edit/hapus produk atau kategori
- Tidak bisa menghapus transaksi

**Use Case:** Checkout Staff, Penjual, Operator Kasir

---

### 3. PELANGGAN 👤

**Akses minimal untuk browsing dan transaksi pribadi**

**Kewenangan:**

- ❌ Users Management (Tidak ada akses)
- ✅ View Products (browse katalog)
- ✅ View Categories (lihat kategori)
- ✅ Create Transactions (buat pesanan)
- ✅ View Own Transactions (lihat pesanan pribadi)

**Batasan:**

- Tidak bisa lihat transaksi orang lain
- Tidak bisa edit/hapus transaksi
- Read-only untuk produk & kategori

**Use Case:** End User, Pembeli, Customer

---

## 📊 Endpoint Access Matrix

| Endpoint                     | Method | Admin | Kasir | Pelanggan | Deskripsi                |
| ---------------------------- | ------ | :---: | :---: | :-------: | ------------------------ |
| **AUTH**                     |        |       |       |           |                          |
| /api/auth/login              | POST   |  ✅   |  ✅   |    ✅     | Semua role bisa login    |
| /api/auth/register           | POST   |  ✅   |  ✅   |    ✅     | Semua role bisa register |
| /api/auth/refresh            | POST   |  ✅   |  ✅   |    ✅     | Refresh token            |
| **USERS**                    |        |       |       |           |                          |
| /api/users                   | GET    |  ✅   |  ❌   |    ❌     | List semua user          |
| /api/users                   | POST   |  ✅   |  ❌   |    ❌     | Tambah user baru         |
| /api/users/:id               | GET    |  ✅   |  ❌   |    ❌     | Detail user              |
| /api/users/:id               | PUT    |  ✅   |  ❌   |    ❌     | Update user              |
| /api/users/:id               | DELETE |  ✅   |  ❌   |    ❌     | Hapus user               |
| **PRODUCTS**                 |        |       |       |           |                          |
| /api/products                | GET    |  ✅   |  ✅   |    ✅     | List produk              |
| /api/products                | POST   |  ✅   |  ❌   |    ❌     | Tambah produk baru       |
| /api/products/:id            | GET    |  ✅   |  ✅   |    ✅     | Detail produk            |
| /api/products/:id            | PUT    |  ✅   |  ❌   |    ❌     | Update produk            |
| /api/products/:id            | DELETE |  ✅   |  ❌   |    ❌     | Hapus produk             |
| **CATEGORIES**               |        |       |       |           |                          |
| /api/categories              | GET    |  ✅   |  ✅   |    ✅     | List kategori            |
| /api/categories              | POST   |  ✅   |  ❌   |    ❌     | Tambah kategori          |
| /api/categories/:id          | GET    |  ✅   |  ❌   |    ❌     | Detail kategori          |
| /api/categories/:id          | PUT    |  ✅   |  ❌   |    ❌     | Update kategori          |
| /api/categories/:id          | DELETE |  ✅   |  ❌   |    ❌     | Hapus kategori           |
| **TRANSACTIONS**             |        |       |       |           |                          |
| /api/transactions            | GET    |  ✅   |  ✅   |    ❌     | List semua transaksi     |
| /api/transactions            | POST   |  ✅   |  ✅   |    ✅     | Buat transaksi baru      |
| /api/transactions/:id        | GET    |  ✅   |  ✅   |    Own    | Lihat detail transaksi   |
| /api/transactions/:id        | PUT    |  ✅   |  ✅   |    ❌     | Update transaksi         |
| /api/transactions/kode/:kode | GET    |  ✅   |  ✅   |    ❌     | Cari transaksi by kode   |

**Legend:** ✅ = Boleh, ❌ = Tidak boleh, **Own** = Hanya milik sendiri

---

## 🔐 Implementation Details

### Authentication Flow

```
1. User POST /api/auth/login (email + password)
   ↓
2. Backend validate, generate JWT access token + refresh token
   ↓
3. Client simpan di localStorage
   ↓
4. Setiap request, include: Authorization: Bearer <token>
   ↓
5. Middleware authenticateToken() verify JWT
   ↓
6. Middleware authorizeRoles() check role
```

### Authorization Middleware

```javascript
// Format penggunaan di routes
router.get(
  "/admin-only",
  authenticateToken, // 1. Verify JWT valid
  authorizeRoles("admin"), // 2. Check role
  (req, res) => {
    /* handler */
  }, // 3. Execute jika lolos
);

// Multiple roles
router.post(
  "/api/transactions",
  authenticateToken,
  authorizeRoles("kasir", "pelanggan"), // Both kasir & pelanggan bisa
  handler,
);
```

### Pelanggan Data Isolation

```javascript
// Pelanggan hanya bisa akses transaksi sendiri
router.get("/:id", authenticateToken, (req, res) => {
  const user_role = req.user.role;
  const user_id = req.user.id;

  if (user_role === "pelanggan" && transaction.kasir_id !== user_id) {
    return res.status(403).json({
      error: "Akses ditolak: Anda hanya bisa melihat transaksi milik Anda.",
    });
  }
  // ... return transaction detail
});
```

---

## 💡 Usage Examples

### 1. Admin Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mail.com",
    "password": "password123"
  }'
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "nama": "Admin User",
    "email": "admin@mail.com",
    "role": "admin"
  }
}
```

### 2. Kasir Create Transaction

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer <kasir_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "jumlah_bayar": 150000,
    "items": [
      {
        "product_id": 1,
        "qty": 2,
        "harga_satuan": 50000
      },
      {
        "product_id": 3,
        "qty": 1,
        "harga_satuan": 50000
      }
    ]
  }'
```

**Response:**

```json
{
  "message": "Transaksi berhasil dibuat.",
  "transaksi": {
    "id": 42,
    "kode_transaksi": "TRX-20260203-847",
    "kasir_id": 2,
    "total_harga": 150000,
    "jumlah_bayar": 150000,
    "kembalian": 0,
    "items": [...]
  }
}
```

### 3. Pelanggan View Own Transaction

```bash
curl -X GET http://localhost:3000/api/transactions/42 \
  -H "Authorization: Bearer <pelanggan_token>"
```

**Jika pelanggan coba akses transaksi orang lain:**

```json
{
  "error": "Akses ditolak: Anda hanya bisa melihat transaksi milik Anda."
}
// Status: 403 Forbidden
```

### 4. Unauthorized Request (Invalid Token)

```bash
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer invalid_token"
```

**Response:**

```json
{
  "error": "Token tidak valid atau expired"
}
// Status: 403 Forbidden
```

---

## ✅ Testing Checklist

- [ ] Admin dapat akses semua endpoint (/api/users, /api/products, etc)
- [ ] Kasir dapat CREATE & VIEW transaksi
- [ ] Kasir TIDAK dapat DELETE transaksi
- [ ] Kasir TIDAK dapat akses /api/users
- [ ] Pelanggan dapat CREATE transaksi
- [ ] Pelanggan HANYA lihat transaksi sendiri (403 untuk transaksi orang lain)
- [ ] Token refresh berfungsi dengan baik
- [ ] 401 Unauthorized untuk missing/invalid token
- [ ] 403 Forbidden untuk role tidak sesuai
- [ ] 404 Not Found untuk endpoint tidak ada

---

## 🔒 Security Best Practices

✅ **Password Hashing:** BCrypt 10 rounds
✅ **JWT Secrets:** Disimpan di `.env` (production)
✅ **CORS:** Configured untuk frontend origin
✅ **Token Expiration:** Access token expire, refresh available
✅ **Role Enforcement:** Middleware pada setiap protected route
✅ **Data Isolation:** Pelanggan tidak bisa akses data orang lain
✅ **SQL Injection Prevention:** Gunakan parameterized queries
✅ **Error Handling:** Generic messages, tidak leak sensitive info

---

## 📝 Notes

- Semua endpoints (kecuali auth) memerlukan valid JWT token
- Role berbeda memiliki kewenangan berbeda - enforce di middleware
- Pelanggan adalah customer/user umum yang hanya bisa akses data pribadi
- Kasir adalah operator toko yang menangani transaksi
- Admin memiliki full control untuk manajemen sistem
