import { ParsyChildren, ParsyContext, ParsyError, ParsyParser } from '../parsy.ts';
import * as parsy from "../parsy.ts";

const whitespace = parsy.skip(
  parsy.optional(parsy.regex(/(\r|\n|\\r|\\n| )+/g)),
);
const identifier = parsy.named(
  "identifier",
  parsy.regex(/[a-zA-Z][a-zA-Z0-9]*/g),
);
const literal = parsy.named("literal", parsy.regex(/"(?:[^"\\]|\\.)*"/g));
const characters = parsy.named(
  "characters",
  parsy.regex(/\[(?:[^\]\\]|\\.)*]/g),
);
const modifier = parsy.named("modifier", parsy.regex(/[+*?]/g));
const predicate = parsy.named("predicate", parsy.regex(/{(?:[^}\\]|\\.)*}/g)); // TODO: Nested curly braces
const sequence = parsy.named(
  "sequence",
  (ctx) => {
    return parsy.more(
      parsy.sequence(
        whitespace,
        expression
      )
    )(ctx);
  },
);
const alternation = parsy.named(
  "alternation",
  (ctx) => {
    return parsy.sequence(
      expression,
      parsy.string("|"),
      expression,
    )(ctx);
  },
);

const label: ParsyParser<ParsyContext> = parsy.named("label", (ctx) => {
    return parsy.sequence(identifier, parsy.string(":"), expression)(ctx);
});
const expression: ParsyParser<ParsyContext> = parsy.named(
  "expression",
  (ctx) => {
    return parsy.sequence(
      parsy.any(
        literal,
        label,
        identifier,
        characters,
        alternation,
        sequence,
        parsy.sequence(
          parsy.string("("),
          whitespace,
          expression,
          whitespace,
          parsy.string(")"),
        ),
      ),
      parsy.optional(parsy.sequence(whitespace, modifier)),
      parsy.optional(parsy.sequence(whitespace, predicate))
    )(ctx);
  },
);
const declaration = parsy.named(
  "declaration",
  parsy.sequence(
    identifier,
    whitespace,
    parsy.string("="),
    whitespace,
    expression,
  ),
);
const start = parsy.sequence(parsy.many(parsy.sequence(whitespace, declaration)), whitespace);

const source = await Deno.readTextFile("./text.parsy");
const parser = parsy.start(start);
print(parser(source));
console.log(JSON.stringify(parser(source), null, 2));

function print(ctx: ParsyContext, padding = 0): void {
  const indent = Array(padding).join(" ");

  if (ctx.type === "error") {
    console.error("Error:", (ctx as ParsyError).expected);
    console.error(indent, "at", ctx.end, ': "', ctx.source.substr(ctx.start, 8), '"');
    return;
  }
  if ((ctx as ParsyChildren<any>).children) {
    console.log(`${indent}${ctx.type} {`);
    for (const child of (ctx as ParsyChildren<any>).children) {
      print(child, padding + 2);
    }
    console.log(`${indent}}`);
  } else {
    console.log(`${indent}${ctx.type}${(ctx as any).text ? `: \x1b[34m${(ctx as any).text.substring(0, 24)}\x1b[0m` : ""}`);
  }
}

export default parsy.start(parsy.many(declaration));
