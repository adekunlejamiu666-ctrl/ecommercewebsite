const path = require("path");
const dotenv = require("dotenv");
const dns = require("dns");
const bcryptjs = require("bcryptjs");

dotenv.config({ path: path.join(__dirname, "../.env") });
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = require("./connectDB");
const User = require("../models/user.models");
const Category = require("../models/category.model");
const Product = require("../models/product.model");
const { categoriesData, productsData } = require("./productsData");




async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await connectDB();

    console.log("Seeding Categories...");
    try {
      await Category.collection.drop();
    } catch (e) {
      // collection might not exist yet
    }
    const insertedCategories = await Category.insertMany(categoriesData);
    console.log(`Inserted ${insertedCategories.length} categories.`);

    console.log("Seeding Products...");
    try {
      await Product.collection.drop();
    } catch (e) {
      // collection might not exist yet
    }
    const insertedProducts = await Product.insertMany(productsData);
    console.log(`Inserted ${insertedProducts.length} products.`);

    console.log("Ensuring Admin Account exists...");
    const adminEmail = "adekunlejamiu3077@gmail.com";
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash("Adekunlejamiu@123456", salt);

      adminUser = await User.create({
        firstname: "Adekunle",
        lastname: "Jamiu",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log(`Created Admin account: ${adminEmail}`);
    } else {
      adminUser.role = "admin";
      await adminUser.save();
      console.log(`Admin account confirmed: ${adminEmail}`);
    }

    console.log("\nSEEDING COMPLETED SUCCESSFULLY!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedDatabase();
