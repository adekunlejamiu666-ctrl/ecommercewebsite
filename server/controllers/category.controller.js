const Category = require("../models/category.model");
const cloudinaryService = require("../services/cloudinary.service");

// GET /api/v1/categories - Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/v1/categories - Create category (Admin)
const createCategory = async (req, res) => {
  try {
    const { name, image, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required." });
    }

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Category already exists." });
    }

    let categoryImage = image ? String(image).trim() : "";
    let imagePublicId = "";
    if (categoryImage && categoryImage.startsWith("data:image/")) {
      try {
        const uploadRes = await cloudinaryService.uploadDataUri(categoryImage, "categories");
        categoryImage = uploadRes.url;
        imagePublicId = uploadRes.public_id;
      } catch (err) {
        console.warn("[Cloudinary] Category image upload error:", err.message);
      }
    }

    const category = await Category.create({
      name: name.trim(),
      image: categoryImage,
      imagePublicId,
      description: description ? description.trim() : "",
    });

    return res.status(201).json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/v1/categories/:id - Update category (Admin)
const updateCategory = async (req, res) => {
  try {
    const existing = await Category.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    const updateData = { ...req.body };
    let oldImagePublicIdToDelete = null;

    if (updateData.image && typeof updateData.image === "string" && updateData.image.startsWith("data:image/")) {
      try {
        const uploadRes = await cloudinaryService.uploadDataUri(updateData.image, "categories");
        oldImagePublicIdToDelete = existing.imagePublicId || null;
        updateData.image = uploadRes.url;
        updateData.imagePublicId = uploadRes.public_id;
      } catch (err) {
        console.warn("[Cloudinary] Category image replacement error:", err.message);
      }
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (oldImagePublicIdToDelete) {
      cloudinaryService.deleteImage(oldImagePublicIdToDelete).catch(() => {});
    }

    return res.status(200).json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/categories/:id - Delete category (Admin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    if (category.imagePublicId) {
      cloudinaryService.deleteImage(category.imagePublicId).catch(() => {});
    }

    await Category.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Category removed successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
