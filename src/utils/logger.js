import args from "../config/args.js";

const Color = {
  YELLOW: 33,
  RED: 31,
};

function colorized(color, str) {
  return `\x1b[${color}m${str}\x1b[0m`;
}

export function showInfo(data, highlighted = false) {
  if (args.json.value) return;
  console.log(`[info] ${highlighted ? colorized(Color.YELLOW, data) : data}`);
}

export function showError(data) {
  if (args.json.value) return;
  console.error(`[error] ${colorized(Color.RED, data)}`);
}

export function showMessage(type, data) {
  if (args.json.value) return;
  console.log(`[${type}] ${data}`);
}

export function showJSON(data) {
  console.log(JSON.stringify(data));
}

export function showProgress(percent) {
  process.stdout.write(`\r\x1b[2K[progress] ${percent.toFixed(1)}%`);
}
