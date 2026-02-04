# Frontend Role-Based Implementation ✅

Semua endpoint sudah ter-implementasi di frontend dengan UI yang sesuai per role.

## 📁 Files Updated

### Core Files

- ✅ [frontend/src/App.jsx](frontend/src/App.jsx) - Main app dengan role-based routing
- ✅ [frontend/src/api.js](frontend/src/api.js) - All API methods untuk CRUD operations

### Pages (Role-Based UI)

- ✅ [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx) - Login + user save
- ✅ [frontend/src/pages/Register.jsx](frontend/src/pages/Register.jsx) - Register form
- ✅ [frontend/src/pages/Products.jsx](frontend/src/pages/Products.jsx) - Products CRUD (Admin only)
- ✅ [frontend/src/pages/Categories.jsx](frontend/src/pages/Categories.jsx) - Categories CRUD (Admin only)
- ✅ [frontend/src/pages/Transactions.jsx](frontend/src/pages/Transactions.jsx) - Cart + Transactions (all roles)
- ✅ [frontend/src/pages/Users.jsx](frontend/src/pages/Users.jsx) - Users management (Admin only)

### Documentation

- ✅ [FRONTEND.md](FRONTEND.md) - Complete frontend implementation guide
- ✅ [RBAC.md](RBAC.md) - Role-Based Access Control documentation

---

## 🎯 Role-Based Features Implemented

### ADMIN Role

| Feature                       | Available |
| ----------------------------- | :-------: |
| Create/Edit/Delete Products   |    ✅     |
| Create/Edit/Delete Categories |    ✅     |
| Manage Users (CRUD)           |    ✅     |
| View All Transactions         |    ✅     |
| Edit Transactions             |    ✅     |
| Create Transactions           |    ✅     |

**UI Elements:**

- "Add Product" button di Products page
- Edit/Delete buttons di setiap product card
- "Add Category" button di Categories page
- Edit/Delete buttons di setiap category card
- Full Users management page
- View semua transactions di history

---

### KASIR Role

| Feature               | Available |
| --------------------- | :-------: |
| View Products         |    ✅     |
| View Categories       |    ✅     |
| Create Transactions   |    ✅     |
| View All Transactions |    ✅     |
| Edit Transactions     |    ✅     |

**UI Elements:**

- Product & Category browsing (read-only)
- Shopping cart untuk create transaksi
- Transaction history (semua)
- Checkout functionality
- Tidak ada Users menu

---

### PELANGGAN Role

| Feature               | Available |
| --------------------- | :-------: |
| View Products         |    ✅     |
| View Categories       |    ✅     |
| Create Transactions   |    ✅     |
| View Own Transactions |    ✅     |

**UI Elements:**

- Product & Category browsing (read-only)
- Shopping cart untuk create transaksi
- Transaction history (hanya milik sendiri)
- Checkout functionality
- Tidak ada Users menu

---

## 🔄 How It Works

### 1. Login Flow

```
1. User enters email & password
2. Backend validates & return user + tokens
3. Frontend save to localStorage:
   - user (JSON)
   - accessToken
   - refreshToken
4. User redirected to dashboard based on role
```

### 2. Role Detection

```javascript
// Di setiap page:
const user = JSON.parse(localStorage.getItem("user"));
const userRole = user?.role;

// Conditional render
{
  isAdmin && <button>Add Product</button>;
}
{
  isKasir && <button>Create Transaksi</button>;
}
```

### 3. API Authorization

```javascript
// Backend checks role on every request
// If unauthorized (403), frontend show error message
// If token expired (401), try refresh or redirect login
```

---

## 📋 Component Features

### Products Page

```
┌─ Admin View ─────────────────────────┐
│ [+ Add Product] Button                │
│                                        │
│ Product Card 1          [Edit][Delete] │
│ Product Card 2          [Edit][Delete] │
│ Product Card 3          [Edit][Delete] │
└────────────────────────────────────────┘

┌─ Kasir/Pelanggan View ────────────────┐
│                                        │
│ Product Card 1                         │
│ Product Card 2                         │
│ Product Card 3                         │
└────────────────────────────────────────┘
```

