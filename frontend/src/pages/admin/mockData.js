import { Users, Ticket, Coins, ShoppingBag } from "lucide-react";

// TODO: replace with GET /api/admin/stats
export const KPI_STATS = [
  { label: "Total Active Users", value: "24,581", delta: "+8.2% this week", icon: Users },
  { label: "Vouchers Redeemed Today", value: "1,204", delta: "+3.1% vs yesterday", icon: Ticket },
  { label: "Platform Revenue (Points)", value: "892,400", delta: "+12.4% this month", icon: Coins },
  { label: "Active Orders", value: "8,302", delta: "+124 today", icon: ShoppingBag },
];

// TODO: replace with GET /api/admin/orders?status=pending
export const PENDING_ORDERS = [
  { id: 89, user: "Daniel Lim", voucher: "Free Delivery – Grab Food", points: 200 },
  { id: 84, user: "Rajan Pillai", voucher: "Free Delivery – Grab Food", points: 200 },
  { id: 93, user: "Priya Sharma", voucher: "H&M Seasonal Sale – 20% Off", points: 400 },
  { id: 95, user: "Siti Nurhaliza", voucher: "15% Off All Nike Footwear", points: 800 },
];

// TODO: replace with GET /api/admin/stats/growth-projection
export const GROWTH_PROJECTION = [
  { month: "Jan", value: 4200 },
  { month: "Feb", value: 4800 },
  { month: "Mar", value: 5100 },
  { month: "Apr", value: 6000 },
  { month: "May", value: 6700 },
  { month: "Jun", value: 7400 },
];

// TODO: replace with GET /api/admin/activity
export const RECENT_ACTIVITY = [
  {
    id: 1,
    type: "New Signups",
    title: "5 new users registered",
    body: "Ahmad Farid, Priya Sharma and 3 others joined the platform.",
    time: "10 mins ago",
    tone: "success",
  },
  {
    id: 2,
    type: "Redemption Spike",
    title: "High redemption activity",
    body: "Buy 1 Get 1 Free – Starbucks received 84 redemptions in the last hour.",
    time: "1 hour ago",
    tone: "primary",
  },
  {
    id: 3,
    type: "Milestone",
    title: "Daily redemption record hit",
    body: "Total daily redemptions exceeded 1,200 — a new platform record.",
    time: "2 hours ago",
    tone: "success",
  },
  {
    id: 4,
    type: "Low Stock",
    title: "Voucher stock running low",
    body: "Adidas Running Shoes – RM100 Off has only 12 units remaining.",
    time: "4 hours ago",
    tone: "warning",
  },
];

// TODO: replace with GET /api/admin/analytics/summary
export const ANALYTICS_KPIS = [
  { label: "Total Redemptions", value: "48,219", delta: "+14.2%", trend: "up" },
  { label: "Active Users", value: "24,581", delta: "+8.2%", trend: "up" },
  { label: "Average Discount", value: "23.5%", delta: "-1.4%", trend: "down" },
  { label: "Net Savings", value: "$184,920", delta: "+19.6%", trend: "up" },
];

// TODO: replace with GET /api/admin/analytics/redemption-trends
export const REDEMPTION_TRENDS = [
  { month: "Jan", redemptions: 3200 },
  { month: "Feb", redemptions: 4100 },
  { month: "Mar", redemptions: 3800 },
  { month: "Apr", redemptions: 5200 },
  { month: "May", redemptions: 6100 },
  { month: "Jun", redemptions: 7300 },
];

// TODO: replace with GET /api/admin/analytics/top-vouchers
export const TOP_VOUCHERS = [
  { name: "Grab Food", value: 3120 },
  { name: "Starbucks", value: 1204 },
  { name: "Nike", value: 876 },
  { name: "H&M", value: 567 },
  { name: "Adidas", value: 289 },
];

// TODO: replace with GET /api/admin/analytics/category-distribution
export const CATEGORY_DISTRIBUTION = [
  { name: "Fashion", value: 35 },
  { name: "Food & Beverage", value: 28 },
  { name: "Tech", value: 18 },
  { name: "Travel", value: 12 },
  { name: "Home", value: 7 },
];

export const PIE_COLORS = ["#1A56DB", "#F97316", "#10B981", "#1E293B", "#94A3B8"];

// percent values are normalized for the progress bar; value/unit are the displayed metrics
// TODO: replace with GET /api/admin/analytics/realtime
export const REALTIME_METRICS = [
  { label: "Peak Activity Load", value: "85", unit: "%", percent: 85, tone: "warning" },
  { label: "Error Rate", value: "0.4", unit: "%", percent: 8, tone: "success" },
  { label: "API Response Time", value: "126", unit: "ms", percent: 42, tone: "primary" },
];

