const Admin = require("../models/Admin");

/**
 * ================================
 * GET ALL PENDING ADMINS
 * (SUPER ADMIN ONLY)
 * ================================
 */
exports.getPendingAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({
      role: "ADMIN",
      status: "PENDING"
    }).select("-password");

    res.status(200).json({
      count: admins.length,
      admins
    });
  } catch (error) {
    console.error("Get pending admins error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ================================
 * APPROVE ADMIN
 * (SUPER ADMIN ONLY)
 * ================================
 */
exports.approveAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role !== "ADMIN") {
      return res.status(400).json({
        message: "Only ADMIN accounts can be approved"
      });
    }

    if (admin.status === "APPROVED") {
      return res.status(400).json({
        message: "Admin is already approved"
      });
    }

    admin.status = "APPROVED";
    await admin.save();

    res.status(200).json({
      message: "Admin approved successfully",
      adminId: admin._id
    });
  } catch (error) {
    console.error("Approve admin error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ================================
 * REJECT ADMIN
 * (SUPER ADMIN ONLY)
 * ================================
 */
exports.rejectAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role !== "ADMIN") {
      return res.status(400).json({
        message: "Only ADMIN accounts can be rejected"
      });
    }

    if (admin.status === "REJECTED") {
      return res.status(400).json({
        message: "Admin is already rejected"
      });
    }

    admin.status = "REJECTED";
    await admin.save();

    res.status(200).json({
      message: "Admin rejected successfully",
      adminId: admin._id
    });
  } catch (error) {
    console.error("Reject admin error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
