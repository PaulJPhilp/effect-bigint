import { encodeSequence } from '../encoder/encoder.js';
import type { EncodeResult } from '../encoder/types.js';
import type { RegexConstruct, RegexElement, RegexSequence } from '../types.js';
import { ensureArray } from '../utils/elements.js';

/**
 * Positive lookbehind assertion.
 *
 * A positive lookbehind assertion is a zero-width assertion that matches a group of characters only if it is preceded by a specific group of characters.
 *
 * @example
 * ```ts
 * lookbehind("a");
 * // /(?<=a)/
 *
 * lookbehind(["a", "b", "c"]);
 * // /(?<=abc)/
 * ```
 */
export interface Lookbehind extends RegexConstruct {
  type: 'lookbehind';
  children: RegexElement[];
}

export function lookbehind(sequence: RegexSequence): Lookbehind {
  return {
    _tag: "RegexConstruct",
    type: 'lookbehind',
    children: ensureArray(sequence),
    encode: encodeLookbehind,
  };
}

function encodeLookbehind(this: Lookbehind): EncodeResult {
  return {
    _tag: "EncodeResult",
    type: "lookbehind",
    precedence: 'atom',
    pattern: `(?<=${encodeSequence(this.children).pattern})`,
  };
}
