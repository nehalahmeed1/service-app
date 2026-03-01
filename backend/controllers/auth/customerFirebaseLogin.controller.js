const admin = require("firebase-admin");
const path = require("path");
const Customer = require("../../models/Customer");
const Provider = require("../../models/Provider");
const Admin = require("../../models/Admin");

const serviceAccount = require(path.join(
  __dirname,
  "../../firebase-service-account.json"
));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const customerFirebaseLogin = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ message: "Firebase token required" });
    }

    const decoded = await admin.auth().verifyIdToken(firebaseToken);
    const { uid, email, name } = decoded;
    const resolvedEmail = (email || "").trim().toLowerCase();

    if (!resolvedEmail) {
      return res.status(400).json({ message: "Customer email missing in token" });
    }

    // Hard role guard: provider account must not login as customer.
    const providerAccount = await Provider.findOne({
      $or: [{ firebaseUid: uid }, { email: resolvedEmail }],
    })
      .select("_id")
      .lean();

    if (providerAccount) {
      return res.status(403).json({
        message: "This account is registered as provider",
        role: "PROVIDER",
      });
    }

    const adminAccount = await Admin.findOne({ email: resolvedEmail })
      .select("_id role")
      .lean();

    let customer =
      (await Customer.findOne({ firebaseUid: uid })) ||
      (await Customer.findOne({ email: resolvedEmail }));

    if (!customer) {
      if (adminAccount) {
        return res.status(403).json({
          message: "Admin account is not registered as customer",
          role: adminAccount.role || "ADMIN",
        });
      }

      return res.status(403).json({
        message: "Customer not registered",
        role: "CUSTOMER",
      });
    }

    customer.firebaseUid = uid;
    customer.name = customer.name || name || resolvedEmail.split("@")[0];
    await customer.save();

    return res.status(200).json({
      success: true,
      role: "CUSTOMER",
      token: firebaseToken,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error("Customer firebase login error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { customerFirebaseLogin };
