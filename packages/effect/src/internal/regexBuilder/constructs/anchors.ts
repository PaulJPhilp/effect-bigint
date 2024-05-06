import type { EncodeResult } from '../encoder/types.js';
import type { RegexConstruct, RegexConstructType } from '../types.js';

export interface Anchor extends RegexConstruct {
  _tag: "RegexConstruct",
  type: RegexConstructType;
  symbol: string;
}

export const startOfString: Anchor = {
  _tag: "RegexConstruct",
  type: 'startOfString',
  symbol: '^',
  encode: encodeAnchor,
};

export const endOfString: Anchor = {
  _tag: "RegexConstruct",
  type: 'endOfString',
  symbol: '$',
  encode: encodeAnchor,
};

export const wordBoundary: Anchor = {
  _tag: "RegexConstruct",
  type: 'wordBoundary',
  symbol: '\\b',
  encode: encodeAnchor,
};

export const nonWordBoundary: Anchor = {
  _tag: "RegexConstruct",
  type: 'nonWordBoundary',
  symbol: '\\B',
  encode: encodeAnchor,
};

/**
 * @deprecated Renamed to `nonWordBoundary`.
 */
export const notWordBoundary = nonWordBoundary;

function encodeAnchor(this: Anchor): EncodeResult {
  return {
    _tag: "EncodeResult",
    type: "anchor",
    precedence: 'sequence',
    pattern: this.symbol,
  };
}
