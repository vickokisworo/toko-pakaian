# 🏪 Toko Online System - Complete Implementation Guide

Sistem manajemen toko online dengan role-based access control untuk 3 tipe user: Admin, Kasir, dan Pelanggan.

---

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    TOKO ONLINE SYSTEM                   │
├──────────────────────────┬──────────────────────────────┤
│      FRONTEND (React)     │      BACKEND (Node.js)       │
│  - Dashboard             │  - REST API                  │
│  - Product Management    │  - Authentication (JWT)      │
│  - Shopping Cart         │  - Role-Based Auth           │
│  - Transactions          │  - Database (PostgreSQL)     │
│  - User Management       │  - Swagger Documentation     │
└──────────────────────────┴──────────────────────────────┘
```

---

## 🎯 Project Structure

```
UKT-API - Copy/
├── README.md                 # Main documentation
├── RBAC.md                   # Role-Based Access Control
├── FRONTEND.md               # Frontend guide
├── FRONTEND_IMPLEMENTATION.md # Frontend implementation details
├── toko_online.sql           # Database schema
│
├── backend/                  # Node.js + Express API
│   ├── config/
│   │   └── db.js             # PostgreSQL connection
│   ├── middleware/
│   │   ├── authenticate.js   # JWT validation
│   │   └── authorization.js  # Role checking
│   ├── routes/
│   │   ├── auth.js           # Login/Register/Refresh
│   │   ├── users.js          # User management (Admin)
│   │   ├── products.js       # Product CRUD (Admin)
│   │   ├── categories.js     # Category CRUD (Admin)
│   │   └── transactions.js   # Transaction management
│   ├── index.js              # Server entry point
│   ├── swagger.js            # API documentation
│   ├── package.json
│   ├── .env                  # Environment variables
│   └── node_modules/
│
└── frontend/                 # React + Vite
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx      # Authentication
    │   │   ├── Register.jsx   # User registration
    │   │   ├── Products.jsx   # Product management
    │   │   ├── Categories.jsx # Category management
    │   │   ├── Transactions.jsx # Shopping & history
    │   │   └── Users.jsx      # User management (Admin)
    │   ├── App.jsx            # Main component
    │   ├── api.js             # API service
    │   ├── main.jsx           # Entry point
    │   └── index.css           # Styling
    ├── index.html
    ├── package.json
    ├── .env                   # Frontend config
    └── node_modules/
```

---

## 🔐 Authentication & Authorization

### JWT Flow

```
1. User Login
   POST /api/auth/login { email, password }
   ↓
2. Backend validates & creates tokens
   - accessToken (short-lived, 15min typical)
   - refreshToken (long-lived, 7 days typical)
   ↓
3. Frontend stores in localStorage
4. Every request includes: Authorization: Bearer <accessToken>
   ↓
5. If accessToken expired, use refreshToken to get new one
   ↓
6. Middleware authenticateToken() validates JWT
   Middleware authorizeRoles() checks user role
