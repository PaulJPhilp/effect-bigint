import type { EncodeResult } from './encoder/types.js'

export type ArrayOrSingle<T> = T[] | T;

interface IVisitable {
  accept(visitor: RegexVisitor): void;
}

interface RegexVisitor {
  visitSequence(element: RegexSequence): void;
  visitElement(element: RegExpConstructor): void;
}

class RegexSequenceVisitor implements RegexVisitor {
  visitSequence(element: RegexSequence): void {
    if (element instanceof Array) {
      element.debug()
    }
  }
  visitElement(element: RegExpConstructor): void {}
}


/**
 * Sequence of regex elements forming a regular expression.
 *
 * For developer convenience it also accepts a single element instead of array.
 */
export type RegexSequence = RegexElement[] | RegexElement;

/**
 * Fundamental building block of a regular expression, defined as either a regex construct or a string.
 */
export type RegexElement = RegexConstruct | EncodeResult | string | RegExp;

export type RegexConstructType =
  | "anchor"
  | "any"
  | "anyOf"
  | "any"
  | "anyOf"
  | "atom"
  | "capture"
  | "charClass"
  | "charRange"
  | "choiceOf"
  | "digit"
  | "endOfString"
  | "lookahead"
  | "lookbehind"
  | "negated"
  | "negativeLookahead"
  | "negativeLookbehind"
  | "nonDigit"
  | "nonWhitespace"
  | "nonWord"
  | "nonWordBoundary"
  | "oneOrMore"
  | "optional"
  | "ref"
  | "regex"
  | "regexp"
  | "repeat"
  | "sequence"
  | "startOfString"
  | "text"
  | "whitespace"
  | "word"
  | "wordBoundary"
  | "zeroOrMore"

/**
 * Common interface for all regex constructs like character classes, quantifiers, and anchors.
 */
export interface RegexConstruct  {
  _tag: "RegexConstruct";
  type: RegexConstructType;
  encode(): EncodeResult;
  debug(): RegexSequenceVisitor
}

/**
 * Flags to be passed to RegExp constructor.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp#flags
 */
export interface RegexFlags {
  /**
   * Find all matches in a string, instead of just the first one.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/global
   */
  global?: boolean;

  /**
   * Perform case-insensitive matching.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/ignoreCase
   */
  ignoreCase?: boolean;

  /**
   * Treat the start and end of each line in a string as the beginning and end of the string.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/multiline
   */
  multiline?: boolean;

  /**
   * Generate the start and end indices of each captured group in a match.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/hasIndices
   */
  hasIndices?: boolean;

  /**
   * MDN: _Allows . to match newlines._
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/dotAll
   */
  dotAll?: boolean;

  /**
   * MDN: _Matches only from the index indicated by the lastIndex property of this regular expression in the target string. Does not attempt to match from any later indexes._
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/sticky
   */
  sticky?: boolean;
}
