import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiFilter,
  FiX,
  FiRotateCcw,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import ProductCard from "../components/product/ProductCard";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
import { sampleProducts, sampleCategories } from "../data/sampleProducts";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Query Parameters
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "newest";

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSort);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedSellerType, setSelectedSellerType] = useState("All");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Data & Pagination
  const [products, setProducts] = useState(sampleProducts);
  const [categories, setCategories] = useState(sampleCategories);
  const [totalCount, setTotalCount] = useState(sampleProducts.length);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 9;

  // Sync state when URL params change
  useEffect(() => {
    if (searchParams.get("category")) {
      setSelectedCategory(searchParams.get("category"));
    }
    if (searchParams.get("search") !== null) {
      setSearchQuery(searchParams.get("search") || "");
    }
    if (searchParams.get("sort")) {
      setSortBy(searchParams.get("sort"));
    }
    setCurrentPage(1);
  }, [searchParams]);

  // Load Categories once
  useEffect(() => {
    categoryService.getCategories().then((res) => {
      if (res?.categories?.length > 0) {
        setCategories(res.categories);
      }
    }).catch(() => { });
  }, []);

  // Fetch Products from Backend API with client-side fallback
  useEffect(() => {
    let isCurrent = true;
    setLoading(true);

    const queryParams = {
      page: currentPage,
      limit: itemsPerPage,
      sort: sortBy,
    };

    if (selectedCategory !== "All") queryParams.category = selectedCategory;
    if (selectedBrand !== "All") queryParams.brand = selectedBrand;
    if (selectedSellerType !== "All") queryParams.sellerType = selectedSellerType;
    if (searchQuery.trim()) queryParams.search = searchQuery.trim();
    if (maxPrice < 2000) queryParams.maxPrice = maxPrice;
    if (minRating > 0) queryParams.minRating = minRating;
    if (inStockOnly) queryParams.inStock = "true";

    productService
      .getProducts(queryParams)
      .then((data) => {
        if (isCurrent && data?.success) {
          setProducts(data.products || []);
          setTotalCount(data.total || data.count || 0);
          setTotalPages(data.totalPages || 1);
        }
      })
      .catch(() => {
        // Fallback to client-side filtering over sample dataset
        if (isCurrent) {
          const filtered = sampleProducts.filter((p) => {
            if (selectedCategory !== "All" && p.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
            if (selectedBrand !== "All" && p.brand !== selectedBrand) return false;
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase();
              if (!p.name.toLowerCase().includes(q) && !p.brand?.toLowerCase().includes(q)) return false;
            }
            if (p.price > maxPrice) return false;
            if (p.rating < minRating) return false;
            if (inStockOnly && p.stock <= 0) return false;
            return true;
          });
          setProducts(filtered);
          setTotalCount(filtered.length);
          setTotalPages(Math.ceil(filtered.length / itemsPerPage) || 1);
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [
    selectedCategory,
    selectedBrand,
    selectedSellerType,
    searchQuery,
    maxPrice,
    minRating,
    inStockOnly,
    sortBy,
    currentPage,
  ]);

  // Extract all unique brands
  const brands = useMemo(() => {
    const list = sampleProducts.map((p) => p.brand).filter(Boolean);
    return ["All", ...Array.from(new Set(list))];
  }, []);

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedBrand("All");
    setSelectedSellerType("All");
    setSearchQuery("");
    setMaxPrice(2000);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy("newest");
    setSearchParams({});
    setCurrentPage(1);
  };

  return (
    <div className="shop-page py-5 bg-white">
      <div className="container">
        {/* Header Breadcrumb & Title */}
        <div className="border-bottom-custom pb-4 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
          <div>
            <p className="text-uppercase small mb-1" style={{ letterSpacing: "0.08em", color: "var(--color-medium-gray)" }}>
              Nexora Catalog / {selectedCategory}
            </p>
            <h1 className="h2 fw-bold text-black mb-0">The Collection</h1>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              className="btn btn-outline-custom d-lg-none d-flex align-items-center gap-2"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            >
              <FiFilter size={16} /> Filters
            </button>

            {/* Sorting Select */}
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="sortSelect" className="small text-muted text-nowrap d-none d-sm-inline">
                Sort By:
              </label>
              <select
                id="sortSelect"
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ width: "190px", borderRadius: "2px" }}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="highest-rated">Highest Rated</option>
                <option value="bestselling">Best Selling</option>
              </select>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* LEFT SIDEBAR: FILTERS */}
          <aside
            className={`col-lg-3 ${mobileFilterOpen ? "d-block" : "d-none d-lg-block"
              }`}
          >
            <div className="p-4 border-custom bg-light-custom" style={{ borderRadius: "2px" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-black mb-0 small text-uppercase" style={{ letterSpacing: "0.05em" }}>
                  Filter Products
                </h5>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn btn-link text-dark p-0 small text-decoration-none d-flex align-items-center gap-1"
                  style={{ fontSize: "0.78rem" }}
                >
                  <FiRotateCcw size={12} /> Reset
                </button>
              </div>

              {/* Keyword Search Inside Filter */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-black">Search</label>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search keywords..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-dark pe-2 border-0"
                      onClick={() => setSearchQuery("")}
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-4 border-top-custom pt-3">
                <label className="form-label small fw-semibold text-black mb-2">Category</label>
                <div className="d-flex flex-column gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("All");
                      setCurrentPage(1);
                    }}
                    className={`btn text-start p-1 small border-0 ${selectedCategory === "All" ? "fw-bold text-black" : "text-muted"
                      }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(c.name);
                        setCurrentPage(1);
                      }}
                      className={`btn text-start p-1 small border-0 ${selectedCategory.toLowerCase() === c.name.toLowerCase()
                          ? "fw-bold text-black text-decoration-underline"
                          : "text-muted"
                        }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Marketplace Seller Filter */}
              <div className="mb-4 border-top-custom pt-3">
                <label className="form-label small fw-semibold text-black mb-2">Seller / Store</label>
                <div className="d-flex flex-column gap-1">
                  {[
                    { label: "All Products", val: "All" },
                    { label: "Admin Official Store", val: "admin" },
                    { label: "Approved Vendors", val: "vendor" },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => {
                        setSelectedSellerType(s.val);
                        setCurrentPage(1);
                      }}
                      className={`btn text-start p-1 small border-0 ${selectedSellerType === s.val
                          ? "fw-bold text-black text-decoration-underline"
                          : "text-muted"
                        }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-4 border-top-custom pt-3">
                <label className="form-label small fw-semibold text-black mb-2">Brand</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-4 border-top-custom pt-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold text-black mb-0">Max Price</label>
                  <span className="small fw-bold text-black">₦{Number(maxPrice).toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min="50"
                  max="2000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Rating Filter */}
              <div className="mb-4 border-top-custom pt-3">
                <label className="form-label small fw-semibold text-black mb-2">Minimum Rating</label>
                <div className="d-flex flex-column gap-1">
                  {[4, 3, 0].map((rating) => (
                    <div key={rating} className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="ratingFilter"
                        id={`rating-${rating}`}
                        checked={minRating === rating}
                        onChange={() => {
                          setMinRating(rating);
                          setCurrentPage(1);
                        }}
                      />
                      <label className="form-check-label small text-muted d-flex align-items-center gap-1" htmlFor={`rating-${rating}`}>
                        {rating === 0 ? "All Ratings" : `${rating}★ & above`}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="border-top-custom pt-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="stockCheck"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      setCurrentPage(1);
                    }}
                  />
                  <label className="form-check-label small fw-semibold text-black" htmlFor="stockCheck">
                    In Stock Only
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE: PRODUCTS & PAGINATION */}
          <main className="col-lg-9">
            {/* Active Filters Bar */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <p className="small text-muted mb-0">
                Showing <span className="fw-bold text-black">{products.length}</span> of{" "}
                <span className="fw-bold text-black">{totalCount}</span> products
              </p>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-dark" role="status">
                  <span className="visually-hidden">Loading products...</span>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-5 border-custom bg-light-custom my-4 p-5">
                <h4 className="fw-bold text-black mb-2">No Products Found</h4>
                <p className="text-muted small mb-4">
                  No items match your selected filters. Try broadening your criteria.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn btn-dark-custom"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {products.map((product) => (
                  <div key={product._id || product.id} className="col-6 col-md-4">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav aria-label="Catalog pagination" className="pt-5 d-flex justify-content-center">
                <ul className="pagination gap-1">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link text-black border-custom"
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      aria-label="Previous page"
                    >
                      <FiChevronLeft />
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <li
                      key={pageNum}
                      className={`page-item ${currentPage === pageNum ? "active" : ""}`}
                    >
                      <button
                        className={`page-link border-custom ${currentPage === pageNum
                            ? "bg-black text-white border-black"
                            : "text-black"
                          }`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    </li>
                  ))}

                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link text-black border-custom"
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      aria-label="Next page"
                    >
                      <FiChevronRight />
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
