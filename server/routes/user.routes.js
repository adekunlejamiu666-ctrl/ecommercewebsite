const express = require("express");
const {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/admin.middleware");

const router = express.Router();

// Public authentication routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

// Protected user profile routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// Admin User Management
router.get("/admin/all", protect, adminOnly, getAllUsers);
router.put("/admin/:id/role", protect, adminOnly, updateUserRole);
router.delete("/admin/:id", protect, adminOnly, deleteUser);

module.exports = router;

