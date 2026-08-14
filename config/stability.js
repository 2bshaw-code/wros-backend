const frozen = Object.freeze({
  backendPort: 3000,
  frontendPort: 5173,
  apiPrefix: "/api",
  consolePrefix: "/console",
  founderPrefix: "/founder",
  buildDirectory: "wros-frontend/dist",
  testDatabase: "wros-backend",
});

const assertStability = (config) => {
  if (Number(config.PORT) !== frozen.backendPort) throw new Error(`WROS backend port drifted from ${frozen.backendPort}`);
  return frozen;
};

module.exports = { frozen, assertStability };