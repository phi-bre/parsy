export * from './core';
export * from './terminals';
export * from './parsy';

export type ParsyParser<I = any, O = any> = (
    input: I
) => Generator<O, boolean, undefined>;
export type ParsyTransformer<I, T> = (token: I) => T;

export interface ParsyContext {
    input: string;
    index: number;
}

export interface ParsyToken<T = any> extends ParsyContext {
    type: string;
    value: string;
    length: number;
    tokens: T[];
}
