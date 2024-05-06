//import { assertFalse, assertTrue, deepStrictEqual } from "effect-test/util"


import {
  any,
  anyOf,
  buildPattern,
  buildRegex,
  capture,
  charClass,
  charRange,
  choiceOf,
  digit,
  endOfString,
  lookahead,
  lookbehind,
  negated,
  negativeLookahead,
  negativeLookbehind,
  nonDigit,
  nonWhitespace,
  nonWordBoundary,
  nonWord,
  oneOrMore,
  ref,
  regex,
  repeat,
  optional,
  startOfString,
  whitespace,
  word,
  wordBoundary,
  zeroOrMore
} from '../src/RegexBuilder.js'

import { RegexSequence } from "./../src/internal/regexBuilder/index.js"
import { Match, Option } from "effect"
import { describe, test, expect, assert } from "vitest"
    
interface CustomMatchers<R = unknown> {
  toBeRegex: () => R
  toEqualRegex: ( expected: String | RegExp) => R
  toMatchGroups: (inputText: string, expectedGroups: string[]) => R
  toMatchAllGroups: (expectedString: string, expectedGroups: string[][]) => R
  toMatchAllNamedGroups: (expectedString: string, expectedGroups: Array<Record<string, string>>,) => R
  toMatchNamedGroups: (inputText: string, expectedGroups: object) => R
  toMatchString: (received: string, expected?: string) => R
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

export function wrapRegExp(regex: RegExp | RegexSequence) {
  if (regex instanceof RegExp) {
    return regex;
  }

  return buildRegex(regex);
}

expect.extend({

  toBeRegex(received) {

    const isNot: boolean = this.isNot
    return {
      // do not alter your "pass" based on isNot. Vitest does it for you
      pass: received instanceof RegExp,
      message: () => `${received} is${isNot ? ' not' : ''} RegExp`
    }
  }
})
  
expect.extend({

  toEqualRegex(received, expected) {

    received = wrapRegExp(received);

    const { isNot } = this
    
    const expectedSource = typeof expected === 'string' ? expected : expected.source;
    const expectedFlags = typeof expected === 'string' ? undefined : expected.flags;
    
    return {
      // do not alter your "pass" based on isNot. Vitest does it for you
      pass: expectedSource === received.source && (expectedFlags === undefined || expectedFlags === received.flags),
      message: () => `${received} is${isNot ? ' not' : ''} ${expected}`
    }

  }
})

expect.extend({

  toMatchGroups(
    received: RegExp | RegexSequence,
    inputText: string,
    expectedGroups: string[],
    ) {
      const receivedRegex = wrapRegExp(received);
      const matchResult = inputText.match(receivedRegex);
      const receivedGroups = matchResult ? [...matchResult] : null;
      const options: Object = { isNot: this.isNot };

    return {
      pass: this.equals(receivedGroups, expectedGroups),
      message: () =>
        this.utils.matcherHint('toMatchGroups', undefined, undefined, options) +
        '\n\n' +
        `Expected: ${this.isNot ? 'not ' : ''}${this.utils.printExpected(expectedGroups)}\n` +
        `Received: ${this.utils.printReceived(receivedGroups)}`,
      }
    }
})

expect.extend({
  toMatchNamedGroups(
    received: RegExp | RegexSequence,
    inputText: string,
    expectedGroups: Record<string, string>,
  ) {
    const receivedRegex = wrapRegExp(received);
    const matchResult = inputText.match(receivedRegex);
    const receivedGroups = matchResult ? matchResult.groups : null;
    const options = {
      isNot: this.isNot,
    };

    return {
      pass: this.equals(receivedGroups, expectedGroups),
      message: () =>
        this.utils.matcherHint('toMatchGroups', undefined, undefined, options) +
        '\n\n' +
        `Expected: ${this.isNot ? 'not ' : ''}${this.utils.printExpected(expectedGroups)}\n` +
        `Received: ${this.utils.printReceived(receivedGroups)}`,
    };
  }
})

expect.extend({
  toMatchString(
    received: RegExp | RegexSequence,
    expected: string,
  ) {
    const receivedRegex = wrapRegExp(received);
    const matchResult = expected.match(receivedRegex);
    const options: Object = {
      isNot: this.isNot,
    };

    return {
      pass: matchResult !== null,
      message: () =>
        this.utils.matcherHint('toMatchString', undefined, undefined, options) +
        '\n\n' +
        `Expected: ${this.isNot ? 'not ' : ''} matching ${this.utils.printExpected(expected)}\n` +
        `Received pattern: ${this.utils.printReceived(receivedRegex.source)}`,
    };
  }
})

expect.extend({
  toMatchAllGroups(
  received: RegExp | RegexSequence,
  expectedString: string,
  expectedGroups: string[],
) {
  const receivedRegex = wrapRegExp(received);
  const receivedGroups = toNestedArray(expectedString.matchAll(receivedRegex));
  const options: Object = {
    isNot: this.isNot,
  };

  return {
    pass: this.equals(receivedGroups, expectedGroups),
    message: () =>
      this.utils.matcherHint('toMatchGroups', undefined, undefined, options) +
      '\n\n' +
      `Expected: ${this.isNot ? 'not ' : ''}${this.utils.printExpected(expectedGroups)}\n` +
      `Received: ${this.utils.printReceived(receivedGroups)}`,
    };
  }
})

expect.extend({
  
  toMatchAllNamedGroups(
    received: RegExp | RegexSequence,
    inputText: string,
    expectedGroups: Array<Record<string, string>>
  ) {
    const receivedRegex = wrapRegExp(received);
    const matchResult = inputText.matchAll(receivedRegex);
    const receivedGroups = matchResult ? [...matchResult].map((r) => r.groups) : null;
    const options: Object = {
      isNot: this.isNot,
    };

    return {
      pass: this.equals(receivedGroups, expectedGroups),
      message: () =>
        this.utils.matcherHint('toMatchGroups', undefined, undefined, options) +
        '\n\n' +
        `Expected: ${this.isNot ? 'not ' : ''}${this.utils.printExpected(expectedGroups)}\n` +
        `Received: ${this.utils.printReceived(receivedGroups)}`,
    };
  }
})

function toNestedArray(iterator: IterableIterator<RegExpMatchArray>) {
  const result: string[][] = [];

  for (const match of iterator) {
    result.push([...match]);
  }

  return result;
}

const lowercase = charRange('a', 'z')
const lowercase_regex = new RegExp(/[a-z]/)
const uppercase = charRange('A', 'Z')
const uppercase_regex = new RegExp(/[A-Z]/)
const digit_regex = new RegExp(/\d/)
const alphabetic = charClass(lowercase, uppercase)
const alphabetic_regex = new RegExp(/[a-zA-Z]/)
const alphanumeric = charClass(alphabetic, digit)
const alphanumeric_regex = new RegExp(/[a-zA-Z0-9]/)
const hyphen = anyOf('-');
const alphabetical = charClass(lowercase, uppercase);
const specialChars = anyOf('._%+-');
const portSeperator = ':';
const schemeSeperator = ':';
const doubleSlash = '//';
const at = '@';
const pathSeparator = '/';
const querySeparator = '?';
const fragmentSeparator = '#';
const usernameChars = charClass(lowercase, digit, specialChars);
const hostnameChars = charClass(charRange('a', 'z'), digit, anyOf('-'));
const domainChars = charRange('a', 'z');

describe('Basic Regular Expression Constructors', () => {

  test("Is a regular expression.", {}, () => {
    expect(buildRegex(lowercase)).toBeRegex()
    expect(buildRegex(uppercase)).toBeRegex()
    expect(buildRegex(digit)).toBeRegex()
    expect(buildRegex(alphabetic)).toBeRegex()
    expect(buildRegex(alphanumeric)).toBeRegex()
    expect(buildRegex('a')).toBeRegex()
  })

  test("Equals the correct regular expression.", {}, () => {
    expect(buildRegex(lowercase)).toEqualRegex(lowercase_regex)
    expect(buildRegex(uppercase)).toEqualRegex(uppercase_regex)
    expect(buildRegex(digit)).toEqualRegex(digit_regex)
    expect(buildRegex(alphabetic_regex)).toEqualRegex(alphabetic_regex)
    expect(buildRegex(alphanumeric_regex)).toEqualRegex(alphanumeric_regex)
    expect(buildRegex('a')).toEqualRegex(new RegExp(/a/))
  })

  test("single char with flags", {}, () => {
    expect(buildRegex('a', { global: true }).flags).toBe('g');
    expect(buildRegex('a', { global: false }).flags).toBe('');
  })

  test("single char", {}, () => {
      expect(buildRegex('a', { ignoreCase: true }).flags).toBe('i');
      expect(buildRegex('a', { ignoreCase: false }).flags).toBe('');
    })
    
  test("single char", {}, () => {

      expect(buildRegex('a', { multiline: true }).flags).toBe('m');
      expect(buildRegex('a', { multiline: false }).flags).toBe('');
    })

  test("single char", {}, () => {
      expect(buildRegex('a', { hasIndices: true }).flags).toBe('d');
      expect(buildRegex('a', { hasIndices: false }).flags).toBe('');

      expect(
        buildRegex('a', {
          global: true, //
          ignoreCase: true,
          multiline: false,
        }).flags,
      ).toBe('gi');
    })
  })

describe("Anchor Tests", () => {
  test('`startOfString` pattern', () => {
    expect(startOfString).toEqualRegex(/^/);
    expect([startOfString, 'a', 'b']).toEqualRegex(/^ab/);
  });

  test('`startOfString` matching', () => {
    expect([startOfString, oneOrMore('a')]).toMatchGroups('a aa aaa', ['a']);
  });

  test('`endOfString` pattern', () => {
    expect(endOfString).toEqualRegex(/$/);
    expect(['a', 'b', endOfString]).toEqualRegex(/ab$/);
  });

  test('`endOfString` matching', () => {
    expect([oneOrMore('a'), endOfString]).toMatchGroups('a aa aaa', ['aaa']);
  });

  test('`wordBoundary` pattern', () => {
    expect(wordBoundary).toEqualRegex(/\b/);
    expect([wordBoundary, 'a', 'b']).toEqualRegex(/\bab/);
  });

  test('`wordBoundary` matching', () => {
    expect(
      buildRegex([wordBoundary, 'a', zeroOrMore(nonWhitespace)], { global: true }),
    ).toMatchGroups('a ba ab aa', ['a', 'ab', 'aa']);

    expect(
      buildRegex([zeroOrMore(nonWhitespace), 'a', wordBoundary], { global: true }),
    ).toMatchGroups('a ba ab aa', ['a', 'ba', 'aa']);
  });

  test('`nonWordBoundary` pattern', () => {
    expect(nonWordBoundary).toEqualRegex(/\B/);
    expect([nonWordBoundary, 'a', 'b']).toEqualRegex(/\Bab/);
    expect(['a', nonWordBoundary, 'b']).toEqualRegex(/a\Bb/);
    expect(['a', 'b', nonWordBoundary]).toEqualRegex(/ab\B/);
  });

  test('`nonWordBoundary` matching', () => {
    expect(buildRegex([nonWordBoundary, 'abc', digit], { global: true })).toMatchGroups(
      'abc1 xabc2 xxabc3',
      ['abc2', 'abc3'],
    );

    expect(buildRegex([digit, 'abc', nonWordBoundary], { global: true })).toMatchGroups(
      '1abc 2abcx 3abcxx',
      ['2abc', '3abc'],
    );

  })
})


describe("Capture Tests", () => {


test('`capture` pattern', () => {
  expect(capture('a')).toEqualRegex(/(a)/);
  expect(capture('abc')).toEqualRegex(/(abc)/);
  expect(capture(oneOrMore('abc'))).toEqualRegex(/((?:abc)+)/);
  expect(oneOrMore(capture('abc'))).toEqualRegex(/(abc)+/);
});

test('`capture` matching', () => {
  expect(capture('b')).toMatchGroups('ab', ['b', 'b']);
  expect(['a', capture('b')]).toMatchGroups('ab', ['ab', 'b']);
  expect(['a', capture('b'), capture('c')]).toMatchGroups('abc', ['abc', 'b', 'c']);
});

test('named `capture` pattern', () => {
  expect(capture('a', { name: 'xyz' })).toEqualRegex('(?<xyz>a)');
  expect(capture('abc', { name: 'xyz' })).toEqualRegex('(?<xyz>abc)');
  expect(capture(oneOrMore('abc'), { name: 'xyz' })).toEqualRegex('(?<xyz>(?:abc)+)');
  expect(oneOrMore(capture('abc', { name: 'xyz' }))).toEqualRegex('(?<xyz>abc)+');
});

test('named `capture` matching', () => {
  expect(capture('b', { name: 'x1' })).toMatchGroups('ab', ['b', 'b']);
  expect(capture('b', { name: 'x1' })).toMatchNamedGroups('ab', { x1: 'b' });

  expect(['a', capture('b', { name: 'x1' })]).toMatchGroups('ab', ['ab', 'b']);
  expect(['a', capture('b', { name: 'x1' })]).toMatchNamedGroups('ab', { x1: 'b' });

  expect([capture('a'), capture('b', { name: 'x1' }), capture('c', { name: 'x2' })]).toMatchGroups(
    'abc',
    ['abc', 'a', 'b', 'c'],
  );
  expect([
    capture('a'),
    capture('b', { name: 'x1' }),
    capture('c', { name: 'x2' }),
  ]).toMatchNamedGroups('abc', { x1: 'b', x2: 'c' });
});

test('`reference` pattern', () => {
  expect([ref('ref0')]).toEqualRegex(/\k<ref0>/);
  expect([ref('xyz')]).toEqualRegex(/\k<xyz>/);
  expect([capture(any, { name: 'ref0' }), ' ', ref('ref0')]).toEqualRegex('(?<ref0>.) \\k<ref0>');

  expect(['xx', capture(any, { name: 'r123' }), ' ', ref('r123'), 'xx']).toEqualRegex(
    'xx(?<r123>.) \\k<r123>xx',
  );
});

test('`reference` matching basic case', () => {
  expect([capture(word, { name: 'a' }), ref('a')]).toMatchString('aa');
  expect([capture(digit, { name: 'a' }), ref('a')]).toMatchString('11');

  expect([capture(any, { name: 'a' }), ref('a')]).not.toMatchString('ab');
  expect([capture(digit, { name: 'a' }), ref('a')]).not.toMatchString('1a');
  expect([capture(digit, { name: 'a' }), ref('a')]).not.toMatchString('a1');
});

test('`reference` matching variable case', () => {
  const someRef = ref('test');
  expect([capture(word, { name: someRef.name }), someRef]).toMatchString('aa');
  expect([capture(digit, { name: someRef.name }), someRef]).toMatchString('11');

  expect([capture(any, { name: someRef.name }), someRef]).not.toMatchString('ab');
  expect([capture(digit, { name: someRef.name }), someRef]).not.toMatchString('1a');
  expect([capture(digit, { name: someRef.name }), someRef]).not.toMatchString('a1');
});

test('`reference` matching HTML attributes', () => {
  const quoteChars = anyOf('"\'');
  const htmlAttributeRegex = buildRegex([
    wordBoundary,
    capture(oneOrMore(word), { name: 'name' }),
    '=',
    capture(quoteChars, { name: 'quote' }),
    capture(oneOrMore(negated(quoteChars)), { name: 'value' }),
    ref('quote'),
  ]);

  expect(htmlAttributeRegex).toMatchNamedGroups('a="b"', {
    name: 'a',
    quote: '"',
    value: 'b',
  });
  expect(htmlAttributeRegex).toMatchNamedGroups('aa="bbb"', {
    name: 'aa',
    quote: '"',
    value: 'bbb',
  });
  expect(htmlAttributeRegex).toMatchNamedGroups(`aa='bbb'`, {
    name: 'aa',
    quote: `'`,
    value: 'bbb',
  });
  expect(htmlAttributeRegex).toMatchNamedGroups('<input type="number" />', {
    quote: '"',
    name: 'type',
    value: 'number',
  });
  expect(htmlAttributeRegex).toMatchNamedGroups(`<input type='number' />`, {
    quote: "'",
    name: 'type',
    value: 'number',
  });

  expect(htmlAttributeRegex).not.toMatchString(`aa="bbb'`);
  expect(htmlAttributeRegex).not.toMatchString(`aa='bbb"`);
  expect(htmlAttributeRegex).not.toMatchString(`<input type='number" />`);
  expect(htmlAttributeRegex).not.toMatchString(`<input type="number' />`);
});

})


describe("Character Class Tests", () => {

  test('`any` character class', () => {
    expect(any).toEqualRegex(/./);
    expect(['x', any]).toEqualRegex(/x./);
    expect(['x', any, 'x']).toEqualRegex(/x.x/);
  });

  test('`digit` character class', () => {
    expect(digit).toEqualRegex(/\d/);
    expect(['x', digit]).toEqualRegex(/x\d/);
    expect(['x', digit, 'x']).toEqualRegex(/x\dx/);
    expect(digit).toMatchString('1');
    expect(digit).not.toMatchString('A');
  });

  test('`nonDigit` character class', () => {
    expect(nonDigit).toEqualRegex(/\D/);
    expect(['x', nonDigit]).toEqualRegex(/x\D/);
    expect(['x', nonDigit, 'x']).toEqualRegex(/x\Dx/);
    expect(nonDigit).not.toMatchString('1');
    expect(nonDigit).toMatchString('A');
  });

  test('`word` character class', () => {
    expect(word).toEqualRegex(/\w/);
    expect(['x', word]).toEqualRegex(/x\w/);
    expect(['x', word, 'x']).toEqualRegex(/x\wx/);
    expect(word).toMatchString('A');
    expect(word).toMatchString('1');
    expect(word).not.toMatchString('$');
  });

  test('`nonWord` character class', () => {
    expect(nonWord).toEqualRegex(/\W/);
    expect(['x', nonWord]).toEqualRegex(/x\W/);
    expect(['x', nonWord, 'x']).toEqualRegex(/x\Wx/);
    expect(nonWord).not.toMatchString('A');
    expect(nonWord).not.toMatchString('1');
    expect(nonWord).toMatchString('$');
  });

test('`whitespace` character class', () => {
  expect(whitespace).toEqualRegex(/\s/);
  expect(['x', whitespace]).toEqualRegex(/x\s/);
  expect(['x', whitespace, 'x']).toEqualRegex(/x\sx/);
  expect(whitespace).toMatchString(' ');
  expect(whitespace).toMatchString('\t');
  expect(whitespace).not.toMatchString('A');
  expect(whitespace).not.toMatchString('1');
});

test('`nonWhitespace` character class', () => {
  expect(nonWhitespace).toEqualRegex(/\S/);
  expect(['x', nonWhitespace]).toEqualRegex(/x\S/);
  expect(['x', nonWhitespace, 'x']).toEqualRegex(/x\Sx/);
  expect(nonWhitespace).not.toMatchString(' ');
  expect(nonWhitespace).not.toMatchString('\t');
  expect(nonWhitespace).toMatchString('A');
  expect(nonWhitespace).toMatchString('1');
});

test('`charClass` base cases', () => {
  expect(charClass(charRange('a', 'z'))).toEqualRegex(/[a-z]/);
  expect(charClass(charRange('a', 'z'), charRange('A', 'Z'))).toEqualRegex(/[a-zA-Z]/);
  expect(charClass(charRange('a', 'z'), anyOf('05'))).toEqualRegex(/[a-z05]/);
  expect(charClass(charRange('a', 'z'), whitespace, anyOf('05'))).toEqualRegex(/[a-z\s05]/);
});

test('`charClass` throws on negated arguments', () => {
  expect(() => charClass(negated(whitespace))).toThrowErrorMatchingInlineSnapshot(
    "[Error: `charClass` should receive only non-negated character classes]",
  );
});

test('`charClass` joins character escapes', () => {
  expect(charClass(word)).toEqualRegex(/\w/);
  expect(charClass(digit)).toEqualRegex(/\d/);
  expect(charClass(whitespace)).toEqualRegex(/\s/);
  expect(charClass(nonWord)).toEqualRegex(/\W/);
  expect(charClass(nonDigit)).toEqualRegex(/\D/);
  expect(charClass(nonWhitespace)).toEqualRegex(/\S/);

  expect(charClass(whitespace, nonWhitespace)).toEqualRegex(/[\s\S]/);

  expect(charClass(word, whitespace)).toEqualRegex(/[\w\s]/);
  expect(charClass(word, digit, whitespace)).toEqualRegex(/[\w\d\s]/);
  expect(charClass(word, nonDigit)).toEqualRegex(/[\w\D]/);
});

test('`charRange` pattern', () => {
  expect(charRange('a', 'z')).toEqualRegex(/[a-z]/);
  expect(['x', charRange('0', '9')]).toEqualRegex(/x[0-9]/);
  expect([charRange('A', 'F'), 'x']).toEqualRegex(/[A-F]x/);
});

test('`charRange` throws on incorrect arguments', () => {
  expect(() => charRange('z', 'a')).toThrowErrorMatchingInlineSnapshot(
    "[Error: `start` should be before or equal to `end`]",
  );
  expect(() => charRange('aa', 'z')).toThrowErrorMatchingInlineSnapshot(
    "[Error: `charRange` should receive only single character `start` string]",
  );
  expect(() => charRange('a', 'zz')).toThrowErrorMatchingInlineSnapshot(
    "[Error: `charRange` should receive only single character `end` string]",
  );
});

test('`anyOf` pattern', () => {
  expect(anyOf('a')).toEqualRegex(/[a]/);
  expect(['x', anyOf('a'), 'x']).toEqualRegex(/x[a]x/);
  expect(anyOf('ab')).toEqualRegex(/[ab]/);
  expect(['x', anyOf('ab')]).toEqualRegex(/x[ab]/);
  expect(['x', anyOf('ab'), 'x']).toEqualRegex(/x[ab]x/);
});

test('`anyOf` pattern with quantifiers', () => {
  expect(['x', oneOrMore(anyOf('abc')), 'x']).toEqualRegex(/x[abc]+x/);
  expect(['x', optional(anyOf('abc')), 'x']).toEqualRegex(/x[abc]?x/);
  expect(['x', zeroOrMore(anyOf('abc')), 'x']).toEqualRegex(/x[abc]*x/);
});

test('`anyOf` pattern escapes special characters', () => {
  expect(anyOf('abc-+.]\\')).toEqualRegex(/[abc+.\]\\-]/);
});

test('`anyOf` pattern moves hyphen to the last position', () => {
  expect(anyOf('a-bc')).toEqualRegex(/[abc-]/);
});

test('`anyOf` pattern edge cases', () => {
  expect(anyOf('^-')).toEqualRegex(/[\^-]/);
  expect(anyOf('-^')).toEqualRegex(/[\^-]/);
  expect(anyOf('-^a')).toEqualRegex(/[a^-]/);

  expect(anyOf('.')).toEqualRegex(/[.]/);
  expect(anyOf('*')).toEqualRegex(/[*]/);
  expect(anyOf('+')).toEqualRegex(/[+]/);
  expect(anyOf('?')).toEqualRegex(/[?]/);
  expect(anyOf('^')).toEqualRegex(/[^]/);
  expect(anyOf('$')).toEqualRegex(/[$]/);
  expect(anyOf('{')).toEqualRegex(/[{]/);
  expect(anyOf('}')).toEqualRegex(/[}]/);
  expect(anyOf('(')).toEqualRegex(/[(]/);
  expect(anyOf(')')).toEqualRegex(/[)]/);
  expect(anyOf('|')).toEqualRegex(/[|]/);
  expect(anyOf('[')).toEqualRegex(/[[]/);
  expect(anyOf(']')).toEqualRegex(/[\]]/);
  expect(anyOf('\\')).toEqualRegex(/[\\]/);
});

test('`anyOf` throws on empty text', () => {
  expect(() => anyOf('')).toThrowErrorMatchingInlineSnapshot(
    "[Error: `anyOf` should received at least one character]",
  );
});

test('`negated` character class pattern', () => {
  expect(negated(anyOf('a'))).toEqualRegex(/[^a]/);
  expect(negated(anyOf('abc'))).toEqualRegex(/[^abc]/);
});

test('`negated` character class pattern double inversion', () => {
  expect(negated(negated(anyOf('a')))).toEqualRegex(/[a]/);
  expect(negated(negated(anyOf('abc')))).toEqualRegex(/[abc]/);
});

test('`negated` character class matching', () => {
  expect(negated(anyOf('a'))).not.toMatchString('aa');
  expect(negated(anyOf('a'))).toMatchGroups('aba', ['b']);
});

test('`encodeCharacterClass` throws on empty text', () => {
  expect(() =>
    buildRegex(
      // @ts-expect-error
      negated({
        type: 'charClass',
        chars: [],
        ranges: [],
        isNegated: false,
      }),
    ),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Character class should contain at least one character or character range]`,
  );
});

test('showcase: negated character classes', () => {
  expect(nonDigit).toEqualRegex(/\D/);
  expect(nonWord).toEqualRegex(/\W/);
  expect(nonWhitespace).toEqualRegex(/\S/);

  expect(nonDigit).toMatchString('A');
  expect(nonDigit).not.toMatchString('1');
  expect(nonDigit).toMatchString(' ');
  expect(nonDigit).toMatchString('#');

  expect(nonWord).not.toMatchString('A');
  expect(nonWord).not.toMatchString('1');
  expect(nonWord).toMatchString(' ');
  expect(nonWord).toMatchString('#');

  expect(nonWhitespace).toMatchString('A');
  expect(nonWhitespace).toMatchString('1');
  expect(nonWhitespace).not.toMatchString(' ');
  expect(nonWhitespace).toMatchString('#');
});
  
})

describe("Choice-Of Tests", () => {

  test('`choiceOf` pattern', () => {
    expect(choiceOf('a')).toEqualRegex(/a/);
    expect(choiceOf('a', 'b')).toEqualRegex(/a|b/);
    expect(choiceOf('a', 'b', 'c')).toEqualRegex(/a|b|c/);
    expect(choiceOf('aaa', 'bbb')).toEqualRegex(/aaa|bbb/);
  });

  test('`choiceOf` pattern in sequence', () => {
    expect(['x', choiceOf('a'), 'x']).toEqualRegex(/xax/);
    expect([choiceOf('a', 'b'), 'x']).toEqualRegex(/(?:a|b)x/);
    expect(['x', choiceOf('a', 'b')]).toEqualRegex(/x(?:a|b)/);

    expect(choiceOf('a', 'b', 'c')).toEqualRegex(/a|b|c/);
    expect(['x', choiceOf('a', 'b', 'c')]).toEqualRegex(/x(?:a|b|c)/);
    expect([choiceOf('a', 'b', 'c'), 'x']).toEqualRegex(/(?:a|b|c)x/);

    expect(choiceOf('aaa', 'bbb')).toEqualRegex(/aaa|bbb/);
  });

  test('`choiceOf` pattern with sequence options', () => {
    expect([choiceOf(['a', 'b'])]).toEqualRegex(/ab/);
    expect([choiceOf(['a', 'b'], ['c', 'd'])]).toEqualRegex(/ab|cd/);
    expect([choiceOf(['a', zeroOrMore('b')], [oneOrMore('c'), 'd'])]).toEqualRegex(/ab*|c+d/);
  });

  test('`choiceOf` pattern using nested regex', () => {
    expect(choiceOf(oneOrMore('a'), zeroOrMore('b'))).toEqualRegex(/a+|b*/);
    expect(choiceOf(repeat('a', { min: 1, max: 3 }), repeat('bx', 5))).toEqualRegex(
      /a{1,3}|(?:bx){5}/,
    );
  });

  test('`choiceOf` throws on empty options', () => {
    expect(() => choiceOf()).toThrowErrorMatchingInlineSnapshot(
      "[Error: `choiceOf` should receive at least one alternative]",
    );
  });
  
})

describe("Lookahead Tests", () => {

  test('`negativeLookahead` pattern', () => {
    expect(negativeLookahead('a')).toEqualRegex(/(?!a)/);
    expect(negativeLookahead('abc')).toEqualRegex(/(?!abc)/);
    expect(negativeLookahead(oneOrMore('abc'))).toEqualRegex(/(?!(?:abc)+)/);
    expect(oneOrMore(negativeLookahead('abc'))).toEqualRegex(/(?!abc)+/);
  });

  test('`negativeLookahead` matching', () => {
    expect([negativeLookahead('$'), oneOrMore(digit)]).toMatchString('1 turkey costs 30$');
    expect([negativeLookahead('a'), 'b']).toMatchString('abba');
    expect(['a', negativeLookahead(capture('bba'))]).not.toMatchGroups('abba', ['a', 'bba']);
    expect([negativeLookahead('-'), anyOf('+-'), zeroOrMore(digit)]).not.toMatchString('-123');
    expect([negativeLookahead('-'), anyOf('+-'), zeroOrMore(digit)]).toMatchString('+123');
  });

  test('`negativeLookahead` matching with multiple elements', () => {
    expect(negativeLookahead(['abc', 'def'])).toEqualRegex(/(?!abcdef)/);
    expect(negativeLookahead([oneOrMore('abc'), 'def'])).toEqualRegex(/(?!(?:abc)+def)/);
    expect(negativeLookahead(['abc', oneOrMore('def')])).toEqualRegex(/(?!abc(?:def)+)/);
  });

  test('`negativeLookahead` matching with special characters', () => {
    expect(negativeLookahead(['$', '+'])).toEqualRegex(/(?!\$\+)/);
    expect(negativeLookahead(['[', ']'])).toEqualRegex(/(?!\[\])/);
    expect(negativeLookahead(['\\', '\\'])).toEqualRegex(/(?!\\\\)/);
  });

  test('`negativeLookahead` matching with quantifiers', () => {
    expect(negativeLookahead(zeroOrMore('abc'))).toEqualRegex(/(?!(?:abc)*)/);
    expect(negativeLookahead(oneOrMore('abc'))).toEqualRegex(/(?!(?:abc)+)/);
    expect(negativeLookahead(['abc', zeroOrMore('def')])).toEqualRegex(/(?!abc(?:def)*)/);
  });
  
})

describe("Lookbehind Tests", () => {

  test('`negativeLookbehind` pattern', () => {
    expect(negativeLookbehind('a')).toEqualRegex(/(?<!a)/);
    expect(negativeLookbehind('b')).toEqualRegex(/(?<!b)/);
    expect(negativeLookbehind('c')).toEqualRegex(/(?<!c)/);
  });

  test('`negativeLookbehind` matching with multiple characters', () => {
    expect(negativeLookbehind('abc')).toEqualRegex(/(?<!abc)/);
    expect(negativeLookbehind('def')).toEqualRegex(/(?<!def)/);
    expect(negativeLookbehind('xyz')).toEqualRegex(/(?<!xyz)/);
  });

  test('`negativeLookbehind` matching with quantifiers', () => {
    expect(negativeLookbehind(oneOrMore('abc'))).toEqualRegex(/(?<!(?:abc)+)/);
    expect(negativeLookbehind(oneOrMore('def'))).toEqualRegex(/(?<!(?:def)+)/);
    expect(negativeLookbehind(oneOrMore('xyz'))).toEqualRegex(/(?<!(?:xyz)+)/);
  });

  test('`negativeLookbehind` matching with special characters', () => {
    expect(negativeLookbehind('-')).toEqualRegex(/(?<!-)/);
    expect(negativeLookbehind('$')).toEqualRegex(/(?<!\$)/);
    expect(negativeLookbehind('@')).toEqualRegex(/(?<!@)/);
  });
  
})

describe("Quantifiers Tests", () => {

  test('`oneOrMore` quantifier pattern', () => {
    expect(oneOrMore('a')).toEqualRegex(/a+/);
    expect(oneOrMore('ab')).toEqualRegex(/(?:ab)+/);
  });

  test('`optional` quantifier pattern', () => {
    expect(optional('a')).toEqualRegex(/a?/);
    expect(optional('ab')).toEqualRegex(/(?:ab)?/);
  });

  test('`zeroOrMore` quantifier pattern', () => {
    expect(zeroOrMore('a')).toEqualRegex(/a*/);
    expect(zeroOrMore('ab')).toEqualRegex(/(?:ab)*/);
  });

  test('`oneOrMore` matching does not generate capture when grouping', () => {
    expect(oneOrMore('aa')).toMatchGroups('aa', ['aa']);
  });

  test('`optional` matching does not generate capture when grouping', () => {
    expect(optional('aa')).toMatchGroups('aa', ['aa']);
  });

  test('`zeroOrMore` matching does not generate capture when grouping', () => {
    expect(zeroOrMore('aa')).toMatchGroups('aa', ['aa']);
  });

  test('base quantifiers patterns optimize grouping for atoms', () => {
    expect(oneOrMore(digit)).toEqualRegex(/\d+/);
    expect(optional(digit)).toEqualRegex(/\d?/);
    expect(zeroOrMore(digit)).toEqualRegex(/\d*/);

    expect(oneOrMore('a')).toEqualRegex(/a+/);
    expect(optional('a')).toEqualRegex(/a?/);
    expect(zeroOrMore('a')).toEqualRegex(/a*/);
  });

  test('greedy quantifiers patterns', () => {
    expect(oneOrMore('a', { greedy: true })).toEqualRegex(/a+/);
    expect(oneOrMore('ab', { greedy: true })).toEqualRegex(/(?:ab)+/);

    expect(optional('a', { greedy: true })).toEqualRegex(/a?/);
    expect(optional('ab', { greedy: true })).toEqualRegex(/(?:ab)?/);

    expect(zeroOrMore('a', { greedy: true })).toEqualRegex(/a*/);
    expect(zeroOrMore('ab', { greedy: true })).toEqualRegex(/(?:ab)*/);
  });

  test('non-greedy quantifiers patterns', () => {
    expect(oneOrMore('a', { greedy: false })).toEqualRegex(/a+?/);
    expect(oneOrMore('ab', { greedy: false })).toEqualRegex(/(?:ab)+?/);

    expect(optional('a', { greedy: false })).toEqualRegex(/a??/);
    expect(optional('ab', { greedy: false })).toEqualRegex(/(?:ab)??/);

    expect(zeroOrMore('a', { greedy: false })).toEqualRegex(/a*?/);
    expect(zeroOrMore('ab', { greedy: false })).toEqualRegex(/(?:ab)*?/);
  });

  test('greedy quantifiers matching', () => {
    const html = '<div>Hello <em>World!</em></div>';

    const greedyTag = buildRegex(['<', oneOrMore(any), '>'], { global: true });
    expect(greedyTag).toMatchGroups(html, ['<div>Hello <em>World!</em></div>']);
  });

  test('non-greedy quantifiers matching', () => {
    const html = '<div>Hello <em>World!</em></div>';

    const nonGreedyTag = buildRegex(['<', oneOrMore(any, { greedy: false }), '>'], { global: true });
    expect(nonGreedyTag).toMatchGroups(html, ['<div>', '<em>', '</em>', '</div>']);
  });
    
})

describe("Regex Tests", () => { 
  test('`regex` no-op pattern', () => {
    expect(regex('a')).toEqualRegex(/a/);
    expect(regex(['a', 'b'])).toEqualRegex(/ab/);
    expect([regex('a'), regex(['b', 'c'])]).toEqualRegex(/abc/);
  }); 
})

describe("Repeat Tests", () => {
  test('`repeat` quantifier pattern', () => {
    expect(['a', repeat('b', { min: 1, max: 5 })]).toEqualRegex(/ab{1,5}/);
    expect(['a', repeat('b', { min: 1 })]).toEqualRegex(/ab{1,}/);
    expect(['a', repeat('b', 1)]).toEqualRegex(/ab{1}/);

    expect(['a', repeat(['a', zeroOrMore('b')], 1)]).toEqualRegex(/a(?:ab*){1}/);
    expect(repeat(['text', ' ', oneOrMore('d')], 5)).toEqualRegex(/(?:text d+){5}/);
  });

  test('`repeat` pattern optimizes grouping for atoms', () => {
    expect(repeat(digit, 2)).toEqualRegex(/\d{2}/);
    expect(repeat(digit, { min: 2 })).toEqualRegex(/\d{2,}/);
    expect(repeat(digit, { min: 1, max: 5 })).toEqualRegex(/\d{1,5}/);
  });

  test('`repeat` throws on no children', () => {
    expect(() => repeat([], 1)).toThrowErrorMatchingInlineSnapshot(
      `[Error: \`repeat\` should receive at least one element]`,
    );
  });

  test('greedy `repeat` quantifier pattern', () => {
    expect(repeat('a', { min: 1, greedy: true })).toEqualRegex(/a{1,}/);
    expect(repeat('a', { min: 1, max: 5, greedy: true })).toEqualRegex(/a{1,5}/);
  });

  test('non-greedy `repeat` quantifier pattern', () => {
    expect(repeat('a', { min: 1, greedy: false })).toEqualRegex(/a{1,}?/);
    expect(repeat('a', { min: 1, max: 5, greedy: false })).toEqualRegex(/a{1,5}?/);
  });
  
})

