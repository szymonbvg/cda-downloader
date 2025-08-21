import { ErrorCode } from "./errors.js";

export const ErrorMessage = {
  [ErrorCode.INTERNAL_ERROR]: (err) => `Internal error:\n${err}`,
  [ErrorCode.NEEDS_URL]: "Missing required argument URL",
  [ErrorCode.INVALID_URL]: "Provided URL/ID is invalid",
  [ErrorCode.UNKNOWN_OPTION]: (opt) => `unknown option '${opt}'`,
  [ErrorCode.MISSING_ARGUMENT]: (opt) => `option '${opt}' requires an argument`,
  [ErrorCode.UNKNOWN_QUALITY]: (q) => `Unknown quality '${q}'`,
  [ErrorCode.CDA_HTTP_ERROR]: (status, text) => `CDA HTTP error: [${status}] ${text}`,
  [ErrorCode.FAILED_TO_FETCH_DATA]: "Failed to fetch video data",
  [ErrorCode.NO_SEGMENTS]: "No DASH segments found",
  [ErrorCode.WRITE_STREAM_ERROR]: (err) => `Error writing to file:\n${err}`,
  [ErrorCode.FFMPEG_ERROR]: "FFmpeg error",
  [ErrorCode.MERGING_ERROR]: (err) => `FFmpeg merging error: ${err}`,
  [ErrorCode.DASH_ONLY]: "Currently only videos in DASH segments are supported",
};

export const InfoMessage = {
  FILES_IN_TEMP: (id) => `Downloaded media files are available in the 'temp_${id}' directory`,
  SELECTED_QUALITY: (q) => `Selected quality: ${q}`,
  BOTH_AUDIO_VIDEO_ONLY:
    "Options --audio-only and --video-only cannot be combined. Downloading both sources and merging",
  FFMPEG_UNAVAILABLE: "FFmpeg not found. Audio and video won't be merged",
  AUTOMATIC_QUALITY: "No quality specified. Using best available",
  SUCCESS: "Successfully downloaded",
  TEMP_REMOVED: "Temp files removed",
  TEMP_REMOVE_FAIL: "Could not remove temp files",
  MERGING_STARTED: "Merging started...",
};
