import React from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { FiCheckCircle, FiPackage, FiShoppingBag, FiShield } from "react-icons/fi";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const paymentRef = searchParams.get("ref");
  const isPaid = searchParams.get("status") === "paid";

  return (
    <div className="order-success-page py-5 bg-white min-vh-75 d-flex align-items-center">
      <div className="container py-4 text-center">
        <div className="mx-auto" style={{ maxWidth: "580px" }}>
          {/* Success Icon */}
          <div
            className="p-3 border-custom rounded-circle d-inline-flex bg-light-custom text-black mb-4"
            style={{
              borderColor: isPaid ? "var(--primary)" : undefined,
              backgroundColor: isPaid ? "rgba(15, 118, 110, 0.08)" : undefined,
            }}
          >
            <FiCheckCircle
              size={48}
              style={{ color: isPaid ? "var(--primary)" : "#111111" }}
            />
          </div>

          <div className="d-flex justify-content-center gap-2 mb-2">
            <span
              className="badge px-3 py-1"
              style={{
                backgroundColor: isPaid ? "var(--primary)" : "#111111",
                color: "#ffffff",
                letterSpacing: "0.06em",
                fontSize: "0.72rem",
              }}
            >
              {isPaid ? "PAYMENT VERIFIED • ORDER CONFIRMED" : "ORDER CONFIRMED"}
            </span>
          </div>

          <h1 className="h2 fw-bold text-black mb-2">Thank You for Your Order</h1>
          <p className="text-medium mb-4">
            {isPaid
              ? "Your payment was successfully processed via Paystack. Our fulfillment team has commenced packaging your items for dispatch."
              : "Your order details have been securely recorded. Our team has commenced preparing your order for fulfillment."}
          </p>

          {/* Order Reference Box */}
          <div className="p-4 border-custom bg-light-custom mb-4 text-start" style={{ borderRadius: "2px" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small">Order Number:</span>
              <span className="font-monospace fw-bold text-black small">
                #{orderId}
              </span>
            </div>

            {paymentRef && (
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small">Paystack Reference:</span>
                <span className="font-monospace fw-bold small" style={{ color: "var(--primary)" }}>
                  {paymentRef}
                </span>
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small">Payment Status:</span>
              <span
                className="badge font-monospace"
                style={{
                  backgroundColor: isPaid ? "var(--primary-light)" : "#E5E7EB",
                  color: isPaid ? "var(--primary-dark)" : "#374151",
                  fontSize: "0.72rem",
                }}
              >
                {isPaid ? "PAID (PAYSTACK)" : "PENDING ON DELIVERY"}
              </span>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small">Estimated Delivery:</span>
              <span className="fw-semibold text-black small">
                3–5 Business Days
              </span>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted small">Fulfillment Status:</span>
              <span className="badge bg-black text-white" style={{ fontSize: "0.68rem" }}>
                Confirmed
              </span>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
            <Link
              to={`/orders/${orderId}`}
              className="btn btn-dark-custom py-3 px-4 d-flex align-items-center justify-content-center gap-2"
            >
              <FiPackage size={16} /> Track Order & Invoice
            </Link>
            <Link
              to="/shop"
              className="btn btn-outline-custom py-3 px-4 d-flex align-items-center justify-content-center gap-2"
            >
              <FiShoppingBag size={16} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
