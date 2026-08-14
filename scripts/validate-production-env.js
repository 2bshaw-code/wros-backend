const config = require("../config/env");

console.log(JSON.stringify({
  valid: true,
  required: config.requiredProduction,
  features: config.features,
}, null, 2));