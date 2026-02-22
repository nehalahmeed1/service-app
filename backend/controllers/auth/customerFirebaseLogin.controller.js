const admin = require("firebase-admin");
const path = require("path");
const Customer = require("../../models/Customer");

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
    const { uid } = decoded;

    const customer = await Customer.findOne({ firebaseUid: uid });

    if (!customer) {
      return res.status(404).json({ message: "Customer not registered" });
    }

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