describe("Encoder Tests", () => {

  test('basic quantifies', () => {
    expect('a').toEqualRegex(/a/);
    expect(['a', 'b']).toEqualRegex(/ab/);

    expect(oneOrMore('a')).toEqualRegex(/a+/);
    expect(optional('a')).toEqualRegex(/a?/);

    expect(['a', oneOrMore('b')]).toEqualRegex(/ab+/);
    expect(['a', oneOrMore('bc')]).toEqualRegex(/a(?:bc)+/);
    expect(['a', oneOrMore('bc')]).toEqualRegex(/a(?:bc)+/);

    expect(['a', repeat('b', { min: 1, max: 5 })]).toEqualRegex(/ab{1,5}/);

    expect(['a', zeroOrMore('b')]).toEqualRegex(/ab*/);
    expect(['a', zeroOrMore('bc')]).toEqualRegex(/a(?:bc)*/);
    expect(['a', zeroOrMore('bc')]).toEqualRegex(/a(?:bc)*/);

    expect([optional('a'), 'b']).toEqualRegex(/a?b/);

    expect([optional('a'), 'b', oneOrMore('d')]).toEqualRegex(/a?bd+/);
  });

  test('`buildRegex` escapes special characters', () => {
    expect('.').toEqualRegex(/\./);
    expect('*').toEqualRegex(/\*/);
    expect('+').toEqualRegex(/\+/);
    expect('?').toEqualRegex(/\?/);
    expect('^').toEqualRegex(/\^/);
    expect('$').toEqualRegex(/\$/);
    expect('{').toEqualRegex(/\{/);
    expect('}').toEqualRegex(/\}/);
    expect('|').toEqualRegex(/\|/);
    expect('[').toEqualRegex(/\[/);
    expect(']').toEqualRegex(/\]/);
    expect('\\').toEqualRegex(/\\/);

    expect('*.*').toEqualRegex(/\*\.\*/);

    expect([oneOrMore('.*'), zeroOrMore('[]{}')]).toEqualRegex(/(?:\.\*)+(?:\[\]\{\})*/);
  });

  test('`buildRegex` accepts RegExp object', () => {
    expect(buildRegex(/abc/)).toEqual(/abc/);
    expect(buildRegex(oneOrMore(/abc/))).toEqual(/(?:abc)+/);
    expect(buildRegex(repeat(/abc/, 5))).toEqual(/(?:abc){5}/);
    expect(buildRegex(capture(/abc/))).toEqual(/(abc)/);
    expect(buildRegex(choiceOf(/a/, /b/))).toEqual(/a|b/);
    expect(buildRegex(choiceOf(/a|b/, /c/))).toEqual(/a|b|c/);
  });

  test('`buildRegex` detects common atomic patterns', () => {
    expect(buildRegex(/a/)).toEqual(/a/);
    expect(buildRegex(/[a-z]/)).toEqual(/[a-z]/);
    expect(buildRegex(/(abc)/)).toEqual(/(abc)/);
    expect(buildRegex(oneOrMore(/a/))).toEqual(/a+/);
    expect(buildRegex(oneOrMore(/[a-z]/))).toEqual(/[a-z]+/);
    expect(buildRegex(oneOrMore(/(abc)/))).toEqual(/(abc)+/);
    expect(buildRegex(repeat(/a/, 5))).toEqual(/a{5}/);
    expect(buildRegex(oneOrMore(/(a|b|c)/))).toEqual(/(a|b|c)+/);
  });

  test('`buildRegex` throws error on unknown element', () => {
    expect(() =>
      // @ts-expect-error intentionally passing incorrect object
      buildRegex({ type: 'unknown' }),
    ).toThrowErrorMatchingInlineSnapshot("[Error: `encodeNode`: unknown element type unknown]");
  });

  test('`buildPattern` throws on empty text', () => {
    expect(() => buildPattern('')).toThrowErrorMatchingInlineSnapshot(
      "[Error: `encodeText`: received text should not be empty]",
    );
  });
})