```

### 3 Roles Available

| Role          | Kewenangan                              | Use Case       |
| ------------- | --------------------------------------- | -------------- |
| **Admin**     | Full access semua endpoints             | Owner/Manager  |
| **Kasir**     | Create & manage transaksi, view katalog | Checkout staff |
| **Pelanggan** | Browse & create transaksi sendiri       | Customer       |

---

## 📱 Frontend Features

### Pages & Access Control

| Page         |  Admin  |  Kasir  | Pelanggan |
| ------------ | :-----: | :-----: | :-------: |
| Dashboard    |   ✅    |   ✅    |    ✅     |
| Products     | ✅ CRUD | ✅ Read |  ✅ Read  |
| Categories   | ✅ CRUD | ✅ Read |  ✅ Read  |
| Transactions | ✅ All  | ✅ All  |  ✅ Own   |
| Users        | ✅ CRUD |   ❌    |    ❌     |

### Key Features

1. **Shopping Cart System**
   - Add/remove/update quantities
   - Real-time total calculation
   - Auto kembalian calculation
   - Validation before checkout

2. **Transaction Management**
   - Create transaksi dengan cart items
   - View transaction history
   - Admin/Kasir: view semua
   - Pelanggan: view hanya milik sendiri

3. **Product & Category Management**
   - Admin: CRUD operations
   - Others: Read-only

4. **User Management**
   - Admin only feature
   - Create, edit, delete users
   - Assign roles

---

## 🔌 Backend Endpoints

### Authentication

```
POST   /api/auth/login       - Login user
POST   /api/auth/register    - Register user baru
POST   /api/auth/refresh     - Refresh access token
POST   /api/auth/logout      - Logout user
```

### Users (Admin Only)

```
GET    /api/users            - List semua user
GET    /api/users/:id        - Detail user
POST   /api/users            - Create user baru
PUT    /api/users/:id        - Update user
DELETE /api/users/:id        - Delete user
```

### Products (Admin CRUD, All Read)

```
GET    /api/products         - List semua produk
GET    /api/products/:id     - Detail produk
POST   /api/products         - Create produk (Admin)
PUT    /api/products/:id     - Update produk (Admin)
DELETE /api/products/:id     - Delete produk (Admin)
```

### Categories (Admin CRUD, All Read)

```
GET    /api/categories       - List semua kategori
GET    /api/categories/:id   - Detail kategori
POST   /api/categories       - Create kategori (Admin)
PUT    /api/categories/:id   - Update kategori (Admin)
DELETE /api/categories/:id   - Delete kategori (Admin)
```

### Transactions

```
GET    /api/transactions     - List semua (Admin/Kasir)
GET    /api/transactions/:id - Detail (role-based access)
POST   /api/transactions     - Create transaksi (semua)
PUT    /api/transactions/:id - Update transaksi (Admin/Kasir)
GET    /api/transactions/kode/:kode - Search by kode
```

---

## 🗄️ Database Schema

### Tables

- **users** - User accounts dengan role
- **products** - Produk toko
- **categories** - Kategori produk
- **transactions** - Penjualan
- **transaction_items** - Detail item per transaksi

### Key Fields

```sql
-- Users
id, nama, email, password (hashed), role, is_active, created_at

-- Products
id, nama_produk, harga, stok, kategori_id, created_at

-- Categories
id, nama_kategori, created_at

-- Transactions
id, kode_transaksi, kasir_id, total_harga, jumlah_bayar, kembalian, tanggal

-- Transaction Items
id, transaction_id, product_id, qty, harga_satuan, subtotal
```

---

## 🚀 Setup & Run

### Prerequisites

- Node.js v16+ & npm
- PostgreSQL database
- Git (optional)

### Backend Setup

```bash
cd backend
npm install

# Setup .env
# DB_USER=postgres
# DB_HOST=localhost
# DB_NAME=toko_online
# DB_PASSWORD=postgres
# DB_PORT=5432
# PORT=3000
# ACCESS_TOKEN_SECRET=secret_key
# REFRESH_TOKEN_SECRET=refresh_key

# Create database & import schema
psql -U postgres -d toko_online < ../toko_online.sql

# Run development server
npm run dev
# Server: http://localhost:3000
# Swagger: http://localhost:3000/api-docs
```

### Frontend Setup

```bash
cd frontend
npm install

# Setup .env
# VITE_API_URL=http://localhost:3000/api

