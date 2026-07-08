import type { ProductPost } from './types'

// 메이크업 제품 (Makeup Products) — Korean feed.
// New items are prepended daily by scripts/gen-products.mjs. Keep the newest on
// top (the generator inserts right after the array-open anchor below).
export const PRODUCT_ITEMS: ProductPost[] = [
  {
    slug: 'dinto-bare-gloss',
    category: 'lip',
    brand: '딘토',
    name: '베어글로스',
    title: '딘토 베어글로스, 투명한 광택과 선명한 발색을 한 번에!',
    summary:
      '딘토 베어글로스는 투명한 광택감과 틴트의 선명한 발색을 결합한 립 제품입니다. 입술 본연의 색감을 살려 맑고 생기 있는 립 메이크업을 연출해 줍니다.',
    highlights: ['투명한 광택', '선명한 발색', '끈적임 없는 멜팅', '자연스러운 컬러'],
    details: [
      '립글로스의 투명한 광택감과 립틴트의 선명한 발색을 동시에 느낄 수 있는 제품입니다.',
      '입술에 부드럽게 녹아들 듯 발리며, 끈적임 없이 편안한 마무리감을 선사합니다.',
      '입술 본연의 색감을 살리는 중간 명도와 채도의 컬러로 맑고 생기 있는 립을 연출합니다.',
      '한국 전통 설화 \'구미호\'를 재해석한 \'구미호 컬렉션\'의 첫 립 메이크업 라인입니다.',
    ],
    image: '/products/dinto-bare-gloss.webp',
    coupangQuery: '딘토 베어글로스',
    globalQuery: 'Dinto Bare Gloss',
    clio: true,
    clioCategory: 'lip',
    date: '2026-07-08',
    tags: ['글로스', '립틴트', '투명광택', '데일리립'],
  },
  {
    slug: 'romnd-glasting-water-tint-sample',
    category: 'lip',
    brand: '롬앤',
    name: '글래스팅 워터 틴트',
    title: '롬앤 글래스팅 워터 틴트 — 촉촉한 유리알 물광 립',
    summary:
      '물처럼 얇게 발리면서 유리알 같은 광을 남기는 워터 틴트. 겹발라도 답답하지 않아 데일리로 쓰기 좋아요.',
    highlights: ['유리알 물광 마무리', '얇고 가벼운 발림', 'MLBB 데일리 컬러'],
    details: [
      '수분감 있는 워터 베이스라 얇게 겹쳐 발라도 뭉치지 않고 자연스럽게 발색돼요.',
      '유리알처럼 촉촉하게 반짝이는 글로시 마무리로 입술에 볼륨감을 더해줍니다.',
      '데일리로 무난한 MLBB 톤부터 선명한 레드까지 컬러 구성이 다양해 취향대로 고르기 좋아요.',
      '건조함이 덜해 립밤 위에 가볍게 덧발라 촉촉한 물광 립으로 연출하기도 좋습니다.',
    ],
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
