import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheck,
  FiAlertCircle,
  FiUploadCloud,
  FiLink,
  FiTrash2,
  FiImage,
} from "react-icons/fi";
import vendorService from "../../services/vendorService";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";

export default function VendorProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [imageMode, setImageMode] = useState("file"); // 'file' | 'url'

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    oldPrice: "",
    category: "Fashion & Apparel",
    brand: "",
    stock: "10",
    sku: "",
    sizes: "",
    colors: "",
    image: "",
  });

  useEffect(() => {
    // Load categories
    categoryService
      .getCategories()
      .then((res) => {
        if (res?.categories && res.categories.length > 0) {
          setCategories(res.categories);
          if (!isEditing) {
            setFormData((prev) => ({ ...prev, category: res.categories[0].name }));
          }
        }
      })
      .catch(() => {});

    // If editing, load product details
    if (isEditing) {
      productService
        .getProductById(id)
        .then((res) => {
          const p = res?.product || res;
          if (p) {
            setFormData({
              name: p.name || "",
              description: p.description || "",
              price: p.price ?? "",
              oldPrice: p.oldPrice ?? "",
              category: p.category || "Fashion & Apparel",
              brand: p.brand || "",
              stock: p.stock ?? "10",
              sku: p.sku || "",
              sizes: Array.isArray(p.sizes) ? p.sizes.join(", ") : (p.sizes || ""),
              colors: Array.isArray(p.colors) ? p.colors.join(", ") : (p.colors || ""),
              image: p.image || "",
            });
            if (p.image && p.image.startsWith("http")) {
              setImageMode("url");
            }
          }
        })
        .catch((err) => {
          setError(err.message || "Failed to load product details.");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP, etc.).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image file size must be less than 5MB.");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormData((prev) => ({ ...prev, image: uploadEvent.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      formData.price === "" ||
      !formData.category ||
      !formData.brand.trim() ||
      formData.stock === "" ||
      !formData.image
    ) {
      setError("Please complete all required fields including a product image.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        brand: formData.brand.trim(),
        price: Number(formData.price),
        oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
        stock: Number(formData.stock),
        sku: formData.sku && formData.sku.trim() ? formData.sku.trim() : undefined,
        sizes: formData.sizes ? formData.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
        colors: formData.colors ? formData.colors.split(",").map((c) => c.trim()).filter(Boolean) : [],
      };

      if (isEditing) {
        await vendorService.updateVendorProduct(id, payload);
      } else {
        await vendorService.createVendorProduct(payload);
      }

      navigate("/vendor/products");
    } catch (err) {
      setError(err.message || "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-dark spinner-border-sm" role="status" />
      </div>
    );
  }

  const calculatedDiscount =
    formData.oldPrice && Number(formData.oldPrice) > Number(formData.price)
      ? Math.round(
          ((Number(formData.oldPrice) - Number(formData.price)) /
            Number(formData.oldPrice)) *
            100
        )
      : null;

  return (
    <div className="vendor-product-form" style={{ maxWidth: "800px" }}>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link
          to="/vendor/products"
          className="btn btn-sm btn-outline-dark rounded-0 p-2 d-inline-flex align-items-center"
        >
          <FiArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="h3 fw-bold text-black mb-1">
            {isEditing ? "Edit Product Listing" : "Add New Product"}
          </h1>
          <p className="text-muted small mb-0">
            {isEditing
              ? "Update pricing, inventory, or item details."
              : "List a new genuine item to sell on Nexora under your vendor store."}
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-dark border-custom py-2 px-3 small d-flex align-items-center gap-2 mb-4">
          <FiAlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 p-md-5 border-custom bg-white shadow-sm"
        style={{ borderRadius: "2px" }}
      >
        <div className="row g-3 mb-4">
          {/* Title */}
          <div className="col-12">
            <label className="form-label small fw-semibold text-black">Product Title *</label>
            <input
              type="text"
              name="name"
              required
              className="form-control rounded-0 small border-custom"
              placeholder="e.g. Classic Tailored Wool Overcoat"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Category */}
          <div className="col-12 col-md-6">
            <label className="form-label small fw-semibold text-black">Category *</label>
            <select
              name="category"
              className="form-select rounded-0 small border-custom"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.length > 0 ? (
                categories.map((c) => (
                  <option key={c._id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Watches">Watches</option>
                  <option value="Bags & Accessories">Bags & Accessories</option>
                  <option value="Electronics & Audio">Electronics & Audio</option>
                  <option value="Home & Living">Home & Living</option>
                  <option value="Fragrance">Fragrance</option>
                </>
              )}
            </select>
          </div>

          {/* Brand */}
          <div className="col-12 col-md-6">
            <label className="form-label small fw-semibold text-black">Brand / Maker *</label>
            <input
              type="text"
              name="brand"
              required
              className="form-control rounded-0 small border-custom"
              placeholder="e.g. Nexora Studio or Your Brand"
              value={formData.brand}
              onChange={handleChange}
            />
          </div>

          {/* Price */}
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold text-black">Listing Price (₦) *</label>
            <input
              type="number"
              name="price"
              min="0"
              step="any"
              required
              className="form-control rounded-0 small border-custom font-monospace"
              placeholder="25000"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          {/* Old Price */}
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold text-black">
              Original Price (₦) <span className="text-muted fw-normal">(Optional)</span>
            </label>
            <input
              type="number"
              name="oldPrice"
              min="0"
              step="any"
              className="form-control rounded-0 small border-custom font-monospace"
              placeholder="35000"
              value={formData.oldPrice}
              onChange={handleChange}
            />
            {calculatedDiscount && (
              <span className="badge bg-black text-white mt-1" style={{ fontSize: "0.68rem" }}>
                {calculatedDiscount}% OFF
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold text-black">Stock Inventory *</label>
            <input
              type="number"
              name="stock"
              min="0"
              required
              className="form-control rounded-0 small border-custom"
              placeholder="10"
              value={formData.stock}
              onChange={handleChange}
            />
          </div>

          {/* SKU, Sizes, Colors */}
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold text-black">
              SKU <span className="text-muted fw-normal">(Optional)</span>
            </label>
            <input
              type="text"
              name="sku"
              className="form-control rounded-0 small border-custom"
              placeholder="e.g. VND-PRD-001"
              value={formData.sku}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold text-black">
              Available Sizes <span className="text-muted fw-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              name="sizes"
              className="form-control rounded-0 small border-custom"
              placeholder="e.g. S, M, L, XL"
              value={formData.sizes}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold text-black">
              Available Colors <span className="text-muted fw-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              name="colors"
              className="form-control rounded-0 small border-custom"
              placeholder="e.g. Black, White, Tan"
              value={formData.colors}
              onChange={handleChange}
            />
          </div>

          {/* Product Image Section */}
          <div className="col-12 mt-4 pt-3 border-top-custom">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label small fw-semibold text-black mb-0">
                Primary Product Image *
              </label>
              <div className="d-flex gap-1">
                <button
                  type="button"
                  className={`btn btn-sm px-2 py-1 rounded-0 ${
                    imageMode === "file" ? "btn-dark text-white" : "btn-light text-dark border"
                  }`}
                  style={{ fontSize: "0.72rem" }}
                  onClick={() => setImageMode("file")}
                >
                  <FiUploadCloud className="me-1" /> Upload File
                </button>
                <button
                  type="button"
                  className={`btn btn-sm px-2 py-1 rounded-0 ${
                    imageMode === "url" ? "btn-dark text-white" : "btn-light text-dark border"
                  }`}
                  style={{ fontSize: "0.72rem" }}
                  onClick={() => setImageMode("url")}
                >
                  <FiLink className="me-1" /> Image URL
                </button>
              </div>
            </div>

            {imageMode === "file" ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="d-none"
                  onChange={handleImageFileChange}
                />
                <div
                  className="p-4 border-custom bg-light-custom text-center cursor-pointer"
                  style={{ cursor: "pointer", borderStyle: "dashed" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiUploadCloud size={28} className="text-muted mb-2" />
                  <p className="mb-1 small fw-semibold text-black">
                    Click to browse and upload product photo
                  </p>
                  <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                    PNG, JPG, or WebP up to 5MB
                  </span>
                </div>
              </div>
            ) : (
              <input
                type="url"
                name="image"
                className="form-control rounded-0 small border-custom"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.image}
                onChange={handleChange}
              />
            )}

            {formData.image && (
              <div className="mt-3 d-flex align-items-center gap-3 p-2 border-custom bg-light-custom">
                <img
                  src={formData.image}
                  alt="Product preview"
                  className="border bg-white"
                  style={{ width: "64px", height: "64px", objectFit: "cover" }}
                />
                <div className="flex-grow-1 overflow-hidden">
                  <span className="text-black fw-semibold small d-block">Image Loaded</span>
                  <span className="text-muted small text-truncate d-block" style={{ fontSize: "0.72rem" }}>
                    {formData.image.startsWith("data:") ? "Local file converted" : formData.image}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                  className="btn btn-sm btn-link text-danger p-1"
                  title="Remove image"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="col-12 mt-3">
            <label className="form-label small fw-semibold text-black">Product Description *</label>
            <textarea
              name="description"
              required
              rows={5}
              className="form-control rounded-0 small border-custom"
              placeholder="Describe materials, sizing, origin, craftsmanship, and specifications..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="d-flex justify-content-end gap-2 border-top-custom pt-3">
          <Link to="/vendor/products" className="btn btn-outline-dark btn-sm rounded-0 px-4">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-dark-custom btn-sm rounded-0 px-4"
          >
            {submitting ? "Saving..." : isEditing ? "Save Product Changes" : "Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
