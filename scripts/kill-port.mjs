import { execSync } from "node:child_process";

try {
  const output = execSync("netstat -ano | findstr :3102", { encoding: "utf8" });
  const lines = output.trim().split("\n");
  const pids = new Set();
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 5) {
      const pid = parts[parts.length - 1];
      if (pid && pid !== "0") pids.add(pid);
    }
  }

  for (const pid of pids) {
    console.log(`Killing PID ${pid}...`);
    try {
      execSync(`taskkill /F /PID ${pid}`);
    } catch (e) {
      console.log(`Could not kill ${pid}:`, e.message);
    }
  }
  console.log("Port 3102 freed!");
} catch (err) {
  console.log("No process found on 3102:", err.message);
}
