import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiAlertCircle, FiCheck, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

// Strong password: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&^()\-_=+])[A-Za-z\d@#$!%*?&^()\-_=+]{8,}$/;

function getPasswordStrength(password) {
  if (!password) return null;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@#$!%*?&^()\-_=+]/.test(password),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  if (passed <= 2) return { label: "Weak", color: "#EF4444", width: "33%" };
  if (passed <= 4) return { label: "Fair", color: "#F59E0B", width: "66%" };
  return { label: "Strong", color: "#10B981", width: "100%" };
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

  const validateName = (name, fieldName) => {
    const trimmed = name ? name.trim() : "";
    if (!trimmed) return `${fieldName} is required.`;
    if (/\d/.test(trimmed))
      return `${fieldName} cannot contain numbers. Only letters are allowed.`;
    if (!/^[A-Za-z]+$/.test(trimmed))
      return `${fieldName} must contain only letters.`;
    if (trimmed.length <= 3)
      return `${fieldName} must be more than 3 letters long.`;
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") setPasswordTouched(true);

    if (name === "firstname" || name === "lastname") {
      const fieldName = name === "firstname" ? "First name" : "Last name";
      if (/\d/.test(value)) {
        setError(`${fieldName} cannot contain numbers. Only letters are allowed.`);
      } else if (
        value.trim().length > 0 &&
        !/^[A-Za-z]+$/.test(value.trim())
      ) {
        setError(`${fieldName} must contain only letters.`);
      } else if (
        error &&
        (error.includes("First name") || error.includes("Last name"))
      ) {
        setError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const firstnameError = validateName(formData.firstname, "First name");
    if (firstnameError) return setError(firstnameError);

    const lastnameError = validateName(formData.lastname, "Last name");
    if (lastnameError) return setError(lastnameError);

    // Strong password enforcement (frontend)
    if (!STRONG_PASSWORD_REGEX.test(formData.password)) {
      return setError(
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character (e.g. @, #, $, !)."
      );
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);

    try {
      await register({
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        password: formData.password,
        avatar: "",
      });

      setSuccess("Account successfully created! Welcome to Nexora.");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const requirementMet = (regex) =>
    regex.test(formData.password)
      ? { color: "#10B981", icon: "✓" }
      : { color: "#9CA3AF", icon: "○" };

  return (
    <div className="py-5 bg-white min-vh-75 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-9 col-lg-6">
            <div
              className="p-4 p-md-5 border-custom bg-white shadow-sm"
              style={{ borderRadius: "2px" }}
            >
              <div className="text-center mb-4">
                <p
                  className="text-uppercase small mb-1"
                  style={{
                    letterSpacing: "0.1em",
                    color: "var(--color-medium-gray)",
                  }}
                >
                  NEW CLIENTELE
                </p>
                <h1 className="h3 fw-bold text-black mb-2">Create Account</h1>
                <p className="text-muted small mb-0">
                  Register to enjoy streamlined checkout, curated drops, and
                  order tracking.
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
                {/* Name Fields */}
                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-black mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstname"
                      className="form-control"
                      placeholder="e.g. John"
                      value={formData.firstname}
                      onChange={handleChange}
                      required
                    />
                    <div
                      className="form-text small text-muted"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Must be more than 3 letters (letters only)
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-black mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastname"
                      className="form-control"
                      placeholder="e.g. Doe"
                      value={formData.lastname}
                      onChange={handleChange}
                      required
                    />
                    <div
                      className="form-text small text-muted"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Must be more than 3 letters (letters only)
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-black mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Password Fields */}
                <div className="row g-3 mb-2">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-black mb-1">
                      Password
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="form-control pe-5"
                        placeholder="Min. 8 chars"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-sm position-absolute end-0 top-50 translate-middle-y text-muted border-0 bg-transparent px-3"
                        tabIndex={-1}
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-black mb-1">
                      Confirm Password
                    </label>
                    <div className="position-relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        className="form-control pe-5"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-sm position-absolute end-0 top-50 translate-middle-y text-muted border-0 bg-transparent px-3"
                        tabIndex={-1}
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password strength meter + requirements */}
                {passwordTouched && formData.password && (
                  <div
                    className="mb-3 p-3 rounded"
                    style={{
                      backgroundColor: "#F9FAFB",
                      border: "1px solid #E5E7EB",
                      fontSize: "0.78rem",
                    }}
                  >
                    {/* Strength bar */}
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-muted">Password strength</span>
                      <span
                        className="fw-semibold"
                        style={{ color: passwordStrength?.color }}
                      >
                        {passwordStrength?.label}
                      </span>
                    </div>
                    <div
                      className="rounded-pill mb-2"
                      style={{
                        height: "4px",
                        backgroundColor: "#E5E7EB",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: passwordStrength?.width || "0%",
                          backgroundColor: passwordStrength?.color,
                          transition: "width 0.3s ease, background-color 0.3s ease",
                          borderRadius: "inherit",
                        }}
                      />
                    </div>

                    {/* Requirements checklist */}
                    <div className="row g-1">
                      {[
                        { label: "At least 8 characters", check: /.{8,}/ },
                        { label: "One uppercase letter (A–Z)", check: /[A-Z]/ },
                        { label: "One lowercase letter (a–z)", check: /[a-z]/ },
                        { label: "One number (0–9)", check: /\d/ },
                        {
                          label: "One special character (@, #, $, !…)",
                          check: /[@#$!%*?&^()\-_=+]/,
                        },
                      ].map(({ label, check }) => {
                        const { color, icon } = requirementMet(check);
                        return (
                          <div key={label} className="col-12">
                            <span style={{ color, fontWeight: 600 }}>
                              {icon}
                            </span>{" "}
                            <span style={{ color: "#6B7280" }}>{label}</span>
                          </div>
                        );
                      })}
                    </div>

                    <p
                      className="mt-2 mb-0 text-muted"
                      style={{ fontSize: "0.72rem" }}
                    >
                      Example: <code>Shopper@123</code>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-dark-custom w-100 py-3"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              <div className="text-center mt-4 pt-3 border-top-custom">
                <p className="small text-muted mb-0">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-black fw-bold text-decoration-underline ms-1"
                  >
                    Sign In
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
