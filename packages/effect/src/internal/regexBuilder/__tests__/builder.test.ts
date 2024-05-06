//import { assertFalse, assertTrue, deepStrictEqual } from "effect-test/util"
import { buildRegex } from '../../../RegexBuilder.js';
import { describe, test, expect } from "vitest"

describe('`regexBuilder` flags', () => {

  test("single char", {}, () => {
    expect(buildRegex('a').flags).toBe('');
    expect(buildRegex('a', {}).flags).toBe('');
  })

  /***
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

***/
});

