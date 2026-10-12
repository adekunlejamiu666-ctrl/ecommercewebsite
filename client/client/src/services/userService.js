import api from "./api";

export const userService = {
  // Admin: Get all users with search and pagination
  async getAllUsers(params = {}) {
    const res = await api.get("/users/admin/all", { params });
    return res.data;
  },

  // Admin: Update user role
  async updateUserRole(id, role) {
    const res = await api.put(`/users/admin/${id}/role`, { role });
    return res.data;
  },

  // Admin: Remove user
  async deleteUser(id) {
    const res = await api.delete(`/users/admin/${id}`);
    return res.data;
  },
};

export default userService;
