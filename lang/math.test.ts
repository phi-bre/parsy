import * as parsy from "../parsy.ts";
import grammar from "./grammar.ts";

const source = await Deno.readTextFile("./math.parsy");
const parser = parsy.parsy(grammar);
print(parser(source));

function print(ctx: parsy.ParsyContext) {
  function nest(ctx: parsy.ParsyContext, padding: number) {
    const indent = Array(padding).join(" ");
    if (ctx instanceof parsy.ParsyError) {
      console.error("Error:", ctx.expected);
      console.error(
        `${indent} at ${ctx.end}: ${JSON.stringify(ctx.source.substr(ctx.start, 8))}`,
      );
      return;
    }
    if (ctx instanceof parsy.ParsyChildren) {
      console.log(`${indent}${ctx.type} {`);
      for (const child of ctx.children) {
        nest(child, padding + 2);
      }
      console.log(`${indent}}`);
    } else {
      const text = ctx instanceof parsy.ParsyText
        ? `: \x1b[34m${JSON.stringify(ctx.text.substring(0, 24))}\x1b[0m`
        : ""
      console.log(`${indent}${ctx.type}${text}`);
    }
  }

  return nest(ctx, 0);
}
