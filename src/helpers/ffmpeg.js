import { spawn } from "child_process";
import args from "../config/args.js";
import { DownloaderError } from "../utils/DownloaderError.js";
import { ErrorCode } from "../config/errors.js";

export function checkAvaibility() {
  return new Promise((resolve) => {
    const ffmpeg = spawn(args.ffmpegPath.value ?? "ffmpeg", ["-version"]);
    ffmpeg.on("error", () => {});
    ffmpeg.on("close", (code) => {
      if (code !== null && !code) {
        resolve(true);
        return;
      }
      resolve(false);
    });
  });
}

export function merge(files) {
  if (files.length < 2) {
    return new DownloaderError(ErrorCode.MERGING_ERROR, "No files to merge");
  }

  return new Promise((resolve) => {
    const ffmpeg = spawn(args.ffmpegPath.value ?? "ffmpeg", [
      "-y",
      "-i",
      files[0],
      "-i",
      files[1],
      "-c",
      "copy",
      `${args.output.value.path}/${args.output.value.file}`,
    ]);
    ffmpeg.on("error", () => {
      resolve(new DownloaderError(ErrorCode.FFMPEG_ERROR));
    });
    ffmpeg.on("close", (code) => {
      if (code) {
        resolve(new DownloaderError(ErrorCode.MERGING_ERROR, code));
        return;
      }
      resolve(undefined);
    });
  });
}
