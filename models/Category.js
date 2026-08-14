const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "", trim: true },
}, { timestamps: true });

categorySchema.index({ tenantId: 1, name: 1 }, { unique: true });
module.exports = mongoose.model("Category", categorySchema);
