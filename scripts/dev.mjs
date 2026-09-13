import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const processes = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of processes) child.kill();
  process.exitCode = code;
}
function start(args) {
  const child = spawn(process.execPath, args, { cwd: root, stdio: 'inherit', windowsHide: true });
  processes.push(child);
  child.on('error', error => { console.error('Unable to start local server:', error.message); stop(1); });
  child.on('exit', code => { if (!stopping) stop(code || 1); });
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
start(['--watch', '--watch-path=server', '--watch-path=src/services/patientValidation.js', 'server/index.js']);
start(['node_modules/vite/bin/vite.js', '--host', 'localhost', '--strictPort', ...process.argv.slice(2)]);
