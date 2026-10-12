import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiAlertCircle,
  FiUploadCloud,
  FiLink,
  FiTrash2,
} from "react-icons/fi";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [imageMode, setImageMode] = useState("url"); // 'url' | 'file'
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    oldPrice: "",
    stock: 10,
    sku: "",
    sizes: "",
    colors: "",
    image: "",
    description: "",
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    categoryService.getCategories().then((res) => {
      if (res?.categories && res.categories.length > 0) {
        setCategories(res.categories);
        if (!isEditing) {
          setFormData((prev) => ({ ...prev, category: res.categories[0].name }));
        }
      }
    }).catch(() => {});

    if (isEditing) {
      setLoading(true);
      productService
        .getProductById(id)
        .then((data) => {
          if (data?.product) {
            const p = data.product;
            setFormData({
              name: p.name || "",
              brand: p.brand || "",
              category: p.category || "",
              price: p.price ?? "",
              oldPrice: p.oldPrice ?? "",
              stock: p.stock ?? 10,
              sku: p.sku || "",
              sizes: Array.isArray(p.sizes) ? p.sizes.join(", ") : (p.sizes || ""),
              colors: Array.isArray(p.colors) ? p.colors.join(", ") : (p.colors || ""),
              image: p.image || "",
              description: p.description || "",
              isFeatured: !!p.isFeatured,
              isNewArrival: !!p.isNewArrival,
              isBestSeller: !!p.isBestSeller,
              status: p.status || "active",
            });
          }
        })
        .catch((err) => setError(err.message || "Failed to load product details."))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select a valid image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be less than 5MB."); return; }
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => setFormData((prev) => ({ ...prev, image: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name.trim() || !formData.description.trim() || formData.price === "" || !formData.category || !formData.brand.trim() || !formData.image) {
      setError("Please fill in all required fields including a product image.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        category: formData.category,
        price: Number(formData.price),
        oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
        stock: Number(formData.stock),
        sku: formData.sku && formData.sku.trim() ? formData.sku.trim() : undefined,
        sizes: formData.sizes ? formData.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
        colors: formData.colors ? formData.colors.split(",").map((c) => c.trim()).filter(Boolean) : [],
        image: formData.image.trim(),
        images: [formData.image.trim()],
        description: formData.description.trim(),
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        isBestSeller: formData.isBestSeller,
        status: formData.status,
      };
      if (isEditing) {
        await productService.updateProduct(id, payload);
      } else {
        await productService.createProduct(payload);
      }
      navigate("/admin/products");
    } catch (err) {
      setError(err.message || "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  const discountPreview =
    formData.oldPrice && Number(formData.oldPrice) > Number(formData.price)
      ? Math.round(((Number(formData.oldPrice) - Number(formData.price)) / Number(formData.oldPrice)) * 100)
      : null;

  return (
    <div className="admin-product-form" style={{ maxWidth: "860px" }}>
      {/* Header */}
      <div className="mb-4">
        <Link to="/admin/products" className="text-muted small text-decoration-none d-inline-flex align-items-center gap-1 mb-2">
          <FiArrowLeft size={13} /> Back to Products
        </Link>
        <h1 className="h3 fw-bold text-black mb-1">
          {isEditing ? "Edit Product" : "Add New Product"}
        </h1>
        <p className="text-muted small mb-0">
          {isEditing
            ? "Update product details, pricing, inventory, and visibility flags."
            : "Create a new product listing that will appear on the storefront immediately."}
        </p>
      </div>

      {error && (
        <div className="alert alert-dark border-custom py-2 px-3 small d-flex align-items-center gap-2 mb-4">
          <FiAlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 p-md-5 border-custom bg-white shadow-sm" style={{ borderRadius: "2px" }}>
        {/* Name & Brand */}
        <div className="row g-3 mb-3">
          <div className="col-md-8">
            <label className="form-label small fw-semibold text-black mb-1">Product Title <span className="text-danger">*</span></label>
            <input type="text" name="name" className="form-control rounded-0 small border-custom" placeholder="e.g. Minimalist Titanium Watch" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold text-black mb-1">Brand Name <span className="text-danger">*</span></label>
            <input type="text" name="brand" className="form-control rounded-0 small border-custom" placeholder="e.g. NEXORA Studio" value={formData.brand} onChange={handleChange} required />
          </div>
        </div>

        {/* Category, Price, Old Price, Stock */}
        <div className="row g-3 mb-3">
          <div className="col-sm-6 col-md-3">
            <label className="form-label small fw-semibold text-black mb-1">Category <span className="text-danger">*</span></label>
            <select name="category" className="form-select rounded-0 small border-custom" value={formData.category} onChange={handleChange}>
              {categories.length > 0 ? (
                categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)
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

          <div className="col-sm-6 col-md-3">
            <label className="form-label small fw-semibold text-black mb-1">Price (₦) <span className="text-danger">*</span></label>
            <input type="number" step="any" name="price" className="form-control rounded-0 small border-custom font-monospace" placeholder="0.00" value={formData.price} onChange={handleChange} required />
          </div>

          <div className="col-sm-6 col-md-3">
            <label className="form-label small fw-semibold text-black mb-1">Old Price (₦) <span className="text-muted fw-normal">(Optional)</span></label>
            <input type="number" step="any" name="oldPrice" className="form-control rounded-0 small border-custom font-monospace" placeholder="0.00" value={formData.oldPrice} onChange={handleChange} />
            {discountPreview && (
              <span className="badge bg-black text-white mt-1" style={{ fontSize: "0.68rem" }}>{discountPreview}% OFF</span>
            )}
          </div>

          <div className="col-sm-6 col-md-3">
            <label className="form-label small fw-semibold text-black mb-1">Units in Stock <span className="text-danger">*</span></label>
            <input type="number" name="stock" min="0" className="form-control rounded-0 small border-custom" value={formData.stock} onChange={handleChange} required />
          </div>
        </div>

        {/* SKU, Sizes, and Colors */}
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label className="form-label small fw-semibold text-black mb-1">SKU <span className="text-muted fw-normal">(Optional)</span></label>
            <input type="text" name="sku" className="form-control rounded-0 small border-custom" placeholder="e.g. ATL-PROD-001" value={formData.sku} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold text-black mb-1">Available Sizes <span className="text-muted fw-normal">(comma-separated)</span></label>
            <input type="text" name="sizes" className="form-control rounded-0 small border-custom" placeholder="e.g. S, M, L, XL" value={formData.sizes} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold text-black mb-1">Available Colors <span className="text-muted fw-normal">(comma-separated)</span></label>
            <input type="text" name="colors" className="form-control rounded-0 small border-custom" placeholder="e.g. Black, White, Grey" value={formData.colors} onChange={handleChange} />
          </div>
        </div>

        {/* Status */}
        <div className="mb-4">
          <label className="form-label small fw-semibold text-black mb-1">Listing Status</label>
          <select name="status" className="form-select rounded-0 small border-custom" value={formData.status} onChange={handleChange}>
            <option value="active">Active  Visible on storefront</option>
            <option value="draft">Draft  Hidden from storefront</option>
            <option value="archived">Archived  Permanently hidden</option>
          </select>
        </div>

        {/* Image */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label small fw-semibold text-black mb-0">Primary Product Image <span className="text-danger">*</span></label>
            <div className="d-flex gap-1">
              <button type="button" className={`btn btn-sm px-2 py-1 rounded-0 ${imageMode === "url" ? "btn-dark text-white" : "btn-light text-dark border"}`} style={{ fontSize: "0.72rem" }} onClick={() => setImageMode("url")}>
                <FiLink className="me-1" /> Image URL
              </button>
              <button type="button" className={`btn btn-sm px-2 py-1 rounded-0 ${imageMode === "file" ? "btn-dark text-white" : "btn-light text-dark border"}`} style={{ fontSize: "0.72rem" }} onClick={() => setImageMode("file")}>
                <FiUploadCloud className="me-1" /> Upload File
              </button>
            </div>
          </div>

          {imageMode === "url" ? (
            <input type="url" name="image" className="form-control rounded-0 small border-custom" placeholder="https://images.unsplash.com/photo-..." value={formData.image} onChange={handleChange} />
          ) : (
            <div>
              <input type="file" ref={fileInputRef} accept="image/*" className="d-none" onChange={handleImageFileChange} />
              <div className="p-4 border-custom bg-light-custom text-center" style={{ cursor: "pointer", borderStyle: "dashed", borderRadius: "2px" }} onClick={() => fileInputRef.current?.click()}>
                <FiUploadCloud size={26} className="text-muted mb-2" />
                <p className="mb-1 small fw-semibold text-black">Click to browse and upload product photo</p>
                <span className="text-muted" style={{ fontSize: "0.72rem" }}>PNG, JPG, or WebP â€” max 5MB</span>
              </div>
            </div>
          )}

          {formData.image && (
            <div className="mt-3 d-flex align-items-center gap-3 p-2 border-custom bg-light-custom">
              <img src={formData.image} alt="Preview" className="border bg-white" style={{ width: "64px", height: "64px", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
              <div className="flex-grow-1 overflow-hidden">
                <span className="text-black fw-semibold small d-block">Image Loaded</span>
                <span className="text-muted small text-truncate d-block" style={{ fontSize: "0.72rem" }}>
                  {formData.image.startsWith("data:") ? "Local file (base64)" : formData.image}
                </span>
              </div>
              <button type="button" onClick={() => setFormData((prev) => ({ ...prev, image: "" }))} className="btn btn-sm btn-link text-danger p-1" title="Remove image">
                <FiTrash2 size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="form-label small fw-semibold text-black mb-1">Product Description <span className="text-danger">*</span></label>
          <textarea rows={5} name="description" className="form-control rounded-0 small border-custom" placeholder="Detailed narrative regarding materials, cut, and engineering..." value={formData.description} onChange={handleChange} required />
        </div>

        {/* Visibility Flags */}
        <div className="p-3 border-custom bg-light-custom mb-4 d-flex align-items-center flex-wrap gap-4" style={{ borderRadius: "2px" }}>
          <span className="small fw-bold text-black text-uppercase" style={{ letterSpacing: "0.05em", fontSize: "0.72rem" }}>Visibility:</span>
          {[
            { name: "isFeatured", label: "Featured on Home" },
            { name: "isNewArrival", label: "New Arrival Badge" },
            { name: "isBestSeller", label: "Best Seller Flag" },
          ].map(({ name, label }) => (
            <div className="form-check mb-0" key={name}>
              <input className="form-check-input" type="checkbox" id={name} name={name} checked={formData[name]} onChange={handleChange} />
              <label className="form-check-label small fw-semibold text-black" htmlFor={name}>{label}</label>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="d-flex gap-3">
          <button type="submit" className="btn btn-dark-custom py-3 px-4" disabled={loading}>
            {loading ? "Saving Product..." : isEditing ? "Update Product" : "Publish Product"}
          </button>
          <Link to="/admin/products" className="btn btn-outline-custom py-3 px-4">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
