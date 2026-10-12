const Order = require("../models/order.model");
const Product = require("../models/product.model");
const emailService = require("../services/email.service");
const stockService = require("../services/stock.service");

// POST /api/v1/orders - Create a new order (Protected)
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      deliveryMethod,
      paymentMethod,
      paymentReference,
      paymentStatus,
      paymentChannel,
      subtotal,
      shippingPrice,
      discount = 0,
      totalAmount,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: "No items in order." });
    }

    if (
      !shippingAddress ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.country
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required.",
      });
    }

    // Resolve and attach vendor for each order item if not provided
    const enhancedOrderItems = [];
    for (const item of orderItems) {
      let vendorId = item.vendor || null;
      if (!vendorId && item.product) {
        const prod = await Product.findById(item.product).select("vendor createdBy sellerType");
        if (prod && (prod.sellerType === "vendor" || prod.vendor)) {
          vendorId = prod.vendor || prod.createdBy || null;
        }
      }
      enhancedOrderItems.push({
        ...item,
        vendor: vendorId,
      });
    }

    const resolvedPaymentMethod = paymentMethod || "Paystack (Card/Transfer)";
    const isPaidOrder = paymentStatus === "Paid" || Boolean(paymentReference);

    // Create the order document
    const order = new Order({
      user: req.user.id,
      orderItems: enhancedOrderItems,
      shippingAddress,
      deliveryMethod: deliveryMethod || { title: "Standard Delivery", price: 0 },
      paymentMethod: resolvedPaymentMethod,
      paymentStatus: isPaidOrder ? "Paid" : (paymentStatus || "Pending"),
      paymentReference: paymentReference || "",
      paymentChannel: paymentChannel || "",
      orderStatus: "Confirmed",
      isPaid: isPaidOrder,
      paidAt: isPaidOrder ? Date.now() : null,
      subtotal,
      shippingPrice,
      discount,
      totalAmount,
    });

    const savedOrder = await order.save();

    // Safely decrement stock for each ordered item and collect product IDs
    const affectedProductIds = [];
    for (const item of orderItems) {
      if (item.product) {
        affectedProductIds.push(item.product);
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        }).catch((err) => console.warn("Stock decrement warning:", err.message));
      }
    }

    // Check for low-stock transitions (<10) and trigger admin notification if needed
    if (affectedProductIds.length > 0) {
      stockService.checkBatchStockAndNotify(affectedProductIds).catch((err) => {
        console.warn("[StockService] Low stock check warning:", err.message);
      });
    }

    // Send order confirmation email
    emailService.sendOrderConfirmationEmail(savedOrder).then((res) => {
      if (res && res.success) {
        Order.findByIdAndUpdate(savedOrder._id, { confirmationEmailSent: true }).catch(() => {});
      }
    }).catch((err) => {
      console.warn("[EmailService] Order confirmation email warning:", err.message);
    });

    // If order was already marked paid upon creation, send payment confirmation email
    if (isPaidOrder) {
      emailService.sendPaymentConfirmationEmail(savedOrder, {
        reference: savedOrder.paymentReference,
        amount: savedOrder.totalAmount,
        channel: savedOrder.paymentChannel || "card",
      }).then((res) => {
        if (res && res.success) {
          Order.findByIdAndUpdate(savedOrder._id, { paymentEmailSent: true }).catch(() => {});
        }
      }).catch((err) => {
        console.warn("[EmailService] Payment confirmation email warning:", err.message);
      });
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order: savedOrder,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/orders/my-orders - Get logged-in user's orders (Protected)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/orders/:id - Get single order by ID (Protected)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "firstname lastname email phone"
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Only allow customer who placed the order or an admin to access
    if (
      order.user._id.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden. Not authorized to view this order.",
      });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/orders/admin/all - Get all orders (Admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== "All") {
      query.orderStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "firstname lastname email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      orders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/v1/orders/:id/status - Update order status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === "Delivered") {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      if (paymentStatus === "Paid") {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
    }

    const updatedOrder = await order.save();
    return res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
