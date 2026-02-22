const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const connectDB = require("./config/db");

const app = express();

// =======================
// DB CONNECTION
// =======================
connectDB();

// =======================
// MIDDLEWARE (ORDER MATTERS)
// =======================

// Parse JSON bodies
app.use(express.json());

// Parse form-data (required for multer text fields)
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: "http://localhost:4028",
    credentials: true,
  })
);

// =======================
// SERVE UPLOADED FILES
// =======================
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// =======================
// ROUTES IMPORTS
// =======================

// AUTH
const authRoutes = require("./routes/auth.routes");

// ADMIN AUTH / MGMT
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminManagementRoutes = require("./routes/adminManagementRoutes");

// ADMIN MODULES
const categoryRoutes = require("./routes/admin/category.routes");
const subCategoryRoutes = require("./routes/admin/subCategory.routes");
const adminDashboardRoutes = require("./routes/admin/adminDashboard.routes");
const adminApprovalRoutes = require("./routes/admin/adminApproval.routes");

// PROVIDER ONBOARDING
const providerOnboardingRoutes = require("./routes/provider/onboarding.routes");

// PUBLIC
const publicCategoryRoutes = require("./routes/categories.public.routes");

// =======================
// ROUTES REGISTRATION
// =======================

// PROVIDER ONBOARDING
app.use("/api/provider", providerOnboardingRoutes);

// PUBLIC ROUTES
app.use("/api/categories", publicCategoryRoutes);

// AUTH
app.use("/api/auth", authRoutes);
app.use("/api", adminAuthRoutes);

// ADMIN MODULES (specific first)
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/sub-categories", subCategoryRoutes);

// ADMIN APPROVALS
app.use("/api/admin/approvals", adminApprovalRoutes);

// ADMIN GENERIC (KEEP LAST)
app.use("/api/admin", adminManagementRoutes);

// =======================
// SERVER
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
