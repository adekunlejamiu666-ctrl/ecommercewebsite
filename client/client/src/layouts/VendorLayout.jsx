import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiBox,
  FiPlus,
  FiShoppingBag,
  FiBriefcase,
  FiArrowLeft,
  FiLogOut,
  FiShield,
  FiMenu,
  FiX,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function VendorLayout() {
  const { user, isVendor, isAdmin, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle ESC key and background body scroll lock on mobile
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Guard: Must be logged in and role must be vendor or admin
  const hasAccess = isAuthenticated && (isVendor || isAdmin);

  if (!hasAccess) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="py-5">
          <div className="p-3 border rounded-circle d-inline-flex bg-white text-black mb-3 shadow-sm">
            <FiShield size={36} style={{ color: "var(--emerald)" }} />
          </div>
          <h2 className="font-serif fw-bold text-black mb-2">Vendor Portal Restricted</h2>
          <p className="text-muted small mb-4">
            This merchant control console is strictly reserved for verified Nexora Vendors.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link
              to="/become-vendor"
              className="btn text-white px-4 py-2"
              style={{ backgroundColor: "var(--emerald)", borderRadius: "var(--radius-md)" }}
            >
              Apply to Become a Vendor
            </Link>
            <Link
              to="/"
              className="btn btn-outline-dark px-4 py-2"
              style={{ borderRadius: "var(--radius-md)" }}
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: "Dashboard", path: "/vendor/dashboard", icon: <FiGrid size={16} /> },
    { label: "My Products", path: "/vendor/products", icon: <FiBox size={16} /> },
    { label: "Add Product", path: "/vendor/products/add", icon: <FiPlus size={16} /> },
    { label: "Vendor Orders", path: "/vendor/orders", icon: <FiShoppingBag size={16} /> },
    { label: "Store Profile", path: "/vendor/profile", icon: <FiBriefcase size={16} /> },
    { label: "Personal Profile", path: "/profile", icon: <FiUser size={16} /> },
  ];

  return (
    <div className="vendor-layout d-flex min-vh-100" style={{ backgroundColor: "var(--ivory-bg)", overflowX: "hidden" }}>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="d-md-none"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(12, 20, 19, 0.6)",
            zIndex: 1040,
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* LEFT VENDOR SIDEBAR (Sticky on desktop, drawer on mobile) */}
      <aside
        className={`bg-white border-end d-flex flex-column ${
          mobileMenuOpen ? "d-flex" : "d-none d-md-flex"
        }`}
        style={{
          width: "250px",
          maxWidth: "85vw",
          flexShrink: 0,
          position: mobileMenuOpen ? "fixed" : "sticky",
          top: 0,
          left: 0,
          bottom: 0,
          height: "100vh",
          zIndex: 1050,
          borderColor: "var(--card-border)",
          boxShadow: mobileMenuOpen ? "0 0 32px rgba(0,0,0,0.25)" : "none",
          transition: "transform 0.25s ease-in-out",
        }}
      >
        {/* Brand Header */}
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center flex-shrink-0" style={{ borderColor: "var(--card-border)" }}>
          <Link
            to="/vendor/dashboard"
            className="text-decoration-none text-black"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="font-serif fw-bold fs-5 text-uppercase" style={{ letterSpacing: "0.12em", color: "var(--text-heading)" }}>
              NEXORA<span style={{ color: "var(--emerald)" }}>.</span>
            </span>
            <span
              className="badge ms-2"
              style={{
                backgroundColor: "#0C1413",
                color: "#E5E7EB",
                borderRadius: "var(--radius-pill)",
                fontSize: "0.62rem",
                fontWeight: 700,
              }}
            >
              VENDOR
            </span>
          </Link>
          <button
            type="button"
            className="btn btn-sm btn-light border d-md-none p-1 rounded"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Menu Items with Independent Scroll */}
        <nav className="p-3 d-flex flex-column gap-1 flex-grow-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/vendor/dashboard" && item.path !== "/profile" && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`d-flex align-items-center gap-3 p-2 px-3 small text-decoration-none transition-base ${
                  isActive
                    ? "text-white fw-semibold shadow-sm"
                    : "text-dark hover-bg"
                }`}
                style={{
                  borderRadius: "var(--radius-md)",
                  backgroundColor: isActive ? "var(--emerald)" : "transparent",
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions (Pinned at bottom of sidebar) */}
        <div className="p-3 border-top d-flex flex-column gap-1 flex-shrink-0" style={{ borderColor: "var(--card-border)" }}>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="d-flex align-items-center gap-2 p-2 small text-muted text-decoration-none hover-bg"
            style={{ borderRadius: "var(--radius-md)" }}
          >
            <FiArrowLeft size={14} /> Back to Storefront
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="btn btn-link text-danger text-start p-2 small text-decoration-none d-flex align-items-center gap-2"
          >
            <FiLogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN AREA */}
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0, width: "100%" }}>
        {/* Header Bar */}
        <header
          className="p-3 px-3 px-sm-4 border-bottom d-flex justify-content-between align-items-center bg-white sticky-top flex-shrink-0"
          style={{ borderColor: "var(--card-border)", zIndex: 1020 }}
        >
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-light border d-md-none d-inline-flex align-items-center justify-content-center p-2 rounded"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu size={18} />
            </button>
            <span className="text-muted small text-truncate" style={{ maxWidth: "280px" }}>
              Merchant Operations & Store Portal
            </span>
          </div>

          <Link
            to="/profile"
            className="d-flex align-items-center gap-2 gap-sm-3 text-decoration-none p-1 px-2 rounded hover-bg"
            title="Click to view & edit Profile"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.firstname}
                className="rounded-circle object-fit-cover shadow-sm"
                style={{ width: "32px", height: "32px", border: "2px solid var(--emerald)" }}
              />
            ) : (
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white"
                style={{ width: "32px", height: "32px", backgroundColor: "var(--emerald)" }}
              >
                <FiUser size={16} />
              </div>
            )}
            <span className="small text-black fw-semibold d-none d-sm-inline">
              {user?.firstname} {user?.lastname}
            </span>
            <span
              className="badge"
              style={{
                backgroundColor: "rgba(15, 118, 110, 0.12)",
                color: "var(--emerald)",
                borderRadius: "var(--radius-pill)",
                fontSize: "0.65rem",
                fontWeight: 700,
              }}
            >
              VERIFIED VENDOR
            </span>
          </Link>
        </header>

        {/* Outlet */}
        <main className="p-3 p-sm-4 p-lg-5 flex-grow-1" style={{ overflowX: "hidden" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
