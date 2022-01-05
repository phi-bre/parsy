import { ParsyContext, ParsyParser } from '../parsy.ts';
import * as parsy from '../parsy.ts';

const strip = parsy.skip(parsy.optional(parsy.regex(/(\\r|\\n| )+/, 'whitespace')));
const identifier = parsy.regex(/[a-zA-Z][a-zA-Z0-9]*/g, 'identifier');
const literal = parsy.regex(/"(?:[^"\\]|\\.)*"/g, 'literal');
const characters = parsy.regex(/\[(?:[^\]\\]|\\.)*]/g, 'characters');
const modifier = parsy.regex(/[+*?]/g, 'modifier');
const predicate = parsy.regex(/{(?:[^}\\]|\\.)*}/g, 'predicate'); // TODO: Nested curly braces

const label: ParsyParser<ParsyContext> = (ctx) => {
    return parsy.sequence(identifier, parsy.string(':'), expression)(ctx);
};
const expression: ParsyParser<ParsyContext> = (ctx) => {
    return parsy.sequence(
        parsy.any(
            parsy.sequence(parsy.string('('), strip, expression, strip, parsy.string(')')),
            literal,
            label,
            identifier,
            characters
        ),
        parsy.optional(parsy.sequence(strip, modifier)),
        parsy.optional(parsy.sequence(strip, predicate))
    )(ctx);
};
const declaration = parsy.sequence(identifier, strip, parsy.string('='), strip, expression);
const start = parsy.sequence(strip, parsy.many(declaration), strip);

console.log(JSON.stringify(parsy.start(declaration)(await Deno.readTextFile('./text.parsy')), null, 2));

export default parsy.start(parsy.many(declaration));

// start
//   = additive
//
// additive
//   = left:multiplicative "+" right:additive { left + right }
//   | multiplicative
//
// multiplicative
//   = left:primary "*" right:multiplicative { left * right }
//   | primary
//
// primary
//   = integer
//   | "(" additive:additive ")" { additive }
//
// integer "integer"
//   = digits:[0-9]+ { Number(digits.join("")) }
