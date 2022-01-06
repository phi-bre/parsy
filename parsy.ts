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

export interface ParsyEmpty extends ParsyContext {
  type: "empty";
}

export interface ParsyArray<T extends ParsyContext>
  extends ParsyContext, Array<T> {
  type: "array";
}

export interface ParsyContext {
  status: number;
  type: string;
  source: string;
  start: number;
  end: number;
}

export interface ParsyTransformer<T, R> {
  (context: T): R;
}

export function copy<T extends ParsyContext>(
  ctx: ParsyContext,
  target: T = {} as ParsyEmpty,
): T {
  target.type ??= "empty";
  target.status ??= ctx.status;
  target.source ??= ctx.source;
  target.start ??= ctx.end;
  target.end ??= ctx.end;
  return target;
}

export function array<T extends ParsyContext>(
  ctx: ParsyContext,
  children: T[],
): ParsyArray<T> {
  children.type = "array";
  children.start = children[0]?.start ?? ctx.end;
  children.end = children[children.length - 1]?.end ?? ctx.end;
  return copy(ctx, children);
}

export function text<T extends string>(
  ctx: ParsyContext,
  text: T,
): ParsyText<T> {
  return copy(ctx, {
    type: "text",
    status: 0,
    source: ctx.source,
    start: ctx.end,
    end: ctx.end + text.length,
    text: text,
  });
}

export function error(ctx: ParsyContext, type: string): ParsyEmpty {
  return copy(ctx, { type: type, status: 1 });
}

export function string<T extends string>(
  value: T,
): ParsyParser<ParsyText<T>> {
  return function (ctx) {
    return ctx.source.startsWith(value, ctx.end)
      ? text(ctx, value)
      : error(ctx, value);
  };
}

export function regex(
  regex: RegExp,
  expected: string,
): ParsyParser<ParsyText> {
  return function (ctx) {
    regex.lastIndex = ctx.end;
    const match = regex.exec(ctx.source);
    return match?.index === ctx.end
      ? text(ctx, match[0])
      : error(ctx, expected);
  };
}

export function sequence<T extends ParsyParser<ParsyContext>[]>(
  ...parsers: T
): ParsyParser<ParsyArray<ParsyRestToUnion<T[number]>>> {
  return function (ctx: ParsyContext) {
    const children: ParsyRestToUnion<T[number]>[] = [];
    for (const parser of parsers) {
      const child: ParsyContext = parser(ctx);
      if (child.status !== 0) return child as any; // TODO
      if (child.type !== "empty") children.push(child as any); // TODO
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
      if (token.status === 0) return token as any; // TODO
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
  return transform(parser, copy);
}

export function optional<T extends ParsyContext>(
  parser: ParsyParser<T>,
): ParsyParser<T | ParsyEmpty> {
  return any(parser, copy);
}

export function many<T extends ParsyContext>(
  parser: ParsyParser<T>,
): ParsyParser<ParsyArray<T>> {
  return function (ctx) {
    let children: T[] = [];
    let child: ParsyContext = ctx;
    while (true) {
      child = parser(child);
      if (child.status !== 0) break;
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
    if (child.status !== 0) return child as any; // TODO
    return transformer(child as T);
  };
}

export function start<T extends ParsyContext>(parser: ParsyParser<T>) {
  return function (source: string): T {
    return parser({ source, type: "empty", status: 0, start: 0, end: 0 });
  };
}
