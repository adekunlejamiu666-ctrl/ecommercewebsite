import api from "./api";

const paymentService = {
  // Initialize Paystack transaction
  initializePaystack: async ({ email, amount, orderId, metadata }) => {
    const res = await api.post("/payment/paystack/initialize", {
      email,
      amount,
      orderId,
      metadata,
    });
    return res.data;
  },

  // Verify Paystack transaction by reference
  verifyPaystack: async ({ reference, orderId }) => {
    const res = await api.post("/payment/paystack/verify", {
      reference,
      orderId,
    });
    return res.data;
  },
};

export default paymentService;
