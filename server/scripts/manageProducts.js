const path = require("path");
const dotenv = require("dotenv");
const dns = require("dns");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "../.env") });
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = require("../database/connectDB");
const Product = require("../models/product.model");

async function run() {
  try {
    await connectDB();

    const allProducts = await Product.find({}).sort({ createdAt: -1 });
    console.log(`=== TOTAL PRODUCTS IN DATABASE: ${allProducts.length} ===`);

    for (const p of allProducts) {
      const isBase64 = p.image && p.image.startsWith("data:");
      console.log({
        id: p._id.toString(),
        name: p.name,
        price: p.price,
        oldPrice: p.oldPrice,
        imageType: isBase64 ? "BASE64_UPLOAD" : (p.image?.startsWith("http") ? "URL" : "OTHER"),
        imageSnippet: p.image?.slice(0, 50),
        sellerType: p.sellerType,
        createdAt: p.createdAt,
      });
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
