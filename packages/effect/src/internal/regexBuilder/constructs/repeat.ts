import { encodeAtom } from '../encoder/encoder.js';
import type { EncodeResult } from '../encoder/types.js';
import type { RegexConstruct, RegexElement, RegexSequence } from '../types.js';
import { ensureArray } from '../utils/elements.js';

export interface Repeat extends RegexConstruct {
  _tag: "RegexConstruct",
  type: 'repeat';
  children: RegexElement[];
  options: RepeatOptions;
}

export type RepeatOptions = number | { min: number; max?: number; greedy?: boolean };

export function repeat(sequence: RegexSequence, options: RepeatOptions): Repeat {
  const children = ensureArray(sequence);

  if (children.length === 0) {
    throw new Error('`repeat` should receive at least one element');
  }

  return {
    _tag: "RegexConstruct",
    type: 'repeat',
    children,
    options,
    encode: encodeRepeat,
  };
}

function encodeRepeat(this: Repeat): EncodeResult {
  const atomicNodes = encodeAtom(this.children);

  if (typeof this.options === 'number') {
    return {
      _tag: "EncodeResult",
      type: "repeat",
      precedence: 'sequence',
      pattern: `${atomicNodes.pattern}{${this.options}}`,
    };
  }

  return {
    _tag: "EncodeResult",
     type: "repeat",
    precedence: 'sequence',
    pattern: `${atomicNodes.pattern}{${this.options.min},${this.options?.max ?? ''}}${
      this.options.greedy === false ? '?' : ''
    }`,
  };
}
