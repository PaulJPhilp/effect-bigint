import { encodeSequence } from '../encoder/encoder.js';
import type { EncodeResult } from '../encoder/types.js';
import type { RegexConstruct, RegexElement, RegexSequence } from '../types.js';
import { ensureArray } from '../utils/elements.js';

export interface Capture extends RegexConstruct {
  type: 'capture';
  children: RegexElement[];
  options?: CaptureOptions;
}

export type CaptureOptions = {
  /**
   * Name to be given to the capturing group.
   */
  name?: string;
};

export interface Reference extends RegexConstruct {
  type: 'reference';
  name: string;
}

/**
 * Creates a capturing group which allows the matched pattern to be available:
 * - in the match results (`String.match`, `String.matchAll`, or `RegExp.exec`)
 * - in the regex itself, through {@link ref}
 */
export function capture(sequence: RegexSequence, options?: CaptureOptions): Capture {
  const result: Capture = {
    type: 'capture',
    children: ensureArray(sequence),
    encode: encodeCapture
  }
  if ( options !== undefined) result.options = options
  return result
}

/**
 * Creates a reference, also known as backreference, which allows matching
 * again the exact text that a capturing group previously matched.
 *
 * In order to form a valid regex, the reference must use the same name as
 * a capturing group earlier in the expression.
 *
 * @param name - Name of the capturing group to reference.
 */
export function ref(name: string): Reference {
  return {
    type: 'reference',
    name,
    encode: encodeReference,
  };
}

function encodeCapture(this: Capture): EncodeResult {
  const name = this.options?.name;
  if (name) {
    return {
      precedence: 'atom',
      pattern: `(?<${name}>${encodeSequence(this.children).pattern})`,
    };
  }

  return {
    precedence: 'atom',
    pattern: `(${encodeSequence(this.children).pattern})`,
  };
}

function encodeReference(this: Reference): EncodeResult {
  return {
    precedence: 'atom',
    pattern: `\\k<${this.name}>`,
  };
}
