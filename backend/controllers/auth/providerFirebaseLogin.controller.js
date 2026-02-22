const admin = require("firebase-admin");
const path = require("path");
const Provider = require("../../models/Provider");

const serviceAccount = require(path.join(
  __dirname,
  "../../firebase-service-account.json"
));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const providerFirebaseLogin = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ message: "Firebase token required" });
    }

    const decoded = await admin.auth().verifyIdToken(firebaseToken);
    const { uid, email } = decoded;

    const provider = await Provider.findOne({ firebaseUid: uid });

    if (!provider) {
      return res.status(403).json({ message: "Provider not registered" });
    }

    const sections = [
      provider.verification?.profile,
      provider.verification?.identity,
      provider.verification?.address,
      provider.verification?.work,
      provider.verification?.bank,
    ].filter(Boolean);

    const hasSubmittedOnboarding = sections.some((section) => {
      const docs = Array.isArray(section.documents) ? section.documents : [];
      if (docs.length > 0) return true;

      const keys = Object.keys(section).filter(
        (k) => !["status", "verifiedBy", "verifiedAt", "remarks", "documents"].includes(k)
      );

      return keys.some((k) => section[k] !== undefined && section[k] !== null && section[k] !== "");
    });

    const isOnboardingCompleted =
      !!provider.onboardingCompleted ||
      provider.status === "APPROVED" ||
      hasSubmittedOnboarding;

    // Backfill legacy providers so redirects stay consistent.
    if (isOnboardingCompleted && !provider.onboardingCompleted) {
      provider.onboardingCompleted = true;
      await provider.save();
    }

    return res.status(200).json({
      success: true,
      role: "PROVIDER",
      token: firebaseToken,
      provider: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        status: provider.status,
        onboardingCompleted: isOnboardingCompleted,
      },
    });
  } catch (error) {
    console.error("Provider firebase login error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { providerFirebaseLogin };
