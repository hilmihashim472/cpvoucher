const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "Tag" },
    color: { type: String, default: "#F97316" },
    status: { type: String, enum: ["active", "draft"], default: "draft" },
  },
  { timestamps: true }
);

// Auto-generate slug from name if not provided
categorySchema.pre("save", async function () {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
});

module.exports = mongoose.model("Category", categorySchema);