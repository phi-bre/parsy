import {ParsyContext, ParsyParser} from '.';

export class Parsy {
    constructor(public parser: ParsyParser) {
    }

    public parse(input: string) {
        const context = new ParsyContext(input);
        const result = this.parser.parse(context);
        if (result) {
            return result.token.children;
        }
    }
}
