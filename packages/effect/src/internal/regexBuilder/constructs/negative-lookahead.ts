import { encodeSequence } from '../encoder/encoder.js';
import type { EncodeResult } from '../encoder/types.js';
import type { RegexConstruct, RegexElement, RegexSequence } from '../types.js';
import { ensureArray } from '../utils/elements.js';

/**
 * Negative lookahead assertion.
 *
 * A negative lookahead assertion is a zero-width assertion that matches a group of characters only if it is not followed by a specific group of characters.
 *
 * @example
 * ```ts
 * negativeLookahead("a");
 * // /(?=a)/
 *
 * negativeLookahead(["a", "b", "c"]);
 * // /(?=abc)/
 * ```
 */
export interface NegativeLookahead extends RegexConstruct {
  type: 'negativeLookahead';
  children: RegexElement[];
}

export function negativeLookahead(sequence: RegexSequence): NegativeLookahead {
  return {
    _tag: "RegexConstruct",
    type: 'negativeLookahead',
    children: ensureArray(sequence),
    encode: encodeNegativeLookahead,
  };
}

function encodeNegativeLookahead(this: NegativeLookahead): EncodeResult {
  return {
    _tag: "EncodeResult",
    type: "negativeLookahead",
    precedence: 'atom',
    pattern: `(?!${encodeSequence(this.children).pattern})`,
  };
}
