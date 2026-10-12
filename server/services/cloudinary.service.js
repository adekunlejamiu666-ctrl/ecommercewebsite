const { cloudinary, isConfigured } = require("../config/cloudinary");
const streamifier = require("stream");

/**
 * Upload an image buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {String} folder - Cloudinary folder (e.g. 'products', 'categories', 'profiles')
 * @returns {Promise<{ url: String, public_id: String }>}
 */
const uploadBuffer = (buffer, folder = "products") => {
  return new Promise((resolve, reject) => {
    if (!isConfigured) {
      return reject(new Error("Cloudinary credentials are not configured in environment variables."));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `ecommerce/${folder}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    const readable = new streamifier.Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Upload a Base64 Data URI or Image URL to Cloudinary
 * @param {String} dataUri - Base64 Data URI (e.g. data:image/png;base64,...) or remote image URL
 * @param {String} folder - Cloudinary folder (e.g. 'products', 'categories', 'profiles')
 * @returns {Promise<{ url: String, public_id: String }>}
 */
const uploadDataUri = async (dataUri, folder = "products") => {
  if (!isConfigured) {
    throw new Error("Cloudinary credentials are not configured in environment variables.");
  }

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `ecommerce/${folder}`,
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
};

/**
 * Delete an image asset from Cloudinary by its public_id
 * @param {String} publicId - The Cloudinary public_id
 * @returns {Promise<Boolean>}
 */
const deleteImage = async (publicId) => {
  if (!isConfigured || !publicId) return false;

  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === "ok";
  } catch (err) {
    console.warn(`[CloudinaryService] Failed to delete asset ${publicId}:`, err.message);
    return false;
  }
};

/**
 * Helper to upload image if it is a Data URI, or return existing URL if not
 */
const processImageUpload = async (imageInput, folder = "products") => {
  if (!imageInput || typeof imageInput !== "string") return null;

  // If it's a base64 Data URI, upload to Cloudinary
  if (imageInput.startsWith("data:image/")) {
    if (isConfigured) {
      const res = await uploadDataUri(imageInput, folder);
      return res;
    }
  }

  // If it's already an HTTP / Cloudinary URL, keep it
  return {
    url: imageInput,
    public_id: null,
  };
};

module.exports = {
  isConfigured,
  uploadBuffer,
  uploadDataUri,
  deleteImage,
  processImageUpload,
};
