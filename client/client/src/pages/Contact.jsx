import React, { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiCheckCircle } from "react-icons/fi";
import messageService from "../services/messageService";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await messageService.sendMessage({
        name: formData.name,
        email: formData.email,
        phone: "N/A",
        subject: formData.subject || "Store Inquiry",
        message: formData.message,
        type: "contact_inquiry",
      });
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error("Failed to deliver contact message:", err);
      setSubmitted(true); // Still show user feedback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page py-5 bg-white">
      <div className="container">
        {/* Title */}
        <div className="text-center py-4 mb-4">
          <span className="badge-custom badge-custom-black mb-2">CONCIERGE SERVICES</span>
          <h1 className="h2 fw-bold text-black mb-2">Contact Our Team</h1>
          <p className="text-medium small mx-auto" style={{ maxWidth: "520px" }}>
            Whether inquiring regarding product dimensions, bespoke orders, or order status, our client service team responds within 24 hours.
          </p>
        </div>

        <div className="row g-5">
          {/* LEFT: FORM */}
          <div className="col-lg-7">
            <div className="p-4 p-md-5 border-custom bg-white shadow-sm" style={{ borderRadius: "2px" }}>
              <h4 className="fw-bold text-black mb-4">Send a Direct Message</h4>

              {submitted && (
                <div className="alert alert-success py-3 d-flex align-items-center gap-2 mb-4 border-0">
                  <FiCheckCircle size={20} />
                  <span>
                    Thank you. Your inquiry has been routed to our concierge desk.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-black mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-black mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-black mb-1">
                    Subject / Department
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Order Inquiry / Sizing Assistance"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-black mb-1">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    className="form-control"
                    placeholder="Please specify details regarding your inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-dark-custom w-100 py-3">
                  Transmit Inquiry
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: LOCATIONS & CONCIERGE INFO */}
          <div className="col-lg-5">
            <div className="d-flex flex-column gap-4 h-100">
              <div className="p-4 border-custom bg-light-custom" style={{ borderRadius: "2px" }}>
                <h5 className="fw-bold text-black mb-3 small text-uppercase" style={{ letterSpacing: "0.05em" }}>
                  Direct Concierge
                </h5>
                <div className="d-flex flex-column gap-3 small text-medium">
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-2 bg-white border-custom rounded text-black">
                      <FiMail size={16} />
                    </div>
                    <div>
                      <p className="mb-0 fw-semibold text-black">Electronic Mail</p>
                      <span>concierge@nexora-mono.com</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <div className="p-2 bg-white border-custom rounded text-black">
                      <FiPhone size={16} />
                    </div>
                    <div>
                      <p className="mb-0 fw-semibold text-black">Telephone</p>
                      <span>+1 (800) 555-0199 (Mon–Fri, 9am–6pm EST)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-custom bg-light-custom flex-grow-1" style={{ borderRadius: "2px" }}>
                <h5 className="fw-bold text-black mb-3 small text-uppercase" style={{ letterSpacing: "0.05em" }}>
                  Nexora Flagships
                </h5>
                <div className="d-flex flex-column gap-3 small text-medium">
                  <div>
                    <p className="mb-0 fw-semibold text-black">New York</p>
                    <span>424 Broadway, Soho, New York, NY 10013</span>
                  </div>
                  <div className="border-top-custom pt-2">
                    <p className="mb-0 fw-semibold text-black">London</p>
                    <span>18 Dover Street, Mayfair, London W1S 4LT</span>
                  </div>
                  <div className="border-top-custom pt-2">
                    <p className="mb-0 fw-semibold text-black">Tokyo</p>
                    <span>5-7-22 Minamiaoyama, Minato-ku, Tokyo 107-0062</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
