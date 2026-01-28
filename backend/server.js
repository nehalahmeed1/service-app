const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// =======================
// ROUTES IMPORTS
// =======================
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminManagementRoutes = require("./routes/adminManagementRoutes");

const categoryRoutes = require("./routes/admin/category.routes");
const subCategoryRoutes = require("./routes/admin/subCategory.routes");
const adminDashboardRoutes = require("./routes/admin/adminDashboard.routes");

const app = express();

// =======================
// DB CONNECTION
// =======================
connectDB();

// =======================
// MIDDLEWARE
// =======================
app.use(
  cors({
    origin: "http://localhost:4028",
    credentials: true,
  })
);

app.use(express.json());

// =======================
// ROUTES
// =======================

// Auth (login / register)
app.use("/api", adminAuthRoutes);

// Admin modules (SPECIFIC FIRST)
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/sub-categories", subCategoryRoutes);

// Generic admin routes (KEEP LAST)
app.use("/api/admin", adminManagementRoutes);

// =======================
// SERVER
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
