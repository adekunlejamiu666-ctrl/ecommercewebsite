import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiArrowRight, FiLock, FiMail, FiAlertCircle, FiCheck } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // If redirected from a protected route, remember where user was going
  const redirectPath = location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await login(email, password);
      setSuccess("Authentication successful. Redirecting...");
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 800);
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
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
                  NEXORA CLIENTELE
                </p>
                <h1 className="h3 fw-bold text-black mb-2">Sign In</h1>
                <p className="text-muted small mb-0">
                  Access your orders, saved wishlist, and concierge services.
                </p>
              </div>

              {error && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3 border-0">
                  <FiAlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3 border-0">
                  <FiCheck size={16} />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-black mb-1">
                    Email Address
                  </label>
                  <div className="position-relative">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-semibold text-black mb-0">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-muted small text-decoration-underline"
                      style={{ fontSize: "0.78rem" }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-dark-custom w-100 py-3 mt-2"
                  disabled={loading}
                >
                  {loading ? "Authenticating..." : "Sign In"}
                </button>
              </form>

              <div className="text-center mt-4 pt-3 border-top-custom">
                <p className="small text-muted mb-0">
                  Do not have an account?{" "}
                  <Link
                    to="/register"
                    className="text-black fw-bold text-decoration-underline ms-1"
                  >
                    Create an Account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
