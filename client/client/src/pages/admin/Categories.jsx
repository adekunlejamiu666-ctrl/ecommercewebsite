import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiCheck, FiFolder } from "react-icons/fi";
import categoryService from "../../services/categoryService";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  const [newCat, setNewCat] = useState({
    name: "",
    image: "",
    description: "",
  });

  const loadCategories = () => {
    setLoading(true);
    categoryService
      .getCategories()
      .then((res) => {
        if (res?.categories) setCategories(res.categories);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;

    try {
      await categoryService.createCategory(newCat);
      setFeedback(`Category "${newCat.name}" created successfully.`);
      setNewCat({ name: "", image: "", description: "" });
      loadCategories();
      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to create category.");
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete category "${name}"?`)) {
      try {
        await categoryService.deleteCategory(id);
        setFeedback(`Category "${name}" deleted.`);
        loadCategories();
        setTimeout(() => setFeedback(""), 4000);
      } catch (err) {
        alert(err.message || "Failed to delete category.");
      }
    }
  };

  return (
    <div className="admin-categories">
      {/* Title */}
      <div className="mb-4">
        <h1 className="h3 font-serif fw-bold text-black mb-1">Store Departments</h1>
        <p className="text-muted small mb-0">
          Curate departments, cover imagery, and catalog taxonomies.
        </p>
      </div>

      {feedback && (
        <div className="alert alert-dark border-custom py-2 small d-flex align-items-center gap-2 mb-4">
          <FiCheck size={16} />
          <span>{feedback}</span>
        </div>
      )}

      <div className="row g-4">
        {/* ADD CATEGORY FORM */}
        <div className="col-lg-4">
          <div className="p-4 border-custom bg-white shadow-sm" style={{ borderRadius: "var(--radius-md)" }}>
            <h5 className="font-serif fw-bold text-black mb-3 small text-uppercase" style={{ letterSpacing: "0.05em" }}>
              Add New Department
            </h5>

            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-black mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Footwear"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-black mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://images.unsplash.com/..."
                  value={newCat.image}
                  onChange={(e) => setNewCat({ ...newCat, image: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-black mb-1">
                  Brief Description
                </label>
                <textarea
                  rows={3}
                  className="form-control"
                  placeholder="Department summary..."
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-emerald w-100 py-2">
                <FiPlus className="me-1" /> Add Department
              </button>
            </form>
          </div>
        </div>

        {/* CATEGORIES LIST */}
        <div className="col-lg-8">
          <div className="p-4 border-custom bg-white shadow-sm" style={{ borderRadius: "2px" }}>
            <h5 className="fw-bold text-black mb-3 small text-uppercase" style={{ letterSpacing: "0.05em" }}>
              Existing Departments ({categories.length})
            </h5>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-dark" role="status">
                  <span className="visually-hidden">Loading categories...</span>
                </div>
              </div>
            ) : categories.length === 0 ? (
              <p className="text-muted small py-4 text-center mb-0">No categories created yet.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {categories.map((c) => (
                  <div
                    key={c._id || c.name}
                    className="p-3 border-custom bg-light-custom d-flex align-items-center justify-content-between"
                    style={{ borderRadius: "2px" }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.name}
                          className="border-custom object-fit-cover"
                          style={{ width: "48px", height: "48px", borderRadius: "2px" }}
                        />
                      ) : (
                        <div className="p-2 bg-white border-custom rounded text-black">
                          <FiFolder size={20} />
                        </div>
                      )}
                      <div>
                        <h6 className="mb-0 fw-bold text-black small">{c.name}</h6>
                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                          {c.description || `/${c.slug}`}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(c._id, c.name)}
                      className="btn btn-sm btn-link text-danger p-1 border-0"
                      title="Delete category"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
