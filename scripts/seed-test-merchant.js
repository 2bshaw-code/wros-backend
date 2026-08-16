const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || path.join(__dirname, "..", ".env.test") });

const mongoose = require("mongoose");
const { connectMongo } = require("../config/mongo");
const Business = require("../models/Business");
const AdminUser = require("../models/AdminUser");

const TEST_MERCHANT = {
  ownerName: "WROS Test Operator",
  businessName: "WROS Test Merchant",
  email: "test-merchant@example.test",
  password: "TestPassword123!",
};

const main = async () => {
  await connectMongo({ retries: 3, delayMs: 500 });

  const business = await Business.findOneAndUpdate(
    { email: TEST_MERCHANT.email },
    {
      $set: {
        ownerName: TEST_MERCHANT.ownerName,
        businessName: TEST_MERCHANT.businessName,
        subscriptionPlan: "pro",
        subscriptionStatus: "active",
        status: "active",
      },
      $setOnInsert: {
        email: TEST_MERCHANT.email,
        phone: "447700900099",
        whatsappNumber: "447700900099",
      },
    },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  );

  const passwordHash = await bcrypt.hash(TEST_MERCHANT.password, 10);
  const user = await AdminUser.findOneAndUpdate({ email: TEST_MERCHANT.email }, { $set: { passwordHash, role: "manager" } }, { returnDocument: "after", upsert: true, setDefaultsOnInsert: true });

  console.log(JSON.stringify({
    businessId: business._id.toString(),
    userId: user._id.toString(),
    email: TEST_MERCHANT.email,
    password: TEST_MERCHANT.password,
    operatorRole: "tenant_admin",
  }, null, 2));
};

main()
  .catch((error) => {
    console.error(`Test merchant seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
  });
