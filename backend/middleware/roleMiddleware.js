module.exports = function (requiredRole) {
  return (req, res, next) => {
    if (!req.admin || req.admin.role !== requiredRole) {
      return res.status(403).json({
        message: "Access denied"
      });
    }
    next();
  };
};
