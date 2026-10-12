import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiHeart,
  FiShoppingBag,
  FiCheck,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiArrowLeft,
} from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";
import ProductCard from "../components/product/ProductCard";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import productService from "../services/productService";
import reviewService from "../services/reviewService";
import { sampleProducts } from "../data/sampleProducts";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [addedToast, setAddedToast] = useState(false);

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState("");

  const loadReviews = (prodId) => {
    reviewService
      .getReviews(prodId)
      .then((res) => {
        if (res?.reviews) setReviews(res.reviews);
      })
      .catch(() => { });
  };

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);

    productService
      .getProductById(id)
      .then((data) => {
        if (isCurrent && data?.product) {
          setProduct(data.product);
          setSelectedImage(data.product.image || data.product.images?.[0] || "");
          if (data.related?.length > 0) {
            setRelatedProducts(data.related);
          }
          loadReviews(data.product._id || id);
        }
      })
      .catch(() => {
        // Fallback to sample data
        if (isCurrent) {
          const fallback = sampleProducts.find(
            (p) => String(p.id) === String(id) || p.slug === id
          );
          if (fallback) {
            setProduct(fallback);
            setSelectedImage(fallback.image || fallback.images?.[0] || "");
            const rel = sampleProducts
              .filter((p) => p.category === fallback.category && p.id !== fallback.id)
              .slice(0, 4);
            setRelatedProducts(rel);
          }
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false);
          setQuantity(1);
          window.scrollTo(0, 0);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    setReviewFeedback("");

    try {
      const res = await reviewService.addReview(product._id || id, {
        rating: newRating,
        comment: newComment.trim(),
      });

      if (res.success) {
        setReviewFeedback("Thank you. Your evaluation has been posted.");
        setNewComment("");
        setNewRating(5);
        loadReviews(product._id || id);
        if (res.productRating) {
          setProduct((prev) => ({
            ...prev,
            rating: res.productRating,
            reviewsCount: res.reviewsCount,
          }));
        }
      }
    } catch (err) {
      setReviewFeedback(err.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };


  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-50">
        <div className="py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center min-vh-50">
        <div className="py-5">
          <h2 className="fw-bold text-black mb-3">Product Not Found</h2>
          <p className="text-muted mb-4">
            The item you are searching for does not exist or has been archived.
          </p>
          <Link to="/shop" className="btn btn-dark-custom">
            <FiArrowLeft /> Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const productId = product._id || product.id;
  const inWishlist = isInWishlist(productId);
  const gallery = product.images?.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate("/checkout");
  };

  return (
    <div className="product-details-page py-5 bg-white">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item">
              <Link to="/" className="text-muted text-decoration-none">
                Home
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/shop" className="text-muted text-decoration-none">
                Shop
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link
                to={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-muted text-decoration-none"
              >
                {product.category}
              </Link>
            </li>
            <li className="breadcrumb-item active text-black fw-semibold" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* TOP SECTION: GALLERY + SPECIFICATIONS */}
        <div className="row g-5 mb-5">
          {/* LEFT: GALLERY */}
          <div className="col-lg-6">
            <div className="border-custom position-relative bg-light-custom mb-3" style={{ aspectRatio: "1/1", borderRadius: "2px", overflow: "hidden" }}>
              <img
                src={selectedImage}
                alt={product.name}
                className="w-100 h-100 object-fit-cover"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop";
                }}
              />
              {product.discount > 0 && (
                <span className="position-absolute top-0 start-0 m-3 badge-custom badge-custom-black">
                  -{product.discount}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
            {gallery.length > 1 && (
              <div className="d-flex gap-2">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`btn p-0 border-custom overflow-hidden ${selectedImage === imgUrl ? "border-black" : "opacity-75"
                      }`}
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "2px",
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-100 h-100 object-fit-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: COMMERCE SPECIFICATIONS */}
          <div className="col-lg-6">
            <div className="d-flex flex-column h-100">
              {/* Brand & Category */}
              <div className="mb-2">
                <span className="badge-custom badge-custom-gray me-2">
                  {product.brand}
                </span>
                <span className="text-muted small text-uppercase" style={{ letterSpacing: "0.05em" }}>
                  {product.category}
                </span>
              </div>

              {/* Seller Store Name (Admin & Vendor) */}
              {(() => {
                const isVendor = product.sellerType === "vendor" || !!product.vendor;
                let sellerName = "";
                let badgeIcon = "🏪";
                if (isVendor) {
                  sellerName =
                    product.vendor?.vendorProfile?.businessName ||
                    (product.vendor?.firstname ? `${product.vendor.firstname} ${product.vendor.lastname}`.trim() : "") ||
                    product.createdBy?.vendorProfile?.businessName ||
                    (product.createdBy?.firstname ? `${product.createdBy.firstname} ${product.createdBy.lastname}`.trim() : "Approved Vendor");
                } else {
                  badgeIcon = "🏛️";
                  sellerName =
                    product.createdBy?.vendorProfile?.businessName ||
                    (product.createdBy?.firstname ? `${product.createdBy.firstname} ${product.createdBy.lastname}`.trim() : "Admin Official Store");
                }
                return sellerName ? (
                  <div className="mb-2 d-flex align-items-center gap-1">
                    <span className="text-muted small">Sold by:</span>
                    <span
                      className="small fw-semibold text-black px-2 py-1 border-custom bg-light-custom"
                      style={{ borderRadius: "2px", fontSize: "0.75rem" }}
                    >
                      {badgeIcon} {sellerName}
                    </span>
                  </div>
                ) : null;
              })()}



              {/* Title */}
              <h1 className="h2 fw-bold text-black mb-3">{product.name}</h1>

              {/* Star Rating & Review Count */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="d-flex text-dark">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      size={14}
                      className={i < Math.floor(product.rating || 5) ? "text-black" : "text-muted opacity-25"}
                    />
                  ))}
                </div>
                <span className="fw-bold small text-black ms-1">
                  {product.rating ? Number(product.rating).toFixed(1) : "5.0"}
                </span>
                <span className="text-muted small">
                  ({product.reviewsCount || 0} customer reviews)
                </span>
              </div>

              {/* Price Row */}
              <div className="d-flex align-items-baseline gap-3 mb-4 pb-3 border-bottom-custom">
                <span className="display-6 fw-bold text-black">
                  ₦{Number(product.price).toLocaleString()}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="h4 text-muted text-decoration-line-through mb-0">
                    ₦{Number(product.oldPrice).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-medium mb-4 lead" style={{ fontSize: "0.95rem" }}>
                {product.description}
              </p>

              {/* Stock Status */}
              <div className="mb-4">
                {product.stock > 0 ? (
                  <div className="d-flex align-items-center gap-2 text-black small">
                    <span
                      className="rounded-circle d-inline-block"
                      style={{ width: "8px", height: "8px", backgroundColor: "#107C41" }}
                    ></span>
                    <span className="fw-semibold">In Stock</span>
                    <span className="text-muted">({product.stock} units ready to ship)</span>
                  </div>
                ) : (
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <span
                      className="rounded-circle d-inline-block"
                      style={{ width: "8px", height: "8px", backgroundColor: "#C42B1C" }}
                    ></span>
                    <span className="fw-semibold">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Quantity Selector & Action Buttons */}
              <div className="d-flex flex-wrap gap-3 mb-4">
                {/* Quantity */}
                <div className="d-flex align-items-center border-custom" style={{ borderRadius: "2px" }}>
                  <button
                    type="button"
                    className="btn btn-link text-black text-decoration-none px-3"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-3 fw-bold small text-black">{quantity}</span>
                  <button
                    type="button"
                    className="btn btn-link text-black text-decoration-none px-3"
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock || 99, q + 1))
                    }
                    disabled={quantity >= (product.stock || 99)}
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="btn btn-dark-custom flex-grow-1 py-3 px-4"
                  disabled={!product.stock}
                >
                  <FiShoppingBag size={18} /> Add to Cart
                </button>

                {/* Wishlist Toggle */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className="btn btn-outline-custom p-3"
                  title="Save to Wishlist"
                  aria-label="Wishlist"
                >
                  {inWishlist ? <FaHeart size={18} /> : <FiHeart size={18} />}
                </button>
              </div>

              {/* Direct Buy Now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="btn btn-outline-custom w-100 py-3 mb-4"
                disabled={!product.stock}
              >
                Buy Now with Express Checkout
              </button>

              {/* Toast Feedback Banner */}
              {addedToast && (
                <div className="alert alert-dark border-custom d-flex align-items-center gap-2 small py-2 mb-4 animate-fade-in">
                  <FiCheck size={18} className="text-success" />
                  <span>
                    Successfully added <strong>{quantity}x {product.name}</strong> to your shopping bag!
                  </span>
                </div>
              )}

              {/* Value Guarantees */}
              <div className="border-top-custom pt-4 mt-auto">
                <div className="row g-3 text-muted small">
                  <div className="col-sm-4 d-flex align-items-center gap-2">
                    <FiTruck size={16} className="text-black" />
                    <span>Free shipping ₦50,000+</span>
                  </div>
                  <div className="col-sm-4 d-flex align-items-center gap-2">
                    <FiRefreshCw size={16} className="text-black" />
                    <span>30-Day returns</span>
                  </div>
                  <div className="col-sm-4 d-flex align-items-center gap-2">
                    <FiShield size={16} className="text-black" />
                    <span>2-Year warranty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS: DESCRIPTION / SPECIFICATIONS / REVIEWS */}
        <div className="border-top-custom pt-5 mt-5">
          <div className="d-flex gap-4 border-bottom-custom mb-4">
            <button
              type="button"
              className={`btn btn-link text-decoration-none px-0 pb-3 fw-bold small text-uppercase ${activeTab === "description"
                  ? "text-black border-bottom border-2 border-black"
                  : "text-muted"
                }`}
              style={{ letterSpacing: "0.05em", borderRadius: 0 }}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              type="button"
              className={`btn btn-link text-decoration-none px-0 pb-3 fw-bold small text-uppercase ${activeTab === "specifications"
                  ? "text-black border-bottom border-2 border-black"
                  : "text-muted"
                }`}
              style={{ letterSpacing: "0.05em", borderRadius: 0 }}
              onClick={() => setActiveTab("specifications")}
            >
              Specifications
            </button>
            <button
              type="button"
              className={`btn btn-link text-decoration-none px-0 pb-3 fw-bold small text-uppercase ${activeTab === "reviews"
                  ? "text-black border-bottom border-2 border-black"
                  : "text-muted"
                }`}
              style={{ letterSpacing: "0.05em", borderRadius: 0 }}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews ({product.reviewsCount || 0})
            </button>
          </div>

          <div className="tab-content py-2">
            {activeTab === "description" && (
              <div className="row">
                <div className="col-lg-8">
                  <h4 className="fw-bold text-black mb-3">Architectural Philosophy</h4>
                  <p className="text-medium mb-4">{product.description}</p>
                  <p className="text-medium">
                    Every piece in our catalog is engineered to withstand daily wear while maintaining visual purity. Each component is meticulously quality-checked and tested before dispatch.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="row">
                <div className="col-lg-7">
                  <table className="table table-bordered border-custom">
                    <tbody>
                      {product.specifications && Object.keys(product.specifications).length > 0 ? (
                        Object.entries(
                          product.specifications instanceof Map
                            ? Object.fromEntries(product.specifications)
                            : product.specifications
                        ).map(([key, val]) => (
                          <tr key={key}>
                            <th className="bg-light-custom text-black fw-semibold w-40 small py-3">
                              {key}
                            </th>
                            <td className="text-muted small py-3">{val}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="text-muted small">Standard specifications apply.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="row g-4">
                <div className="col-lg-5">
                  <div className="p-4 border-custom bg-light-custom mb-4" style={{ borderRadius: "2px" }}>
                    <h5 className="fw-bold text-black mb-1">Customer Feedback</h5>
                    <div className="d-flex align-items-baseline gap-2 mb-2">
                      <span className="display-5 fw-bold text-black">
                        {product.rating ? Number(product.rating).toFixed(1) : "5.0"}
                      </span>
                      <span className="text-muted small">out of 5 stars</span>
                    </div>
                    <p className="small text-muted mb-0">
                      Based on {reviews.length || product.reviewsCount || 0} verified customer evaluations.
                    </p>
                  </div>

                  {/* SUBMIT REVIEW FORM */}
                  {isAuthenticated ? (
                    <div className="p-4 border-custom bg-white shadow-sm" style={{ borderRadius: "2px" }}>
                      <h6 className="fw-bold text-black mb-3 small text-uppercase" style={{ letterSpacing: "0.05em" }}>
                        Submit Evaluation
                      </h6>

                      {reviewFeedback && (
                        <div className="alert alert-dark border-custom py-2 small mb-3">
                          {reviewFeedback}
                        </div>
                      )}

                      <form onSubmit={handleSubmitReview}>
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-black mb-1">
                            Your Rating (1–5 Stars)
                          </label>
                          <select
                            className="form-select form-select-sm"
                            value={newRating}
                            onChange={(e) => setNewRating(Number(e.target.value))}
                          >
                            <option value={5}>★★★★★ 5 Stars - Exceptional</option>
                            <option value={4}>★★★★☆ 4 Stars - Very Good</option>
                            <option value={3}>★★★☆☆ 3 Stars - Average</option>
                            <option value={2}>★★☆☆☆ 2 Stars - Fair</option>
                            <option value={1}>★☆☆☆☆ 1 Star - Poor</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-black mb-1">
                            Written Feedback
                          </label>
                          <textarea
                            rows={3}
                            className="form-control form-control-sm"
                            placeholder="Share your experience regarding craft, materials, and longevity..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            required
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          className="btn btn-dark-custom w-100 py-2 btn-sm"
                          disabled={submittingReview}
                        >
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="p-3 border-custom bg-white text-center">
                      <p className="small text-muted mb-2">Sign in to leave a verified review.</p>
                      <Link to="/login" className="btn btn-outline-custom btn-sm py-1 px-3">
                        Sign In
                      </Link>
                    </div>
                  )}
                </div>

                <div className="col-lg-7">
                  <div className="d-flex flex-column gap-3">
                    {reviews.length === 0 ? (
                      <div className="p-4 border-custom bg-light-custom text-center">
                        <p className="text-muted small mb-0">
                          No reviews submitted yet. Be the first to evaluate this essential!
                        </p>
                      </div>
                    ) : (
                      reviews.map((r, idx) => (
                        <div key={idx} className="p-3 border-custom bg-white" style={{ borderRadius: "2px" }}>
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-bold small text-black">{r.name}</span>
                            {r.isVerifiedPurchase && (
                              <span className="badge-custom badge-custom-black" style={{ fontSize: "0.62rem" }}>
                                Verified Purchaser
                              </span>
                            )}
                          </div>
                          <div className="d-flex text-dark mb-2">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                size={12}
                                className={i < r.rating ? "text-black" : "text-muted opacity-25"}
                              />
                            ))}
                          </div>
                          <p className="small text-muted mb-0">{r.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="border-top-custom pt-5 mt-5">
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <span className="badge-custom badge-custom-gray mb-1">COMPLETE THE LOOK</span>
                <h3 className="fw-bold text-black mb-0">Related Essentials</h3>
              </div>
              <Link
                to={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-black fw-semibold small text-decoration-none"
              >
                View Category
              </Link>
            </div>

            <div className="row g-4">
              {relatedProducts.map((rel) => (
                <div key={rel._id || rel.id} className="col-6 col-lg-3">
                  <ProductCard product={rel} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
