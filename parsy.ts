type ParsyRestToUnion<T> = T extends ParsyParser<infer R>
  ? R extends ParsyContext ? R : never
  : never;

export interface ParsyParser<T extends ParsyContext> {
  (ctx: ParsyContext): T;
}

export interface ParsyTransformer<T, R> {
  (context: T): R;
}

export interface ParsyContext {
  type: string;
  source: string;
  start: number;
  end: number;
}

export class ParsyEmpty implements ParsyContext {
  public type: string;
  public source: string;
  public start: number;
  public end: number;

  constructor(ctx: ParsyContext) {
    this.type = "empty";
    this.source = ctx.source;
    this.start = ctx.end;
    this.end = ctx.end;
  }
}

export class ParsyError extends ParsyEmpty {
  constructor(ctx: ParsyContext, public expected: string) {
    super(ctx);
    this.type = "error";
  }
}

export class ParsyText extends ParsyEmpty {
  constructor(ctx: ParsyContext, public text: string) {
    super(ctx);
    this.type = "text";
    this.start = ctx.end;
    this.end = ctx.end + text.length;
  }
}

export class ParsyChildren<T extends ParsyContext> extends ParsyEmpty {
  constructor(ctx: ParsyContext, public children: T[]) {
    super(ctx);
    this.type = "children";
    this.start = children[0]?.start ?? ctx.end;
    this.end = children[children.length - 1]?.end ?? ctx.end;
  }
}

export function dot(length = 1): ParsyParser<ParsyText> {
  return function (ctx) {
    return new ParsyText(ctx, ctx.source.substr(ctx.end, length));
  };
}

export function text(value: string): ParsyParser<ParsyText | ParsyError> {
  return function (ctx) {
    return ctx.source.startsWith(value, ctx.end)
      ? new ParsyText(ctx, value)
      : new ParsyError(ctx, value);
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
  return function (ctx) {
    regex.lastIndex = ctx.end;
    const match = regex.exec(ctx.source);
    return match?.index === ctx.end // && match[0].length > 0
      ? new ParsyText(ctx, match[0])
      : new ParsyError(ctx, regex.toString());
  };
}

export function and<T extends ParsyParser<ParsyContext>[]>(
  ...parsers: T
): ParsyParser<ParsyChildren<ParsyRestToUnion<T[number]>>> {
  return function (ctx: ParsyContext) {
    const children: ParsyRestToUnion<T[number]>[] = [];
    for (const parser of parsers) {
      const child: ParsyContext = parser(ctx);
      if (child instanceof ParsyError) {
        return child as any; // TODO
      } else if (child.type !== "empty") {
        if (child.type === "children") {
          children.push(...(child as ParsyChildren<any>).children);
        } else {
          children.push(child as any); // TODO
        }
      }
      ctx = child;
    }
    return new ParsyChildren(ctx, children);
  };
}

export function or(
  ...parsers: ParsyParser<ParsyContext>[]
): ParsyParser<ParsyContext> {
  return function (ctx) {
    let furthest: ParsyContext | null = null;

    for (const parser of parsers) {
      const child = parser(ctx);

      if (!(child instanceof ParsyError)) {
        return child;
      }

      if (!furthest || furthest.end < child.end) {
        furthest = child;
      }
    }

    return furthest!;
  };
}

export function skip(
  parser: ParsyParser<ParsyContext>,
): ParsyParser<ParsyEmpty> {
  return transform({ parser, transformer: (ctx) => new ParsyEmpty(ctx) });
}

export function optional<T extends ParsyContext>(
  parser: ParsyParser<T>,
): ParsyParser<T | ParsyEmpty> {
  return or(parser, (ctx) => new ParsyEmpty(ctx));
}

export function plus<T extends ParsyContext>(
  parser: ParsyParser<T>,
): ParsyParser<ParsyChildren<T>> {
  return function (ctx) {
    const children: T[] = [];
    let child: ParsyContext = ctx;

    while (true) {
      child = parser(child);

      if (child instanceof ParsyError) {
        if (children.length === 0) {
          return child as any;
        } else {
          break;
        }
      } else if (child.type === "children") {
        children.push(...(child as ParsyChildren<T>).children);
      } else {
        children.push(child as T);
      }
    }

    return new ParsyChildren(ctx, children);
  };
}

export function star<T extends ParsyContext>(
  parser: ParsyParser<T>,
): ParsyParser<ParsyChildren<T> | ParsyEmpty> {
  return optional(plus(parser));
}

export function transform<T extends ParsyContext, R extends ParsyContext>(
  props: { parser: ParsyParser<T>; transformer: ParsyTransformer<T, R> },
): ParsyParser<R | ParsyError> {
  return function (ctx) {
    const child: ParsyContext = props.parser(ctx);
    return child instanceof ParsyError ? child : props.transformer(child as T);
  };
}

export function rule<N extends string, T extends ParsyContext>(
  props: { type: N; parser: ParsyParser<T> },
): ParsyParser<T extends ParsyError ? ParsyError : T & { type: N }> {
  return function (ctx) {
    const child = props.parser(ctx);

    if (child instanceof ParsyError) {
      child.expected = props.type + "." + child.expected;
    } else {
      child.type = props.type;
    }

    return child as T extends ParsyError ? ParsyError : T & { type: N };
  };
}

export function parsy<T extends ParsyContext>(parser: ParsyParser<T>) {
  return function (source: string): T | ParsyError {
    const child = parser({ source, type: "start", start: 0, end: 0 });
    if (child.end !== source.length) {
      return new ParsyError(child, "EOL");
    } else {
      return child;
    }
  };
}
