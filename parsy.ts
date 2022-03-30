export interface ParsyTransformer<T, R> {
  (context: T): R;
}

export interface ParsyParser<T extends ParsyContext> {
  parse(ctx: ParsyContext): T;
}

export class ParsyContext {
  public type: string;
  public source: string;
  public start: number;
  public end: number;

  constructor(ctx: ParsyContext, public children: ParsyContext[] = []) {
    this.type = "empty";
    this.source = ctx.source;
    this.start = children[0]?.start ?? ctx.end;
    this.end = children[children.length - 1]?.end ?? ctx.end;
  }
}

export class ParsyError extends ParsyContext {
  constructor(ctx: ParsyContext, public expected: string) {
    super(ctx);
    this.type = "error";
  }
}

export class ParsyText extends ParsyContext {
  constructor(ctx: ParsyContext, public text: string) {
    super(ctx);
    this.type = "text";
    this.start = ctx.end;
    this.end = ctx.end + text.length;
  }
}

export function dot(length = 1): ParsyParser<ParsyText> {
  return {
    parse(ctx) {
      return new ParsyText(ctx, ctx.source.substr(ctx.end, length));
    },
  };
}

export function text(value: string): ParsyParser<ParsyText | ParsyError> {
  return {
    parse(ctx) {
      return ctx.source.startsWith(value, ctx.end)
        ? new ParsyText(ctx, value)
        : new ParsyError(ctx, value);
    },
  };
}

export function regex(
  regex: RegExp,
): ParsyParser<ParsyText | ParsyError> {
  if (!regex.flags.includes("g")) {
    regex = new RegExp(regex.source, "g");
  }

  if (regex.source.startsWith("^")) {
    throw new Error("Regex cannot start with '^'");
  }

  return {
    parse(ctx) {
      regex.lastIndex = ctx.end;
      const match = regex.exec(ctx.source);
      return match?.index === ctx.end // && match[0].length > 0
        ? new ParsyText(ctx, match[0])
        : new ParsyError(ctx, regex.toString());
    },
  };
}

export function and(
  ...parsers: ParsyParser<ParsyContext>[]
): ParsyParser<ParsyContext> {
  return {
    parse(ctx: ParsyContext) {
      const children: ParsyContext[] = [];

      for (const parser of parsers) {
        const child: ParsyContext = parser.parse(ctx);

        if (child instanceof ParsyError) {
          return child;
        } else if (child.type === "empty") {
          children.push(...child.children);
        } else {
          children.push(child);
        }

        ctx = child;
      }
      return new ParsyContext(ctx, children);
    },
  };
}

export function or(
  ...parsers: ParsyParser<ParsyContext>[]
): ParsyParser<ParsyContext> {
  return {
    parse(ctx) {
      let furthest: ParsyContext | null = null;

      for (const parser of parsers) {
        const child = parser.parse(ctx);

        if (!(child instanceof ParsyError)) {
          return child;
        }

        if (!furthest || furthest.end < child.end) {
          furthest = child;
        }
      }

      return furthest!;
    },
  };
}

export function skip(
  parser: ParsyParser<ParsyContext>,
): ParsyParser<ParsyContext> {
  return transform({ parser, transformer: (ctx) => new ParsyContext(ctx) });
}

export function optional<T extends ParsyContext>(
  parser: ParsyParser<T>,
): ParsyParser<T | ParsyContext> {
  return or(parser, {
    parse: (ctx) => new ParsyContext(ctx),
  });
}

export function plus(
  parser: ParsyParser<ParsyContext>,
): ParsyParser<ParsyContext> {
  return {
    parse(ctx) {
      const children: ParsyContext[] = [];
      let child: ParsyContext = ctx;

      while (true) {
        child = parser.parse(child);

        if (child instanceof ParsyError) {
          if (children.length === 0) {
            return child;
          } else {
            break;
          }
        }

        if (child.type === "empty") {
          children.push(...child.children);
        } else {
          children.push(child);
        }
      }

      return new ParsyContext(ctx, children);
    },
  };
}

export function star(
  parser: ParsyParser<ParsyContext>,
): ParsyParser<ParsyContext> {
  return optional(plus(parser));
}

export function transform(
  props: {
    parser: ParsyParser<ParsyContext>;
    transformer: ParsyTransformer<ParsyContext, ParsyContext>;
  },
): ParsyParser<ParsyContext> {
  return {
    parse(ctx) {
      const child = props.parser.parse(ctx);
      return child instanceof ParsyError ? child : props.transformer(child);
    },
  };
}

export function label(
  type: string,
) {
  return (parser: ParsyParser<ParsyContext>): ParsyParser<ParsyContext> => ({
    parse(ctx) {
      const child = parser.parse(ctx);

      if (child instanceof ParsyError) {
        child.expected = type + "." + child.expected;
      } else {
        child.type = type;
      }

      return child;
    },
  });
}

export function dynamic() {
  return {
    set(parser: ParsyParser<ParsyContext>) {
      this.parse = parser.parse;
    },
    parse() {
      throw new Error("dynamic parser not set");
    },
  };
}

export function parsy(parser: ParsyParser<ParsyContext>) {
  return {
    parse(source: string): ParsyContext {
      const child = parser.parse({
        source,
        type: "start",
        start: 0,
        end: 0,
        children: [],
      });
      if (child.end !== source.length) {
        return new ParsyError(child, "EOL");
      } else {
        return child;
      }
    },
  };
}
