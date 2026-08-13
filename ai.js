const { askBob } = require("./services/aiService");

function wrosAI(content = "", userId = "legacy-user") {
  return askBob({ prompt: String(content), userId }).then((r) => r.reply).catch(() => "");
}

module.exports = { wrosAI };