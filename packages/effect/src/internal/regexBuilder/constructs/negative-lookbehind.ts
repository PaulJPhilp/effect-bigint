import { encodeSequence } from '../encoder/encoder.js';
import type { EncodeResult } from '../encoder/types.js';
import type { RegexConstruct, RegexElement, RegexSequence } from '../types.js';
import { ensureArray } from '../utils/elements.js';

/**
 * Negative lookbehind assertion.
 *
 * A negative lookbehind assertion is a zero-width assertion that matches a group of characters only if it is not preceded by a specific group of characters.
 *
 * @example
 * ```ts
 * negativeLookbehind("a");
 * // /(?<!a)/
 *
 * negativeLookbehind(["a", "b", "c"]);
 * // /(?<!abc)/
 * ```
 */
export interface NegativeLookbehind extends RegexConstruct {
  type: 'negativeLookbehind';
  children: RegexElement[];
}

export function negativeLookbehind(sequence: RegexSequence): NegativeLookbehind {
  return {
    type: 'negativeLookbehind',
    children: ensureArray(sequence),
    encode: encodeNegativeLookbehind,
  };
}

function encodeNegativeLookbehind(this: NegativeLookbehind): EncodeResult {
  return {
    precedence: 'atom',
    pattern: `(?<!${encodeSequence(this.children).pattern})`,
  };
}