// TODO: replace with GET /api/admin/vouchers
export const MOCK_VOUCHERS = [
  { id: 1, title: "Buy 1 Get 1 Free – Starbucks", category: "Food & Beverage", points: 500, status: "active", expiry: "2026-07-31", uses: 1204, stock: 500 },
  { id: 2, title: "15% Off All Nike Footwear", category: "Fashion", points: 800, status: "active", expiry: "2026-08-15", uses: 876, stock: 300 },
  { id: 3, title: "RM200 Off International Flights", category: "Travel", points: 2000, status: "active", expiry: "2026-09-01", uses: 342, stock: 200 },
  { id: 4, title: "Free Delivery – Grab Food", category: "Food & Beverage", points: 200, status: "active", expiry: "2026-06-30", uses: 3120, stock: 1000 },
  { id: 5, title: "30% Off Apple Accessories", category: "Tech", points: 1200, status: "expired", expiry: "2026-05-31", uses: 920, stock: 0 },
  { id: 6, title: "Sephora Skincare Bundle", category: "Beauty", points: 650, status: "draft", expiry: "2026-10-01", uses: 0, stock: 150 },
  { id: 7, title: "H&M Seasonal Sale – 20% Off", category: "Fashion", points: 400, status: "active", expiry: "2026-07-15", uses: 567, stock: 400 },
  { id: 8, title: "Adidas Running Shoes – RM100 Off", category: "Fashion", points: 900, status: "active", expiry: "2026-08-01", uses: 289, stock: 100 },
];

// TODO: replace with GET /api/admin/users
export const MOCK_USERS = [
  { id: 1, name: "Ahmad Farid", email: "ahmad.farid@example.com", points: 12400, role: "user", status: "active", joined: "2025-03-12" },
  { id: 2, name: "Siti Nurhaliza", email: "siti.n@example.com", points: 8750, role: "user", status: "active", joined: "2025-05-20" },
  { id: 3, name: "Rajan Pillai", email: "rajan.p@example.com", points: 3200, role: "user", status: "suspended", joined: "2025-01-08" },
  { id: 4, name: "Mei Ling Tan", email: "meiling.t@example.com", points: 21000, role: "admin", status: "active", joined: "2024-11-01" },
  { id: 5, name: "Daniel Lim", email: "daniel.lim@example.com", points: 5400, role: "user", status: "active", joined: "2025-07-03" },
  { id: 6, name: "Priya Sharma", email: "priya.s@example.com", points: 960, role: "user", status: "active", joined: "2025-09-18" },
  { id: 7, name: "Zulaikha Amir", email: "zulaikha.a@example.com", points: 0, role: "user", status: "suspended", joined: "2025-02-27" },
  { id: 8, name: "John Tan Wei Ming", email: "john.tw@example.com", points: 15800, role: "user", status: "active", joined: "2024-12-14" },
];

// TODO: replace with GET /api/admin/orders
export const MOCK_ORDERS = [
  { id: "ORD-0091", user: "Ahmad Farid", voucher: "Buy 1 Get 1 Free – Starbucks", points: 500, status: "completed", date: "2026-06-18" },
  { id: "ORD-0090", user: "Siti Nurhaliza", voucher: "15% Off All Nike Footwear", points: 800, status: "completed", date: "2026-06-17" },
  { id: "ORD-0089", user: "Daniel Lim", voucher: "Free Delivery – Grab Food", points: 200, status: "pending", date: "2026-06-17" },
  { id: "ORD-0088", user: "John Tan Wei Ming", voucher: "RM200 Off International Flights", points: 2000, status: "completed", date: "2026-06-16" },
  { id: "ORD-0087", user: "Priya Sharma", voucher: "H&M Seasonal Sale – 20% Off", points: 400, status: "cancelled", date: "2026-06-15" },
  { id: "ORD-0086", user: "Ahmad Farid", voucher: "Adidas Running Shoes – RM100 Off", points: 900, status: "completed", date: "2026-06-14" },
  { id: "ORD-0085", user: "Mei Ling Tan", voucher: "30% Off Apple Accessories", points: 1200, status: "refunded", date: "2026-06-13" },
  { id: "ORD-0084", user: "Rajan Pillai", voucher: "Free Delivery – Grab Food", points: 200, status: "pending", date: "2026-06-13" },
];

// TODO: replace with GET /api/admin/categories
export const MOCK_CATEGORIES = [
  { id: 1, name: "Food & Beverage", description: "Restaurants, cafes, and food delivery", icon: "UtensilsCrossed", color: "#F97316", voucherCount: 87, status: "active" },
  { id: 2, name: "Fashion", description: "Clothing, shoes, and accessories", icon: "ShoppingBag", color: "#1A56DB", voucherCount: 72, status: "active" },
  { id: 3, name: "Tech & Gadgets", description: "Electronics and accessories", icon: "Laptop", color: "#10B981", voucherCount: 56, status: "active" },
  { id: 4, name: "Travel", description: "Flights, hotels, and experiences", icon: "Plane", color: "#64748B", voucherCount: 34, status: "active" },
  { id: 5, name: "Beauty", description: "Skincare, cosmetics, and wellness", icon: "Sparkles", color: "#EC4899", voucherCount: 29, status: "active" },
  { id: 6, name: "Home & Living", description: "Furniture, decor, and lifestyle", icon: "Home", color: "#8B5CF6", voucherCount: 28, status: "active" },
  { id: 7, name: "Sports & Fitness", description: "Gym, sports gear, and outdoor", icon: "Dumbbell", color: "#EF4444", voucherCount: 0, status: "draft" },
];

// TODO: replace with GET /api/admin/orders/summary
export const ORDER_KPI_STATS = [
  { label: "Total Orders", value: "8,302", delta: "+124 today" },
  { label: "Pending", value: "47", delta: "Needs action" },
  { label: "Completed", value: "7,891", delta: "95.0% success rate" },
  { label: "Points Redeemed", value: "4.2M", delta: "+18.3% this month" },
];
