//import { assertFalse, assertTrue, deepStrictEqual } from "effect-test/util"
import { buildRegExp } from '../index.js';
import { describe, test, expect } from "vitest"

describe('`regexBuilder` flags', () => {

  test("single char", {}, () => {
    expect(buildRegExp('a').flags).toBe('');
    expect(buildRegExp('a', {}).flags).toBe('');
  })

  /***
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

***/
});

