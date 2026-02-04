# Frontend Implementation Guide

Frontend sudah dikonfigurasi untuk support role-based access dengan UI yang berbeda untuk setiap role.

## Features Implementasi

### ✅ Authentication

- ✅ Login Page dengan form validation
- ✅ Register Page dengan password confirmation
- ✅ Auto-save user ke localStorage
- ✅ Token management (access & refresh token)
- ✅ Logout functionality

### ✅ Role-Based UI

- ✅ Admin: Full akses semua menu (Dashboard, Products, Categories, Transactions, Users)
- ✅ Kasir: Akses Dashboard, Products, Categories, Transactions
- ✅ Pelanggan: Akses Dashboard, Products, Categories, Transactions (hanya milik sendiri)

---

## Pages & Features

### 1. Dashboard / Home

**Semua role dapat akses**

- Welcome message dengan nama user
- Role-specific info panel
- Quick navigation

---

### 2. Products Page

**Akses:**

- 📖 View: Admin, Kasir, Pelanggan
- ✏️ Create: Admin only
- ✏️ Update: Admin only
- 🗑️ Delete: Admin only

**Features:**

- Grid display semua produk
- Admin dapat: tambah, edit, hapus produk
- Harga dan stok info ditampilkan
- Filter by kategori

**API Endpoints:**

```javascript
GET    /api/products           // List semua
POST   /api/products           // Create (Admin)
GET    /api/products/:id       // Detail
PUT    /api/products/:id       // Update (Admin)
DELETE /api/products/:id       // Delete (Admin)
```

---

### 3. Categories Page

**Akses:**

- 📖 View: Admin, Kasir, Pelanggan
- ✏️ Create: Admin only
- ✏️ Update: Admin only
- 🗑️ Delete: Admin only

**Features:**

- List semua kategori
- Admin dapat: tambah, edit, hapus kategori
- Grid layout

**API Endpoints:**

```javascript
GET    /api/categories           // List semua
POST   /api/categories           // Create (Admin)
GET    /api/categories/:id       // Detail
PUT    /api/categories/:id       // Update (Admin)
DELETE /api/categories/:id       // Delete (Admin)
```

---

### 4. Transactions Page

**Akses:**

- ✏️ Create: Admin, Kasir, Pelanggan
- 📖 View: Admin, Kasir (all), Pelanggan (own only)
- ✏️ Update: Admin, Kasir only

**Features:**

- **Sidebar kiri:** Product catalog untuk add to cart
- **Sidebar kanan:** Shopping cart dengan:
  - Add/remove items
  - Quantity adjustment
  - Total harga otomatis
  - Jumlah bayar input
  - Real-time kembalian calculation
  - Checkout button
- **History section:** List transaksi (Admin/Kasir: semua, Pelanggan: milik sendiri)
- **Detail modal:** Lihat detail transaksi

**Flow:**

1. Pilih produk → Add ke cart
2. Ubah qty jika perlu
3. Input jumlah bayar
4. Lihat kembalian otomatis
5. Checkout jika valid

**API Endpoints:**

```javascript
GET    /api/transactions              // List semua (Admin/Kasir)
POST   /api/transactions              // Create (semua role)
GET    /api/transactions/:id          // Detail
PUT    /api/transactions/:id          // Update (Admin/Kasir)
GET    /api/transactions/kode/:kode   // Search by kode
```

---

### 5. Users Page

**Akses:**

- ✏️ Create: Admin only
- 📖 View: Admin only
- ✏️ Update: Admin only
- 🗑️ Delete: Admin only

**Features:**

- List semua user dengan detail
- Admin dapat: tambah, edit, hapus user
- Form untuk create/edit dengan fields:
  - Nama
  - Email
  - Password (required untuk create, optional untuk update)
  - Role (admin, kasir, pelanggan)
- Status user (Active/Inactive)

**API Endpoints:**

```javascript
GET    /api/users              // List semua
POST   /api/users              // Create
GET    /api/users/:id          // Detail
PUT    /api/users/:id          // Update
DELETE /api/users/:id          // Delete
```

---

## Component Architecture

```
App.jsx (Main)
├── Nav (Navigation Bar - role-based)
└── Pages/
    ├── Login.jsx
    ├── Register.jsx
    ├── Products.jsx (CRUD)
    ├── Categories.jsx (CRUD)
    ├── Transactions.jsx (Complex - cart, history)
    └── Users.jsx (Admin only - CRUD)
```

---

## API Methods (api.js)

### Auth

