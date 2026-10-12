import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiExternalLink,
  FiAlertCircle,
  FiCheck,
  FiFilter,
  FiX,
} from "react-icons/fi";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sellerTypeFilter, setSellerTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [feedback, setFeedback] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
    productName: "",
  });

  useEffect(() => {
    categoryService
      .getCategories()
      .then((res) => {
        if (res?.categories) setCategories(res.categories);
      })
      .catch(() => { });
  }, []);

  const loadProducts = () => {
    setLoading(true);
    const params = {
      limit: 100,
      status: statusFilter,
    };
    if (search.trim()) params.search = search.trim();
    if (categoryFilter !== "All") params.category = categoryFilter;
    if (sellerTypeFilter !== "All") params.sellerType = sellerTypeFilter;

    productService
      .getProducts(params)
      .then((data) => {
        if (data?.products) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      })
      .catch((err) => {
        console.warn("Products list error:", err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProducts();
  }, [search, categoryFilter, sellerTypeFilter, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await productService.updateProduct(id, { status: newStatus });
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
      );
      setFeedback(`Status updated to "${newStatus}".`);
      setTimeout(() => setFeedback(""), 3000);
    } catch (err) {
      alert(err.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openDeleteModal = (id, name) => {
    setDeleteModal({
      isOpen: true,
      productId: id,
      productName: name,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      productId: null,
      productName: "",
    });
  };

  const executeDelete = async () => {
    if (!deleteModal.productId) return;
    try {
      await productService.deleteProduct(deleteModal.productId);
      setFeedback(`Product "${deleteModal.productName}" was deleted successfully.`);
      closeDeleteModal();
      loadProducts();
      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to delete product.");
    }
  };

  const getSellerInfo = (p) => {
    const isVendor = p.sellerType === "vendor" || !!p.vendor;
    if (isVendor) {
      const storeName =
        p.vendor?.vendorProfile?.businessName ||
        (p.vendor?.firstname ? `${p.vendor.firstname} ${p.vendor.lastname}`.trim() : "") ||
        p.createdBy?.vendorProfile?.businessName ||
        (p.createdBy?.firstname ? `${p.createdBy.firstname} ${p.createdBy.lastname}`.trim() : "Vendor");
      return {
        label: storeName,
        type: "vendor",
        badgeClass: "badge bg-light text-dark border",
      };
    }
    const adminName =
      p.createdBy?.vendorProfile?.businessName ||
      (p.createdBy?.firstname ? `${p.createdBy.firstname} ${p.createdBy.lastname}`.trim() : "Admin Store");
    return {
      label: adminName || "Admin Store",
      type: "admin",
      badgeClass: "badge bg-dark text-white",
    };
  };

  return (
    <div className="admin-products">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="h3 font-serif fw-bold text-black mb-1">Marketplace Products</h1>
          <p className="text-muted small mb-0">
            Unified catalog of all Admin and Vendor marketplace listings.
          </p>
        </div>
        <Link to="/admin/products/add" className="btn btn-emerald py-2 px-3">
          <FiPlus className="me-1" /> Add Product
        </Link>
      </div>

      {feedback && (
        <div className="alert alert-dark border-custom py-2 px-3 small d-flex align-items-center gap-2 mb-4">
          <FiCheck size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-3 border-custom bg-white mb-4" style={{ borderRadius: "2px" }}>
        <div className="row g-2 align-items-center">
          {/* Search */}
          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center gap-2 border-custom px-3 py-2 bg-light-custom" style={{ borderRadius: "2px" }}>
              <FiSearch size={16} className="text-muted" />
              <input
                type="text"
                className="form-control border-0 p-0 shadow-none bg-transparent small"
                placeholder="Search products by title, brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="btn btn-sm btn-link p-0 text-muted border-0"
                  onClick={() => setSearch("")}
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="col-12 col-sm-4 col-md-3">
            <select
              className="form-select border-custom py-2 small shadow-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c._id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Seller Filter */}
          <div className="col-12 col-sm-4 col-md-3">
            <select
              className="form-select border-custom py-2 small shadow-none"
              value={sellerTypeFilter}
              onChange={(e) => setSellerTypeFilter(e.target.value)}
            >
              <option value="All">All Sellers (Admin & Vendors)</option>
              <option value="admin">Admin Store Listings</option>
              <option value="vendor">Vendor Listings</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="col-12 col-sm-4 col-md-2">
            <select
              className="form-select border-custom py-2 small shadow-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="draft">Drafts</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border-custom bg-white shadow-sm overflow-hidden" style={{ borderRadius: "var(--radius-md)" }}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark spinner-border-sm" role="status">
              <span className="visually-hidden">Loading marketplace products...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted small mb-0">No marketplace products found matching your filter criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-atelier w-100 align-middle small mb-0">
              <thead className="text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                <tr>
                  <th scope="col" className="p-3 fw-bold text-black">Product</th>
                  <th scope="col" className="p-3 fw-bold text-black">Seller / Creator</th>
                  <th scope="col" className="p-3 fw-bold text-black">Category</th>
                  <th scope="col" className="p-3 fw-bold text-black">Price</th>
                  <th scope="col" className="p-3 fw-bold text-black">Stock</th>
                  <th scope="col" className="p-3 fw-bold text-black">Status</th>
                  <th scope="col" className="p-3 fw-bold text-black text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const id = p._id || p.id;
                  const seller = getSellerInfo(p);

                  return (
                    <tr key={id} className="border-bottom-custom">
                      <td className="p-3">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="border-custom object-fit-cover bg-light-custom"
                            style={{ width: "44px", height: "50px", borderRadius: "2px" }}
                          />
                          <div>
                            <Link
                              to={`/product/${id}`}
                              className="fw-semibold text-black text-decoration-none d-block text-truncate"
                              style={{ maxWidth: "220px" }}
                            >
                              {p.name}
                            </Link>
                            <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                              {p.brand}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={seller.badgeClass} style={{ fontSize: "0.7rem", padding: "4px 8px" }}>
                          {seller.type === "admin" ? "🏛️ " : "🏪 "}
                          {seller.label}
                        </span>
                      </td>
                      <td className="p-3 text-muted">{p.category}</td>
                      <td className="p-3 fw-bold text-black font-monospace">
                        ₦{Number(p.price).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`badge ${p.stock <= 5 ? "bg-danger text-white" : "bg-light text-dark border"
                            }`}
                          style={{ fontSize: "0.68rem" }}
                        >
                          {p.stock} in stock
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          className="form-select form-select-sm border-custom py-1 small shadow-none text-uppercase"
                          style={{ fontSize: "0.7rem", width: "105px" }}
                          value={p.status || "active"}
                          disabled={updatingId === id}
                          onChange={(e) => handleStatusChange(id, e.target.value)}
                        >
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="p-3 text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <Link
                            to={`/product/${id}`}
                            className="btn btn-sm btn-link text-muted p-1 border-0"
                            title="View Public Marketplace Page"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FiExternalLink size={15} />
                          </Link>
                          <Link
                            to={`/admin/products/edit/${id}`}
                            className="btn btn-sm btn-link text-black p-1 border-0"
                            title="Edit Product"
                          >
                            <FiEdit2 size={15} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(id, p.name)}
                            className="btn btn-sm btn-link text-danger p-1 border-0"
                            title="Delete Product"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.55)", zIndex: 1055 }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "420px" }}>
            <div className="modal-content border-custom rounded-0 shadow">
              <div className="modal-body p-4 text-center">
                <div
                  className="rounded-circle bg-danger bg-opacity-10 text-danger d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "50px", height: "50px" }}
                >
                  <FiAlertCircle size={26} />
                </div>
                <h5 className="fw-bold text-black mb-2">Delete Product</h5>
                <p className="text-muted small mb-4">
                  Are you sure you want to permanently delete{" "}
                  <strong>"{deleteModal.productName}"</strong>? This will remove it from the customer marketplace.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm px-4 rounded-0"
                    onClick={closeDeleteModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm px-4 rounded-0"
                    onClick={executeDelete}
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
