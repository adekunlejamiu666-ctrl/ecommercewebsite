import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPackage, FiArrowRight, FiClock, FiShoppingBag } from "react-icons/fi";
import orderService from "../services/orderService";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getMyOrders()
      .then((data) => {
        if (data?.orders) {
          setOrders(data.orders);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch user orders:", err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-50">
        <div className="py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading orders...</span>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="py-5">
          <div className="p-3 border-custom rounded-circle d-inline-flex bg-light-custom text-black mb-3">
            <FiPackage size={36} />
          </div>
          <h2 className="fw-bold text-black mb-2">You Have No Past Orders</h2>
          <p className="text-muted small mb-4">
            Once you finalize purchases, your tracking and receipts will appear here.
          </p>
          <Link to="/shop" className="btn btn-dark-custom px-4 py-3">
            Explore Collection <FiArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-page py-5 bg-white">
      <div className="container">
        {/* Title */}
        <div className="border-bottom-custom pb-3 mb-4 d-flex justify-content-between align-items-end">
          <div>
            <p className="text-uppercase small mb-1" style={{ letterSpacing: "0.08em", color: "var(--color-medium-gray)" }}>
              Account History
            </p>
            <h1 className="h2 fw-bold text-black mb-0">My Orders ({orders.length})</h1>
          </div>
        </div>

        {/* Orders Table */}
        <div className="d-flex flex-column gap-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="p-4 border-custom bg-white shadow-sm"
              style={{ borderRadius: "2px" }}
            >
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center pb-3 border-bottom-custom mb-3 gap-2">
                <div>
                  <span className="font-monospace fw-bold text-black small">
                    #{order._id.substring(order._id.length - 8).toUpperCase()}
                  </span>
                  <span className="text-muted small ms-2">
                    &bull; {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span className="badge-custom badge-custom-black" style={{ fontSize: "0.68rem" }}>
                    {order.orderStatus}
                  </span>
                  <Link
                    to={`/orders/${order._id}`}
                    className="btn btn-sm btn-outline-custom py-1 px-3"
                    style={{ fontSize: "0.8rem" }}
                  >
                    View Tracking &bull; Receipt
                  </Link>
                </div>
              </div>

              {/* Items strip */}
              <div className="row g-3 align-items-center">
                <div className="col-md-8">
                  <div className="d-flex flex-wrap gap-2">
                    {order.orderItems?.map((item, idx) => (
                      <div key={idx} className="d-flex align-items-center gap-2 me-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="border-custom object-fit-cover"
                          style={{ width: "42px", height: "50px", borderRadius: "2px" }}
                        />
                        <div>
                          <p className="mb-0 small fw-semibold text-black text-truncate" style={{ maxWidth: "160px" }}>
                            {item.name}
                          </p>
                          <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-md-4 text-md-end">
                  <span className="text-muted small d-block">Total Paid</span>
                  <span className="h5 fw-bold text-black mb-0">
                    ₦{order.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