### Transactions Page

```
┌─ Left Panel: Products ─┬─ Right Panel: Cart ──────┐
│ Product 1              │ Item 1      Qty: 2        │
│ [Add]                  │ Item 2      Qty: 1        │
│                        │ Item 3      Qty: 5        │
│ Product 2              │                           │
│ [Add]                  │ Total: Rp 500.000         │
│                        │ Bayar: [input]            │
│ Product 3              │ Kembalian: Rp 250.000     │
│ [Add]                  │ [Checkout]                │
└────────────────────────┴───────────────────────────┘

┌─ Bottom: Transaction History ──────────────────────┐
│ Transaction 1  [View Detail]                       │
│ Transaction 2  [View Detail]                       │
│ Transaction 3  [View Detail]                       │
└────────────────────────────────────────────────────┘
```

### Users Page (Admin Only)

```
┌─ Users Management (Admin) ──────────────────┐
│ [+ Add User] Button                         │
│                                              │
│ User Card 1 (Admin)      [Edit][Delete]    │
│ User Card 2 (Kasir)      [Edit][Delete]    │
│ User Card 3 (Pelanggan)  [Edit][Delete]    │
│ User Card 4 (Pelanggan)  [Edit][Delete]    │
└──────────────────────────────────────────────┘
```

---

## 🧪 Testing Each Role

### Test Admin

1. Register/Login dengan akun admin
2. Verify dapat access Users menu
3. Go Products → try add/edit/delete product
4. Go Categories → try add/edit/delete category
5. Go Transactions → view semua transaksi

### Test Kasir

1. Register/Login sebagai kasir
2. Verify Users menu NOT available
3. Go Products → lihat katalog (no add button)
4. Go Transactions → create transaksi → checkout
5. Go Transactions → lihat history semua transaksi

### Test Pelanggan

1. Register/Login sebagai pelanggan
2. Verify Users & Products edit menu NOT available
3. Go Products → lihat katalog
4. Go Transactions → create transaksi
5. Go Transactions → verify hanya lihat transaksi sendiri

---

## 🔒 Security Implementation

1. **Token Storage**
   - Tokens disimpan di localStorage
   - Cleared on logout

2. **Authorization Check**
   - Backend validate role di setiap endpoint
   - Frontend conditional rendering untuk UX
   - 403 Forbidden jika role tidak sesuai

3. **Data Isolation**
   - Pelanggan hanya bisa lihat transaksi sendiri
   - Admin bisa manage semua data
   - Kasir bisa manage transaksi & view katalog

4. **Error Handling**
   - 401: Token invalid → redirect login
   - 403: Role tidak sesuai → show error
   - 404: Resource not found → show error
   - Network error → show friendly message

---

## 🚀 How to Test

### Start Backend

```bash
cd backend
npm install
npm run dev
```

Server berjalan di `http://localhost:3000`

### Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`

### Test Accounts

Buat akun dengan 3 role yang berbeda:

**Admin:**

- Email: `admin@mail.com`
- Password: `password123`
- Role: `admin`

**Kasir:**

- Email: `kasir@mail.com`
- Password: `password123`
- Role: `kasir`

**Pelanggan:**

- Email: `pelanggan@mail.com`
- Password: `password123`
- Role: `pelanggan`

---

## ✨ Key Features Summary

- ✅ **Conditional Rendering** - UI berbeda per role
- ✅ **CRUD Operations** - Full Create/Read/Update/Delete
- ✅ **Shopping Cart** - Add/remove/update qty items
- ✅ **Validation** - Form validation & error messages
- ✅ **Real-time Calculation** - Instant total & kembalian
- ✅ **Transaction History** - View dengan role-based filtering
- ✅ **User Management** - Admin can manage users
- ✅ **Error Handling** - Proper error messages untuk setiap scenario
- ✅ **Responsive Design** - Grid layout yang responsive
- ✅ **State Management** - Proper useState & useEffect usage
