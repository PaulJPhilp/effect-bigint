//import { assertFalse, assertTrue, deepStrictEqual } from "effect-test/util"
import { any, anyOf, buildRegex, capture, charClass, charRange, negativeLookahead, regex, repeat, optional, startOfString, whitespace, zeroOrMore } from '../src/RegexBuilder.js'
import { Match, Option } from "effect"
import { describe, test, expect, assert } from "vitest"

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
const numeric = charRange("0", "9")

const alphabetic = charClass(lowercase, uppercase)
const alphabetic_regex = new RegExp(/[a-zA-Z]/)
const alphanumeric = charClass(alphabetic, digit)
const alphanumeric_regex = new RegExp(/[a-zA-Z0-9]/)



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

});


describe("Zipcode Matcher", () => {
  
  const invalidCanadianChars = regex([anyOf("DFIOQU")])
  const validCanadianFirstChar = anyOf("ACEGHJKLMNPRSTVXY")

  const usZipcode_regex = /[0-9]{5}(-[0-9]{4})?/

  const usZipcode = buildRegex([
    repeat(numeric, 5),
    optional(
      capture(
        regex([
          "-",
          repeat(numeric, 4)
        ])
      ))
  ])
  
  const canZipcode_regex = /^(?!.*[DFIOQU])[ACEGHJKLMNPRSTVXY][0-9][A-Z]\s[0-9][A-Z][0-9]/
  const canZipcode = buildRegex([
    startOfString,
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
  
  const ukZipcode_regex = /^[A-Z]{1,2}[0-9]R[0-9A-Z][0-9](?:ABD-HJLNP-UW-Z){2}/
  const uk_regex = repeat(["ABD-HJLNP-UW-Z"], 2)
  const ukZipcode = buildRegex([
    startOfString,
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


/***
const test0 = match("90210")
if (test0._tag == "Some")
  console.log("MATCH: %s", test0.value)
else
  console.log("NO MATCH")

const test1 = match("M6K 0A2")
if (test1._tag == "Some")
  console.log("MATCH: %s", test1.value)
else
  console.log("NO MATCH")

const test2 = match("hello")
if (test2._tag == "Some")
  console.log("MATCH: %s", test2.value)
else
  console.log("NO MATCH")
  
***/
