const mongoose = require("mongoose");
const Product = require("../models/product.model");
const cloudinaryService = require("../services/cloudinary.service");
const stockService = require("../services/stock.service");

// GET /api/v1/products - Fetch products with filters, sorting, and pagination
const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      featured,
      newArrival,
      bestSeller,
      sort,
      sellerType,
      seller,
      status,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Status filter: defaults to active for customer marketplace, supports "all" or specific for admin
    if (status) {
      if (status !== "all" && status !== "All") {
        query.status = status;
      }
    } else {
      query.status = "active";
    }

    // Keyword search
    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    // Category filter
    if (category && category !== "All") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    // Brand filter
    if (brand && brand !== "All") {
      query.brand = brand;
    }

    // Seller Type filter ("admin" | "vendor")
    if (sellerType && sellerType !== "All" && sellerType !== "all") {
      query.sellerType = sellerType.toLowerCase();
    }

    // Specific Seller filter (User ObjectId)
    if (seller && seller !== "All" && mongoose.isValidObjectId(seller)) {
      query.$or = [{ createdBy: seller }, { vendor: seller }];
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Minimum Rating
    if (minRating && Number(minRating) > 0) {
      query.rating = { $gte: Number(minRating) };
    }

    // Stock availability
    if (inStock === "true") {
      query.stock = { $gt: 0 };
    }

    // Special Flags
    if (featured === "true") query.isFeatured = true;
    if (newArrival === "true") query.isNewArrival = true;
    if (bestSeller === "true") query.isBestSeller = true;

    // Sorting
    let sortOptions = { createdAt: -1, _id: -1 };
    if (sort === "price-low-high") sortOptions = { price: 1 };
    else if (sort === "price-high-low") sortOptions = { price: -1 };
    else if (sort === "highest-rated") sortOptions = { rating: -1 };
    else if (sort === "bestselling") sortOptions = { isBestSeller: -1, rating: -1 };
    else if (sort === "newest") sortOptions = { createdAt: -1, _id: -1 };

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate("vendor", "firstname lastname vendorProfile role email")
      .populate("createdBy", "firstname lastname vendorProfile role email");

    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      products,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/products/admin/low-stock - Fetch products with stock below 10 units (Protected Admin)
const getLowStockProducts = async (req, res) => {
  try {
    const { page, limit, search, category } = req.query;
    const result = await stockService.getLowStockProducts({ page, limit, search, category });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/products/:id - Fetch single product by ID or slug
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    let product;

    if (mongoose.isValidObjectId(id)) {
      product = await Product.findById(id)
        .populate("vendor", "firstname lastname vendorProfile role email")
        .populate("createdBy", "firstname lastname vendorProfile role email");
    }

    if (!product) {
      product = await Product.findOne({ slug: id })
        .populate("vendor", "firstname lastname vendorProfile role email")
        .populate("createdBy", "firstname lastname vendorProfile role email");
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    // Also fetch related products from same category
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: "active",
    })
      .limit(4)
      .populate("vendor", "firstname lastname vendorProfile role")
      .populate("createdBy", "firstname lastname vendorProfile role");

    return res.status(200).json({ success: true, product, related });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/v1/products - Create product (Admin or Approved Vendor)
const createProduct = async (req, res) => {
  try {
    // Role verification
    const isVendor = req.user?.role === "vendor";
    const isAdmin = req.user?.role === "admin";

    if (!isVendor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Admin and approved Vendors can create products.",
      });
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
      isFeatured,
      isNewArrival,
      isBestSeller,
      status,
    } = req.body;

    if (!name || !description || price === undefined || !category || !brand || !image) {
      return res.status(400).json({
        success: false,
        message: "Name, description, price, category, brand, and primary image are required.",
      });
    }

    // Process primary image with Cloudinary if Base64 Data URI
    let primaryImage = image.trim();
    let imagePublicId = "";
    if (primaryImage.startsWith("data:image/")) {
      try {
        const uploadRes = await cloudinaryService.uploadDataUri(primaryImage, "products");
        primaryImage = uploadRes.url;
        imagePublicId = uploadRes.public_id;
      } catch (err) {
        console.warn("[Cloudinary] Primary image upload warning:", err.message);
      }
    }

    // Process gallery images with Cloudinary if any are Base64
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
          console.warn("[Cloudinary] Gallery image upload warning:", err.message);
        }
      } else if (typeof img === "string" && img.trim()) {
        galleryImages.push(img.trim());
      }
    }
    if (galleryImages.length === 0) {
      galleryImages = [primaryImage];
    }

    const discount =
      oldPrice && oldPrice > price
        ? Math.round(((oldPrice - price) / oldPrice) * 100)
        : 0;

    const userId = req.user._id || req.user.id;
    const sellerType = isVendor ? "vendor" : "admin";
    const vendorId = isVendor ? userId : (req.body.vendor || null);

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      discount,
      category: category.trim(),
      brand: brand.trim(),
      stock: Number(stock) || 0,
      sku: sku && sku.trim() ? sku.trim() : undefined,
      sizes: Array.isArray(sizes) ? sizes : [],
      colors: Array.isArray(colors) ? colors : [],
      image: primaryImage,
      imagePublicId,
      images: galleryImages,
      imagesPublicIds: galleryPublicIds,
      specifications: specifications || {},
      isFeatured: !!isFeatured,
      isNewArrival: !!isNewArrival,
      isBestSeller: !!isBestSeller,
      status: status || "active",
      createdBy: userId,
      sellerType,
      vendor: vendorId,
    });

    // Check low-stock transition
    await stockService.checkStockAndNotify(product);

    const populatedProduct = await Product.findById(product._id)
      .populate("vendor", "firstname lastname vendorProfile role email")
      .populate("createdBy", "firstname lastname vendorProfile role email");

    return res.status(201).json({ success: true, product: populatedProduct });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/v1/products/:id - Update product (Admin or Product Owner Vendor)
const updateProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    // Ownership check for vendors: must be the creator or assigned vendor
    const userId = (req.user._id || req.user.id).toString();
    const isOwner =
      (existing.createdBy && existing.createdBy.toString() === userId) ||
      (existing.vendor && existing.vendor.toString() === userId);

    if (req.user?.role === "vendor" && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to modify this product.",
      });
    }

    const updateData = { ...req.body };

    // Prevent overriding ownership fields
    delete updateData.createdBy;
    delete updateData.sellerType;
    if (req.user?.role === "vendor") {
      delete updateData.vendor;
    }

    // Handle primary image replacement with Cloudinary
    let oldImagePublicIdToDelete = null;
    if (updateData.image && typeof updateData.image === "string" && updateData.image.startsWith("data:image/")) {
      try {
        const uploadRes = await cloudinaryService.uploadDataUri(updateData.image, "products");
        oldImagePublicIdToDelete = existing.imagePublicId || null;
        updateData.image = uploadRes.url;
        updateData.imagePublicId = uploadRes.public_id;
      } catch (err) {
        console.warn("[Cloudinary] Primary image replacement warning:", err.message);
      }
    }

    // Handle gallery images update
    if (Array.isArray(updateData.images)) {
      const updatedGallery = [];
      const updatedPublicIds = [];
      for (const img of updateData.images) {
        if (typeof img === "string" && img.startsWith("data:image/")) {
          try {
            const res = await cloudinaryService.uploadDataUri(img, "products");
            updatedGallery.push(res.url);
            updatedPublicIds.push(res.public_id);
          } catch (err) {
            console.warn("[Cloudinary] Gallery upload warning:", err.message);
          }
        } else if (typeof img === "string" && img.trim()) {
          updatedGallery.push(img.trim());
        }
      }
      updateData.images = updatedGallery;
      if (updatedPublicIds.length > 0) {
        updateData.imagesPublicIds = updatedPublicIds;
      }
    }

    if (updateData.price !== undefined && updateData.oldPrice !== undefined) {
      if (updateData.oldPrice && updateData.oldPrice > updateData.price) {
        updateData.discount = Math.round(
          ((updateData.oldPrice - updateData.price) / updateData.oldPrice) * 100
        );
      } else {
        updateData.discount = 0;
      }
    }

    if (updateData.sku === "" || updateData.sku === null) {
      updateData.sku = undefined;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("vendor", "firstname lastname vendorProfile role email")
      .populate("createdBy", "firstname lastname vendorProfile role email");

    // Clean up old Cloudinary asset only after replacement succeeds
    if (oldImagePublicIdToDelete) {
      cloudinaryService.deleteImage(oldImagePublicIdToDelete).catch(() => {});
    }

    // Check stock transition
    await stockService.checkStockAndNotify(product);

    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/products/:id - Delete product (Admin or Product Owner Vendor)
const deleteProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    // Ownership check for vendors
    const userId = (req.user._id || req.user.id).toString();
    const isOwner =
      (existing.createdBy && existing.createdBy.toString() === userId) ||
      (existing.vendor && existing.vendor.toString() === userId);

    if (req.user?.role === "vendor" && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this product.",
      });
    }

    // Clean up Cloudinary assets
    if (existing.imagePublicId) {
      cloudinaryService.deleteImage(existing.imagePublicId).catch(() => {});
    }
    if (Array.isArray(existing.imagesPublicIds)) {
      for (const pid of existing.imagesPublicIds) {
        cloudinaryService.deleteImage(pid).catch(() => {});
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getLowStockProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
