import { spawn } from "child_process";
import { rm } from "fs/promises";
import net from "net";
import { fileURLToPath } from "url";
import path from "path";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextCliPath = path.resolve(appRoot, "node_modules", "next", "dist", "bin", "next");
const nextCachePath = path.resolve(appRoot, ".next");

const requestedPort = Number(process.env.PORT || 3010);
const maxAutoHealAttempts = Math.max(1, Math.min(5, Number(process.env.DEV_HEAL_ATTEMPTS || 3)));

const knownErrorMarkers = [
  "missing required error components",
  "Cannot find module './chunks/vendor-chunks/next.js'",
  "MODULE_NOT_FOUND"
];

function hasKnownErrorMarker(text) {
  const lower = text.toLowerCase();
  return knownErrorMarkers.some((marker) => lower.includes(marker.toLowerCase()));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once("error", () => resolve(false));
    tester.once("listening", () => {
      tester.close(() => resolve(true));
    });
    tester.listen(port, "127.0.0.1");
  });
}

async function choosePort(startPort) {
  for (let port = startPort; port < startPort + 20; port += 1) {
    // eslint-disable-next-line no-await-in-loop
    const free = await isPortAvailable(port);
    if (free) {
      return port;
    }
  }
  return startPort;
}

async function clearNextCache() {
  await rm(nextCachePath, { recursive: true, force: true });
}

function parseLines(stream, onLine) {
  let buffer = "";
  stream.on("data", (chunk) => {
    const text = chunk.toString();
    buffer += text;

    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex).trimEnd();
      buffer = buffer.slice(newlineIndex + 1);
      onLine(line);
      newlineIndex = buffer.indexOf("\n");
    }
  });
}

function startNextDev(port) {
  const child = spawn(process.execPath, [nextCliPath, "dev", "-p", String(port)], {
    cwd: appRoot,
    env: {
      ...process.env,
      PORT: String(port)
    },
    stdio: ["inherit", "pipe", "pipe"]
  });

  return child;
}

async function checkHealth(port) {
  const url = `http://localhost:${port}`;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await fetch(url, { cache: "no-store" });
      // eslint-disable-next-line no-await-in-loop
      const body = await response.text();
      if (response.ok && !hasKnownErrorMarker(body)) {
        return true;
      }
    } catch {
      // Ignore and retry.
    }

    // eslint-disable-next-line no-await-in-loop
    await wait(900);
  }

  return false;
}

function killProcess(child) {
  if (!child.killed) {
    child.kill("SIGTERM");
  }
}

async function bootOnce(port) {
  const child = startNextDev(port);

  let sawReady = false;
  let sawKnownError = false;
  let sawPortInUse = false;

  parseLines(child.stdout, (line) => {
    process.stdout.write(`${line}\n`);

    if (line.includes("Ready in")) {
      sawReady = true;
    }

    if (line.includes("EADDRINUSE") || line.includes("address already in use")) {
      sawPortInUse = true;
    }

    if (hasKnownErrorMarker(line)) {
      sawKnownError = true;
    }
  });

  parseLines(child.stderr, (line) => {
    process.stderr.write(`${line}\n`);

    if (line.includes("EADDRINUSE") || line.includes("address already in use")) {
      sawPortInUse = true;
    }

    if (hasKnownErrorMarker(line)) {
      sawKnownError = true;
    }
  });

  const bootResult = await new Promise((resolve) => {
    const timer = setInterval(() => {
      if (sawPortInUse) {
        clearInterval(timer);
        resolve({ status: "port-in-use" });
      } else if (sawKnownError) {
        clearInterval(timer);
        resolve({ status: "known-error" });
      } else if (sawReady) {
        clearInterval(timer);
        resolve({ status: "ready" });
      }
    }, 150);

    child.once("exit", (code) => {
      clearInterval(timer);
      resolve({ status: "exited", code: code ?? 0 });
    });
  });

  if (bootResult.status !== "ready") {
    killProcess(child);
    return { ...bootResult, child: null };
  }

  const healthy = await checkHealth(port);
  if (!healthy || sawKnownError) {
    killProcess(child);
    return { status: "unhealthy", child: null };
  }

  console.log(`\nSelf-heal check passed. App is running at http://localhost:${port}\n`);

  const runtimeResult = await new Promise((resolve) => {
    const timer = setInterval(() => {
      if (sawKnownError) {
        clearInterval(timer);
        killProcess(child);
        resolve({ status: "runtime-known-error" });
      }
    }, 300);

    child.once("exit", (code) => {
      clearInterval(timer);
      resolve({ status: "exit", code: code ?? 0 });
    });
  });

  return { ...runtimeResult, child: null };
}

async function main() {
  let healCount = 0;
  let currentPort = await choosePort(requestedPort);

  while (healCount <= maxAutoHealAttempts) {
    if (healCount > 0) {
      console.log("Detected unstable dev state. Clearing .next cache and restarting...");
      await clearNextCache();
    }

    const result = await bootOnce(currentPort);

    if (result.status === "exit") {
      process.exit(result.code ?? 0);
    }

    if (result.status === "port-in-use") {
      currentPort = await choosePort(currentPort + 1);
      healCount += 1;
      continue;
    }

    if (["known-error", "unhealthy", "runtime-known-error", "exited"].includes(result.status)) {
      healCount += 1;
      continue;
    }

    healCount += 1;
  }

  console.error("Auto-heal limit reached. Please run: Remove-Item frontend\\.next -Recurse -Force; npm run frontend:dev");
  process.exit(1);
}

void main();