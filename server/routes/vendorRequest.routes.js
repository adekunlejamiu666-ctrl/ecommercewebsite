const express = require("express");
const {
  createVendorRequest,
  getMyVendorRequest,
  getAllVendorRequests,
  getVendorRequestById,
  approveVendorRequest,
  rejectVendorRequest,
} = require("../controllers/vendorRequest.controller");
const { protect } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/admin.middleware");

const router = express.Router();

// User endpoints
router.post("/", protect, createVendorRequest);
router.get("/my-status", protect, getMyVendorRequest);

// Admin review endpoints
router.get("/admin/all", protect, adminOnly, getAllVendorRequests);
router.get("/admin/:id", protect, adminOnly, getVendorRequestById);
router.put("/admin/:id/approve", protect, adminOnly, approveVendorRequest);
router.put("/admin/:id/reject", protect, adminOnly, rejectVendorRequest);

module.exports = router;
