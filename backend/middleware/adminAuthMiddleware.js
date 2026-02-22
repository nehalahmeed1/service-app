const admin = require("firebase-admin");
const path = require("path");
const Admin = require("../models/Admin");

if (!admin.apps.length) {
  const serviceAccount = require(path.join(
    __dirname,
    "../firebase-service-account.json"
  ));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];

    // 🔥 Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    const adminUser = await Admin.findOne({ email: decoded.email });

    if (!adminUser) {
      return res.status(403).json({ message: "Admin not found" });
    }

    if (adminUser.status !== "APPROVED") {
      return res.status(403).json({ message: "Admin not approved" });
    }

    req.admin = adminUser;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = adminAuthMiddleware;
