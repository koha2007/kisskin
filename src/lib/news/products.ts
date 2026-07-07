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

export const NEWS_CATEGORY_PRODUCTS: Record<NewsCategory, NewsProductRec[]> = {
  trend: [
    { label: '시즌 트렌드 립', desc: '기사 속 유행 컬러를 데일리로 시도하기 좋은 틴트', brands: ['롬앤', '페리페라', '클리오'], coupangQuery: '틴트 립 인기', clio: true, clioCategory: 'lip', labelEn: 'On-trend lip tint', descEn: 'Try the season’s trending color in an everyday tint', brandsEn: ['rom&nd', 'peripera', 'CLIO'] },
    { label: '트렌드 아이 팔레트', desc: '요즘 화제인 컬러 조합을 담은 데일리 팔레트', brands: ['클리오', '데이지크', '롬앤'], coupangQuery: '아이섀도 팔레트 데일리', clio: true, clioCategory: 'eye', labelEn: 'Trend eye palette', descEn: 'The buzzed-about shade combos in a daily palette', brandsEn: ['CLIO', 'dasique', 'rom&nd'] },
  ],
  lip: [
    { label: '립 틴트', desc: 'MLBB 데일리 컬러로 활용도 높은 입술 표현', brands: ['롬앤', '페리페라', '클리오'], coupangQuery: 'MLBB 틴트 립', clio: true, clioCategory: 'lip', labelEn: 'Lip tint', descEn: 'An everyday MLBB color you reach for constantly', brandsEn: ['rom&nd', 'peripera', 'CLIO'] },
    { label: '립라이너', desc: '입술 윤곽을 또렷하게 잡아 번짐을 줄임', brands: ['클리오', '페리페라', '3CE'], coupangQuery: '립라이너 누드', clio: true, clioCategory: 'lip', labelEn: 'Lip liner', descEn: 'Defines the lip line and curbs feathering', brandsEn: ['CLIO', 'peripera', '3CE'] },
  ],
  eye: [
    { label: '아이섀도 팔레트', desc: '데일리부터 포인트까지 활용 가능한 구성', brands: ['클리오', '페리페라', '데이지크'], coupangQuery: '아이섀도 팔레트 데일리', clio: true, clioCategory: 'eye', labelEn: 'Eyeshadow palette', descEn: 'Versatile shades for daily and statement looks', brandsEn: ['CLIO', 'peripera', 'dasique'] },
    { label: '아이라이너', desc: '눈매를 또렷하게 잡아주는 펜슬/리퀴드', brands: ['클리오', '힌스', '롬앤'], coupangQuery: '펜슬 아이라이너 브라운', clio: true, clioCategory: 'eye', labelEn: 'Eyeliner', descEn: 'A pencil or liquid that sharpens the eye line', brandsEn: ['CLIO', 'hince', 'rom&nd'] },
  ],
  base: [
    { label: '쿠션 파운데이션', desc: '간편하게 커버와 광채를 동시에', brands: ['클리오', '에스쁘아', '헤라'], coupangQuery: '쿠션 파운데이션 커버', clio: true, clioCategory: 'base', labelEn: 'Cushion foundation', descEn: 'Coverage and glow in one quick step', brandsEn: ['CLIO', 'espoir', 'HERA'] },
    { label: '파운데이션', desc: '피부 톤과 결을 자연스럽게 정돈', brands: ['에스쁘아', '클리오', '롬앤'], coupangQuery: '파운데이션 세미매트', clio: true, clioCategory: 'base', labelEn: 'Foundation', descEn: 'Evens tone and texture naturally', brandsEn: ['espoir', 'CLIO', 'rom&nd'] },
  ],
  cheek: [
    { label: '블러셔', desc: '혈색을 더해 생기 있는 인상을 연출', brands: ['클리오', '롬앤', '페리페라'], coupangQuery: '블러셔 코랄 피치', clio: true, clioCategory: 'cheek', labelEn: 'Blush', descEn: 'Adds a healthy flush of color', brandsEn: ['CLIO', 'rom&nd', 'peripera'] },
  ],
  skincare: [
    { label: '수분 토너', desc: '메이크업 전 피부 결을 정돈하는 진정 케어', brands: ['토리든', '아누아', '라운드랩'], coupangQuery: '수분 토너 진정', clio: false, clioCategory: 'base', labelEn: 'Hydrating toner', descEn: 'Calms and preps skin texture before makeup', brandsEn: ['Torriden', 'Anua', 'Round Lab'] },
    { label: '기능성 세럼', desc: '기사에서 다룬 성분 트렌드를 담은 집중 케어', brands: ['넘버즈인', '토리든', '메디큐브'], coupangQuery: '비타민 세럼 진정', clio: false, clioCategory: 'base', labelEn: 'Targeted serum', descEn: 'A focused treatment built on the trending actives', brandsEn: ['numbuzin', 'Torriden', 'medicube'] },
  ],
  fragrance: [
    { label: '데일리 향수', desc: '가볍게 뿌리기 좋은 시그니처 데일리 향', brands: ['탬버린즈', '논픽션', '포멘트'], coupangQuery: '데일리 향수 우디', clio: false, clioCategory: 'main', labelEn: 'Everyday perfume', descEn: 'A light signature scent for daily wear', brandsEn: ['TAMBURINS', 'NONFICTION', 'forment'] },
  ],
  hair: [
    { label: '헤어 트리트먼트', desc: '손상모를 정돈하는 데일리 홈 케어', brands: ['미쟝센', '려', '아모스'], coupangQuery: '헤어 트리트먼트 손상', clio: false, clioCategory: 'main', labelEn: 'Hair treatment', descEn: 'Daily home care that smooths damaged strands', brandsEn: ['Mise en scène', 'Ryo', 'AMOS'] },
    { label: '스타일링 오일', desc: '푸석함을 잡고 윤기를 더하는 마무리', brands: ['미쟝센', '아모스', '로레알'], coupangQuery: '헤어 오일 윤기', clio: false, clioCategory: 'main', labelEn: 'Styling oil', descEn: 'Tames frizz and adds shine as a finish', brandsEn: ['Mise en scène', 'AMOS', 'L’Oréal'] },
  ],
  global: [
    { label: 'K-뷰티 베스트셀러 립', desc: '해외에서도 인기 높은 대표 K-립 제품', brands: ['롬앤', '라네즈', '클리오'], coupangQuery: '틴트 립 인기', clio: true, clioCategory: 'lip', labelEn: 'K-beauty bestseller lip', descEn: 'The K-lip products topping global charts', brandsEn: ['rom&nd', 'Laneige', 'CLIO'] },
    { label: 'K-뷰티 베스트셀러 스킨케어', desc: '아마존·세포라에서 검증된 K-스킨케어', brands: ['아누아', '메디큐브', '토리든'], coupangQuery: '수분 세럼 진정', clio: false, clioCategory: 'base', labelEn: 'K-beauty bestseller skincare', descEn: 'K-skincare proven on Amazon and Sephora', brandsEn: ['Anua', 'medicube', 'Torriden'] },
  ],
}
