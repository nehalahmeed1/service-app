const express = require("express");
const router = express.Router();

const providerAuthMiddleware = require("../../middleware/providerAuthMiddleware");
const {
  uploadIdentity,
  uploadAddress,
  uploadProfile,
  uploadWork,
  uploadBank,
} = require("../../config/multer");

const {
  uploadIdentity: uploadIdentityController,
} = require("../../controllers/provider/onboardingIdentity.controller");
const {
  uploadAddress: uploadAddressController,
} = require("../../controllers/provider/onboardingAddress.controller");
const {
  uploadProfile: uploadProfileController,
} = require("../../controllers/provider/onboardingProfile.controller");
const {
  uploadWork: uploadWorkController,
} = require("../../controllers/provider/onboardingWork.controller");
const {
  uploadBank: uploadBankController,
} = require("../../controllers/provider/onboardingBank.controller");

const {
  completeOnboarding,
} = require("../../controllers/provider/completeOnboarding.controller");
const {
  getOnboardingStatus,
} = require("../../controllers/provider/onboardingStatus.controller");
const {
  getMyProfile,
  updateMyProfile,
} = require("../../controllers/provider/providerProfile.controller");
const {
  getProviderKpi,
  getVerificationHistory,
} = require("../../controllers/provider/providerInsights.controller");

/**
 * BASE PATH:
 * /api/provider
 */

router.post(
  "/onboarding/profile",
  providerAuthMiddleware,
  uploadProfile.single("profilePhoto"),
  uploadProfileController
);

router.post(
  "/onboarding/identity",
  providerAuthMiddleware,
  uploadIdentity.fields([
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
  ]),
  uploadIdentityController
);

router.post(
  "/onboarding/address",
  providerAuthMiddleware,
  uploadAddress.single("addressProof"),
  uploadAddressController
);

router.post(
  "/onboarding/work",
  providerAuthMiddleware,
  uploadWork.fields([
    { name: "workImages", maxCount: 10 },
    { name: "certificate", maxCount: 1 },
  ]),
  uploadWorkController
);

router.post(
  "/onboarding/bank",
  providerAuthMiddleware,
  uploadBank.single("bankProof"),
  uploadBankController
);

router.post(
  "/onboarding/complete",
  providerAuthMiddleware,
  completeOnboarding
);

router.get(
  "/onboarding/status",
  providerAuthMiddleware,
  getOnboardingStatus
);

router.get(
  "/me",
  providerAuthMiddleware,
  getMyProfile
);

router.put(
  "/me",
  providerAuthMiddleware,
  uploadProfile.single("profilePhoto"),
  updateMyProfile
);

router.get(
  "/kpi",
  providerAuthMiddleware,
  getProviderKpi
);

router.get(
  "/verification/history",
  providerAuthMiddleware,
  getVerificationHistory
);

module.exports = router;
