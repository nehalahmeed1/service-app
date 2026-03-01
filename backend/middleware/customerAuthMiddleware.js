const admin = require("../config/firebaseAdmin");
const Customer = require("../models/Customer");

module.exports = async function customerAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const idToken = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const email = (decodedToken.email || "").toLowerCase().trim();

    const customer = await Customer.findOne({
      $or: [{ firebaseUid: decodedToken.uid }, { email }],
      deletedAt: null,
    });

    if (!customer) {
      return res.status(403).json({ message: "Customer not found" });
    }

    req.customer = customer;
    req.user = {
      id: customer._id,
      role: "CUSTOMER",
      email: customer.email,
    };

    next();
  } catch (error) {
    console.error("Customer auth error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
