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
    const totalRedemptions = await CartItemHistory.countDocuments();
    const totalUsers = await User.countDocuments();
    const activeVouchers = await Voucher.countDocuments({ status: "active" });
    const avgRedemptionsPerUser = totalUsers > 0 ? Math.round(totalRedemptions / totalUsers) : 0;

    const realtimeMetrics = [
      { label: "Total Redemptions", value: totalRedemptions.toString(), unit: "", percent: Math.min(totalRedemptions / 10, 100), tone: "primary" },
      { label: "Active Vouchers", value: activeVouchers.toString(), unit: "", percent: Math.min(activeVouchers * 2, 100), tone: "success" },
      { label: "Avg per User", value: avgRedemptionsPerUser.toString(), unit: "", percent: Math.min(avgRedemptionsPerUser * 5, 100), tone: "warning" },
    ];

    const totalPointsRedeemedAgg = await CartItemHistory.aggregate([
      { $group: { _id: null, total: { $sum: "$pointsUsed" } } }
    ]);
    const totalPointsRedeemed = totalPointsRedeemedAgg[0]?.total || 0;

    const analyticsKPIs = [
      { label: "Total Redemptions", value: totalRedemptions.toLocaleString(), delta: "+14.2%", trend: "up" },
      { label: "Active Users", value: totalUsers.toLocaleString(), delta: "+8.2%", trend: "up" },
      { label: "Avg Discount", value: "23.5%", delta: "-1.4%", trend: "down" },
      { label: "Net Savings", value: `$${(totalPointsRedeemed * 0.1).toLocaleString()}`, delta: "+19.6%", trend: "up" },
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
      .limit(10)
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
        time: new Date(order.createdAt).toLocaleString(),
        status: "completed",
      })),
      recentOrders: recentOrdersList.map((order) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        user: order.user?.fullName || order.user?.username || "Unknown",
        voucher: order.voucher?.title || "Unknown Voucher",
        points: order.pointsUsed || 0,
        time: new Date(order.createdAt).toLocaleString(),
        receiptUrl: order.receiptUrl,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};