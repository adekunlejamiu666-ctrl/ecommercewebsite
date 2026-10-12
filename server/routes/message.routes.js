const express = require("express");
const router = express.Router();
const {
  createMessage,
  getAllMessages,
  updateMessageStatus,
  deleteMessage,
} = require("../controllers/message.controller");
const { protect } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/admin.middleware");

// Public endpoint for submitting a message (e.g. from vendor modal or contact page)
router.post("/", createMessage);

// Protected admin endpoints
router.get("/", protect, adminOnly, getAllMessages);
router.patch("/:id", protect, adminOnly, updateMessageStatus);
router.delete("/:id", protect, adminOnly, deleteMessage);

module.exports = router;
