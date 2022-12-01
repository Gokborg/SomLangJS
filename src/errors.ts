import { Token } from "./token.ts";

const enum InfoLevel {

}

class Info {
  constructor(
    public token: Optional<Token>,
    public msg: string,
    public level: 
  ) {}
  static msg(msg: string) {
    return new Info(undefined, msg);
  }
}

class ErrorContext {
  infos: Info[] = []
  error(token: Token, msg: string) {
    this.errors.push(new Info(token, msg));
  }
  error_msg(msg: string) {
    this.errors.push(new Info(undefined, msg));
  }
  print_errors() {
    for (const info of)
  }
}