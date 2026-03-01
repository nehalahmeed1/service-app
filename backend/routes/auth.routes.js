const express = require("express");
const router = express.Router();

// Customer registration
const {
  registerCustomer,
} = require("../controllers/auth/customerRegister.controller");

// 🔥 ADD THIS (Customer Firebase Login)
const {
  customerFirebaseLogin,
} = require("../controllers/auth/customerFirebaseLogin.controller");

// Provider registration
const {
  registerProvider,
} = require("../controllers/auth/providerRegister.controller");

// 🔥 Admin Firebase Login
const {
  firebaseLogin,
  adminFirebaseLogin,
} = require("../controllers/auth/firebaseLogin.controller");

// 🔥 Provider Firebase Login
const {
  providerFirebaseLogin,
} = require("../controllers/auth/providerFirebaseLogin.controller");

/**
 * AUTH ROUTES
 */

// Customer Registration
router.post("/customer/register", registerCustomer);

// 🔥 ADD THIS ROUTE (CRITICAL FIX)
router.post("/customer/firebase-login", customerFirebaseLogin);

// Provider Registration
router.post("/provider/register", registerProvider);

// Admin Firebase Login
router.post("/firebase-login", firebaseLogin);
router.post("/admin/firebase-login", adminFirebaseLogin);

// Provider Firebase Login
router.post("/provider/firebase-login", providerFirebaseLogin);

module.exports = router;
