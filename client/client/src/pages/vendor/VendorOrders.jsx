import React, { useState, useEffect } from "react";
import { FiShoppingBag, FiEye, FiClock, FiCheckCircle, FiTruck } from "react-icons/fi";
import vendorService from "../../services/vendorService";

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    vendorService
      .getVendorOrders()
      .then((res) => {
        if (res?.orders) {
          setOrders(res.orders);
        }
      })
      .catch((err) => {
        console.warn("Failed to load vendor orders:", err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="vendor-orders">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 font-serif fw-bold text-black mb-1">Customer Orders</h1>
        <p className="text-muted small mb-0">
          Orders containing items dispatched or manufactured by your merchant store.
        </p>
      </div>

      {/* Orders Table */}
      <div className="p-0 border-custom bg-white shadow-sm overflow-hidden" style={{ borderRadius: "var(--radius-md)" }}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark spinner-border-sm" role="status">
              <span className="visually-hidden">Loading orders...</span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted small mb-0">No customer orders recorded for your items yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-atelier w-100 align-middle small mb-0">
              <thead className="text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                <tr>
                  <th scope="col" className="p-3 fw-bold text-black">Order ID</th>
                  <th scope="col" className="p-3 fw-bold text-black">Customer</th>
                  <th scope="col" className="p-3 fw-bold text-black">Your Items</th>
                  <th scope="col" className="p-3 fw-bold text-black">Your Sales Total</th>
                  <th scope="col" className="p-3 fw-bold text-black">Status</th>
                  <th scope="col" className="p-3 fw-bold text-black">Date</th>
                  <th scope="col" className="p-3 fw-bold text-black text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-bottom-custom hover-bg">
                    <td className="p-3 font-monospace fw-bold text-black">
                      #{o._id.substring(o._id.length - 6).toUpperCase()}
                    </td>
                    <td className="p-3">
                      <p className="mb-0 fw-semibold text-black">{o.customer?.name}</p>
                      <span className="text-muted font-monospace" style={{ fontSize: "0.72rem" }}>
                        {o.customer?.email}
                      </span>
                    </td>
                    <td className="p-3 text-muted">
                      {o.items?.reduce((sum, it) => sum + it.quantity, 0)} items
                    </td>
                    <td className="p-3 font-monospace fw-bold text-black">
                      ₦{(o.vendorSubtotal || 0).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="badge-custom badge-custom-black" style={{ fontSize: "0.62rem" }}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="p-3 text-muted">
                      {new Date(o.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-3 text-end">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(o)}
                        className="btn btn-sm btn-outline-dark p-1 px-3 border-custom"
                        style={{ fontSize: "0.72rem" }}
                      >
                        <FiEye size={13} className="me-1" /> View Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Order Details Modal ───────────────────────────────────────────── */}
      {selectedOrder && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1060 }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 rounded-0 shadow-lg">
              <div className="modal-header border-bottom-custom p-4 bg-white">
                <div>
                  <h5 className="modal-title fw-bold text-black fs-6">
                    Order Details #{selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}
                  </h5>
                  <span className="text-muted small">
                    Placed: {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedOrder(null)}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body p-4 bg-white">
                <div className="row g-4 mb-4">
                  <div className="col-12 col-md-6">
                    <h6 className="fw-bold text-black border-bottom-custom pb-2 mb-3 text-uppercase small">
                      Customer & Shipping Details
                    </h6>
                    <div className="small d-flex flex-column gap-1">
                      <p className="mb-0 fw-bold text-black">{selectedOrder.customer?.name}</p>
                      <p className="mb-0 text-muted font-monospace">{selectedOrder.customer?.email}</p>
                      <p className="mb-0 text-muted">{selectedOrder.customer?.phone}</p>
                      <p className="mb-0 text-muted">
                        {[
                          selectedOrder.shippingAddress?.street,
                          selectedOrder.shippingAddress?.city,
                          selectedOrder.shippingAddress?.state,
                          selectedOrder.shippingAddress?.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <h6 className="fw-bold text-black border-bottom-custom pb-2 mb-3 text-uppercase small">
                      Payment & Delivery
                    </h6>
                    <div className="small d-flex flex-column gap-2">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Payment Method:</span>
                        <strong className="text-black">{selectedOrder.paymentMethod}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Payment Status:</span>
                        <span className="badge bg-light text-dark border text-uppercase" style={{ fontSize: "0.68rem" }}>
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Fulfillment Status:</span>
                        <span className="badge bg-black text-white text-uppercase" style={{ fontSize: "0.68rem" }}>
                          {selectedOrder.orderStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold text-black border-bottom-custom pb-2 mb-3 text-uppercase small">
                  Your Dispatched Items in This Order
                </h6>

                <div className="table-responsive">
                  <table className="table align-middle small mb-0">
                    <thead className="bg-light-custom border-bottom-custom">
                      <tr>
                        <th scope="col" className="p-2">Item</th>
                        <th scope="col" className="p-2">Quantity</th>
                        <th scope="col" className="p-2">Unit Price</th>
                        <th scope="col" className="p-2 text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx} className="border-bottom-custom">
                          <td className="p-2">
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: "36px", height: "36px", objectFit: "cover" }}
                                className="border bg-light"
                              />
                              <span className="fw-semibold text-black">{item.name}</span>
                            </div>
                          </td>
                          <td className="p-2">{item.quantity}</td>
                          <td className="p-2 font-monospace">₦{item.price?.toLocaleString()}</td>
                          <td className="p-2 text-end fw-bold font-monospace text-black">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-light-custom">
                        <td colSpan={3} className="p-2 fw-bold text-black text-end">
                          Your Subtotal:
                        </td>
                        <td className="p-2 text-end fw-bold font-monospace fs-6 text-black">
                          ₦{(selectedOrder.vendorSubtotal || 0).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer border-top-custom p-3 bg-light-custom d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm rounded-0"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
