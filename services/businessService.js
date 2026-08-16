const Business = require("../models/Business");
const config = require("../config");

const merchantWorkspaceRoles = new Set(["merchant", "manager", "tenant_admin"]);

const getDefaultName = (email) => {
  const localPart = String(email).split("@")[0].replace(/[._-]+/g, " ").trim();
  return localPart.replace(/\b\w/g, (character) => character.toUpperCase()) || "Merchant";
};

const initializeMerchantWorkspace = async (user, payload = {}) => {
  const email = String(user?.email || "").trim().toLowerCase();
  if (!email) throw new Error("Authenticated merchant email is required");
  if (!merchantWorkspaceRoles.has(user?.role)) throw new Error("Merchant role is required");

  const ownerName = String(payload.ownerName || getDefaultName(email)).trim();
  const businessName = String(payload.businessName || `${ownerName} Business`).trim();
  const now = new Date();

  return Business.findOneAndUpdate(
    { email },
    {
      $setOnInsert: {
        email,
        ownerName,
        businessName,
        phone: String(payload.phone || "").trim(),
        whatsappNumber: "",
        subscriptionPlan: "starter",
        subscriptionStatus: "trial",
        status: "active",
      },
      $set: {
        workspaceConnected: true,
        workspace: { status: "ready", initializedAt: now },
        systemProfile: { status: "ready", initializedAt: now },
        whatsappConnection: { status: "placeholder", connected: false },
        hostingUrl: config.HOSTING_URL,
        consoleUrl: config.CONSOLE_URL,
        apiUrl: config.API_URL,
      },
    },
    { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
};

const getBusiness = async (tenantId) => {
  const business = await Business.findById(tenantId);
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

const connectWhatsapp = async (tenantId, payload = {}) => {
  const { whatsappNumber } = payload;
  if (!whatsappNumber) {
    throw new Error("whatsappNumber is required");
  }

  const business = await getBusiness(tenantId);
  if (!business) throw new Error("Tenant not found");

  business.whatsappNumber = whatsappNumber;
  await business.save();

  return business;
};

const getBusinessSettings = async (tenantId) => {
  const business = await getBusiness(tenantId);
  if (!business) {
    throw new Error("No business profile found");
  }
  return business;
};

const updateBusinessSettings = async (tenantId, payload = {}) => {
  const business = await getBusiness(tenantId);
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
  initializeMerchantWorkspace,
  registerBusiness,
  connectWhatsapp,
  getBusinessSettings,
  updateBusinessSettings,
};
