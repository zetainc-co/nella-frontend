/**
 * Arranca Next con cwd = nella-frontend para que tailwindcss y demás
 * se resuelvan desde este proyecto y no desde el directorio padre.
 */
const path = require("path");
const { spawnSync } = require("child_process");

const frontendRoot = path.resolve(__dirname, "..");
const result = spawnSync("npx", ["next", "dev", "-p", "3001"], {
  stdio: "inherit",
  cwd: frontendRoot,
});
process.exit(result.status ?? 1);
