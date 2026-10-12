const express = require("express");
const {
  getProducts,
  getLowStockProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const { protect } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/admin.middleware");
const { vendorOnly } = require("../middleware/vendor.middleware");
const {
  getProductReviews,
  addProductReview,
} = require("../controllers/review.controller");

const router = express.Router();

// Public product list & protected product creation
router.route("/").get(getProducts).post(protect, vendorOnly, createProduct);

// Protected Admin Low Stock catalog alert endpoints
router.get("/admin/low-stock", protect, adminOnly, getLowStockProducts);
router.get("/low-stock", protect, adminOnly, getLowStockProducts);

// Specific product by ID or slug
router
  .route("/:id")
  .get(getProductById)
  .put(protect, vendorOnly, updateProduct)
  .delete(protect, vendorOnly, deleteProduct);

// Reviews
router
  .route("/:id/reviews")
  .get(getProductReviews)
  .post(protect, addProductReview);

module.exports = router;
