const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    sku: { type: String, default: "" },
    barcode: { type: String, default: "" },
    images: { type: [String], default: [] },
    category: { type: String, default: "General", index: true },
    stock: { type: Number, default: 0, min: 0 },
    supplier: { type: String, default: "" },
  },
  { timestamps: true }
);

productSchema.index({ tenantId: 1, sku: 1 }, { unique: true, sparse: true });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