describe("Builder tests", () => {
  
  test('`regexBuilder` flags', () => {
    expect(buildRegex('a').flags).toBe('');
    expect(buildRegex('a', {}).flags).toBe('');

    expect(buildRegex('a', { global: true }).flags).toBe('g');
    expect(buildRegex('a', { global: false }).flags).toBe('');

    expect(buildRegex('a', { ignoreCase: true }).flags).toBe('i');
    expect(buildRegex('a', { ignoreCase: false }).flags).toBe('');

    expect(buildRegex('a', { multiline: true }).flags).toBe('m');
    expect(buildRegex('a', { multiline: false }).flags).toBe('');

    expect(buildRegex('a', { hasIndices: true }).flags).toBe('d');
    expect(buildRegex('a', { hasIndices: false }).flags).toBe('');

    expect(buildRegex('a', { dotAll: true }).flags).toBe('s');
    expect(buildRegex('a', { dotAll: false }).flags).toBe('');

    expect(buildRegex('a', { sticky: true }).flags).toBe('y');
    expect(buildRegex('a', { sticky: false }).flags).toBe('');

    expect(
      buildRegex('a', {
        global: true, //
        ignoreCase: true,
        multiline: false,
        dotAll: true,
        sticky: true,
      }).flags,
    ).toBe('gisy');
  });
})

