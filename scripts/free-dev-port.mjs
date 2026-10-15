import { execFile } from "node:child_process";
import net from "node:net";
import { promisify } from "node:util";

const PORT = 1420;
const LSOF_TIMEOUT_MS = 2000;

const execFileAsync = promisify(execFile);

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once("error", () => resolve(false));
    server.listen(port, "127.0.0.1", () => {
      server.close(() => resolve(true));
    });
  });
}

async function listPortPidsUnix(port) {
  try {
    const { stdout } = await execFileAsync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"], {
      timeout: LSOF_TIMEOUT_MS,
      killSignal: "SIGKILL",
    });
    return stdout;
  } catch {
    return "";
  }
}

async function listPortPidsWindows(port) {
  try {
    const { stdout } = await execFileAsync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess`,
      ],
      { timeout: LSOF_TIMEOUT_MS, killSignal: "SIGKILL" },
    );
    return stdout;
  } catch {
    return "";
  }
}

async function listPortPids(port) {
  if (process.platform === "win32") return listPortPidsWindows(port);
  return listPortPidsUnix(port);
}

if (await isPortFree(PORT)) {
  process.exit(0);
}

const stdout = await listPortPids(PORT);
const pids = stdout
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .map((value) => Number(value))
  .filter((pid) => Number.isFinite(pid) && pid > 0 && pid !== process.pid);

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
