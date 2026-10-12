import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { FiAlertCircle, FiCheck, FiArrowLeft } from "react-icons/fi";
import authService from "../services/authService";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters in length.");
    }

    setLoading(true);

    try {
      const data = await authService.resetPassword(token, password);
      setMessage(data.message || "Password updated successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password. Link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="py-5">
          <h2 className="fw-bold text-black mb-2">Invalid or Missing Token</h2>
          <p className="text-muted small mb-4">
            The password reset link is invalid or incomplete. Please request a new link.
          </p>
          <Link to="/forgot-password" className="btn btn-dark-custom">
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 bg-white min-vh-75 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="p-4 p-md-5 border-custom bg-white shadow-sm" style={{ borderRadius: "2px" }}>
              <div className="text-center mb-4">
                <p className="text-uppercase small mb-1" style={{ letterSpacing: "0.1em", color: "var(--color-medium-gray)" }}>
                  ACCOUNT SECURITY
                </p>
                <h1 className="h3 fw-bold text-black mb-2">Create New Password</h1>
                <p className="text-muted small mb-0">
                  Please enter your new password below.
                </p>
              </div>

              {error && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3 border-0">
                  <FiAlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3 border-0">
                  <FiCheck size={16} />
                  <span>{message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-black mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Min. 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-black mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-dark-custom w-100 py-3"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>

              <div className="text-center mt-4 pt-3 border-top-custom">
                <Link
                  to="/login"
                  className="text-black small text-decoration-none d-inline-flex align-items-center gap-2"
                >
                  <FiArrowLeft /> Return to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
