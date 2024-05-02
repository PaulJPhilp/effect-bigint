import type { EncodeResult } from '../encoder/types.js';
import type { RegexConstruct } from '../types.js';

export interface Anchor extends RegexConstruct {
  _tag: "Regex",
  type: 'anchor';
  symbol: string;
}

export const startOfString: Anchor = {
  _tag: "Regex",
  type: 'anchor',
  symbol: '^',
  encode: encodeAnchor,
};

export const endOfString: Anchor = {
  _tag: "Regex",
  type: 'anchor',
  symbol: '$',
  encode: encodeAnchor,
};

export const wordBoundary: Anchor = {
  _tag: "Regex",
  type: 'anchor',
  symbol: '\\b',
  encode: encodeAnchor,
};

export const nonWordBoundary: Anchor = {
  _tag: "Regex",
  type: 'anchor',
  symbol: '\\B',
  encode: encodeAnchor,
};

/**
 * @deprecated Renamed to `nonWordBoundary`.
 */
export const notWordBoundary = nonWordBoundary;

function encodeAnchor(this: Anchor): EncodeResult {
  return {
    precedence: 'sequence',
    pattern: this.symbol,
  };
}
