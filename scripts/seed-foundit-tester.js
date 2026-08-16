require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { connectMongo } = require("../config/mongo");
const AdminUser = require("../models/AdminUser");

const email = process.env.FOUND_IT_TEST_EMAIL || "foundit-tester@example.test";
const password = process.env.FOUND_IT_TEST_PASSWORD || "FoundItTest2026!";

const main = async () => {
  if (process.env.NODE_ENV === "production" || process.env.WROS_TEST_MODE !== "true") throw new Error("Found IT test credentials can only be seeded with WROS_TEST_MODE=true outside production");
  await connectMongo();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await AdminUser.findOneAndUpdate({ email }, { $set: { passwordHash, role: "founder_admin", founder: true } }, { upsert: true, returnDocument: "after", setDefaultsOnInsert: true });
  console.log(JSON.stringify({ userId: user._id.toString(), email, password, role: "founder_admin", loginUrl: "/auth/login", dashboardUrl: "/founder/found-it" }, null, 2));
};

main().catch((error) => { console.error(`Found IT tester seed failed: ${error.message}`); process.exitCode = 1; }).finally(async () => { if (mongoose.connection.readyState !== 0) await mongoose.connection.close(); });