const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || path.join(__dirname, "..", ".env.test") });

const mongoose = require("mongoose");
const { connectMongo } = require("../config/mongo");

const main = async () => {
  await connectMongo({ retries: 3, delayMs: 500 });
  console.log(`MongoDB test connection ready: ${mongoose.connection.name}`);
};

main()
  .catch((error) => {
    console.error(`MongoDB test connection failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
  });
