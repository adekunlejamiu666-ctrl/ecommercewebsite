const Review = require("../models/review.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

// GET /api/v1/products/:id/reviews - Get all reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .populate("user", "firstname lastname")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/v1/products/:id/reviews - Add review (Protected)
const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating (1–5) and review comment are required.",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    // Check if user already reviewed
    const existing = await Review.findOne({ product: productId, user: req.user.id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted an evaluation for this piece.",
      });
    }

    // Check if verified purchaser
    const hasOrdered = await Order.findOne({
      user: req.user.id,
      "orderItems.product": productId,
    });

    const review = await Review.create({
      product: productId,
      user: req.user.id,
      name: `${req.user.firstname} ${req.user.lastname}`.trim(),
      rating: Number(rating),
      comment: comment.trim(),
      isVerifiedPurchase: !!hasOrdered,
    });

    // Recompute product rating average
    const allReviews = await Review.find({ product: productId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    product.rating = Number(avgRating.toFixed(1));
    product.reviewsCount = allReviews.length;
    await product.save();

    return res.status(201).json({
      success: true,
      message: "Review recorded successfully.",
      review,
      productRating: product.rating,
      reviewsCount: product.reviewsCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProductReviews,
  addProductReview,
};
