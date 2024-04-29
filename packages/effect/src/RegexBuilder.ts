/**
 * @since 3.0.0
 */

import * as Arr from "./Array.js"
import type * as _Cache from "./Cache.js"
import * as Equal from "./Equal.js"
import { format, type Inspectable, NodeInspectSymbol } from "./Inspectable.js"
import { hasProperty } from "./Predicate.js"
import * as Hash from "./Hash.js"
import type { Mutable } from "./Types.js"
import { pipe } from "./Function.js"

import * as internal from "./internal/regexBuilder/index.js"

// Types
import { encodeSequence } from './internal/regexBuilder/encoder/encoder.js';
import { ensureArray } from './internal/regexBuilder/utils/elements.js';
import { RegexSequence } from "./internal/regexBuilder/index.js"

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

import type { EncodeResult } from './internal/regexBuilder/encoder/types.js';

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
export interface RegexBuilder extends Equal.Equal, Inspectable {
  readonly _tag: "RegexBuilder"
  readonly [RegexBuilderTypeId]: RegexBuilderTypeId
  readonly sequence: Readonly<RegexSequence>
  readonly flags: Readonly<RegexFlags>
}

const RegexBuilderProto: Omit<RegexBuilder, "sequence" | "flags"> = {

  _tag: "RegexBuilder",

  [RegexBuilderTypeId]: RegexBuilderTypeId,

  [Equal.symbol](this: RegexBuilder, that: unknown) {
    return isRegexBuilder(that) && Equal.equals(this, that)
  },

  [Hash.symbol](this: RegexBuilder): number {
    return pipe(
      Array.isArray(this.sequence) ? Hash.array(Arr.fromIterable(this.sequence)) :
        (typeof this.sequence === "object") ? Hash.structure(this.sequence) :
          (typeof this.sequence === "string") ? Hash.string(this.sequence) :
            Hash.string(this.sequence),
      Hash.combine(Hash.structure(this.flags))
    )
  },
  toString(this: RegexBuilder) {
    return format(this.toJSON())
  },
  toJSON(this: RegexBuilder) {
    return {
      _id: "RegexBuilder"
    }
  },
  [NodeInspectSymbol](this: RegexBuilder) {
    return this.toJSON()
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
export const isRegexBuilder = (u: unknown): u is RegexBuilder => hasProperty(u, RegexBuilderTypeId)

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
  readonly sequence: RegexSequence
  readonly flags: RegexFlags
}): RegexBuilder => {
  const o: Mutable<RegexBuilder> = Object.create(RegexBuilderProto)
  o.sequence = sequence
  o.flags = flags
  return o
}

/**
 * Generate RegExp object from elements with optional flags.
 *
 * @param elements Single regex element or array of elements
 * @param flags RegExp flags object
 * @returns RegExp object
 *
 * @since 2.0.0
 * @category constructors
 */
export const buildRegex = (elements: RegexSequence, flags: RegexFlags): RegExp => {
  const pattern = encodeSequence(ensureArray(elements)).pattern;
  const flagsString = encodeFlags(flags ?? {});
  return new RegExp(pattern, flagsString)
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

import type { CaptureOptions, ref } from './internal/regexBuilder/constructs/capture.ts';
import { capture } from './internal/regexBuilder/constructs/capture.js';
export type { QuantifierOptions } from './internal/regexBuilder/constructs/quantifiers.ts';
export type { RepeatOptions } from './internal/regexBuilder/constructs/repeat.ts';

// Constructs
import {
  endOfString,
  nonWordBoundary,
  startOfString,
  wordBoundary
} from './internal/regexBuilder/constructs/anchors.js'

import {
  any,
  anyOf,
  charClass,
  charRange,
  digit, negated, nonDigit,
  nonWhitespace,
  nonWord,
  whitespace,
  word
} from './internal/regexBuilder/constructs/character-class.js';

import { choiceOf } from './internal/regexBuilder/constructs/choice-of.js';
import { lookahead } from './internal/regexBuilder/constructs/lookahead.js';
import { lookbehind } from './internal/regexBuilder/constructs/lookbehind.js';
import { negativeLookahead } from './internal/regexBuilder/constructs/negative-lookahead.js';
import { negativeLookbehind } from './internal/regexBuilder/constructs/negative-lookbehind.js';
import { oneOrMore, optional, zeroOrMore } from './internal/regexBuilder/constructs/quantifiers.js';
import { regex } from './internal/regexBuilder/constructs/regex.js';
import { repeat } from './internal/regexBuilder/constructs/repeat.js';

export {
  any,
  anyOf,
  capture,
  CaptureOptions,
  charClass,
  charRange,
  choiceOf,
  digit,
  endOfString,
  lookahead,
  lookbehind,
  negated,
  negativeLookahead,
  negativeLookbehind,
  nonDigit,
  nonWhitespace,
  nonWord,
  nonWordBoundary,
  oneOrMore,
  optional,
  ref,
  regex,
  repeat,
  startOfString,
  whitespace,
  word,
  wordBoundary,
  zeroOrMore,
}

/***
 *** Zipcode Matcher
 ***/

const numeric = charRange("0", "9")
const upperCase = charRange("A", "Z")
const invalidCanadianChars = regex([anyOf("DFIOQU")])
const validCanadianFirstChar = anyOf("ACEGHJKLMNPRSTVXY")

//const usZipcode_regex = /^[0-9]{5}(?:-[0-9]{4})?$/
const usZipcode = buildRegex([
  repeat(numeric, 5),
  optional(
    capture(
      regex([
       "-",
        repeat(numeric, 4)
      ])
    ))
], {})
  
//const canZipcode_regex = /^(?!.*[DFIOQU])[A-VXY][0-9][A-Z]●?[0-9][A-Z][0-9]$/
const canZipcode = buildRegex([
  startOfString,
  negativeLookahead([
    zeroOrMore(any),
    invalidCanadianChars
  ]),
  validCanadianFirstChar,
  digit,
  upperCase,
  whitespace,
  digit,
  upperCase,
  digit
], {})

//const ukZipcode_regex = /^[A-Z]{1,2}[0-9R][0-9A-Z]?●[0-9][ABD-HJLNP-UW-Z]{2}$/
const uk_regex = repeat(["ABD-HJLNP-UW-Z"], 2)
const ukZipcode = buildRegex([
  startOfString,
  repeat(upperCase, { min: 1, max: 2 }),
  regex([digit, "R"]),
  charClass(digit, upperCase),
  digit,
  uk_regex
], {global: true})

import { Match } from "effect"
 
const match = Match.type< string >().pipe(
  Match.when((input) => usZipcode.test(input), (_) => "US" ),
  Match.when((input) => ukZipcode.test(input), (_) => "UK" ),
  Match.when((input) => canZipcode.test(input) , (_) => "CAN") ,
  Match.option
)
 
const test0 = match("90210")
if (test0._tag == "Some")
  console.log("MATCH: %s", test0.value)
else
  console.log("NO MATCH")

const test1 = match("M6K 0A2")
if (test1._tag == "Some")
  console.log("MATCH: %s", test1.value)
else
  console.log("NO MATCH")

const test2 = match("hello")
if (test2._tag == "Some")
  console.log("MATCH: %s", test2.value)
else
  console.log("NO MATCH")
