const coreRequired = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "HOSTING_URL",
  "CONSOLE_URL",
  "API_URL",
];

const stripeRequired = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
];

const whatsappRequired = [
  "WHATSAPP_VERIFY_TOKEN",
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_BUSINESS_ID",
];

const isEnabled = (value) =>
  String(value || "").toLowerCase() === "true";

const features = {
  stripe: isEnabled(process.env.ENABLE_STRIPE),
  whatsapp: isEnabled(process.env.ENABLE_WHATSAPP),
};

const requiredProduction = [
  ...coreRequired,
  ...(features.stripe ? stripeRequired : []),
  ...(features.whatsapp ? whatsappRequired : []),
];

const missingProduction = requiredProduction.filter(
  (variable) => !process.env[variable]
);

if (!process.env.MONGO_URI_PROD && !process.env.MONGO_URI) {
  missingProduction.push("MONGO_URI_PROD or MONGO_URI");
}

if (missingProduction.length > 0) {
  throw new Error(
    `Production environment is incomplete: ${missingProduction.join(", ")}`
  );
}

module.exports = {
  features,
  requiredProduction,
};
