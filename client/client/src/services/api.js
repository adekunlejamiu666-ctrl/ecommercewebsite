import axios from "axios";

// Reads from client/.env → VITE_API_URL, falls back to localhost:5008
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://ecommercewebsite-pi-lovat.vercel.app/api/v1";

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
    // IMPORTANT: Do NOT redirect when the user is on the login/register page
    // (e.g. wrong password gives a 401 which should show an error, not redirect)
    if (error.response?.status === 401) {
      const isAuthPage =
        window.location.pathname.startsWith("/login") ||
        window.location.pathname.startsWith("/register");

      // Only clear session & redirect if the user already had an active token
      // AND we are NOT currently on an auth page (prevent redirect loops)
      const hadToken = !!localStorage.getItem("token");
      if (hadToken && !isAuthPage) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
