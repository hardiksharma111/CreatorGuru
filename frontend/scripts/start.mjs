import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const port = Number(process.env.PORT || 3010);

const scriptPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "node_modules", "next", "dist", "bin", "next");

const child = spawn(process.execPath, [scriptPath, "start", "-p", String(port)], {
  stdio: "inherit"
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});