import {lexer} from './index';

const tokenizer = lexer({
    '.whitespace': /[ \n\r]+/,
    string: /"(.*?)'/,
    regex: /\/(.*?)\//,
    literal: /[A-z0-9]+/,
    open: /\(/,
    close: /\)/,
    pipe: /\|/,
    colon: /:/,
    semicolon: /;/,
    conditional: /\?/,
    multiple: /\*/,
    many: /\+/,
});

export default function grammar(syntax: string) {
    const store = {};
    const regex = regex => next => regex.test(next.rest);
    const terminal = string => next => next() === string;
    const reference = ref => next => store[ref](next);
    const group = (...rules) => next => rules.every(rule => rule(next));
    const alternation = (...rules) => next => !!rules.find(rule => rule(next));
    const condition = matcher => next => {
        const {index} = next;
        if (!matcher(next))
            next.index = index;
        return true;
    };

    function content(tokens) {
        let matchers: any = [], alternate = false;
        for (const token of tokens) {
            switch (token.type) {
                case 'open':
                    matchers.push(content(tokens));
                    break;
                case 'close':
                case 'semicolon':
                    const matcher = group(...matchers);
                    return alternate ? alternation(matcher) : matcher;
                case 'pipe':
                    alternate = true;
                    break;
                case 'string':
                    matchers.push(terminal(token.value));
                    break;
                case 'regex':
                    matchers.push(regex(token.value));
                    break;
                case 'literal':
                    matchers.push(reference(token.value));
            }
        }
    }

    function rule(tokens) {
        const literal = tokens.next().value;
        tokens.next();
        return store[literal] = content(tokens);
    }

    const rules: any = [];
    const tokens = tokenizer(syntax);
    for (const token of tokens) {
        rules.push(rule(tokens));
    }
    return rules[0];
}
