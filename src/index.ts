import { ParsyContext } from './context';
import { ParsyToken } from './token';

export class ParsyParser {
    public parse(context: ParsyContext): ParsyContext | undefined {
        return context;
    }

    public set(...params: any): this {
        return this;
    }
}

export type ParsyTransform = (token: ParsyToken) => any;

export * from './rule';
export * from './binary';
export * from './context';
export * from './parsy';
export * from './terminal';
export * from './transform';
export * from './token';
