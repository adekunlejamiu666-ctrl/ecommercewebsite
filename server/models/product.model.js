const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    oldPrice: {
      type: Number,
      default: null,
    },
    discount: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, "Stock count is required"],
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    sku: {
      type: String,
      sparse: true,
      unique: true,
    },
    image: {
      type: String,
      required: [true, "Primary image is required"],
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    imagesPublicIds: {
      type: [String],
      default: [],
    },
    lowStockAlertSent: {
      type: Boolean,
      default: false,
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "active",
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    sellerType: {
      type: String,
      enum: ["admin", "vendor"],
      default: "admin",
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Pre-save synchronization for ownership and slug
productSchema.pre("save", function (next) {
  if (this.sku === "" || this.sku === null) {
    this.sku = undefined;
  }
  // Synchronize createdBy, vendor and sellerType
  if (!this.createdBy) {
    if (this.vendor) {
      this.createdBy = this.vendor;
    }
  }
  if (this.sellerType === "vendor") {
    if (!this.vendor && this.createdBy) {
      this.vendor = this.createdBy;
    }
  } else if (!this.sellerType) {
    this.sellerType = this.vendor ? "vendor" : "admin";
  }

  if (this.isModified("name") && !this.slug) {
    this.slug =
      this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") +
      "-" +
      Math.floor(1000 + Math.random() * 9000);
  }

  if (typeof next === "function") {
    next();
  }
});

module.exports = mongoose.model("Product", productSchema);
