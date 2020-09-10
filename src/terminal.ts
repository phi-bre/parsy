import {ParsyContext, ParsyParser} from '.';

export class TerminalParser extends ParsyParser {
    public pattern: { [literal: string]: true | undefined }

    constructor(...pattern: string[]) {
        super();
        this.pattern = {};
        for (const literal of pattern) {
            this.pattern[literal] = true;
        }
    }

    public parse(context: ParsyContext): ParsyContext | undefined {
        if (this.pattern[context.input[context.index]]) {
            return context.advance(1);
        }
    }
}
