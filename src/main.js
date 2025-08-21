import args from "./config/args.js";
import { showInfo, showJSON, showMessage } from "./utils/logger.js";
import { rmSync } from "fs";
import { mkdir } from "fs/promises";
import { parseArgs, parseDuration } from "./utils/parser.js";
import { DownloaderError } from "./utils/DownloaderError.js";
import { InfoMessage } from "./config/messages.js";
import { ErrorCode } from "./config/errors.js";
import { download, getSegments, getVideoData } from "./helpers/downloader.js";
import { checkAvaibility, merge } from "./helpers/ffmpeg.js";
import { showDetails } from "./utils/details.js";
import { parse } from "path";

export async function main() {
  const userArgs = process.argv.slice(2);
  const data = parseArgs(userArgs);

  if (args.help.value || args.version.value) {
    showDetails();
    return 0;
  }

  if (data instanceof DownloaderError) data.handle();
  if (!data) new DownloaderError(ErrorCode.NEEDS_URL).handle();

  if (args.audioOnly.value && args.videoOnly.value) {
    args.audioOnly.value = false;
    args.videoOnly.value = false;
    showInfo(InfoMessage.BOTH_AUDIO_VIDEO_ONLY, true);
  }

  const isFFmpegAvailable = await checkAvaibility();
  if (!isFFmpegAvailable) showInfo(InfoMessage.FFMPEG_UNAVAILABLE, true);

  const cdaRegExp = new RegExp(/^(http(s)?:\/\/)?((www|m)\.)?cda\.pl\/video\/.+$|^[^\s./]+$/);
  const match = data.match(cdaRegExp);
  if (!match) new DownloaderError(ErrorCode.INVALID_URL).handle();

  const videoId = data
    .split("/")
    .filter((e) => e !== "")
    .pop();

  if (videoId === "vfilm") new DownloaderError(ErrorCode.DASH_ONLY).handle();

  const videoData = await getVideoData(videoId);
  if (videoData instanceof DownloaderError) videoData.handle();

  const segments = await getSegments(videoData.manifest);
  if (segments instanceof DownloaderError) segments.handle();
  if (segments.audio.length <= 0 || segments.video.length <= 0) {
    new DownloaderError(ErrorCode.NO_SEGMENTS).handle();
  }

  showMessage("title", decodeURIComponent(videoData.title));
  showMessage("duration", parseDuration(videoData.duration));
  const qualities = [];
  for (const segment of segments.video) {
    qualities.push(segment.resolution);
    showMessage("quality", segment.resolution);
  }

  if (args.json.value) {
    showJSON({ title: decodeURIComponent(videoData.title), duration: videoData.duration, qualities });
    return 0;
  }

  if (args.skipDownload.value) return 0;

  const quality = args.quality.value ?? segments.video[0].resolution;
  if (!qualities.includes(quality)) new DownloaderError(ErrorCode.UNKNOWN_QUALITY, quality).handle();

  if (!args.audioOnly.value) {
    if (!args.quality.value) showInfo(InfoMessage.AUTOMATIC_QUALITY, true);
    showInfo(InfoMessage.SELECTED_QUALITY(quality));
  }

  const bestAudio = segments.audio.reduce((a, b) => (a.bandwidth > b.bandwidth ? a : b));
  const videoSegment = segments.video.find((s) => s.resolution === quality);

  const segmentsUrl = videoData.manifest.substring(0, videoData.manifest.lastIndexOf("/") + 1);

  const { path, file } = args.output.value;

  let audioDownload = {
    url: segmentsUrl + bestAudio.url,
    output: `${path}/temp_${videoId}/audio.mp3`,
  };
  let videoDownload = {
    url: segmentsUrl + videoSegment.url,
    output: `${path}/temp_${videoId}/video.mp4`,
  };

  let sources = [videoDownload, audioDownload];
  if (args.audioOnly.value) {
    audioDownload.output = `${path}/${file ?? `${videoId}_audio.mp3`}`;
    sources = [audioDownload];
  } else if (args.videoOnly.value) {
    videoDownload.output = `${path}/${file ?? `${videoId}_${quality}.mp4`}`;
    sources = [videoDownload];
  } else if (!isFFmpegAvailable) {
    const filename = file ? parse(file).name : videoId;
    audioDownload.output = `${path}/${filename}_audio.mp3`;
    videoDownload.output = `${path}/${filename}_video.mp4`;
  } else {
    await mkdir(`${path}/temp_${videoId}`, { recursive: true });
  }

  const err = await download(sources);
  if (err instanceof DownloaderError) err.handle();

  if (args.audioOnly.value || args.videoOnly.value || !isFFmpegAvailable) {
    showInfo(InfoMessage.SUCCESS);
    return 0;
  }

  if (!args.output.value.file) args.output.value.file = `${videoId}_${quality}.mp4`;

  showMessage("merge", InfoMessage.MERGING_STARTED);
  const mergeErr = await merge([videoDownload.output, audioDownload.output]);
  if (mergeErr instanceof DownloaderError) {
    showInfo(InfoMessage.FILES_IN_TEMP(videoId));
    mergeErr.handle();
  }

  showInfo(InfoMessage.SUCCESS);

  const rmErr = rmSync(`${path}/temp_${videoId}`, { recursive: true, force: true });
  if (rmErr) {
    showInfo(InfoMessage.TEMP_REMOVE_FAIL, true);
    return 0;
  }
  showInfo(InfoMessage.TEMP_REMOVED);

  return 0;
}
