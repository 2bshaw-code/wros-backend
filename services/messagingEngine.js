const providers = new Map();
const deliveryEvents = [];
const providerWindows = new Map();

const registerProvider = (name, provider) => {
  if (!name || typeof provider?.send !== "function" || typeof provider?.normalizeInbound !== "function") {
    throw new Error("Messaging provider requires send and normalizeInbound functions");
  }
  providers.set(String(name).toLowerCase(), provider);
};

const getProvider = (name = "whatsapp") => {
  const provider = providers.get(String(name).toLowerCase());
  if (!provider) throw new Error(`Messaging provider is not registered: ${name}`);
  return provider;
};

const send = async ({ provider = "whatsapp", tenantId, recipient, text, context = {} }) => {
  if (!tenantId) throw new Error("Tenant context is required");
  const adapter = getProvider(provider);
  const key = `${tenantId}:${String(provider).toLowerCase()}`;
  const now = Date.now();
  const windowStart = providerWindows.get(key) || now;
  if (now - windowStart >= 60000) providerWindows.set(key, now);
  const sentInWindow = deliveryEvents.filter((event) => event.key === key && event.createdAt >= (providerWindows.get(key) || now)).length;
  const limit = adapter.rateLimitPerMinute || 60;
  if (sentInWindow >= limit) throw new Error(`Messaging rate limit exceeded for ${provider}`);
  const result = await adapter.send({ tenantId, recipient, text, context });
  deliveryEvents.push({ key, tenantId, provider: String(provider).toLowerCase(), status: result?.status || "queued", messageId: result?.messageId || null, createdAt: now });
  return result;
};

const normalizeInbound = (provider, payload) => getProvider(provider).normalizeInbound(payload);

const validateWebhook = (provider, payload, headers = {}) => {
  const adapter = getProvider(provider);
  return typeof adapter.validateWebhook === "function" ? adapter.validateWebhook(payload, headers) : { valid: true };
};

const getDeliveryEvents = (tenantId) => deliveryEvents.filter((event) => event.tenantId === String(tenantId));

const listProviders = () => [...providers.keys()];

module.exports = { registerProvider, getProvider, send, normalizeInbound, validateWebhook, getDeliveryEvents, listProviders };

require("./messagingProviders");