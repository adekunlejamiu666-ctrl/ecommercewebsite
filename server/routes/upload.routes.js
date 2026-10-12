const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.middleware");
const { protect } = require("../middleware/auth.middleware");
const cloudinaryService = require("../services/cloudinary.service");

// POST /api/v1/upload - Single image upload
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const folder = req.body.folder || "products";

    // 1. If uploaded as multipart file
    if (req.file) {
      const result = await cloudinaryService.uploadBuffer(req.file.buffer, folder);
      return res.status(200).json({
        success: true,
        message: "Image uploaded to Cloudinary successfully.",
        url: result.url,
        public_id: result.public_id,
      });
    }

    // 2. If uploaded as Base64 Data URI in request body
    const dataUri = req.body.dataUri || req.body.image;
    if (dataUri && dataUri.startsWith("data:image/")) {
      const result = await cloudinaryService.uploadDataUri(dataUri, folder);
      return res.status(200).json({
        success: true,
        message: "Image uploaded to Cloudinary successfully.",
        url: result.url,
        public_id: result.public_id,
      });
    }

    return res.status(400).json({
      success: false,
      message: "No image file or data URI provided.",
    });
  } catch (error) {
    console.error("[UploadRoute] Cloudinary upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload image to Cloudinary.",
    });
  }
});

// POST /api/v1/upload/multiple - Multiple images upload
router.post("/multiple", protect, upload.array("images", 6), async (req, res) => {
  try {
    const folder = req.body.folder || "products";
    const uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinaryService.uploadBuffer(file.buffer, folder);
        uploadedImages.push(result);
      }

      return res.status(200).json({
        success: true,
        message: "Images uploaded successfully.",
        images: uploadedImages,
        urls: uploadedImages.map((img) => img.url),
      });
    }

    return res.status(400).json({
      success: false,
      message: "No images provided for upload.",
    });
  } catch (error) {
    console.error("[UploadRoute] Multiple upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload images.",
    });
  }
});

// DELETE /api/v1/upload/:public_id - Delete asset from Cloudinary
router.delete("/:public_id", protect, async (req, res) => {
  try {
    const publicId = req.params.public_id;
    const deleted = await cloudinaryService.deleteImage(publicId);

    return res.status(200).json({
      success: deleted,
      message: deleted ? "Asset deleted from Cloudinary." : "Failed to delete asset or already deleted.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
