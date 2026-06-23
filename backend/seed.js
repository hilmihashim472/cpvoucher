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

    // ==========================================
    // CATEGORIES
    // ==========================================
    const categories = await Category.create([
      {
        name: "Food & Beverage",
        description: "Restaurants, cafes, and food delivery vouchers",
        icon: "UtensilsCrossed",
        color: "#F97316",
        status: "active",
      },
      {
        name: "Technology",
        description: "Gadgets, software, and digital services",
        icon: "Laptop",
        color: "#3B82F6",
        status: "active",
      },
      {
        name: "Travel",
        description: "Flights, hotels, and travel experiences",
        icon: "Plane",
        color: "#8B5CF6",
        status: "active",
      },
      {
        name: "Fashion",
        description: "Clothing, accessories, and lifestyle brands",
        icon: "ShoppingBag",
        color: "#EC4899",
        status: "active",
      },
      {
        name: "Home & Living",
        description: "Furniture, decor, and home improvement",
        icon: "Home",
        color: "#10B981",
        status: "active",
      },
      {
        name: "Health & Beauty",
        description: "Skincare, cosmetics, and wellness products",
        icon: "Heart",
        color: "#EF4444",
        status: "active",
      },
      {
        name: "Entertainment",
        description: "Movies, games, and streaming services",
        icon: "Film",
        color: "#6366F1",
        status: "active",
      },
      {
        name: "Sports & Outdoors",
        description: "Sports equipment and outdoor gear",
        icon: "Dumbbell",
        color: "#14B8A6",
        status: "draft",
      },
    ]);
    console.log("Categories created:", categories.map((c) => c.name));

    // ==========================================
    // USERS
    // ==========================================
    const hashedPassword = await bcrypt.hash("password123", 10);

    const admin = await User.create({
      email: "admin@example.com",
      username: "admin",
      fullName: "Admin User",
      password: hashedPassword,
      role: "admin",
      points: 5000,
      is_active: true,
    });

    const user1 = await User.create({
      email: "john@example.com",
      username: "johndoe",
      fullName: "John Doe",
      password: hashedPassword,
      points: 2500,
      is_active: true,
    });

    const user2 = await User.create({
      email: "jane@example.com",
      username: "janesmith",
      fullName: "Jane Smith",
      password: hashedPassword,
      points: 1800,
      is_active: true,
    });

    const user3 = await User.create({
      email: "bob@example.com",
      username: "bobwilson",
      fullName: "Bob Wilson",
      password: hashedPassword,
      points: 3200,
      is_active: true,
    });

    const user4 = await User.create({
      email: "alice@example.com",
      username: "alicebrown",
      fullName: "Alice Brown",
      password: hashedPassword,
      points: 900,
      is_active: false,
    });

    console.log("Users created: 1 admin, 3 active users, 1 inactive user");

    // ==========================================
    // VOUCHERS
    // ==========================================
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    const vouchers = await Voucher.create([
      // Active vouchers
      {
        title: "Starbucks Free Drink",
        description: "Get any Grande drink for free",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
        points: 500,
        category_id: categories[0]._id,
        brand: "Starbucks",
        discountAmount: 10,
        code: "SBUX-FREE-50",
        storeName: "Starbucks",
        tagline: "Premium coffee experience",
        brandUrl: "https://www.starbucks.com",
        quantity: 100,
        usageCount: 45,
        status: "active",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
      {
        title: "Adidas 30% Off",
        description: "30% discount on all Adidas products",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        points: 800,
        category_id: categories[3]._id,
        brand: "Adidas",
        discountAmount: 30,
        code: "ADIDAS-30OFF",
        storeName: "Adidas",
        tagline: "Impossible is nothing",
        brandUrl: "https://www.adidas.com",
        quantity: 50,
        usageCount: 12,
        status: "active",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
      {
        title: "Amazon $50 Gift Card",
        description: "$50 Amazon shopping voucher",
        image: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400",
        points: 5000,
        category_id: categories[1]._id,
        brand: "Amazon",
        discountAmount: 50,
        code: "AMZN-50-GIFT",
        storeName: "Amazon",
        tagline: "Earth's most customer-centric company",
        brandUrl: "https://www.amazon.com",
        quantity: 20,
        usageCount: 5,
        status: "active",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
      {
        title: "Airbnb $100 Credit",
        description: "$100 credit for your next stay",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
        points: 10000,
        category_id: categories[2]._id,
        brand: "Airbnb",
        discountAmount: 100,
        code: "AIRBNB-100",
        storeName: "Airbnb",
        tagline: "Belong anywhere",
        brandUrl: "https://www.airbnb.com",
        quantity: 10,
        usageCount: 3,
        status: "active",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
      {
        title: "IKEA $20 Voucher",
        description: "$20 off on home furniture",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
        points: 2000,
        category_id: categories[4]._id,
        brand: "IKEA",
        discountAmount: 20,
        code: "IKEA-20-OFF",
        storeName: "IKEA",
        tagline: "Creating a better everyday life",
        brandUrl: "https://www.ikea.com",
        quantity: 30,
        usageCount: 8,
        status: "active",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
      {
        title: "McDonald's Free Meal",
        description: "Free Big Mac meal combo",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        points: 300,
        category_id: categories[0]._id,
        brand: "McDonald's",
        discountAmount: 8,
        code: "MCD-FREE-MEAL",
        storeName: "McDonald's",
        tagline: "I'm lovin' it",
        brandUrl: "https://www.mcdonalds.com",
        quantity: 200,
        usageCount: 150,
        status: "active",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
      // Fully claimed voucher
      {
        title: "Nike Free Shipping",
        description: "Free shipping on all orders",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        points: 200,
        category_id: categories[3]._id,
        brand: "Nike",
        discountAmount: 5,
        code: "NIKE-FREE-SHIP",
        storeName: "Nike",
        tagline: "Just Do It",
        brandUrl: "https://www.nike.com",
        quantity: 50,
        usageCount: 50,
        status: "active",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
      // Expired voucher
      {
        title: "Uber $15 Credit",
        description: "$15 credit for Uber rides",
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400",
        points: 1500,
        category_id: categories[2]._id,
        brand: "Uber",
        discountAmount: 15,
        code: "UBER-15-CREDIT",
        storeName: "Uber",
        tagline: "Move with Uber",
        brandUrl: "https://www.uber.com",
        quantity: 100,
        usageCount: 20,
        status: "active",
        expiresAt: new Date(now.getTime() - oneWeek),
      },
      // Draft vouchers
      {
        title: "Spotify Premium 3 Months",
        description: "3 months of Spotify Premium free",
        image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400",
        points: 1200,
        category_id: categories[6]._id,
        brand: "Spotify",
        discountAmount: 0,
        code: "SPOTIFY-3M",
        storeName: "Spotify",
        tagline: "Music for everyone",
        brandUrl: "https://www.spotify.com",
        quantity: 500,
        usageCount: 0,
        status: "draft",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
      {
        title: "Netflix 1 Month Free",
        description: "One month of Netflix free",
        image: "https://images.unsplash.com/photo-1574375927938-5ff84514b481?w=400",
        points: 800,
        category_id: categories[6]._id,
        brand: "Netflix",
        discountAmount: 0,
        code: "NETFLIX-1M",
        storeName: "Netflix",
        tagline: "See what's next",
        brandUrl: "https://www.netflix.com",
        quantity: 300,
        usageCount: 0,
        status: "draft",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
      // More active vouchers
      {
        title: "Sephora 20% Off",
        description: "20% off on all beauty products",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
        points: 600,
        category_id: categories[5]._id,
        brand: "Sephora",
        discountAmount: 20,
        code: "SEPHORA-20",
        storeName: "Sephora",
        tagline: "We belong to something beautiful",
        brandUrl: "https://www.sephora.com",
        quantity: 80,
        usageCount: 25,
        status: "active",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
      {
        title: "Nike 25% Off",
        description: "25% discount on selected items",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        points: 1000,
        category_id: categories[3]._id,
        brand: "Nike",
        discountAmount: 25,
        code: "NIKE-25OFF",
        storeName: "Nike",
        tagline: "Just Do It",
        brandUrl: "https://www.nike.com",
        quantity: 40,
        usageCount: 10,
        status: "active",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
      {
        title: "Apple Store $100 Off",
        description: "$100 off on MacBook accessories",
        image: "https://images.unsplash.com/photo-1611186871348-b1c6962a3a80?w=400",
        points: 8000,
        category_id: categories[1]._id,
        brand: "Apple",
        discountAmount: 100,
        code: "APPLE-100",
        storeName: "Apple",
        tagline: "Think Different",
        brandUrl: "https://www.apple.com",
        quantity: 15,
        usageCount: 2,
        status: "active",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
      {
        title: "Zara 15% Off",
        description: "15% discount on new collection",
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
        points: 400,
        category_id: categories[3]._id,
        brand: "Zara",
        discountAmount: 15,
        code: "ZARA-15",
        storeName: "Zara",
        tagline: "Love your curves",
        brandUrl: "https://www.zara.com",
        quantity: 60,
        usageCount: 18,
        status: "active",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
      {
        title: "Domino's Free Pizza",
        description: "Free medium pizza on orders above $20",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
        points: 350,
        category_id: categories[0]._id,
        brand: "Domino's",
        discountAmount: 12,
        code: "DOMINOS-FREE",
        storeName: "Domino's Pizza",
        tagline: "The pizza delivery experts",
        brandUrl: "https://www.dominos.com",
        quantity: 150,
        usageCount: 80,
        status: "active",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
      {
        title: "Marriott 10% Off Stay",
        description: "10% discount on hotel bookings",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
        points: 3000,
        category_id: categories[2]._id,
        brand: "Marriott",
        discountAmount: 10,
        code: "MARRIOTT-10",
        storeName: "Marriott Hotels",
        tagline: "Travel Brilliantly",
        brandUrl: "https://www.marriott.com",
        quantity: 25,
        usageCount: 5,
        status: "active",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
      {
        title: "Uniqlo $10 Off",
        description: "$10 off on purchases above $50",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
        points: 500,
        category_id: categories[3]._id,
        brand: "Uniqlo",
        discountAmount: 10,
        code: "UNIQLO-10",
        storeName: "Uniqlo",
        tagline: "Made for all",
        brandUrl: "https://www.uniqlo.com",
        quantity: 100,
        usageCount: 30,
        status: "active",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
      {
        title: "Grab $5 Credit",
        description: "$5 credit for Grab rides and food",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
        points: 250,
        category_id: categories[2]._id,
        brand: "Grab",
        discountAmount: 5,
        code: "GRAB-5",
        storeName: "Grab",
        tagline: " Southeast Asia's leading platform",
        brandUrl: "https://www.grab.com",
        quantity: 500,
        usageCount: 200,
        status: "active",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
      {
        title: "Lazada 15% Off",
        description: "15% off on all items",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
        points: 300,
        category_id: categories[1]._id,
        brand: "Lazada",
        discountAmount: 15,
        code: "LAZADA-15",
        storeName: "Lazada",
        tagline: "Shop online, save more",
        brandUrl: "https://www.lazada.com",
        quantity: 200,
        usageCount: 75,
        status: "active",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
      {
        title: "Shopee $8 Voucher",
        description: "$8 off on minimum spend of $40",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
        points: 200,
        category_id: categories[1]._id,
        brand: "Shopee",
        discountAmount: 8,
        code: "SHOPEE-8",
        storeName: "Shopee",
        tagline: "Social commerce",
        brandUrl: "https://www.shopee.com",
        quantity: 300,
        usageCount: 120,
        status: "active",
        expiresAt: new Date(now.getTime() + oneMonth),
      },
    ]);
    console.log("Vouchers created:", vouchers.length);

    // ==========================================
    // CART ITEMS
    // ==========================================
    await CartItem.create([
      { user: user1._id, voucher: vouchers[0]._id, quantity: 2 },
      { user: user1._id, voucher: vouchers[1]._id, quantity: 1 },
      { user: user1._id, voucher: vouchers[10]._id, quantity: 3 },
      { user: user2._id, voucher: vouchers[2]._id, quantity: 1 },
      { user: user2._id, voucher: vouchers[5]._id, quantity: 2 },
      { user: user3._id, voucher: vouchers[3]._id, quantity: 1 },
      { user: user3._id, voucher: vouchers[4]._id, quantity: 2 },
      { user: user3._id, voucher: vouchers[11]._id, quantity: 1 },
    ]);
    console.log("Cart items created");

    // ==========================================
    // ORDER HISTORY
    // ==========================================
    await CartItemHistory.create([
      {
        user: user1._id,
        voucher: vouchers[5]._id,
        quantity: 1,
        pointsUsed: vouchers[5].points * 1,
        discountAmount: vouchers[5].discountAmount,
        orderNumber: `ORD-${Date.now()}-001`,
        timestamp: new Date(now.getTime() - 7 * oneDay),
      },
      {
        user: user1._id,
        voucher: vouchers[4]._id,
        quantity: 2,
        pointsUsed: vouchers[4].points * 2,
        discountAmount: vouchers[4].discountAmount * 2,
        orderNumber: `ORD-${Date.now()}-002`,
        timestamp: new Date(now.getTime() - 3 * oneDay),
      },
      {
        user: user2._id,
        voucher: vouchers[0]._id,
        quantity: 1,
        pointsUsed: vouchers[0].points * 1,
        discountAmount: vouchers[0].discountAmount,
        orderNumber: `ORD-${Date.now()}-003`,
        timestamp: new Date(now.getTime() - 5 * oneDay),
      },
    ]);
    console.log("Order history created");

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log("\n=== SEEDING COMPLETED SUCCESSFULLY ===");
    console.log("\nTest Accounts:");
    console.log("Admin: admin@example.com / password123");
    console.log("User:  john@example.com / password123");
    console.log("User:  jane@example.com / password123");
    console.log("User:  bob@example.com / password123");
    console.log("\nCategories:", categories.map((c) => c.name).join(", "));
    console.log("Total Vouchers:", vouchers.length);
    console.log("Active Vouchers:", vouchers.filter((v) => v.status === "active").length);
    console.log("Draft Vouchers:", vouchers.filter((v) => v.status === "draft").length);
    console.log("Expired Vouchers:", vouchers.filter((v) => v.expiresAt < now).length);
    console.log("Fully Claimed Vouchers:", vouchers.filter((v) => v.usageCount >= v.quantity).length);

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedData();