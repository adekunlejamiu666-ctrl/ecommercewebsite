import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle, FiCheck, FiArrowLeft } from "react-icons/fi";
import authService from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetToken("");
    setLoading(true);

    try {
      const data = await authService.forgotPassword(email);
      setMessage(data.message || "Password reset token generated.");
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    } catch (err) {
      setError(err.message || "Failed to process password reset request.");
    } finally {
      setLoading(false);
    }
  };

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
                <h1 className="h3 fw-bold text-black mb-2">Reset Password</h1>
                <p className="text-muted small mb-0">
                  Enter your email address to receive password recovery instructions.
                </p>
              </div>

              {error && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3 border-0">
                  <FiAlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="alert alert-success py-2 small d-flex flex-column gap-2 mb-3 border-0">
                  <div className="d-flex align-items-center gap-2">
                    <FiCheck size={16} />
                    <span>{message}</span>
                  </div>
                  {resetToken && (
                    <div className="mt-2 pt-2 border-top border-success-subtle">
                      <p className="mb-1 small">
                        <strong>Test Link:</strong> Click below to set a new password:
                      </p>
                      <Link
                        to={`/reset-password?token=${resetToken}`}
                        className="btn btn-sm btn-dark text-white text-decoration-none small"
                      >
                        Proceed to Reset Password
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-black mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-dark-custom w-100 py-3"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
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
