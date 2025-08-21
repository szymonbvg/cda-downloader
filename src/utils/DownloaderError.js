import { ErrorMessage } from "../config/messages.js";
import { showError } from "./logger.js";

export class DownloaderError {
  _code;
  _data;
  _message;

  constructor(code, ...data) {
    this._code = code;
    this._data = data;
    let msg = ErrorMessage[this._code];
    this._message = typeof msg === "function" ? msg(...this._data) : msg;
  }

  handle() {
    showError(this._message);
    process.exit(this._code);
  }

  get code() {
    return this._code;
  }

  get data() {
    return this._data;
  }

  get message() {
    return this._message;
  }
}
