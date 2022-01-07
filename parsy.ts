type ParsyRestToUnion<T> = T extends ParsyParser<infer R>
  ? R extends ParsyContext ? R : never
  : never;

export interface ParsyParser<T extends ParsyContext> {
  (ctx: ParsyContext): T;
}

export interface ParsyText<T extends string> extends ParsyContext {
  type: "text";
  text: T;
}

export interface ParsyRegex extends ParsyContext {
  type: "regex";
  regex: RegExp;
  text: string;
}

export interface ParsyEmpty extends ParsyContext {
  type: "empty";
}

export interface ParsyError extends ParsyContext {
  type: "error";
  expected: string;
}

export interface ParsyChildren<T extends ParsyContext> extends ParsyContext {
  type: "array";
  children: T[];
}

export interface ParsyContext {
  type: string;
  source: string;
  start: number;
  end: number;
}

export interface ParsyTransformer<T, R> {
  (context: T): R;
}

export function empty<T extends ParsyContext>(
  ctx: ParsyContext,
): ParsyEmpty {
  return {
    type: "empty",
    source: ctx.source,
    start: ctx.end,
    end: ctx.end,
  };
}

export function array<T extends ParsyContext>(
  ctx: ParsyContext,
  children: T[],
): ParsyChildren<T> {
  return {
    ...empty(ctx),
    type: "array",
    start: children[0]?.start ?? ctx.end,
    end: children[children.length - 1]?.end ?? ctx.end,
    children: children,
  };
}

export function text<T extends string>(
  ctx: ParsyContext,
  text: T,
): ParsyText<T> {
  return {
    ...empty(ctx),
    type: "text",
    source: ctx.source,
    start: ctx.end,
    end: ctx.end + text.length,
    text: text,
  };
}

export function error(ctx: ParsyContext, expected: string): ParsyError {
  return { ...empty(ctx), type: "error", expected: expected };
}

export function string<T extends string>(
  value: T,
): ParsyParser<ParsyText<T> | ParsyError> {
  return function (ctx) {
    return ctx.source.startsWith(value, ctx.end)
      ? text(ctx, value)
      : error(ctx, value);
  };
}

export function regex(
  regex: RegExp,
): ParsyParser<ParsyText<string> | ParsyError> {
  if (!regex.flags.includes("g")) {
    throw new Error("Regex should include a 'g' flag");
  }
  if (regex.source.startsWith("^")) {
    throw new Error("Regex should not start with '^'");
  }
  return function (ctx) {
    regex.lastIndex = ctx.end;
    const match = regex.exec(ctx.source);
    return match?.index === ctx.end
      ? text(ctx, match[0])
      : error(ctx, regex.toString());
  };
}

export function sequence<T extends ParsyParser<ParsyContext>[]>(
  ...parsers: T
): ParsyParser<ParsyChildren<ParsyRestToUnion<T[number]>>> {
  return function (ctx: ParsyContext) {
    const children: ParsyRestToUnion<T[number]>[] = [];
    for (const parser of parsers) {
      const child: ParsyContext = parser(ctx);
      if (child.type === "error") return child as any; // TODO
      else if (child.type !== "empty") {
        children.push(child as any); // TODO
      }
      ctx = child;
    }
    return array(ctx, children);
  };
}

export function any<T extends ParsyParser<ParsyContext>[]>(
  ...parsers: T
): ParsyParser<ParsyRestToUnion<T[number]>> {
  return function (ctx) {
    let furthest: ParsyContext | null = null;
    for (const parser of parsers) {
      const token = parser(ctx);
      if (token.type !== "error") return token as any; // TODO
      if (!furthest || furthest.end < token.end) {
        furthest = token;
      }
    }
    return furthest!;
  };
}

export function skip<T extends ParsyContext>(
  parser: ParsyParser<T>,
): ParsyParser<ParsyEmpty> {
  return transform(parser, empty);
}

export function optional<T extends ParsyContext>(
  parser: ParsyParser<T>,
): ParsyParser<T | ParsyEmpty> {
  return any(parser, empty);
}

export function more<T extends ParsyContext>(
  parser: ParsyParser<T>,
): ParsyParser<ParsyChildren<T>> {
  return function (ctx) {
    const children: T[] = [];
    let child: ParsyContext = ctx;
    while (true) {
      child = parser(child);
      if (child.type === "error") {
        if (children.length === 0) {
          return child as any; // TODO
        } else {
          break;
        }
      }
      children.push(child as T);
    }
    return array(ctx, children);
  };
}

export function many<T extends ParsyContext>(
  parser: ParsyParser<T>,
): ParsyParser<ParsyChildren<T>> {
  return function (ctx) {
    const children: T[] = [];
    let child: ParsyContext = ctx;
    while (true) {
      child = parser(child);
      if (child.type === "error") break;
      children.push(child as T);
    }
    return array(ctx, children);
  };
}

export function transform<T extends ParsyContext, R extends ParsyContext>(
  parser: ParsyParser<T>,
  transformer: ParsyTransformer<T, R>,
): ParsyParser<R> {
  return function (ctx) {
    const child: ParsyContext = parser(ctx);
    if (child.type === "error") return child as any; // TODO
    return transformer(child as T);
  };
}

export function named<N extends string, T extends ParsyContext>(
  type: N,
  parser: ParsyParser<T>,
): ParsyParser<T extends ParsyError ? ParsyError : T & { type: N }> {
  return function (ctx) {
    const child = parser(ctx);
    if (child.type === "error") {
      (child as unknown as ParsyError).expected = type;
    } else {
      child.type = type;
    }
    return child as T extends ParsyError ? ParsyError : T & { type: N };
  };
}

export function start<T extends ParsyContext>(parser: ParsyParser<T>) {
  return function (source: string): T {
    return parser({ source, type: "start", start: 0, end: 0 });
  };
}
