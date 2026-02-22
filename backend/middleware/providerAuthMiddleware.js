const admin = require("../config/firebaseAdmin");
const Provider = require("../models/Provider");

module.exports = async function providerAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const idToken = authHeader.split(" ")[1];

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const email = decodedToken.email;

    const provider = await Provider.findOne({ email });

    if (!provider) {
      return res.status(403).json({ message: "Provider not found" });
    }

    req.provider = provider;
    req.user = {
      // Use User._id for controllers that update User collection
      id: provider.userId,
      providerId: provider._id,
      role: "PROVIDER",
    };

    next();
  } catch (error) {
    console.error("Firebase Provider Auth Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
