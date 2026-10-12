import api from "./api";

export const authService = {
  // Login
  async login(email, password) {
    const res = await api.post("/login", { email, password });
    // Backend returns { message: "...", data: { firstname, lastname, email, role, token, ... } }
    return res.data?.data || res.data;
  },

  // Register
  async register(userData) {
    const res = await api.post("/register", {
      firstname: userData.firstname,
      lastname: userData.lastname,
      email: userData.email,
      password: userData.password,
      avatar: userData.avatar || "",
    });
    // Backend returns { message: "...", user: { id, firstname, lastname, email, role, token, ... } }
    return res.data?.user || res.data;
  },

  // Forgot password request
  async forgotPassword(email) {
    const res = await api.post("/forgot-password", { email });
    return res.data;
  },

  // Reset password
  async resetPassword(token, password) {
    const res = await api.post("/reset-password", { token, password });
    return res.data;
  },

  // Get current user profile
  async getProfile() {
    const res = await api.get("/profile");
    return res.data?.user || res.data;
  },

  // Update current user profile
  async updateProfile(profileData) {
    const res = await api.put("/profile", profileData);
    return res.data?.user || res.data;
  },
};

export default authService;
