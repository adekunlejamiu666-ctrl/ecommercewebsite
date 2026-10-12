import React from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingBag, FiTrash2, FiArrowRight } from "react-icons/fi";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id || product._id);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="py-5">
          <div className="p-3 border-custom rounded-circle d-inline-flex bg-light-custom text-black mb-3">
            <FiHeart size={36} />
          </div>
          <h2 className="fw-bold text-black mb-2">Your Wishlist is Empty</h2>
          <p className="text-muted small mb-4">
            Curate your personal collection of favorite garments, gadgets, and home essentials.
          </p>
          <Link to="/shop" className="btn btn-dark-custom px-4 py-3">
            Explore Collection <FiArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page py-5 bg-white">
      <div className="container">
        {/* Title */}
        <div className="border-bottom-custom pb-3 mb-4 d-flex justify-content-between align-items-end">
          <div>
            <p className="text-uppercase small mb-1" style={{ letterSpacing: "0.08em", color: "var(--color-medium-gray)" }}>
              Saved Items
            </p>
            <h1 className="h2 fw-bold text-black mb-0">My Wishlist ({wishlistItems.length})</h1>
          </div>
        </div>

        {/* Wishlist Items Grid */}
        <div className="row g-4">
          {wishlistItems.map((item) => (
            <div key={item.id} className="col-6 col-md-4 col-lg-3">
              <div className="card-custom h-100 d-flex flex-column position-relative bg-white">
                {/* Media */}
                <div className="position-relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
                  <Link to={`/product/${item.id}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-100 h-100 object-fit-cover"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.id)}
                    className="btn position-absolute top-0 end-0 m-2 p-2 bg-white rounded-circle shadow-sm border-0 text-muted"
                    style={{ width: "32px", height: "32px" }}
                    title="Remove from wishlist"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
                  <div>
                    <p className="text-muted small text-uppercase mb-1" style={{ fontSize: "0.7rem" }}>
                      {item.category}
                    </p>
                    <h5 style={{ fontSize: "0.9rem", lineHeight: 1.3 }} className="mb-2">
                      <Link
                        to={`/product/${item.id}`}
                        className="text-black text-decoration-none fw-semibold"
                      >
                        {item.name}
                      </Link>
                    </h5>
                    <p className="fw-bold text-black small mb-0">
                      ₦{Number(item.price).toLocaleString()}
                    </p>
                  </div>

                  <div className="pt-3 border-top-custom mt-3">
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(item)}
                      className="btn btn-dark-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                      style={{ fontSize: "0.8rem" }}
                    >
                      <FiShoppingBag size={14} /> Move to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