describe("Zipcode Matcher", () => {
  
  const invalidCanadianChars = regex([anyOf("DFIOQU")])
  const validCanadianFirstChar = anyOf("ACEGHJKLMNPRSTVXY")
  const usZipcode_regex = /\d{5}(-\d{4})?/

  const usZipcode = buildRegex([
    repeat(digit, 5),
    optional(
      capture(
        regex([
          "-",
          repeat(digit, 4)
        ])
      ))
  ])
    
  const canZipcode_regex = /(?!.*[DFIOQU])[ACEGHJKLMNPRSTVXY]\d[A-Z]\s\d[A-Z]\d/
  const canZipcode = buildRegex([
    negativeLookahead([
      zeroOrMore(any),
      invalidCanadianChars
    ]),
    validCanadianFirstChar,
    digit,
    uppercase,
    whitespace,
    digit,
    uppercase,
    digit
  ])

  
  const ukZipcode_regex = /[A-Z]{1,2}\dR[A-Z\d]\d(?:ABD-HJLNP-UW-Z){2}/
  const uk_regex = repeat(["ABD-HJLNP-UW-Z"], 2)
  const ukZipcode = buildRegex([
    repeat(uppercase, { min: 1, max: 2 }),
    regex([digit, "R"]),
    charClass(digit, uppercase),
    digit,
    uk_regex
  ])

  test("Zipcodes equals the correct regular expression.", {}, () => {
    expect(usZipcode).toBeRegex()
    expect(canZipcode).toBeRegex()
    expect(ukZipcode).toBeRegex()
    expect(usZipcode).toEqualRegex(usZipcode_regex)
    expect(canZipcode).toEqualRegex(canZipcode_regex)
    expect(ukZipcode).toEqualRegex(ukZipcode_regex)
  })

  test("Zipcodes match correctly", {}, () => {
    const match = Match.type<string>().pipe(
      Match.when((input) => usZipcode.test(input), (_) => "US"),
      Match.when((input) => ukZipcode.test(input), (_) => "UK"),
      Match.when((input) => canZipcode.test(input), (_) => "CAN"),
      Match.option
    )
  
    expect(match("90210")._tag).toEqual("Some")
    assert.deepStrictEqual(match("90210"), Option.some("US"))
    expect(match("M0A 1A1")._tag).toEqual("Some")
    assert.deepStrictEqual(match("M0A 1A1"), Option.some("CAN"))

  })
})

