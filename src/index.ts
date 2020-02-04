import {ParsyContext} from './context';

export class ParsyParser {
    public parse(context: ParsyContext): ParsyContext | undefined {
        return context;
    }
}

export * from './rule';
export * from './binary';
export * from './context';
export * from './helpers';
export * from './terminal';
export * from './token';
