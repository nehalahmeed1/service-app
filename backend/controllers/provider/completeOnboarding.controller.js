const User = require("../../models/User");
const Provider = require("../../models/Provider");

exports.completeOnboarding = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await User.findByIdAndUpdate(req.user.id, { onboardingCompleted: true });

  if (req.user?.providerId) {
    await Provider.findByIdAndUpdate(req.user.providerId, {
      onboardingCompleted: true,
    });
  }

  res.json({ success: true });
};
