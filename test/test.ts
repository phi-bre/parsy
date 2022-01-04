import { assertEquals } from "https://deno.land/std@0.119.0/testing/asserts.ts";
import type { ParsyContext } from "../parsy.ts";
import * as parsy from "../parsy.ts";

// function named<N extends string, T extends ParsyContext>(name: N, parser: ParsyParser<T>): ParsyParser<Omit<T, 'type'> & { type: N }> {
//     // return function (ctx) {
//     //     const child: T = parser(ctx);
//     //     if (child.type === 'error') {
//     //         return { ...child, expected: name } as ParsyError;
//     //     } else {
//     //         return { ...child, type: name };
//     //     }
//     // };
//     return transform(parser, (ctx) => ({ ...ctx, type: name }));
// }
//
//
// type OptionsObject<K extends PropertyKey> = {
//     [P in K]: (grammar: OptionsObject<K>) => ParsyParser<any>;
// }
//
// function grammar<K extends PropertyKey>(rules: OptionsObject<K>): Record<K, ParsyParser<any>> {
//     const result: Record<K, ParsyParser<any>> = {};
//
//     for (const key in rules) {
//         result[key] = ctx => rules[key](result)(ctx);
//     }
//
//     return result;
// }
//
// const p = grammar({
//     id: rules => named('identifier', regex(/[a-zA-Z][a-zA-Z0-9]*/g, 'identifier')),
//     expr: rules => any(func, num),
//     asd: rules => sequence(rules.id, rules.expr),
// });

interface ParsyNumber extends ParsyContext {
  type: "number";
  number: number;
}

const num = parsy.transform(
  parsy.regex(/[+\-]?[0-9]+(\.[0-9]*)?/g, "number"),
  (ctx): ParsyNumber => {
    return { ...ctx, number: Number(ctx.text), type: "number" };
  },
);

const id = parsy.regex(/[a-zA-Z][a-zA-Z0-9]*/g, "identifier");
const func: any = (ctx: ParsyContext) => {
  return parsy.sequence(
    id,
    parsy.string("("),
    parsy.many(parsy.sequence(expr, parsy.optional(parsy.string(",")))),
    parsy.string(")"),
  )(ctx);
};
const expr: any = parsy.any(func, num);

const parser = parsy.start(expr);
const result = parser("a(1,asd(1,2,3),3)");
console.log(JSON.stringify(result, null, 2));

Deno.test("Can parse", () => {
  assertEquals(result, {
    "source": "a(1,asd(1,2,3),3)",
    "start": 0,
    "end": 17,
    "children": [
      {
        "source": "a(1,asd(1,2,3),3)",
        "start": 0,
        "end": 1,
        "text": "a",
        "type": "text",
      },
      {
        "source": "a(1,asd(1,2,3),3)",
        "start": 1,
        "end": 2,
        "text": "(",
        "type": "text",
      },
      {
        "source": "a(1,asd(1,2,3),3)",
        "start": 2,
        "end": 16,
        "children": [
          {
            "source": "a(1,asd(1,2,3),3)",
            "start": 2,
            "end": 4,
            "children": [
              {
                "source": "a(1,asd(1,2,3),3)",
                "start": 2,
                "end": 3,
                "text": "1",
                "type": "number",
                "number": 1,
              },
              {
                "source": "a(1,asd(1,2,3),3)",
                "start": 3,
                "end": 4,
                "text": ",",
                "type": "text",
              },
            ],
            "type": "array",
          },
          {
            "source": "a(1,asd(1,2,3),3)",
            "start": 4,
            "end": 15,
            "children": [
              {
                "source": "a(1,asd(1,2,3),3)",
                "start": 4,
                "end": 14,
                "children": [
                  {
                    "source": "a(1,asd(1,2,3),3)",
                    "start": 4,
                    "end": 7,
                    "text": "asd",
                    "type": "text",
                  },
                  {
                    "source": "a(1,asd(1,2,3),3)",
                    "start": 7,
                    "end": 8,
                    "text": "(",
                    "type": "text",
                  },
                  {
                    "source": "a(1,asd(1,2,3),3)",
                    "start": 8,
                    "end": 13,
                    "children": [
                      {
                        "source": "a(1,asd(1,2,3),3)",
                        "start": 8,
                        "end": 10,
                        "children": [
                          {
                            "source": "a(1,asd(1,2,3),3)",
                            "start": 8,
                            "end": 9,
                            "text": "1",
                            "type": "number",
                            "number": 1,
                          },
                          {
                            "source": "a(1,asd(1,2,3),3)",
                            "start": 9,
                            "end": 10,
                            "text": ",",
                            "type": "text",
                          },
                        ],
                        "type": "array",
                      },
                      {
                        "source": "a(1,asd(1,2,3),3)",
                        "start": 10,
                        "end": 12,
                        "children": [
                          {
                            "source": "a(1,asd(1,2,3),3)",
                            "start": 10,
                            "end": 11,
                            "text": "2",
                            "type": "number",
                            "number": 2,
                          },
                          {
                            "source": "a(1,asd(1,2,3),3)",
                            "start": 11,
                            "end": 12,
                            "text": ",",
                            "type": "text",
                          },
                        ],
                        "type": "array",
                      },
                      {
                        "source": "a(1,asd(1,2,3),3)",
                        "start": 12,
                        "end": 13,
                        "children": [
                          {
                            "source": "a(1,asd(1,2,3),3)",
                            "start": 12,
                            "end": 13,
                            "text": "3",
                            "type": "number",
                            "number": 3,
                          },
                          {
                            "source": "a(1,asd(1,2,3),3)",
                            "start": 13,
                            "end": 13,
                            "type": "empty",
                          },
                        ],
                        "type": "array",
                      },
                    ],
                    "type": "array",
                  },
                  {
                    "source": "a(1,asd(1,2,3),3)",
                    "start": 13,
                    "end": 14,
                    "text": ")",
                    "type": "text",
                  },
                ],
                "type": "func",
              },
              {
                "source": "a(1,asd(1,2,3),3)",
                "start": 14,
                "end": 15,
                "text": ",",
                "type": "text",
              },
            ],
            "type": "array",
          },
          {
            "source": "a(1,asd(1,2,3),3)",
            "start": 15,
            "end": 16,
            "children": [
              {
                "source": "a(1,asd(1,2,3),3)",
                "start": 15,
                "end": 16,
                "text": "3",
                "type": "number",
                "number": 3,
              },
              {
                "source": "a(1,asd(1,2,3),3)",
                "start": 16,
                "end": 16,
                "type": "empty",
              },
            ],
            "type": "array",
          },
        ],
        "type": "array",
      },
      {
        "source": "a(1,asd(1,2,3),3)",
        "start": 16,
        "end": 17,
        "text": ")",
        "type": "text",
      },
    ],
    "type": "func",
  });
});
