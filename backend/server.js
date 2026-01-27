const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminManagementRoutes = require("./routes/adminManagementRoutes");
const categoryRoutes = require("./routes/admin/category.routes");
const subCategoryRoutes = require("./routes/admin/subCategory.routes");

const app = express();

connectDB();

app.use(
  cors({
    origin: "http://localhost:4028",
    credentials: true,
  })
);

app.use(express.json());

// Auth
app.use("/api", adminAuthRoutes);

// Feature modules
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/sub-categories", subCategoryRoutes);

// Generic admin routes LAST
app.use("/api/admin", adminManagementRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);
