#! /usr/bin/env node

import { main } from "./src/main.js";
import { ErrorCode } from "./src/config/errors.js";
import { DownloaderError } from "./src/utils/DownloaderError.js";

main()
  .then((code) => {
    process.exit(code);
  })
  .catch((err) => {
    new DownloaderError(ErrorCode.INTERNAL_ERROR, err).handle();
  });
