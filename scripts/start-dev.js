#!/usr/bin/env node
/**
 * Kill any process using port 3001, then start Next.js dev server
 */
const path = require("path");
const { spawnSync, execSync } = require("child_process");
const os = require("os");

const PORT = 3001;

// Get PID using port 3001
function getProcessOnPort(port) {
  try {
    const result = execSync(`netstat -ano | findstr ":${port}"`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    const lines = result.trim().split("\n");
    if (lines.length === 0) return null;

    // Parse last column which contains PID
    const lastLine = lines[0];
    const parts = lastLine.trim().split(/\s+/);
    const pid = parts[parts.length - 1];

    return pid && pid !== "0" ? parseInt(pid, 10) : null;
  } catch (error) {
    return null;
  }
}

// Kill process by PID (Windows-compatible)
function killProcess(pid) {
  try {
    if (os.platform() === "win32") {
      execSync(`taskkill /PID ${pid} /F`, {
        stdio: "inherit",
      });
    } else {
      execSync(`kill -9 ${pid}`, {
        stdio: "inherit",
      });
    }
    return true;
  } catch (error) {
    return false;
  }
}

// Main
console.log(`🔍 Checking port ${PORT}...`);
const pid = getProcessOnPort(PORT);

if (pid) {
  console.log(`⚠️  Found process ${pid} using port ${PORT}`);
  console.log(`🔨 Killing process ${pid}...`);

  if (killProcess(pid)) {
    console.log(`✅ Process killed`);
    // Wait a moment for port to be released
    setTimeout(() => {
      startServer();
    }, 1000);
  } else {
    console.error(`❌ Failed to kill process`);
    process.exit(1);
  }
} else {
  console.log(`✅ Port ${PORT} is free`);
  startServer();
}

function startServer() {
  console.log(`\n🚀 Starting Next.js dev server on port ${PORT}...\n`);

  const frontendRoot = path.resolve(__dirname, "..");

  // Use spawn (async) instead of spawnSync for better error handling
  const { spawn } = require("child_process");
  const child = spawn("npx", ["next", "dev", "-p", PORT.toString()], {
    cwd: frontendRoot,
    stdio: "inherit",
    shell: true,
  });

  child.on("error", (err) => {
    console.error(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`❌ Server exited with code ${code}`);
      process.exit(code);
    }
  });
}
