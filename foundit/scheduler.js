const cron = require("node-cron");
const { migrate } = require("./db");
const { runScrapers } = require("./scrapers/engine");

let task;

const startFoundItScheduler = async () => {
  if ((!process.env.FOUND_IT_DATABASE_URL && !process.env.DATABASE_URL) || process.env.FOUND_IT_SCHEDULER_ENABLED !== "true") return null;
  if (process.env.FOUND_IT_AUTO_MIGRATE === "true") await migrate();
  if (!task) task = cron.schedule(process.env.FOUND_IT_CRON || "0 * * * *", () => runScrapers().catch((error) => console.error("Found IT scheduled scrape failed:", error.message)), { timezone: process.env.FOUND_IT_TIMEZONE || "Europe/London", noOverlap: true });
  return task;
};

const stopFoundItScheduler = () => { task?.stop(); task = undefined; };

module.exports = { startFoundItScheduler, stopFoundItScheduler };