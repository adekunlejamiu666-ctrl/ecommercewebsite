import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiCheck,
  FiPackage,
  FiTruck,
  FiClock,
  FiArrowLeft,
  FiAlertCircle,
  FiMapPin,
  FiCreditCard,
} from "react-icons/fi";
import orderService from "../services/orderService";

const statusSteps = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);

    orderService
      .getOrderById(id)
      .then((data) => {
        if (isCurrent && data?.order) {
          setOrder(data.order);
        }
      })
      .catch((err) => {
        if (isCurrent) setError(err.message || "Failed to load order.");
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-50">
        <div className="py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading order...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-5 text-center min-vh-50">
        <div className="py-5">
          <div className="p-3 border-custom rounded-circle d-inline-flex bg-light-custom text-black mb-3">
            <FiAlertCircle size={36} />
          </div>
          <h2 className="fw-bold text-black mb-2">Order Not Located</h2>
          <p className="text-muted small mb-4">
            {error || "We could not find the requested order tracking file."}
          </p>
          <Link to="/my-orders" className="btn btn-dark-custom">
            <FiArrowLeft /> Return to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = statusSteps.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "Cancelled";

  return (
    <div className="order-details-page py-5 bg-white">
      <div className="container">
        {/* Header Breadcrumbs */}
        <div className="border-bottom-custom pb-3 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-2">
          <div>
            <Link to="/my-orders" className="text-muted small text-decoration-none d-inline-flex align-items-center gap-1 mb-2">
              <FiArrowLeft /> Back to Order History
            </Link>
            <h1 className="h3 fw-bold text-black mb-0">
              Order #{order._id.substring(order._id.length - 8).toUpperCase()}
            </h1>
            <p className="text-muted small mb-0">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge-custom badge-custom-black">
              Status: {order.orderStatus}
            </span>
            <span className="badge-custom badge-custom-gray">
              Payment: {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* ORDER TRACKING PROGRESS STEPPER */}
        <div className="p-4 border-custom bg-light-custom mb-5" style={{ borderRadius: "2px" }}>
          <h5 className="fw-bold text-black mb-4 small text-uppercase" style={{ letterSpacing: "0.05em" }}>
            Real-Time Order Tracking
          </h5>

          {isCancelled ? (
            <div className="alert alert-danger py-2 small mb-0 border-0">
              This order has been cancelled. Please reach out to customer concierge for assistance.
            </div>
          ) : (
            <div className="row g-2 text-center position-relative">
              {statusSteps.map((step, idx) => {
                const isPassed = currentStatusIndex >= idx;
                const isCurrent = currentStatusIndex === idx;

                return (
                  <div key={step} className="col">
                    <div className="d-flex flex-column align-items-center">
                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${isPassed
                            ? "bg-black text-white"
                            : "bg-white border-custom text-muted"
                          }`}
                        style={{ width: "36px", height: "36px" }}
                      >
                        {isPassed ? <FiCheck size={18} /> : <span style={{ fontSize: "0.8rem" }}>{idx + 1}</span>}
                      </div>
                      <span
                        className={`small text-uppercase ${isCurrent ? "fw-bold text-black" : isPassed ? "text-dark" : "text-muted"
                          }`}
                        style={{ fontSize: "0.72rem", letterSpacing: "0.04em" }}
                      >
                        {step}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ORDER DETAILS GRID */}
        <div className="row g-5">
          {/* LEFT: LINE ITEMS */}
          <div className="col-lg-8">
            <h5 className="fw-bold text-black mb-3 small text-uppercase" style={{ letterSpacing: "0.05em" }}>
              Items in This Dispatch
            </h5>

            <div className="d-flex flex-column gap-3 mb-4">
              {order.orderItems?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 border-custom bg-white d-flex align-items-center gap-3"
                  style={{ borderRadius: "2px" }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="border-custom object-fit-cover"
                    style={{ width: "64px", height: "76px", borderRadius: "2px" }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1 text-black fw-semibold small">{item.name}</h6>
                    <p className="mb-0 text-muted small">
                      Quantity: <strong>{item.quantity}</strong> &times; ₦{Number(item.price).toLocaleString()}
                    </p>
                  </div>
                  <span className="fw-bold text-black small">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: DESTINATION & TOTALS */}
          <div className="col-lg-4">
            <div className="d-flex flex-column gap-4">
              {/* Shipping Address */}
              <div className="p-4 border-custom bg-light-custom" style={{ borderRadius: "2px" }}>
                <h6 className="fw-bold text-black mb-3 small text-uppercase" style={{ letterSpacing: "0.05em" }}>
                  Delivery Destination
                </h6>
                <div className="small text-medium d-flex flex-column gap-1">
                  <p className="mb-0 fw-semibold text-black">
                    {order.shippingAddress?.firstname} {order.shippingAddress?.lastname}
                  </p>
                  <p className="mb-0">{order.shippingAddress?.street}</p>
                  <p className="mb-0">
                    {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                    {order.shippingAddress?.postalCode}
                  </p>
                  <p className="mb-0">{order.shippingAddress?.country}</p>
                  <p className="mb-0 text-muted mt-2">
                    Contact: {order.shippingAddress?.phone}
                  </p>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="p-4 border-custom bg-light-custom" style={{ borderRadius: "2px" }}>
                <h6 className="fw-bold text-black mb-3 small text-uppercase" style={{ letterSpacing: "0.05em" }}>
                  Payment Breakdown
                </h6>
                <div className="d-flex justify-content-between mb-2 small text-medium">
                  <span>Method</span>
                  <span className="text-black fw-semibold">{order.paymentMethod || "Paystack"}</span>
                </div>
                {order.paymentReference && (
                  <div className="d-flex justify-content-between mb-2 small text-medium">
                    <span>Reference</span>
                    <span className="font-monospace fw-semibold" style={{ color: "var(--primary)" }}>
                      {order.paymentReference}
                    </span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2 small text-medium">
                  <span>Status</span>
                  <span
                    className="badge font-monospace px-2 py-1"
                    style={{
                      backgroundColor: order.isPaid || order.paymentStatus === "Paid" ? "var(--primary-light)" : "#E5E7EB",
                      color: order.isPaid || order.paymentStatus === "Paid" ? "var(--primary-dark)" : "#374151",
                      fontSize: "0.7rem",
                    }}
                  >
                    {order.isPaid || order.paymentStatus === "Paid" ? "PAID" : "PENDING"}
                  </span>
                </div>
                <div className="border-top-custom my-2"></div>
                <div className="d-flex justify-content-between mb-2 small text-medium">
                  <span>Subtotal</span>
                  <span className="text-black fw-semibold">₦{order.subtotal?.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 small text-medium">
                  <span>Shipping ({order.deliveryMethod?.title || "Standard"})</span>
                  <span className="text-black fw-semibold">
                    {order.shippingPrice === 0 ? "FREE" : `₦${order.shippingPrice?.toLocaleString()}`}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="d-flex justify-content-between mb-2 small text-success">
                    <span>Discount</span>
                    <span>-₦{order.discount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-top-custom my-3"></div>
                <div className="d-flex justify-content-between align-items-baseline">
                  <span className="fw-bold text-black">Total Amount</span>
                  <span className="h4 fw-bold text-black mb-0">
                    ₦{order.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
