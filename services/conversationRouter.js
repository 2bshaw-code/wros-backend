const { normalizeInbound, validateWebhook } = require("./messagingEngine");

const routeInboundMessage = async ({ provider, payload, headers = {}, resolveTenant, handleMessage }) => {
  const validation = validateWebhook(provider, payload, headers);
  if (!validation?.valid) throw new Error(validation.reason || "Messaging webhook validation failed");
  const normalized = normalizeInbound(provider, payload);
  const tenantId = await resolveTenant(normalized, payload);
  if (!tenantId) throw new Error("Tenant context could not be resolved from inbound message");
  if (typeof handleMessage !== "function") throw new Error("Inbound message handler is required");
  return handleMessage({ tenantId: String(tenantId), provider, message: normalized });
};

module.exports = { routeInboundMessage };