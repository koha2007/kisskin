import type { NewsCategory } from './types'
import type { ClioCategory } from '../../config/affiliate'

// Category-based product recommendations for news articles.
// News is auto-generated daily (scripts/gen-news.mjs), so recommendations are
// keyed on the article's category rather than curated per article — a new item
// automatically surfaces the box that matches its category, zero extra data.
//
// Same shape/rules as guide products (src/lib/guides/products.ts):
//   · Search-keyword driven (no fixed SKUs), Korea-popular brands as reference.
//   · The *En fields show on /en/news/*; the Coupang query stays Korean because
//     Coupang is a Korea-market store. Brand names are romanized for EN readers.
//   · Skincare/fragrance/hair have no natural Clio (color-makeup) fit → clio:false,
//     so those show Coupang (Korea) + Amazon/YesStyle (global) only.
export interface NewsProductRec {
  label: string // product type, e.g. "립 틴트"
  desc: string // one-line why-it-fits
  brands: string[] // 2~3 Korea-popular reference brands
  coupangQuery: string // Coupang search phrase (attribute-based, ≤5 words)
  clio: boolean // also show the Clio official-store button
  clioCategory: ClioCategory
  labelEn: string
  descEn: string
  brandsEn: string[]
}

// 풀이 카테고리당 1~2개뿐이면 같은 카테고리 글은 **완전히 똑같은 박스**를 받는다.
// 2026-07-28 실측: 뉴스 53편 중 글로벌 22편(42%)이 글자 하나 안 다른 추천 박스를 달고
// 있었고, 이게 페이지당 중복 글자 27.1% 의 두 번째 덩어리였다. 아래 풀을 카테고리마다
// 3~6개로 넓히고 pickNewsProducts() 로 글마다 다른 조합을 뽑는다.
export const NEWS_CATEGORY_PRODUCTS: Record<NewsCategory, NewsProductRec[]> = {
  trend: [
    { label: '시즌 트렌드 립', desc: '기사 속 유행 컬러를 데일리로 시도하기 좋은 틴트', brands: ['롬앤', '페리페라', '클리오'], coupangQuery: '틴트 립 인기', clio: true, clioCategory: 'lip', labelEn: 'On-trend lip tint', descEn: 'Try the season’s trending color in an everyday tint', brandsEn: ['rom&nd', 'peripera', 'CLIO'] },
    { label: '트렌드 아이 팔레트', desc: '요즘 화제인 컬러 조합을 담은 데일리 팔레트', brands: ['클리오', '데이지크', '롬앤'], coupangQuery: '아이섀도 팔레트 데일리', clio: true, clioCategory: 'eye', labelEn: 'Trend eye palette', descEn: 'The buzzed-about shade combos in a daily palette', brandsEn: ['CLIO', 'dasique', 'rom&nd'] },
    { label: '무드 블러셔', desc: '올해 유행하는 톤을 얼굴에 얹는 가장 쉬운 방법', brands: ['롬앤', '힌스', '클리오'], coupangQuery: '블러셔 무드 컬러', clio: true, clioCategory: 'cheek', labelEn: 'Mood blush', descEn: 'The easiest way to wear this year’s tones', brandsEn: ['rom&nd', 'hince', 'CLIO'] },
    { label: '글로우 하이라이터', desc: '유행하는 윤광 피부 표현을 위한 마무리 아이템', brands: ['클리오', '에스쁘아', '힌스'], coupangQuery: '하이라이터 글로우 자연', clio: true, clioCategory: 'base', labelEn: 'Glow highlighter', descEn: 'The finishing step behind the glass-skin finish', brandsEn: ['CLIO', 'espoir', 'hince'] },
  ],
  lip: [
    { label: '립 틴트', desc: 'MLBB 데일리 컬러로 활용도 높은 입술 표현', brands: ['롬앤', '페리페라', '클리오'], coupangQuery: 'MLBB 틴트 립', clio: true, clioCategory: 'lip', labelEn: 'Lip tint', descEn: 'An everyday MLBB color you reach for constantly', brandsEn: ['rom&nd', 'peripera', 'CLIO'] },
    { label: '립라이너', desc: '입술 윤곽을 또렷하게 잡아 번짐을 줄임', brands: ['클리오', '페리페라', '3CE'], coupangQuery: '립라이너 누드', clio: true, clioCategory: 'lip', labelEn: 'Lip liner', descEn: 'Defines the lip line and curbs feathering', brandsEn: ['CLIO', 'peripera', '3CE'] },
    { label: '립 트리트먼트', desc: '건조한 입술을 정돈해 발색을 고르게 받쳐 줌', brands: ['라네즈', '에뛰드', '닥터지'], coupangQuery: '립밤 보습 촉촉', clio: false, clioCategory: 'lip', labelEn: 'Lip treatment', descEn: 'Softens dry lips so color lays down evenly', brandsEn: ['Laneige', 'ETUDE', 'Dr.G'] },
  ],
  eye: [
    { label: '아이섀도 팔레트', desc: '데일리부터 포인트까지 활용 가능한 구성', brands: ['클리오', '페리페라', '데이지크'], coupangQuery: '아이섀도 팔레트 데일리', clio: true, clioCategory: 'eye', labelEn: 'Eyeshadow palette', descEn: 'Versatile shades for daily and statement looks', brandsEn: ['CLIO', 'peripera', 'dasique'] },
    { label: '아이라이너', desc: '눈매를 또렷하게 잡아주는 펜슬/리퀴드', brands: ['클리오', '힌스', '롬앤'], coupangQuery: '펜슬 아이라이너 브라운', clio: true, clioCategory: 'eye', labelEn: 'Eyeliner', descEn: 'A pencil or liquid that sharpens the eye line', brandsEn: ['CLIO', 'hince', 'rom&nd'] },
    { label: '마스카라', desc: '속눈썹을 올려 눈매 인상을 바꾸는 마무리', brands: ['클리오', '에뛰드', '힌스'], coupangQuery: '마스카라 컬링 볼륨', clio: true, clioCategory: 'eye', labelEn: 'Mascara', descEn: 'Lifts lashes and reshapes the eye’s impression', brandsEn: ['CLIO', 'ETUDE', 'hince'] },
  ],
  base: [
    { label: '쿠션 파운데이션', desc: '간편하게 커버와 광채를 동시에', brands: ['클리오', '에스쁘아', '헤라'], coupangQuery: '쿠션 파운데이션 커버', clio: true, clioCategory: 'base', labelEn: 'Cushion foundation', descEn: 'Coverage and glow in one quick step', brandsEn: ['CLIO', 'espoir', 'HERA'] },
    { label: '파운데이션', desc: '피부 톤과 결을 자연스럽게 정돈', brands: ['에스쁘아', '클리오', '롬앤'], coupangQuery: '파운데이션 세미매트', clio: true, clioCategory: 'base', labelEn: 'Foundation', descEn: 'Evens tone and texture naturally', brandsEn: ['espoir', 'CLIO', 'rom&nd'] },
    { label: '메이크업 프라이머', desc: '모공과 결을 먼저 정돈해 베이스 지속력을 높임', brands: ['에스쁘아', '클리오', '힌스'], coupangQuery: '메이크업 프라이머 모공', clio: true, clioCategory: 'base', labelEn: 'Makeup primer', descEn: 'Smooths pores first so base makeup lasts', brandsEn: ['espoir', 'CLIO', 'hince'] },
  ],
  cheek: [
    { label: '블러셔', desc: '혈색을 더해 생기 있는 인상을 연출', brands: ['클리오', '롬앤', '페리페라'], coupangQuery: '블러셔 코랄 피치', clio: true, clioCategory: 'cheek', labelEn: 'Blush', descEn: 'Adds a healthy flush of color', brandsEn: ['CLIO', 'rom&nd', 'peripera'] },
    { label: '크림 블러셔', desc: '피부에 스며들 듯 밀착돼 자연스러운 혈색을 냄', brands: ['롬앤', '힌스', '클리오'], coupangQuery: '크림 블러셔 자연', clio: true, clioCategory: 'cheek', labelEn: 'Cream blush', descEn: 'Melts into skin for a flush that reads real', brandsEn: ['rom&nd', 'hince', 'CLIO'] },
    { label: '블러셔 팔레트', desc: '한 팔레트로 계절·룩에 따라 톤을 바꿔 쓰기 좋음', brands: ['클리오', '데이지크', '에스쁘아'], coupangQuery: '블러셔 팔레트 데일리', clio: true, clioCategory: 'cheek', labelEn: 'Blush palette', descEn: 'Swap tones by season or look from one palette', brandsEn: ['CLIO', 'dasique', 'espoir'] },
  ],
  skincare: [
    { label: '수분 토너', desc: '메이크업 전 피부 결을 정돈하는 진정 케어', brands: ['토리든', '아누아', '라운드랩'], coupangQuery: '수분 토너 진정', clio: false, clioCategory: 'base', labelEn: 'Hydrating toner', descEn: 'Calms and preps skin texture before makeup', brandsEn: ['Torriden', 'Anua', 'Round Lab'] },
    { label: '기능성 세럼', desc: '기사에서 다룬 성분 트렌드를 담은 집중 케어', brands: ['넘버즈인', '토리든', '메디큐브'], coupangQuery: '비타민 세럼 진정', clio: false, clioCategory: 'base', labelEn: 'Targeted serum', descEn: 'A focused treatment built on the trending actives', brandsEn: ['numbuzin', 'Torriden', 'medicube'] },
    { label: '진정 수분크림', desc: '열감·건조로 예민해진 피부를 눌러 주는 마지막 단계', brands: ['닥터지', '토리든', '일리윤'], coupangQuery: '진정 수분크림 시카', clio: false, clioCategory: 'base', labelEn: 'Soothing moisturizer', descEn: 'The last step that settles heat-stressed skin', brandsEn: ['Dr.G', 'Torriden', 'illiyoon'] },
    { label: '선크림', desc: 'K-뷰티 수출을 이끄는 품목이자 매일 쓰는 기본 케어', brands: ['라운드랩', '뷰티오브조선', '닥터지'], coupangQuery: '선크림 무기자차 톤업', clio: false, clioCategory: 'base', labelEn: 'Sunscreen', descEn: 'K-beauty’s breakout export and a daily basic', brandsEn: ['Round Lab', 'Beauty of Joseon', 'Dr.G'] },
    { label: '클렌징 오일', desc: '메이크업을 남기지 않고 지우는 1차 세안', brands: ['마녀공장', '아누아', '바닐라코'], coupangQuery: '클렌징 오일 딥클렌징', clio: false, clioCategory: 'base', labelEn: 'Cleansing oil', descEn: 'First-step cleansing that leaves no makeup behind', brandsEn: ['Ma:nyo', 'Anua', 'Banila Co'] },
  ],
  fragrance: [
    { label: '데일리 향수', desc: '가볍게 뿌리기 좋은 시그니처 데일리 향', brands: ['탬버린즈', '논픽션', '포멘트'], coupangQuery: '데일리 향수 우디', clio: false, clioCategory: 'main', labelEn: 'Everyday perfume', descEn: 'A light signature scent for daily wear', brandsEn: ['TAMBURINS', 'NONFICTION', 'forment'] },
    { label: '바디·헤어 미스트', desc: '향수보다 가볍게 잔향만 남기고 싶을 때', brands: ['탬버린즈', '논픽션', '포멘트'], coupangQuery: '바디 미스트 향', clio: false, clioCategory: 'main', labelEn: 'Body & hair mist', descEn: 'For when you want the trail without the perfume', brandsEn: ['TAMBURINS', 'NONFICTION', 'forment'] },
  ],
  hair: [
    { label: '헤어 트리트먼트', desc: '손상모를 정돈하는 데일리 홈 케어', brands: ['미쟝센', '려', '아모스'], coupangQuery: '헤어 트리트먼트 손상', clio: false, clioCategory: 'main', labelEn: 'Hair treatment', descEn: 'Daily home care that smooths damaged strands', brandsEn: ['Mise en scène', 'Ryo', 'AMOS'] },
    { label: '스타일링 오일', desc: '푸석함을 잡고 윤기를 더하는 마무리', brands: ['미쟝센', '아모스', '로레알'], coupangQuery: '헤어 오일 윤기', clio: false, clioCategory: 'main', labelEn: 'Styling oil', descEn: 'Tames frizz and adds shine as a finish', brandsEn: ['Mise en scène', 'AMOS', 'L’Oréal'] },
    { label: '두피 케어 샴푸', desc: '머릿결보다 두피 상태부터 잡고 싶을 때', brands: ['려', '닥터포헤어', '아모스'], coupangQuery: '두피 샴푸 쿨링', clio: false, clioCategory: 'main', labelEn: 'Scalp care shampoo', descEn: 'When the scalp, not the strand, is the problem', brandsEn: ['Ryo', 'Dr.FORHAIR', 'AMOS'] },
  ],
  global: [
    { label: 'K-뷰티 베스트셀러 립', desc: '해외에서도 인기 높은 대표 K-립 제품', brands: ['롬앤', '라네즈', '클리오'], coupangQuery: '틴트 립 인기', clio: true, clioCategory: 'lip', labelEn: 'K-beauty bestseller lip', descEn: 'The K-lip products topping global charts', brandsEn: ['rom&nd', 'Laneige', 'CLIO'] },
    { label: 'K-뷰티 베스트셀러 스킨케어', desc: '아마존·세포라에서 검증된 K-스킨케어', brands: ['아누아', '메디큐브', '토리든'], coupangQuery: '수분 세럼 진정', clio: false, clioCategory: 'base', labelEn: 'K-beauty bestseller skincare', descEn: 'K-skincare proven on Amazon and Sephora', brandsEn: ['Anua', 'medicube', 'Torriden'] },
    { label: 'K-선케어', desc: '유럽·미국 수출을 끌어올린 K-뷰티의 대표 품목', brands: ['라운드랩', '뷰티오브조선', '닥터지'], coupangQuery: '선크림 무기자차', clio: false, clioCategory: 'base', labelEn: 'K-suncare', descEn: 'The category driving K-beauty’s export surge', brandsEn: ['Round Lab', 'Beauty of Joseon', 'Dr.G'] },
    { label: 'K-쿠션 파운데이션', desc: '해외 뷰티 에디터들이 K-베이스로 첫손에 꼽는 포맷', brands: ['클리오', '에스쁘아', '라네즈'], coupangQuery: '쿠션 파운데이션 지속력', clio: true, clioCategory: 'base', labelEn: 'K-cushion foundation', descEn: 'The format global editors name first for K-base', brandsEn: ['CLIO', 'espoir', 'Laneige'] },
    { label: 'K-헤어케어', desc: '유럽·남미에서 수요가 빠르게 늘고 있는 카테고리', brands: ['미쟝센', '려', '아모스'], coupangQuery: '헤어 에센스 손상', clio: false, clioCategory: 'main', labelEn: 'K-haircare', descEn: 'Demand is climbing fast in Europe and Latin America', brandsEn: ['Mise en scène', 'Ryo', 'AMOS'] },
    { label: 'K-마스크팩', desc: '해외 첫 K-뷰티 입문 품목으로 가장 많이 꼽히는 것', brands: ['메디힐', '아누아', '토리든'], coupangQuery: '수분 마스크팩 진정', clio: false, clioCategory: 'base', labelEn: 'K-sheet masks', descEn: 'The most common first step into K-beauty abroad', brandsEn: ['MEDIHEAL', 'Anua', 'Torriden'] },
  ],
}

// 글마다 다른 조합을 뽑는 결정적 선택기 — pickRelated(src/lib/seo/pickRelated.ts)와 같은 철학.
// 무작위가 아니라 slug 로 정해지므로 빌드할 때마다 박스가 흔들리지 않는다(색인에 중요).
// 풀에서 시작점만 옮겨 연속으로 count 개를 가져온다 → 같은 카테고리 글들이 서로 다른
// 조합을 갖게 되면서, 이전처럼 22편이 글자 하나 안 다른 박스를 공유하는 일이 사라진다.
export function pickNewsProducts(category: NewsCategory, slug: string, count = 2): NewsProductRec[] {
  const pool = NEWS_CATEGORY_PRODUCTS[category] ?? []
  if (pool.length <= count) return pool
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0
  const start = h % pool.length
  return Array.from({ length: count }, (_, k) => pool[(start + k) % pool.length])
}
