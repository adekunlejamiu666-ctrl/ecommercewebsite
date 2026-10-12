const express = require("express");
const {
  getVendorDashboard,
  getVendorProducts,
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
  getVendorOrders,
  getAdminVendorsList,
} = require("../controllers/vendor.controller");
const { protect } = require("../middleware/auth.middleware");
const { vendorOnly } = require("../middleware/vendor.middleware");
const { adminOnly } = require("../middleware/admin.middleware");

const router = express.Router();

// Vendor-only endpoints
router.get("/dashboard", protect, vendorOnly, getVendorDashboard);
router.get("/products", protect, vendorOnly, getVendorProducts);
router.post("/products", protect, vendorOnly, createVendorProduct);
router.put("/products/:id", protect, vendorOnly, updateVendorProduct);
router.delete("/products/:id", protect, vendorOnly, deleteVendorProduct);
router.get("/orders", protect, vendorOnly, getVendorOrders);

// Admin-only vendor inspection endpoint
router.get("/admin/all", protect, adminOnly, getAdminVendorsList);

module.exports = router;
