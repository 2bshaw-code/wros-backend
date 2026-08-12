const requiredEnv = ["MONGO_URI", "JWT_SECRET", "NODE_ENV", "STRIPE_KEY"];

const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.warn(`Missing environment variables: ${missing.join(", ")}`);
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 3000),
  APP_NAME: process.env.APP_NAME || "WROS backend",
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/wros-backend",
  JWT_SECRET: process.env.JWT_SECRET || "wros-dev-secret",
  STRIPE_KEY: process.env.STRIPE_KEY || "sk_test_placeholder",
};
