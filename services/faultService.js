const FaultReport = require("../models/FaultReport");

const createFaultReport = async ({ tenantId, merchantId, operatorId, issueTitle, description, screenshotUrl, contactEmail }) => {
  if (!tenantId || !operatorId || !issueTitle || !description || !contactEmail) {
    throw new Error("merchant_id, operator_id, issue_title, description, and contact_email are required");
  }

  const fault = await FaultReport.create({
    tenantId,
    merchantId: merchantId || String(tenantId),
    operatorId,
    issueTitle,
    description,
    screenshotUrl: screenshotUrl || "",
    contactEmail,
  });

  return {
    fault_id: fault._id.toString(),
    status: fault.status,
    timestamp: fault.createdAt,
  };
};

module.exports = { createFaultReport };