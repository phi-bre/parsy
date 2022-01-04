type ParsyWithout<T, U> = T extends U ? never : T;
type ParsyRestToUnion<T> = T extends ParsyParser<infer R>
  ? R extends ParsyContext ? R : never
  : never;

export interface ParsyParser<T extends ParsyContext> {
  (ctx: ParsyContext): T;
}

export interface ParsyText<T extends string = string> extends ParsyContext {
  type: "text";
  text: T;
}

export interface ParsyError extends ParsyContext {
  type: "error";
  expected: string;
}

export interface ParsyEmpty extends ParsyContext {
  type: "empty";
}

export interface ParsyArray<T extends ParsyContext> extends ParsyContext {
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
  (context: T extends ParsyError ? never : T): R;
}

export function string<T extends string>(
  value: T,
): ParsyParser<ParsyText<T> | ParsyError> {
  return function (ctx) {
    if (ctx.source.startsWith(value, ctx.end)) {
      return {
        source: ctx.source,
        start: ctx.end,
        end: ctx.end + value.length,
        text: value,
        type: "text",
      };
    } else {
      return {
        source: ctx.source,
        start: ctx.start,
        end: ctx.end,
        expected: value,
        type: "error",
      };
    }
  };
}

export function regex(
  regex: RegExp,
  expected: string,
): ParsyParser<ParsyText | ParsyError> {
  return function (ctx) {
    regex.lastIndex = ctx.end;
    const match = regex.exec(ctx.source);
    if (match?.index === ctx.end) {
      return {
        source: ctx.source,
        start: ctx.end,
        end: ctx.end + match[0].length,
        text: match[0],
        type: "text",
      };
    } else {
      return {
        source: ctx.source,
        start: ctx.start,
        end: ctx.end,
        expected: expected,
        type: "error",
      };
    }
  };
}

export function sequence<T extends ParsyParser<ParsyContext>[]>(
  ...parsers: T
): ParsyParser<ParsyArray<ParsyRestToUnion<T[number]>>> {
  return function (ctx: ParsyContext) {
    const children: ParsyRestToUnion<T[number]>[] = [];
    for (const parser of parsers) {
      const child: ParsyContext = parser(ctx);
      if (child.type === "error") return child as any; // TODO
      children.push(child as any); // TODO
      ctx = child;
    }
    return {
      source: ctx.source,
      start: children[0]?.start ?? ctx.start,
      end: children[children.length - 1]?.end ?? ctx.end,
      children: children,
      type: "array",
    };
  };
}

export function any<T extends ParsyParser<ParsyContext>[]>(
  ...parsers: T
): ParsyParser<ParsyRestToUnion<T[number]>> {
  return function (ctx) {
    let furthest: ParsyError | null = null;
    for (const parser of parsers) {
      const token = parser(ctx);
      if (token.type !== "error") return token as any; // TODO
      if (!furthest || furthest.end < token.end) {
        furthest = token as ParsyError;
      }
    }
    return furthest!;
  };
}

export function skip<T, S>(parser: ParsyParser<T, S>): ParsyParser<ParsyError | null> {
    return transform(parser, (ctx): ParsyEmpty => ({
        source: ctx.source,
        start: ctx.end,
        end: ctx.end,
        type: "empty",
    }));
}

export function optional<T extends ParsyContext>(
  parser: ParsyParser<T>,
): ParsyParser<T | ParsyEmpty> {
  return any(
    parser,
    (ctx): ParsyEmpty => ({
      source: ctx.source,
      start: ctx.end,
      end: ctx.end,
      type: "empty",
    }),
  );
}

export function many<T extends ParsyContext>(
  parser: ParsyParser<T>,
): ParsyParser<ParsyArray<T>> {
  return function (ctx) {
    let children: T[] = [];
    let child: ParsyContext = ctx;
    while (true) {
      child = parser(child);
      if (child.type === "error") break;
      children.push(child as T);
    }
    return {
      source: ctx.source,
      start: children[0]?.start ?? ctx.start,
      end: children[children.length - 1]?.end ?? ctx.end,
      children: children,
      type: "array",
    };
  };
}

export function transform<T extends ParsyContext, R extends ParsyContext>(
  parser: ParsyParser<T>,
  transformer: ParsyTransformer<T, R>,
): ParsyParser<R> {
  return function (ctx) {
    const child: ParsyContext | ParsyError = parser(ctx);
    if (child.type === "error") return child as any; // TODO
    return transformer(child as ParsyWithout<T, ParsyError>);
  };
}

export function start<T extends ParsyContext>(parser: ParsyParser<T>) {
  return function (source: string): T {
    return parser({ source, start: 0, end: 0, type: "empty" });
  };
}
