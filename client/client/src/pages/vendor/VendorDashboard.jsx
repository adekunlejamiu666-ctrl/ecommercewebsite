import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiBox,
  FiShoppingBag,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiPlus,
  FiArrowUpRight,
  FiTrendingUp,
  FiLayers,
  FiCalendar,
  FiEye,
} from "react-icons/fi";
import vendorService from "../../services/vendorService";

export default function VendorDashboard() {
  const [data, setData] = useState({
    stats: {
      totalProducts: 0,
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalSales: 0,
      totalItemsSold: 0,
    },
    lowStockProducts: [],
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorService
      .getVendorDashboard()
      .then((res) => {
        if (res?.success) {
          setData(res);
        }
      })
      .catch((err) => {
        console.warn("Failed to load vendor dashboard:", err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = data.stats || {};

  return (
    <div className="vendor-dashboard" style={{ maxWidth: "1280px" }}>
      {/* ── HEADER BANNER ── */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: "var(--card-border)" }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge-emerald">Merchant Telemetry</span>
            <span className="badge bg-light text-muted border small d-none d-sm-inline-flex align-items-center gap-1" style={{ fontSize: "0.72rem" }}>
              <FiCalendar size={12} /> Real-time Analytics
            </span>
          </div>
          <h1 className="h3 font-serif fw-bold text-black mb-1">
            Store Performance & Catalog Telemetry
          </h1>
          <p className="text-muted small mb-0">
            Real-time revenues, order fulfillment pipeline, and inventory status.
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link
            to="/vendor/products"
            className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-1 px-3 py-2"
            style={{ borderRadius: "var(--radius-md)" }}
          >
            <FiBox size={14} /> Catalog ({stats.totalProducts || 0})
          </Link>
          <Link
            to="/vendor/products/add"
            className="btn btn-sm text-white d-inline-flex align-items-center gap-1 px-3 py-2 shadow-sm"
            style={{ backgroundColor: "var(--emerald)", borderRadius: "var(--radius-md)" }}
          >
            <FiPlus size={15} /> Add New Product
          </Link>
        </div>
      </div>

      {/* ── 6 KPI STATISTIC CARDS ── */}
      <div className="row g-3 g-lg-4 mb-4">
        {/* TOTAL SALES */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="stat-card-reference h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="small text-muted text-uppercase fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                Total Gross Sales
              </span>
              <div
                className="d-flex align-items-center justify-content-center text-white"
                style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", backgroundColor: "var(--emerald)" }}
              >
                <FiDollarSign size={18} />
              </div>
            </div>
            <h2 className="fw-bold text-black mb-1 font-serif" style={{ fontSize: "1.75rem" }}>
              ₦{(stats.totalSales || 0).toLocaleString()}
            </h2>
            <div className="d-flex align-items-center gap-1 small text-success" style={{ fontSize: "0.75rem" }}>
              <FiTrendingUp size={12} />
              <span className="fw-semibold">Live revenue recorded across all settled customer orders</span>
            </div>
          </div>
        </div>

        {/* PRODUCTS LISTED */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="stat-card-reference h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="small text-muted text-uppercase fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                Catalog Products
              </span>
              <div
                className="d-flex align-items-center justify-content-center text-white"
                style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", backgroundColor: "#0C1413" }}
              >
                <FiBox size={18} />
              </div>
            </div>
            <h2 className="fw-bold text-black mb-1 font-serif" style={{ fontSize: "1.75rem" }}>
              {stats.totalProducts || 0}
            </h2>
            <div className="small text-muted" style={{ fontSize: "0.75rem" }}>
              Active SKUs published on public storefront
            </div>
          </div>
        </div>

        {/* TOTAL ORDERS */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="stat-card-reference h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="small text-muted text-uppercase fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                Received Orders
              </span>
              <div
                className="d-flex align-items-center justify-content-center text-white"
                style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", backgroundColor: "#2563EB" }}
              >
                <FiShoppingBag size={18} />
              </div>
            </div>
            <h2 className="fw-bold text-black mb-1 font-serif" style={{ fontSize: "1.75rem" }}>
              {stats.totalOrders || 0}
            </h2>
            <div className="small text-muted" style={{ fontSize: "0.75rem" }}>
              Customer orders featuring your merchandise
            </div>
          </div>
        </div>

        {/* PENDING FULFILLMENT */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="stat-card-reference h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="small text-muted text-uppercase fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                Pending Fulfillment
              </span>
              <div
                className="d-flex align-items-center justify-content-center text-white"
                style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", backgroundColor: "#D97706" }}
              >
                <FiClock size={18} />
              </div>
            </div>
            <h2 className="fw-bold text-black mb-1 font-serif d-flex align-items-center gap-2" style={{ fontSize: "1.75rem" }}>
              {stats.pendingOrders || 0}
              {stats.pendingOrders > 0 && (
                <span className="badge" style={{ backgroundColor: "#FEF3C7", color: "#92400E", fontSize: "0.68rem", borderRadius: "var(--radius-pill)" }}>
                  Action Needed
                </span>
              )}
            </h2>
            <div className="small text-muted" style={{ fontSize: "0.75rem" }}>
              Orders currently processing or in transit
            </div>
          </div>
        </div>

        {/* COMPLETED DELIVERIES */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="stat-card-reference h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="small text-muted text-uppercase fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                Delivered Successfully
              </span>
              <div
                className="d-flex align-items-center justify-content-center text-white"
                style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", backgroundColor: "#059669" }}
              >
                <FiCheckCircle size={18} />
              </div>
            </div>
            <h2 className="fw-bold text-black mb-1 font-serif" style={{ fontSize: "1.75rem" }}>
              {stats.completedOrders || 0}
            </h2>
            <div className="small text-muted" style={{ fontSize: "0.75rem" }}>
              Fulfilled parcels delivered to verified clients
            </div>
          </div>
        </div>

        {/* UNITS SOLD */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="stat-card-reference h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="small text-muted text-uppercase fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                Total Units Dispatched
              </span>
              <div
                className="d-flex align-items-center justify-content-center text-white"
                style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", backgroundColor: "#7C3AED" }}
              >
                <FiLayers size={18} />
              </div>
            </div>
            <h2 className="fw-bold text-black mb-1 font-serif" style={{ fontSize: "1.75rem" }}>
              {stats.totalItemsSold || 0}
            </h2>
            <div className="small text-muted" style={{ fontSize: "0.75rem" }}>
              Individual piece count across all parcels
            </div>
          </div>
        </div>
      </div>

      {/* ── GRID: RECENT STORE ORDERS & LOW STOCK ALERT ── */}
      <div className="row g-4">
        {/* RECENT ORDERS */}
        <div className="col-12 col-lg-7">
          <div
            className="bg-white p-4 shadow-sm h-100"
            style={{
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="font-serif fw-bold text-black mb-0">
                  Recent Store Orders
                </h5>
                <span className="text-muted small">Latest customer requests featuring your catalog items</span>
              </div>
              <Link
                to="/vendor/orders"
                className="small fw-semibold text-decoration-none d-flex align-items-center gap-1"
                style={{ color: "var(--emerald)" }}
              >
                View All Orders <FiArrowUpRight />
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border spinner-border-sm text-dark" role="status" />
                <span className="ms-2 small text-muted">Refreshing telemetry...</span>
              </div>
            ) : !data.recentOrders || data.recentOrders.length === 0 ? (
              <div className="text-center py-5">
                <FiShoppingBag size={32} className="text-muted mb-2" />
                <p className="text-muted small mb-0">No orders containing your items yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-atelier align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Order ID</th>
                      <th scope="col">Client</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="text-end">Vendor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((o) => {
                      const isDelivered = o.orderStatus?.toLowerCase() === "delivered";
                      const isProcessing = o.orderStatus?.toLowerCase() === "processing" || o.orderStatus?.toLowerCase() === "pending";

                      return (
                        <tr key={o._id}>
                          <td className="font-monospace fw-bold text-black">
                            #{o._id.substring(o._id.length - 6).toUpperCase()}
                          </td>
                          <td className="fw-medium text-black">{o.customerName}</td>
                          <td className="text-muted">{o.itemsCount} {o.itemsCount === 1 ? "unit" : "units"}</td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: isDelivered ? "#ECFDF5" : isProcessing ? "#FEF3C7" : "#F3F4F6",
                                color: isDelivered ? "#065F46" : isProcessing ? "#92400E" : "#374151",
                                borderRadius: "var(--radius-pill)",
                                padding: "0.25rem 0.65rem",
                                fontSize: "0.68rem",
                                fontWeight: 600,
                              }}
                            >
                              {o.orderStatus}
                            </span>
                          </td>
                          <td className="text-end fw-bold font-serif text-black">
                            ₦{(o.amount || 0).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* LOW STOCK ALERT */}
        <div className="col-12 col-lg-5">
          <div
            className="bg-white p-4 shadow-sm h-100"
            style={{
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="font-serif fw-bold text-black mb-0">
                  Low Stock Inventory
                </h5>
                <span className="text-muted small">Items with fewer than 5 available units</span>
              </div>
              <Link
                to="/vendor/products"
                className="small fw-semibold text-decoration-none"
                style={{ color: "var(--emerald)" }}
              >
                Manage Stock
              </Link>
            </div>

            {!data.lowStockProducts || data.lowStockProducts.length === 0 ? (
              <div className="text-center py-5">
                <FiCheckCircle size={32} className="text-success mb-2" />
                <p className="text-muted small mb-0">All catalog inventories are well-stocked.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {data.lowStockProducts.map((p) => (
                  <div
                    key={p._id}
                    className="p-3 d-flex align-items-center justify-content-between transition-base"
                    style={{
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "#FFFBEB",
                      border: "1px solid #FDE68A",
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="d-flex align-items-center justify-content-center text-warning"
                        style={{ width: "32px", height: "32px", borderRadius: "var(--radius-md)", backgroundColor: "#FEF3C7" }}
                      >
                        <FiAlertTriangle size={16} />
                      </div>
                      <div>
                        <p className="mb-0 fw-semibold text-black small text-truncate" style={{ maxWidth: "180px" }}>
                          {p.name}
                        </p>
                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                          ₦{p.price?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-danger text-white" style={{ fontSize: "0.68rem", borderRadius: "var(--radius-pill)" }}>
                        {p.stock} left
                      </span>
                      <Link
                        to={`/vendor/products/edit/${p._id}`}
                        className="btn btn-sm btn-dark py-1 px-2"
                        style={{ fontSize: "0.72rem", borderRadius: "var(--radius-sm)" }}
                      >
                        Restock
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
