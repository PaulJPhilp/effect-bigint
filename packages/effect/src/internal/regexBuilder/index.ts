// Types
export type { CaptureOptions } from './constructs/capture.js';
export type { QuantifierOptions } from './constructs/quantifiers.js';
export type { RepeatOptions } from './constructs/repeat.js';
export type * from './types.js';

import type * as RegexBuilder from "../../RegexBuilder.js"


/** @internal */
const RegexBuilderSymbolKey = "effect/RegexBuilder"

/** @internal */
export const RegexBuilderTypeId: RegexBuilder.RegexBuilderTypeId = Symbol.for(
  RegexBuilderSymbolKey
) as RegexBuilder.RegexBuilderTypeId

// Constructs
export {
    endOfString,
    nonWordBoundary,
    notWordBoundary,
    startOfString,
    wordBoundary
} from './constructs/anchors.js';

export { capture, ref } from './constructs/capture.js';
export {
    any,
    anyOf,
    charClass,
    charRange,
    digit, inverted, negated, nonDigit,
    nonWhitespace,
    nonWord,
    notDigit,
    notWhitespace,
    notWord,
    whitespace,
    word
} from './constructs/character-class.js';

export { choiceOf } from './constructs/choice-of.js';
export { lookahead } from './constructs/lookahead.js';
export { lookbehind } from './constructs/lookbehind.js';
export { negativeLookahead } from './constructs/negative-lookahead.js';
export { negativeLookbehind } from './constructs/negative-lookbehind.js';
export { oneOrMore, optional, zeroOrMore } from './constructs/quantifiers.js';
export { regex } from './constructs/regex.js';
export { repeat } from './constructs/repeat.js';
