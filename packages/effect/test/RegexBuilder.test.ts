//import { assertFalse, assertTrue, deepStrictEqual } from "effect-test/util"
import { buildRegExp, charClass, charRange } from '../src/RegexBuilder.js'
import { describe, test, expect } from "vitest"

interface CustomMatchers<R = unknown> {
  toBeRegex: () => R
  toEqualRegex: (expected: String | RegExp) => R
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({

  toBeRegex(received) {

    const { isNot } = this
    return {
      // do not alter your "pass" based on isNot. Vitest does it for you
      pass: received instanceof RegExp,
      message: () => `${received} is${isNot ? ' not' : ''} RegExp`
    }
  }
})
  
expect.extend({
  toEqualRegex(received, expected) {

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

const lowercase = charRange('a', 'z')
const lowercase_regex = new RegExp(/[a-z]/)
const uppercase = charRange('A', 'Z')
const uppercase_regex = new RegExp(/[A-Z]/)
const digit = charRange('0', '9')
const digit_regex = new RegExp(/[0-9]/)

const alphabetic = charClass(lowercase, uppercase)
const alphabetic_regex = new RegExp(/[a-zA-Z]/)
const alphanumeric = charClass(alphabetic, digit)
const alphanumeric_regex = new RegExp(/[a-zA-Z0-9]/)

describe('Basic Regular Expression Constructors', () => {

  test("Is a regular expression.", {}, () => {
    expect(buildRegExp(lowercase)).toBeRegex()
    expect(buildRegExp(uppercase)).toBeRegex()
    expect(buildRegExp(digit)).toBeRegex()
    expect(buildRegExp(alphabetic)).toBeRegex()
    expect(buildRegExp(alphanumeric)).toBeRegex()
    expect(buildRegExp('a')).toBeRegex()
  })

  test("Equals the correct regular expression.", {}, () => {
    expect(buildRegExp(lowercase)).toEqualRegex(lowercase_regex)
    expect(buildRegExp(uppercase)).toEqualRegex(uppercase_regex)
    expect(buildRegExp(digit)).toEqualRegex(digit_regex)
    expect(buildRegExp(alphabetic_regex)).toEqualRegex(alphabetic_regex)
    expect(buildRegExp(alphanumeric_regex)).toEqualRegex(alphanumeric_regex)
    expect(buildRegExp('a')).toEqualRegex(new RegExp(/a/))
  })

  test("single char with flags", {}, () => {
    expect(buildRegExp('a', { global: true }).flags).toBe('g');
    expect(buildRegExp('a', { global: false }).flags).toBe('');
  })

test("single char", {}, () => {
    expect(buildRegExp('a', { ignoreCase: true }).flags).toBe('i');
    expect(buildRegExp('a', { ignoreCase: false }).flags).toBe('');
  })
  
test("single char", {}, () => {

    expect(buildRegExp('a', { multiline: true }).flags).toBe('m');
    expect(buildRegExp('a', { multiline: false }).flags).toBe('');
  })

test("single char", {}, () => {
    expect(buildRegExp('a', { hasIndices: true }).flags).toBe('d');
    expect(buildRegExp('a', { hasIndices: false }).flags).toBe('');

    expect(
      buildRegExp('a', {
        global: true, //
        ignoreCase: true,
        multiline: false,
      }).flags,
    ).toBe('gi');
  })

});


