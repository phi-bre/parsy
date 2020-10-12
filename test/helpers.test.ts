// import { Parsy, ParsyToken } from '../src';
//
// describe('#or', function () {
//     const a = Parsy.terminal('a');
//     const b = Parsy.terminal('b');
//
//     it('should accept ab', function () {
//         const parsy = new Parsy(Parsy.repeated(Parsy.or(a, b)));
//         expect(parsy.parse('ab')).toBeTruthy();
//     });
//
//     it('should accept bb', function () {
//         const parsy = new Parsy(Parsy.repeated(Parsy.or(a, b)));
//         expect(parsy.parse('bb')).toBeTruthy();
//     });
//
//     it('should reject cb', function () {
//         const parsy = new Parsy(Parsy.repeated(Parsy.or(a, b)));
//         expect(parsy.parse('cb')).toBeFalsy();
//     });
// });
//
// describe('#and', function () {
//     const a = Parsy.terminal('a');
//     const b = Parsy.terminal('b');
//
//     it('should accept a', function () {
//         const parsy = new Parsy(Parsy.and(a, b));
//         expect(parsy.parse('ab')).toBeTruthy();
//     });
// });
//
// describe('#alternation', function () {
//     const a = Parsy.terminal('a');
//     const b = Parsy.terminal('b');
//
//     it('should accept a', function () {
//         const parsy = new Parsy(Parsy.alternation(a, b));
//         expect(parsy.parse('a')).toBeTruthy();
//     });
//
//     it('should accept b', function () {
//         const parsy = new Parsy(Parsy.alternation(a, b));
//         expect(parsy.parse('b')).toBeTruthy();
//     });
//
//     it('should reject c', function () {
//         const parsy = new Parsy(Parsy.alternation(a, b));
//         expect(parsy.parse('c')).toBeFalsy();
//     });
// });
//
// describe('#sequence', function () {
//     const a = Parsy.terminal('a');
//     const b = Parsy.terminal('b');
//     const parsy = new Parsy(Parsy.sequence(a, b));
//
//     it('should accept ab', function () {
//         expect(parsy.parse('ab')).toBeTruthy();
//     });
//
//     it('should not accept a', function () {
//         expect(parsy.parse('a')).toBeFalsy();
//     });
//
//     it('should not accept b', function () {
//         expect(parsy.parse('b')).toBeFalsy();
//     });
// });
//
// describe('#terminal', function () {
//     const pattern = 'a';
//     const parsy = new Parsy(Parsy.terminal(pattern));
//
//     it('should accept a', function () {
//         expect(parsy.parse('a')).toBeTruthy();
//     });
//
//     it('should not accept b', function () {
//         expect(parsy.parse('b')).toBeFalsy();
//     });
// });
//
// describe('#rule', function () {
//     const a = Parsy.rule('a').set(Parsy.terminal('a'));
//     const parsy = new Parsy(a);
//
//     it('should build a AST', function () {
//         const token = new ParsyToken(0, expect.any(ParsyToken), 'a');
//         token.to = 1;
//         token.value = 'a';
//         expect(parsy.parse('a')).toEqual([token]);
//     });
// });
//
// describe('#repeated', function () {
//     const a = Parsy.terminal('a');
//     const parsy = new Parsy(Parsy.repeated(a));
//
//     it('should accept a', function () {
//         expect(parsy.parse('a')).toBeTruthy();
//     });
//
//     it('should not accept aa', function () {
//         expect(parsy.parse('aa')).toBeTruthy();
//     });
// });
//
// describe('#optional', function () {
//     const a = Parsy.terminal('a');
//     const parsy = new Parsy(Parsy.optional(a));
//
//     it('should accept a', function () {
//         expect(parsy.parse('a')).toBeTruthy();
//     });
//
//     it('should not accept empty string', function () {
//         expect(parsy.parse('')).toBeTruthy();
//     });
// });
//
// describe('#not', function () {
//     const a = Parsy.terminal('a');
//     const parsy = new Parsy(Parsy.not(a));
//
//     it('should accept b', function () {
//         expect(parsy.parse('b')).toBeTruthy();
//     });
//
//     it('should not accept a', function () {
//         expect(parsy.parse('a')).toBeFalsy();
//     });
// });
//
// describe('#charset', function () {
//     const range = Parsy.charset('a', 'c');
//
//     it('should equal a b c', function () {
//         expect(range).toEqual(['a', 'b', 'c']);
//     });
// });
