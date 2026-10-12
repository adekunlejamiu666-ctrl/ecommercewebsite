import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiCheck,
  FiX,
  FiEye,
  FiClock,
  FiBriefcase,
  FiMail,
  FiPhone,
  FiMapPin,
  FiFileText,
  FiAlertCircle,
  FiUserCheck,
} from "react-icons/fi";
import vendorService from "../../services/vendorService";

export default function VendorRequests() {
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  // Modals
  const [reviewRequest, setReviewRequest] = useState(null);
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    requestId: null,
    applicantName: "",
    reason: "",
  });

  const loadRequests = () => {
    setLoading(true);
    vendorService
      .getAdminVendorRequests({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search.trim() || undefined,
      })
      .then((data) => {
        if (data?.requests) setRequests(data.requests);
        if (data?.counts) setCounts(data.counts);
      })
      .catch((err) => {
        console.warn("Failed to load vendor requests:", err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter, search]);

  const handleApprove = async (id, applicantName) => {
    try {
      await vendorService.approveVendorRequest(id);
      setFeedback(`Application for ${applicantName} approved! Account upgraded to VENDOR.`);
      setReviewRequest(null);
      loadRequests();
      setTimeout(() => setFeedback(""), 5000);
    } catch (err) {
      alert(err.message || "Failed to approve application.");
    }
  };

  const openRejectModal = (request) => {
    setRejectModal({
      isOpen: true,
      requestId: request._id,
      applicantName: request.fullName,
      reason: "",
    });
  };

  const handleReject = async () => {
    if (!rejectModal.requestId) return;
    try {
      await vendorService.rejectVendorRequest(rejectModal.requestId, rejectModal.reason);
      setFeedback(`Application for ${rejectModal.applicantName} marked as rejected.`);
      setRejectModal({ isOpen: false, requestId: null, applicantName: "", reason: "" });
      setReviewRequest(null);
      loadRequests();
      setTimeout(() => setFeedback(""), 5000);
    } catch (err) {
      alert(err.message || "Failed to reject application.");
    }
  };

  return (
    <div className="admin-vendor-requests">
      {/* Page Title */}
      <div className="mb-4">
        <h1 className="h3 font-serif fw-bold text-black mb-1">Vendor Applications</h1>
        <p className="text-muted small mb-0">
          Review business credentials and approve new merchants to sell on Nexora.
        </p>
      </div>

      {feedback && (
        <div className="alert alert-dark border-custom py-2 px-3 small d-flex align-items-center gap-2 mb-4">
          <FiCheck size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="p-3 border-custom bg-white mb-4 d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-center" style={{ borderRadius: "var(--radius-md)" }}>
        <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: "450px" }}>
          <FiSearch size={16} className="text-muted" />
          <input
            type="text"
            className="form-control border-0 p-0 shadow-none small"
            placeholder="Search by name, business, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filters */}
        <div className="d-flex align-items-center gap-1 overflow-auto">
          {[
            { key: "all", label: "All", count: counts.all },
            { key: "pending", label: "Pending", count: counts.pending },
            { key: "approved", label: "Approved", count: counts.approved },
            { key: "rejected", label: "Rejected", count: counts.rejected },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`btn btn-sm px-3 small d-flex align-items-center gap-2 ${statusFilter === tab.key
                  ? "btn-emerald text-white fw-semibold"
                  : "btn-outline-custom text-muted"
                }`}
              style={{ borderRadius: "var(--radius-pill)" }}
              onClick={() => setStatusFilter(tab.key)}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`badge ${statusFilter === tab.key ? "bg-white text-dark" : "bg-light-custom text-dark border"
                    }`}
                  style={{ fontSize: "0.65rem" }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="p-0 border-custom bg-white shadow-sm overflow-hidden" style={{ borderRadius: "var(--radius-md)" }}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark spinner-border-sm" role="status">
              <span className="visually-hidden">Loading applications...</span>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <p className="text-muted small py-5 text-center mb-0">No vendor applications found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table-atelier w-100 align-middle small mb-0">
              <thead className="text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                <tr>
                  <th scope="col" className="p-3 fw-bold text-black">Applicant</th>
                  <th scope="col" className="p-3 fw-bold text-black">Business Name</th>
                  <th scope="col" className="p-3 fw-bold text-black">Category</th>
                  <th scope="col" className="p-3 fw-bold text-black">Submitted</th>
                  <th scope="col" className="p-3 fw-bold text-black">Status</th>
                  <th scope="col" className="p-3 fw-bold text-black text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const isPending = req.status === "pending";
                  const isApproved = req.status === "approved";
                  const isRejected = req.status === "rejected";

                  return (
                    <tr key={req._id} className="border-bottom-custom hover-bg">
                      <td className="p-3">
                        <p className="mb-0 fw-semibold text-black">{req.fullName}</p>
                        <span className="text-muted font-monospace" style={{ fontSize: "0.72rem" }}>
                          {req.email}
                        </span>
                      </td>
                      <td className="p-3 fw-semibold text-black">{req.businessName}</td>
                      <td className="p-3 text-muted">{req.businessCategory}</td>
                      <td className="p-3 text-muted">
                        {new Date(req.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3">
                        <span
                          className={`badge px-2 py-1 text-uppercase fw-semibold ${isPending
                              ? "bg-light text-dark border border-dark"
                              : isApproved
                                ? "bg-black text-white"
                                : "bg-light text-muted border"
                            }`}
                          style={{ fontSize: "0.68rem" }}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3 text-end">
                        <div className="d-inline-flex align-items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setReviewRequest(req)}
                            className="btn btn-sm btn-dark p-1 px-3 rounded-0"
                            style={{ fontSize: "0.72rem" }}
                          >
                            <FiEye size={13} className="me-1" /> Review
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

      {/* ── Complete Application Review Modal ─────────────────────────────── */}
      {reviewRequest && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1060 }}
          onClick={() => setReviewRequest(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 rounded-0 shadow-lg">
              <div className="modal-header border-bottom-custom p-4 bg-white">
                <div>
                  <h5 className="modal-title fw-bold text-black fs-6">Vendor Application Review</h5>
                  <span className="text-muted small font-monospace">Application ID: {reviewRequest._id}</span>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setReviewRequest(null)}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body p-4 bg-white" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {/* Status Bar */}
                <div className="p-3 bg-light-custom border-custom mb-4 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <FiClock size={16} />
                    <span className="small text-muted">
                      Applied on: {new Date(reviewRequest.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span className="badge bg-black text-white text-uppercase px-2 py-1" style={{ fontSize: "0.7rem" }}>
                    Status: {reviewRequest.status}
                  </span>
                </div>

                {reviewRequest.rejectionReason && (
                  <div className="p-3 border border-dark bg-light-custom mb-4 small">
                    <strong className="d-block mb-1 text-black">Rejection Reason Given:</strong>
                    <span className="text-muted">{reviewRequest.rejectionReason}</span>
                  </div>
                )}

                <div className="row g-4">
                  {/* Applicant Details */}
                  <div className="col-12 col-md-6">
                    <h6 className="fw-bold text-black border-bottom-custom pb-2 mb-3 text-uppercase small">
                      Applicant Information
                    </h6>
                    <div className="d-flex flex-column gap-2 small">
                      <div>
                        <span className="text-muted d-block">Full Name</span>
                        <strong className="text-black">{reviewRequest.fullName}</strong>
                      </div>
                      <div>
                        <span className="text-muted d-block">Email</span>
                        <span className="font-monospace text-black">{reviewRequest.email}</span>
                      </div>
                      <div>
                        <span className="text-muted d-block">Phone Number</span>
                        <span className="text-black">{reviewRequest.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Business Details */}
                  <div className="col-12 col-md-6">
                    <h6 className="fw-bold text-black border-bottom-custom pb-2 mb-3 text-uppercase small">
                      Business Profile
                    </h6>
                    <div className="d-flex flex-column gap-2 small">
                      <div>
                        <span className="text-muted d-block">Business Name</span>
                        <strong className="text-black">{reviewRequest.businessName}</strong>
                      </div>
                      <div>
                        <span className="text-muted d-block">Category</span>
                        <span className="text-black">{reviewRequest.businessCategory}</span>
                      </div>
                      <div>
                        <span className="text-muted d-block">Business Address</span>
                        <span className="text-black">{reviewRequest.businessAddress}</span>
                      </div>
                      <div>
                        <span className="text-muted d-block">Years in Operation</span>
                        <span className="text-black">{reviewRequest.yearsInBusiness || "Not specified"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description & Products */}
                  <div className="col-12">
                    <h6 className="fw-bold text-black border-bottom-custom pb-2 mb-3 text-uppercase small">
                      Products & Operations
                    </h6>
                    <div className="row g-3 small">
                      <div className="col-12">
                        <span className="text-muted d-block mb-1">Products to Sell</span>
                        <div className="p-3 bg-light-custom border-custom">
                          {reviewRequest.productsToSell || "General catalogue"}
                        </div>
                      </div>
                      <div className="col-12">
                        <span className="text-muted d-block mb-1">Business Description</span>
                        <div className="p-3 bg-light-custom border-custom">
                          {reviewRequest.businessDescription}
                        </div>
                      </div>
                      {reviewRequest.registrationNumber && (
                        <div className="col-12 col-md-6">
                          <span className="text-muted d-block">Registration / Tax Number</span>
                          <span className="font-monospace text-black">{reviewRequest.registrationNumber}</span>
                        </div>
                      )}
                      {reviewRequest.storeLink && (
                        <div className="col-12 col-md-6">
                          <span className="text-muted d-block">External Store / Social Link</span>
                          <a
                            href={reviewRequest.storeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-dark"
                          >
                            {reviewRequest.storeLink}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="modal-footer border-top-custom p-3 bg-light-custom d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm rounded-0"
                  onClick={() => setReviewRequest(null)}
                >
                  Close
                </button>

                <div className="d-flex align-items-center gap-2">
                  {reviewRequest.status === "pending" && (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm rounded-0"
                        onClick={() => openRejectModal(reviewRequest)}
                      >
                        <FiX size={14} className="me-1" /> Reject Application
                      </button>
                      <button
                        type="button"
                        className="btn btn-dark btn-sm rounded-0"
                        onClick={() => handleApprove(reviewRequest._id, reviewRequest.fullName)}
                      >
                        <FiCheck size={14} className="me-1" /> Approve Vendor
                      </button>
                    </>
                  )}
                  {reviewRequest.status === "rejected" && (
                    <button
                      type="button"
                      className="btn btn-dark btn-sm rounded-0"
                      onClick={() => handleApprove(reviewRequest._id, reviewRequest.fullName)}
                    >
                      <FiCheck size={14} className="me-1" /> Re-Approve Vendor
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Reason Prompt Modal ────────────────────────────────────── */}
      {rejectModal.isOpen && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1070 }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "460px" }}>
            <div className="modal-content border-0 rounded-0 shadow-lg">
              <div className="modal-header border-bottom-custom p-4 bg-white">
                <h5 className="modal-title fw-bold text-black fs-6">Reject Vendor Application</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setRejectModal({ isOpen: false, requestId: null, applicantName: "", reason: "" })}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body p-4 bg-white">
                <p className="small text-muted mb-3">
                  Please provide a reason for rejecting the application for <strong>{rejectModal.applicantName}</strong>. The applicant will see this feedback.
                </p>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-black">Rejection Reason</label>
                  <textarea
                    rows={4}
                    className="form-control rounded-0 small border-custom"
                    placeholder="e.g. Incomplete business address, unverifiable registration number, or product catalog does not meet Nexora luxury standards..."
                    value={rejectModal.reason}
                    onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
                  />
                </div>
              </div>
              <div className="modal-footer border-top-custom p-3 bg-light-custom d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm rounded-0"
                  onClick={() => setRejectModal({ isOpen: false, requestId: null, applicantName: "", reason: "" })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm rounded-0"
                  onClick={handleReject}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