```javascript
login(email, password); // Login user
register(payload); // Register baru
logout(); // Logout
```

### Products

```javascript
getProducts(); // List semua
getProductDetail(id); // Detail by ID
createProduct(payload); // Create (Admin)
updateProduct(id, payload); // Update (Admin)
deleteProduct(id); // Delete (Admin)
```

### Categories

```javascript
getCategories(); // List semua
getCategoryDetail(id); // Detail by ID
createCategory(payload); // Create (Admin)
updateCategory(id, payload); // Update (Admin)
deleteCategory(id); // Delete (Admin)
```

### Transactions

```javascript
getTransactions(); // List semua (Admin/Kasir)
getTransactionDetail(id); // Detail (dengan role check)
getTransactionByKode(kode); // Search by kode
createTransaction(payload); // Create transaksi
updateTransaction(id, payload); // Update transaksi
```

### Users

```javascript
getUsers(); // List semua (Admin)
getUserDetail(id); // Detail (Admin)
createUser(payload); // Create (Admin)
updateUser(id, payload); // Update (Admin)
deleteUser(id); // Delete (Admin)
```

---

## Error Handling

Semua API calls dilengkapi error handling:

- ❌ **401 Unauthorized:** Token invalid/expired → Auto refresh atau redirect login
- ❌ **403 Forbidden:** Role tidak sesuai → Show error message
- ❌ **404 Not Found:** Resource tidak ada → Show error message
- ❌ **500 Server Error:** Backend error → Show error message
- ❌ **Network Error:** Connection issue → Show friendly message

**Error Display:**

- Red alert box di atas content
- Toast-like notifications untuk success/error

---

## User Experience Features

1. **Form Validation**
   - Required fields check
   - Email format validation
   - Password strength
   - Confirmation validation

2. **Loading States**
   - Loading spinners saat fetch data
   - Disabled buttons saat processing

3. **Confirmation Dialogs**
   - Delete actions perlu konfirmasi
   - Prevent accidental deletion

4. **Real-time Calculations**
   - Cart total otomatis update
   - Kembalian otomatis calculate
   - Validation status real-time

5. **Responsive Design**
   - Grid layout yang responsive
   - Mobile-friendly forms
   - Sidebar layout untuk cart

---

## LocalStorage Data

```javascript
// User info
localStorage.getItem("user"); // { id, nama, email, role }

// Authentication
localStorage.getItem("accessToken"); // JWT token
localStorage.getItem("refreshToken"); // Refresh token

// Cleared on logout
```

---

## Role Permissions Summary

| Feature          | Admin | Kasir | Pelanggan |
| ---------------- | :---: | :---: | :-------: |
| **Products**     |
| View All         |  ✅   |  ✅   |    ✅     |
| Create           |  ✅   |  ❌   |    ❌     |
| Update           |  ✅   |  ❌   |    ❌     |
| Delete           |  ✅   |  ❌   |    ❌     |
| **Categories**   |
| View All         |  ✅   |  ✅   |    ✅     |
| Create           |  ✅   |  ❌   |    ❌     |
| Update           |  ✅   |  ❌   |    ❌     |
| Delete           |  ✅   |  ❌   |    ❌     |
| **Transactions** |
| View All         |  ✅   |  ✅   |    ❌     |
| View Own         |  ✅   |  ✅   |    ✅     |
| Create           |  ✅   |  ✅   |    ✅     |
| Update           |  ✅   |  ✅   |    ❌     |
| **Users**        |
| Manage           |  ✅   |  ❌   |    ❌     |

---

## Testing Scenarios

### Admin Test Flow

1. Login sebagai admin
2. Navigate ke Users → Create user baru
3. Go to Products → Tambah/edit/hapus produk
4. Go to Categories → Manage kategoris
5. Go to Transactions → View semua transaksi

### Kasir Test Flow

1. Login sebagai kasir
2. Go to Products → View katalog
3. Go to Transactions → Create transaksi baru
4. Verify cart & checkout flow
5. Check transaction history

### Pelanggan Test Flow

1. Register akun baru
2. Login
3. Browse Products & Categories
4. Create transaksi
5. View own transaksi only
6. Try access /api/users → should get 403

---

## Future Enhancements

- [ ] Toast notifications untuk better UX
- [ ] Search & filter untuk products/transactions
- [ ] Pagination untuk large data sets
- [ ] Export transaksi to PDF
- [ ] Advanced analytics/reports (Admin)
- [ ] User avatar & profile page
- [ ] Stock warning untuk low inventory
- [ ] Transaction refund feature
- [ ] Multi-language support