describe("Currency Tests", () => {

  const currencySymbol = '$€£¥R₿';
  const decimalSeparator = '.';
  const firstThousandsClause = repeat(digit, { min: 1, max: 3 });
  const thousandsSeparator = ',';
  const thousands = repeat(digit, 3);
  const thousandsClause = [optional(thousandsSeparator), thousands];
  const cents = repeat(digit, 2);
  const isCurrency = lookbehind(anyOf(currencySymbol));

  test('example: extracting currency values', () => {
    const currencyRegex = buildRegex([
      isCurrency,
      optional(whitespace),
      firstThousandsClause,
      zeroOrMore(thousandsClause),
      optional([decimalSeparator, cents]),
      endOfString,
    ]);

    expect(currencyRegex).toMatchString('$10');
    expect(currencyRegex).toMatchString('$ 10');
    expect(currencyRegex).not.toMatchString('$ 10.');
    expect(currencyRegex).toMatchString('$ 10');
    expect(currencyRegex).not.toMatchString('$10.5');
    expect(currencyRegex).toMatchString('$10.50');
    expect(currencyRegex).not.toMatchString('$10.501');
    expect(currencyRegex).toMatchString('€100');
    expect(currencyRegex).toMatchString('£1,000');
    expect(currencyRegex).toMatchString('$ 100000000000000000');
    expect(currencyRegex).toMatchString('€ 10000');
    expect(currencyRegex).toMatchString('₿ 100,000');
    expect(currencyRegex).not.toMatchString('10$');
    expect(currencyRegex).not.toMatchString('£A000');

    expect(currencyRegex).toEqualRegex(/(?<=[$€£¥R₿])\s?\d{1,3}(?:,?\d{3})*(?:\.\d{2})?$/);
  });
})

