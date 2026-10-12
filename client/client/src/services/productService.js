import api from "./api";

export const productService = {
  // Query products with filters, sorting, and pagination
  async getProducts(params = {}) {
    const res = await api.get("/products", { params });
    return res.data;
  },

  // Get single product by ID or slug (includes related products)
  async getProductById(id) {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  // Admin: Create product
  async createProduct(productData) {
    const res = await api.post("/products", productData);
    return res.data;
  },

  // Admin: Update product
  async updateProduct(id, productData) {
    const res = await api.put(`/products/${id}`, productData);
    return res.data;
  },

  // Admin: Delete product
  async deleteProduct(id) {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },

  // Admin: Get low-stock catalog products (stock < 10)
  async getLowStockProducts(params = {}) {
    const res = await api.get("/products/admin/low-stock", { params });
    return res.data;
  },
};

export default productService;
