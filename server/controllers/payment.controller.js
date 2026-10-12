const Order = require("../models/order.model");
const Product = require("../models/product.model");
const emailService = require("../services/email.service");

const PAYSTACK_SECRET_KEY =
  process.env.PAYSTACK_SECRET_KEY ||
  "sk_test_63c651140f793292d1cf55071850d1a8cbeb6727";

// POST /api/v1/payment/paystack/initialize
// Initialize a Paystack transaction and get reference / authorization URL
const initializePaystack = async (req, res) => {
  try {
    const { email, amount, orderId, metadata = {} } = req.body;

    if (!email || !amount) {
      return res.status(400).json({
        success: false,
        message: "Email and amount are required to initialize Paystack payment.",
      });
    }

    // Paystack amounts are in KOBO (multiply Naira by 100)
    const amountInKobo = Math.round(Number(amount) * 100);

    const reference = `ATL_${orderId ? orderId.toString().slice(-6) : "ORD"}_${Date.now()}`;

    const paystackPayload = {
      email,
      amount: amountInKobo,
      currency: "NGN",
      reference,
      metadata: {
        orderId,
        userId: req.user ? req.user.id : undefined,
        ...metadata,
      },
    };

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackPayload),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      return res.status(400).json({
        success: false,
        message: data.message || "Failed to initialize Paystack payment.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
        reference: data.data.reference,
      },
    });
  } catch (error) {
    console.error("Paystack initialization error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error initializing Paystack transaction.",
      error: error.message,
    });
  }
};

// POST /api/v1/payment/paystack/verify
// Server-side verification of Paystack reference and update order status
const verifyPaystack = async (req, res) => {
  try {
    const { reference, orderId } = req.body;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Transaction reference is required for verification.",
      });
    }

    // Call Paystack verify endpoint
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return res.status(400).json({
        success: false,
        message: data.message || "Transaction verification failed on Paystack.",
      });
    }

    const txData = data.data;

    // Check if the transaction actually succeeded
    if (txData.status !== "success") {
      return res.status(400).json({
        success: false,
        message: `Transaction not successful. Paystack status: ${txData.status}`,
      });
    }

    // If an orderId is provided, find and update the Order
    let updatedOrder = null;
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.isPaid = true;
        order.paidAt = new Date(txData.paid_at || Date.now());
        order.paymentStatus = "Paid";
        order.paymentMethod = `Paystack (${txData.channel ? txData.channel.toUpperCase() : "CARD/TRANSFER"})`;
        order.paymentReference = reference;
        order.paymentChannel = txData.channel || "card";
        order.paymentDetails = {
          gatewayResponse: txData.gateway_response,
          ipAddress: txData.ip_address,
          paidAt: txData.paid_at,
          currency: txData.currency,
          customer: txData.customer,
          authorization: txData.authorization
            ? {
                brand: txData.authorization.brand,
                last4: txData.authorization.last4,
                bank: txData.authorization.bank,
                country_code: txData.authorization.country_code,
              }
            : null,
        };
        order.orderStatus = "Confirmed";

        updatedOrder = await order.save();

        // Send payment confirmation email only once
        if (!order.paymentEmailSent) {
          emailService.sendPaymentConfirmationEmail(updatedOrder, {
            reference: txData.reference,
            amount: txData.amount / 100,
            channel: txData.channel || "card",
            paidAt: txData.paid_at || Date.now(),
          }).then((res) => {
            if (res && res.success) {
              Order.findByIdAndUpdate(updatedOrder._id, { paymentEmailSent: true }).catch(() => {});
            }
          }).catch((err) => {
            console.warn("[EmailService] Payment confirmation email warning:", err.message);
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment successfully verified.",
      data: {
        reference: txData.reference,
        amount: txData.amount / 100, // converted back from kobo
        channel: txData.channel,
        paidAt: txData.paid_at,
        order: updatedOrder,
      },
    });
  } catch (error) {
    console.error("Paystack verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error verifying Paystack transaction.",
      error: error.message,
    });
  }
};

module.exports = {
  initializePaystack,
  verifyPaystack,
};
