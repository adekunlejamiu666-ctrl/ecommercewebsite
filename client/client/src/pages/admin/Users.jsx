import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiTrash2,
  FiCheck,
  FiEye,
  FiUserCheck,
  FiUserMinus,
  FiX,
  FiShoppingBag,
  FiCalendar,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
} from "react-icons/fi";
import userService from "../../services/userService";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    user: null,
    targetRole: "",
    title: "",
    message: "",
  });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });

  const loadUsers = () => {
    setLoading(true);
    userService
      .getAllUsers({
        search: search.trim() || undefined,
        role: roleFilter !== "All" ? roleFilter.toLowerCase() : undefined,
      })
      .then((data) => {
        if (data?.users) setUsers(data.users);
      })
      .catch((err) => {
        console.warn("Users load error:", err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const triggerRoleConfirmation = (user, targetRole) => {
    const isPromoting = targetRole === "vendor";
    setConfirmModal({
      isOpen: true,
      user,
      targetRole,
      title: isPromoting ? "Promote to Vendor" : "Remove Vendor Access",
      message: isPromoting
        ? `Are you sure you want to make ${user.firstname} ${user.lastname} a vendor? They will immediately receive access to the Vendor Dashboard and will be able to sell products.`
        : `Are you sure you want to remove vendor access from ${user.firstname} ${user.lastname}? They will be reverted to a normal customer account.`,
    });
  };

  const executeRoleChange = async () => {
    if (!confirmModal.user) return;
    try {
      await userService.updateUserRole(confirmModal.user._id, confirmModal.targetRole);
      setFeedback(
        `User ${confirmModal.user.firstname} role successfully changed to "${confirmModal.targetRole.toUpperCase()}".`
      );
      setConfirmModal({ isOpen: false, user: null, targetRole: "", title: "", message: "" });
      loadUsers();
      setTimeout(() => setFeedback(""), 5000);
    } catch (err) {
      alert(err.message || "Failed to update user role.");
    }
  };

  const handleDeleteUser = (user) => {
    setDeleteModal({ isOpen: true, user });
  };

  const executeDelete = async () => {
    if (!deleteModal.user) return;
    const name = `${deleteModal.user.firstname} ${deleteModal.user.lastname}`;
    try {
      await userService.deleteUser(deleteModal.user._id);
      setFeedback(`User "${name}" has been removed.`);
      setDeleteModal({ isOpen: false, user: null });
      loadUsers();
      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to remove user.");
    }
  };

  return (
    <div className="admin-users">
      {/* Title */}
      <div className="mb-4">
        <h1 className="h3 font-serif fw-bold text-black mb-1">Customer & User Directory</h1>
        <p className="text-muted small mb-0">
          Manage accounts, view activity, and promote users to verified vendors.
        </p>
      </div>

      {feedback && (
        <div className="alert alert-dark border-custom py-2 px-3 small d-flex align-items-center gap-2 mb-4">
          <FiCheck size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-3 border-custom bg-white mb-4 d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-center" style={{ borderRadius: "var(--radius-md)" }}>
        <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: "450px" }}>
          <FiSearch size={16} className="text-muted" />
          <input
            type="text"
            className="form-control border-0 p-0 shadow-none small"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Role Filters */}
        <div className="d-flex align-items-center gap-1 overflow-auto">
          {["All", "User", "Vendor", "Admin"].map((filter) => (
            <button
              key={filter}
              type="button"
              className={`btn btn-sm px-3 small ${
                roleFilter.toLowerCase() === filter.toLowerCase()
                  ? "btn-emerald text-white fw-semibold"
                  : "btn-outline-custom text-muted"
              }`}
              style={{ borderRadius: "var(--radius-pill)" }}
              onClick={() => setRoleFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="p-0 border-custom bg-white shadow-sm overflow-hidden" style={{ borderRadius: "var(--radius-md)" }}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark spinner-border-sm" role="status">
              <span className="visually-hidden">Loading users...</span>
            </div>
          </div>
        ) : users.length === 0 ? (
          <p className="text-muted small py-5 text-center mb-0">No users found matching your query.</p>
        ) : (
          <div className="table-responsive">
            <table className="table-atelier w-100 align-middle small mb-0">
              <thead className="text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                <tr>
                  <th scope="col" className="p-3 fw-bold text-black">User</th>
                  <th scope="col" className="p-3 fw-bold text-black">Email</th>
                  <th scope="col" className="p-3 fw-bold text-black">Role</th>
                  <th scope="col" className="p-3 fw-bold text-black">Joined</th>
                  <th scope="col" className="p-3 fw-bold text-black">Status</th>
                  <th scope="col" className="p-3 fw-bold text-black text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isVendor = u.role === "vendor";
                  const isAdmin = u.role === "admin";

                  return (
                    <tr key={u._id} className="border-bottom-custom hover-bg">
                      <td className="p-3">
                        <div className="d-flex align-items-center gap-2">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.firstname}
                              className="rounded-circle object-fit-cover border"
                              style={{ width: "32px", height: "32px" }}
                            />
                          ) : (
                            <div
                              className="rounded-circle bg-light-custom border d-flex align-items-center justify-content-center text-black fw-bold"
                              style={{ width: "32px", height: "32px", fontSize: "0.75rem" }}
                            >
                              {u.firstname?.[0]}
                              {u.lastname?.[0]}
                            </div>
                          )}
                          <div>
                            <p className="mb-0 fw-semibold text-black">
                              {u.firstname} {u.lastname}
                            </p>
                            {u.phone && (
                              <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                                {u.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted font-monospace">{u.email}</td>
                      <td className="p-3">
                        <span
                          className={`badge px-2 py-1 text-uppercase fw-semibold ${
                            isAdmin
                              ? "bg-dark text-white"
                              : isVendor
                              ? "bg-black text-white"
                              : "bg-light text-dark border"
                          }`}
                          style={{ fontSize: "0.68rem", letterSpacing: "0.04em" }}
                        >
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="p-3 text-muted">
                        {new Date(u.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3">
                        <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: "0.68rem" }}>
                          Active
                        </span>
                      </td>
                      <td className="p-3 text-end">
                        <div className="d-inline-flex align-items-center gap-1">
                          {/* View details */}
                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="btn btn-sm btn-outline-dark p-1 px-2 border-custom"
                            style={{ fontSize: "0.72rem" }}
                            title="View Full Profile"
                          >
                            <FiEye size={13} className="me-1" /> View
                          </button>

                          {/* Role Toggle: Make Vendor or Remove Vendor */}
                          {!isAdmin && (
                            <>
                              {isVendor ? (
                                <button
                                  type="button"
                                  onClick={() => triggerRoleConfirmation(u, "user")}
                                  className="btn btn-sm btn-outline-secondary p-1 px-2 border-custom text-nowrap"
                                  style={{ fontSize: "0.72rem" }}
                                  title="Demote to normal customer"
                                >
                                  <FiUserMinus size={13} className="me-1" /> Demote
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => triggerRoleConfirmation(u, "vendor")}
                                  className="btn btn-sm btn-dark p-1 px-2 text-nowrap"
                                  style={{ fontSize: "0.72rem" }}
                                  title="Promote to Vendor"
                                >
                                  <FiUserCheck size={13} className="me-1" /> Make Vendor
                                </button>
                              )}
                            </>
                          )}

                          {/* Deactivate/Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="btn btn-sm btn-link text-danger p-1 border-0"
                            title="Deactivate account"
                          >
                            <FiTrash2 size={14} />
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

      {/* ── View User Detail Modal ────────────────────────────────────────── */}
      {selectedUser && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1060 }}
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "560px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 rounded-0 shadow-lg">
              <div className="modal-header border-bottom-custom p-4 bg-white">
                <h5 className="modal-title fw-bold text-black fs-6">User Account Overview</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedUser(null)}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body p-4 bg-white">
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom-custom">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.firstname}
                      className="rounded-circle border"
                      style={{ width: "54px", height: "54px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-light-custom border d-flex align-items-center justify-content-center text-black fw-bold"
                      style={{ width: "54px", height: "54px", fontSize: "1.2rem" }}
                    >
                      {selectedUser.firstname?.[0]}
                      {selectedUser.lastname?.[0]}
                    </div>
                  )}
                  <div>
                    <h5 className="fw-bold text-black mb-1">
                      {selectedUser.firstname} {selectedUser.lastname}
                    </h5>
                    <span className="badge bg-black text-white text-uppercase" style={{ fontSize: "0.68rem" }}>
                      Role: {selectedUser.role}
                    </span>
                  </div>
                </div>

                <div className="row g-3 small">
                  <div className="col-12 col-sm-6">
                    <span className="text-muted d-flex align-items-center gap-1 mb-1">
                      <FiMail size={13} /> Email Address
                    </span>
                    <p className="fw-semibold text-black mb-0 font-monospace">{selectedUser.email}</p>
                  </div>
                  <div className="col-12 col-sm-6">
                    <span className="text-muted d-flex align-items-center gap-1 mb-1">
                      <FiPhone size={13} /> Phone
                    </span>
                    <p className="fw-semibold text-black mb-0">{selectedUser.phone || "Not provided"}</p>
                  </div>
                  <div className="col-12 col-sm-6">
                    <span className="text-muted d-flex align-items-center gap-1 mb-1">
                      <FiCalendar size={13} /> Registration Date
                    </span>
                    <p className="fw-semibold text-black mb-0">
                      {new Date(selectedUser.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="col-12 col-sm-6">
                    <span className="text-muted d-flex align-items-center gap-1 mb-1">
                      <FiMapPin size={13} /> Location
                    </span>
                    <p className="fw-semibold text-black mb-0">
                      {[selectedUser.address?.city, selectedUser.address?.country].filter(Boolean).join(", ") ||
                        "No address saved"}
                    </p>
                  </div>

                  {selectedUser.vendorProfile?.businessName && (
                    <div className="col-12 mt-3 pt-3 border-top-custom">
                      <span className="text-muted d-block mb-1 fw-semibold text-uppercase" style={{ fontSize: "0.72rem" }}>
                        Vendor Profile Details
                      </span>
                      <p className="fw-bold text-black mb-1">{selectedUser.vendorProfile.businessName}</p>
                      <p className="text-muted small mb-0">{selectedUser.vendorProfile.businessDescription}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer border-top-custom p-3 bg-light-custom d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm rounded-0"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </button>

                {selectedUser.role !== "admin" && (
                  <div>
                    {selectedUser.role === "vendor" ? (
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm rounded-0"
                        onClick={() => {
                          const u = selectedUser;
                          setSelectedUser(null);
                          triggerRoleConfirmation(u, "user");
                        }}
                      >
                        Remove Vendor Status
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-dark btn-sm rounded-0"
                        onClick={() => {
                          const u = selectedUser;
                          setSelectedUser(null);
                          triggerRoleConfirmation(u, "vendor");
                        }}
                      >
                        Promote to Vendor
                      </button>
                    )}
                  </div>
                )}
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
                <h5 className="modal-title fw-bold text-black fs-6">{confirmModal.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setConfirmModal({ isOpen: false, user: null, targetRole: "", title: "", message: "" })}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body p-4 bg-white">
                <p className="small text-muted mb-0">{confirmModal.message}</p>
              </div>
              <div className="modal-footer border-top-custom p-3 bg-light-custom d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-custom btn-sm rounded-0"
                  onClick={() => setConfirmModal({ isOpen: false, user: null, targetRole: "", title: "", message: "" })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-dark-custom btn-sm rounded-0"
                  onClick={executeRoleChange}
                >
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      {deleteModal.isOpen && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.65)", zIndex: 1080 }}
          onClick={() => setDeleteModal({ isOpen: false, user: null })}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "420px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 rounded-0 shadow-lg">
              <div className="modal-header border-bottom-custom p-4 bg-white">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle bg-black text-white"
                    style={{ width: "32px", height: "32px" }}
                  >
                    <FiTrash2 size={15} />
                  </div>
                  <h5 className="modal-title fw-bold text-black fs-6 mb-0">Remove User Account</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteModal({ isOpen: false, user: null })}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body p-4 bg-white">
                <p className="small text-muted mb-2">
                  You are about to permanently remove the following account:
                </p>
                {deleteModal.user && (
                  <div className="p-3 border-custom bg-light-custom d-flex align-items-center gap-3" style={{ borderRadius: "2px" }}>
                    <div
                      className="rounded-circle bg-black text-white d-flex align-items-center justify-content-center fw-bold"
                      style={{ width: "38px", height: "38px", fontSize: "0.85rem", flexShrink: 0 }}
                    >
                      {deleteModal.user.firstname?.[0]}{deleteModal.user.lastname?.[0]}
                    </div>
                    <div>
                      <p className="mb-0 fw-bold text-black small">{deleteModal.user.firstname} {deleteModal.user.lastname}</p>
                      <p className="mb-0 text-muted" style={{ fontSize: "0.75rem" }}>{deleteModal.user.email}</p>
                    </div>
                  </div>
                )}
                <p className="small text-muted mt-3 mb-0">
                  This action cannot be undone. The account and all associated data will be removed.
                </p>
              </div>
              <div className="modal-footer border-top-custom p-3 bg-light-custom d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-custom btn-sm rounded-0"
                  onClick={() => setDeleteModal({ isOpen: false, user: null })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-sm rounded-0 text-white fw-semibold"
                  style={{ backgroundColor: "#c0392b", border: "none" }}
                  onClick={executeDelete}
                >
                  <FiTrash2 size={13} className="me-1" /> Yes, Remove Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
