import { RegexConstructType } from "../types.js";

/**
 * Encoded regex pattern with information about its type (atom, sequence)
 */
export interface EncodeResult {
  _tag: "EncodeResult";
  type: RegexConstructType;
  precedence: EncodePrecedence;
  pattern: string;
}

export type EncodePrecedence = 'atom' | 'sequence' | 'disjunction';

//export type EncodeResultType = "text" | "regexp" | "sequence" | "atom" | "anchor" | "capture" | "ref" | "charClass" | "repeat" | "zeroOrMore" | "oneOrMore" | "optional" | "negativeLookahead" | "negativeLookbehind"
