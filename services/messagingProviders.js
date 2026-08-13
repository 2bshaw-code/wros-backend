const crypto = require("crypto");
const { registerProvider } = require("./messagingEngine");

const makeId = (provider) => `${provider}_${crypto.randomUUID()}`;
const unsupported = (provider) => () => ({ valid: false, reason: `${provider} webhook validation is not configured` });
const normalize = (provider) => (payload = {}) => ({
  provider,
  tenantHint: payload.tenantId || payload.businessId || null,
  externalMessageId: payload.messageId || payload.id || null,
  sender: payload.from || payload.sender || payload.phone || null,
  recipient: payload.to || payload.recipient || null,
  type: payload.type || "text",
  text: payload.text?.body || payload.text || payload.body || "",
  timestamp: payload.timestamp || new Date().toISOString(),
  raw: payload,
});

for (const provider of ["telegram", "messenger", "sms"]) {
  registerProvider(provider, {
    rateLimitPerMinute: provider === "sms" ? 30 : 60,
    send: async ({ tenantId, recipient, text }) => ({
      provider,
      tenantId,
      recipient,
      text,
      status: "queued",
      messageId: makeId(provider),
      activated: false,
    }),
    normalizeInbound: normalize(provider),
    validateWebhook: unsupported(provider),
  });
}

module.exports = { makeId };