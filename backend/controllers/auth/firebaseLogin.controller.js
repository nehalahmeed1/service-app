const admin = require("firebase-admin");
const path = require("path");
const AdminModel = require("../../models/Admin");
const ProviderModel = require("../../models/Provider");
const CustomerModel = require("../../models/Customer");

const serviceAccount = require(path.join(
  __dirname,
  "../../firebase-service-account.json"
));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firebaseLogin = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ message: "Firebase token is required" });
    }

    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const email = decodedToken.email;

    if (!email) {
      return res.status(400).json({ message: "Email not found in token" });
    }

    /* ================= CHECK PROVIDER ================= */
    const provider = await ProviderModel.findOne({ email });
    if (provider) {
      return res.status(200).json({
        success: true,
        role: "PROVIDER",
        token: firebaseToken,
        user: provider,
      });
    }

    /* ================= CHECK CUSTOMER ================= */
    const customer = await CustomerModel.findOne({ email });
    if (customer) {
      return res.status(200).json({
        success: true,
        role: "CUSTOMER",
        token: firebaseToken,
        user: customer,
      });
    }

    /* ================= CHECK ADMIN ================= */
    const adminUser = await AdminModel.findOne({ email });
    if (adminUser) {
      return res.status(200).json({
        success: true,
        role: adminUser.role,
        token: firebaseToken,
        user: adminUser,
      });
    }

    /* ================= USER NOT FOUND ================= */
    return res.status(404).json({
      message: "User not registered. Please register first.",
    });

  } catch (error) {
    console.error("🔥 Firebase login error:", error.message);
    res.status(401).json({ message: error.message });
  }
};

module.exports = { firebaseLogin };