// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./backend/config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// ========= API ROUTES =========
app.use("/api/auth", require("./backend/routes/authRoutes"));
app.use("/api/admin", require("./backend/routes/adminRoutes"));
app.use("/api/admin/products", require("./backend/routes/productRoutes"));
app.use("/api/products", require("./backend/routes/userproductRoutes"));
app.use("/api/cart", require("./backend/routes/cart"));
app.use("/api/order", require("./backend/routes/orderRoutes"));
app.use("/api/admin/orders", require("./backend/routes/adminOrders"));
app.use("/api/delivery", require("./backend/routes/Deliveryboy"));
app.use("/api/adminstat", require("./backend/routes/adminstat"));
app.use("/api/superadmin", require("./backend/routes/superadmin"));

// ========= FRONTEND BUILD =========
const frontendPath = path.join(__dirname, "frontend", "build");

app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});


// ========= ERROR HANDLING =========
// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Not Found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});

// ========= SERVER =========
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});