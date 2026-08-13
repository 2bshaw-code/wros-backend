const { normalizeMessage } = require("./normaliser");

function wrosRouter(payload = {}) {
  const message = normalizeMessage(payload);

  return {
    type: message.type === "text" ? "text" : "unsupported",
    message,
  };
}

module.exports = { wrosRouter };