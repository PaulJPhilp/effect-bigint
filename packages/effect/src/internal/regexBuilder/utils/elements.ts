import type { RegexElement, RegexSequence } from '../types.js';

export function ensureArray(sequence: RegexSequence): RegexElement[] {
  return Array.isArray(sequence) ? sequence : [sequence];
}
