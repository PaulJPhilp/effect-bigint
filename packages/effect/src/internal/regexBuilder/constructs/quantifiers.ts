import { encodeAtom } from '../encoder/encoder.js';
import type { EncodeResult } from '../encoder/types.js';
import type { RegexConstruct, RegexElement, RegexSequence } from '../types.js';
import { ensureArray } from '../utils/elements.js';

export interface QuantifierOptions {
  greedy?: boolean;
}
export interface ZeroOrMore extends RegexConstruct {
  _tag: "RegexConstruct",
  type: 'zeroOrMore';
  children: RegexElement[];
  options?: QuantifierOptions;
}

export interface OneOrMore extends RegexConstruct {
  _tag: "RegexConstruct",
  type: 'oneOrMore';
  children: RegexElement[];
  options?: QuantifierOptions;
}

export interface Optional extends RegexConstruct {
  _tag: "RegexConstruct",
  type: 'optional';
  children: RegexElement[];
  options?: QuantifierOptions;
}

export function zeroOrMore(sequence: RegexSequence, options?: QuantifierOptions): ZeroOrMore {
  const z: ZeroOrMore = {
    _tag: "RegexConstruct",
    type: 'zeroOrMore',
    children: ensureArray(sequence),
    encode: encodeZeroOrMore,
  };

  if (options) z.options = options
  return z
}

export function oneOrMore(sequence: RegexSequence, options?: QuantifierOptions): OneOrMore {
  const o: OneOrMore = {
    _tag: "RegexConstruct",
    type: 'oneOrMore',
    children: ensureArray(sequence),
    encode: encodeOneOrMore,
  };

  if (options) o.options = options
  return o
}

export function optional(sequence: RegexSequence, options?: QuantifierOptions): Optional {
  const o: Optional = {
    _tag: "RegexConstruct",
    type: 'optional',
    children: ensureArray(sequence),
    encode: encodeOptional,
  };

  if (options) o.options = options
  return o
}

function encodeZeroOrMore(this: ZeroOrMore): EncodeResult {
  return {
    _tag: "EncodeResult",
    type: "zeroOrMore",
    precedence: 'sequence',
    pattern: `${encodeAtom(this.children).pattern}*${this.options?.greedy === false ? '?' : ''}`,
  };
}

function encodeOneOrMore(this: OneOrMore): EncodeResult {
  return {
    _tag: "EncodeResult",
    type: "oneOrMore",
    precedence: 'sequence',
    pattern: `${encodeAtom(this.children).pattern}+${this.options?.greedy === false ? '?' : ''}`,
  };
}

function encodeOptional(this: Optional): EncodeResult {
  return {
    _tag: "EncodeResult",
    type: "optional",
    precedence: 'sequence',
    pattern: `${encodeAtom(this.children).pattern}?${this.options?.greedy === false ? '?' : ''}`,
  };
}