describe("Email tests", () => {

  test('example: email validation', () => {
    const usernameChars = charClass(charRange('a', 'z'), digit, anyOf('._%+-'));
    const hostnameChars = charClass(charRange('a', 'z'), digit, anyOf('-.'));
    const domainChars = charRange('a', 'z');

    const regex = buildRegex(
      [
        startOfString,
        oneOrMore(usernameChars),
        '@',
        oneOrMore(hostnameChars),
        '.',
        repeat(domainChars, { min: 2 }),
        endOfString,
      ],
      { ignoreCase: true },
    );

    expect(regex).toMatchString('aaa@gmail.co');
    expect(regex).toMatchString('aaa@gmail.com');
    expect(regex).toMatchString('Aaa@GMail.Com');
    expect(regex).toMatchString('aaa@long.domain.example.com');

    expect(regex).not.toMatchString('@');
    expect(regex).not.toMatchString('aaa@');
    expect(regex).not.toMatchString('a@gmail.c');
    expect(regex).not.toMatchString('@gmail.com');

    expect(regex).toEqualRegex(/^[a-z\d._%+-]+@[a-z\d.-]+\.[a-z]{2,}$/i);
  });
})

describe("Filename Tests", () => {
  const isRejectedFileExtension = negativeLookbehind(choiceOf('js', 'css', 'html'));

  test('example: filename validator', () => {
    const filenameRegex = buildRegex([
      oneOrMore(/[A-Za-z0-9_]/),
      isRejectedFileExtension,
      endOfString,
    ]);

    expect(filenameRegex).toMatchString('index.ts');
    expect(filenameRegex).toMatchString('index.tsx');
    expect(filenameRegex).toMatchString('ind/ex.ts');
    expect(filenameRegex).not.toMatchString('index.js');
    expect(filenameRegex).not.toMatchString('index.html');
    expect(filenameRegex).not.toMatchString('index.css');
    expect(filenameRegex).not.toMatchString('./index.js');
    expect(filenameRegex).not.toMatchString('./index.html');
    expect(filenameRegex).not.toMatchString('./index.css');
  });
})

describe("Find Suffixes Tests", () => {

  test('example: find words with suffix', () => {
    const suffixesToFind = ['acy', 'ism'];

    const regex = buildRegex([
      nonWordBoundary, // match suffixes only
      choiceOf(...suffixesToFind),
      wordBoundary,
    ]);

    expect(regex).toMatchString('democracy');
    expect(regex).toMatchString('Bureaucracy');
    expect(regex).toMatchString('abc privacy ');
    expect(regex).toMatchString('abc dynamism');
    expect(regex).toMatchString('realism abc');
    expect(regex).toMatchString('abc modernism abc');

    expect(regex).not.toMatchString('abc acy');
    expect(regex).not.toMatchString('ism abc');
    expect(regex).not.toMatchString('dynamisms');

    expect(regex).toEqualRegex(/\B(?:acy|ism)\b/);
  });
})
  
describe("Find Words Tests", () => {

  test('example: find specific words', () => {
    const wordsToFind = ['word', 'date'];

    const regex = buildRegex([
      wordBoundary, // match whole words only
      choiceOf(...wordsToFind),
      wordBoundary,
    ]);

    expect(regex).toMatchString('word');
    expect(regex).toMatchString('some date');
    expect(regex).toMatchString('date and word');

    expect(regex).not.toMatchString('sword');
    expect(regex).not.toMatchString('keywords');
    expect(regex).not.toMatchString('words');
    expect(regex).not.toMatchString('update');
    expect(regex).not.toMatchString('dates');

    expect(regex).toEqualRegex(/\b(?:word|date)\b/);
  });
})

