import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiBox,
  FiBriefcase,
  FiFileText,
  FiAlertTriangle,
  FiArrowUpRight,
  FiEye,
  FiTrendingUp,
  FiShield,
  FiPlus,
  FiCheckCircle,
  FiEdit2,
} from "react-icons/fi";
import orderService from "../../services/orderService";
import productService from "../../services/productService";
import userService from "../../services/userService";
import vendorService from "../../services/vendorService";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalVendors: 0,
    pendingRequests: 0,
    totalProducts: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [ordersRes, productsRes, usersRes, vendorsRes, requestsRes, lowStockRes] =
          await Promise.allSettled([
            orderService.getAllOrders({ limit: 10 }),
            productService.getProducts({ limit: 50 }),
            userService.getAllUsers({ limit: 5 }),
            vendorService.getAdminVendors(),
            vendorService.getAdminVendorRequests({ limit: 5 }),
            productService.getLowStockProducts({ limit: 10 }),
          ]);

        const orders = ordersRes.status === "fulfilled" ? ordersRes.value?.orders || [] : [];
        const totalOrdersCount = ordersRes.status === "fulfilled" ? ordersRes.value?.total || orders.length : 0;
        const products = productsRes.status === "fulfilled" ? productsRes.value?.products || [] : [];
        const totalProductsCount = productsRes.status === "fulfilled" ? productsRes.value?.total || products.length : 0;
        const totalUsersCount = usersRes.status === "fulfilled" ? usersRes.value?.total || 0 : 0;
        const usersList = usersRes.status === "fulfilled" ? usersRes.value?.users || [] : [];
        const vendorsList = vendorsRes.status === "fulfilled" ? vendorsRes.value?.vendors || [] : [];
        const requestsData = requestsRes.status === "fulfilled" ? requestsRes.value : null;

        const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
        const lowStock =
          lowStockRes?.status === "fulfilled" && Array.isArray(lowStockRes.value?.products)
            ? lowStockRes.value.products
            : products.filter((p) => p.stock < 10).slice(0, 5);

        setStats({
          totalSales: totalRevenue,
          totalOrders: totalOrdersCount,
          totalUsers: totalUsersCount || usersList.length,
          totalVendors: vendorsList.length,
          pendingRequests: requestsData?.counts?.pending || 0,
          totalProducts: totalProductsCount,
        });

        setRecentUsers(usersList.slice(0, 5));
        setRecentRequests(requestsData?.requests?.slice(0, 5) || []);
        setRecentOrders(orders.slice(0, 5));
        setLowStockProducts(lowStock);
      } catch (err) {
        console.warn("Dashboard metrics load warning:", err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="admin-dashboard" style={{ maxWidth: "1340px" }}>
      {/* ── HEADER BANNER ── */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: "var(--card-border)" }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge-emerald">Platform Command</span>
            <span
              className="badge"
              style={{
                backgroundColor: "#0C1413",
                color: "#E5E7EB",
                borderRadius: "var(--radius-pill)",
                padding: "0.25rem 0.75rem",
                fontSize: "0.72rem",
                fontWeight: 700,
              }}
            >
              <FiShield className="me-1" /> GLOBAL SUPERADMIN
            </span>
          </div>
          <h1 className="h3 font-serif fw-bold text-black mb-1">
            Platform Command & Commercial Telemetry
          </h1>
          <p className="text-muted small mb-0">
            Real-time revenues, client registrations, artisan vendor approvals, and order pipelines.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <Link
            to="/admin/vendor-requests"
            className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-2 px-3 py-2 position-relative"
            style={{ borderRadius: "var(--radius-md)" }}
          >
            <FiFileText size={14} /> Review Applications
            {stats.pendingRequests > 0 && (
              <span className="badge bg-danger text-white rounded-pill" style={{ fontSize: "0.68rem" }}>
                {stats.pendingRequests}
              </span>
            )}
          </Link>
          <Link
            to="/admin/products/add"
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
                Platform Gross Volume
              </span>
              <div
                className="d-flex align-items-center justify-content-center text-white"
                style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", backgroundColor: "var(--emerald)" }}
              >
                <FiDollarSign size={18} />
              </div>
            </div>
            <h2 className="fw-bold text-black mb-1 font-serif" style={{ fontSize: "1.75rem" }}>
              ₦{stats.totalSales.toLocaleString()}
            </h2>
            <div className="d-flex align-items-center gap-1 small text-success" style={{ fontSize: "0.75rem" }}>
              <FiTrendingUp size={12} />
              <span className="fw-semibold">Aggregated sales across all boutique orders</span>
            </div>
          </div>
        </div>

        {/* TOTAL ORDERS */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="stat-card-reference h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="small text-muted text-uppercase fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                Total Transactions
              </span>
              <div
                className="d-flex align-items-center justify-content-center text-white"
                style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", backgroundColor: "#0C1413" }}
              >
                <FiShoppingBag size={18} />
              </div>
            </div>
            <h2 className="fw-bold text-black mb-1 font-serif" style={{ fontSize: "1.75rem" }}>
              {stats.totalOrders.toLocaleString()}
            </h2>
            <div className="small text-muted" style={{ fontSize: "0.75rem" }}>
              Completed and processing purchases
            </div>
          </div>
        </div>

        {/* TOTAL REGISTERED USERS */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="stat-card-reference h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="small text-muted text-uppercase fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                Registered Clients
              </span>
              <div
                className="d-flex align-items-center justify-content-center text-white"
                style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", backgroundColor: "#2563EB" }}
              >
                <FiUsers size={18} />
              </div>
            </div>
            <h2 className="fw-bold text-black mb-1 font-serif" style={{ fontSize: "1.75rem" }}>
              {stats.totalUsers.toLocaleString()}
            </h2>
            <div className="small text-muted" style={{ fontSize: "0.75rem" }}>
              Verified active member profiles
            </div>
          </div>
        </div>

        {/* TOTAL VENDORS */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="stat-card-reference h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="small text-muted text-uppercase fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                Artisan Merchants
              </span>
              <div
                className="d-flex align-items-center justify-content-center text-white"
                style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", backgroundColor: "#059669" }}
              >
                <FiBriefcase size={18} />
              </div>
            </div>
            <h2 className="fw-bold text-black mb-1 font-serif" style={{ fontSize: "1.75rem" }}>
              {stats.totalVendors.toLocaleString()}
            </h2>
            <div className="small text-muted" style={{ fontSize: "0.75rem" }}>
              Active verified merchant partners
            </div>
          </div>
        </div>

        {/* PENDING VENDOR REQUESTS */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="stat-card-reference h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="small text-muted text-uppercase fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                Merchant Applications
              </span>
              <div
                className="d-flex align-items-center justify-content-center text-white"
                style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", backgroundColor: "#D97706" }}
              >
                <FiFileText size={18} />
              </div>
            </div>
            <h2 className="fw-bold text-black mb-1 font-serif d-flex align-items-center gap-2" style={{ fontSize: "1.75rem" }}>
              {stats.pendingRequests}
              {stats.pendingRequests > 0 ? (
                <span className="badge" style={{ backgroundColor: "#FEF3C7", color: "#92400E", fontSize: "0.68rem", borderRadius: "var(--radius-pill)" }}>
                  Needs Review
                </span>
              ) : (
                <span className="badge" style={{ backgroundColor: "#ECFDF5", color: "#065F46", fontSize: "0.68rem", borderRadius: "var(--radius-pill)" }}>
                  All Cleared
                </span>
              )}
            </h2>
            <div className="small text-muted" style={{ fontSize: "0.75rem" }}>
              Awaiting administrator verification
            </div>
          </div>
        </div>

        {/* TOTAL PRODUCTS */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="stat-card-reference h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="small text-muted text-uppercase fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                Platform Catalog
              </span>
              <div
                className="d-flex align-items-center justify-content-center text-white"
                style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", backgroundColor: "#7C3AED" }}
              >
                <FiBox size={18} />
              </div>
            </div>
            <h2 className="fw-bold text-black mb-1 font-serif" style={{ fontSize: "1.75rem" }}>
              {stats.totalProducts.toLocaleString()}
            </h2>
            <div className="small text-muted" style={{ fontSize: "0.75rem" }}>
              Published luxury items in database
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 1: RECENT VENDOR REQUESTS & RECENT ORDERS ── */}
      <div className="row g-4 mb-4">
        {/* RECENT VENDOR REQUESTS */}
        <div className="col-12 col-lg-6">
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
                  Recent Vendor Applications
                </h5>
                <span className="text-muted small">Merchants requesting to sell on Nexora</span>
              </div>
              <Link
                to="/admin/vendor-requests"
                className="small fw-semibold text-decoration-none d-flex align-items-center gap-1"
                style={{ color: "var(--emerald)" }}
              >
                View All <FiArrowUpRight />
              </Link>
            </div>

            {recentRequests.length === 0 ? (
              <div className="text-center py-5">
                <FiCheckCircle size={32} className="text-success mb-2" />
                <p className="text-muted small mb-0">No pending vendor applications at this time.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-atelier align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Applicant</th>
                      <th scope="col">Store Name</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map((r) => {
                      const isPending = r.status?.toLowerCase() === "pending";
                      return (
                        <tr key={r._id}>
                          <td>
                            <p className="mb-0 fw-semibold text-black">{r.fullName}</p>
                            <span className="text-muted font-monospace" style={{ fontSize: "0.72rem" }}>
                              {r.email}
                            </span>
                          </td>
                          <td className="text-muted fw-medium">{r.businessName}</td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: isPending ? "#FEF3C7" : "#ECFDF5",
                                color: isPending ? "#92400E" : "#065F46",
                                borderRadius: "var(--radius-pill)",
                                padding: "0.25rem 0.65rem",
                                fontSize: "0.68rem",
                                fontWeight: 600,
                              }}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="text-end">
                            <Link
                              to="/admin/vendor-requests"
                              className="btn btn-sm btn-outline-dark py-1 px-3"
                              style={{ fontSize: "0.75rem", borderRadius: "var(--radius-md)" }}
                            >
                              <FiEye size={12} className="me-1" /> Review
                            </Link>
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

        {/* RECENT ORDERS */}
        <div className="col-12 col-lg-6">
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
                  Recent Platform Orders
                </h5>
                <span className="text-muted small">Latest client checkout settlements</span>
              </div>
              <Link
                to="/admin/orders"
                className="small fw-semibold text-decoration-none d-flex align-items-center gap-1"
                style={{ color: "var(--emerald)" }}
              >
                View All <FiArrowUpRight />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-5">
                <FiShoppingBag size={32} className="text-muted mb-2" />
                <p className="text-muted small mb-0">No orders placed on platform yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-atelier align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Order ID</th>
                      <th scope="col">Customer</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => {
                      const isDelivered = o.orderStatus?.toLowerCase() === "delivered";
                      const isProcessing = o.orderStatus?.toLowerCase() === "processing" || o.orderStatus?.toLowerCase() === "pending";

                      return (
                        <tr key={o._id}>
                          <td className="font-monospace fw-bold text-black">
                            #{o._id.substring(o._id.length - 6).toUpperCase()}
                          </td>
                          <td className="fw-medium text-black">
                            {o.shippingAddress?.firstname} {o.shippingAddress?.lastname}
                          </td>
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
                            ₦{o.totalAmount?.toLocaleString()}
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
      </div>

      {/* ── ROW 2: LOW STOCK CATALOG ALERT (DEDICATED SECTION) ── */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div
            className="bg-white p-4 shadow-sm"
            style={{
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-3">
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                  <h5 className="font-serif fw-bold text-black mb-0">
                    Low Stock Catalog Alert
                  </h5>
                  {lowStockProducts.length > 0 && (
                    <span
                      className="badge d-inline-flex align-items-center gap-1"
                      style={{
                        backgroundColor: "#FEF3C7",
                        color: "#92400E",
                        borderRadius: "var(--radius-pill)",
                        padding: "0.25rem 0.65rem",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                      }}
                    >
                      <FiAlertTriangle size={12} /> {lowStockProducts.length} Attention Required
                    </span>
                  )}
                </div>
                <span className="text-muted small">Products with inventory below 10 units.</span>
              </div>
              <Link
                to="/admin/products"
                className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-1 px-3 py-1"
                style={{
                  borderRadius: "var(--radius-pill)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                Full Inventory <FiArrowUpRight size={13} />
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-5">
                <FiCheckCircle size={36} className="text-success mb-2" />
                <p className="text-black fw-semibold mb-1">All products are sufficiently stocked.</p>
                <span className="text-muted small">No catalog items have fallen below 10 units.</span>
              </div>
            ) : (
              <>
                {/* Desktop & Tablet View: Atelier Table */}
                <div className="table-responsive d-none d-md-block">
                  <table className="table table-atelier align-middle mb-0">
                    <thead>
                      <tr>
                        <th scope="col" style={{ width: "36%" }}>Product</th>
                        <th scope="col" style={{ width: "20%" }}>Category &amp; SKU</th>
                        <th scope="col" style={{ width: "14%" }}>Price</th>
                        <th scope="col" style={{ width: "16%" }}>Stock Status</th>
                        <th scope="col" className="text-end" style={{ width: "14%" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockProducts.map((p) => {
                        const isOutOfStock = Number(p.stock) === 0;
                        return (
                          <tr key={p._id || p.id}>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                {p.image ? (
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="rounded object-fit-cover shadow-sm flex-shrink-0"
                                    style={{ width: "46px", height: "46px", border: "1px solid #E5E7EB" }}
                                  />
                                ) : (
                                  <div
                                    className="rounded d-flex align-items-center justify-content-center text-warning flex-shrink-0"
                                    style={{ width: "46px", height: "46px", backgroundColor: "#FEF3C7" }}
                                  >
                                    <FiAlertTriangle size={18} />
                                  </div>
                                )}
                                <div>
                                  <Link
                                    to={`/product/${p.slug || p._id || p.id}`}
                                    className="mb-0 fw-semibold text-black small text-decoration-none d-block text-truncate"
                                    style={{ maxWidth: "280px" }}
                                    title={p.name}
                                  >
                                    {p.name}
                                  </Link>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="text-black small fw-medium">{p.category || "General"}</span>
                              <div className="text-muted font-monospace" style={{ fontSize: "0.72rem" }}>
                                {p.sku ? `SKU: ${p.sku}` : `ID: #${(p._id || p.id).toString().slice(-6).toUpperCase()}`}
                              </div>
                            </td>
                            <td className="fw-bold font-serif text-black">
                              ₦{Number(p.price || 0).toLocaleString()}
                            </td>
                            <td>
                              {isOutOfStock ? (
                                <span
                                  className="badge bg-danger text-white d-inline-flex align-items-center gap-1"
                                  style={{
                                    fontSize: "0.72rem",
                                    borderRadius: "var(--radius-pill)",
                                    padding: "0.3rem 0.75rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#FFF" }}></span>
                                  Out of Stock (0)
                                </span>
                              ) : (
                                <span
                                  className="badge d-inline-flex align-items-center gap-1"
                                  style={{
                                    backgroundColor: "#FEF3C7",
                                    color: "#92400E",
                                    border: "1px solid #FCD34D",
                                    fontSize: "0.72rem",
                                    borderRadius: "var(--radius-pill)",
                                    padding: "0.3rem 0.75rem",
                                    fontWeight: 700,
                                  }}
                                >
                                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#D97706" }}></span>
                                  Low Stock ({p.stock} left)
                                </span>
                              )}
                            </td>
                            <td className="text-end">
                              <div className="d-inline-flex align-items-center gap-2">
                                <Link
                                  to={`/product/${p.slug || p._id || p.id}`}
                                  className="btn btn-sm btn-outline-dark py-1 px-2 d-inline-flex align-items-center gap-1"
                                  style={{ fontSize: "0.75rem", borderRadius: "var(--radius-md)" }}
                                  title="View Public Storefront Listing"
                                >
                                  <FiEye size={12} /> View
                                </Link>
                                <Link
                                  to={`/admin/products/edit/${p._id || p.id}`}
                                  className="btn btn-sm text-white py-1 px-2 d-inline-flex align-items-center gap-1 shadow-sm"
                                  style={{ backgroundColor: "#0C1413", fontSize: "0.75rem", borderRadius: "var(--radius-md)" }}
                                  title="Restock or edit product"
                                >
                                  <FiEdit2 size={12} /> Edit
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View: Stacked Cards with zero overflow */}
                <div className="d-flex flex-column gap-3 d-md-none">
                  {lowStockProducts.map((p) => {
                    const isOutOfStock = Number(p.stock) === 0;
                    return (
                      <div
                        key={p._id || p.id}
                        className="p-3 rounded border"
                        style={{
                          backgroundColor: isOutOfStock ? "#FEF2F2" : "#FFFBEB",
                          borderColor: isOutOfStock ? "#FECACA" : "#FDE68A",
                        }}
                      >
                        <div className="d-flex align-items-center gap-3 mb-2">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="rounded object-fit-cover shadow-sm flex-shrink-0"
                              style={{ width: "44px", height: "44px", border: "1px solid #E5E7EB" }}
                            />
                          ) : (
                            <div
                              className="rounded d-flex align-items-center justify-content-center text-warning flex-shrink-0"
                              style={{ width: "44px", height: "44px", backgroundColor: "#FEF3C7" }}
                            >
                              <FiAlertTriangle size={18} />
                            </div>
                          )}
                          <div className="flex-grow-1 overflow-hidden">
                            <p className="mb-0 fw-semibold text-black small text-truncate">
                              {p.name}
                            </p>
                            <span className="text-muted small">
                              {p.category} &bull; {p.sku ? `SKU: ${p.sku}` : `ID: #${(p._id || p.id).toString().slice(-6).toUpperCase()}`}
                            </span>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center my-2 pt-2 border-top" style={{ borderColor: isOutOfStock ? "#FECACA" : "#FDE68A" }}>
                          <span className="fw-bold font-serif text-black">
                            ₦{Number(p.price || 0).toLocaleString()}
                          </span>
                          {isOutOfStock ? (
                            <span className="badge bg-danger text-white rounded-pill px-2 py-1" style={{ fontSize: "0.68rem" }}>
                              Out of Stock (0)
                            </span>
                          ) : (
                            <span className="badge rounded-pill px-2 py-1" style={{ backgroundColor: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D", fontSize: "0.68rem", fontWeight: 700 }}>
                              Low Stock ({p.stock} left)
                            </span>
                          )}
                        </div>

                        <div className="d-flex gap-2 pt-2">
                          <Link
                            to={`/product/${p.slug || p._id || p.id}`}
                            className="btn btn-sm btn-outline-dark flex-grow-1 py-1 d-inline-flex align-items-center justify-content-center gap-1"
                            style={{ fontSize: "0.75rem", borderRadius: "var(--radius-md)" }}
                          >
                            <FiEye size={12} /> View
                          </Link>
                          <Link
                            to={`/admin/products/edit/${p._id || p.id}`}
                            className="btn btn-sm text-white flex-grow-1 py-1 d-inline-flex align-items-center justify-content-center gap-1"
                            style={{ backgroundColor: "#0C1413", fontSize: "0.75rem", borderRadius: "var(--radius-md)" }}
                          >
                            <FiEdit2 size={12} /> Edit
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 3: RECENT USERS ── */}
      <div className="row g-4">
        <div className="col-12">
          <div
            className="bg-white p-4 shadow-sm"
            style={{
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="font-serif fw-bold text-black mb-0">
                  Recent User Registrations
                </h5>
                <span className="text-muted small">New clients joining the platform ecosystem</span>
              </div>
              <Link
                to="/admin/users"
                className="small fw-semibold text-decoration-none d-flex align-items-center gap-1"
                style={{ color: "var(--emerald)" }}
              >
                User Directory <FiArrowUpRight />
              </Link>
            </div>

            {recentUsers.length === 0 ? (
              <div className="text-center py-5">
                <FiUsers size={32} className="text-muted mb-2" />
                <p className="text-muted small mb-0">No users found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-atelier align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Email Address</th>
                      <th scope="col">Role</th>
                      <th scope="col" className="text-end">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((u) => {
                      const role = u.role || "user";
                      return (
                        <tr key={u._id}>
                          <td className="fw-semibold text-black">
                            {u.firstname} {u.lastname}
                          </td>
                          <td className="text-muted font-monospace" style={{ fontSize: "0.82rem" }}>
                            {u.email}
                          </td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: role === "admin" ? "#0F766E" : role === "vendor" ? "#0C1413" : "#F3F4F6",
                                color: role === "admin" || role === "vendor" ? "#FFFFFF" : "#374151",
                                borderRadius: "var(--radius-pill)",
                                padding: "0.25rem 0.65rem",
                                fontSize: "0.68rem",
                                textTransform: "uppercase",
                              }}
                            >
                              {role}
                            </span>
                          </td>
                          <td className="text-end text-muted small">
                            {new Date(u.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
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
      </div>
    </div>
  );
}
