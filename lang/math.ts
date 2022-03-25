import type { ParsyContext } from "../parsy.ts";
import { and, optional, or, regex, rule, star, text } from "../parsy.ts";

const _ = rule({
  type: "_",
  parser: regex(/\s*/),
});

const number = rule({
  type: "number",
  parser: regex(/[0-9]+/),
});

const identifier = rule({
  type: "identifier",
  parser: regex(/[a-zA-Z]+/),
});

const call = rule({
  type: "call",
  parser: and(
    identifier,
    _,
    text("("),
    star(
      and(
        (ctx) => additive(ctx),
        _,
        optional(text(",")),
      ),
    ),
    text(")"),
  ),
});

const primary = rule({
  type: "primary",
  parser: or(
    number,
    call,
    identifier,
    and(text("("), _, (ctx) => additive(ctx), _, text(")")),
  ),
});

const factor = or(
  rule({
    type: "factor",
    parser: and(primary, _, text("^"), _, (ctx) => factor(ctx)),
  }),
  primary,
);

const multiplicative = or(
  rule({
    type: "multiplicative",
    parser: and(factor, _, regex(/[*/]/), _, (ctx) => multiplicative(ctx)),
  }),
  factor,
);

const additive = or(
  rule({
    type: "additive",
    parser: and(multiplicative, _, regex(/[+-]/), _, (ctx) => additive(ctx)),
  }),
  multiplicative,
);

export default (ctx: ParsyContext) => additive(ctx);
