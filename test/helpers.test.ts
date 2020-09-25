import {Parsy, ParsyToken} from '../src';
import * as helper from '../src/helpers';

describe('#or', function () {
    const a = helper.terminal('a');
    const b = helper.terminal('b');

    it('should accept ab', function () {
        const parsy = new Parsy(helper.repeated(helper.or(a, b)));
        expect(parsy.parse('ab')).toBeTruthy();
    });

    it('should accept bb', function () {
        const parsy = new Parsy(helper.repeated(helper.or(a, b)));
        expect(parsy.parse('bb')).toBeTruthy();
    });

    it('should reject cb', function () {
        const parsy = new Parsy(helper.repeated(helper.or(a, b)));
        expect(parsy.parse('cb')).toBeFalsy();
    });
});

describe('#and', function () {
    const a = helper.terminal('a');
    const b = helper.terminal('b');

    it('should accept a', function () {
        const parsy = new Parsy(helper.and(a, b));
        expect(parsy.parse('ab')).toBeTruthy();
    });
});

describe('#alternation', function () {
    const a = helper.terminal('a');
    const b = helper.terminal('b');

    it('should accept a', function () {
        const parsy = new Parsy(helper.alternation(a, b));
        expect(parsy.parse('a')).toBeTruthy();
    });

    it('should accept b', function () {
        const parsy = new Parsy(helper.alternation(a, b));
        expect(parsy.parse('b')).toBeTruthy();
    });

    it('should reject c', function () {
        const parsy = new Parsy(helper.alternation(a, b));
        expect(parsy.parse('c')).toBeFalsy();
    });
});

describe('#sequence', function () {
    const a = helper.terminal('a');
    const b = helper.terminal('b');
    const parsy = new Parsy(helper.sequence(a, b));

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
    const parsy = new Parsy(helper.terminal(pattern));

    it('should accept a', function () {
        expect(parsy.parse('a')).toBeTruthy();
    });

    it('should not accept b', function () {
        expect(parsy.parse('b')).toBeFalsy();
    });
});

describe('#rule', function () {
    const a = helper.rule('a').set(helper.terminal('a'));
    const parsy = new Parsy(a);

    it('should build a AST', function () {
        const token = new ParsyToken(0, expect.any(ParsyToken), 'a');
        token.to = 1;
        token.value = 'a';
        expect(parsy.parse('a')).toEqual([token]);
    });
});

describe('#repeated', function () {
    const a = helper.terminal('a');
    const parsy = new Parsy(helper.repeated(a));

    it('should accept a', function () {
        expect(parsy.parse('a')).toBeTruthy();
    });

    it('should not accept aa', function () {
        expect(parsy.parse('aa')).toBeTruthy();
    });
});


describe('#optional', function () {
    const a = helper.terminal('a');
    const parsy = new Parsy(helper.optional(a));

    it('should accept a', function () {
        expect(parsy.parse('a')).toBeTruthy();
    });

    it('should not accept empty string', function () {
        expect(parsy.parse('')).toBeTruthy();
    });
});

describe('#not', function () {
    const a = helper.terminal('a');
    const parsy = new Parsy(helper.not(a));

    it('should accept b', function () {
        expect(parsy.parse('b')).toBeTruthy();
    });

    it('should not accept a', function () {
        expect(parsy.parse('a')).toBeFalsy();
    });
});

describe('#charset', function () {
    const range = helper.charset('a', 'c');

    it('should equal a b c', function () {
        expect(range).toEqual(['a', 'b', 'c']);
    });
});
