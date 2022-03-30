import * as parsy from "../parsy.ts";

const _ = parsy.label("_")(parsy.regex(/\s*/));
const number = parsy.label("number")(parsy.regex(/[0-9]+/));
const identifier = parsy.label("identifier")(parsy.regex(/[a-zA-Z]+/));

const call = parsy.dynamic();
const primary = parsy.dynamic();
const factor = parsy.dynamic();
const multiplicative = parsy.dynamic();
const additive = parsy.dynamic();

call.set(
  parsy.label("call")(
    parsy.and(
      identifier,
      _,
      parsy.text("("),
      parsy.star(
        parsy.and(
          additive,
          _,
          parsy.optional(parsy.text(",")),
        ),
      ),
      parsy.text(")"),
    ),
  ),
);

primary.set(
  parsy.label("primary")(
    parsy.or(
      number,
      call,
      identifier,
      parsy.and(parsy.text("("), _, additive, _, parsy.text(")")),
    ),
  ),
);

factor.set(
  parsy.or(
    parsy.label("factor")(parsy.and(primary, _, parsy.text("^"), _, factor)),
    primary,
  ),
);

multiplicative.set(
  parsy.or(
    parsy.label("multiplicative")(
      parsy.and(factor, _, parsy.regex(/[*/]/), _, multiplicative),
    ),
    factor,
  ),
);

additive.set(
  parsy.or(
    parsy.label("additive")(
      parsy.and(multiplicative, _, parsy.regex(/[+-]/), _, additive),
    ),
    multiplicative,
  ),
);

export default additive;
