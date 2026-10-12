import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiTrash2,
  FiArrowRight,
  FiShoppingBag,
  FiCheck,
  FiTruck,
  FiArrowLeft,
} from "react-icons/fi";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    shipping,
    total,
  } = useCart();

  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "NEXORA10" || promoCode.trim().toUpperCase() === "ATELIER10") {
      setDiscount(15);
      setPromoMessage("Promo code NEXORA10 applied (-₦15.00)");
    } else {
      setPromoMessage("Invalid code. Use code 'NEXORA10' for ₦15 off.");
    }
  };

  const finalTotal = Math.max(0, total - discount);
  const freeShippingThreshold = 100;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (cartItems.length === 0) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="py-5">
          <div className="p-3 border-custom rounded-circle d-inline-flex bg-light-custom text-black mb-3">
            <FiShoppingBag size={36} />
          </div>
          <h2 className="fw-bold text-black mb-2">Your Shopping Bag is Empty</h2>
          <p className="text-muted small mb-4">
            You currently have no items in your cart. Explore our essentials to begin.
          </p>
          <Link to="/shop" className="btn btn-dark-custom px-4 py-3">
            Explore Collection <FiArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page py-5 bg-white">
      <div className="container">
        {/* Title */}
        <div className="border-bottom-custom pb-3 mb-4 d-flex justify-content-between align-items-end">
          <div>
            <p className="text-uppercase small mb-1" style={{ letterSpacing: "0.08em", color: "var(--color-medium-gray)" }}>
              Order Review
            </p>
            <h1 className="h2 fw-bold text-black mb-0">Shopping Bag ({cartItems.length})</h1>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="btn btn-link text-muted small p-0 text-decoration-none"
          >
            Clear Entire Bag
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="p-3 bg-light-custom border-custom mb-4" style={{ borderRadius: "2px" }}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <FiTruck size={18} className="text-black" />
            <span className="small fw-semibold text-black">
              {amountToFreeShipping > 0 ? (
                <>Add <strong>₦{amountToFreeShipping.toLocaleString()}</strong> more to receive <strong>Free Worldwide Shipping</strong></>
              ) : (
                <span className="text-success fw-bold">
                  Congratulations! You unlocked Free Worldwide Shipping!
                </span>
              )}
            </span>
          </div>
          <div className="progress" style={{ height: "6px" }}>
            <div
              className="progress-bar bg-black"
              role="progressbar"
              style={{
                width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="row g-5">
          {/* LEFT: PRODUCTS TABLE */}
          <div className="col-lg-8">
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="border-bottom-custom">
                  <tr className="small text-uppercase text-muted" style={{ letterSpacing: "0.05em" }}>
                    <th scope="col" className="pb-3 fw-semibold">Item</th>
                    <th scope="col" className="pb-3 fw-semibold">Price</th>
                    <th scope="col" className="pb-3 fw-semibold text-center">Quantity</th>
                    <th scope="col" className="pb-3 fw-semibold text-end">Total</th>
                    <th scope="col" className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {cartItems.map((item) => (
                    <tr key={item.id} className="border-bottom-custom">
                      {/* Product Thumbnail & Title */}
                      <td className="py-4">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="border-custom object-fit-cover"
                            style={{
                              width: "72px",
                              height: "90px",
                              borderRadius: "2px",
                            }}
                          />
                          <div>
                            <p className="text-muted small text-uppercase mb-1" style={{ fontSize: "0.7rem" }}>
                              {item.category}
                            </p>
                            <Link
                              to={`/product/${item.id}`}
                              className="text-black fw-semibold text-decoration-none small d-block mb-1"
                            >
                              {item.name}
                            </Link>
                          </div>
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="py-4 fw-semibold text-black small">
                        ₦{Number(item.price).toLocaleString()}
                      </td>

                      {/* Quantity Stepper */}
                      <td className="py-4 text-center">
                        <div
                          className="d-inline-flex align-items-center border-custom"
                          style={{ borderRadius: "2px" }}
                        >
                          <button
                            type="button"
                            className="btn btn-link text-black p-0 px-2 text-decoration-none"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="px-2 small fw-bold text-black">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="btn btn-link text-black p-0 px-2 text-decoration-none"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Line Total */}
                      <td className="py-4 text-end fw-bold text-black small">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </td>

                      {/* Remove Action */}
                      <td className="py-4 text-end">
                        <button
                          type="button"
                          className="btn btn-link text-muted p-1 border-0"
                          onClick={() => removeFromCart(item.id)}
                          title="Remove item"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center pt-3">
              <Link to="/shop" className="text-black small text-decoration-none d-flex align-items-center gap-2">
                <FiArrowLeft /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="col-lg-4">
            <div className="p-4 border-custom bg-light-custom" style={{ borderRadius: "2px" }}>
              <h5 className="fw-bold text-black mb-3 small text-uppercase" style={{ letterSpacing: "0.05em" }}>
                Order Summary
              </h5>

              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Subtotal</span>
                <span className="fw-semibold text-black">₦{subtotal.toLocaleString()}</span>
              </div>

              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Estimated Shipping</span>
                <span className="fw-semibold text-black">
                  {shipping === 0 ? "FREE" : `₦${shipping.toLocaleString()}`}
                </span>
              </div>

              {discount > 0 && (
                <div className="d-flex justify-content-between mb-2 small text-success">
                  <span>Promotional Discount</span>
                  <span>-₦{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="border-top-custom my-3"></div>

              <div className="d-flex justify-content-between align-items-baseline mb-4">
                <span className="fw-bold text-black">Estimated Total</span>
                <span className="h4 fw-bold text-black mb-0">
                  ₦{finalTotal.toLocaleString()}
                </span>
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="mb-4">
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Promo code (e.g. NEXORA10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button type="submit" className="btn btn-outline-custom btn-sm py-1">
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p className="small text-muted mt-2 mb-0" style={{ fontSize: "0.75rem" }}>
                    {promoMessage}
                  </p>
                )}
              </form>

              {/* Proceed to Checkout Trigger */}
              <button
                type="button"
                onClick={() => navigate("/checkout")}
                className="btn btn-dark-custom w-100 py-3"
              >
                Proceed to Checkout <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
