const getStatus = () => ({
  status: "ok",
  message: "WROS backend running",
  timestamp: new Date().toISOString(),
});

module.exports = { getStatus };
