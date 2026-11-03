// 홈 "이번 주 추천 룩" — 매주 이 파일만 고치면 칸 전체가 바뀐다.
// ─────────────────────────────────────────────────────────────────
// 운영 규칙(2026-11-03 합의): 새 룩을 매주 만들지 않는다. 기존 룩(계절 1 + 상시 5) 중
// 하나를 골라 제품·소식만 교체한다. 판매 데이터가 없으니 "랭킹·베스트"라고 쓰지 않는다.
// 제품·뉴스 전체 목록을 불러오면 홈 번들이 커지므로 필요한 문구만 여기에 적는다.
import type { MakeupStyleId } from '../makeup/styles'

type Text = { ko: string; en: string }

export interface WeeklyLook {
  styleId: MakeupStyleId
  week: Text
  name: Text
  desc: Text
  chart: { src: string; alt: Text }
  /** 차트의 번호 순서와 같다. swatch 는 룩의 색이며 제품의 실제 색이 아니다. */
  products: { slug: string; swatch: string; name: Text; note: Text }[]
  newProduct: { slug: string; name: Text }
  news: { slug: string; title: Text }
}

export const WEEKLY_LOOK: WeeklyLook = {
  styleId: 'winter-frost',
  week: { ko: '11월 첫째 주', en: 'First week of November' },
  name: { ko: '겨울 프로스티 글램', en: 'Winter Frosty Glam' },
  desc: { ko: '차가운 펄 눈가, 맑은 윤광, 플럼 로즈 립.', en: 'Icy pearl lids, clear luminous skin and a plum-rose lip.' },
  chart: {
    src: '/looks/charts/winter-frost.webp',
    alt: { ko: '겨울 프로스티 글램 페이스 차트 일러스트', en: 'Winter Frosty Glam face chart illustration' },
  },
  products: [
    {
      slug: 'peripera-all-take-mood-palette-04-cool-tone-dm-please',
      swatch: '#b7b6e0',
      name: { ko: '페리페라 올테이크 무드 팔레트 04', en: 'Peripera All Take Mood Palette 04' },
      note: { ko: '눈 · 보랏빛 음영 + 글리터', en: 'Eyes · violet shading + glitter' },
    },
    {
      slug: 'romand-better-than-cheek-blueberry-chip',
      swatch: '#eaa6bb',
      name: { ko: '롬앤 베러 댄 치크 03 블루베리칩', en: 'rom&nd Better Than Cheek 03 Blueberry Chip' },
      note: { ko: '볼 · 은은한 뮤트 핑크', en: 'Cheeks · soft muted pink' },
    },
    {
      slug: 'violette-fr-lip-nectar-hydrating-stain',
      swatch: '#a44c70',
      name: { ko: '비올렛 프 립 넥타 립 스테인', en: 'Violette_FR Bisou Nectar Lip Stain' },
      note: { ko: '입술 · 쿨 베리 계열로 고르기', en: 'Lips · choose a cool berry shade' },
    },
  ],
  newProduct: {
    slug: 'espoir-lip-tint-glaze',
    name: { ko: '에스쁘아 꾸뛰르 립틴트 글레이즈', en: 'espoir Couture Lip Tint Glaze' },
  },
  news: {
    slug: 'moo100-amazon-us-haircare-launch',
    title: { ko: 'MOO100 자몽 워터 샴푸, 미국 아마존 진출', en: 'MOO100 Grapefruit Water Shampoo enters US Amazon' },
  },
}
