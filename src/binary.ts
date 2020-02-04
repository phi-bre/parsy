import {ParsyContext, ParsyParser} from '.';

export abstract class BinaryParser extends ParsyParser {
    public left!: ParsyParser;
    public right!: ParsyParser;

    public set(left: ParsyParser, right: ParsyParser): this {
        this.left = left;
        this.right = right;
        return this;
    }
}

export class AndParser extends BinaryParser {
    public parse(context: ParsyContext): ParsyContext | undefined {
        return this.left.parse(context) && this.right.parse(context);
    }
}

export class OrParser extends BinaryParser {
    public parse(context: ParsyContext): ParsyContext | undefined {
        return this.left.parse(context) || this.right.parse(context);
    }
}