describe("Hash Tags Tests", () => {

  test('example: extracting hashtags', () => {
    const regex = buildRegex(
      [
        '#', // prettier break-line
        capture(oneOrMore(word)),
      ],
      { global: true },
    );

    expect(regex).toMatchAllGroups('Hello #world!', [['#world', 'world']]);
    expect(regex).toMatchAllGroups('#Hello #world!', [
      ['#Hello', 'Hello'],
      ['#world', 'world'],
    ]);

    expect(regex).not.toMatchString('aa');
    expect(regex).not.toMatchString('#');
    expect(regex).not.toMatchString('a# ');

    expect(regex).toEqualRegex(/#(\w+)/g);
  });
})

describe("Hex Colours Tests", () => {
  
  test('example: hex color validation', () => {
    const hexDigit = charClass(digit, charRange('a', 'f'));

    const regex = buildRegex(
      [
        startOfString,
        optional('#'),
        choiceOf(
          repeat(hexDigit, 6), // #rrggbb
          repeat(hexDigit, 3), // #rgb
        ),
        endOfString,
      ],
      { ignoreCase: true },
    );

    expect(regex).toMatchString('#ffffff');
    expect(regex).toMatchString('ffffff');
    expect(regex).toMatchString('#eee');
    expect(regex).toMatchString('bbb');
    expect(regex).toMatchString('#000');
    expect(regex).toMatchString('#123456');
    expect(regex).toMatchString('123456');
    expect(regex).toMatchString('#123');
    expect(regex).toMatchString('123');

    expect(regex).not.toMatchString('#1');
    expect(regex).not.toMatchString('#12');
    expect(regex).not.toMatchString('#1234');
    expect(regex).not.toMatchString('#12345');
    expect(regex).not.toMatchString('#1234567');

    expect(regex).toEqualRegex(/^#?(?:[a-f\d]{6}|[a-f\d]{3})$/i);
  });
})

describe("HTML Tags Tests", () => {

  test('example: html tag matching', () => {
    const tagName = oneOrMore(charClass(charRange('a', 'z'), digit));
    const tagContent = zeroOrMore(any, { greedy: false });

    const tagMatcher = buildRegex(
      [
        '<',
        capture(tagName, { name: 'tag' }),
        '>',
        capture(tagContent, { name: 'content' }),
        '</',
        ref('tag'),
        '>',
      ],
      { ignoreCase: true, global: true },
    );

    expect(tagMatcher).toMatchAllNamedGroups('<a>abc</a>', [{ tag: 'a', content: 'abc' }]);
    expect(tagMatcher).toMatchAllNamedGroups('<a><b>abc</b></a>', [
      { tag: 'a', content: '<b>abc</b>' },
    ]);
    expect(tagMatcher).toMatchAllNamedGroups('<a>abc1</a><b>abc2</b>', [
      { tag: 'a', content: 'abc1' },
      { tag: 'b', content: 'abc2' },
    ]);

    expect(tagMatcher).not.toMatchString('<a>abc</b>');

    expect(tagMatcher).toEqualRegex('<(?<tag>[a-z\\d]+)>(?<content>.*?)<\\/\\k<tag>>');
  });

})

describe("IPv4 Tests", () => {

  test('example: IPv4 address validator', () => {
    const octet = choiceOf(
      [digit],
      [charRange('1', '9'), digit],
      ['1', repeat(digit, 2)],
      ['2', charRange('0', '4'), digit],
      ['25', charRange('0', '5')],
    );

    const regex = buildRegex([
      startOfString, // prettier break-line
      repeat([octet, '.'], 3),
      octet,
      endOfString,
    ]);

    expect(regex).toMatchString('0.0.0.0');
    expect(regex).toMatchString('192.168.0.1');
    expect(regex).toMatchString('1.99.100.249');
    expect(regex).toMatchString('255.255.255.255');
    expect(regex).toMatchString('123.45.67.89');

    expect(regex).not.toMatchString('0.0.0.');
    expect(regex).not.toMatchString('0.0.0.0.');
    expect(regex).not.toMatchString('0.-1.0.0');
    expect(regex).not.toMatchString('0.1000.0.0');
    expect(regex).not.toMatchString('0.0.300.0');
    expect(regex).not.toMatchString('255.255.255.256');

    expect(regex).toEqualRegex(
      /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/,
    );
  });
})

describe("JS Numbers Tests", () => {

  test('example: validate JavaScript number', () => {
    const sign = anyOf('+-');
    const exponent = regex([anyOf('eE'), optional(sign), oneOrMore(digit)]);

    const numberValidator = buildRegex([
      startOfString,
      optional(sign),
      choiceOf(
        [oneOrMore(digit), optional(['.', zeroOrMore(digit)])], // leading digit
        ['.', oneOrMore(digit)], // leading dot
      ),
      optional(exponent), // exponent
      endOfString,
    ]);

    expect(numberValidator).toMatchString('0');
    expect(numberValidator).toMatchString('-1');
    expect(numberValidator).toMatchString('+1');
    expect(numberValidator).toMatchString('1.0');
    expect(numberValidator).toMatchString('1.1234');
    expect(numberValidator).toMatchString('1.');
    expect(numberValidator).toMatchString('.1');
    expect(numberValidator).toMatchString('-.1234');
    expect(numberValidator).toMatchString('+.5');
    expect(numberValidator).toMatchString('1e21');
    expect(numberValidator).toMatchString('1e-21');
    expect(numberValidator).toMatchString('+1e+42');
    expect(numberValidator).toMatchString('-1e-42');

    expect(numberValidator).not.toMatchString('');
    expect(numberValidator).not.toMatchString('a');
    expect(numberValidator).not.toMatchString('1a');
    expect(numberValidator).not.toMatchString('1.0.');
    expect(numberValidator).not.toMatchString('.1.1');
    expect(numberValidator).not.toMatchString('.');

    expect(numberValidator).toEqualRegex(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/);
  });
})

describe("Password TagsTests", () => {

  //^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$

  //
  // The password policy is as follows:
  //  - At least one uppercase letter
  //  - At least one lowercase letter
  //  - At least one digit
  //  - At least one special character
  //  - At least 8 characters long

  const atLeastOneUppercase = lookahead([zeroOrMore(any), uppercase]);
  const atLeastOneLowercase = lookahead([zeroOrMore(any), lowercase]);
  const atLeastOneDigit = lookahead([zeroOrMore(any), digit]);
  const atLeastOneSpecialChar = lookahead([zeroOrMore(any), regex([alphanumeric])])
  const atLeastEightChars = /.{8,}/

  test('Example: Validating passwords', () => {
    const validPassword = buildRegex([
      startOfString,
      atLeastOneUppercase,
      atLeastOneLowercase,
      atLeastOneDigit,
      atLeastOneSpecialChar,
      atLeastEightChars,
      endOfString,
    ]);

    console.log("VALID PASSWORD")
    console.log(validPassword)

    expect(validPassword).toMatchString('Aaaaa$aaaaaaa1');
    expect(validPassword).not.toMatchString('aaaaaaaaaaa');
    expect(validPassword).toMatchString('9aaa#aaaaA');
    expect(validPassword).not.toMatchString('Aa');
    expect(validPassword).toMatchString('Aa$123456');
    expect(validPassword).not.toMatchString('Abba');
    expect(validPassword).not.toMatchString('#password');
    expect(validPassword).toMatchString('#passworD666');
    expect(validPassword).not.toMatchString('Aa%1234');

    expect(validPassword).toEqualRegex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[a-zA-Z\d])(?:.{8,})$/,
    );
  });
})

