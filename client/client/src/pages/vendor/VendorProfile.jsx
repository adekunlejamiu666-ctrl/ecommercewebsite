import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiBriefcase,
  FiCheck,
  FiAlertCircle,
  FiPhone,
  FiMapPin,
  FiTag,
  FiFileText,
  FiCheckCircle,
  FiArrowLeft,
  FiExternalLink,
  FiShield,
  FiEye,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";

export default function VendorProfile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    businessName: "",
    businessCategory: "Fashion & Apparel",
    businessAddress: "",
    businessDescription: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        businessName: user.vendorProfile?.businessName || "",
        businessCategory: user.vendorProfile?.businessCategory || "Fashion & Apparel",
        businessAddress: user.vendorProfile?.businessAddress || "",
        businessDescription: user.vendorProfile?.businessDescription || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFeedback("");
    setLoading(true);

    try {
      const payload = {
        phone: formData.phone,
        vendorProfile: {
          businessName: formData.businessName,
          businessCategory: formData.businessCategory,
          businessAddress: formData.businessAddress,
          businessDescription: formData.businessDescription,
        },
      };

      const res = await authService.updateProfile(payload);
      if (res?.user) {
        updateUser(res.user);
      }
      setFeedback("Merchant store identity updated successfully.");
      setTimeout(() => setFeedback(""), 5000);
    } catch (err) {
      setError(err.message || "Failed to update store profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-profile-page" style={{ maxWidth: "1140px" }}>
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: "var(--card-border)" }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge-emerald">Merchant Persona</span>
            <span
              className="badge"
              style={{
                backgroundColor: "rgba(15, 118, 110, 0.12)",
                color: "var(--emerald)",
                borderRadius: "var(--radius-pill)",
                padding: "0.25rem 0.75rem",
                fontSize: "0.72rem",
                fontWeight: 700,
              }}
            >
              <FiShield className="me-1" /> VERIFIED MERCHANT
            </span>
          </div>
          <h1 className="h3 font-serif fw-bold text-black mb-1">
            Store Profile & Merchant Identity
          </h1>
          <p className="text-muted small mb-0">
            Customize your commercial storefront branding, artisan craft summary, and support channels.
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link
            to="/vendor/dashboard"
            className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-1 px-3 py-2"
            style={{ borderRadius: "var(--radius-md)" }}
          >
            <FiArrowLeft size={14} /> Back to Dashboard
          </Link>
          <Link
            to="/shop"
            className="btn btn-sm text-white d-inline-flex align-items-center gap-1 px-3 py-2"
            style={{ backgroundColor: "var(--emerald)", borderRadius: "var(--radius-md)" }}
          >
            <FiEye size={14} /> View Public Storefront
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {feedback && (
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
          <span className="fw-medium">{feedback}</span>
        </div>
      )}

      {error && (
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
          <span className="fw-medium">{error}</span>
        </div>
      )}

      <div className="row g-4">
        {/* ── LEFT: LIVE STORE PREVIEW CARD ── */}
        <div className="col-lg-4">
          <div
            className="bg-white p-4 shadow-sm h-100"
            style={{
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-uppercase small fw-bold" style={{ fontSize: "0.7rem", color: "var(--emerald)", letterSpacing: "0.08em" }}>
                Public Badge Preview
              </span>
              <span className="badge bg-light text-success border small" style={{ fontSize: "0.68rem" }}>
                Live
              </span>
            </div>

            {/* Store Card Preview */}
            <div
              className="p-4 mb-4 text-center position-relative overflow-hidden"
              style={{
                backgroundColor: "var(--hero-bg)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--card-border)",
              }}
            >
              <div
                className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center text-white shadow-sm"
                style={{ width: "64px", height: "64px", backgroundColor: "var(--emerald)" }}
              >
                <FiBriefcase size={28} />
              </div>

              <h4 className="font-serif fw-bold text-black mb-1">
                {formData.businessName || "Your Nexora House"}
              </h4>

              <span
                className="badge mb-2 d-inline-block px-3 py-1"
                style={{
                  backgroundColor: "rgba(15, 118, 110, 0.15)",
                  color: "var(--emerald)",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                }}
              >
                {formData.businessCategory || "Luxury Goods"}
              </span>

              <p className="text-muted small mb-0 px-2 line-clamp-3" style={{ fontSize: "0.82rem" }}>
                {formData.businessDescription || "Artisanal handcrafted luxury essentials created with sustainable mastery and uncompromising attention to detail."}
              </p>
            </div>

            {/* Metadata Checklist */}
            <div className="d-flex flex-column gap-3 small text-muted">
              <div className="d-flex align-items-center gap-2">
                <FiPhone className="text-black flex-shrink-0" size={15} />
                <span className="text-truncate">
                  {formData.phone ? formData.phone : "No support phone configured"}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <FiMapPin className="text-black flex-shrink-0" size={15} />
                <span className="text-truncate">
                  {formData.businessAddress ? formData.businessAddress : "No physical studio address"}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <FiCheckCircle className="text-success flex-shrink-0" size={15} />
                <span>Verified Artisan Merchant Badge Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: STORE CONFIGURATION FORM ── */}
        <div className="col-lg-8">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-4 p-md-5 shadow-sm"
            style={{
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <div className="row g-4 mb-4">
              <div className="col-12">
                <label className="form-label small fw-semibold text-black mb-1">
                  Store / Brand Name <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white text-muted border" style={{ borderRadius: "var(--radius-md) 0 0 var(--radius-md)" }}>
                    <FiBriefcase size={15} />
                  </span>
                  <input
                    type="text"
                    name="businessName"
                    required
                    className="form-control"
                    style={{ borderRadius: "0 var(--radius-md) var(--radius-md) 0", padding: "0.75rem 1rem" }}
                    placeholder="e.g. Nexora Maison"
                    value={formData.businessName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-black mb-1">
                  Commercial Category <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white text-muted border" style={{ borderRadius: "var(--radius-md) 0 0 var(--radius-md)" }}>
                    <FiTag size={15} />
                  </span>
                  <select
                    name="businessCategory"
                    className="form-select"
                    style={{ borderRadius: "0 var(--radius-md) var(--radius-md) 0", padding: "0.75rem 1rem" }}
                    value={formData.businessCategory}
                    onChange={handleChange}
                  >
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Luxury Bags & Leather">Luxury Bags & Leather</option>
                    <option value="Jewelry & Watches">Jewelry & Watches</option>
                    <option value="Footwear & Boots">Footwear & Boots</option>
                    <option value="Accessories & Silk">Accessories & Silk</option>
                    <option value="Artisanal Decor">Artisanal Decor</option>
                  </select>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-black mb-1">
                  Customer Support Telephone
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
                    placeholder="+1 (555) 019-2834"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-black mb-1">
                  Studio / Headquarters Physical Address
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white text-muted border" style={{ borderRadius: "var(--radius-md) 0 0 var(--radius-md)" }}>
                    <FiMapPin size={15} />
                  </span>
                  <input
                    type="text"
                    name="businessAddress"
                    className="form-control"
                    style={{ borderRadius: "0 var(--radius-md) var(--radius-md) 0", padding: "0.75rem 1rem" }}
                    placeholder="742 Evergreen Terrace, Suite 10, New York, NY"
                    value={formData.businessAddress}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-black mb-1">
                  Store Story & Craft Description
                </label>
                <textarea
                  name="businessDescription"
                  rows={4}
                  className="form-control"
                  style={{ borderRadius: "var(--radius-md)", padding: "0.75rem 1rem" }}
                  placeholder="Describe the heritage, materials, and artisan philosophy behind your offerings..."
                  value={formData.businessDescription}
                  onChange={handleChange}
                />
                <span className="small text-muted mt-1 d-block" style={{ fontSize: "0.72rem" }}>
                  This statement will be presented on your merchant collection headers and brand cards.
                </span>
              </div>
            </div>

            {/* Submit Action */}
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
                    Updating Storefront...
                  </>
                ) : (
                  "Save Store Profile"
                )}
              </button>
              <span className="text-muted small">
                Updates appear across the customer storefront instantly.
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
