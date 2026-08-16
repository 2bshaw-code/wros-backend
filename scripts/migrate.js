require("dotenv").config();

const { migrate, close } = require("../foundit/db");

const main = async () => {
  if (!process.env.FOUND_IT_DATABASE_URL) {
    console.log("Found IT migration skipped: FOUND_IT_DATABASE_URL is not configured");
    return;
  }
  await migrate();
  console.log("Found IT migration completed");
};

main().catch((error) => { console.error(`Migration failed: ${error.message}`); process.exitCode = 1; }).finally(close);