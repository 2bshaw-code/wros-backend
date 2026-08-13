const mongoose = require("mongoose");
const { connectMongo } = require("../config/mongo");
const Business = require("../models/Business");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Message = require("../models/Message");

const scopedModels = [Product, Customer, Order, Message];
const args = new Set(process.argv.slice(2));
const dryRun = !args.has("--apply");
const tenantArg = process.env.WROS_BACKFILL_TENANT_ID;

const main = async () => {
  await connectMongo();
  const tenant = tenantArg ? await Business.findById(tenantArg) : null;
  if (tenantArg && !tenant) throw new Error(`Backfill tenant does not exist: ${tenantArg}`);

  const report = { dryRun, tenantId: tenant?._id?.toString() || null, collections: {} };
  for (const Model of scopedModels) {
    const query = { tenantId: { $exists: false } };
    const count = await Model.countDocuments(query);
    report.collections[Model.modelName] = { pending: count, updated: 0 };
    if (!dryRun && count > 0) {
      if (!tenant) throw new Error(`${Model.modelName} has ${count} unscoped records; set WROS_BACKFILL_TENANT_ID before --apply`);
      const result = await Model.updateMany(query, { $set: { tenantId: tenant._id } });
      report.collections[Model.modelName].updated = result.modifiedCount;
    }
    if (!dryRun) await Model.syncIndexes();
  }

  console.log(JSON.stringify(report, null, 2));
  if (dryRun && Object.values(report.collections).some((item) => item.pending > 0)) {
    console.log("Dry run only. Set WROS_BACKFILL_TENANT_ID and pass --apply after ownership mapping and backup verification.");
  }
};

main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
});