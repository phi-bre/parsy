export class ParsyPosition {
    public row: number;
    public column: number;
    public index: number;

    constructor(context: ParsyContext) {
        this.row = context.row;
        this.column = context.column;
        this.index = context.index;
    }
}

export class ParsyToken {
    constructor(
        public value: string,
        public start: ParsyPosition,
        public end: ParsyPosition,
        public types: string[] = [],
    ) {
    }
}

export class ParsyNode {
    constructor(
        public parent?: ParsyNode,
        public children: Array<ParsyToken | ParsyNode> = [],
        public types: string[] = [],
    ) {
    }

    get start() {
        return this.children[0].start;
    }

    get end() {
        return this.children[this.children.length - 1].end;
    }
}

export abstract class ParsyParser {
    public abstract exec(context: ParsyContext): ParsyContext | null;
}

export class TerminalParser extends ParsyParser {
    public expression: RegExp;

    constructor(expression: RegExp) {
        super();
        this.expression = new RegExp(expression.source, 'y');
    }

    public exec(context: ParsyContext): ParsyContext | null {
        this.expression.lastIndex = context.index;
        const matches = this.expression.exec(context.input);
        if (matches === null) return null;
        const value = matches[0];
        const start = new ParsyPosition(context);
        context.advance(value);
        const end = new ParsyPosition(context);
        const token = new ParsyToken(value, start, end);
        context.node.children.push(token);
        return context;
    }
}

export class AliasParser extends ParsyParser {
    constructor(public parser: ParsyParser, public type: string) {
        super();
    }

    public exec(context: ParsyContext): ParsyContext | null {
        this.parser.exec(context);
        context.node.types.push(this.type);
        return context;
    }
}

export class EmptyParser extends ParsyParser {
    public exec(context: ParsyContext): ParsyContext {
        return context;
    }
}

export abstract class BinaryParser extends ParsyParser {
    protected left!: ParsyParser;
    protected right!: ParsyParser;

    constructor(left?: ParsyParser, right?: ParsyParser) {
        super();
        if (left && right) {
            this.setup(left, right);
        }
    }

    public setup(left: ParsyParser, right: ParsyParser): this {
        this.left = left;
        this.right = right;
        return this;
    }
}

export class AndParser extends BinaryParser {
    public exec(context: ParsyContext): ParsyContext | null {
        return this.left.exec(context) && this.right.exec(context);
    }
}

export class OrParser extends BinaryParser {
    public exec(context: ParsyContext): ParsyContext | null {
        return this.left.exec(context) || this.right.exec(context);
    }
}

export class ParsyContext {
    public stack: Array<ParsyPosition>;
    public node: ParsyNode;
    public input: string;
    public index: number;
    public column: number;
    public row: number;

    constructor(input: string, index: number = 0) {
        this.input = input;
        this.index = index;
        this.column = 0;
        this.row = 0;
        this.node = new ParsyNode();
        this.stack = [];
    }

    public advance(input: string) {
        this.index += input.length;
        this.row = (input.match(/\n/g) || '').length + 1;
        this.column = input.length - input.lastIndexOf('\n');
        this.stack.push(new ParsyPosition(this));
    }

    public restore(position: ParsyPosition = this.stack.pop()!) {
        this.index = position.index;

    }
}

export class Parsy {
    constructor(public parser: ParsyParser) {
    }

    exec(input: string) {
        const context = new ParsyContext(input);
        return this.parser.exec(context);
    }
}
