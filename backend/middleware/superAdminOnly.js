module.exports = function superAdminOnly(req, res, next) {
  // Safety check
  if (!req.admin) {
    return res.status(401).json({
      message: "Unauthorized: Admin not authenticated"
    });
  }

  // Role check
  if (req.admin.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Access denied: Super Admin only"
    });
  }

  next();
};
