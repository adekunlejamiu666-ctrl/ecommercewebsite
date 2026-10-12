const mongoose = require("mongoose");

const vendorRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    businessAddress: {
      type: String,
      required: [true, "Business address is required"],
      trim: true,
    },
    businessCategory: {
      type: String,
      required: [true, "Business category is required"],
      trim: true,
    },
    businessDescription: {
      type: String,
      required: [true, "Business description is required"],
      trim: true,
    },
    productsToSell: {
      type: String,
      default: "",
      trim: true,
    },
    yearsInBusiness: {
      type: String,
      default: "",
    },
    registrationNumber: {
      type: String,
      default: "",
      trim: true,
    },
    storeLink: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VendorRequest", vendorRequestSchema);
