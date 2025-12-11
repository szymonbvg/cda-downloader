export default {
  help: {
    options: ["-h", "--help"],
    value: false,
    description: "Show help",
  },
  version: {
    options: ["-v", "--version"],
    value: false,
    description: "Show version",
  },
  audioOnly: {
    options: ["-ao", "--audio-only"],
    value: false,
    description: "Download audio only. Not supported for non-DASH (vfilm) media",
  },
  videoOnly: {
    options: ["-vo", "--video-only"],
    value: false,
    description: "Download video only. Not supported for non-DASH (vfilm) media",
  },
  skipDownload: {
    options: ["-s", "--skip-download"],
    value: false,
    description: "Print video information, do not download",
  },
  json: {
    options: ["-j", "--json"],
    value: false,
    description: "Print video information as JSON, do not download",
  },
  output: {
    options: ["-o", "--output"],
    value: { path: process.cwd(), file: null },
    description:
      "Set output media file path. " +
      "Without --audio-only or --video-only, " +
      "it sets the path for the final merged file " +
      "(default: generated name in current directory)",
    requiresValue: true,
    requiredValueName: "output",
  },
  quality: {
    options: ["-q", "--quality"],
    value: null,
    description:
      "Set video quality. " +
      "Accepts values in the format shown by the program " +
      `in the [quality] column (e.g. "1080p, "720p"). ` +
      "If not specified, the best quality is selected automatically",
    requiresValue: true,
    requiredValueName: "quality",
  },
  ffmpegPath: {
    options: ["-f", "--ffmpeg-path"],
    value: null,
    description: `Set path to the FFmpeg executable (default: "ffmpeg")`,
    requiresValue: true,
    requiredValueName: "path",
  },
};
