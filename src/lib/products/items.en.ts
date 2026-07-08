import type { ProductPost } from './types'

// 메이크업 제품 (Makeup Products) — English feed.
// Auto-translated from items.ts by scripts/gen-products.mjs (same slug so the
// language toggle and hreflang map one-to-one). Newest on top.
export const PRODUCT_ITEMS_EN: ProductPost[] = [
  {
    slug: 'romand-lip-matter',
    category: 'lip',
    brand: 'rom&nd',
    name: 'Lip Matter',
    title: 'rom&nd Lip Matter: Transform Any Lip into a Velvety Matte Finish! Doubles as a Lip Primer',
    summary:
      'A new concept lip matter that transforms even dewy lip products into a soft, matte finish. Fills in fine lines for a smooth, blurred lip look.',
    highlights: ['Matte Lip Maker', 'Lip Wrinkle Cover', 'Soft, Powdery Finish', 'Primer Effect'],
    details: [
      'A unique formula that, when applied over any lipstick, creates a silky, powdery matte lip without greasiness.',
      'Fills in fine lines on the lips for a smooth, even lip makeup, creating a blurred effect.',
      'Contains moisturizing ingredients like palm seed butter, mango seed butter, and avocado oil for a comfortable finish without dryness.',
    ],
    image: '/products/romand-lip-matter.webp',
    coupangQuery: '롬앤 립 매터',
    globalQuery: 'romand lip matter',
    clio: true,
    clioCategory: 'lip',
    date: '2026-07-08',
    tags: ['rom&nd', 'LipMatter', 'MatteLip', 'LipPrimer', 'SoftLip'],
  },
  {
    slug: 'naming-high-dew-lip-glaze',
    category: 'lip',
    brand: 'NAMING.',
    name: 'HIGH DEW LIP GLAZE',
    title: 'NAMING. HIGH DEW LIP GLAZE: Achieve Plump Overlips Without Procedures!',
    summary:
      'This lip glaze features a clear, transparent syrup glaze texture that melts moistly onto lips, creating a plump and voluminous look. Its clear color remains even with multiple applications, without clumping.',
    highlights: ['Clear Syrup Glaze', 'Creates Plump Overlips', 'Clear Color Even When Layered', 'Non-Sticky Moisture'],
    details: [
      'The syrup glaze texture delivers extreme shine, adhering lightly and moistly to lips without feeling heavy or sticky.',
      'It melts smoothly onto lips, providing a natural plumping effect that creates plump, voluminous overlips without the need for cosmetic procedures.',
      'Available in 8 diverse colors, from clear vintage pink to mysterious mauve plum, allowing you to create vibrant and captivating lip makeup tailored to your skin tone.',
      'The transparent and vivid color is maintained even with multiple applications without clumping, blending with your natural lip color for a more natural look.',
    ],
    image: '/products/naming-high-dew-lip-glaze.webp',
    coupangQuery: '네이밍 하이 듀 립 글레이즈',
    globalQuery: 'naming high dew lip glaze',
    clio: true,
    clioCategory: 'lip',
    date: '2026-07-08',
    tags: ['GlazeTint', 'SyrupGlow', 'Overlip', 'Plumping', 'MoistTint'],
  },
  {
    slug: 'dinto-bare-gloss',
    category: 'lip',
    brand: 'Dinto',
    name: 'Bare-Gloss',
    title: 'Dinto Bare-Gloss: Transparent Shine & Vivid Color in One!',
    summary:
      'Dinto Bare-Gloss is a lip product that combines transparent gloss with the vivid color payoff of a tint. It enhances your natural lip color for a clear and lively lip makeup look.',
    highlights: ['Transparent shine', 'Vivid color payoff', 'Non-sticky melting texture', 'Natural-looking colors'],
    details: [
      'Experience both the transparent shine of a lip gloss and the vivid color of a lip tint simultaneously.',
      'Glides on smoothly, melting onto lips for a comfortable, non-sticky finish.',
      'Features medium-brightness and saturation colors that enhance your natural lip tone for a clear and lively look.',
      'This is the first lip makeup line from the \'Gumiho Collection,\' reinterpreting the traditional Korean folklore of the \'Gumiho\' (nine-tailed fox).',
    ],
    image: '/products/dinto-bare-gloss.webp',
    coupangQuery: '딘토 베어글로스',
    globalQuery: 'Dinto Bare Gloss',
    clio: true,
    clioCategory: 'lip',
    date: '2026-07-08',
    tags: ['Gloss', 'Lip Tint', 'Transparent Shine', 'Daily Lip'],
  },
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
    image: '/products/romnd-glasting-water-tint-sample.webp',
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
