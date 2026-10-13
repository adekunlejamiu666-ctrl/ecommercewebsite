const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const dns = require("dns");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const connectDB = require("./database/connectDB");
const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://ecommercewebsite-uxqh.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",    // Vite fallback port
  "http://127.0.0.1:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5175",
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const UserRouter = require("./routes/user.routes");
const CategoryRouter = require("./routes/category.routes");
const ProductRouter = require("./routes/product.routes");
const OrderRouter = require("./routes/order.routes");
const MessageRouter = require("./routes/message.routes");
const VendorRequestRouter = require("./routes/vendorRequest.routes");
const VendorRouter = require("./routes/vendor.routes");
const PaymentRouter = require("./routes/payment.routes");
const UploadRouter = require("./routes/upload.routes");

//  Auth & User Routes 
// Public:  POST /api/v1/register    POST /api/v1/login
//          POST /api/v1/forgot-password  POST /api/v1/reset-password
// Private: GET/PUT /api/v1/profile
// Admin:   GET /api/v1/users/admin/all  PUT /api/v1/users/admin/:id/role
//          DELETE /api/v1/users/admin/:id
app.use("/api/v1", UserRouter);          // handles /register /login /profile /forgot-password /reset-password
app.use("/api/v1/users", UserRouter);    // handles /admin/all  /admin/:id/role  /admin/:id (DELETE)

//  Categories & Products 
app.use("/api/v1/categories", CategoryRouter);
app.use("/api/v1/products", ProductRouter);

//  Orders 
app.use("/api/v1/orders", OrderRouter);

//  Payments (Paystack) 
app.use("/api/v1/payment", PaymentRouter);

//  Cloudinary Uploads 
app.use("/api/v1/upload", UploadRouter);

//  Messages 
app.use("/api/v1/messages", MessageRouter);

//  Vendor Requests & Vendor Portal 
app.use("/api/v1/vendor-requests", VendorRequestRouter);
app.use("/api/v1/vendor", VendorRouter);

// Force Node to use Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

connectDB()
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((err) => {
    console.log("Cannot connect to DB:", err.message);
  });

const PORT = process.env.PORT || 5009;

app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});

module.exports = app;