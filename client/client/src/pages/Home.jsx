import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiHeadphones,
  FiChevronRight,
  FiMail,
  FiPackage,
  FiUsers,
  FiTrendingUp,
  FiX,
  FiPhone,
  FiCheckCircle,
  FiUser,
} from "react-icons/fi";
import ProductCard from "../components/product/ProductCard";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
import messageService from "../services/messageService";
import { sampleProducts, sampleCategories } from "../data/sampleProducts";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState(
    sampleProducts.filter((p) => p.isFeatured).slice(0, 4)
  );
  const [newArrivals, setNewArrivals] = useState(
    sampleProducts.filter((p) => p.isNewArrival).slice(0, 4)
  );
  const [bestSellers, setBestSellers] = useState(
    sampleProducts.filter((p) => p.isBestSeller).slice(0, 4)
  );
  const [latestProducts, setLatestProducts] = useState([]);
  const [categories, setCategories] = useState(sampleCategories);
  const [loading, setLoading] = useState(true);

  // Vendor modal state
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [vendorSubmitting, setVendorSubmitting] = useState(false);
  const [vendorSubmitted, setVendorSubmitted] = useState(false);
  const [vendorError, setVendorError] = useState("");
  const [vendorForm, setVendorForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    setVendorSubmitting(true);
    setVendorError("");

    try {
      await messageService.sendMessage({
        name: vendorForm.name,
        email: vendorForm.email,
        phone: vendorForm.phone,
        message: vendorForm.message,
        type: "vendor_application",
        subject: "Vendor Application – NEXORA",
      });

      setVendorSubmitted(true);
      setVendorForm({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => {
        setVendorModalOpen(false);
        setVendorSubmitted(false);
      }, 3500);
    } catch (err) {
      console.error("Vendor application error:", err);
      setVendorError(
        err.message || "Failed to submit application to admin. Please try again."
      );
    } finally {
      setVendorSubmitting(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      try {
        const [featuredRes, newArrivalsRes, bestSellersRes, catRes, latestRes] =
          await Promise.allSettled([
            productService.getProducts({ featured: "true", limit: 8 }),
            productService.getProducts({ sort: "newest", limit: 8 }),
            productService.getProducts({ bestSeller: "true", limit: 8 }),
            categoryService.getCategories(),
            productService.getProducts({ sort: "newest", limit: 8 }),
          ]);

        if (isMounted) {
          if (
            featuredRes.status === "fulfilled" &&
            featuredRes.value?.products?.length > 0
          ) {
            setFeaturedProducts(featuredRes.value.products.slice(0, 4));
          }
          if (
            newArrivalsRes.status === "fulfilled" &&
            newArrivalsRes.value?.products?.length > 0
          ) {
            setNewArrivals(newArrivalsRes.value.products.slice(0, 4));
          }
          if (
            bestSellersRes.status === "fulfilled" &&
            bestSellersRes.value?.products?.length > 0
          ) {
            setBestSellers(bestSellersRes.value.products.slice(0, 4));
          }
          if (
            catRes.status === "fulfilled" &&
            catRes.value?.categories?.length > 0
          ) {
            setCategories(catRes.value.categories);
          }
          if (
            latestRes.status === "fulfilled" &&
            latestRes.value?.products?.length > 0
          ) {
            setLatestProducts(latestRes.value.products.slice(0, 8));
          }
        }
      } catch (err) {
        console.warn("Using sample fallback data for Home:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="home-page pb-5">
      {/* 1. HERO SECTION */}
      <section className="py-5" style={{ backgroundColor: "#F4F0E8", borderBottom: "1px solid var(--card-border)" }}>
        <div className="container py-lg-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge-emerald mb-3">
                CURATED LUXURY &bull; 2026 COLLECTION
              </span>
              <h1 className="display-4 font-serif fw-bold mb-3" style={{ color: "var(--text-heading)", letterSpacing: "-0.02em" }}>
                Find Your Next Favourite.
              </h1>
              <p className="lead mb-4" style={{ color: "var(--text-muted)", maxWidth: "480px", fontSize: "1.05rem" }}>
                Discover quality products selected to make everyday shopping easier. Built on fine craft, authentic materials, and timeless utility.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/shop" className="btn btn-emerald py-3 px-4">
                  Shop Now <FiArrowRight size={16} />
                </Link>
                <Link to="/shop?sort=newest" className="btn btn-outline-custom py-3 px-4">
                  Explore Collections
                </Link>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="position-relative">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop"
                  alt="Curated Collection"
                  className="img-fluid w-100 shadow-sm"
                  style={{
                    borderRadius: "var(--radius-lg)",
                    aspectRatio: "16/10",
                    objectFit: "cover",
                    border: "1px solid var(--card-border)"
                  }}
                />
                <div
                  className="position-absolute bottom-0 start-0 m-3 p-3 bg-white shadow-sm d-none d-sm-block"
                  style={{ maxWidth: "260px", borderRadius: "var(--radius-md)", border: "1px solid var(--card-border)" }}
                >
                  <p className="mb-1 fw-bold small text-uppercase" style={{ letterSpacing: "0.05em", color: "var(--text-heading)" }}>
                    CURATED AESTHETICS
                  </p>
                  <p className="mb-0 text-muted" style={{ fontSize: "0.78rem" }}>
                    Uncompromising materials crafted for longevity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS / BENEFITS */}
      <section className="py-4 border-bottom-custom bg-white">
        <div className="container">
          <div className="row g-4 py-2">
            <div className="col-6 col-lg-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2.5 rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: "var(--emerald)", width: "42px", height: "42px" }}>
                  <FiTruck size={20} />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold text-black small">Free Delivery</h6>
                  <p className="mb-0 text-muted" style={{ fontSize: "0.78rem" }}>
                    Nationwide on orders over ₦50,000
                  </p>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2.5 rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: "var(--emerald)", width: "42px", height: "42px" }}>
                  <FiShield size={20} />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold text-black small">Secure Payment</h6>
                  <p className="mb-0 text-muted" style={{ fontSize: "0.78rem" }}>
                    Verified Paystack 256-bit encryption
                  </p>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2.5 rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: "var(--emerald)", width: "42px", height: "42px" }}>
                  <FiRefreshCw size={20} />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold text-black small">Easy 30-Day Returns</h6>
                  <p className="mb-0 text-muted" style={{ fontSize: "0.78rem" }}>
                    Hassle-free direct exchanges
                  </p>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2.5 rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: "var(--emerald)", width: "42px", height: "42px" }}>
                  <FiHeadphones size={20} />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold text-black small">24/7 Concierge</h6>
                  <p className="mb-0 text-muted" style={{ fontSize: "0.78rem" }}>
                    Dedicated customer support
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY SHOWCASE */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="badge-emerald mb-2">CURATED DEPARTMENTS</span>
              <h2 className="font-serif fw-bold text-black mb-0">Shop by Category</h2>
            </div>
            <Link to="/shop" className="text-black text-decoration-none fw-semibold small d-flex align-items-center gap-1">
              View All Categories <FiChevronRight />
            </Link>
          </div>

          <div className="row g-3">
            {categories.map((cat) => (
              <div key={cat.name} className="col-6 col-md-4 col-lg-3">
                <Link
                  to={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="text-decoration-none group-card d-block"
                >
                  <div
                    className="position-relative overflow-hidden"
                    style={{ aspectRatio: "1/1", borderRadius: "var(--radius-md)", border: "1px solid var(--card-border)" }}
                  >
                    <img
                      src={cat.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500&auto=format&fit=crop"}
                      alt={cat.name}
                      loading="lazy"
                      className="w-100 h-100 object-fit-cover"
                      style={{ transition: "transform 0.4s ease" }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                      onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    />
                    <div
                      className="position-absolute inset-0 d-flex flex-column justify-content-end p-3 text-white"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(12,20,19,0.9) 100%)",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                      }}
                    >
                      <h5 className="mb-0 text-white font-serif fw-bold">{cat.name}</h5>
                      {cat.count !== undefined && (
                        <p className="mb-0 text-white-50" style={{ fontSize: "0.75rem" }}>
                          {cat.count} Products
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED COLLECTIONS (MATCHING REFERENCE IMAGE) */}
      <section className="py-5" style={{ backgroundColor: "var(--ivory-bg)", borderTop: "1px solid var(--card-border)", borderBottom: "1px solid var(--card-border)" }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="badge-emerald mb-2">HANDPICKED SELECTION</span>
              <h2 className="font-serif fw-bold text-black mb-0">Featured Collections</h2>
            </div>
            <Link to="/shop?featured=true" className="text-black text-decoration-none fw-semibold small d-flex align-items-center gap-1">
              Explore All <FiChevronRight />
            </Link>
          </div>

          <div className="row g-4">
            {featuredProducts.map((product) => (
              <div key={product._id || product.id} className="col-6 col-lg-3">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL PROMOTIONAL BANNER */}
      <section className="py-5 my-5 text-white" style={{ backgroundColor: "#0C1413" }}>
        <div className="container py-lg-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge-emerald mb-3">
                LIMITED EDITION DROP
              </span>
              <h2 className="display-5 font-serif fw-bold text-white mb-3">
                The Monochrome Capsule.
              </h2>
              <p className="mb-4 lead" style={{ fontSize: "1rem", color: "#A1A1AA" }}>
                Every silhouette is stripped down to its essential structure. No unnecessary ornaments, no fleeting trends. Uncompromising monochrome perfection.
              </p>
              <div className="d-flex gap-3">
                <Link to="/shop?deals=true" className="btn btn-emerald px-4 py-2.5">
                  Shop The Drop
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop"
                alt="Editorial Capsule"
                className="img-fluid shadow-lg"
                style={{ borderRadius: "var(--radius-lg)", aspectRatio: "16/9", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. NEW ARRIVALS */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="badge-emerald mb-2">JUST DEBUTED</span>
              <h2 className="font-serif fw-bold text-black mb-0">New Arrivals</h2>
            </div>
            <Link to="/shop?sort=newest" className="text-black text-decoration-none fw-semibold small d-flex align-items-center gap-1">
              View All <FiChevronRight />
            </Link>
          </div>

          <div className="row g-4">
            {newArrivals.map((product) => (
              <div key={product._id || product.id} className="col-6 col-lg-3">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BEST SELLERS */}
      <section className="py-5" style={{ backgroundColor: "var(--ivory-bg)", borderTop: "1px solid var(--card-border)" }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="badge-emerald mb-2">MOST COVETED</span>
              <h2 className="font-serif fw-bold text-black mb-0">Best Sellers</h2>
            </div>
            <Link to="/shop?sort=bestselling" className="text-black text-decoration-none fw-semibold small d-flex align-items-center gap-1">
              View All <FiChevronRight />
            </Link>
          </div>

          <div className="row g-4">
            {bestSellers.map((product) => (
              <div key={product._id || product.id} className="col-6 col-lg-3">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7b. LATEST LISTINGS — includes all vendor-published products */}
      {latestProducts.length > 0 && (
        <section className="py-5 bg-white border-top-custom">
          <div className="container">
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <span className="badge-emerald mb-2">FRESH ON THE MARKET</span>
                <h2 className="font-serif fw-bold text-black mb-0">Latest Listings</h2>
              </div>
              <Link to="/shop?sort=newest" className="text-black text-decoration-none fw-semibold small d-flex align-items-center gap-1">
                Browse All <FiChevronRight />
              </Link>
            </div>

            <div className="row g-4">
              {latestProducts.map((product) => (
                <div key={product._id || product.id} className="col-6 col-lg-3">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. BECOME A VENDOR BANNER */}
      <section
        style={{
          backgroundColor: "#0C1413",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          position: "relative",
          overflow: "hidden",
        }}
        className="py-5"
      >
        <div className="container position-relative py-lg-4">
          <div className="row align-items-center g-5">

            {/* LEFT: Text Block */}
            <div className="col-lg-6">
              <span className="badge-emerald mb-3">
                PARTNER PROGRAMME
              </span>

              <h2
                className="font-serif fw-bold text-white mb-3"
                style={{
                  fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                }}
              >
                Sell on NEXORA.
              </h2>

              <p
                className="mb-4 lead"
                style={{
                  color: "#A1A1AA",
                  fontSize: "1rem",
                  maxWidth: "480px",
                  lineHeight: 1.7,
                }}
              >
                Do you craft or source premium products that align with our
                curated, minimalist identity? We invite exceptional vendors
                to join our marketplace. Connect directly with admin to get verified.
              </p>

              <button
                id="vendor-contact-btn"
                type="button"
                onClick={() => setVendorModalOpen(true)}
                className="btn btn-emerald px-4 py-3 d-inline-flex align-items-center gap-2"
              >
                <FiMail size={16} />
                Message Admin to Become Vendor
              </button>
            </div>

            {/* RIGHT: Benefit Cards */}
            <div className="col-lg-6">
              <div className="row g-3">
                {[
                  {
                    icon: <FiUsers size={20} />,
                    title: "Reach Thousands",
                    desc: "Access our growing base of quality-conscious shoppers from day one.",
                  },
                  {
                    icon: <FiPackage size={20} />,
                    title: "Managed Listings",
                    desc: "Full admin panel to manage products, inventory, and orders.",
                  },
                  {
                    icon: <FiTrendingUp size={20} />,
                    title: "Zero Upfront Cost",
                    desc: "No listing fees — we operate on a simple revenue-share model.",
                  },
                  {
                    icon: <FiShield size={20} />,
                    title: "Trusted Platform",
                    desc: "Sell on a verified, brand-safe marketplace with end-to-end support.",
                  },
                ].map((item) => (
                  <div key={item.title} className="col-12 col-sm-6">
                    <div
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "4px",
                        padding: "1.25rem",
                        height: "100%",
                        transition: "border-color 0.2s ease",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")
                      }
                    >
                      <div
                        className="mb-2 d-flex align-items-center justify-content-center"
                        style={{
                          width: "38px",
                          height: "38px",
                          background: "rgba(255,255,255,0.08)",
                          borderRadius: "4px",
                          color: "rgba(255,255,255,0.7)",
                        }}
                      >
                        {item.icon}
                      </div>
                      <h6
                        className="mb-1 fw-bold"
                        style={{ color: "#ffffff", fontSize: "0.85rem" }}
                      >
                        {item.title}
                      </h6>
                      <p
                        className="mb-0"
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "0.75rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* VENDOR APPLICATION MODAL */}
      {vendorModalOpen && (
        <div
          id="vendor-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.75rem",
            overflowY: "auto",
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={(e) => {
            if (e.target.id === "vendor-modal-overlay") {
              setVendorModalOpen(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              maxWidth: "520px",
              width: "100%",
              maxHeight: "calc(100vh - 1.5rem)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="d-flex align-items-center justify-content-between p-3 p-sm-4 pb-3"
              style={{ borderBottom: "1px solid #f0f0f0", flexShrink: 0 }}
            >
              <div>
                <h5 className="mb-1 fw-bold text-dark" style={{ letterSpacing: "-0.01em", fontSize: "1.1rem" }}>
                  Message Admin to Become Vendor
                </h5>
                <p className="mb-0 text-muted" style={{ fontSize: "0.825rem" }}>
                  Provide your details and we will get back to you to onboard your brand.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-light border-0 d-flex align-items-center justify-content-center ms-2"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  color: "#6c757d",
                  backgroundColor: "#f8f9fa",
                  flexShrink: 0,
                }}
                onClick={() => setVendorModalOpen(false)}
                aria-label="Close"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3 p-sm-4" style={{ overflowY: "auto", flexGrow: 1 }}>
              {vendorSubmitted ? (
                <div className="text-center py-4">
                  <div
                    className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundColor: "#e8f5e9",
                      color: "#2e7d32",
                    }}
                  >
                    <FiCheckCircle size={32} />
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Application Sent!</h5>
                  <p className="text-muted mb-4" style={{ fontSize: "0.875rem" }}>
                    Thank you! Your vendor application and contact details have been sent directly to the admin inbox.
                    Our team will review your information and reach out to you soon.
                  </p>
                  <button
                    type="button"
                    className="btn btn-dark px-4 py-2"
                    style={{ borderRadius: "4px", fontSize: "0.875rem" }}
                    onClick={() => {
                      setVendorModalOpen(false);
                      setVendorSubmitted(false);
                      setVendorForm({ name: "", email: "", phone: "", message: "" });
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVendorSubmit}>
                  {vendorError && (
                    <div className="alert alert-danger py-2 small mb-3">
                      {vendorError}
                    </div>
                  )}
                  {/* Full Name */}
                  <div className="mb-3">
                    <label
                      className="form-label fw-semibold text-dark mb-1 d-flex align-items-center gap-1"
                      style={{ fontSize: "0.825rem" }}
                    >
                      <FiUser size={14} className="text-muted" /> Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alexander Vance"
                      className="form-control"
                      style={{
                        fontSize: "0.875rem",
                        padding: "0.6rem 0.85rem",
                        borderRadius: "4px",
                        borderColor: "#dee2e6",
                      }}
                      value={vendorForm.name}
                      onChange={(e) =>
                        setVendorForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="row g-3 mb-3">
                    <div className="col-sm-6">
                      <label
                        className="form-label fw-semibold text-dark mb-1 d-flex align-items-center gap-1"
                        style={{ fontSize: "0.825rem" }}
                      >
                        <FiMail size={14} className="text-muted" /> Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        className="form-control"
                        style={{
                          fontSize: "0.875rem",
                          padding: "0.6rem 0.85rem",
                          borderRadius: "4px",
                          borderColor: "#dee2e6",
                        }}
                        value={vendorForm.email}
                        onChange={(e) =>
                          setVendorForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                      />
                    </div>
                    <div className="col-sm-6">
                      <label
                        className="form-label fw-semibold text-dark mb-1 d-flex align-items-center gap-1"
                        style={{ fontSize: "0.825rem" }}
                      >
                        <FiPhone size={14} className="text-muted" /> Phone Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 000-0000"
                        className="form-control"
                        style={{
                          fontSize: "0.875rem",
                          padding: "0.6rem 0.85rem",
                          borderRadius: "4px",
                          borderColor: "#dee2e6",
                        }}
                        value={vendorForm.phone}
                        onChange={(e) =>
                          setVendorForm((prev) => ({ ...prev, phone: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  {/* Message / Description */}
                  <div className="mb-4">
                    <label
                      className="form-label fw-semibold text-dark mb-1"
                      style={{ fontSize: "0.825rem" }}
                    >
                      Message to Admin <span className="text-danger">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about your brand, store name, category of products, and links to your portfolio or catalog..."
                      className="form-control"
                      style={{
                        fontSize: "0.875rem",
                        padding: "0.6rem 0.85rem",
                        borderRadius: "4px",
                        borderColor: "#dee2e6",
                        resize: "vertical",
                      }}
                      value={vendorForm.message}
                      onChange={(e) =>
                        setVendorForm((prev) => ({ ...prev, message: e.target.value }))
                      }
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 pt-2" style={{ borderTop: "1px solid #f0f0f0" }}>
                    <button
                      type="button"
                      disabled={vendorSubmitting}
                      className="btn btn-outline-secondary px-3 py-2 flex-grow-1 flex-sm-grow-0"
                      style={{ borderRadius: "4px", fontSize: "0.85rem" }}
                      onClick={() => setVendorModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={vendorSubmitting}
                      className="btn btn-dark d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2 flex-grow-1 flex-sm-grow-0"
                      style={{
                        backgroundColor: "#111111",
                        borderColor: "#111111",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        opacity: vendorSubmitting ? 0.7 : 1,
                        cursor: vendorSubmitting ? "not-allowed" : "pointer",
                      }}
                    >
                      <FiMail size={15} />
                      {vendorSubmitting ? "Sending to Admin..." : "Send Message to Admin"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
