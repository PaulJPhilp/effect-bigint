import { encodeSequence } from '../encoder/encoder.js';
import type { EncodeResult } from '../encoder/types.js';
import type { RegexConstruct, RegexElement, RegexSequence } from '../types.js';
import { ensureArray } from '../utils/elements.js';

/**
 * Positive lookahead assertion.
 *
 * A positive lookahead assertion is a zero-width assertion that matches a group of characters only if it is followed by a specific group of characters.
 *
 * @example
 * ```ts
 * lookahead("a");
 * // /(?=a)/
 *
 * lookahead(["a", "b", "c"]);
 * // /(?=abc)/
 * ```
 */
export interface Lookahead extends RegexConstruct {
  type: 'lookahead';
  children: RegexElement[];
}

export function lookahead(sequence: RegexSequence): Lookahead {
  return {
    _tag: "RegexConstruct",
    type: 'lookahead',
    children: ensureArray(sequence),
    encode: encodeLookahead,
  };
}

function encodeLookahead(this: Lookahead): EncodeResult {
  return {
    _tag: "EncodeResult",
    type: "lookahead",
    precedence: 'atom',
    pattern: `(?=${encodeSequence(this.children).pattern})`,
  };
}
