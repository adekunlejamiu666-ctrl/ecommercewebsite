import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiBriefcase,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
  FiShield,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import vendorService from "../services/vendorService";

export default function BecomeVendor() {
  const { user, isAuthenticated, isVendor } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [reapplyMode, setReapplyMode] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    businessAddress: "",
    businessCategory: "Fashion & Apparel",
    businessDescription: "",
    productsToSell: "",
    yearsInBusiness: "1-2 Years",
    registrationNumber: "",
    storeLink: "",
    agreeTerms: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
      // Pre-fill user data
      setFormData((prev) => ({
        ...prev,
        fullName: `${user?.firstname || ""} ${user?.lastname || ""}`.trim(),
        email: user?.email || "",
        phone: user?.phone || "",
      }));

      // Check if user already submitted an application
      vendorService
        .getMyApplicationStatus()
        .then((res) => {
          if (res?.request) {
            setExistingRequest(res.request);
          }
        })
        .catch((err) => {
          console.warn("Could not fetch vendor request status:", err.message);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFeedback("");

    if (!formData.agreeTerms) {
      setError("You must agree to the merchant terms and conditions to proceed.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await vendorService.submitApplication(formData);
      setFeedback("Your application has been submitted successfully and is awaiting review.");
      setExistingRequest(res.request);
      setReapplyMode(false);
    } catch (err) {
      setError(err.message || "Failed to submit vendor application.");
    } finally {
      setSubmitting(false);
    }
  };

  // If user is not logged in
  if (!isAuthenticated) {
    return (
      <div className="container py-5 my-5 text-center">
        <div className="p-4 p-md-5 border-custom bg-white mx-auto shadow-sm" style={{ maxWidth: "560px" }}>
          <div className="p-3 bg-light-custom rounded-circle d-inline-flex text-black mb-3 border-custom">
            <FiBriefcase size={36} />
          </div>
          <h2 className="fw-bold text-black mb-2">Sell On Nexora</h2>
          <p className="text-muted small mb-4">
            You must be logged into a Nexora customer account to submit a vendor partnership application.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/login" className="btn btn-dark-custom rounded-0 px-4">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-outline-custom rounded-0 px-4">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If user is already a vendor
  if (isVendor || existingRequest?.status === "approved") {
    return (
      <div className="container py-5 my-5 text-center">
        <div className="p-4 p-md-5 border-custom bg-white mx-auto shadow-sm" style={{ maxWidth: "580px" }}>
          <div className="p-3 bg-light-custom rounded-circle d-inline-flex text-black mb-3 border-custom">
            <FiCheckCircle size={40} />
          </div>
          <span className="badge bg-black text-white text-uppercase d-block mx-auto mb-2" style={{ width: "fit-content", fontSize: "0.72rem" }}>
            Status: Approved
          </span>
          <h2 className="fw-bold text-black mb-2">You Are Now a Vendor!</h2>
          <p className="text-muted small mb-4">
            Your merchant credentials have been verified. You have full access to the vendor console to publish catalog items and fulfill customer orders.
          </p>
          <Link to="/vendor/dashboard" className="btn btn-dark-custom rounded-0 px-4 py-2">
            Go To Vendor Dashboard <FiArrowRight className="ms-2" />
          </Link>
        </div>
      </div>
    );
  }

  // If application is pending
  if (existingRequest && existingRequest.status === "pending" && !reapplyMode) {
    return (
      <div className="container py-5 my-5 text-center">
        <div className="p-4 p-md-5 border-custom bg-white mx-auto shadow-sm" style={{ maxWidth: "580px" }}>
          <div className="p-3 bg-light-custom rounded-circle d-inline-flex text-black mb-3 border-custom">
            <FiClock size={40} />
          </div>
          <span className="badge bg-light text-dark border d-block mx-auto mb-2 text-uppercase fw-semibold" style={{ width: "fit-content", fontSize: "0.72rem" }}>
            Status: Pending Review
          </span>
          <h2 className="fw-bold text-black mb-2">Application Under Review</h2>
          <p className="text-muted small mb-4">
            Your vendor application for <strong>{existingRequest.businessName}</strong> was submitted on{" "}
            {new Date(existingRequest.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            . Our administration team is currently reviewing your merchant profile.
          </p>
          <div className="p-3 bg-light-custom border-custom text-start small mb-4">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Business Name:</span>
              <strong className="text-black">{existingRequest.businessName}</strong>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Category:</span>
              <span className="text-black">{existingRequest.businessCategory}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Contact Email:</span>
              <span className="text-black font-monospace">{existingRequest.email}</span>
            </div>
          </div>
          <Link to="/" className="btn btn-outline-dark rounded-0 px-4">
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  // If application was rejected
  if (existingRequest && existingRequest.status === "rejected" && !reapplyMode) {
    return (
      <div className="container py-5 my-5 text-center">
        <div className="p-4 p-md-5 border-custom bg-white mx-auto shadow-sm" style={{ maxWidth: "580px" }}>
          <div className="p-3 bg-light-custom rounded-circle d-inline-flex text-black mb-3 border-custom">
            <FiXCircle size={40} />
          </div>
          <span className="badge bg-light text-dark border d-block mx-auto mb-2 text-uppercase fw-semibold" style={{ width: "fit-content", fontSize: "0.72rem" }}>
            Status: Rejected
          </span>
          <h2 className="fw-bold text-black mb-2">Application Not Approved</h2>
          <p className="text-muted small mb-3">
            Unfortunately, your previous vendor application could not be approved at this time.
          </p>

          {existingRequest.rejectionReason && (
            <div className="p-3 border border-dark bg-light-custom text-start small mb-4">
              <strong className="d-block mb-1 text-black">Reason Provided by Admin:</strong>
              <p className="text-muted mb-0">{existingRequest.rejectionReason}</p>
            </div>
          )}

          <div className="d-flex justify-content-center gap-3">
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  businessName: existingRequest.businessName || "",
                  businessAddress: existingRequest.businessAddress || "",
                  businessCategory: existingRequest.businessCategory || "Fashion & Apparel",
                  businessDescription: existingRequest.businessDescription || "",
                  productsToSell: existingRequest.productsToSell || "",
                }));
                setReapplyMode(true);
              }}
              className="btn btn-dark-custom rounded-0 px-4"
            >
              Apply Again
            </button>
            <Link to="/" className="btn btn-outline-custom rounded-0 px-4">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Application Form
  return (
    <div className="become-vendor py-5 bg-white">
      <div className="container" style={{ maxWidth: "800px" }}>
        {/* Header */}
        <div className="text-center mb-5">
          <span className="badge bg-black text-white text-uppercase px-3 py-1 mb-3" style={{ fontSize: "0.7rem", letterSpacing: "0.08em" }}>
            Merchant Partnership
          </span>
          <h1 className="h2 fw-bold text-black mb-2">Start Selling With Us</h1>
          <p className="text-muted small mx-auto mb-0" style={{ maxWidth: "560px" }}>
            Turn your products into a business. Submit your application and our team will review your request.
          </p>
        </div>

        {error && (
          <div className="alert alert-dark border-custom py-2 px-3 small d-flex align-items-center gap-2 mb-4">
            <FiAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {feedback && (
          <div className="alert alert-dark border-custom py-2 px-3 small d-flex align-items-center gap-2 mb-4">
            <FiCheck size={16} />
            <span>{feedback}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 p-md-5 border-custom bg-white shadow-sm" style={{ borderRadius: "2px" }}>
          <h5 className="fw-bold text-black mb-3 border-bottom-custom pb-2 small text-uppercase" style={{ letterSpacing: "0.05em" }}>
            1. Applicant & Store Details
          </h5>

          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-black">Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                className="form-control rounded-0 small border-custom"
                placeholder="e.g. Alexander Vance"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-black">Business Name *</label>
              <input
                type="text"
                name="businessName"
                required
                className="form-control rounded-0 small border-custom"
                placeholder="e.g. Vance Leathercraft Studio"
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-black">Business Email *</label>
              <input
                type="email"
                name="email"
                required
                className="form-control rounded-0 small border-custom"
                placeholder="merchant@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-black">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                required
                className="form-control rounded-0 small border-custom"
                placeholder="+234 800 000 0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold text-black">Business Physical Address *</label>
              <input
                type="text"
                name="businessAddress"
                required
                className="form-control rounded-0 small border-custom"
                placeholder="Store address, Suite, City, State, Country"
                value={formData.businessAddress}
                onChange={handleChange}
              />
            </div>
          </div>

          <h5 className="fw-bold text-black mb-3 border-bottom-custom pb-2 small text-uppercase" style={{ letterSpacing: "0.05em" }}>
            2. Business Category & Catalog
          </h5>

          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-black">Business Category *</label>
              <select
                name="businessCategory"
                className="form-select rounded-0 small border-custom"
                value={formData.businessCategory}
                onChange={handleChange}
              >
                <option value="Fashion & Apparel">Fashion & Apparel</option>
                <option value="Footwear & Leather">Footwear & Leather</option>
                <option value="Watches & Jewelry">Watches & Jewelry</option>
                <option value="Bags & Accessories">Bags & Accessories</option>
                <option value="Electronics & Audio">Electronics & Audio</option>
                <option value="Home & Living">Home & Living</option>
                <option value="Fragrance & Grooming">Fragrance & Grooming</option>
                <option value="Other Premium Goods">Other Premium Goods</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-black">Years in Business</label>
              <select
                name="yearsInBusiness"
                className="form-select rounded-0 small border-custom"
                value={formData.yearsInBusiness}
                onChange={handleChange}
              >
                <option value="New Store (&lt; 1 Year)">New Store (&lt; 1 Year)</option>
                <option value="1-2 Years">1-2 Years</option>
                <option value="3-5 Years">3-5 Years</option>
                <option value="5+ Years">5+ Years Established</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold text-black">What products do you plan to sell? *</label>
              <input
                type="text"
                name="productsToSell"
                required
                className="form-control rounded-0 small border-custom"
                placeholder="e.g. Handcrafted boots, Italian leather cardholders, canvas weekenders..."
                value={formData.productsToSell}
                onChange={handleChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold text-black">Business & Brand Description *</label>
              <textarea
                name="businessDescription"
                required
                rows={4}
                className="form-control rounded-0 small border-custom"
                placeholder="Briefly describe your brand identity, production standards, and origin..."
                value={formData.businessDescription}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-black">
                Registration / CAC Number <span className="text-muted fw-normal">(Optional)</span>
              </label>
              <input
                type="text"
                name="registrationNumber"
                className="form-control rounded-0 small border-custom"
                placeholder="RC-0000000"
                value={formData.registrationNumber}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-black">
                Existing Website / Instagram Link <span className="text-muted fw-normal">(Optional)</span>
              </label>
              <input
                type="url"
                name="storeLink"
                className="form-control rounded-0 small border-custom"
                placeholder="https://instagram.com/yourbrand"
                value={formData.storeLink}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-check mb-4">
            <input
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              required
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="form-check-input rounded-0 border-custom"
            />
            <label htmlFor="agreeTerms" className="form-check-label small text-muted">
              I agree to the Nexora Merchant Operating Guidelines and declare that all goods listed will be genuine and meet platform quality standards.
            </label>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            {reapplyMode && (
              <button
                type="button"
                className="btn btn-outline-dark btn-sm rounded-0"
                onClick={() => setReapplyMode(false)}
              >
                Cancel Re-application
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-dark-custom rounded-0 py-2 px-4 ms-auto"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
