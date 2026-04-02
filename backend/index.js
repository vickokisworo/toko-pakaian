const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config();
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      /\.vercel\.app$/, // Allow Vercel subdomains
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const userRoutes = require("./routes/users");
const transactionRoutes = require("./routes/transactions");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerConfig");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
