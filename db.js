const dbStore = new Map();

function set(key, value) {
  dbStore.set(String(key), value);
  return value;
}

function get(key) {
  return dbStore.get(String(key));
}

function del(key) {
  return dbStore.delete(String(key));
}

function all() {
  return Object.fromEntries(Array.from(dbStore.entries()));
}

module.exports = {
  dbStore,
  set,
  get,
  delete: del,
  all,
};
