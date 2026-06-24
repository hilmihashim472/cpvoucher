const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expires: { type: Date, required: true },
});

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);