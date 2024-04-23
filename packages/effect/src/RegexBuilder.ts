/**
 * @since 3.0.0
 */

import * as Arr from "./Array.js"
import type * as _Cache from "./Cache.js"
//import type * as Effect from "./Effect.js"
//import type * as Exit from "./Exit.js"
import { type Pipeable, pipeArguments } from "./Pipeable.js"
import * as Equal from "./Equal.js"
import { format, type Inspectable, NodeInspectSymbol } from "./Inspectable.js"
import { hasProperty } from "./Predicate.js"
//import * as equivalence from "./Equivalence.js"
import * as Hash from "./Hash.js"
import type { Mutable } from "./Types.js"
import { pipe } from "./Function.js"

import * as internal from "./internal/regexBuilder/index.js"

export type ArrayOrSingle<T> = T[] | T;

/**
 * @since 2.0.0
 * @category symbols
 */
export const RegexBuilderTypeId: unique symbol = internal.RegexBuilderTypeId

/**
 * @since 2.0.0
 * @category symbols
 */
export type RegexBuilderTypeId = typeof RegexBuilderTypeId

import type { EncodeResult } from './internal/regexBuilder/encoder/types.ts';

/**
 * Sequence of regex elements forming a regular expression.
 *
 * For developer convenience it also accepts a single element instead of array.
 */
export type RegexSequence = ArrayOrSingle<RegexElement>

/**
 * Fundamental building block of a regular expression, defined as either a regex construct or a string.
 */
export type RegexElement = RegexConstruct | string | RegExp;

/**
 * Common interface for all regex constructs like character classes, quantifiers, and anchors.
 */
export interface RegexConstruct {
  type: string;
  encode(): EncodeResult;
}

export interface RegexFlags {
  /** Find all matches in a string, instead of just the first one. */
  global?: boolean;

  /** Perform case-insensitive matching. */
  ignoreCase?: boolean;

  /** Treat the start and end of each line in a string as the beginning and end of the string. */
  multiline?: boolean;

  /** Penerate the start and end indices of each captured group in a match. */
  hasIndices?: boolean;
}

/**
 * A `RegexBuilder<A, E>` is a ...
 *
 * @since 2.0.0
 * @category models
 */
export interface RegexBuilder<A extends RegexSequence, E extends Error, R extends RegExp> extends Pipeable, Equal.Equal, Inspectable {
  readonly _tag: "RegexBuilder"
  readonly [RegexBuilderTypeId]: RegexBuilderTypeId
  readonly sequence: ReadonlyArray<RegexSequence>
  readonly flags: Readonly<RegexFlags>
}

const RegexBuilderProto: Omit<RegexBuilder<RegexSequence, Error, RegExp>, "sequence" | "flags"> = {

  _tag: "RegexBuilder",

  [RegexBuilderTypeId]: RegexBuilderTypeId,

  [Equal.symbol](this: RegexBuilder<RegexSequence, Error, RegExp>, that: unknown) {
    return isRegexBuilder(that) && Equal.equals(this, that)
  },

  [Hash.symbol](this: RegexBuilder<RegexSequence, Error, RegExp>): number {
    return pipe(
      Hash.array(Arr.fromIterable(this.sequence)),
      Hash.combine(Hash.structure(this.flags))
    )
  },
  toString(this: RegexBuilder<RegexSequence, Error, RegExp>) {
    return format(this.toJSON())
  },
  toJSON(this: RegexBuilder<RegexSequence, Error, RegExp>) {
    return {
      _id: "RegexBuilder"
    }
  },
  [NodeInspectSymbol](this: RegexBuilder<RegexSequence, Error, RegExp>) {
    return this.toJSON()
  },
  pipe() {
    return pipeArguments(this, arguments)
  }
} as const

/**
 * Checks if a given value is a `Cron` instance.
 *
 * @param u - The value to check.
 *
 * @since 2.0.0
 * @category guards
 */
export const isRegexBuilder = (u: unknown): u is RegexBuilder<RegexSequence, Error, RegExp> => hasProperty(u, RegexBuilderTypeId)

/**
 * Creates a `RegexBuilder` instance from.
 *
 * @param constraints - The RegexBuilder constraints.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = ({
  sequence,
  flags
}: {
  readonly sequence: ReadonlyArray<RegexSequence>
  readonly flags: RegexFlags
}): RegexBuilder<RegexSequence, Error, RegExp> => {
  const o: Mutable<RegexBuilder<RegexSequence, Error, RegExp>> = Object.create(RegexBuilderProto)
  o.sequence = sequence
  o.flags = flags
  return o
}

// Types
import { encodeSequence } from './internal/regexBuilder/encoder/encoder.js';
import { ensureArray } from './internal/regexBuilder/utils/elements.js';

/**
 * Generate RegExp object from elements with optional flags.
 *
 * @param elements Single regex element or array of elements
 * @param flags RegExp flags object
 * @returns RegExp object
 */
export function buildRegExp(sequence: RegexSequence, flags?: RegexFlags): RegExp {
  const pattern = encodeSequence(ensureArray(sequence)).pattern;
  const flagsString = encodeFlags(flags ?? {});
  return new RegExp(pattern, flagsString);
}

/**
 * Generate regex pattern from elements.
 * @param elements Single regex element or array of elements
 * @returns regex pattern string
 */
export function buildPattern(sequence: RegexSequence): string {
  return encodeSequence(ensureArray(sequence)).pattern;
}

function encodeFlags(flags: RegexFlags): string {
  let result = '';

  if (flags.global) result += 'g';
  if (flags.ignoreCase) result += 'i';
  if (flags.multiline) result += 'm';
  if (flags.hasIndices) result += 'd';

  return result;
}

export type { CaptureOptions, capture, ref } from './internal/regexBuilder/constructs/capture.ts';
export type { QuantifierOptions } from './internal/regexBuilder/constructs/quantifiers.ts';
export type { RepeatOptions } from './internal/regexBuilder/constructs/repeat.ts';

// Constructs
export {
  endOfString,
  nonWordBoundary,
  notWordBoundary,
  startOfString,
  wordBoundary
} from './internal/regexBuilder/constructs/anchors.js'

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
} from './internal/regexBuilder/constructs/character-class.js';

export { choiceOf } from './internal/regexBuilder/constructs/choice-of.js';
export { lookahead } from './internal/regexBuilder/constructs/lookahead.js';
export { lookbehind } from './internal/regexBuilder/constructs/lookbehind.js';
export { negativeLookahead } from './internal/regexBuilder/constructs/negative-lookahead.js';
export { negativeLookbehind } from './internal/regexBuilder/constructs/negative-lookbehind.js';
export { oneOrMore, optional, zeroOrMore } from './internal/regexBuilder/constructs/quantifiers.js';
export { regex } from './internal/regexBuilder/constructs/regex.js';
export { repeat } from './internal/regexBuilder/constructs/repeat.js';
