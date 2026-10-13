const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const dns = require("dns");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

// Try to set Google DNS resolvers for MongoDB Atlas SRV lookup
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  console.warn("[DNS] Could not set custom DNS servers:", e.message);
}

const connectDB = require("./database/connectDB");
const app = express();

// Normalize CLIENT_URL: ensure it always starts with https://
const rawClientUrl = process.env.CLIENT_URL || "";
const normalizedClientUrl = rawClientUrl
  ? rawClientUrl.startsWith("http")
    ? rawClientUrl
    : `https://${rawClientUrl}`
  : "";

const allowedOrigins = [
  normalizedClientUrl,
  "https://ecommercewebsite-uxqh.vercel.app",
  "https://ecommercewebsite-pi-lovat.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5175",
].filter(Boolean);

// ── Bulletproof CORS Middleware ──────────────────────────────────────────────
// Ensures Access-Control headers are present on EVERY request (GET, POST, OPTIONS, 4xx, 5xx)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isAllowed =
    !origin ||
    allowedOrigins.includes(origin) ||
    origin.endsWith(".vercel.app") ||
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", isAllowed && origin ? origin : "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Fast preflight response — answer in 0ms without running body parsers or database queries
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Express built-in body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Database Connection Middleware (Serverless-Safe) ─────────────────────────
// Lazily connects / reuses Mongoose connection for API requests
app.use(async (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  try {
    await connectDB();
  } catch (err) {
    console.error("[Database] Connection warning:", err.message);
  }
  next();
});

// ── Health Check / Root Routes ───────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "E-Commerce API is live and operational",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "ecommerce-api",
    timestamp: new Date().toISOString(),
  });
});

// ── Route Handlers ───────────────────────────────────────────────────────────
const UserRouter = require("./routes/user.routes");
const CategoryRouter = require("./routes/category.routes");
const ProductRouter = require("./routes/product.routes");
const OrderRouter = require("./routes/order.routes");
const MessageRouter = require("./routes/message.routes");
const VendorRequestRouter = require("./routes/vendorRequest.routes");
const VendorRouter = require("./routes/vendor.routes");
const PaymentRouter = require("./routes/payment.routes");
const UploadRouter = require("./routes/upload.routes");

// Auth & User Routes
// Public:  POST /api/v1/register    POST /api/v1/login
//          POST /api/v1/forgot-password  POST /api/v1/reset-password
// Private: GET/PUT /api/v1/profile
// Admin:   GET /api/v1/users/admin/all  PUT /api/v1/users/admin/:id/role
//          DELETE /api/v1/users/admin/:id
app.use("/api/v1", UserRouter);
app.use("/api/v1/users", UserRouter);

// Categories & Products
app.use("/api/v1/categories", CategoryRouter);
app.use("/api/v1/products", ProductRouter);

// Orders
app.use("/api/v1/orders", OrderRouter);

// Payments (Paystack)
app.use("/api/v1/payment", PaymentRouter);

// Cloudinary Uploads
app.use("/api/v1/upload", UploadRouter);

// Messages
app.use("/api/v1/messages", MessageRouter);

// Vendor Requests & Vendor Portal
app.use("/api/v1/vendor-requests", VendorRequestRouter);
app.use("/api/v1/vendor", VendorRouter);

// ── Global 404 Handler ───────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found.`,
  });
});

// ── Global Error Handling Middleware ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[ServerError]", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    message: err.message || "An unexpected server error occurred.",
  });
});

// ── Standalone Server Listener (Disabled in Vercel Serverless) ────────────────
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5009;
  app.listen(PORT, () => {
    console.log("Server started on port", PORT);
  });
}

module.exports = app;