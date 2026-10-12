import axios from "axios";

// Reads from client/.env → VITE_API_URL, falls back to localhost:5008
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5008/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // set to true if the backend uses cookies
});

// ── Request Interceptor ────────────────────────────────────────────────────
// Automatically attach JWT Bearer token from localStorage on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────────────────────
// Normalize error messages; handle expired/invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected server error occurred.";

    // Token expired or invalid → clear session and redirect to login
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem("token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only hard-redirect if the user was actually logged in (avoid redirect loops)
      if (hadToken && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
