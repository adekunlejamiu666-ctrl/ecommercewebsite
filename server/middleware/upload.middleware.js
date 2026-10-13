const multer = require("multer");

const storage = multer.memoryStorage();

// Allowed MIME types: JPEG, PNG, WebP only
// Do NOT accept GIF, SVG, PDF, video, or other non-photo formats
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Please upload a valid image file. Only JPEG, JPG, PNG, and WebP formats are accepted."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
  },
  fileFilter,
});

module.exports = upload;
