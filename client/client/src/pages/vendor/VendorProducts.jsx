import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiBox,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import vendorService from "../../services/vendorService";

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  const loadProducts = () => {
    setLoading(true);
    vendorService
      .getVendorProducts({ search: search.trim() || undefined })
      .then((res) => {
        if (res?.products) {
          setProducts(res.products);
        }
      })
      .catch((err) => {
        console.warn("Failed to load vendor products:", err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, [search]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you wish to delete "${name}" from your catalog?`)) {
      try {
        await vendorService.deleteVendorProduct(id);
        setFeedback(`"${name}" was successfully removed.`);
        loadProducts();
        setTimeout(() => setFeedback(""), 4000);
      } catch (err) {
        alert(err.message || "Failed to delete product.");
      }
    }
  };

  return (
    <div className="vendor-products">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h1 className="h3 font-serif fw-bold text-black mb-1">My Products Catalog</h1>
          <p className="text-muted small mb-0">
            Manage your store's listings, pricing, and live inventory levels.
          </p>
        </div>
        <Link to="/vendor/products/add" className="btn btn-emerald btn-sm py-2 px-3">
          <FiPlus className="me-1" /> Add Product
        </Link>
      </div>

      {feedback && (
        <div className="alert alert-dark border-custom py-2 px-3 small d-flex align-items-center gap-2 mb-4">
          <FiCheck size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-3 border-custom bg-white mb-4 d-flex align-items-center gap-2" style={{ maxWidth: "450px" }}>
        <FiSearch size={16} className="text-muted" />
        <input
          type="text"
          className="form-control border-0 p-0 shadow-none small"
          placeholder="Search products by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Products Table */}
      <div className="p-0 border-custom bg-white shadow-sm overflow-hidden" style={{ borderRadius: "var(--radius-md)" }}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark spinner-border-sm" role="status">
              <span className="visually-hidden">Loading products...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted small mb-3">You haven't listed any products yet.</p>
            <Link to="/vendor/products/add" className="btn btn-emerald btn-sm">
              Publish Your First Product
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-atelier w-100 align-middle small mb-0">
              <thead className="text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                <tr>
                  <th scope="col" className="p-3 fw-bold text-black">Product</th>
                  <th scope="col" className="p-3 fw-bold text-black">Category</th>
                  <th scope="col" className="p-3 fw-bold text-black">Price</th>
                  <th scope="col" className="p-3 fw-bold text-black">Stock</th>
                  <th scope="col" className="p-3 fw-bold text-black">Status</th>
                  <th scope="col" className="p-3 fw-bold text-black text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-bottom-custom hover-bg">
                    <td className="p-3">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="border object-fit-cover bg-light-custom"
                          style={{ width: "42px", height: "42px" }}
                        />
                        <div>
                          <p className="mb-0 fw-semibold text-black text-truncate" style={{ maxWidth: "240px" }}>
                            {p.name}
                          </p>
                          <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                            {p.brand}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-muted">{p.category}</td>
                    <td className="p-3 fw-bold font-monospace text-black">
                      ₦{p.price?.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`badge ${
                          p.stock <= 5 ? "bg-light text-dark border border-dark" : "bg-black text-white"
                        }`}
                        style={{ fontSize: "0.68rem" }}
                      >
                        {p.stock} in stock
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="badge bg-light text-dark border text-uppercase" style={{ fontSize: "0.65rem" }}>
                        {p.status || "active"}
                      </span>
                    </td>
                    <td className="p-3 text-end">
                      <div className="d-inline-flex align-items-center gap-1">
                        <Link
                          to={`/vendor/products/edit/${p._id}`}
                          className="btn btn-sm btn-outline-dark p-1 px-2 border-custom"
                          style={{ fontSize: "0.72rem" }}
                          title="Edit Product"
                        >
                          <FiEdit size={13} className="me-1" /> Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(p._id, p.name)}
                          className="btn btn-sm btn-link text-danger p-1 border-0"
                          title="Delete Product"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
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
