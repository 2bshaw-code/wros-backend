const memoryStore = new Map();

function remember(userId, key, value) {
  const userKey = String(userId ?? 'guest');
  const memoryKey = String(key ?? 'memory');
  const record = { userId: userKey, key: memoryKey, value };
  memoryStore.set(`${userKey}:${memoryKey}`, record);
  return value;
}

function recall(userId, key) {
  const userKey = String(userId ?? 'guest');
  const memoryKey = String(key ?? 'memory');
  const record = memoryStore.get(`${userKey}:${memoryKey}`);
  return record ? record.value : undefined;
}

function forget(userId, key) {
  const userKey = String(userId ?? 'guest');
  const memoryKey = String(key ?? 'memory');
  return memoryStore.delete(`${userKey}:${memoryKey}`);
}

module.exports = {
  memoryStore,
  remember,
  recall,
  forget,
};
