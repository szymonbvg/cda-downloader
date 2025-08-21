import axios, { AxiosError } from "axios";
import { createWriteStream } from "fs";
import { parse } from "mpd-parser";
import * as htmlParser from "node-html-parser";
import { DownloaderError } from "../utils/DownloaderError.js";
import { ErrorCode } from "../config/errors.js";
import { showProgress } from "../utils/logger.js";

export async function getVideoData(id) {
  const ebd = await axios.get(`https://ebd.cda.pl/x/${id}`).catch((err) => {
    if (err instanceof AxiosError) {
      const { status, statusText } = err.response;
      return new DownloaderError(ErrorCode.CDA_HTTP_ERROR, status, statusText);
    }
    return new DownloaderError(ErrorCode.FAILED_TO_FETCH_DATA);
  });

  if (ebd instanceof DownloaderError) return ebd;

  const parsed = htmlParser.parse(ebd.data);
  const mediaPlayer = parsed.querySelector("[id^='mediaplayer']");

  if (!mediaPlayer) return new DownloaderError(ErrorCode.FAILED_TO_FETCH_DATA);

  const playerData = mediaPlayer.attrs["player_data"];
  const { manifest, title, duration } = JSON.parse(playerData).video;
  return { manifest, title, duration: parseInt(duration) };
}

export async function getSegments(manifestUrl) {
  if (!manifestUrl) return new DownloaderError(ErrorCode.DASH_ONLY);

  const res = await axios.get(manifestUrl).catch((err) => {
    if (err instanceof AxiosError) {
      const { status, statusText } = err.response;
      return new DownloaderError(ErrorCode.CDA_HTTP_ERROR, status, statusText);
    }
    return new DownloaderError(ErrorCode.INTERNAL_ERROR, err);
  });

  if (res instanceof DownloaderError) return res;

  const parsedMpd = parse(res.data);
  const segments = { audio: [], video: [] };
  for (const vSegment of parsedMpd.playlists) {
    segments.video.push({
      url: vSegment.resolvedUri.slice(1),
      resolution: `${vSegment.attributes.RESOLUTION.height}p`,
    });
  }
  for (const aSegment of parsedMpd.mediaGroups.AUDIO.audio.main.playlists) {
    segments.audio.push({
      url: aSegment.resolvedUri.slice(1),
      bandwidth: aSegment.attributes.BANDWIDTH,
    });
  }
  segments.video.sort((a, b) => parseInt(b.resolution) - parseInt(a.resolution));
  return segments;
}

export async function download(sources) {
  return new Promise((resolve) => {
    let done = 0;
    sources.forEach((source) => {
      axios
        .get(source.url, { responseType: "stream" })
        .then((res) => {
          const total = res.headers["content-length"];
          let downloaded = 0;

          res.data.on("data", (chunk) => {
            downloaded += chunk.length;
            const progress = (downloaded / total) * 100;
            showProgress(progress);
          });

          const writeStream = createWriteStream(source.output);
          res.data.pipe(writeStream);

          writeStream.on("finish", () => {
            done += 1;
            if (done >= sources.length) {
              process.stdout.write("\n");
              resolve(undefined);
            }
          });
          writeStream.on("error", (err) => {
            resolve(new DownloaderError(ErrorCode.WRITE_STREAM_ERROR, err.message));
          });
        })
        .catch((err) => {
          if (err instanceof AxiosError) {
            const res = err.response;
            resolve(new DownloaderError(ErrorCode.CDA_HTTP_ERROR, res.status, res.statusText));
          }
          resolve(new DownloaderError(ErrorCode.INTERNAL_ERROR, err));
        });
    });
  });
}
