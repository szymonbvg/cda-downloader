# CDA-Downloader

A simple command-line tool for downloading videos from [cda.pl](https://www.cda.pl)

**NOTE:** Currently only videos in DASH segments are supported. If a video URL ends with `/vfilm`, it won't be downloaded

## INSTALLATION

### Global installation

Install the package from npm globally

```
npm install -g cda-downloader
```

### Manual installation

Clone repository

```
git clone https://github.com/szymonbvg/cda-downloader.git
```

Install dependencies

```
cd cda-downloader && npm install
```

**NOTE:** To use the tool as a system-wide command from outside the project folder, you still need to install it globally using `npm install -g`

## USAGE AND OPTIONS

After installing globally:

```
cda-downloader [options] url
```

Running it inside the project folder:

```
npm start -- [options] url
```

### Options:

```
-h, --help                 Show help
-v, --version              Show version
-ao, --audio-only          Download audio only
-vo, --video-only          Download video only
-s, --skip-download        Print video information, do no download
-j, --json                 Print video information as JSON, do not download
-o, --output <output>      Set output media file path. Without --audio-only or
                           --video-only, it sets the path for the final merged file
                           (default: generated name in current directory)
-q, --quality <quality>    Set video quality. Accepts values in the format shown by the
                           program in the [quality] column (e.g. "1080p, "720p"). If
                           not specified, the best quality is selected automatically
-f, --ffmpeg-path <path>   Set path to the FFmpeg executable (default: "ffmpeg")
```