describe("Regex Tests", () => {

  test('example: mixing with RegExp literals (IPv4 address validator)', () => {
    const octet = choiceOf(
      /[0-9]/, // 0-9
      /[1-9][0-9]/, // 10-99
      /1[0-9][0-9]/, // 100-199
      /2[0-4][0-9]/, // 200-249
      /25[0-5]/, // 250-255
    );

    const regex = buildRegex([
      startOfString, // prettier break-line
      repeat([octet, '.'], 3),
      octet,
      endOfString,
    ]);

    expect(regex).toMatchString('0.0.0.0');
    expect(regex).toMatchString('192.168.0.1');
    expect(regex).toMatchString('1.99.100.249');
    expect(regex).toMatchString('255.255.255.255');
    expect(regex).toMatchString('123.45.67.89');

    expect(regex).not.toMatchString('0.0.0.');
    expect(regex).not.toMatchString('0.0.0.0.');
    expect(regex).not.toMatchString('0.-1.0.0');
    expect(regex).not.toMatchString('0.1000.0.0');
    expect(regex).not.toMatchString('0.0.300.0');
    expect(regex).not.toMatchString('255.255.255.256');

    expect(regex).toEqualRegex(
      /^(?:(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/,
    )
  });
})

describe("URL Advanced", () => {

  //  URL = Scheme ":"["//" Authority]Path["?" Query]["#" Fragment]
  //  Source: https://en.wikipedia.org/wiki/URL#External_links

  // The building blocks of the URL regex.
 

  // Scheme:
  //      The scheme is the first part of the URL and defines the protocol to be used.
  //      Examples of popular schemes include http, https, ftp, mailto, file, data and irc.
  //      A URL string must be a scheme, followed by a colon, followed by a scheme-specific part.

  const scheme = [repeat(charClass(hyphen, alphabetical), { min: 3, max: 6 }), optional('s')];
  const schemeRegex = buildRegex([startOfString, capture(scheme), endOfString], {
    ignoreCase: true,
  });

  test('Matching the Schema components.', () => {
    expect(schemeRegex).toMatchString('ftp');
    expect(schemeRegex).not.toMatchString('ftp:');
    expect(schemeRegex).not.toMatchString('h');
    expect(schemeRegex).not.toMatchString('nameiswaytoolong');
    expect(schemeRegex).toMatchString('HTTPS');
    expect(schemeRegex).toMatchString('http');
  });

  // Authority:
  //      The authority part of a URL consists of three sub-parts:
  //      1. An optional username, followed by an at symbol (@)
  //      2. A hostname (e.g. www.google.com)
  //      3. An optional port number, preceded by a colon (:)
  // Authority = [userinfo "@"] host [":" port]

  const userInfo = oneOrMore(usernameChars);
  const hostname = repeat(hostnameChars, { min: 1, max: 63 });
  const hostnameEnd = capture([hostname, endOfString]);
  const host = capture([oneOrMore([hostname, '.'])]);
  const port = [portSeperator, oneOrMore(digit)];

  const authority = [doubleSlash, optional([userInfo, at]), hostname, optional(port)];
  const authorityRegex = buildRegex([startOfString, ...authority, endOfString], {
    ignoreCase: true,
  });

  const hostEx = buildRegex([startOfString, host, hostnameEnd, endOfString], { ignoreCase: true });

  test('match URL hostname component', () => {
    expect(hostEx).toMatchString('www.google.com');
    expect(hostEx).not.toMatchString('www.google.com.');
  });

  test('match URL authority components', () => {
    expect(authorityRegex).toMatchString('//davidbowie@localhost:8080');
    expect(authorityRegex).toMatchString('//localhost:1234');
    expect(authorityRegex).not.toMatchString('davidbowie@localhost:1972');
    expect(authorityRegex).not.toMatchString('nameiswaytoolong');
  });

  // Path:
  //      The path is the part of the URL that comes after the authority and before the query.
  //      It consists of a sequence of path segments separated by a forward slash (/).
  //      A path string must begin with a forward slash (/).

  const pathSegment = [
    pathSeparator,
    optional(oneOrMore(charClass(lowercase, uppercase, digit, anyOf(':@%._+~#=')))),
  ];

  const path = oneOrMore(pathSegment);
  const pathRegex = buildRegex([startOfString, path, endOfString], {
    ignoreCase: true,
  });

  test('match URL Path components.', () => {
    expect(pathRegex).toMatchString('/');
    expect(pathRegex).not.toMatchString('');
    expect(pathRegex).toMatchString('/a');
    expect(pathRegex).not.toMatchString('a');
    expect(pathRegex).not.toMatchString('a/');
    expect(pathRegex).toMatchString('/a/b');
    expect(pathRegex).not.toMatchString('a/b');
    expect(pathRegex).not.toMatchString('a/b/');
  });

  // Query:
  //      The query part of a URL is optional and comes after the path.
  //      It is separated from the path by a question mark (?).
  //      The query string consists of a sequence of field-value pairs separated by an ampersand (&).
  //      Each field-value pair is separated by an equals sign (=).

  const queryKey = oneOrMore(charClass(lowercase, uppercase, digit, anyOf('_-')));
  const queryValue = oneOrMore(charClass(lowercase, uppercase, digit, anyOf('_-')));
  const queryDelimiter = anyOf('&;');
  const equals = '=';

  const queryKeyValuePair = buildRegex([queryKey, equals, queryValue]);

  const query = [querySeparator, oneOrMore([queryKeyValuePair, optional(queryDelimiter)])];
  const queryRegex = buildRegex([startOfString, ...query, endOfString], {
    ignoreCase: true,
  });

  test('match URL query components', () => {
    expect(queryRegex).not.toMatchString('');
    expect(queryRegex).not.toMatchString('??');
    expect(queryRegex).not.toMatchString('?');
    expect(queryRegex).not.toMatchString('?a-b');
    expect(queryRegex).toMatchString('?a=b');
    expect(queryRegex).toMatchString('?a=b&c=d');
    expect(queryRegex).not.toMatchString('a=b&c-d');
  });

  // Fragment:
  //      The fragment part of a URL is optional and comes after the query.
  //      It is separated from the query by a hash (#).
  //      The fragment string consists of a sequence of characters.

  const fragment = [
    fragmentSeparator,
    oneOrMore(charClass(lowercase, uppercase, digit, anyOf(':@%._+~#=&'))),
  ];
  const fragmentRegex = buildRegex([startOfString, ...fragment, endOfString], {
    ignoreCase: true,
  });

  test('match URL fragment component', () => {
    expect(fragmentRegex).not.toMatchString('');
    expect(fragmentRegex).toMatchString('#section1');
    expect(fragmentRegex).not.toMatchString('#');
  });

  const urlRegex = buildRegex(
    [
      startOfString,
      capture([
        optional(scheme),
        schemeSeperator,
        optional(authority),
        path,
        optional(query),
        optional(fragment),
      ]),
      endOfString,
    ],
    {
      ignoreCase: true,
    },
  );

  test('match URLs', () => {
    expect(urlRegex).not.toMatchString('');
    expect(urlRegex).not.toMatchString('http');
    expect(urlRegex).toMatchString('http://localhost:8080');
    expect(urlRegex).toMatchString('http://localhost:8080/users/paul/research/data.json');
    expect(urlRegex).toMatchString(
      'http://localhost:8080/users/paul/research/data.json?request=regex&email=me',
    );
    expect(urlRegex).toMatchString(
      'http://localhost:8080/users/paul/research/data.json?request=regex&email=me#section1',
    );
  });

  const emailRegex = buildRegex(
    [
      startOfString,
      capture([
        oneOrMore(usernameChars),
        '@',
        oneOrMore(hostnameChars),
        '.',
        repeat(domainChars, { min: 2 }),
      ]),
      endOfString,
    ],
    {
      ignoreCase: true,
    },
  );

  test('match email address', () => {
    expect(emailRegex).not.toMatchString('');
    expect(emailRegex).toMatchString('stevenwilson@porcupinetree.com');
    expect(emailRegex).not.toMatchString('stevenwilson@porcupinetree');
  });

  const urlsWithoutEmailsRegex = buildRegex(
    [
      startOfString,
      negativeLookahead(emailRegex), // Reject emails
      urlRegex,
      endOfString,
    ],
    {
      ignoreCase: true,
    },
  );

  test('match URL but not email', () => {
    expect(urlsWithoutEmailsRegex).toMatchString('http://localhost:8080');
    expect(urlsWithoutEmailsRegex).toMatchString(
      'http://paul@localhost:8080/users/paul/research/data.json?request=regex&email=me#section1',
    );
    expect(urlsWithoutEmailsRegex).toMatchString('ftp://data/#January');
    expect(urlsWithoutEmailsRegex).not.toMatchString('https:');
    expect(urlsWithoutEmailsRegex).not.toMatchString('piotr@riverside.com');
    expect(urlsWithoutEmailsRegex).toMatchString('http://www.google.com');
    expect(urlsWithoutEmailsRegex).toMatchString('https://www.google.com?search=regex');
    expect(urlsWithoutEmailsRegex).not.toMatchString('www.google.com?search=regex&email=me');
    expect(urlsWithoutEmailsRegex).toMatchString('mailto://paul@thebeatles.com');
    expect(urlsWithoutEmailsRegex).not.toMatchString('ftphttpmailto://neal@nealmorse');
  });
})
  
describe("URL Simple", () => {
  
  // Modified from: https://stackoverflow.com/a/2015516
  test('example: simple url validation', () => {
    const protocol = [choiceOf('http', 'https'), '://'];
    const domainChars = charClass(charRange('a', 'z'), digit);
    const domainCharsHypen = charClass(domainChars, anyOf('-'));

    const domainSegment = choiceOf(
      domainChars, // single char
      [domainChars, zeroOrMore(domainCharsHypen), domainChars], // multi char
    );

    const regex = buildRegex([
      startOfString,
      optional(protocol),
      oneOrMore([domainSegment, '.']), // domain segment
      charRange('a', 'z'), // TLD first char
      oneOrMore(domainChars), // TLD remaining chars
      endOfString,
    ]);
    
    expect(regex).toMatchString('example.com');
    expect(regex).toMatchString('beta.example.com');
    expect(regex).toMatchString('http://beta.example.com');
    expect(regex).toMatchString('https://beta.example.com');
    expect(regex).toMatchString('a.co');

    expect(regex).not.toMatchString('example');
    expect(regex).not.toMatchString('aaa.a');
    expect(regex).not.toMatchString('a.-a.com');
    expect(regex).not.toMatchString('a.-a.com');
    expect(regex).not.toMatchString('@gmail.com');

    expect(regex).toEqualRegex(
      /^(?:(?:http|https):\/\/)?(?:(?:[a-z\d]|[a-z\d][a-z\d-]*[a-z\d])\.)+[a-z][a-z\d]+$/,
    );
  });
})
