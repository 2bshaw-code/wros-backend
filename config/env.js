const requiredEnv = ["JWT_SECRET", "JWT_REFRESH_SECRET", "MONGO_URI_PROD", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "WHATSAPP_VERIFY_TOKEN", "WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_BUSINESS_ID", "HOSTING_URL", "CONSOLE_URL", "FRONTEND_URL", "API_URL"];

const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.warn(`Missing environment variables: ${missing.join(", ")}`);
}

const NODE_ENV = process.env.NODE_ENV || "development";
const isEnabled = (value, fallback = false) => String(value ?? fallback).toLowerCase() === "true";

if (NODE_ENV === "production") {
  const missingProduction = requiredEnv.filter((key) => !process.env[key]);
  if (missingProduction.length > 0) throw new Error(`Production environment is incomplete: ${missingProduction.join(", ")}`);
}

module.exports = {
  NODE_ENV,
  PORT: Number(process.env.PORT || 3000),
  APP_NAME: process.env.APP_NAME || "WROS backend",
  MONGO_URI: process.env.MONGO_URI || process.env.MONGO_URI_PROD || "mongodb://localhost:27017/wros-backend",
  JWT_SECRET: process.env.JWT_SECRET || "wros-dev-secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || process.env.REFRESH_TOKEN_SECRET || "wros-dev-refresh-secret",
  REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_SECRET || process.env.REFRESH_TOKEN_SECRET || "wros-dev-refresh-secret",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY || "sk_test_placeholder",
  STRIPE_KEY: process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY || "sk_test_placeholder",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || "wros_verify_token",
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || "",
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  WHATSAPP_BUSINESS_ID: process.env.WHATSAPP_BUSINESS_ID || "",
  WHATSAPP_APP_SECRET: process.env.WHATSAPP_APP_SECRET || "",
  HOSTING_URL: process.env.HOSTING_URL || "http://localhost:3000",
  CONSOLE_URL: process.env.CONSOLE_URL || "http://localhost:3000/console",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000/console",
  API_URL: process.env.API_URL || "http://localhost:3000/api",
  CRM_ENABLED: isEnabled(process.env.CRM_ENABLED, true),
  ORDERS_ENABLED: isEnabled(process.env.ORDERS_ENABLED, true),
  INVOICES_ENABLED: isEnabled(process.env.INVOICES_ENABLED, true),
  DELIVERY_ENABLED: isEnabled(process.env.DELIVERY_ENABLED, true),
  FAULTS_ENABLED: isEnabled(process.env.FAULTS_ENABLED, true),
  DOWNLOADS_ENABLED: isEnabled(process.env.DOWNLOADS_ENABLED, true),
  LDM_ENABLED: isEnabled(process.env.LDM_ENABLED, true),
  WHATSAPP_RIDER_MODE: isEnabled(process.env.WHATSAPP_RIDER_MODE, true),
};
