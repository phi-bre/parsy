import {alternation, optional, ParsyToken, repeated, rule, sequence, terminal} from '../src';
import {Parsy} from '../src/parser';

describe('#alternation', function () {
    const a = terminal('a');
    const b = terminal('b');

    it('should accept a', function () {
        const parsy = new Parsy(alternation(a, b));
        expect(parsy.parse('a')).toBeTruthy();
    });

    it('should accept b', function () {
        const parsy = new Parsy(alternation(a, b));
        expect(parsy.parse('b')).toBeTruthy();
    });

    it('should reject c', function () {
        const parsy = new Parsy(alternation(a, b));
        expect(parsy.parse('c')).toBeFalsy();
    });
});

describe('#sequence', function () {
    const a = terminal('a');
    const b = terminal('b');
    const parsy = new Parsy(sequence(a, b));

    it('should accept ab', function () {
        expect(parsy.parse('ab')).toBeTruthy();
    });

    it('should not accept a', function () {
        expect(parsy.parse('a')).toBeFalsy();
    });

    it('should not accept b', function () {
        expect(parsy.parse('b')).toBeFalsy();
    });
});

describe('#terminal', function () {
    const pattern = 'a';
    const parsy = new Parsy(terminal(pattern));

    it('should accept a', function () {
        expect(parsy.parse('a')).toBeTruthy();
    });

    it('should not accept b', function () {
        expect(parsy.parse('b')).toBeFalsy();
    });
});

describe('#rule', function () {
    const a = rule('a').set(terminal('a'));
    const parsy = new Parsy(a);

    it('should build a AST', function () {
        const token = new ParsyToken(0, expect.any(ParsyToken), 'a');
        token.to = 1;
        token.value = 'a';
        expect(parsy.parse('a')).toEqual([token]);
    });
});

describe('#repeated', function () {
    const a = terminal('a');
    const parsy = new Parsy(repeated(a));

    it('should accept a', function () {
        expect(parsy.parse('a')).toBeTruthy();
    });

    it('should not accept aa', function () {
        expect(parsy.parse('aa')).toBeTruthy();
    });
});


describe('#optional', function () {
    const a = terminal('a');
    const parsy = new Parsy(optional(a));

    it('should accept a', function () {
        expect(parsy.parse('a')).toBeTruthy();
    });

    it('should not accept empty string', function () {
        expect(parsy.parse('')).toBeTruthy();
    });
});
