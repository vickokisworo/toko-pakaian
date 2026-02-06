const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Frontend Vite
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded files


const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
const productRoutes = require("./routes/products");
const transactionRoutes = require("./routes/transactions");
const reportsRoutes = require("./routes/reports");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reports", reportsRoutes);

const swaggerDocs = require("./swagger");
swaggerDocs(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});
