const mongoose = require("mongoose");

const adminUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    founder: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "merchant", "operator", "manager", "tenant_admin", "analyst", "admin", "owner", "founder", "founder_admin", "customer"],
      default: "merchant",
    },
    refreshTokenHash: {
      type: String,
      default: "",
    },
    refreshTokenId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const AdminUser = mongoose.model("AdminUser", adminUserSchema);

module.exports = AdminUser;
