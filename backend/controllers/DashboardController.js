const CartItemHistory = require("../models/CartItemHistory");
const User = require("../models/User");
const Voucher = require("../models/Voucher");
const Category = require("../models/Category");

// @desc    Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    // Redemption trends
    const redemptionTrends = await CartItemHistory.aggregate([
      {
        $group: {
          _id: { year: { $year: "$timestamp" }, month: { $month: "$timestamp" } },
          redemptions: { $sum: "$quantity" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const redemptionTrendsFormatted = redemptionTrends.map(item => ({
      month: monthNames[item._id.month - 1],
      redemptions: item.redemptions
    }));

    // Top vouchers
    const topVouchers = await Voucher.aggregate([
      { $sort: { usageCount: -1 } },
      { $limit: 5 },
      { $project: { name: "$title", value: "$usageCount" } }
    ]);

    // Category distribution
    const categoryDistribution = await Category.aggregate([
      {
        $lookup: { from: "vouchers", localField: "_id", foreignField: "category_id", as: "vouchers" }
      },
      { $project: { name: "$name", value: { $size: "$vouchers" } } },
      { $sort: { value: -1 } }
    ]);

    // Metrics
    const totalRedemptionsAgg = await CartItemHistory.aggregate([
      { $group: { _id: null, total: {$sum : "$quantity"} }}
    ]);
    const totalRedemptions = totalRedemptionsAgg[0]?.total || 0;
    const totalUsers = await User.countDocuments();
    const activeVouchers = await Voucher.countDocuments({ status: "active" });
    const avgRedemptionsPerUser = totalUsers > 0 ? Math.round(totalRedemptions / totalUsers) : 0;
    const expiredVouchers = await Voucher.countDocuments({ expiresAt: { $lt: new Date() } });
    const fullyClaimed = await Voucher.countDocuments({ $expr: { $gte: ["$usageCount", "$quantity"] } });
    const draftVouchers = await Voucher.countDocuments({ status: "draft" });
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const recentOrdersToday = await CartItemHistory.countDocuments({ timestamp: { $gte: startOfToday } });

    const realtimeMetrics = [
      { label: "Orders Today", value: recentOrdersToday.toString(), unit: "", percent: Math.min(recentOrdersToday * 10, 100), tone: "primary" },
      { label: "Total Voucher Redemptions", value: totalRedemptions.toString(), unit: "", percent: Math.min(totalRedemptions / 10, 100), tone: "primary" },
      //{ label: "Active Vouchers", value: activeVouchers.toString(), unit: "", percent: Math.min(activeVouchers * 2, 100), tone: "success" },
      { label: "Average per User", value: avgRedemptionsPerUser.toString(), unit: "", percent: Math.min(avgRedemptionsPerUser * 5, 100), tone: "warning" },
      { label: "Fully Claimed Vouchers", value: fullyClaimed.toString(), unit: "", percent: Math.min(fullyClaimed * 5, 100), tone: "warning" },
      { label: "Draft Vouchers", value: draftVouchers.toString(), unit: "", percent: Math.min(draftVouchers * 5, 100), tone: "warning" },
      { label: "Expired Vouchers", value: expiredVouchers.toString(), unit: "", percent: Math.min(expiredVouchers * 5, 100), tone: "danger" },
    ];

    // Calculate average discount from vouchers with a real percentage discount
    const avgDiscountAgg = await Voucher.aggregate([
      { $match: { discountAmount: { $gt: 0 } } },
      { $group: { _id: null, avgDiscount: { $avg: "$discountAmount" } } }
    ]);
    const avgDiscount = avgDiscountAgg[0]?.avgDiscount || 0;

    const totalPointsRedeemedAgg = await CartItemHistory.aggregate([
      { $group: { _id: null, total: { $sum: "$pointsUsed" } } }
    ]);
    const totalPointsRedeemed = totalPointsRedeemedAgg[0]?.total || 0;

    // Calculate redemption rate
    const vouchersUsed = await Voucher.countDocuments({ usageCount: { $gt: 0 } });
    const totalVouchers = await Voucher.countDocuments();
    const redemptionRate = totalVouchers > 0 ? Math.round((vouchersUsed / totalVouchers) * 100) : 0;

    const analyticsKPIs = [
      { label: "Total Voucher Redemptions", value: totalRedemptions.toLocaleString(), delta: "+14.2%", trend: "up", subtitle: "All time" },
      { label: "Active Users", value: totalUsers.toLocaleString(), delta: "+8.2%", trend: "up", subtitle: "Registered accounts"},
      { label: "Average Discount/Voucher", value: `${avgDiscount.toFixed(1)}%`, delta: "-1.4%", trend: "down", subtitle: "Percentage-off vouchers only" },
      { label: "Redemption Rate", value: `${redemptionRate}%`, delta: "+19.6%", trend: "up", subtitle: "Vouchers claimed at least once" },
    ];

    res.json({
      kpis: analyticsKPIs,
      redemptionTrends: redemptionTrendsFormatted,
      topVouchers,
      categoryDistribution: categoryDistribution.filter(c => c.value > 0),
      realtimeMetrics,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get dashboard stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ is_active: true });
    const totalOrders = await CartItemHistory.countDocuments();
    const totalVouchers = await Voucher.countDocuments();
    const activeVouchers = await Voucher.countDocuments({ status: "active" });

    const pointsAgg = await CartItemHistory.aggregate([
      { $group: { _id: null, totalPoints: { $sum: "$pointsUsed" } } },
    ]);
    const totalPointsRedeemed = pointsAgg[0]?.totalPoints || 0;

    const recentActivity = await CartItemHistory.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "username fullName")
      .populate("voucher", "title");

    const recentOrdersList = await CartItemHistory.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "username fullName")
      .populate("voucher", "title points");

    res.json({
      kpis: { totalUsers, activeUsers, totalOrders, totalVouchers, activeVouchers, totalPointsRedeemed },
      recentActivity: recentActivity.map((order) => ({
        id: order._id,
        user: order.user?.fullName || order.user?.username || "Unknown",
        voucher: order.voucher?.title || "Unknown Voucher",
        points: order.pointsUsed || 0,
        time: new Date(order.timestamp).toLocaleString(),
        status: "completed",
      })),
      recentOrders: recentOrdersList.map((order) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        user: order.user?.fullName || order.user?.username || "Unknown",
        voucher: order.voucher?.title || "Unknown Voucher",
        points: order.pointsUsed || 0,
        time: new Date(order.timestamp).toLocaleString(),
        receiptUrl: order.receiptUrl,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};