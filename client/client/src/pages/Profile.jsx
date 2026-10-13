import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiPackage,
  FiHeart,
  FiMapPin,
  FiSettings,
  FiLogOut,
  FiCheck,
  FiAlertCircle,
  FiShield,
  FiCamera,
  FiTrash2,
  FiLink,
  FiBriefcase,
  FiArrowRight,
  FiMail,
  FiPhone,
  FiAward,
  FiCheckCircle,
  FiExternalLink,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";

export default function Profile() {
  const { user, updateUser, logout, isAdmin, isVendor, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'address' | 'role'
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [formData, setFormData] = useState({
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    country: user?.address?.country || "United States",
    postalCode: user?.address?.postalCode || "",
  });

  // Keep formData in sync whenever user object updates
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstname: user.firstname || prev.firstname || "",
        lastname: user.lastname || prev.lastname || "",
        email: user.email || prev.email || "",
        phone: user.phone || prev.phone || "",
        avatar: user.avatar !== undefined ? user.avatar : prev.avatar,
        street: user.address?.street || prev.street || "",
        city: user.address?.city || prev.city || "",
        state: user.address?.state || prev.state || "",
        country: user.address?.country || prev.country || "United States",
        postalCode: user.address?.postalCode || prev.postalCode || "",
      }));
    }
  }, [user]);

  // Fetch latest user profile from server on mount
  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const freshUser = await authService.getProfile();
        if (freshUser) {
          updateUser(freshUser);
        }
      } catch (err) {
        console.error("Could not load latest profile:", err);
      }
    };

    if (isAuthenticated) {
      fetchLatestProfile();
    }
  }, [isAuthenticated]);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Allowed image types — must match backend upload.middleware.js
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict MIME type check — don't trust filename alone
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrorMsg(
        "Please upload a valid image file. Only JPEG, JPG, PNG, and WebP formats are accepted."
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size must be less than 5 MB. Please choose a smaller file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, avatar: reader.result }));
      setErrorMsg("");
      setSuccessMsg("");
    };
    reader.onerror = () => {
      setErrorMsg("Failed to read the image file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateName = (name, fieldName) => {
    const trimmed = (name || "").trim();
    if (!trimmed) {
      return `${fieldName} is required.`;
    }
    if (/\d/.test(trimmed)) {
      return `${fieldName} cannot contain numbers. Only letters are allowed.`;
    }
    if (!/^[A-Za-z\s'-]+$/.test(trimmed)) {
      return `${fieldName} must contain only letters.`;
    }
    if (trimmed.length < 2) {
      return `${fieldName} must be at least 2 letters long.`;
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "firstname" || name === "lastname") {
      const fieldName = name === "firstname" ? "First name" : "Last name";
      if (/\d/.test(value)) {
        setErrorMsg(`${fieldName} cannot contain numbers. Only letters are allowed.`);
      } else if (value.trim().length > 0 && !/^[A-Za-z\s'-]+$/.test(value.trim())) {
        setErrorMsg(`${fieldName} must contain only letters.`);
      } else if (
        errorMsg &&
        (errorMsg.includes("First name") || errorMsg.includes("Last name"))
      ) {
        setErrorMsg("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (activeTab === "profile") {
      const firstnameError = validateName(formData.firstname, "First name");
      if (firstnameError) {
        return setErrorMsg(firstnameError);
      }

      const lastnameError = validateName(formData.lastname, "Last name");
      if (lastnameError) {
        return setErrorMsg(lastnameError);
      }
    }

    setLoading(true);

    try {
      const payload = {
        firstname: (formData.firstname || user?.firstname || "").trim(),
        lastname: (formData.lastname || user?.lastname || "").trim(),
        phone: (formData.phone || "").trim(),
        avatar: formData.avatar !== undefined ? (formData.avatar || "").trim() : (user?.avatar || ""),
        address: {
          street: (formData.street || "").trim(),
          city: (formData.city || "").trim(),
          state: (formData.state || "").trim(),
          country: (formData.country || "").trim(),
          postalCode: (formData.postalCode || "").trim(),
        },
      };

      const updated = await authService.updateProfile(payload);
      if (updated) {
        updateUser(updated);
      }
      setSuccessMsg("Account profile successfully updated.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page py-5" style={{ backgroundColor: "var(--ivory-bg)", minHeight: "85vh" }}>
      <div className="container" style={{ maxWidth: "1200px" }}>
        
        {/* Luxury Header Banner */}
        <div className="mb-5 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 pb-4 border-bottom" style={{ borderColor: "var(--card-border)" }}>
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge-emerald">Account Persona</span>
              {isAdmin && (
                <span className="badge" style={{ backgroundColor: "#0F766E", color: "#FFFFFF", borderRadius: "var(--radius-pill)", padding: "0.3rem 0.8rem", fontSize: "0.72rem", letterSpacing: "0.05em", fontWeight: 700 }}>
                  <FiShield className="me-1" /> ADMINISTRATOR
                </span>
              )}
              {isVendor && (
                <span className="badge" style={{ backgroundColor: "#111827", color: "#E5E7EB", borderRadius: "var(--radius-pill)", padding: "0.3rem 0.8rem", fontSize: "0.72rem", letterSpacing: "0.05em", fontWeight: 700 }}>
                  <FiBriefcase className="me-1" /> VERIFIED VENDOR
                </span>
              )}
              {!isAdmin && !isVendor && (
                <span className="badge" style={{ backgroundColor: "#E5E7EB", color: "#374151", borderRadius: "var(--radius-pill)", padding: "0.3rem 0.8rem", fontSize: "0.72rem", letterSpacing: "0.05em", fontWeight: 700 }}>
                  <FiAward className="me-1" /> CLIENT MEMBER
                </span>
              )}
            </div>
            <h1 className="h2 font-serif fw-bold mb-1" style={{ color: "var(--text-heading)", letterSpacing: "-0.01em" }}>
              Personal Profile & Preferences
            </h1>
            <p className="small mb-0" style={{ color: "var(--text-muted)" }}>
              Manage your personal credentials, communication channels, and shipping locations.
            </p>
          </div>

          {/* Quick Portal Switcher Actions */}
          <div className="d-flex gap-2">
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="btn btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 text-white fw-semibold shadow-sm"
                style={{ backgroundColor: "var(--emerald)", borderRadius: "var(--radius-md)" }}
              >
                <FiShield size={14} /> Admin Command Console <FiArrowRight size={13} />
              </Link>
            )}
            {isVendor && (
              <Link
                to="/vendor/dashboard"
                className="btn btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 text-white fw-semibold shadow-sm"
                style={{ backgroundColor: "#0C1413", borderRadius: "var(--radius-md)" }}
              >
                <FiBriefcase size={14} /> Vendor Store Portal <FiArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>

        <div className="row g-4 g-lg-5">
          {/* ── LEFT SIDEBAR: PROFILE CARD & NAVIGATION ── */}
          <aside className="col-lg-4 col-xl-3">
            <div
              className="bg-white p-4 shadow-sm"
              style={{
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--card-border)",
                position: "sticky",
                top: "96px",
              }}
            >
              {/* Avatar & User Summary */}
              <div className="text-center pb-4 mb-3 border-bottom" style={{ borderColor: "var(--card-border)" }}>
                <div
                  className="rounded-circle mx-auto mb-3 position-relative overflow-hidden shadow-sm"
                  style={{
                    width: "88px",
                    height: "88px",
                    border: "3px solid #EAE6DC",
                    backgroundColor: "#F3F4F6",
                    cursor: "pointer",
                    transition: "var(--transition-base)",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to update photo"
                >
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt={user?.firstname}
                      className="w-100 h-100 object-fit-cover"
                    />
                  ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                      <FiUser size={38} />
                    </div>
                  )}
                  {/* Hover Camera Overlay */}
                  <div
                    className="position-absolute bottom-0 start-0 w-100 py-1 text-center text-white"
                    style={{
                      backgroundColor: "rgba(12, 20, 19, 0.75)",
                      fontSize: "0.65rem",
                    }}
                  >
                    <FiCamera size={11} className="me-1" /> Edit
                  </div>
                </div>

                <h5 className="font-serif fw-bold text-black mb-1">
                  {user?.firstname} {user?.lastname}
                </h5>
                <p className="small text-muted mb-2 text-truncate" style={{ fontSize: "0.82rem" }}>
                  {user?.email}
                </p>

                {/* Role Pill */}
                <span
                  className="badge px-3 py-1 fw-semibold"
                  style={{
                    backgroundColor: isAdmin ? "rgba(15, 118, 110, 0.12)" : isVendor ? "#F3F4F6" : "#E8F5E9",
                    color: isAdmin ? "var(--emerald)" : isVendor ? "#111827" : "#1B4332",
                    borderRadius: "var(--radius-pill)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.03em",
                  }}
                >
                  {isAdmin ? "Admin Authority" : isVendor ? "Verified Merchant" : "Active Member"}
                </span>
              </div>

              {/* Navigation Menu */}
              <div className="d-flex flex-column gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className={`btn text-start p-2 px-3 small border-0 d-flex align-items-center justify-content-between transition-base ${
                    activeTab === "profile"
                      ? "fw-bold text-white shadow-sm"
                      : "text-dark hover-bg"
                  }`}
                  style={{
                    borderRadius: "var(--radius-md)",
                    backgroundColor: activeTab === "profile" ? "var(--emerald)" : "transparent",
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <FiUser size={15} /> <span>Personal Profile</span>
                  </div>
                  {activeTab === "profile" && <FiCheckCircle size={13} />}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("address")}
                  className={`btn text-start p-2 px-3 small border-0 d-flex align-items-center justify-content-between transition-base ${
                    activeTab === "address"
                      ? "fw-bold text-white shadow-sm"
                      : "text-dark hover-bg"
                  }`}
                  style={{
                    borderRadius: "var(--radius-md)",
                    backgroundColor: activeTab === "address" ? "var(--emerald)" : "transparent",
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <FiMapPin size={15} /> <span>Delivery Addresses</span>
                  </div>
                  {activeTab === "address" && <FiCheckCircle size={13} />}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("role")}
                  className={`btn text-start p-2 px-3 small border-0 d-flex align-items-center justify-content-between transition-base ${
                    activeTab === "role"
                      ? "fw-bold text-white shadow-sm"
                      : "text-dark hover-bg"
                  }`}
                  style={{
                    borderRadius: "var(--radius-md)",
                    backgroundColor: activeTab === "role" ? "var(--emerald)" : "transparent",
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <FiShield size={15} /> <span>Role & Privileges</span>
                  </div>
                  {activeTab === "role" && <FiCheckCircle size={13} />}
                </button>

                <div className="my-2 border-top" style={{ borderColor: "var(--card-border)" }} />

                <Link
                  to="/my-orders"
                  className="btn text-start p-2 px-3 small border-0 text-muted d-flex align-items-center justify-content-between text-decoration-none hover-bg"
                  style={{ borderRadius: "var(--radius-md)" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <FiPackage size={15} /> <span>My Orders</span>
                  </div>
                  <FiArrowRight size={12} />
                </Link>

                <Link
                  to="/wishlist"
                  className="btn text-start p-2 px-3 small border-0 text-muted d-flex align-items-center justify-content-between text-decoration-none hover-bg"
                  style={{ borderRadius: "var(--radius-md)" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <FiHeart size={15} /> <span>Saved Wishlist</span>
                  </div>
                  <FiArrowRight size={12} />
                </Link>

                {/* Merchant or Vendor Link */}
                {isVendor ? (
                  <Link
                    to="/vendor/dashboard"
                    className="btn text-start p-2 px-3 small border-0 text-dark fw-semibold d-flex align-items-center justify-content-between text-decoration-none hover-bg"
                    style={{ borderRadius: "var(--radius-md)" }}
                  >
                    <div className="d-flex align-items-center gap-2 text-success">
                      <FiBriefcase size={15} /> <span>Vendor Portal</span>
                    </div>
                    <FiExternalLink size={12} />
                  </Link>
                ) : !isAdmin ? (
                  <Link
                    to="/become-vendor"
                    className="btn text-start p-2 px-3 small border-0 text-dark fw-semibold d-flex align-items-center justify-content-between text-decoration-none hover-bg"
                    style={{ borderRadius: "var(--radius-md)" }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <FiBriefcase size={15} /> <span>Become a Vendor</span>
                    </div>
                    <FiArrowRight size={12} />
                  </Link>
                ) : null}

                {/* Admin Quick Link */}
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="btn text-start p-2 px-3 small border-0 text-dark fw-semibold d-flex align-items-center justify-content-between text-decoration-none hover-bg"
                    style={{ borderRadius: "var(--radius-md)" }}
                  >
                    <div className="d-flex align-items-center gap-2 text-primary">
                      <FiShield size={15} /> <span>Admin Console</span>
                    </div>
                    <FiExternalLink size={12} />
                  </Link>
                )}

                <div className="my-2 border-top" style={{ borderColor: "var(--card-border)" }} />

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="btn text-start p-2 px-3 small border-0 text-danger d-flex align-items-center gap-2"
                  style={{ borderRadius: "var(--radius-md)" }}
                >
                  <FiLogOut size={15} /> <span>Sign Out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* ── RIGHT MAIN PANEL: PROFILE CONTENT ── */}
          <main className="col-lg-8 col-xl-9">
            {/* Quick KPI Bar */}
            <div className="row g-3 mb-4">
              <div className="col-sm-4">
                <div
                  className="bg-white p-3 shadow-sm d-flex align-items-center gap-3"
                  style={{ borderRadius: "var(--radius-md)", border: "1px solid var(--card-border)" }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center text-white"
                    style={{ width: "42px", height: "42px", borderRadius: "var(--radius-md)", backgroundColor: "var(--emerald)" }}
                  >
                    <FiPackage size={18} />
                  </div>
                  <div>
                    <span className="small text-muted d-block" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Orders Placed
                    </span>
                    <Link to="/my-orders" className="fw-bold text-black text-decoration-none" style={{ fontSize: "1.1rem" }}>
                      View Orders &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-sm-4">
                <div
                  className="bg-white p-3 shadow-sm d-flex align-items-center gap-3"
                  style={{ borderRadius: "var(--radius-md)", border: "1px solid var(--card-border)" }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center text-white"
                    style={{ width: "42px", height: "42px", borderRadius: "var(--radius-md)", backgroundColor: "#BE123C" }}
                  >
                    <FiHeart size={18} />
                  </div>
                  <div>
                    <span className="small text-muted d-block" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Saved Items
                    </span>
                    <Link to="/wishlist" className="fw-bold text-black text-decoration-none" style={{ fontSize: "1.1rem" }}>
                      Wishlist &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-sm-4">
                <div
                  className="bg-white p-3 shadow-sm d-flex align-items-center gap-3"
                  style={{ borderRadius: "var(--radius-md)", border: "1px solid var(--card-border)" }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center text-white"
                    style={{ width: "42px", height: "42px", borderRadius: "var(--radius-md)", backgroundColor: "#0C1413" }}
                  >
                    <FiShield size={18} />
                  </div>
                  <div>
                    <span className="small text-muted d-block" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Security Status
                    </span>
                    <span className="fw-bold text-success" style={{ fontSize: "1.05rem" }}>
                      Active & Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form Card */}
            <div
              className="bg-white p-4 p-md-5 shadow-sm"
              style={{
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--card-border)",
              }}
            >
              {/* Header inside Form Card */}
              <div className="mb-4 pb-3 border-bottom" style={{ borderColor: "var(--card-border)" }}>
                <h3 className="font-serif fw-bold text-black mb-1">
                  {activeTab === "profile" && "Personal Identity & Contact"}
                  {activeTab === "address" && "Default Shipping & Billing Coordinates"}
                  {activeTab === "role" && "Security, Role & Permissions"}
                </h3>
                <p className="text-muted small mb-0">
                  {activeTab === "profile" && "Update your public display name, avatar, and active telephone line."}
                  {activeTab === "address" && "Your primary shipping destination used for one-click checkout fulfillment."}
                  {activeTab === "role" && "Inspect your authorization level, administrative badges, or merchant status."}
                </p>
              </div>

              {/* Alert Feedback */}
              {successMsg && (
                <div
                  className="alert py-3 px-4 small d-flex align-items-center gap-2 mb-4"
                  style={{
                    backgroundColor: "#ECFDF5",
                    border: "1px solid #A7F3D0",
                    color: "#065F46",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <FiCheck size={18} />
                  <span className="fw-medium">{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div
                  className="alert py-3 px-4 small d-flex align-items-center gap-2 mb-4"
                  style={{
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#991B1B",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <FiAlertCircle size={18} />
                  <span className="fw-medium">{errorMsg}</span>
                </div>
              )}

              {/* Active Tab: Profile or Address */}
              {activeTab !== "role" ? (
                <form onSubmit={handleSubmit}>
                  {activeTab === "profile" ? (
                    <>
                      {/* Name Fields */}
                      <div className="row g-3 mb-4">
                        <div className="col-sm-6">
                          <label className="form-label small fw-semibold text-black mb-1">
                            First Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="firstname"
                            className="form-control"
                            style={{ borderRadius: "var(--radius-md)", padding: "0.75rem 1rem" }}
                            value={formData.firstname}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label small fw-semibold text-black mb-1">
                            Last Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="lastname"
                            className="form-control"
                            style={{ borderRadius: "var(--radius-md)", padding: "0.75rem 1rem" }}
                            value={formData.lastname}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Email & Phone */}
                      <div className="row g-3 mb-4">
                        <div className="col-sm-6">
                          <label className="form-label small fw-semibold text-black mb-1">
                            Email Address <span className="text-muted fw-normal">(Registered)</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light text-muted border" style={{ borderRadius: "var(--radius-md) 0 0 var(--radius-md)" }}>
                              <FiMail size={15} />
                            </span>
                            <input
                              type="email"
                              className="form-control bg-light text-muted"
                              style={{ borderRadius: "0 var(--radius-md) var(--radius-md) 0", padding: "0.75rem 1rem" }}
                              value={formData.email}
                              disabled
                            />
                          </div>
                          <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                            Email cannot be modified for security compliance.
                          </span>
                        </div>

                        <div className="col-sm-6">
                          <label className="form-label small fw-semibold text-black mb-1">
                            Phone Number
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-white text-muted border" style={{ borderRadius: "var(--radius-md) 0 0 var(--radius-md)" }}>
                              <FiPhone size={15} />
                            </span>
                            <input
                              type="tel"
                              name="phone"
                              className="form-control"
                              style={{ borderRadius: "0 var(--radius-md) var(--radius-md) 0", padding: "0.75rem 1rem" }}
                              placeholder="+1 (555) 000-0000"
                              value={formData.phone}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Avatar Management */}
                      <div className="mb-4 p-3 bg-light" style={{ borderRadius: "var(--radius-md)", border: "1px dashed var(--card-border)" }}>
                        <label className="form-label small fw-semibold text-black mb-2 d-block">
                          Avatar Profile Imagery
                        </label>

                        <input
                          type="file"
                          ref={fileInputRef}
                          className="d-none"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageChange}
                          id="avatar-file-input"
                        />

                        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-dark d-inline-flex align-items-center gap-2 px-3 py-2"
                            style={{ borderRadius: "var(--radius-md)", fontSize: "0.82rem" }}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <FiCamera size={14} />
                            {formData.avatar ? "Upload New Photo" : "Upload Photo"}
                          </button>

                          {formData.avatar && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 px-3 py-2"
                              style={{ borderRadius: "var(--radius-md)", fontSize: "0.82rem" }}
                              onClick={handleRemoveAvatar}
                              title="Remove photo"
                            >
                              <FiTrash2 size={14} /> Remove Photo
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn btn-sm btn-link text-muted text-decoration-none d-inline-flex align-items-center gap-1"
                            style={{ fontSize: "0.82rem" }}
                            onClick={() => setShowUrlInput(!showUrlInput)}
                          >
                            <FiLink size={13} />
                            {showUrlInput ? "Hide Link Option" : "Provide Web URL"}
                          </button>
                        </div>

                        {showUrlInput && (
                          <div className="mt-3">
                            <input
                              type="url"
                              name="avatar"
                              className="form-control"
                              placeholder="https://images.unsplash.com/..."
                              style={{ borderRadius: "var(--radius-md)" }}
                              value={
                                typeof formData.avatar === "string" && formData.avatar.startsWith("data:")
                                  ? ""
                                  : formData.avatar || ""
                              }
                              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                            />
                            <span className="small text-muted mt-1 d-block" style={{ fontSize: "0.72rem" }}>
                              Provide any direct image URL (Gravatar, Cloudinary, Unsplash).
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Address Fields */}
                      <div className="mb-4">
                        <label className="form-label small fw-semibold text-black mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="street"
                          className="form-control"
                          style={{ borderRadius: "var(--radius-md)", padding: "0.75rem 1rem" }}
                          placeholder="424 Broadway, 5th Floor"
                          value={formData.street}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="row g-3 mb-4">
                        <div className="col-sm-6">
                          <label className="form-label small fw-semibold text-black mb-1">
                            City / Metro
                          </label>
                          <input
                            type="text"
                            name="city"
                            className="form-control"
                            style={{ borderRadius: "var(--radius-md)", padding: "0.75rem 1rem" }}
                            value={formData.city}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label small fw-semibold text-black mb-1">
                            State / Region
                          </label>
                          <input
                            type="text"
                            name="state"
                            className="form-control"
                            style={{ borderRadius: "var(--radius-md)", padding: "0.75rem 1rem" }}
                            value={formData.state}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="row g-3 mb-4">
                        <div className="col-sm-6">
                          <label className="form-label small fw-semibold text-black mb-1">
                            Country / Jurisdiction
                          </label>
                          <input
                            type="text"
                            name="country"
                            className="form-control"
                            style={{ borderRadius: "var(--radius-md)", padding: "0.75rem 1rem" }}
                            value={formData.country}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label small fw-semibold text-black mb-1">
                            Postal / ZIP Code
                          </label>
                          <input
                            type="text"
                            name="postalCode"
                            className="form-control"
                            style={{ borderRadius: "var(--radius-md)", padding: "0.75rem 1rem" }}
                            value={formData.postalCode}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <div className="pt-3 border-top d-flex align-items-center gap-3" style={{ borderColor: "var(--card-border)" }}>
                    <button
                      type="submit"
                      className="btn text-white px-5 py-3 fw-semibold shadow-sm transition-base"
                      style={{
                        backgroundColor: "var(--emerald)",
                        borderRadius: "var(--radius-md)",
                        letterSpacing: "0.02em",
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" />
                          Saving Persona...
                        </>
                      ) : (
                        "Save Profile Updates"
                      )}
                    </button>
                    <span className="text-muted small">
                      Changes propagate instantly across the platform.
                    </span>
                  </div>
                </form>
              ) : (
                /* Tab 3: Role & Privileges details */
                <div>
                  <div className="p-4 mb-4" style={{ backgroundColor: "#F9FAFB", borderRadius: "var(--radius-md)", border: "1px solid #E5E7EB" }}>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div
                        className="d-flex align-items-center justify-content-center text-white"
                        style={{ width: "48px", height: "48px", borderRadius: "var(--radius-md)", backgroundColor: isAdmin ? "var(--emerald)" : isVendor ? "#111827" : "#059669" }}
                      >
                        {isAdmin ? <FiShield size={24} /> : isVendor ? <FiBriefcase size={24} /> : <FiUser size={24} />}
                      </div>
                      <div>
                        <h5 className="font-serif fw-bold text-black mb-0">
                          {isAdmin ? "Super Administrator Authority" : isVendor ? "Verified Merchant Partner" : "Registered Client Persona"}
                        </h5>
                        <span className="small text-muted">
                          System User ID: <span className="font-monospace text-black">{user?._id || user?.id || "N/A"}</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-muted small mb-3">
                      {isAdmin && "You possess global administrative privileges over catalog items, order pipelines, user permissions, and vendor store approvals."}
                      {isVendor && "You possess merchant credentials with access to vendor catalog listings, order processing, and store telemetry."}
                      {!isAdmin && !isVendor && "You possess standard customer privileges with access to curated luxury shopping, secure checkout, and order tracking."}
                    </p>

                    <div className="d-flex flex-wrap gap-2 pt-2">
                      {isAdmin && (
                        <>
                          <span className="badge bg-white text-dark border px-3 py-2">Catalog Governance</span>
                          <span className="badge bg-white text-dark border px-3 py-2">User Access Control</span>
                          <span className="badge bg-white text-dark border px-3 py-2">Merchant Approvals</span>
                          <span className="badge bg-white text-dark border px-3 py-2">Financial Auditing</span>
                        </>
                      )}
                      {isVendor && (
                        <>
                          <span className="badge bg-white text-dark border px-3 py-2">Store Profile Customization</span>
                          <span className="badge bg-white text-dark border px-3 py-2">Product Catalog Publishing</span>
                          <span className="badge bg-white text-dark border px-3 py-2">Vendor Order Fulfillment</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions for role */}
                  <div className="d-flex gap-3">
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="btn text-white px-4 py-2 fw-semibold"
                        style={{ backgroundColor: "var(--emerald)", borderRadius: "var(--radius-md)" }}
                      >
                        Launch Admin Console &rarr;
                      </Link>
                    )}
                    {isVendor && (
                      <Link
                        to="/vendor/dashboard"
                        className="btn text-white px-4 py-2 fw-semibold"
                        style={{ backgroundColor: "#0C1413", borderRadius: "var(--radius-md)" }}
                      >
                        Launch Merchant Dashboard &rarr;
                      </Link>
                    )}
                    {!isAdmin && !isVendor && (
                      <Link
                        to="/become-vendor"
                        className="btn text-white px-4 py-2 fw-semibold"
                        style={{ backgroundColor: "var(--emerald)", borderRadius: "var(--radius-md)" }}
                      >
                        Apply for Merchant Credentials &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
