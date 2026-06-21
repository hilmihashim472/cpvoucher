require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Category = require("./models/Category");
const Voucher = require("./models/Voucher");
const CartItem = require("./models/CartItem");
const CartItemHistory = require("./models/CartItemHistory");

const connectDB = require("./config/db");

const seedData = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected for seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Voucher.deleteMany({});
    await CartItem.deleteMany({});
    await CartItemHistory.deleteMany({});
    console.log("Cleared existing data");

    // Create Categories
    const categories = await Category.create([
      { name: "Food" },
      { name: "Tech" },
      { name: "Travel" },
      { name: "Fashion" },
      { name: "Home" },
    ]);
    console.log("Categories created:", categories.map(c => c.name));

    // Hash passwords
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create Users
    const admin = await User.create({
      email: "admin@cpvoucher.com",
      username: "Admin",
      fullName: "Admin User",
      password: hashedPassword,
      role: "admin",
      points: 5000,
    });

    const user1 = await User.create({
      email: "john@example.com",
      username: "John Doe",
      fullName: "John Doe",
      password: hashedPassword,
      points: 2500,
    });

    const user2 = await User.create({
      email: "jane@example.com",
      username: "Jane Smith",
      fullName: "Jane Smith",
      password: hashedPassword,
      points: 1800,
    });

    console.log("Users created: Admin, John Doe, Jane Smith");

    // Create Vouchers
    const vouchers = await Voucher.create([
      {
        title: "Starbucks Free Drink",
        description: "Get any Grande drink for free",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
        points: 500,
        category_id: categories[0]._id, // Food
        brand: "Starbucks",
        discountAmount: 10,
        code: "SBUX-FREE-50",
        storeName: "Starbucks",
        tagline: "Premium coffee experience",
        brandUrl: "https://www.starbucks.com",
      },
      {
        title: "Adidas 30% Off",
        description: "30% discount on all Adidas products",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        points: 800,
        category_id: categories[3]._id, // Fashion
        brand: "Adidas",
        discountAmount: 15,
        code: "ADIDAS-30OFF",
        storeName: "Adidas",
        tagline: "Impossible is nothing",
        brandUrl: "https://www.adidas.com",
      },
      {
        title: "Amazon $50 Gift Card",
        description: "$50 Amazon shopping voucher",
        image: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400",
        points: 5000,
        category_id: categories[1]._id, // Tech
        brand: "Amazon",
        discountAmount: 50,
        code: "AMZN-50-GIFT",
        storeName: "Amazon",
        tagline: "Earth's most customer-centric company",
        brandUrl: "https://www.amazon.com",
      },
      {
        title: "Airbnb $100 Credit",
        description: "$100 credit for your next stay",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
        points: 10000,
        category_id: categories[2]._id, // Travel
        brand: "Airbnb",
        discountAmount: 100,
        code: "AIRBNB-100",
        storeName: "Airbnb",
        tagline: "Belong anywhere",
        brandUrl: "https://www.airbnb.com",
      },
      {
        title: "IKEA $20 Voucher",
        description: "$20 off on home furniture",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
        points: 2000,
        category_id: categories[4]._id, // Home
        brand: "IKEA",
        discountAmount: 20,
        code: "IKEA-20-OFF",
        storeName: "IKEA",
        tagline: "Creating a better everyday life",
        brandUrl: "https://www.ikea.com",
      },
      {
        title: "McDonald's Free Meal",
        description: "Free Big Mac meal combo",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        points: 300,
        category_id: categories[0]._id, // Food
        brand: "McDonald's",
        discountAmount: 8,
        code: "MCD-FREE-MEAL",
        storeName: "McDonald's",
        tagline: "I'm lovin' it",
        brandUrl: "https://www.mcdonalds.com",
      },
    ]);
    console.log("Vouchers created:", vouchers.length);

    // Create some cart items for user1
    await CartItem.create([
      { user: user1._id, voucher: vouchers[0]._id, quantity: 2 },
      { user: user1._id, voucher: vouchers[1]._id, quantity: 1 },
    ]);
    console.log("Cart items created for John Doe");

    // Create some order history for user1
    await CartItemHistory.create([
      {
        user: user1._id,
        voucher: vouchers[5]._id,
        quantity: 1,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        user: user1._id,
        voucher: vouchers[4]._id,
        quantity: 2,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ]);
    console.log("Order history created for John Doe");

    console.log("\n=== SEEDING COMPLETED SUCCESSFULLY ===");
    console.log("\nTest Accounts:");
    console.log("Admin: admin@cpvoucher.com / password123");
    console.log("User:  john@example.com / password123");
    console.log("User:  jane@example.com / password123");
    console.log("\nCategories:", categories.map(c => c.name).join(", "));
    console.log("Total Vouchers:", vouchers.length);

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedData();