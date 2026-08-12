const Business = require("../models/Business");

const getBusiness = async () => {
  const business = await Business.findOne({}).sort({ createdAt: -1 });
  return business;
};

const registerBusiness = async (payload = {}) => {
  const { ownerName, businessName, email, phone = "", whatsappNumber = "" } = payload;

  if (!ownerName || !businessName || !email) {
    throw new Error("ownerName, businessName, and email are required");
  }

  const existing = await Business.findOne({ email: String(email).toLowerCase() });
  if (existing) {
    throw new Error("Business already registered for this email");
  }

  const business = await Business.create({
    ownerName,
    businessName,
    email: String(email).toLowerCase(),
    phone,
    whatsappNumber,
  });

  return business;
};

const connectWhatsapp = async (payload = {}) => {
  const { whatsappNumber } = payload;
  if (!whatsappNumber) {
    throw new Error("whatsappNumber is required");
  }

  const business = (await getBusiness()) || (await Business.create({
    ownerName: "Business Owner",
    businessName: "WROS Business",
    email: "business@wros.local",
  }));

  business.whatsappNumber = whatsappNumber;
  await business.save();

  return business;
};

const getBusinessSettings = async () => {
  const business = await getBusiness();
  if (!business) {
    throw new Error("No business profile found");
  }
  return business;
};

const updateBusinessSettings = async (payload = {}) => {
  const business = await getBusiness();
  if (!business) {
    throw new Error("No business profile found");
  }

  const allowedFields = [
    "ownerName",
    "businessName",
    "email",
    "phone",
    "whatsappNumber",
    "subscriptionPlan",
    "stripeCustomerId",
    "subscriptionStatus",
    "status",
  ];

  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      business[field] = payload[field];
    }
  });

  await business.save();
  return business;
};

module.exports = {
  registerBusiness,
  connectWhatsapp,
  getBusinessSettings,
  updateBusinessSettings,
};
