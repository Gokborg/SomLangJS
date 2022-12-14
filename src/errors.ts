import { Token } from "./token.ts";

const enum ErrorLevel {
  Info = "Info", Warning = "Warning", Error = "Error"
}

const debug = true;

class Info {
  error?: Error;
  constructor(
    public token: undefined | Token,
    public msg: string,
    public level = ErrorLevel.Error
  ) {
    if (debug) {
      this.error = new Error();
    }
  }
  static msg(msg: string) {
    return new Info(undefined, msg);
  }
  toString(file_name = "<eval>"){
    let output = "";
    if (this.token) {
      output += `${file_name}:${this.token.lineno}:${this.token.start}: `;
    }
    output += `${this.level}: ${this.msg}\n`;
    if (this.token) {
      output += `${this.token.line}\n`;
      output += ' '.repeat(this.token.start) + '^';
    }

    if (this.error) {
      console.error(this.error);
      output += "\n" + this.error.stack;
    }

    return output;
  }
}

export class ErrorContext {
  infos: Info[] = []
  warnings: Info[] = []
  errors: Info[] = []

  has_error() {
    return this.errors.length > 0;
  }
  has_warning() {
    return this.errors.length > 0 || this.warnings.length > 0;
  }

  throw(token: Token, msg: string): never {
    const info = new Info(token, msg);
    this.errors.push(info);
    throw new Error(info.toString())
  }
  throw_msg(msg: string): never {
    const info = new Info(undefined, msg);
    this.errors.push(info);
    throw new Error(info.toString());
  }

  error(token: Token, msg: string) {
    this.errors.push(new Info(token, msg))
  }
  error_msg(msg: string) {
    this.errors.push(new Info(undefined, msg))
  }
  warn(token: Token, msg: string) {
    this.warnings.push(new Info(token, msg, ErrorLevel.Warning))
  }
  warn_msg(msg: string) {
    this.warnings.push(new Info(undefined, msg, ErrorLevel.Warning))
  }
  info(token: Token, msg: string) {
    this.infos.push(new Info(token, msg, ErrorLevel.Info))
  }
  info_msg(msg: string) {
    this.infos.push(new Info(undefined, msg, ErrorLevel.Info))
  }
  toString() {
    let messages = "";
    if (this.errors.length > 0) {
      messages += "[ERRORS]:\n"
    }
    for (const error of this.errors) {
      messages += error.toString() + "\n";
    }

    if (this.warnings.length > 0) {
      messages += "[WARNINGS]:\n"
    }
    for (const warning of this.warnings) {
      messages += warning.toString() + "\n";
    }

    if (this.infos.length > 0) {
      messages += "[INFO]:\n"
    }
    for (const info of this.infos) {
      messages += info.toString() + "\n";
    }

    return messages
  }
  print_errors() {
    console.error(this.toString());
  }
}