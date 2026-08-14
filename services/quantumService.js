const quantumLog = [];

const validatePayload = (payload = {}) => {
  if (payload && typeof payload !== "object") throw new Error("Quantum request must be an object");
  return payload;
};

const record = (type, input, output) => {
  const entry = { type, provider: "mock-quantum", input, output, responseTimeMs: 12, timestamp: new Date().toISOString() };
  quantumLog.push(entry);
  return entry;
};

const forecast = (payload) => record("forecast", validatePayload(payload), { horizon: payload?.horizon || "30d", prediction: "steady growth", confidence: 0.91, series: [420, 448, 475, 492] });
const optimise = (payload) => record("optimise", validatePayload(payload), { objective: payload?.objective || "margin", recommendation: "Prioritise bundle inventory for Classic Brew and Trail Bottle", score: 0.88 });
const anomaly = (payload) => record("anomaly", validatePayload(payload), { anomalies: [], status: "none-detected", confidence: 0.96 });
const security = (payload) => record("security", validatePayload(payload), { riskLevel: "low", findings: ["Mock quantum security scan completed"], status: "isolated" });

module.exports = { forecast, optimise, anomaly, security, quantumLog };