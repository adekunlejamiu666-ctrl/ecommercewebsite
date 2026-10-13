import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiBriefcase,
  FiBox,
  FiShoppingBag,
  FiEye,
  FiUserMinus,
  FiCheck,
  FiCalendar,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import vendorService from "../../services/vendorService";
import userService from "../../services/userService";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    vendorId: null,
    vendorName: "",
  });

  const loadVendors = () => {
    setLoading(true);
    vendorService
      .getAdminVendors({ search: search.trim() || undefined })
      .then((data) => {
        if (data?.vendors) setVendors(data.vendors);
      })
      .catch((err) => {
        console.warn("Error loading vendors:", err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVendors();
  }, [search]);

  const handleDemoteVendor = async () => {
    if (!confirmModal.vendorId) return;
    try {
      await userService.updateUserRole(confirmModal.vendorId, "user");
      setFeedback(`Vendor status removed from ${confirmModal.vendorName}. Reverted to user role.`);
      setConfirmModal({ isOpen: false, vendorId: null, vendorName: "" });
      setSelectedVendor(null);
      loadVendors();
      setTimeout(() => setFeedback(""), 5000);
    } catch (err) {
      alert(err.message || "Failed to remove vendor status.");
    }
  };

  return (
    <div className="admin-vendors">
      {/* Title */}
      <div className="mb-4">
        <h1 className="h3 font-serif fw-bold text-black mb-1">Approved Vendors</h1>
        <p className="text-muted small mb-0">
          Monitor merchant stores, inventory listings, sales performance, and merchant accounts.
        </p>
      </div>

      {feedback && (
        <div className="alert alert-dark border-custom py-2 px-3 small d-flex align-items-center gap-2 mb-4">
          <FiCheck size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="p-3 border-custom bg-white mb-4 d-flex align-items-center gap-2" style={{ maxWidth: "450px", borderRadius: "var(--radius-md)" }}>
        <FiSearch size={16} className="text-muted" />
        <input
          type="text"
          className="form-control border-0 p-0 shadow-none small"
          placeholder="Search by vendor, business name, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Vendors Table */}
      <div className="p-0 border-custom bg-white shadow-sm overflow-hidden" style={{ borderRadius: "var(--radius-md)" }}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark spinner-border-sm" role="status">
              <span className="visually-hidden">Loading vendors...</span>
            </div>
          </div>
        ) : vendors.length === 0 ? (
          <p className="text-muted small py-5 text-center mb-0">No approved vendors found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table-atelier w-100 align-middle small mb-0">
              <thead className="text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                <tr>
                  <th scope="col" className="p-3 fw-bold text-black">Vendor</th>
                  <th scope="col" className="p-3 fw-bold text-black">Store / Business</th>
                  <th scope="col" className="p-3 fw-bold text-black">Products</th>
                  <th scope="col" className="p-3 fw-bold text-black">Orders</th>
                  <th scope="col" className="p-3 fw-bold text-black">Total Sales</th>
                  <th scope="col" className="p-3 fw-bold text-black">Joined</th>
                  <th scope="col" className="p-3 fw-bold text-black text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v._id} className="border-bottom-custom hover-bg">
                    <td className="p-3">
                      <div className="d-flex align-items-center gap-2">
                        {v.avatar ? (
                          <img
                            src={v.avatar}
                            alt={v.firstname}
                            className="rounded-circle border object-fit-cover"
                            style={{ width: "32px", height: "32px" }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-light-custom border d-flex align-items-center justify-content-center text-black fw-bold"
                            style={{ width: "32px", height: "32px", fontSize: "0.75rem" }}
                          >
                            {v.firstname?.[0]}
                            {v.lastname?.[0]}
                          </div>
                        )}
                        <div>
                          <p className="mb-0 fw-semibold text-black">
                            {v.firstname} {v.lastname}
                          </p>
                          <span className="text-muted font-monospace" style={{ fontSize: "0.72rem" }}>
                            {v.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <strong className="text-black d-block">
                        {v.vendorProfile?.businessName || "Nexora Partner Store"}
                      </strong>
                      <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                        {v.vendorProfile?.businessCategory || "General Merchant"}
                      </span>
                    </td>
                    <td className="p-3 fw-semibold text-black">{v.productCount || 0}</td>
                    <td className="p-3 fw-semibold text-black">{v.orderCount || 0}</td>
                    <td className="p-3 font-monospace fw-bold text-black">
                      ₦{(v.totalSales || 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-muted">
                      {new Date(v.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-3 text-end">
                      <div className="d-inline-flex align-items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedVendor(v)}
                          className="btn btn-sm btn-outline-dark p-1 px-2 border-custom"
                          style={{ fontSize: "0.72rem" }}
                        >
                          <FiEye size={13} className="me-1" /> View Store
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmModal({
                              isOpen: true,
                              vendorId: v._id,
                              vendorName: `${v.firstname} ${v.lastname}`,
                            })
                          }
                          className="btn btn-sm btn-outline-secondary p-1 px-2 border-custom text-nowrap"
                          style={{ fontSize: "0.72rem" }}
                          title="Demote to normal customer"
                        >
                          <FiUserMinus size={13} className="me-1" /> Remove
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

      {/* ── View Vendor Modal ─────────────────────────────────────────────── */}
      {selectedVendor && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1060 }}
          onClick={() => setSelectedVendor(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "560px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 rounded-0 shadow-lg">
              <div className="modal-header border-bottom-custom p-4 bg-white">
                <h5 className="modal-title fw-bold text-black fs-6">Vendor Store Profile</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedVendor(null)}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body p-4 bg-white">
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom-custom">
                  {selectedVendor.avatar ? (
                    <img
                      src={selectedVendor.avatar}
                      alt={selectedVendor.firstname}
                      className="rounded-circle border"
                      style={{ width: "54px", height: "54px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-light-custom border d-flex align-items-center justify-content-center text-black fw-bold"
                      style={{ width: "54px", height: "54px", fontSize: "1.2rem" }}
                    >
                      {selectedVendor.firstname?.[0]}
                      {selectedVendor.lastname?.[0]}
                    </div>
                  )}
                  <div>
                    <h5 className="fw-bold text-black mb-1">
                      {selectedVendor.vendorProfile?.businessName || "Partner Merchant"}
                    </h5>
                    <p className="text-muted small mb-0">
                      Operated by {selectedVendor.firstname} {selectedVendor.lastname}
                    </p>
                  </div>
                </div>

                <div className="row g-3 small mb-4">
                  <div className="col-4 text-center p-3 border-custom bg-light-custom">
                    <span className="text-muted d-block" style={{ fontSize: "0.72rem" }}>PRODUCTS</span>
                    <strong className="fs-5 text-black">{selectedVendor.productCount || 0}</strong>
                  </div>
                  <div className="col-4 text-center p-3 border-custom bg-light-custom">
                    <span className="text-muted d-block" style={{ fontSize: "0.72rem" }}>ORDERS</span>
                    <strong className="fs-5 text-black">{selectedVendor.orderCount || 0}</strong>
                  </div>
                  <div className="col-4 text-center p-3 border-custom bg-light-custom">
                    <span className="text-muted d-block" style={{ fontSize: "0.72rem" }}>TOTAL SALES</span>
                    <strong className="fs-6 text-black font-monospace">₦{(selectedVendor.totalSales || 0).toLocaleString()}</strong>
                  </div>
                </div>

                <div className="row g-3 small">
                  <div className="col-12 col-sm-6">
                    <span className="text-muted d-flex align-items-center gap-1 mb-1">
                      <FiMail size={13} /> Email
                    </span>
                    <p className="fw-semibold text-black mb-0 font-monospace">{selectedVendor.email}</p>
                  </div>
                  <div className="col-12 col-sm-6">
                    <span className="text-muted d-flex align-items-center gap-1 mb-1">
                      <FiPhone size={13} /> Phone
                    </span>
                    <p className="fw-semibold text-black mb-0">{selectedVendor.phone || "Not provided"}</p>
                  </div>
                  <div className="col-12">
                    <span className="text-muted d-flex align-items-center gap-1 mb-1">
                      <FiMapPin size={13} /> Business Address
                    </span>
                    <p className="fw-semibold text-black mb-0">
                      {selectedVendor.vendorProfile?.businessAddress || "No business address on file"}
                    </p>
                  </div>
                  <div className="col-12">
                    <span className="text-muted d-block mb-1">Store Description</span>
                    <div className="p-3 bg-light-custom border-custom">
                      {selectedVendor.vendorProfile?.businessDescription || "Standard merchant on Nexora."}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top-custom p-3 bg-light-custom d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm rounded-0"
                  onClick={() => setSelectedVendor(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-0"
                  onClick={() => {
                    const v = selectedVendor;
                    setSelectedVendor(null);
                    setConfirmModal({
                      isOpen: true,
                      vendorId: v._id,
                      vendorName: `${v.firstname} ${v.lastname}`,
                    });
                  }}
                >
                  Revoke Vendor Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ────────────────────────────────────────────── */}
      {confirmModal.isOpen && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1070 }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "440px" }}>
            <div className="modal-content border-0 rounded-0 shadow-lg">
              <div className="modal-header border-bottom-custom p-4 bg-white">
                <h5 className="modal-title fw-bold text-black fs-6">Remove Vendor Access</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setConfirmModal({ isOpen: false, vendorId: null, vendorName: "" })}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body p-4 bg-white">
                <p className="small text-muted mb-0">
                  Are you sure you want to remove vendor access from <strong>{confirmModal.vendorName}</strong>?
                  They will lose access to the Vendor Dashboard and will no longer be able to manage products.
                </p>
              </div>
              <div className="modal-footer border-top-custom p-3 bg-light-custom d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-custom btn-sm rounded-0"
                  onClick={() => setConfirmModal({ isOpen: false, vendorId: null, vendorName: "" })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-dark-custom btn-sm rounded-0"
                  onClick={handleDemoteVendor}
                >
                  Confirm Removal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
