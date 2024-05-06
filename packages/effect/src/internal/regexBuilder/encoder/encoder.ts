import type { RegexElement } from '../types.js';
import { escapeText } from '../utils/text.js';
import type { EncodeResult } from './types.js';

export function encodeSequence(elements: RegexElement[]): EncodeResult {
  const encodedNodes = elements.map((n) => encodeNode(n));
  return concatSequence(encodedNodes);
}

export function encodeAtom(elements: RegexElement[]): EncodeResult {
  return wrapAtom(encodeSequence(elements));
}

function encodeNode(element: RegexElement): EncodeResult {
  if (typeof element === 'string') {
    return encodeText(element);
  }

  if (typeof element === 'object' && element instanceof RegExp) {
    return encodeRegExp(element);
  }

  if ("encode" in element && typeof element.encode === 'function') return element.encode();
  throw new Error(`\`encodeNode\`: unknown element type ${element.type}`);

  
}

function encodeText(text: string): EncodeResult {
  if (text.length === 0) {
    throw new Error('`encodeText`: received text should not be empty');
  }

  // Optimize for single character case
  if (text.length === 1) {
    return {
      _tag: "EncodeResult",
      type: "text",
      precedence: 'atom',
      pattern: escapeText(text),
    };
  }

  return {
    _tag: "EncodeResult",
    type: "text",
    precedence: 'sequence',
    pattern: escapeText(text),
  };
}

function encodeRegExp(regexp: RegExp): EncodeResult {
  const pattern = regexp.source;

  // Encode at safe precedence
  return {
    _tag: "EncodeResult",
    type: "regexp",
    precedence: isAtomicPattern(pattern) ? 'atom' : 'disjunction',
    pattern,
  };
}

// This is intended to catch only some popular atomic patterns like char classes.
function isAtomicPattern(pattern: string): boolean {
  if (pattern.length === 1) {
    return true;
  }

  if (pattern.startsWith('[') && pattern.endsWith(']') && pattern.match(/[[\]]/g)?.length === 2) {
    return true;
  }

  if (pattern.startsWith('(') && pattern.endsWith(')') && pattern.match(/[()]/g)?.length === 2) {
    return true;
  }

  return false;
}

function concatSequence(encoded: EncodeResult[]): EncodeResult {
  if (encoded.length === 1) {
    return encoded[0]!;
  }

  return {
    _tag: "EncodeResult",
    type: "sequence",
    precedence: 'sequence',
    pattern: encoded
      .map((n) => (n.precedence === 'disjunction' ? wrapAtom(n) : n).pattern)
      .join(''),
  };
}

function wrapAtom(encoded: EncodeResult): EncodeResult {
  if (encoded.precedence === 'atom') {
    return encoded;
  }

  return {
    _tag: "EncodeResult",
    type: "atom",
    precedence: 'atom',
    pattern: `(?:${encoded.pattern})`,
  };
}
