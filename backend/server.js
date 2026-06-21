// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();

connectDB();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vouchers", require("./routes/voucherRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/orders", require("./routes/cartRoutes"));

app.listen(5000, () => console.log("API on :5000"));
