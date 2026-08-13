function handleText(content = "") {
  return { type: "text", body: String(content) };
}

function handleButton(payload = {}) {
  return { type: "button", body: payload.title || payload.id || "" };
}

function handleList(payload = {}) {
  return { type: "list", body: payload.title || "", items: payload.items || [] };
}

function handleUnknown(content = "") {
  return { type: "unknown", body: String(content) };
}

module.exports = { handleText, handleButton, handleList, handleUnknown };