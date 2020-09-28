import { ParsyContext, ParsyParser } from '.';

export class TerminalParser extends ParsyParser {
    public pattern!: Set<string>;

    public set(...pattern: string[]): this {
        this.pattern = new Set<string>(pattern);
        return this;
    }

    public parse(context: ParsyContext): ParsyContext | undefined {
        if (this.pattern.has(context.input[context.index])) {
            return context.advance(1);
        }
    }
}
