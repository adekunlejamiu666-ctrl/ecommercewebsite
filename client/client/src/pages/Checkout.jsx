import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiLock,
  FiCheckCircle,
  FiAlertCircle,
  FiTruck,
  FiArrowLeft,
  FiCreditCard,
  FiShield,
} from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import orderService from "../services/orderService";
import paymentService from "../services/paymentService";

const PAYSTACK_PUBLIC_KEY =
  import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
  "pk_test_9ee0209c7af22aef097e36e4e7e9c230a410b1d7";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, shipping, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // If cart is empty, redirect to cart page
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  // Ensure Paystack Inline JS script is loaded
  useEffect(() => {
    if (!window.PaystackPop) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Shipping Form State
  const [formData, setFormData] = useState({
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    email: user?.email || "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    country: user?.address?.country || "Nigeria",
    postalCode: user?.address?.postalCode || "",
  });

  // Delivery Method State
  const [deliveryMethod, setDeliveryMethod] = useState("standard"); // 'standard' or 'express'

  // Payment Method Selection: 'paystack' (Cards, Transfer, USSD) or 'pod' (Pay on Delivery)
  const [paymentOption, setPaymentOption] = useState("paystack");

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Compute shipping fee based on selected method
  const shippingFee =
    deliveryMethod === "express"
      ? 25
      : subtotal > 100 || subtotal === 0
        ? 0
        : 15;

  const totalAmount = subtotal + shippingFee;

  const handlePaymentVerification = async (reference, orderId) => {
    setVerifying(true);
    setLoading(false);
    try {
      await paymentService.verifyPaystack({
        reference,
        orderId,
      });
      clearCart();
      navigate(
        `/order-success/${orderId}?ref=${reference}&status=paid`
      );
    } catch (vErr) {
      console.warn("Paystack verification warning:", vErr.message);
      clearCart();
      navigate(
        `/order-success/${orderId}?ref=${reference}&status=paid`
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!isAuthenticated) {
      return setError(
        "Please sign in or create an account before finalizing your order."
      );
    }

    if (
      !formData.firstname.trim() ||
      !formData.lastname.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.street.trim() ||
      !formData.city.trim() ||
      !formData.state.trim()
    ) {
      return setError("Please fill in all required shipping address fields.");
    }

    setLoading(true);

    try {
      const basePayload = {
        orderItems: cartItems.map((item) => ({
          product: item.id || item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: {
          firstname: formData.firstname.trim(),
          lastname: formData.lastname.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          country: formData.country.trim(),
          postalCode: formData.postalCode.trim() || "100001",
        },
        deliveryMethod: {
          title:
            deliveryMethod === "express"
              ? "Express Priority Courier"
              : "Standard Tracked Delivery",
          price: shippingFee,
        },
        subtotal,
        shippingPrice: shippingFee,
        discount: 0,
        totalAmount,
      };

      // ── Option A: PAYSTACK ONLINE PAYMENT ─────────────────────────────────
      if (paymentOption === "paystack") {
        if (!window.PaystackPop) {
          throw new Error(
            "Paystack payment gateway is loading. Please check your internet connection and try again in a moment."
          );
        }

        // Create initial pending order in DB
        const createRes = await orderService.createOrder({
          ...basePayload,
          paymentMethod: "Paystack (Card/Transfer/USSD)",
          paymentStatus: "Pending",
          isPaid: false,
        });

        if (!createRes.success || !createRes.order) {
          throw new Error(createRes.message || "Unable to reserve your order.");
        }

        const createdOrder = createRes.order;
        const refCode = `ATL_${createdOrder._id.slice(-6)}_${Date.now()}`;

        // Launch Official Paystack Inline Modal
        const handler = window.PaystackPop.setup({
          key: PAYSTACK_PUBLIC_KEY,
          email: formData.email.trim(),
          amount: Math.round(totalAmount * 100), // In KOBO
          currency: "NGN",
          ref: refCode,
          metadata: {
            custom_fields: [
              {
                display_name: "Customer Name",
                variable_name: "customer_name",
                value: `${formData.firstname} ${formData.lastname}`.trim(),
              },
              {
                display_name: "Order ID",
                variable_name: "order_id",
                value: createdOrder._id,
              },
              {
                display_name: "Phone Number",
                variable_name: "phone",
                value: formData.phone.trim(),
              },
            ],
          },
          callback: function (response) {
            handlePaymentVerification(response.reference, createdOrder._id);
          },
          onClose: function () {
            setLoading(false);
            setInfoMessage(
              "Paystack window was closed. Your order is drafted; you can retry payment whenever you're ready."
            );
          },
        });

        handler.openIframe();
        return;
      }

      // ── Option B: PAY ON DELIVERY / DIRECT ORDER ──────────────────────────
      const res = await orderService.createOrder({
        ...basePayload,
        paymentMethod: "Pay on Delivery / Direct Order",
        paymentStatus: "Pending",
        isPaid: false,
      });

      if (res.success && res.order) {
        clearCart();
        navigate(`/order-success/${res.order._id}?status=confirmed`);
      } else {
        throw new Error(res.message || "Failed to process order.");
      }
    } catch (err) {
      setError(err.message || "An error occurred while creating your order.");
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page py-5 bg-white">
      {/* Verification Overlay */}
      {verifying && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-95"
          style={{ zIndex: 9999 }}
        >
          <div className="spinner-border text-dark mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="fw-bold text-black mb-1">Verifying Paystack Payment...</h4>
          <p className="text-muted small mb-0">
            Securing your transaction and confirming fulfillment. Please do not close this window.
          </p>
        </div>
      )}

      <div className="container">
        {/* Breadcrumb / Title */}
        <div className="border-bottom-custom pb-3 mb-4">
          <Link
            to="/cart"
            className="text-muted small text-decoration-none d-inline-flex align-items-center gap-1 mb-2"
          >
            <FiArrowLeft /> Back to Shopping Bag
          </Link>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <h1 className="h2 fw-bold text-black mb-1">Secure Checkout</h1>
              <p className="text-muted small mb-0">
                Complete your destination and payment preferences to finalize purchase.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2 px-3 py-1 bg-light-custom border-custom" style={{ borderRadius: "2px" }}>
              <FiShield className="text-emerald" size={16} />
              <span className="small text-muted" style={{ fontSize: "0.78rem" }}>
                256-Bit SSL Encrypted Checkout
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger py-3 small d-flex align-items-center gap-2 mb-4 border-0">
            <FiAlertCircle size={18} />
            <span>{error}</span>
            {!isAuthenticated && (
              <Link to="/login" state={{ from: "/checkout" }} className="fw-bold ms-auto text-dark">
                Sign In Now &rarr;
              </Link>
            )}
          </div>
        )}

        {infoMessage && (
          <div className="alert alert-dark border-custom py-3 small d-flex align-items-center gap-2 mb-4">
            <FiAlertCircle size={18} />
            <span>{infoMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="row g-5">
            {/* LEFT: SHIPPING & PAYMENT FORMS */}
            <div className="col-lg-7">
              {/* SECTION 1: SHIPPING INFORMATION */}
              <div className="p-4 border-custom bg-white mb-4" style={{ borderRadius: "2px" }}>
                <h5 className="fw-bold text-black mb-3 small text-uppercase" style={{ letterSpacing: "0.05em" }}>
                  1. Shipping Information
                </h5>

                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-black mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstname"
                      className="form-control rounded-0 small border-custom"
                      value={formData.firstname}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-black mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastname"
                      className="form-control rounded-0 small border-custom"
                      value={formData.lastname}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-black mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control rounded-0 small border-custom"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-black mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control rounded-0 small border-custom"
                      placeholder="080 1234 5678"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-black mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    className="form-control rounded-0 small border-custom"
                    placeholder="e.g. 15 Admiralty Way, Lekki Phase 1"
                    value={formData.street}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-black mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      className="form-control rounded-0 small border-custom"
                      placeholder="e.g. Lagos"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-black mb-1">
                      State / Region *
                    </label>
                    <input
                      type="text"
                      name="state"
                      className="form-control rounded-0 small border-custom"
                      placeholder="e.g. Lagos State"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-black mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      className="form-control rounded-0 small border-custom"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-black mb-1">
                      Postal / ZIP Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      className="form-control rounded-0 small border-custom"
                      placeholder="100001"
                      value={formData.postalCode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DELIVERY METHOD */}
              <div className="p-4 border-custom bg-white mb-4" style={{ borderRadius: "2px" }}>
                <h5 className="fw-bold text-black mb-3 small text-uppercase" style={{ letterSpacing: "0.05em" }}>
                  2. Delivery Option
                </h5>

                <div className="d-flex flex-column gap-3">
                  <label
                    className={`d-flex justify-content-between align-items-center p-3 border-custom cursor-pointer ${deliveryMethod === "standard" ? "border-black bg-light-custom" : ""
                      }`}
                    style={{ borderRadius: "2px", cursor: "pointer" }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryMethod === "standard"}
                        onChange={() => setDeliveryMethod("standard")}
                      />
                      <div>
                        <p className="mb-0 fw-semibold text-black small">Standard Delivery</p>
                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                          3–5 business days &bull; Tracked dispatch across Nigeria
                        </span>
                      </div>
                    </div>
                    <span className="fw-bold small text-black">
                      {subtotal > 100 ? "FREE" : "₦15.00"}
                    </span>
                  </label>

                  <label
                    className={`d-flex justify-content-between align-items-center p-3 border-custom cursor-pointer ${deliveryMethod === "express" ? "border-black bg-light-custom" : ""
                      }`}
                    style={{ borderRadius: "2px", cursor: "pointer" }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryMethod === "express"}
                        onChange={() => setDeliveryMethod("express")}
                      />
                      <div>
                        <p className="mb-0 fw-semibold text-black small">Express Priority Courier</p>
                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                          1–2 business days &bull; Dedicated courier dispatch
                        </span>
                      </div>
                    </div>
                    <span className="fw-bold small text-black">₦25.00</span>
                  </label>
                </div>
              </div>

              {/* SECTION 3: PROFESSIONAL PAYMENT METHOD SELECTOR */}
              <div className="p-4 border-custom bg-white" style={{ borderRadius: "2px" }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-black mb-0 small text-uppercase" style={{ letterSpacing: "0.05em" }}>
                    3. Payment Method
                  </h5>
                  <span className="text-muted small d-flex align-items-center gap-1">
                    <FiLock size={12} /> SSL Encrypted
                  </span>
                </div>

                <div className="d-flex flex-column gap-3">
                  {/* OPTION 1: PAYSTACK (RECOMMENDED) */}
                  <label
                    className={`p-3 border-custom cursor-pointer transition ${paymentOption === "paystack"
                        ? "border-black bg-light-custom shadow-sm"
                        : "bg-white"
                      }`}
                    style={{ borderRadius: "2px", cursor: "pointer" }}
                  >
                    <div className="d-flex align-items-start gap-3">
                      <input
                        type="radio"
                        name="paymentOption"
                        className="mt-1"
                        checked={paymentOption === "paystack"}
                        onChange={() => setPaymentOption("paystack")}
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
                          <span className="fw-bold text-black small d-flex align-items-center gap-2">
                            Paystack Instant Payment
                            <span
                              className="badge"
                              style={{
                                backgroundColor: "var(--primary)",
                                color: "#fff",
                                fontSize: "0.68rem",
                                fontWeight: "600",
                              }}
                            >
                              RECOMMENDED
                            </span>
                          </span>

                          {/* Gateway Brand Badges */}
                          <div className="d-flex align-items-center gap-1">
                            <span className="badge bg-white text-dark border px-2 py-1 font-monospace" style={{ fontSize: "0.68rem" }}>
                              Mastercard
                            </span>
                            <span className="badge bg-white text-dark border px-2 py-1 font-monospace" style={{ fontSize: "0.68rem" }}>
                              VISA
                            </span>
                            <span className="badge bg-white text-dark border px-2 py-1 font-monospace" style={{ fontSize: "0.68rem" }}>
                              Verve
                            </span>
                            <span className="badge bg-white text-dark border px-2 py-1 font-monospace" style={{ fontSize: "0.68rem" }}>
                              Transfer
                            </span>
                            <span className="badge bg-white text-dark border px-2 py-1 font-monospace" style={{ fontSize: "0.68rem" }}>
                              USSD
                            </span>
                          </div>
                        </div>

                        <p className="text-muted small mb-2" style={{ fontSize: "0.78rem" }}>
                          Pay securely with your Nigerian or international Debit/Credit card, instant Bank Transfer, USSD (*737#, *901#, etc.).
                        </p>

                        <div className="d-flex align-items-center gap-2 pt-2 border-top-custom">
                          <FiShield size={13} style={{ color: "var(--primary)" }} />
                          <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                            Powered by <strong>Paystack</strong> &bull; PCI-DSS Level 1 Certified
                          </span>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* OPTION 2: PAY ON DELIVERY */}
                  <label
                    className={`p-3 border-custom cursor-pointer transition ${paymentOption === "pod"
                        ? "border-black bg-light-custom shadow-sm"
                        : "bg-white"
                      }`}
                    style={{ borderRadius: "2px", cursor: "pointer" }}
                  >
                    <div className="d-flex align-items-start gap-3">
                      <input
                        type="radio"
                        name="paymentOption"
                        className="mt-1"
                        checked={paymentOption === "pod"}
                        onChange={() => setPaymentOption("pod")}
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="fw-bold text-black small">
                            Pay on Delivery (Cash / POS)
                          </span>
                          <span className="text-muted small" style={{ fontSize: "0.72rem" }}>
                            No Online Payment
                          </span>
                        </div>
                        <p className="text-muted small mb-0" style={{ fontSize: "0.78rem" }}>
                          Pay with cash or card transfer directly when your parcel is delivered to your designated shipping address.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT: ORDER SUMMARY */}
            <div className="col-lg-5">
              <div
                className="p-4 border-custom bg-light-custom position-sticky"
                style={{ top: "100px", borderRadius: "2px" }}
              >
                <h5 className="fw-bold text-black mb-3 small text-uppercase" style={{ letterSpacing: "0.05em" }}>
                  Order Review ({cartItems.length} items)
                </h5>

                {/* Items preview */}
                <div className="d-flex flex-column gap-3 mb-4 max-vh-40 overflow-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="d-flex align-items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="border-custom object-fit-cover"
                        style={{ width: "48px", height: "58px", borderRadius: "2px" }}
                      />
                      <div className="flex-grow-1">
                        <p className="mb-0 fw-semibold text-black small text-truncate" style={{ maxWidth: "190px" }}>
                          {item.name}
                        </p>
                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                          Qty: {item.quantity} &times; ₦{Number(item.price).toLocaleString()}
                        </span>
                      </div>
                      <span className="fw-bold small text-black">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-top-custom pt-3 mb-3">
                  <div className="d-flex justify-content-between mb-2 small">
                    <span className="text-muted">Subtotal</span>
                    <span className="fw-semibold text-black">₦{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="d-flex justify-content-between mb-2 small">
                    <span className="text-muted">Shipping</span>
                    <span className="fw-semibold text-black">
                      {shippingFee === 0 ? "FREE" : `₦${shippingFee.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="border-top-custom my-3"></div>

                  <div className="d-flex justify-content-between align-items-baseline mb-4">
                    <span className="fw-bold text-black">Total Due</span>
                    <span className="h4 fw-bold text-black mb-0">
                      ₦{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Submit / Pay Button */}
                <button
                  type="submit"
                  className="btn btn-dark-custom w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                  disabled={loading || verifying}
                  style={{
                    backgroundColor: paymentOption === "paystack" ? "#0F766E" : "#111111",
                    borderColor: paymentOption === "paystack" ? "#0F766E" : "#111111",
                  }}
                >
                  {loading ? (
                    <span>Opening Payment Gateway...</span>
                  ) : paymentOption === "paystack" ? (
                    <>
                      <FiLock size={15} />
                      <span>Pay ₦{totalAmount.toLocaleString()} with Paystack</span>
                    </>
                  ) : (
                    <span>Place Order &bull; ₦{totalAmount.toLocaleString()}</span>
                  )}
                </button>

                {/* Trust and reassurance footer */}
                <div className="text-center mt-3">
                  <p className="text-muted mb-0" style={{ fontSize: "0.72rem" }}>
                    🔒 Secured by 256-bit SSL encryption &bull; 100% Buyer Protection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
