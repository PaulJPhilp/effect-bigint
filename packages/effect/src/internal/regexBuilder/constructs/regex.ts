import { encodeSequence } from '../encoder/encoder.js';
import type { EncodeResult } from '../encoder/types.js';
import type { RegexConstruct, RegexElement, RegexSequence } from '../types.js';
import { ensureArray } from '../utils/elements.js';

export interface Regex extends RegexConstruct {
  type: 'sequence';
  children: RegexElement[];
}

export function regex(sequence: RegexSequence): Regex {
  return {
    type: 'sequence',
    children: ensureArray(sequence),
    encode: encodeRegex,
  };
}

function encodeRegex(this: Regex): EncodeResult {
  return encodeSequence(this.children);
}
