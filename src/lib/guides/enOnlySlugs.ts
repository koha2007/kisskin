// EN-only guides — English originals with **no Korean counterpart**.
//
// Why this exists: the guide system was built on the assumption that every English
// guide is a translation of a Korean one (same slug, 1:1 hreflang, language toggle
// swaps the /en prefix). Global-first content breaks that assumption — some topics
// only make sense in English (e.g. "flying to Seoul for a color analysis"), and a
// Korean reader would never search for them.
//
// Without this list two things would silently break for such a guide:
//   1. its <link hrefLang="ko"> would point at a Korean URL that 404s, and
//   2. the language toggle would drop the reader onto that same 404.
// Both are handled by consulting this set (see en/guides/@slug/+Head.tsx and
// i18n/context.tsx). Kept as a tiny standalone module — same reason as enSlugs.ts —
// so the i18n context can import it without pulling in any guide bodies.
//
// Keep in sync with GUIDE_POSTS_EN entries that have no GUIDE_POSTS twin.
export const EN_ONLY_GUIDE_SLUGS = [
  'personal-color-analysis-korea',
  'virtual-makeup-try-on-free',
] as const

export const EN_ONLY_GUIDE_SLUG_SET: ReadonlySet<string> = new Set(EN_ONLY_GUIDE_SLUGS)

/** True when this English guide has no Korean version (so don't link one). */
export function isEnOnlyGuide(slug: string): boolean {
  return EN_ONLY_GUIDE_SLUG_SET.has(slug)
}
