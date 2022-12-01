import { Token } from "./token.ts";

const enum ErrorLevel {
  Info = "Info", Warning = "Warning", Error = "Error"
}

class Info {
  constructor(
    public token: undefined | Token,
    public msg: string,
    public level = ErrorLevel.Error
  ) {}
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
      output += ' '.repeat(this.token.start-1) + '^';
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

  throw(token: Token, msg: string): never {
    this.print_errors()
    throw new Error(new Info(token, msg).toString())
  }
  throw_msg(msg: string): never {
    this.print_errors();
    throw new Error(new Info(undefined, msg).toString());
  }

  error(token: Token, msg: string) {
    this.infos.push(new Info(token, msg))
  }
  error_msg(msg: string) {
    this.infos.push(new Info(undefined, msg))
  }
  warn(token: Token, msg: string) {
    this.warnings.push(new Info(token, msg, ErrorLevel.Warning))
  }
  warn_msg(msg: string) {
    this.warnings.push(new Info(undefined, msg, ErrorLevel.Warning))
  }
  info(token: Token, msg: string) {
    this.errors.push(new Info(token, msg, ErrorLevel.Info))
  }
  info_msg(msg: string) {
    this.errors.push(new Info(undefined, msg, ErrorLevel.Info))
  }
  toString() {
    let messages = "";
    if (this.errors) {
      messages += "[ERRORS]:\n"
    }
    for (const error of this.errors) {
      messages += error.toString();
    }

    if (this.warnings) {
      messages += "[WARNINGS]:\n"
    }
    for (const error of this.warnings) {
      messages += error.toString();
    }

    if (this.warnings) {
      messages += "[INFO]:\n"
    }
    for (const error of this.infos) {
      messages += error.toString();
    }

    return messages
  }
  print_errors() {
    console.error(this.toString());
  }
}