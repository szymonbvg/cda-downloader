import { basename, dirname, isAbsolute, join } from "path";
import args from "../config/args.js";
import { ErrorCode } from "../config/errors.js";
import { DownloaderError } from "./DownloaderError.js";

export function parseArgs(userArgs) {
  let requiredArg = null;

  for (let i = 0; i < userArgs.length; i++) {
    let found = false;

    for (const a in args) {
      if (args[a].options.some((o) => o === userArgs[i])) {
        found = true;
        if (!args[a].requiresValue) {
          args[a].value = true;
          break;
        }

        if (userArgs[i + 1].startsWith("-")) {
          return new DownloaderError(ErrorCode.MISSING_ARGUMENT, userArgs[i]);
        }

        if (args[a] === args.output) {
          const output = userArgs[i + 1];
          const path = isAbsolute(output) ? output : join(process.cwd(), output);
          args[a].value = { path: dirname(path), file: basename(path) ?? "output" };
          i++;
          break;
        }

        args[a].value = userArgs[i + 1];
        i++;
        break;
      }
    }
    if (!found) {
      if (requiredArg || userArgs[i].startsWith("-")) {
        return new DownloaderError(ErrorCode.UNKNOWN_OPTION, userArgs[i]);
      }

      requiredArg = userArgs[i];
      continue;
    }
  }

  return requiredArg;
}

export function parseDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return [h ? `${h}h` : "", h || m ? `${m}m` : "", `${s}s`].join(" ");
}
