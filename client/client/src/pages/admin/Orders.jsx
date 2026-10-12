import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiExternalLink, FiCheck, FiFilter } from "react-icons/fi";
import orderService from "../../services/orderService";

const statuses = ["All", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  const loadOrders = () => {
    setLoading(true);
    const params = selectedStatus !== "All" ? { status: selectedStatus } : {};
    orderService
      .getAllOrders(params)
      .then((data) => {
        if (data?.orders) setOrders(data.orders);
      })
      .catch((err) => {
        console.warn("Orders fetch warning:", err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, { orderStatus: newStatus });
      setFeedback(`Order status updated to "${newStatus}".`);
      loadOrders();
      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to update order status.");
    }
  };

  return (
    <div className="admin-orders">
      {/* Title */}
      <div className="mb-4">
        <h1 className="h3 font-serif fw-bold text-black mb-1">Order Fulfillment Hub</h1>
        <p className="text-muted small mb-0">
          Monitor transactions, update dispatch statuses, and manage deliveries.
        </p>
      </div>

      {feedback && (
        <div className="alert alert-dark border-custom py-2 small d-flex align-items-center gap-2 mb-4">
          <FiCheck size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {statuses.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setSelectedStatus(st)}
            className={`btn btn-sm py-1.5 px-3 ${
              selectedStatus === st ? "btn-emerald text-white" : "btn-outline-custom"
            }`}
            style={{ fontSize: "0.8rem", borderRadius: "var(--radius-pill)" }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="p-4 border-custom bg-white shadow-sm" style={{ borderRadius: "var(--radius-md)" }}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status">
              <span className="visually-hidden">Loading orders...</span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <p className="text-muted small py-4 text-center mb-0">No orders found matching this status.</p>
        ) : (
          <div className="table-responsive">
            <table className="table-atelier w-100 align-middle small mb-0">
              <thead className="text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                <tr>
                  <th scope="col" className="fw-semibold">Order ID</th>
                  <th scope="col" className="fw-semibold">Customer</th>
                  <th scope="col" className="fw-semibold">Date</th>
                  <th scope="col" className="fw-semibold">Payment</th>
                  <th scope="col" className="fw-semibold">Status (Action)</th>
                  <th scope="col" className="fw-semibold text-end">Total</th>
                  <th scope="col" className="fw-semibold text-end">View</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-bottom-custom">
                    <td className="font-monospace fw-bold text-black">
                      #{o._id.substring(o._id.length - 8).toUpperCase()}
                    </td>
                    <td>
                      <p className="mb-0 fw-semibold text-black">
                        {o.shippingAddress?.firstname} {o.shippingAddress?.lastname}
                      </p>
                      <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                        {o.shippingAddress?.city}, {o.shippingAddress?.country}
                      </span>
                    </td>
                    <td className="text-muted">
                      {new Date(o.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td>
                      <span className="badge-custom badge-custom-gray" style={{ fontSize: "0.65rem" }}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={o.orderStatus}
                        onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        style={{ width: "135px", borderRadius: "2px", fontSize: "0.78rem" }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="text-end fw-bold text-black">
                      ₦{o.totalAmount?.toLocaleString()}
                    </td>
                    <td className="text-end">
                      <Link
                        to={`/orders/${o._id}`}
                        className="btn btn-sm btn-link text-black p-1 border-0"
                        title="View Full Tracking & Invoice"
                      >
                        <FiExternalLink size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
