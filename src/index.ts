import {ParsyContext} from './context';

export class ParsyParser {
    public parse(context: ParsyContext): ParsyContext | undefined {
        return context;
    }

    public set(...params: any): this {
        return this;
    }
}

export * from './rule';
export * from './binary';
export * from './context';
export * from './helpers';
export * from './parsy';
export * from './terminal';
export * from './transform';
export * from './token';
