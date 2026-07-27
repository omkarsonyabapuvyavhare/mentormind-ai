import { execSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync } from "node:fs";

const lockPath = ".next/dev/lock";
const DEV_PORT = 3000;

function isProcessRunning(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function readLockPid() {
  if (!existsSync(lockPath)) {
    return null;
  }

  try {
    const lock = JSON.parse(readFileSync(lockPath, "utf8"));
    const pid = Number(lock.pid);
    return Number.isInteger(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

function removeLockFile(reason) {
  try {
    unlinkSync(lockPath);
    console.info(`[dev] ${reason}`);
  } catch {
    // Ignore — Next.js will surface an actionable error if needed.
  }
}

function findWindowsPortPid(port) {
  if (process.platform !== "win32") {
    return null;
  }

  try {
    const output = execSync(`netstat -ano | findstr :${port}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    for (const line of output.split("\n")) {
      if (!/LISTENING/i.test(line)) {
        continue;
      }

      const parts = line.trim().split(/\s+/);
      const pid = Number(parts[parts.length - 1]);
      if (Number.isInteger(pid) && pid > 0) {
        return pid;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function isWindowsNodeProcess(pid) {
  if (process.platform !== "win32") {
    return false;
  }

  try {
    const output = execSync(
      `tasklist /FI "PID eq ${pid}" /FO CSV /NH`,
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    return /"node\.exe"/i.test(output);
  } catch {
    return false;
  }
}

function killWindowsProcess(pid, reason) {
  if (process.platform !== "win32") {
    return;
  }

  try {
    execSync(`taskkill /PID ${pid} /F /T`, {
      stdio: ["ignore", "ignore", "ignore"],
    });
    console.info(`[dev] ${reason} (pid ${pid}).`);
  } catch {
    // Process may have already exited.
  }
}

function cleanStaleLock() {
  const lockPid = readLockPid();

  if (lockPid === null) {
    if (existsSync(lockPath)) {
      removeLockFile("Removed invalid Next.js dev lock.");
    }
    return lockPid;
  }

  if (!isProcessRunning(lockPid)) {
    removeLockFile(`Removed stale Next.js dev lock (pid ${lockPid}).`);
    return null;
  }

  return lockPid;
}

function freeStaleDevPort(activeLockPid) {
  const portPid = findWindowsPortPid(DEV_PORT);

  if (!portPid) {
    return;
  }

  if (activeLockPid && portPid === activeLockPid) {
    return;
  }

  if (!isWindowsNodeProcess(portPid)) {
    return;
  }

  if (activeLockPid && isProcessRunning(activeLockPid)) {
    return;
  }

  killWindowsProcess(
    portPid,
    `Stopped orphaned Node process holding port ${DEV_PORT}`,
  );
}

const activeLockPid = cleanStaleLock();
freeStaleDevPort(activeLockPid);
