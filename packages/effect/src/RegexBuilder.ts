/**
 * @since 3.1.0
 */

//import * as Effect from "./Effect.js"
import * as Arr from "./Array.js"
import type * as _Cache from "./Cache.js"
import * as Equal from "./Equal.js"
import { format, NodeInspectSymbol } from "./Inspectable.js"
import { hasProperty } from "./Predicate.js"
import * as Hash from "./Hash.js"
import type { Mutable } from "./Types.js"
import { pipe } from "./Function.js"
import * as internal from "./internal/regexBuilder/index.js"
import { encodeSequence } from './internal/regexBuilder/encoder/encoder.js';
import { ensureArray } from './internal/regexBuilder/utils/elements.js';
import { RegexSequence, RegexFlags } from "./internal/regexBuilder/index.js"
import * as Visitor from './Visitor.js'

/**
 * @since 3.1.0
 * @category symbols
 */
export const RegexBuilderTypeId: unique symbol = internal.RegexBuilderTypeId

/**
 * @since 3.1.0
 * @category symbols
 */
export type RegexBuilderTypeId = typeof RegexBuilderTypeId

/**
 * A `RegexBuilder<A, E>` is a ...
 *
 * @since 3.1.0
 * @category models
 */
export interface RegexBuilder extends Equal.Equal, Visitor.Exploreable {
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
      _tag: "RegexBuilder"
    }
  },

  accept() {},
  [NodeInspectSymbol](this: RegexBuilder) {
    return this.toJSON()
  }
} as const

/**
 * Checks if a given value is a `RegexBuilder` instance.
 *
 * @param u - The value to check.
 *
 * @since 3.1.0
 * @category guards
 */
export const isRegexBuilder = (u: unknown): u is RegexBuilder => hasProperty(u, RegexBuilderTypeId)

/**
 * Creates a `RegexBuilder` instance from:
 *
 * @param sequence - The Regex sequence to be used to build the RegexBuilder.
 * @param flags    - The optional flags for the regex.
 *
 * @since 3.1.0
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
 * @since 3.1.0
 * @category constructors
 */
export const buildRegex = (elements: RegexSequence, flags?: RegexFlags): RegExp => {
  const pattern = encodeSequence(ensureArray(elements)).pattern;
  const flagsString = encodeFlags(flags ?? {});
  return new RegExp(pattern, flagsString)
}

/**
 * @since 3.1.0
 * Generate regex pattern from elements.
 * @param elements Single regex element or array of elements
 * @returns regex pattern string
 */
export function buildPattern(sequence: RegexSequence): string {
  return encodeSequence(ensureArray(sequence)).pattern;
}

function encodeFlags(flags: RegexFlags): string {
  console.log('encodeFlags(%s)', flags)
  let result = '';

  if (flags.global) result += 'g';
  if (flags.ignoreCase) result += 'i';
  if (flags.multiline) result += 'm';
  if (flags.hasIndices) result += 'd';
  if (flags.dotAll) result += 's';
  if (flags.sticky) result += 'y';

  return result;
}

import type { CaptureOptions } from './internal/regexBuilder/constructs/capture.ts';
export type { QuantifierOptions } from './internal/regexBuilder/constructs/quantifiers.ts';
export type { RepeatOptions } from './internal/regexBuilder/constructs/repeat.ts';
import { ref }  from './internal/regexBuilder/constructs/capture.js';
import { capture } from './internal/regexBuilder/constructs/capture.js';

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

/**
 * Returns a character class that matches any single character. 
 * Regex syntax: .
 *
 * @example
 * import { any } from "effect/RegexBuilder"
 *
 * const regex = any  // Matches only a single character.
 *
 * assert.toMatchRegex(/./)
 *
 * @since 3.1.0
 */

export { any }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { anyOf }

/**
 *
 * Name to be given to the capturing group.
 *
 * @example
 * import type { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export type { CaptureOptions }

/**
 *
 * Name to be given to the capturing group.
 *
 * @example
 * import type { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { capture }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { CaptureOptions } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { charClass }


/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { charRange }


/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { choiceOf }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { digit }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { endOfString }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { lookahead }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { lookbehind }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { negated } 

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { negativeLookahead }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { negativeLookbehind }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { nonDigit }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { nonWhitespace }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { nonWord }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { nonWordBoundary }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { oneOrMore }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { optional }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { ref }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { regex }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { repeat }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { startOfString }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { whitespace }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { word }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { wordBoundary }

/**
 * Returns a character class that matches any character in the given string or sequence.
 * Regex syntax: [...]
 *
 * @example
 * import { anyOf } from "effect/RegexBuilder"
 *
 * const regex = anyOf("ABC")  // Matches any of "A", "B", or "C".
 *
 * assert.toMatchRegex(/[ABC]/)
 *
 * @since 3.1.0
 */

export { zeroOrMore }
