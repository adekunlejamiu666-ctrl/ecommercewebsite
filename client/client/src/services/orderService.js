import api from "./api";

export const orderService = {
  // Customer: Create order
  async createOrder(orderData) {
    const res = await api.post("/orders", orderData);
    return res.data;
  },

  // Customer: Get own orders
  async getMyOrders() {
    const res = await api.get("/orders/my-orders");
    return res.data;
  },

  // Customer or Admin: Get single order by ID
  async getOrderById(id) {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  // Admin: Get all orders across platform
  async getAllOrders(params = {}) {
    const res = await api.get("/orders/admin/all", { params });
    return res.data;
  },

  // Admin: Update order status
  async updateOrderStatus(id, statusData) {
    const res = await api.put(`/orders/${id}/status`, statusData);
    return res.data;
  },
};

export default orderService;
