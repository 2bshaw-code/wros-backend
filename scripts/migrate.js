require("dotenv").config();

const authDb = require("../auth/db");
const foundItDb = require("../foundit/db");

const main = async () => {
  await authDb.migrate();
  await foundItDb.migrate();
  console.log("PostgreSQL auth and FOUND_IT migrations completed");
};

main().catch((error) => { console.error(`Migration failed: ${error.message}`); process.exitCode = 1; }).finally(async () => { await Promise.all([authDb.close(), foundItDb.close()]); });