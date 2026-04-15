export const requireRole = (...roles) => (req, res, next) => {
  if (!req.admin || !roles.includes(req.admin.role)) {
    return res.status(403).json({ success: false, message: "You do not have permission for this action." });
  }
  next();
};
