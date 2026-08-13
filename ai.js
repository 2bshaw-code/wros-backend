const { aiRoute } = require("../ai/router");

function wrosAI(content = "", userId = "legacy-user") {
  return aiRoute(userId, { content: String(content) }).response;
}

module.exports = { wrosAI };