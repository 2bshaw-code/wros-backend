const mongoose = require("mongoose");

const faultReportSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    merchantId: { type: String, required: true, trim: true, index: true },
    operatorId: { type: String, required: true, trim: true },
    issueTitle: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    screenshotUrl: { type: String, default: "" },
    contactEmail: { type: String, required: true, trim: true, lowercase: true },
    status: { type: String, enum: ["reported", "reviewing", "resolved"], default: "reported" },
  },
  { timestamps: true }
);

const FaultReport = mongoose.model("FaultReport", faultReportSchema);

module.exports = FaultReport;