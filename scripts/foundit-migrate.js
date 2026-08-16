require("dotenv").config();

const { migrate, close } = require("../foundit/db");

migrate()
  .then(() => console.log("Found IT PostgreSQL migration completed"))
  .catch((error) => {
    console.error(`Found IT migration failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(close);