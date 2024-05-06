import { encodeSequence } from '../encoder/encoder.js';
import type { EncodeResult } from '../encoder/types.js';
import type { RegexConstruct, RegexConstructType, RegexElement, RegexSequence } from '../types.js';
import { ensureArray } from '../utils/elements.js';
// import type { RegexBuilderTypeId } from '../../../RegexBuilder.js';

/** @internal 
export const TypeId: RegexBuilderTypeId = Symbol.for(
  "@effect/regexBuilder/Regex"
) as RegexBuilderTypeId

export interface Regex extends RegexConstruct {
  type: 'sequence';
  children: RegexElement[];
}

const RegexProto: Regex = {
  _tag: "Regex",
  type: "sequence",
  encode: encodeRegex,
  children: [],
  pipe() {
    return pipeArguments(this, arguments)
  }
}

export function makeRegex(
  sequence: RegexElement[],
): typeof RegexProto {
  // console.log(sequence)
  const regex = Object.create(RegexProto)
  regex.children = ensureArray(sequence)
  return regex
}
***/

export interface Regex extends RegexConstruct {
  _tag: "RegexConstruct",
  type: RegexConstructType;
  children: RegexElement[];
  encode: typeof encodeRegex
}

export function regex(sequence: RegexSequence ): Regex {
  return {
    _tag: 'RegexConstruct',
    type: 'regex',
    children: ensureArray(sequence),
    encode: encodeRegex,
  };
}


function encodeRegex(this: Regex): EncodeResult {
  return encodeSequence(this.children);
}
