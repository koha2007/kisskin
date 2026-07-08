import type { ProductPost } from './types'

// 메이크업 제품 (Makeup Products) — Korean feed.
// New items are prepended daily by scripts/gen-products.mjs. Keep the newest on
// top (the generator inserts right after the array-open anchor below).
export const PRODUCT_ITEMS: ProductPost[] = [
  {
    slug: 'romnd-glasting-water-tint-sample',
    category: 'lip',
    brand: '롬앤',
    name: '글래스팅 워터 틴트',
    title: '롬앤 글래스팅 워터 틴트 — 촉촉한 유리알 물광 립',
    summary:
      '물처럼 얇게 발리면서 유리알 같은 광을 남기는 워터 틴트. 겹발라도 답답하지 않아 데일리로 쓰기 좋아요.',
    highlights: ['유리알 물광 마무리', '얇고 가벼운 발림', 'MLBB 데일리 컬러'],
    coupangQuery: '롬앤 글래스팅 워터 틴트',
    globalQuery: 'rom&nd Glasting Water Tint',
    clio: true,
    clioCategory: 'lip',
    date: '2026-07-08',
    tags: ['립 틴트', '물광 립', '데일리'],
    featured: true,
  },
]

export function getProductBySlug(slug: string): ProductPost | undefined {
  return PRODUCT_ITEMS.find((p) => p.slug === slug)
}
