const sessions = new Map();

const sessionKey = (userId, tenantId) => `${String(tenantId || "legacy")}:${String(userId ?? "guest")}`;

function cloneData(value) {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    return value;
  }
}

function getSession(userId, tenantId) {
  const key = sessionKey(userId, tenantId);
  const stored = sessions.get(key);
  return stored ? cloneData(stored) : null;
}

function storeSession(userId, data, tenantId) {
  const key = sessionKey(userId, tenantId || data?.tenantId);
  const value = data && typeof data === 'object' ? { ...data, userId: String(data.userId ?? key) } : { userId: key, value: data };
  sessions.set(key, cloneData(value));
  return cloneData(value);
}

function clearSession(userId, tenantId) {
  const key = sessionKey(userId, tenantId);
  return sessions.delete(key);
}

function storeConversation(userId, message, tenantId) {
  const session = getSession(userId, tenantId) || { userId: String(userId ?? 'guest'), tenantId, conversations: [] };
  session.conversations = Array.isArray(session.conversations) ? session.conversations : [];
  session.conversations.push(message);
  return storeSession(userId, session, tenantId);
}

function getConversationHistory(userId, tenantId) {
  const session = getSession(userId, tenantId) || { userId: String(userId ?? 'guest'), conversations: [] };
  return Array.isArray(session.conversations) ? session.conversations : [];
}

module.exports = {
  sessions,
  getSession,
  storeSession,
  clearSession,
  storeConversation,
  getConversationHistory,
};
