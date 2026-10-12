const VendorRequest = require("../models/vendorRequest.model");
const userModel = require("../models/user.models");

// @desc    Submit a new vendor application
// @route   POST /api/v1/vendor-requests
// @access  Private (Logged-in users)
const createVendorRequest = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is already a vendor or admin
    const currentUser = await userModel.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    if (currentUser.role === "vendor") {
      return res.status(400).json({ success: false, message: "You are already a registered vendor." });
    }

    // Check if user has an existing pending application
    const existingPending = await VendorRequest.findOne({
      user: userId,
      status: "pending",
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending vendor application under review.",
        request: existingPending,
      });
    }

    const {
      fullName,
      businessName,
      email,
      phone,
      businessAddress,
      businessCategory,
      businessDescription,
      productsToSell,
      yearsInBusiness,
      registrationNumber,
      storeLink,
    } = req.body;

    if (
      !fullName ||
      !businessName ||
      !email ||
      !phone ||
      !businessAddress ||
      !businessCategory ||
      !businessDescription
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields (Name, Business Name, Email, Phone, Address, Category, and Description).",
      });
    }

    const newRequest = await VendorRequest.create({
      user: userId,
      fullName: fullName.trim(),
      businessName: businessName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      businessAddress: businessAddress.trim(),
      businessCategory: businessCategory.trim(),
      businessDescription: businessDescription.trim(),
      productsToSell: productsToSell ? productsToSell.trim() : "",
      yearsInBusiness: yearsInBusiness ? String(yearsInBusiness).trim() : "",
      registrationNumber: registrationNumber ? registrationNumber.trim() : "",
      storeLink: storeLink ? storeLink.trim() : "",
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Your vendor application has been submitted successfully and is awaiting review.",
      request: newRequest,
    });
  } catch (error) {
    console.error("Create vendor request error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's latest vendor request status
// @route   GET /api/v1/vendor-requests/my-status
// @access  Private
const getMyVendorRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const request = await VendorRequest.findOne({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      request: request || null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all vendor requests (Admin view)
// @route   GET /api/v1/vendor-requests/admin/all
// @access  Private/Admin
const getAllVendorRequests = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== "All") {
      query.status = status.toLowerCase();
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { fullName: { $regex: q, $options: "i" } },
        { businessName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { businessCategory: { $regex: q, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await VendorRequest.countDocuments(query);
    const requests = await VendorRequest.find(query)
      .populate("user", "firstname lastname email avatar role phone")
      .populate("reviewedBy", "firstname lastname email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Counts for tab badges
    const pendingCount = await VendorRequest.countDocuments({ status: "pending" });
    const approvedCount = await VendorRequest.countDocuments({ status: "approved" });
    const rejectedCount = await VendorRequest.countDocuments({ status: "rejected" });

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      counts: {
        all: total,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      requests,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single vendor request details
// @route   GET /api/v1/vendor-requests/admin/:id
// @access  Private/Admin
const getVendorRequestById = async (req, res) => {
  try {
    const request = await VendorRequest.findById(req.params.id)
      .populate("user", "firstname lastname email avatar role phone address")
      .populate("reviewedBy", "firstname lastname email");

    if (!request) {
      return res.status(404).json({ success: false, message: "Vendor application not found." });
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve vendor request
// @route   PUT /api/v1/vendor-requests/admin/:id/approve
// @access  Private/Admin
const approveVendorRequest = async (req, res) => {
  try {
    const request = await VendorRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Vendor application not found." });
    }

    request.status = "approved";
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    await request.save();

    // Promote the linked User to 'vendor'
    const linkedUser = await userModel.findById(request.user);
    if (linkedUser) {
      linkedUser.role = "vendor";
      linkedUser.vendorProfile = {
        businessName: request.businessName,
        businessDescription: request.businessDescription,
        businessAddress: request.businessAddress,
        businessCategory: request.businessCategory,
      };
      await linkedUser.save();
    }

    return res.status(200).json({
      success: true,
      message: `Application approved. ${request.fullName} (${request.businessName}) is now an active vendor.`,
      request,
      user: linkedUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject vendor request
// @route   PUT /api/v1/vendor-requests/admin/:id/reject
// @access  Private/Admin
const rejectVendorRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const request = await VendorRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Vendor application not found." });
    }

    request.status = "rejected";
    request.rejectionReason = rejectionReason && rejectionReason.trim()
      ? rejectionReason.trim()
      : "Application does not meet current vendor criteria.";
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Vendor application rejected.",
      request,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createVendorRequest,
  getMyVendorRequest,
  getAllVendorRequests,
  getVendorRequestById,
  approveVendorRequest,
  rejectVendorRequest,
};
