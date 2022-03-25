import * as parsy from "../parsy.ts";

const whitespace = parsy.rule({
  type: "whitespace",
  parser: parsy.regex(/(\r|\n|\\r|\\n| )*/),
});

const terminator = parsy.rule({
  type: "terminator",
  parser: parsy.string(";"),
});

const identifier = parsy.rule({
  type: "identifier",
  parser: parsy.regex(/[a-zA-Z_][a-zA-Z0-9_]*/),
});

const literal = parsy.rule({
  type: "literal",
  parser: parsy.regex(/"(?:[^"\\]|\\.)*"/),
});

const characters = parsy.rule({
  type: "characters",
  parser: parsy.regex(/\[(?:[^\]\\]|\\.)*]/),
});

const modifier = parsy.rule({
  type: "modifier",
  parser: parsy.regex(/[!+*?]/),
});

const predicate = parsy.rule({
  type: "predicate",
  parser: parsy.regex(/{(?:[^}\\]|\\.)*}/),
});

const expression: any = parsy.rule({
  type: "expression",
  parser: parsy.and(
    (ctx) => predicate_expression(ctx),
    parsy.star(
      parsy.and(
        whitespace,
        parsy.string("|"),
        whitespace,
        (ctx) => predicate_expression(ctx),
      ),
    ),
  ),
});

const predicate_expression = parsy.rule({
  type: "predicate_expression",
  parser: parsy.and(
    (ctx) => sequence_expression(ctx),
    parsy.optional(
      parsy.and(
        whitespace,
        predicate,
      ),
    ),
  ),
});

const sequence_expression = parsy.rule({
  type: "sequence_expression",
  parser: parsy.and(
    (ctx) => labeled_expression(ctx),
    parsy.star(
      parsy.and(
        whitespace,
        (ctx) => labeled_expression(ctx),
      ),
    ),
  ),
});

const labeled_expression = parsy.rule({
  type: "labeled_expression",
  parser: parsy.or(
    parsy.and(
      identifier,
      parsy.string(":"),
      (ctx) => modified_expression(ctx),
    ),
    (ctx) => modified_expression(ctx),
  ),
});

const modified_expression = parsy.rule({
  type: "modified_expression",
  parser: parsy.or(
    parsy.and(
      (ctx) => primary_expression(ctx),
      whitespace,
      modifier,
    ),
    (ctx) => primary_expression(ctx),
  ),
});

const primary_expression = parsy.rule({
  type: "primary_expression",
  parser: parsy.or(
    literal,
    identifier,
    characters,
    (ctx) => braced_expression(ctx),
  ),
});

const braced_expression = parsy.and(
  parsy.string("("),
  whitespace,
  (ctx) => expression(ctx),
  whitespace,
  parsy.string(")"),
);

const rule = parsy.rule({
  type: "rule",
  parser: parsy.and(
    identifier,
    whitespace,
    parsy.string("="),
    whitespace,
    expression,
    whitespace,
    terminator,
  ),
});

export default parsy.rule({
  type: "math",
  parser: parsy.and(
    parsy.star(
      parsy.and(
        whitespace,
        rule,
      ),
    ),
    whitespace,
  ),
});
