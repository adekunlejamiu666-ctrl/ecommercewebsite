import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiAlertCircle, FiCheck, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

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

  const validateName = (name, fieldName) => {
    const trimmed = name ? name.trim() : "";
    if (!trimmed) {
      return `${fieldName} is required.`;
    }
    if (/\d/.test(trimmed)) {
      return `${fieldName} cannot contain numbers. Only letters are allowed.`;
    }
    if (!/^[A-Za-z]+$/.test(trimmed)) {
      return `${fieldName} must contain only letters.`;
    }
    if (trimmed.length <= 3) {
      return `${fieldName} must be more than 3 letters long.`;
    }
    return null;
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "firstname" || name === "lastname") {
      const fieldName = name === "firstname" ? "First name" : "Last name";
      if (/\d/.test(value)) {
        setError(`${fieldName} cannot contain numbers. Only letters are allowed.`);
      } else if (value.trim().length > 0 && !/^[A-Za-z]+$/.test(value.trim())) {
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
    if (firstnameError) {
      return setError(firstnameError);
    }

    const lastnameError = validateName(formData.lastname, "Last name");
    if (lastnameError) {
      return setError(lastnameError);
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters in length.");
    }

    setLoading(true);

    try {
      await register({
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        password: formData.password,
        avatar: formData.avatar ? formData.avatar.trim() : "",
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

  return (
    <div className="py-5 bg-white min-vh-75 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-9 col-lg-6">
            <div className="p-4 p-md-5 border-custom bg-white shadow-sm" style={{ borderRadius: "2px" }}>
              <div className="text-center mb-4">
                <p className="text-uppercase small mb-1" style={{ letterSpacing: "0.1em", color: "var(--color-medium-gray)" }}>
                  NEW CLIENTELE
                </p>
                <h1 className="h3 fw-bold text-black mb-2">Create Account</h1>
                <p className="text-muted small mb-0">
                  Register to enjoy streamlined checkout, curated drops, and order tracking.
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
                    <div className="form-text small text-muted" style={{ fontSize: "0.75rem" }}>
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
                    <div className="form-text small text-muted" style={{ fontSize: "0.75rem" }}>
                      Must be more than 3 letters (letters only)
                    </div>
                  </div>
                </div>

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

                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-black mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Min. 6 chars"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-black mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

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
