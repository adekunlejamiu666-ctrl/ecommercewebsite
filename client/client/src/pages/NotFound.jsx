import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiCompass } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="not-found-page py-5 bg-white min-vh-75 d-flex align-items-center text-center">
      <div className="container py-5">
        <div className="p-3 border-custom rounded-circle d-inline-flex bg-light-custom text-black mb-4">
          <FiCompass size={40} />
        </div>
        <h1 className="display-1 fw-bolder text-black mb-2" style={{ letterSpacing: "-0.04em" }}>
          404
        </h1>
        <h2 className="h4 fw-bold text-black mb-3">Page Not Located</h2>
        <p className="text-medium small mx-auto mb-4" style={{ maxWidth: "440px" }}>
          The path you attempted to reach does not correspond with an active catalog or collection page.
        </p>
        <Link to="/" className="btn btn-dark-custom px-4 py-3">
          <FiArrowLeft /> Return to Home
        </Link>
      </div>
    </div>
  );
}
