function logMessage(event, payload = {}) {
  const tenantId = payload.tenantId || payload.tenant?.tenantId || null;
  const enrichedPayload = { ...payload, tenantId };
  if (process.env.WROS_LOG_MESSAGES === "true") {
    console.log(JSON.stringify({ event, payload: enrichedPayload, tenantId, timestamp: new Date().toISOString() }));
  }

}

const logAudit = (tenantId, action, payload = {}) => logMessage("audit", { ...payload, tenantId, action });
const logOperator = (tenantId, operatorId, action, payload = {}) => logMessage("operator", { ...payload, tenantId, operatorId, action });

module.exports = { logMessage, logAudit, logOperator };