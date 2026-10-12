import React, { useState, useEffect, useCallback } from "react";
import {
  FiMail,
  FiPhone,
  FiUser,
  FiClock,
  FiCheck,
  FiX,
  FiTrash2,
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiInbox,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
} from "react-icons/fi";
import messageService from "../../services/messageService";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // all, vendor_application, unread, approved
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    unreadCount: 0,
    vendorCount: 0,
  });

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab === "vendor_application") {
        params.type = "vendor_application";
      } else if (activeTab === "unread") {
        params.status = "unread";
      } else if (activeTab === "approved") {
        params.status = "approved";
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await messageService.getMessages(params);
      if (res.success) {
        setMessages(res.messages || []);
        setStats({
          total: res.total || 0,
          unreadCount: res.unreadCount || 0,
          vendorCount: res.vendorCount || 0,
        });
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleOpenMessage = async (msg) => {
    setSelectedMessage(msg);
    setAdminNote(msg.notes || "");

    // If unread, mark as read automatically
    if (msg.status === "unread") {
      try {
        await messageService.updateMessageStatus(msg._id, { status: "read" });
        setMessages((prev) =>
          prev.map((m) => (m._id === msg._id ? { ...m, status: "read" } : m))
        );
        setStats((prev) => ({
          ...prev,
          unreadCount: Math.max(0, prev.unreadCount - 1),
        }));
      } catch (err) {
        console.error("Error marking message as read:", err);
      }
    }
  };

  const handleStatusChange = async (messageId, newStatus) => {
    setStatusUpdating(true);
    try {
      const res = await messageService.updateMessageStatus(messageId, {
        status: newStatus,
        notes: adminNote,
      });
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, status: newStatus, notes: adminNote }
              : m
          )
        );
        if (selectedMessage && selectedMessage._id === messageId) {
          setSelectedMessage((prev) => ({
            ...prev,
            status: newStatus,
            notes: adminNote,
          }));
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm("Are you sure you want to permanently delete this message?")) {
      return;
    }
    try {
      await messageService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(null);
      }
      setStats((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
    } catch (err) {
      console.error("Error deleting message:", err);
      alert("Failed to delete message.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "unread":
        return (
          <span
            className="badge fw-semibold"
            style={{
              backgroundColor: "#111111",
              color: "#ffffff",
              fontSize: "0.7rem",
              letterSpacing: "0.05em",
            }}
          >
            NEW / UNREAD
          </span>
        );
      case "approved":
        return (
          <span
            className="badge fw-semibold"
            style={{
              backgroundColor: "#e8f5e9",
              color: "#2e7d32",
              fontSize: "0.7rem",
            }}
          >
            APPROVED
          </span>
        );
      case "rejected":
        return (
          <span
            className="badge fw-semibold"
            style={{
              backgroundColor: "#ffebee",
              color: "#c62828",
              fontSize: "0.7rem",
            }}
          >
            DECLINED
          </span>
        );
      case "read":
      default:
        return (
          <span
            className="badge fw-semibold"
            style={{
              backgroundColor: "#f5f5f5",
              color: "#616161",
              fontSize: "0.7rem",
            }}
          >
            REVIEWED
          </span>
        );
    }
  };

  return (
    <div className="admin-messages-page">
      {/* Top Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 gap-3">
        <div>
          <h1 className="h3 font-serif fw-bold text-black mb-1">Admin Inbox</h1>
          <p className="text-muted small mb-0">
            Incoming vendor applications, merchant onboarding inquiries, and messages.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-emerald btn-sm d-flex align-items-center gap-2 py-2 px-3"
            onClick={fetchMessages}
          >
            <FiRefreshCw size={14} className={loading ? "spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-4">
          <div className="stat-card-reference d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: "0.7rem", letterSpacing: "0.08em" }}>
                Total Messages
              </div>
              <div className="h4 font-serif fw-bold text-black mb-0 mt-1">{stats.total}</div>
            </div>
            <div className="p-2 rounded-circle d-flex align-items-center justify-content-center text-white" style={{ backgroundColor: "var(--emerald)", width: "40px", height: "40px" }}>
              <FiInbox size={18} />
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-4">
          <div className="stat-card-reference d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: "0.7rem", letterSpacing: "0.08em" }}>
                Vendor Applications
              </div>
              <div className="h4 font-serif fw-bold text-black mb-0 mt-1">{stats.vendorCount}</div>
            </div>
            <div className="p-2 rounded-circle d-flex align-items-center justify-content-center text-white" style={{ backgroundColor: "var(--emerald)", width: "40px", height: "40px" }}>
              <FiUser size={18} />
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-4">
          <div className="stat-card-reference d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: "0.7rem", letterSpacing: "0.08em" }}>
                Unread Inquiries
              </div>
              <div className="h4 font-serif fw-bold text-black mb-0 mt-1">{stats.unreadCount}</div>
            </div>
            <div className="p-2 rounded-circle d-flex align-items-center justify-content-center text-white" style={{ backgroundColor: stats.unreadCount > 0 ? "#DC2626" : "var(--emerald)", width: "40px", height: "40px" }}>
              <FiMail size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="p-3 bg-white border-custom shadow-sm mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3"
        style={{ borderRadius: "var(--radius-md)" }}
      >
        {/* Navigation Tabs */}
        <div className="d-flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Messages" },
            { id: "vendor_application", label: "Vendor Applications" },
            { id: "unread", label: `Unread (${stats.unreadCount})` },
            { id: "approved", label: "Approved Vendors" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`btn btn-sm ${
                activeTab === tab.id
                  ? "btn-emerald fw-semibold"
                  : "btn-outline-custom text-muted"
              }`}
              style={{ borderRadius: "var(--radius-pill)", fontSize: "0.825rem" }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="position-relative flex-grow-1 flex-md-grow-0" style={{ minWidth: "220px", maxWidth: "100%" }}>
          <FiSearch
            size={14}
            className="text-muted position-absolute"
            style={{ left: "10px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            className="form-control form-control-sm ps-4"
            style={{ borderRadius: "var(--radius-md)", borderColor: "var(--card-border)" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Message List */}
      <div className="bg-white border-custom shadow-sm" style={{ borderRadius: "2px" }}>
        {loading ? (
          <div className="text-center py-5 text-muted small">
            <div className="spinner-border spinner-border-sm me-2" role="status" />
            Loading messages from admin inbox...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-5">
            <FiInbox size={36} className="text-muted mb-2" />
            <h6 className="fw-bold text-dark">No messages found</h6>
            <p className="text-muted small mb-0">
              No inquiries match your current filter or search criteria.
            </p>
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: "auto" }}>
            <table className="table-atelier w-100 align-middle mb-0" style={{ minWidth: "620px" }}>
              <thead className="text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                <tr>
                  <th style={{ width: "100px", padding: "0.75rem 1rem" }}>Status</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Applicant / Sender</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Contact Info</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Subject & Preview</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Received</th>
                  <th className="text-end" style={{ width: "120px", padding: "0.75rem 1rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "0.85rem" }}>
                {messages.map((msg) => {
                  const isUnread = msg.status === "unread";
                  return (
                    <tr
                      key={msg._id}
                      style={{
                        backgroundColor: isUnread ? "rgba(15,118,110,0.04)" : "transparent",
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpenMessage(msg)}
                    >
                      <td style={{ padding: "0.85rem 1rem" }}>{getStatusBadge(msg.status)}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div className={`text-dark ${isUnread ? "fw-bold" : "fw-medium"}`}>
                          {msg.name}
                        </div>
                        {msg.type === "vendor_application" && (
                          <span className="badge-emerald" style={{ fontSize: "0.6rem" }}>
                            VENDOR APPLICATION
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div className="d-flex flex-column gap-1">
                          <span className="text-muted small d-flex align-items-center gap-1">
                            <FiMail size={12} /> {msg.email}
                          </span>
                          <span className="text-muted small d-flex align-items-center gap-1">
                            <FiPhone size={12} /> {msg.phone}
                          </span>
                        </div>
                      </td>
                      <td style={{ maxWidth: "280px", padding: "0.85rem 1rem" }}>
                        <div className="text-dark fw-semibold text-truncate">
                          {msg.subject || "Vendor Application"}
                        </div>
                        <div
                          className="text-muted small text-truncate"
                          style={{ maxWidth: "260px" }}
                        >
                          {msg.message}
                        </div>
                      </td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span className="text-muted small d-flex align-items-center gap-1">
                          <FiClock size={12} />
                          {new Date(msg.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="text-end" style={{ padding: "0.85rem 1rem" }} onClick={(e) => e.stopPropagation()}>
                        <div className="d-inline-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-emerald p-1 px-2"
                            title="View Details"
                            onClick={() => handleOpenMessage(msg)}
                          >
                            <FiEye size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-danger p-1 border-0"
                            title="Delete Message"
                            onClick={() => handleDelete(msg._id)}
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

      {/* Message Details Modal */}
      {selectedMessage && (
        <div
          id="message-detail-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 1060,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.75rem",
            overflowY: "auto",
          }}
          onClick={(e) => {
            if (e.target.id === "message-detail-overlay") {
              setSelectedMessage(null);
            }
          }}
        >
          <div
            className="bg-white border-custom shadow-lg"
            style={{
              maxWidth: "600px",
              width: "100%",
              maxHeight: "calc(100vh - 1.5rem)",
              display: "flex",
              flexDirection: "column",
              borderRadius: "4px",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="d-flex align-items-center justify-content-between p-3 p-sm-4 border-bottom"
              style={{ flexShrink: 0 }}
            >
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="text-uppercase fw-bold small text-muted" style={{ letterSpacing: "0.05em" }}>
                    {selectedMessage.type === "vendor_application"
                      ? "Vendor Application"
                      : "General Inquiry"}
                  </span>
                  {getStatusBadge(selectedMessage.status)}
                </div>
                <h5 className="fw-bold text-dark mb-0">{selectedMessage.name}</h5>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-light border-0"
                style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0 }}
                onClick={() => setSelectedMessage(null)}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-3 p-sm-4" style={{ overflowY: "auto", flexGrow: 1 }}>
              {/* Contact info grid */}
              <div className="row g-3 p-3 bg-light rounded mb-4" style={{ fontSize: "0.85rem" }}>
                <div className="col-sm-6">
                  <div className="text-muted small fw-semibold">Email Address</div>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-dark text-decoration-none fw-medium d-flex align-items-center gap-1 mt-1"
                  >
                    <FiMail size={14} /> {selectedMessage.email}
                  </a>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted small fw-semibold">Phone Number</div>
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="text-dark text-decoration-none fw-medium d-flex align-items-center gap-1 mt-1"
                  >
                    <FiPhone size={14} /> {selectedMessage.phone}
                  </a>
                </div>
                <div className="col-sm-12 pt-1 border-top">
                  <div className="text-muted small">
                    Received on:{" "}
                    <strong>
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="mb-4">
                <label className="text-muted small fw-bold text-uppercase mb-2 d-block">
                  Application Message / Brand Pitch
                </label>
                <div
                  className="p-3 bg-white border rounded"
                  style={{
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    color: "#222",
                    whiteSpace: "pre-wrap",
                    maxHeight: "220px",
                    overflowY: "auto",
                  }}
                >
                  {selectedMessage.message}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="mb-4">
                <label className="text-muted small fw-bold text-uppercase mb-1 d-block">
                  Admin Internal Notes
                </label>
                <textarea
                  rows={2}
                  className="form-control form-control-sm"
                  placeholder="Add notes about this applicant (e.g. Approved category, phone interview done...)"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                  onClick={() => handleDelete(selectedMessage._id)}
                >
                  <FiTrash2 size={14} /> Delete
                </button>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    disabled={statusUpdating}
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleStatusChange(selectedMessage._id, "rejected")}
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    disabled={statusUpdating}
                    className="btn btn-sm btn-dark d-flex align-items-center gap-1"
                    onClick={() => handleStatusChange(selectedMessage._id, "approved")}
                  >
                    <FiCheck size={14} /> Approve as Vendor
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
