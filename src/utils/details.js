import wrapAnsi from "wrap-ansi";
import args from "../config/args.js";
import pkg from "../../package.json" with { type: "json" };

export function showDetails() {
  console.log(`cda-downloader v${pkg.version}`);
  if (args.version.value) return;

  const formattedArgs = Object.values(args).map((arg) => ({
    options: arg.requiresValue
      ? `${arg.options.join(", ")} <${arg.requiredValueName}>`
      : arg.options.join(", "),
    description: arg.description,
  }));
  const max = Math.max(...formattedArgs.map((arg) => arg.options.length));

  console.log("\nUsage: cda-downloader [options] url\n")
  for (const arg of formattedArgs) {
    const wrapped = wrapAnsi(arg.description, 60, { trim: true }).split("\n");
    console.log(arg.options.padEnd(max + 3) + wrapped[0]);
    for (let i = 1; i < wrapped.length; i++) {
      console.log(" ".padEnd(max + 3) + wrapped[i]);
    }
  }
}
