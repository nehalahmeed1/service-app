const Admin = require("../models/Admin");

/**
 * GET all pending admins
 */
exports.getPendingAdmins = async (req, res) => {
  const admins = await Admin.find({ status: "PENDING" }).select("-password");
  res.json(admins);
};

/**
 * APPROVE admin
 */
exports.approveAdmin = async (req, res) => {
  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  admin.status = "APPROVED";
  await admin.save();

  res.json({ message: "Admin approved successfully" });
};

/**
 * REJECT admin
 */
exports.rejectAdmin = async (req, res) => {
  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  admin.status = "REJECTED";
  await admin.save();

  res.json({ message: "Admin rejected successfully" });
};
