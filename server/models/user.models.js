const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return !/\d/.test(v) && /^[A-Za-z\s'-]+$/.test(v) && v.trim().length >= 2;
        },
        message: "First name must be at least 2 letters and contain only letters.",
      },
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return !/\d/.test(v) && /^[A-Za-z\s'-]+$/.test(v) && v.trim().length >= 2;
        },
        message: "Last name must be at least 2 letters and contain only letters.",
      },
    },
    email: { type: String, required: true, unique: true },
    tag: { type: String, sparse: true, unique: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    avatarPublicId: { type: String, default: "" },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    role: { type: String, enum: ["user", "vendor", "admin", "operator"], default: "user" },
    vendorProfile: {
      businessName: { type: String, default: "" },
      businessDescription: { type: String, default: "" },
      businessAddress: { type: String, default: "" },
      businessCategory: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);