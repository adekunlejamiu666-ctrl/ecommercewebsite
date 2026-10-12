const crypto = require("crypto");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.models");
const emailService = require("../services/email.service");
const cloudinaryService = require("../services/cloudinary.service");

const registerUser = async (req, res) => {
  const { firstname, lastname, email, password, tag, role, avatar } = req.body;

  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ message: "First name, last name, email, and password are required." });
  }

  const nameRegex = /^[A-Za-z\s'-]+$/;
  const trimmedFirstname = firstname.trim();
  const trimmedLastname = lastname.trim();

  if (/\d/.test(trimmedFirstname)) {
    return res.status(400).json({ message: "First name cannot contain numbers. Only letters are allowed." });
  }

  if (!nameRegex.test(trimmedFirstname)) {
    return res.status(400).json({ message: "First name must contain only letters." });
  }

  if (trimmedFirstname.length < 2) {
    return res.status(400).json({ message: "First name must be at least 2 letters long." });
  }

  if (/\d/.test(trimmedLastname)) {
    return res.status(400).json({ message: "Last name cannot contain numbers. Only letters are allowed." });
  }

  if (!nameRegex.test(trimmedLastname)) {
    return res.status(400).json({ message: "Last name must contain only letters." });
  }

  if (trimmedLastname.length < 2) {
    return res.status(400).json({ message: "Last name must be at least 2 letters long." });
  }

  try {
    const saltround = await bcryptjs.genSalt(10);
    const hashPass = await bcryptjs.hash(password, saltround);

    let userAvatar = avatar ? String(avatar).trim() : "";
    let avatarPublicId = "";
    if (userAvatar && userAvatar.startsWith("data:image/")) {
      try {
        const uploadRes = await cloudinaryService.uploadDataUri(userAvatar, "profiles");
        userAvatar = uploadRes.url;
        avatarPublicId = uploadRes.public_id;
      } catch (err) {
        console.warn("[Cloudinary] Avatar upload warning during registration:", err.message);
      }
    }

    const user = await userModel.create({
      firstname: trimmedFirstname,
      lastname: trimmedLastname,
      email,
      tag,
      role: role && ["user", "vendor", "admin", "operator"].includes(role) ? role : "user",
      password: hashPass,
      avatar: userAvatar,
      avatarPublicId,
    });

    // Send welcome email asynchronously
    emailService.sendWelcomeEmail(user).catch((err) => {
      console.warn("[EmailService] Welcome email delivery warning:", err.message);
    });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
        algorithm: "HS256",
      }
    );

    return res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        tag: user.tag,
        role: user.role,
        avatar: user.avatar || "",
        token,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A user with that email or tag already exists." });
    }

    return res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const isUser = await userModel.findOne({ email }).select("+password");

    if (!isUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const passwordMatch = await bcryptjs.compare(password, isUser.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      {
        id: isUser._id,
        role: isUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
        algorithm: "HS256",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      data: {
        id: isUser._id,
        firstname: isUser.firstname,
        lastname: isUser.lastname,
        email: isUser.email,
        role: isUser.role,
        tag: isUser.tag ? isUser.tag : null,
        phone: isUser.phone || "",
        avatar: isUser.avatar || "",
        address: isUser.address || {},
        token,
      },
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "User cannot login at this time",
      error: error.message,
    });
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    // Generate 32-byte hex token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });

    // Send password reset email
    emailService.sendPasswordResetEmail(user, resetToken).catch((err) => {
      console.warn("[EmailService] Password reset email delivery warning:", err.message);
    });

    return res.status(200).json({
      message: "Password reset link sent to your email successfully.",
      resetToken, // Returned for testing or direct verification
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token and new password are required." });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    const saltround = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(password, saltround);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        avatar: user.avatar || "",
        address: user.address || {},
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const { firstname, lastname, phone, address, avatar } = req.body;
    const nameRegex = /^[A-Za-z\s'-]+$/;

    if (firstname !== undefined && firstname.trim() !== "") {
      const trimmedFirstname = firstname.trim();
      if (/\d/.test(trimmedFirstname)) {
        return res.status(400).json({ message: "First name cannot contain numbers. Only letters are allowed." });
      }
      if (!nameRegex.test(trimmedFirstname)) {
        return res.status(400).json({ message: "First name must contain only letters." });
      }
      if (trimmedFirstname.length < 2) {
        return res.status(400).json({ message: "First name must be at least 2 letters long." });
      }
      user.firstname = trimmedFirstname;
    }

    if (lastname !== undefined && lastname.trim() !== "") {
      const trimmedLastname = lastname.trim();
      if (/\d/.test(trimmedLastname)) {
        return res.status(400).json({ message: "Last name cannot contain numbers. Only letters are allowed." });
      }
      if (!nameRegex.test(trimmedLastname)) {
        return res.status(400).json({ message: "Last name must contain only letters." });
      }
      if (trimmedLastname.length < 2) {
        return res.status(400).json({ message: "Last name must be at least 2 letters long." });
      }
      user.lastname = trimmedLastname;
    }

    if (phone !== undefined) user.phone = phone;

    let oldAvatarPublicIdToDelete = null;
    if (avatar !== undefined && avatar !== null) {
      if (typeof avatar === "string" && avatar.startsWith("data:image/")) {
        try {
          const uploadRes = await cloudinaryService.uploadDataUri(avatar, "profiles");
          oldAvatarPublicIdToDelete = user.avatarPublicId || null;
          user.avatar = uploadRes.url;
          user.avatarPublicId = uploadRes.public_id;
        } catch (err) {
          console.warn("[Cloudinary] Avatar update error:", err.message);
        }
      } else {
        user.avatar = avatar;
      }
    }

    if (address) {
      user.address = {
        street: address.street !== undefined ? address.street : (user.address?.street || ""),
        city: address.city !== undefined ? address.city : (user.address?.city || ""),
        state: address.state !== undefined ? address.state : (user.address?.state || ""),
        country: address.country !== undefined ? address.country : (user.address?.country || ""),
        postalCode: address.postalCode !== undefined ? address.postalCode : (user.address?.postalCode || ""),
      };
    }

    const updatedUser = await user.save();

    if (oldAvatarPublicIdToDelete) {
      cloudinaryService.deleteImage(oldAvatarPublicIdToDelete).catch(() => {});
    }
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone || "",
        avatar: updatedUser.avatar || "",
        address: updatedUser.address || {},
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { firstname: { $regex: q, $options: "i" } },
        { lastname: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    if (role && role !== "All") {
      query.role = role;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await userModel.countDocuments(query);
    const users = await userModel
      .find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "vendor", "admin", "operator"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role specified." });
    }

    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({ success: true, message: "User role updated successfully.", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({ success: true, message: "User removed successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
};