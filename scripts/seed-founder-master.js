const path = require("path");
require("dotenv").config({ path: process.env.DOTENV_CONFIG_PATH ? path.resolve(process.cwd(), process.env.DOTENV_CONFIG_PATH) : path.join(__dirname, "..", ".env") });

const { migrate, close } = require("../auth/db");
const { seedFounderMaster } = require("../services/founderMasterService");

const main = async () => {
  if (process.env.FOUNDER_MASTER_SEED_ENABLED !== "true") {
    console.log("Founder master seed is disabled");
    return;
  }

  await migrate();
  const result = await seedFounderMaster();
  if (!result.seeded) throw new Error("Founder master account was not seeded");
  console.log(`Founder master seed verified for ${result.email}`);
};

main()
  .catch((error) => {
    console.error(`Founder master seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(close);