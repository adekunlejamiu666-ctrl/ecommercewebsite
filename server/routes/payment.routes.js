const express = require("express");
const {
  initializePaystack,
  verifyPaystack,
} = require("../controllers/payment.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Initialize Paystack transaction
router.post("/paystack/initialize", protect, initializePaystack);

// Verify Paystack transaction (can be called by authenticated customer)
router.post("/paystack/verify", protect, verifyPaystack);

module.exports = router;
