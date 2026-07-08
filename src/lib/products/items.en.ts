import type { ProductPost } from './types'

// 메이크업 제품 (Makeup Products) — English feed.
// Auto-translated from items.ts by scripts/gen-products.mjs (same slug so the
// language toggle and hreflang map one-to-one). Newest on top.
export const PRODUCT_ITEMS_EN: ProductPost[] = [
  {
    slug: 'romnd-glasting-water-tint-sample',
    category: 'lip',
    brand: 'rom&nd',
    name: 'Glasting Water Tint',
    title: 'rom&nd Glasting Water Tint — Glassy, Dewy Water Lip',
    summary:
      'A water tint that glides on thin as water yet leaves a glassy shine. Layers without feeling heavy, so it works as a daily lip.',
    highlights: ['Glassy dewy finish', 'Thin, weightless glide', 'Everyday MLBB shade'],
    details: [
      'A watery, hydrating base layers thinly without clumping for natural, buildable color.',
      'A glassy, dewy glossy finish adds a plump, glossy look to the lips.',
      'Shades range from everyday MLBB tones to vivid reds, so there’s a pick for every taste.',
      'Less drying — it also works layered lightly over lip balm for a dewy glass-lip look.',
    ],
    coupangQuery: '롬앤 글래스팅 워터 틴트',
    globalQuery: 'rom&nd Glasting Water Tint',
    clio: true,
    clioCategory: 'lip',
    date: '2026-07-08',
    tags: ['Lip tint', 'Dewy lip', 'Daily'],
    featured: true,
  },
]

export function getProductBySlugEn(slug: string): ProductPost | undefined {
  return PRODUCT_ITEMS_EN.find((p) => p.slug === slug)
}