# Run development server
npm run dev
# App: http://localhost:5173
```

---

## 🧪 Testing

### Test Accounts

Create these via register or database:

**Admin:**

- Email: `admin@mail.com`
- Password: `admin123`
- Role: `admin`

**Kasir:**

- Email: `kasir@mail.com`
- Password: `kasir123`
- Role: `kasir`

**Pelanggan:**

- Email: `pelanggan@mail.com`
- Password: `pelanggan123`
- Role: `pelanggan`

### Test Scenarios

**Admin:**

1. Login sebagai admin
2. Go Users → Create kasir user
3. Go Products → Add new product
4. Go Categories → Add category
5. Go Transactions → View semua
6. Verify all CRUD operations work

**Kasir:**

1. Login sebagai kasir
2. Verify Users menu hidden
3. Go Products → Add to cart
4. Go Transactions → Checkout
5. Verify can see all transactions

**Pelanggan:**

1. Register & login
2. Go Products → Browse
3. Go Transactions → Create transaksi
4. Verify can only see own transaksi

---

## 🔒 Security Features

1. **Password Hashing**
   - BCrypt dengan 10 rounds
   - Secure password storage

2. **JWT Authentication**
   - Tokens di header: `Authorization: Bearer <token>`
   - Token expiration & refresh mechanism
   - Secrets di environment variables

3. **Role-Based Access Control**
   - Middleware validation di backend
   - Conditional rendering di frontend
   - Data isolation per user

4. **CORS**
   - Enabled untuk frontend origin
   - Prevents unauthorized cross-origin requests

5. **Input Validation**
   - Form validation di frontend
   - Parameterized queries di backend
   - Prevention dari SQL injection

6. **Error Handling**
   - Generic error messages (tidak leak info)
   - Proper HTTP status codes
   - Request/response validation

---

## 📊 API Response Format

### Success Response

```json
{
  "id": 1,
  "nama": "Laptop",
  "harga": 7500000,
  "stok": 10,
  "kategori_id": 1
}
```

### Error Response

```json
{
  "error": "Email sudah digunakan"
}
// or
{
  "message": "Terjadi kesalahan server"
}
```

### Login Response

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "nama": "Admin",
    "email": "admin@mail.com",
    "role": "admin"
  }
}
```

---

## 📝 Environment Variables

### Backend (.env)

```
PORT=3000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=toko_online
DB_PASSWORD=postgres
DB_PORT=5432
ACCESS_TOKEN_SECRET=your_secret_key
REFRESH_TOKEN_SECRET=your_refresh_secret
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:3000/api
```

---

## 🐛 Troubleshooting

### Backend Issues

- **Connection refused**: Check PostgreSQL running
- **Module not found**: Run `npm install`
- **JWT errors**: Check token dalam localStorage
- **CORS error**: Verify CORS config di express

### Frontend Issues

- **API calls fail**: Check backend running on port 3000
- **Page not loading**: Check console untuk errors
- **Cart not working**: Verify localStorage enabled
- **Role not working**: Clear localStorage & re-login

---

## 📖 Documentation Files

- **README.md** - Setup & basic info
- **RBAC.md** - Role-Based Access Control details
- **FRONTEND.md** - Frontend features & API methods
- **FRONTEND_IMPLEMENTATION.md** - Implementation details
- **This file** - Complete system guide

---

## 🎓 Learning Resources

### Key Concepts

- **JWT Authentication** - Industry standard for APIs
- **Role-Based Access Control** - Common security pattern
- **REST API Design** - Standard HTTP conventions
- **React Hooks** - Modern React development
- **SQL Databases** - Data persistence

### Tech Stack

- **Frontend**: React 18, Vite, JavaScript
- **Backend**: Node.js, Express, JWT, BCrypt
- **Database**: PostgreSQL
- **Documentation**: Swagger/OpenAPI

---

## 🚀 Future Enhancements

- [ ] Email verification pada register
- [ ] Password reset functionality
- [ ] Transaction refunds
- [ ] Stock management alerts
- [ ] Admin dashboard dengan analytics
- [ ] Export transaksi ke PDF
- [ ] Multi-language support
- [ ] Payment gateway integration
- [ ] Discount & promo codes
- [ ] Wishlist feature

---

## 📞 Support

Untuk documentation lebih detail, lihat:

- [Backend API Documentation](http://localhost:3000/api-docs)
- [RBAC Documentation](./RBAC.md)
- [Frontend Guide](./FRONTEND.md)
