import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiSearch,
  FiHeart,
  FiShoppingBag,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
  FiPackage,
  FiShield,
  FiBriefcase,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isVendor, logout } = useAuth();
  const { totalItems } = useCart();
  const { totalWishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/shop" },
    { label: "Categories", path: "/categories" },
    { label: "New Arrivals", path: "/shop?sort=newest" },
    { label: "Deals", path: "/shop?deals=true" },
  ];

  const isActiveLink = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="navbar-custom">
      {/* Top Banner Announcement */}
      <div className="bg-near-black text-center py-1 px-3">
        <p className="mb-0 text-white" style={{ fontSize: "0.78rem", letterSpacing: "0.06em" }}>
          COMPLIMENTARY WORLDWIDE SHIPPING ON ORDERS OVER ₦50,000 &bull; EXCLUSIVE ESSENTIALS
        </p>
      </div>

      {/* Main Navigation Bar */}
      <div className="container py-3">
        <div className="d-flex align-items-center justify-content-between gap-3">
          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="btn btn-link text-dark d-lg-none p-0 border-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Brand Logo */}
          <Link
            to="/"
            className="d-flex align-items-center text-decoration-none"
            style={{ letterSpacing: "0.15em" }}
          >
            <span className="fw-bolder fs-4 text-black text-uppercase">
              NEXORA<span style={{ fontWeight: 300 }}>.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="d-none d-lg-flex align-items-center gap-1 mx-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className={`nav-link-custom ${isActiveLink(link.path) ? "active fw-semibold" : ""
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="d-none d-md-flex align-items-center position-relative flex-grow-1 mx-2"
            style={{ maxWidth: "320px" }}
          >
            <input
              type="text"
              className="form-control form-control-sm pe-5"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                borderRadius: "2px",
                fontSize: "0.85rem",
                paddingTop: "0.45rem",
                paddingBottom: "0.45rem",
              }}
            />
            <button
              type="submit"
              className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-dark pe-3 border-0"
              style={{ background: "transparent" }}
              aria-label="Search"
            >
              <FiSearch size={16} />
            </button>
          </form>

          {/* Right Action Icons (Wishlist, Cart, User) */}
          <div className="d-flex align-items-center gap-3">
            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="position-relative text-dark p-1 d-flex align-items-center text-decoration-none"
              title="Wishlist"
            >
              <FiHeart size={20} />
              {totalWishlist > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-black text-white"
                  style={{ fontSize: "0.65rem", padding: "0.25em 0.45em" }}
                >
                  {totalWishlist}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="position-relative text-dark p-1 d-flex align-items-center text-decoration-none"
              title="Shopping Cart"
            >
              <FiShoppingBag size={20} />
              {totalItems > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-black text-white"
                  style={{ fontSize: "0.65rem", padding: "0.25em 0.45em" }}
                >
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Account Dropdown */}
            <div className="position-relative">
              {isAuthenticated ? (
                <div>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-dark p-1 d-flex align-items-center gap-1 border-0 text-decoration-none"
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    onBlur={() => setTimeout(() => setAccountDropdownOpen(false), 200)}
                    aria-label="User Account"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user?.firstname || "Account"}
                        className="rounded-circle object-fit-cover border"
                        style={{ width: "24px", height: "24px" }}
                      />
                    ) : (
                      <FiUser size={20} />
                    )}
                    <span
                      className="d-none d-sm-inline fw-semibold"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {user?.firstname || "Account"}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {accountDropdownOpen && (
                    <div
                      className="position-absolute end-0 mt-2 py-2 bg-white border-custom shadow-lg"
                      style={{
                        minWidth: "200px",
                        zIndex: 1050,
                        borderRadius: "2px",
                      }}
                    >
                      <div className="px-3 py-2 border-bottom-custom mb-1 d-flex align-items-center gap-2">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user?.firstname || "Account"}
                            className="rounded-circle object-fit-cover border"
                            style={{ width: "36px", height: "36px", flexShrink: 0 }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-light border d-flex align-items-center justify-content-center text-dark fw-bold"
                            style={{ width: "36px", height: "36px", fontSize: "0.85rem", flexShrink: 0 }}
                          >
                            {(user?.firstname?.[0] || "U").toUpperCase()}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="mb-0 fw-bold text-black small text-truncate">
                            {user?.firstname} {user?.lastname}
                          </p>
                          <p className="mb-0 text-muted text-truncate" style={{ fontSize: "0.75rem" }}>
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        className="d-flex align-items-center gap-2 px-3 py-2 text-dark text-decoration-none small hover-bg"
                        onClick={() => setAccountDropdownOpen(false)}
                      >
                        <FiUser size={14} /> My Profile
                      </Link>

                      <Link
                        to="/my-orders"
                        className="d-flex align-items-center gap-2 px-3 py-2 text-dark text-decoration-none small hover-bg"
                        onClick={() => setAccountDropdownOpen(false)}
                      >
                        <FiPackage size={14} /> My Orders
                      </Link>

                      {isVendor ? (
                        <Link
                          to="/vendor/dashboard"
                          className="d-flex align-items-center gap-2 px-3 py-2 text-dark text-decoration-none small hover-bg border-top-custom mt-1"
                          onClick={() => setAccountDropdownOpen(false)}
                        >
                          <FiBriefcase size={14} /> Vendor Dashboard
                        </Link>
                      ) : !isAdmin ? (
                        <Link
                          to="/become-vendor"
                          className="d-flex align-items-center gap-2 px-3 py-2 text-dark text-decoration-none small hover-bg border-top-custom mt-1"
                          onClick={() => setAccountDropdownOpen(false)}
                        >
                          <FiBriefcase size={14} /> Become a Vendor
                        </Link>
                      ) : null}

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="d-flex align-items-center gap-2 px-3 py-2 text-dark text-decoration-none small hover-bg border-top-custom mt-1"
                          onClick={() => setAccountDropdownOpen(false)}
                        >
                          <FiShield size={14} /> Admin Dashboard
                        </Link>
                      )}

                      <div className="border-top-custom my-1"></div>

                      <button
                        type="button"
                        className="btn btn-link text-danger w-100 text-start px-3 py-2 text-decoration-none small d-flex align-items-center gap-2"
                        onClick={() => {
                          logout();
                          navigate("/login");
                        }}
                      >
                        <FiLogOut size={14} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Link
                    to="/login"
                    className="btn btn-sm btn-outline-custom py-1 px-3"
                    style={{ fontSize: "0.82rem" }}
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar & Menu Drawer */}
        {mobileMenuOpen && (
          <div className="pt-3 pb-2 border-top-custom mt-3 d-lg-none animate-fade-in">
            {/* Mobile Search Form */}
            <form onSubmit={handleSearchSubmit} className="mb-3 position-relative">
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-dark pe-3 border-0"
              >
                <FiSearch size={18} />
              </button>
            </form>

            {/* Mobile Nav Links */}
            <div className="d-flex flex-column gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="py-2 text-dark fw-medium text-decoration-none border-bottom-custom"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  <Link
                    to="/profile"
                    className="py-2 text-dark fw-medium text-decoration-none border-bottom-custom"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>

                  {isVendor ? (
                    <Link
                      to="/vendor/dashboard"
                      className="py-2 text-dark fw-medium text-decoration-none border-bottom-custom"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Vendor Dashboard
                    </Link>
                  ) : !isAdmin ? (
                    <Link
                      to="/become-vendor"
                      className="py-2 text-dark fw-medium text-decoration-none border-bottom-custom"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Become a Vendor
                    </Link>
                  ) : null}

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="py-2 text-dark fw-medium text-decoration-none border-bottom-custom"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </>
              )}

              {!isAuthenticated && (
                <div className="d-flex gap-2 pt-2">
                  <Link
                    to="/login"
                    className="btn btn-dark-custom w-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-outline-custom w-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
