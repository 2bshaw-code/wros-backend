const appConfig = require("../config/appConfig");

const getHealth = () => ({
  uptime: process.uptime(),
  environment: appConfig.env,
  service: appConfig.serviceStatus,
  timestamp: new Date().toISOString(),
});

module.exports = { getHealth };
