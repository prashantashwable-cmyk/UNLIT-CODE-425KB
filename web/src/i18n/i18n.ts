import messages from '../../../docs/appendix/messages.draft.json';
import { webStrings, type Entry } from './webStrings';

export const LANGS = ['mr', 'hi', 'en'] as const;   // Marathi first (CLAUDE.md: mr -> hi -> en)
export type Lang = (typeof LANGS)[number];

const table: Record<string, Entry> = { ...webStrings };
for (const s of messages.strings) table[s.key] = { en: s.en, mr: s.mr, hi: s.hi };

export function hasKey(key: string): boolean {
  return key in table;
}

/** Text for key in lang; falls back mr -> hi -> en; a missing key is shown visibly, never silently blank. */
export function translate(key: string, lang: Lang, vars?: Record<string, string | number>): string {
  const entry = table[key];
  if (!entry) return `⟦${key}⟧`;
  const order = [lang, ...LANGS.filter((l) => l !== lang)];
  let text = order.map((l) => entry[l]).find((v) => v && v.trim() !== '') ?? `⟦${key}⟧`;
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
  return text;
}

export function allKeys(): string[] {
  return Object.keys(table);
}
