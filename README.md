# UKT-API Toko Online

Proyek ini terdiri dari dua bagian terpisah: Backend API dan Frontend Web Application.

## Struktur Proyek

```
.
├── backend/              # REST API (Node.js + Express)
│   ├── config/          # Konfigurasi database
│   ├── middleware/      # Authentication & Authorization
│   ├── routes/          # API Routes
│   ├── index.js         # Entry point
│   ├── swagger.js       # Swagger configuration
│   ├── package.json     # Dependencies
│   └── .env             # Environment variables
│
├── frontend/            # React Application
│   ├── src/
│   │   ├── pages/       # React pages
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── api.js       # API client
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── .env             # Frontend config
│
├── toko_online.sql      # Database schema
└── toko_pakaian.backup  # Database backup
```

## Setup Backend

```bash
cd backend
npm install
npm run dev
```

Backend akan berjalan di `http://localhost:5000` (atau port yang dikonfigurasi di .env)

## Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:5173` (atau port yang dikonfigurasi)

## Database

Gunakan `toko_online.sql` atau `toko_pakaian.backup` untuk setup database PostgreSQL.

## API Documentation

Akses Swagger UI di `http://localhost:5000/api-docs` (sesuaikan port sesuai konfigurasi)
