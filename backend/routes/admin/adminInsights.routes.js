const express = require("express");
const router = express.Router();

const adminAuthMiddleware = require("../../middleware/adminAuthMiddleware");
const {
  getProvidersInsights,
  getCustomersInsights,
  getReportsInsights,
} = require("../../controllers/admin/adminInsights.controller");

router.get("/providers", adminAuthMiddleware, getProvidersInsights);
router.get("/customers", adminAuthMiddleware, getCustomersInsights);
router.get("/reports", adminAuthMiddleware, getReportsInsights);

module.exports = router;
