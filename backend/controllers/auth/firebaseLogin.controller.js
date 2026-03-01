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
    const uid = decodedToken.uid;
    const email = (decodedToken.email || "").toLowerCase().trim();

    if (!uid && !email) {
      return res.status(400).json({ message: "Invalid token payload" });
    }

    /* ================= CHECK PROVIDER ================= */
    const provider = await ProviderModel.findOne({
      $or: [{ firebaseUid: uid }, ...(email ? [{ email }] : [])],
    });
    if (provider) {
      return res.status(200).json({
        success: true,
        role: "PROVIDER",
        token: firebaseToken,
        user: provider,
      });
    }

    /* ================= CHECK CUSTOMER ================= */
    const customer = await CustomerModel.findOne({
      $or: [{ firebaseUid: uid }, ...(email ? [{ email }] : [])],
    });
    if (customer) {
      return res.status(200).json({
        success: true,
        role: "CUSTOMER",
        token: firebaseToken,
        user: customer,
      });
    }

    /* ================= CHECK ADMIN =================
       Keep admin as last fallback so public login resolves
       to CUSTOMER/PROVIDER when an email exists in multiple roles.
    =============================================== */
    const adminUser = email ? await AdminModel.findOne({ email }) : null;
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

const adminFirebaseLogin = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ message: "Firebase token is required" });
    }

    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const email = (decodedToken.email || "").toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ message: "Email missing in token payload" });
    }

    const adminUser = await AdminModel.findOne({ email });
    if (!adminUser) {
      return res.status(404).json({ message: "Admin account not found" });
    }

    if (adminUser.status !== "APPROVED") {
      return res.status(403).json({ message: "Admin not approved" });
    }

    return res.status(200).json({
      success: true,
      role: adminUser.role,
      token: firebaseToken,
      user: adminUser,
    });
  } catch (error) {
    console.error("Admin firebase login error:", error.message);
    return res.status(401).json({ message: error.message });
  }
};

module.exports = { firebaseLogin, adminFirebaseLogin };
