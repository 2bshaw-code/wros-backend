function normalizeMessage(payload = {}) {
  const entry = Array.isArray(payload?.entry) ? payload.entry[0] : null;
  const change = entry?.changes?.[0] || {};
  const value = change?.value || payload?.value || {};
  const message = value?.messages?.[0] || payload?.message || payload || {};

  const from = message.from || payload?.from || 'unknown-user';
  const rawText = message.text?.body || message.caption || payload?.text?.body || payload?.content || '';
  const type = message.type || payload?.type || 'text';
  const timestamp = Number(message.timestamp ?? payload?.timestamp ?? Date.now() / 1000);

  return {
    id: message.id || payload?.id || `${from}-${Date.now()}`,
    from: String(from),
    type: String(type),
    content: String(rawText || ''),
    timestamp: Number.isFinite(timestamp) ? timestamp : Date.now() / 1000,
    raw: payload,
  };
}

module.exports = {
  normalizeMessage,
};
