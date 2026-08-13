const required = [
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "MONGO_URI_PROD",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "WHATSAPP_VERIFY_TOKEN",
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_BUSINESS_ID",
  "HOSTING_URL",
  "CONSOLE_URL",
  "FRONTEND_URL",
  "API_URL",
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(JSON.stringify({ valid: false, missing }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ valid: true, required }, null, 2));
}