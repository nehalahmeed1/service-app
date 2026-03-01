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
const adminInsightsRoutes = require("./routes/admin/adminInsights.routes");
const adminOperationsRoutes = require("./routes/admin/adminOperations.routes");

// PROVIDER ONBOARDING
const providerOnboardingRoutes = require("./routes/provider/onboarding.routes");
const providerBookingRoutes = require("./routes/provider/booking.routes");
const customerBookingRoutes = require("./routes/customer/booking.routes");

// PUBLIC
const publicCategoryRoutes = require("./routes/categories.public.routes");
const publicSubCategoryRoutes = require("./routes/subCategories.public.routes");

// =======================
// ROUTES REGISTRATION
// =======================

// PROVIDER ONBOARDING
app.use("/api/provider", providerOnboardingRoutes);
app.use("/api/provider/bookings", providerBookingRoutes);
app.use("/api/customer/bookings", customerBookingRoutes);

// PUBLIC ROUTES
app.use("/api/categories", publicCategoryRoutes);
app.use("/api/sub-categories", publicSubCategoryRoutes);

// AUTH
app.use("/api/auth", authRoutes);
app.use("/api", adminAuthRoutes);

// ADMIN MODULES (specific first)
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/insights", adminInsightsRoutes);
app.use("/api/admin/operations", adminOperationsRoutes);
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
