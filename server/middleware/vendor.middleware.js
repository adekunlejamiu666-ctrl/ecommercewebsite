const vendorOnly = (req, res, next) => {
  if (req.user && (req.user.role === "vendor" || req.user.role === "admin")) {
    next();
  } else {
    return res.status(403).json({ message: "Access denied. Vendor or Admin role required." });
  }
};

module.exports = { vendorOnly };
