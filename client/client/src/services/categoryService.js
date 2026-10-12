import api from "./api";

export const categoryService = {
  // Public: Get all categories
  async getCategories() {
    const res = await api.get("/categories");
    return res.data;
  },

  // Admin: Create category
  async createCategory(categoryData) {
    const res = await api.post("/categories", categoryData);
    return res.data;
  },

  // Admin: Update category
  async updateCategory(id, categoryData) {
    const res = await api.put(`/categories/${id}`, categoryData);
    return res.data;
  },

  // Admin: Delete category
  async deleteCategory(id) {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
};

export default categoryService;
