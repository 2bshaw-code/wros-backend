const Business = require("../models/Business");
const { sendSuccess } = require("../utils/response");

const overview = async (req, res) => {
  const [merchantCount, activeMerchantCount] = await Promise.all([
    Business.countDocuments({}),
    Business.countDocuments({ status: "active" }),
  ]);

  return sendSuccess(res, {
    merchantCount,
    activeMerchantCount,
    access: "owner",
    tenantRequired: false,
  });
};

module.exports = { overview };
