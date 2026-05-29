import type { GuideCategory } from './types'
import type { ClioCategory } from '../../config/affiliate'

// Category-based product recommendations for guide pages.
// Search-keyword driven (no specific SKUs) — Korea-popular brands as a buying
// reference. Each guide automatically surfaces the box for its own category,
// so adding a new guide needs no extra product data.
export interface GuideProductRec {
  label: string // product type, e.g. "립 틴트"
  desc: string // one-line why-it-helps
  brands: string[] // 2~3 Korea-popular reference brands
  coupangQuery: string // Coupang search phrase (attribute-based)
  clio: boolean // also show the Clio official-store button
  clioCategory: ClioCategory
}

export const GUIDE_CATEGORY_PRODUCTS: Record<GuideCategory, GuideProductRec[]> = {
  basics: [
    { label: '수분 토너', desc: '메이크업 전 피부 결을 정돈하는 베이스 케어', brands: ['토리든', '아누아', '라운드랩'], coupangQuery: '수분 토너 진정', clio: false, clioCategory: 'base' },
    { label: '메이크업 프라이머', desc: '모공·유분 잡아 화장 지속력을 높이는 첫 단계', brands: ['클리오', '에스쁘아', '롬앤'], coupangQuery: '메이크업 프라이머 모공', clio: true, clioCategory: 'base' },
  ],
  lip: [
    { label: '립 틴트', desc: 'MLBB 데일리 컬러로 활용도 높은 입술 표현', brands: ['롬앤', '페리페라', '클리오'], coupangQuery: 'MLBB 틴트 립', clio: true, clioCategory: 'lip' },
    { label: '립라이너', desc: '입술 윤곽을 또렷하게 잡아 번짐을 줄임', brands: ['클리오', '페리페라', '3CE'], coupangQuery: '립라이너 누드', clio: true, clioCategory: 'lip' },
  ],
  eye: [
    { label: '아이섀도 팔레트', desc: '데일리부터 포인트까지 활용 가능한 구성', brands: ['클리오', '페리페라', '데이지크'], coupangQuery: '아이섀도 팔레트 데일리', clio: true, clioCategory: 'eye' },
    { label: '아이라이너', desc: '눈매를 또렷하게 잡아주는 펜슬/리퀴드', brands: ['클리오', '힌스', '롬앤'], coupangQuery: '펜슬 아이라이너 브라운', clio: true, clioCategory: 'eye' },
  ],
  base: [
    { label: '쿠션 파운데이션', desc: '간편하게 커버와 광채를 동시에', brands: ['클리오', '에스쁘아', '헤라'], coupangQuery: '쿠션 파운데이션 커버', clio: true, clioCategory: 'base' },
    { label: '파운데이션', desc: '피부 톤과 결을 자연스럽게 정돈', brands: ['에스쁘아', '클리오', '롬앤'], coupangQuery: '파운데이션 세미매트', clio: true, clioCategory: 'base' },
  ],
  cheek: [
    { label: '블러셔', desc: '혈색을 더해 생기 있는 인상을 연출', brands: ['클리오', '롬앤', '페리페라'], coupangQuery: '블러셔 코랄 피치', clio: true, clioCategory: 'cheek' },
  ],
  tpo: [
    { label: '데일리 메이크업 세트', desc: 'TPO에 맞춰 활용하기 좋은 기본 구성', brands: ['클리오', '페리페라', '롬앤'], coupangQuery: '데일리 메이크업 세트', clio: true, clioCategory: 'main' },
  ],
  glasses: [
    { label: '마스카라', desc: '안경 속에서도 또렷한 눈매를 위한 컬링', brands: ['클리오', '힌스', '페리페라'], coupangQuery: '롱래쉬 마스카라 컬링', clio: true, clioCategory: 'eye' },
    { label: '아이브로우', desc: '안경 프레임과 균형 잡는 자연 눈썹', brands: ['클리오', '롬앤', '에뛰드'], coupangQuery: '아이브로우 펜슬 브라운', clio: true, clioCategory: 'eye' },
  ],
  longevity: [
    { label: '메이크업 픽서', desc: '완성된 메이크업을 오래 고정하는 마무리', brands: ['클리오', '에스쁘아', '넘버즈인'], coupangQuery: '메이크업 픽서 미스트', clio: true, clioCategory: 'base' },
    { label: '모공 프라이머', desc: '유분·번짐을 잡아 지속력을 높이는 베이스', brands: ['클리오', '에스쁘아', '롬앤'], coupangQuery: '모공 프라이머 매트', clio: true, clioCategory: 'base' },
  ],
  tools: [
    { label: '메이크업 브러시 세트', desc: '베이스·아이·치크를 정교하게 표현', brands: ['아르텔', '메이크온', '다이소'], coupangQuery: '메이크업 브러시 세트', clio: false, clioCategory: 'main' },
    { label: '뷰티 블렌더', desc: '베이스를 밀착감 있게 펴 발라주는 스펀지', brands: ['리얼테크닉', '뷰티블렌더', '다이소'], coupangQuery: '뷰티 블렌더 스펀지', clio: false, clioCategory: 'main' },
  ],
}
