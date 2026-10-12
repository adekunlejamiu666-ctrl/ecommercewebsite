import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingBag, FiEye, FiStar } from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const productId = product.id || product._id;
  const inWishlist = isInWishlist(productId);

  // Compute discount percentage if oldPrice exists
  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : product.discount || null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      className="h-100 d-flex flex-column position-relative bg-white group-card"
      style={{
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--card-border)",
        overflow: "hidden",
        transition: "all 0.3s ease",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)";
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.borderColor = "#C9C4BA";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--card-border)";
      }}
    >
      {/* ── Image Area ─────────────────────────────────── */}
      <div
        className="position-relative overflow-hidden"
        style={{ aspectRatio: "4/5", background: "#F9F8F5" }}
      >
        <Link to={`/product/${productId}`} tabIndex={-1}>
          <img
            src={product.image || (product.images && product.images[0])}
            alt={product.name}
            loading="lazy"
            className="w-100 h-100"
            style={{
              objectFit: "cover",
              transition: "transform 0.45s ease-out",
              display: "block",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop";
            }}
          />
        </Link>

        {/* Wishlist pill */}
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          className="btn position-absolute top-0 end-0 m-2 p-0 bg-white border-0 d-flex align-items-center justify-content-center shadow-sm"
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            zIndex: 3,
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {inWishlist ? (
            <FaHeart style={{ color: "#DC2626" }} size={15} />
          ) : (
            <FiHeart className="text-dark" size={15} />
          )}
        </button>

        {/* Discount / New badge */}
        {discountPercent ? (
          <span
            className="position-absolute top-0 start-0 m-2 badge-emerald"
            style={{ zIndex: 3 }}
          >
            -{discountPercent}%
          </span>
        ) : product.isNewArrival ? (
          <span
            className="position-absolute top-0 start-0 m-2 badge-emerald"
            style={{ zIndex: 3 }}
          >
            NEW
          </span>
        ) : null}

        {/* Hover quick-action overlay (slides up) */}
        <div
          className="position-absolute bottom-0 start-0 end-0 d-flex gap-2 p-2"
          style={{
            background: "linear-gradient(0deg, rgba(12,20,19,0.82) 0%, rgba(12,20,19,0) 100%)",
            transform: "translateY(100%)",
            transition: "transform 0.3s ease",
            zIndex: 4,
          }}
          ref={(el) => {
            if (!el) return;
            const card = el.closest("[data-card]") || el.parentElement?.parentElement;
            if (card) {
              card.addEventListener("mouseenter", () => {
                el.style.transform = "translateY(0)";
              });
              card.addEventListener("mouseleave", () => {
                el.style.transform = "translateY(100%)";
              });
            }
          }}
        >
          {/* View Details quick-link */}
          <Link
            to={`/product/${productId}`}
            className="btn btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1 fw-semibold"
            style={{
              backgroundColor: "rgba(255,255,255,0.92)",
              color: "#0C1413",
              borderRadius: "var(--radius-md)",
              fontSize: "0.78rem",
              backdropFilter: "blur(4px)",
              border: "none",
            }}
          >
            <FiEye size={13} /> View
          </Link>

          {/* Quick Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="btn btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1 fw-semibold text-white"
            style={{
              backgroundColor: added ? "#059669" : "var(--emerald)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.78rem",
              border: "none",
              transition: "background-color 0.25s ease",
            }}
          >
            <FiShoppingBag size={13} /> {added ? "Added!" : "Add"}
          </button>
        </div>
      </div>

      {/* ── Card Body ──────────────────────────────────── */}
      <div className="p-3 d-flex flex-column flex-grow-1">
        {/* Category */}
        <p
          className="text-uppercase mb-1 fw-semibold"
          style={{
            fontSize: "0.68rem",
            letterSpacing: "0.09em",
            color: "var(--emerald)",
          }}
        >
          {product.category?.name || product.category || "General"}
        </p>

        {/* Product Name */}
        <h3
          style={{ fontSize: "0.92rem", lineHeight: 1.35, fontFamily: "var(--font-serif)" }}
          className="mb-1 fw-semibold"
        >
          <Link
            to={`/product/${productId}`}
            className="text-decoration-none"
            style={{ color: "var(--text-heading)" }}
          >
            {product.name}
          </Link>
        </h3>

        {/* Seller */}
        {(() => {
          const isVendor = product.sellerType === "vendor" || !!product.vendor;
          let sellerName = "";
          if (isVendor) {
            sellerName =
              product.vendor?.vendorProfile?.businessName ||
              (product.vendor?.firstname
                ? `${product.vendor.firstname} ${product.vendor.lastname}`.trim()
                : "") ||
              product.createdBy?.vendorProfile?.businessName ||
              (product.createdBy?.firstname
                ? `${product.createdBy.firstname} ${product.createdBy.lastname}`.trim()
                : "Approved Vendor");
          } else {
            sellerName =
              product.createdBy?.vendorProfile?.businessName ||
              (product.createdBy?.firstname
                ? `${product.createdBy.firstname} ${product.createdBy.lastname}`.trim()
                : "");
          }
          return sellerName ? (
            <p className="mb-1 text-muted" style={{ fontSize: "0.7rem" }}>
              by <span className="fw-semibold" style={{ color: "#374151" }}>{sellerName}</span>
            </p>
          ) : null;
        })()}

        {/* Star rating */}
        <div className="d-flex align-items-center gap-1 mb-3">
          <div className="d-flex" style={{ gap: "1px" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                size={10}
                style={{
                  color:
                    star <= Math.round(product.rating || 5)
                      ? "#F59E0B"
                      : "#E5E7EB",
                }}
              />
            ))}
          </div>
          <span className="small fw-semibold ms-1" style={{ fontSize: "0.75rem", color: "#374151" }}>
            {product.rating ? Number(product.rating).toFixed(1) : "5.0"}
          </span>
          {product.reviewsCount !== undefined && (
            <span className="text-muted" style={{ fontSize: "0.72rem" }}>
              ({product.reviewsCount})
            </span>
          )}
        </div>

        {/* ── Price + Action Buttons ──────────────────── */}
        <div className="mt-auto">
          {/* Price row */}
          <div className="d-flex align-items-baseline gap-2 mb-2">
            <span className="fw-bold" style={{ fontSize: "1.05rem", color: "#0C1413", fontFamily: "var(--font-serif)" }}>
              ₦{Number(product.price).toLocaleString()}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span
                className="text-muted text-decoration-line-through"
                style={{ fontSize: "0.82rem" }}
              >
                ₦{Number(product.oldPrice).toLocaleString()}
              </span>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="d-flex gap-2">
            {/* View Details */}
            <Link
              to={`/product/${productId}`}
              className="btn btn-sm flex-grow-1 fw-semibold d-flex align-items-center justify-content-center gap-1"
              style={{
                border: "1.5px solid var(--card-border)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.78rem",
                color: "#374151",
                backgroundColor: "#FAFAF9",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--emerald)";
                e.currentTarget.style.color = "var(--emerald)";
                e.currentTarget.style.backgroundColor = "rgba(15,118,110,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--card-border)";
                e.currentTarget.style.color = "#374151";
                e.currentTarget.style.backgroundColor = "#FAFAF9";
              }}
            >
              <FiEye size={13} /> Details
            </Link>

            {/* Add to Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="btn btn-sm flex-grow-1 fw-semibold d-flex align-items-center justify-content-center gap-1 text-white"
              style={{
                backgroundColor: added ? "#059669" : "var(--emerald)",
                border: "1.5px solid transparent",
                borderRadius: "var(--radius-md)",
                fontSize: "0.78rem",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                if (!added) {
                  e.currentTarget.style.backgroundColor = "var(--emerald-light)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!added) {
                  e.currentTarget.style.backgroundColor = "var(--emerald)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              <FiShoppingBag size={13} />
              {added ? "Added ✓" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
