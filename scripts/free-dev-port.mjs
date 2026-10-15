import { spawn } from "node:child_process";

const PORT = 1420;
const LSOF_TIMEOUT_MS = 2500;

function listPortPids(port) {
  return new Promise((resolve) => {
    const child = spawn("lsof", ["-ti", `tcp:${port}`], {
      stdio: ["ignore", "pipe", "ignore"],
    });
    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve("");
    }, LSOF_TIMEOUT_MS);
    child.on("close", () => {
      clearTimeout(timer);
      resolve(stdout);
    });
    child.on("error", () => {
      clearTimeout(timer);
      resolve("");
    });
  });
}

if (process.platform === "win32") {
  process.exit(0);
}

const stdout = await listPortPids(PORT);
const pids = stdout
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .map((value) => Number(value))
  .filter((pid) => Number.isFinite(pid) && pid > 0);

for (const pid of pids) {
  try {
    process.kill(pid, "SIGTERM");
    console.log(`[free-dev-port] Stopped pid ${pid} on port ${PORT}`);
  } catch {
    // already gone
  }
}

if (pids.length > 0) {
  await new Promise((resolve) => setTimeout(resolve, 250));
}
