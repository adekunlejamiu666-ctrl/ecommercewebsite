import api from "./api";

export const vendorService = {
  // ── User Vendor Application ──────────────────────────────────────────────
  async submitApplication(data) {
    const res = await api.post("/vendor-requests", data);
    return res.data;
  },

  async getMyApplicationStatus() {
    const res = await api.get("/vendor-requests/my-status");
    return res.data;
  },

  // ── Admin Vendor Application Review ──────────────────────────────────────
  async getAdminVendorRequests(params = {}) {
    const res = await api.get("/vendor-requests/admin/all", { params });
    return res.data;
  },

  async getAdminVendorRequestById(id) {
    const res = await api.get(`/vendor-requests/admin/${id}`);
    return res.data;
  },

  async approveVendorRequest(id) {
    const res = await api.put(`/vendor-requests/admin/${id}/approve`);
    return res.data;
  },

  async rejectVendorRequest(id, rejectionReason) {
    const res = await api.put(`/vendor-requests/admin/${id}/reject`, { rejectionReason });
    return res.data;
  },

  // ── Admin Vendors List ───────────────────────────────────────────────────
  async getAdminVendors(params = {}) {
    const res = await api.get("/vendor/admin/all", { params });
    return res.data;
  },

  // ── Vendor Dashboard Operations ──────────────────────────────────────────
  async getVendorDashboard() {
    const res = await api.get("/vendor/dashboard");
    return res.data;
  },

  async getVendorProducts(params = {}) {
    const res = await api.get("/vendor/products", { params });
    return res.data;
  },

  async createVendorProduct(data) {
    const res = await api.post("/vendor/products", data);
    return res.data;
  },

  async updateVendorProduct(id, data) {
    const res = await api.put(`/vendor/products/${id}`, data);
    return res.data;
  },

  async deleteVendorProduct(id) {
    const res = await api.delete(`/vendor/products/${id}`);
    return res.data;
  },

  async getVendorOrders() {
    const res = await api.get("/vendor/orders");
    return res.data;
  },
};

export default vendorService;
