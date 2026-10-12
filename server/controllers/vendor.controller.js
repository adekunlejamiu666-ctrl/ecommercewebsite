const Product = require("../models/product.model");
const Order = require("../models/order.model");
const User = require("../models/user.models");
const Category = require("../models/category.model");
const cloudinaryService = require("../services/cloudinary.service");
const stockService = require("../services/stock.service");

// @desc    Get Vendor Dashboard Analytics & Metrics
// @route   GET /api/v1/vendor/dashboard
// @access  Private/Vendor
const getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.user.id;

    // 1. Total products for this vendor
    const totalProducts = await Product.countDocuments({ vendor: vendorId });
    const lowStockProducts = await Product.find({
      vendor: vendorId,
      stock: { $lte: 5 },
    })
      .sort({ stock: 1 })
      .limit(6);

    // 2. Orders containing vendor's products
    const orders = await Order.find({ "orderItems.vendor": vendorId })
      .sort({ createdAt: -1 })
      .populate("user", "firstname lastname email");

    let totalSales = 0;
    let pendingOrders = 0;
    let completedOrders = 0;
    let totalItemsSold = 0;

    orders.forEach((order) => {
      // Calculate revenue specifically from this vendor's items
      const vendorItems = order.orderItems.filter(
        (item) => item.vendor && item.vendor.toString() === vendorId.toString()
      );

      const vendorItemTotal = vendorItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      totalSales += vendorItemTotal;

      vendorItems.forEach((item) => {
        totalItemsSold += item.quantity;
      });

      if (order.orderStatus === "Pending" || order.orderStatus === "Processing") {
        pendingOrders += 1;
      } else if (order.orderStatus === "Delivered") {
        completedOrders += 1;
      }
    });

    // Recent orders snippet (last 5)
    const recentOrders = orders.slice(0, 5).map((order) => {
      const vendorItems = order.orderItems.filter(
        (item) => item.vendor && item.vendor.toString() === vendorId.toString()
      );
      const vendorTotal = vendorItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return {
        _id: order._id,
        createdAt: order.createdAt,
        customerName: `${order.shippingAddress?.firstname || ""} ${order.shippingAddress?.lastname || ""}`.trim() || order.user?.firstname || "Customer",
        itemsCount: vendorItems.reduce((acc, it) => acc + it.quantity, 0),
        amount: vendorTotal,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
      };
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalOrders: orders.length,
        pendingOrders,
        completedOrders,
        totalSales,
        totalItemsSold,
      },
      lowStockProducts,
      recentOrders,
    });
  } catch (error) {
    console.error("Vendor dashboard error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all products for logged-in vendor
// @route   GET /api/v1/vendor/products
// @access  Private/Vendor
const getVendorProducts = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { search, category, page = 1, limit = 20 } = req.query;

    const query = { $or: [{ vendor: vendorId }, { createdBy: vendorId }] };

    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    if (category && category !== "All") {
      query.category = { $regex: category.trim(), $options: "i" };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("vendor", "firstname lastname vendorProfile role email")
      .populate("createdBy", "firstname lastname vendorProfile role email");

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      products,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product as vendor
// @route   POST /api/v1/vendor/products
// @access  Private/Vendor
const createVendorProduct = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const {
      name,
      description,
      price,
      oldPrice,
      category,
      brand,
      stock,
      sku,
      sizes,
      colors,
      image,
      images,
      specifications,
    } = req.body;

    if (!name || !description || price === undefined || !category || !brand || stock === undefined || !image) {
      return res.status(400).json({
        success: false,
        message: "Name, description, price, category, brand, stock count, and primary image are required.",
      });
    }

    let primaryImage = image.trim();
    let imagePublicId = "";
    if (primaryImage.startsWith("data:image/")) {
      try {
        const uploadRes = await cloudinaryService.uploadDataUri(primaryImage, "products");
        primaryImage = uploadRes.url;
        imagePublicId = uploadRes.public_id;
      } catch (err) {
        console.warn("[Cloudinary] Vendor primary image upload warning:", err.message);
      }
    }

    let galleryImages = [];
    let galleryPublicIds = [];
    const rawImages = Array.isArray(images) && images.length > 0 ? images : [primaryImage];
    for (const img of rawImages) {
      if (typeof img === "string" && img.startsWith("data:image/")) {
        try {
          const res = await cloudinaryService.uploadDataUri(img, "products");
          galleryImages.push(res.url);
          galleryPublicIds.push(res.public_id);
        } catch (err) {
          console.warn("[Cloudinary] Vendor gallery upload warning:", err.message);
        }
      } else if (typeof img === "string" && img.trim()) {
        galleryImages.push(img.trim());
      }
    }
    if (galleryImages.length === 0) {
      galleryImages = [primaryImage];
    }

    const newProduct = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      discount: oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0,
      category: category.trim(),
      brand: brand.trim(),
      stock: Number(stock),
      sku: sku && sku.trim() ? sku.trim() : undefined,
      sizes: Array.isArray(sizes) ? sizes : [],
      colors: Array.isArray(colors) ? colors : [],
      image: primaryImage,
      imagePublicId,
      images: galleryImages,
      imagesPublicIds: galleryPublicIds,
      specifications: specifications || {},
      createdBy: vendorId,
      sellerType: "vendor",
      vendor: vendorId,
      status: "active",
    });

    // Check low-stock transition
    await stockService.checkStockAndNotify(newProduct);

    const populatedProduct = await Product.findById(newProduct._id)
      .populate("vendor", "firstname lastname vendorProfile role email")
      .populate("createdBy", "firstname lastname vendorProfile role email");

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product: populatedProduct,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product as vendor (enforces ownership)
// @route   PUT /api/v1/vendor/products/:id
// @access  Private/Vendor
const updateVendorProduct = async (req, res) => {
  try {
    const vendorId = (req.user._id || req.user.id).toString();
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    // Ownership check: must match creator or assigned vendor or be admin
    const isOwner =
      (product.createdBy && product.createdBy.toString() === vendorId) ||
      (product.vendor && product.vendor.toString() === vendorId);

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: You do not own this product." });
    }

    const {
      name,
      description,
      price,
      oldPrice,
      category,
      brand,
      stock,
      sku,
      sizes,
      colors,
      image,
      images,
      specifications,
      status,
    } = req.body;

    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (oldPrice !== undefined) product.oldPrice = oldPrice ? Number(oldPrice) : null;
    if (category) product.category = category.trim();
    if (brand) product.brand = brand.trim();
    if (stock !== undefined) product.stock = Number(stock);
    if (sku !== undefined) product.sku = sku && sku.trim() ? sku.trim() : undefined;
    if (sizes !== undefined) product.sizes = Array.isArray(sizes) ? sizes : [];
    if (colors !== undefined) product.colors = Array.isArray(colors) ? colors : [];
    let oldImagePublicIdToDelete = null;
    if (image && typeof image === "string" && image.startsWith("data:image/")) {
      try {
        const uploadRes = await cloudinaryService.uploadDataUri(image, "products");
        oldImagePublicIdToDelete = product.imagePublicId || null;
        product.image = uploadRes.url;
        product.imagePublicId = uploadRes.public_id;
      } catch (err) {
        console.warn("[Cloudinary] Vendor image update warning:", err.message);
      }
    } else if (image) {
      product.image = image.trim();
    }

    if (Array.isArray(images)) {
      const updatedGallery = [];
      const updatedPublicIds = [];
      for (const img of images) {
        if (typeof img === "string" && img.startsWith("data:image/")) {
          try {
            const res = await cloudinaryService.uploadDataUri(img, "products");
            updatedGallery.push(res.url);
            updatedPublicIds.push(res.public_id);
          } catch (err) {
            console.warn("[Cloudinary] Vendor gallery upload warning:", err.message);
          }
        } else if (typeof img === "string" && img.trim()) {
          updatedGallery.push(img.trim());
        }
      }
      product.images = updatedGallery;
      if (updatedPublicIds.length > 0) {
        product.imagesPublicIds = updatedPublicIds;
      }
    }

    if (specifications) product.specifications = specifications;
    if (status) product.status = status;

    if (product.oldPrice && product.oldPrice > product.price) {
      product.discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
    } else {
      product.discount = 0;
    }

    await product.save();

    if (oldImagePublicIdToDelete) {
      cloudinaryService.deleteImage(oldImagePublicIdToDelete).catch(() => {});
    }

    // Check low-stock transition
    await stockService.checkStockAndNotify(product);

    const updated = await Product.findById(product._id)
      .populate("vendor", "firstname lastname vendorProfile role email")
      .populate("createdBy", "firstname lastname vendorProfile role email");

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product as vendor (enforces ownership)
// @route   DELETE /api/v1/vendor/products/:id
// @access  Private/Vendor
const deleteVendorProduct = async (req, res) => {
  try {
    const vendorId = (req.user._id || req.user.id).toString();
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const isOwner =
      (product.createdBy && product.createdBy.toString() === vendorId) ||
      (product.vendor && product.vendor.toString() === vendorId);

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: You do not own this product." });
    }

    // Clean up Cloudinary assets
    if (product.imagePublicId) {
      cloudinaryService.deleteImage(product.imagePublicId).catch(() => {});
    }
    if (Array.isArray(product.imagesPublicIds)) {
      for (const pid of product.imagesPublicIds) {
        cloudinaryService.deleteImage(pid).catch(() => {});
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get orders containing vendor's products
// @route   GET /api/v1/vendor/orders
// @access  Private/Vendor
const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const orders = await Order.find({ "orderItems.vendor": vendorId })
      .sort({ createdAt: -1 })
      .populate("user", "firstname lastname email phone");

    // Format orders so vendor only sees their own items and calculated totals
    const formattedOrders = orders.map((order) => {
      const myItems = order.orderItems.filter(
        (it) => it.vendor && it.vendor.toString() === vendorId.toString()
      );
      const myTotal = myItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

      return {
        _id: order._id,
        createdAt: order.createdAt,
        shippingAddress: order.shippingAddress,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        paymentMethod: order.paymentMethod,
        items: myItems,
        vendorSubtotal: myTotal,
        customer: {
          name: `${order.shippingAddress?.firstname || ""} ${order.shippingAddress?.lastname || ""}`.trim() || order.user?.firstname || "Customer",
          email: order.shippingAddress?.email || order.user?.email,
          phone: order.shippingAddress?.phone || order.user?.phone,
        },
      };
    });

    return res.status(200).json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: List all registered vendors with aggregated product and sales count
// @route   GET /api/v1/vendor/admin/all
// @access  Private/Admin
const getAdminVendorsList = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { role: "vendor" };

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { firstname: { $regex: q, $options: "i" } },
        { lastname: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { "vendorProfile.businessName": { $regex: q, $options: "i" } },
      ];
    }

    const vendors = await User.find(query).select("-password").sort({ createdAt: -1 });

    // Aggregate product counts and sales for each vendor
    const vendorStats = await Promise.all(
      vendors.map(async (v) => {
        const productCount = await Product.countDocuments({ vendor: v._id });
        const orders = await Order.find({ "orderItems.vendor": v._id });

        let totalSales = 0;
        orders.forEach((o) => {
          const vItems = o.orderItems.filter(
            (it) => it.vendor && it.vendor.toString() === v._id.toString()
          );
          totalSales += vItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
        });

        return {
          _id: v._id,
          firstname: v.firstname,
          lastname: v.lastname,
          email: v.email,
          phone: v.phone,
          avatar: v.avatar,
          createdAt: v.createdAt,
          vendorProfile: v.vendorProfile || {},
          productCount,
          orderCount: orders.length,
          totalSales,
        };
      })
    );

    return res.status(200).json({
      success: true,
      vendors: vendorStats,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getVendorDashboard,
  getVendorProducts,
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
  getVendorOrders,
  getAdminVendorsList,
};
