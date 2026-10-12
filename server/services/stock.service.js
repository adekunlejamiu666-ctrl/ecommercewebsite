const Product = require("../models/product.model");
const emailService = require("./email.service");

/**
 * Check a single product's stock and trigger email alert if entering low-stock (<10)
 * Uses transition detection to prevent duplicate alerts.
 * Resets alert state when stock is replenished to 10 or more.
 */
const checkStockAndNotify = async (product) => {
  if (!product) return;

  try {
    const stock = Number(product.stock) || 0;

    // Transition into low stock (< 10)
    if (stock < 10 && !product.lowStockAlertSent) {
      // Send email alert to store admin
      const emailResult = await emailService.sendLowStockAlertEmail(product);
      if (emailResult && emailResult.success) {
        product.lowStockAlertSent = true;
        await Product.findByIdAndUpdate(product._id, { lowStockAlertSent: true });
      }
    } else if (stock >= 10 && product.lowStockAlertSent) {
      // Stock was replenished to 10 or more -> reset alert state
      product.lowStockAlertSent = false;
      await Product.findByIdAndUpdate(product._id, { lowStockAlertSent: false });
    }
  } catch (error) {
    console.error("[StockService] Error in checkStockAndNotify:", error.message);
  }
};

/**
 * Check multiple products (e.g. after order items are decremented)
 */
const checkBatchStockAndNotify = async (productIds = []) => {
  if (!productIds || productIds.length === 0) return;

  for (const id of productIds) {
    try {
      const product = await Product.findById(id);
      if (product) {
        await checkStockAndNotify(product);
      }
    } catch (err) {
      console.warn(`[StockService] Failed checking stock for ${id}:`, err.message);
    }
  }
};

/**
 * Query low-stock products (stock < 10) with pagination and filtering
 */
const getLowStockProducts = async ({ page = 1, limit = 10, search = "", category = "" } = {}) => {
  const query = {
    stock: { $lt: 10 },
  };

  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { sku: { $regex: search.trim(), $options: "i" } },
      { brand: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (category && category !== "All" && category.trim()) {
    query.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .select("_id name slug sku price oldPrice stock image category brand status sellerType vendor createdAt")
    .populate("vendor", "firstname lastname email")
    .sort({ stock: 1, createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  return {
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    count: products.length,
    products,
  };
};

module.exports = {
  checkStockAndNotify,
  checkBatchStockAndNotify,
  getLowStockProducts,
};
