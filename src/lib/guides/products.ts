import type { GuideCategory } from './types'
import type { ClioCategory } from '../../config/affiliate'

// Category-based product recommendations for guide pages.
// Search-keyword driven (no specific SKUs) — Korea-popular brands as a buying
// reference. Each guide automatically surfaces the box for its own category,
// so adding a new guide needs no extra product data.
//
// The *En fields are shown on /en/guides/* (locale === 'en'); the Coupang search
// query stays Korean because Coupang is a Korea-market store and these links
// target Korea-resident readers. Brand names are romanized for English readers.
export interface GuideProductRec {
  label: string // product type, e.g. "립 틴트"
  desc: string // one-line why-it-helps
  brands: string[] // 2~3 Korea-popular reference brands
  coupangQuery: string // Coupang search phrase (attribute-based)
  clio: boolean // also show the Clio official-store button
  clioCategory: ClioCategory
  labelEn: string
  descEn: string
  brandsEn: string[]
}

export const GUIDE_CATEGORY_PRODUCTS: Record<GuideCategory, GuideProductRec[]> = {
  basics: [
    { label: '수분 토너', desc: '메이크업 전 피부 결을 정돈하는 베이스 케어', brands: ['토리든', '아누아', '라운드랩'], coupangQuery: '수분 토너 진정', clio: false, clioCategory: 'base', labelEn: 'Hydrating toner', descEn: 'Smooths and preps skin texture before makeup', brandsEn: ['Torriden', 'Anua', 'Round Lab'] },
    { label: '메이크업 프라이머', desc: '모공·유분 잡아 화장 지속력을 높이는 첫 단계', brands: ['클리오', '에스쁘아', '롬앤'], coupangQuery: '메이크업 프라이머 모공', clio: true, clioCategory: 'base', labelEn: 'Makeup primer', descEn: 'Blurs pores and oil so makeup lasts longer', brandsEn: ['CLIO', 'espoir', 'rom&nd'] },
  ],
  // 퍼스널컬러 글은 "톤을 알았으니 뭘 사지?"로 끝난다 — 웜/쿨 양쪽에서 고를 수 있는 색조로 받는다.
  color: [
    { label: '립 틴트', desc: '웜톤은 코랄·오렌지, 쿨톤은 푸른기 핑크·베리로 고르면 실패가 적음', brands: ['롬앤', '페리페라', '클리오'], coupangQuery: '립틴트 코랄 베리', clio: true, clioCategory: 'lip', labelEn: 'Lip tint', descEn: 'Coral for warm tones, blue-pink or berry for cool', brandsEn: ['rom&nd', 'peripera', 'CLIO'] },
    { label: '블러셔', desc: '톤 판단을 얼굴에서 바로 확인해 볼 수 있는 색조', brands: ['클리오', '롬앤', '페리페라'], coupangQuery: '블러셔 코랄 핑크', clio: true, clioCategory: 'cheek', labelEn: 'Blush', descEn: 'The quickest way to see your undertone in action', brandsEn: ['CLIO', 'rom&nd', 'peripera'] },
  ],
  // 얼굴형 글은 헤어·윤곽 이야기로 끝난다 — 집에서 바로 시도할 수 있는 쪽으로 받는다.
  shape: [
    { label: '셰이딩 · 컨투어', desc: '얼굴형 보완을 메이크업으로 먼저 시험해 보는 가장 싼 방법', brands: ['클리오', '에스쁘아', '롬앤'], coupangQuery: '셰이딩 컨투어 파우더', clio: true, clioCategory: 'base', labelEn: 'Contour powder', descEn: 'The cheapest way to test face-shape balance before a haircut', brandsEn: ['CLIO', 'espoir', 'rom&nd'] },
    { label: '헤어 볼륨 제품', desc: '뿌리 볼륨은 얼굴 비율을 바꾸는 가장 빠른 레버', brands: ['미쟝센', '려', '아모스'], coupangQuery: '뿌리 볼륨 헤어', clio: false, clioCategory: 'main', labelEn: 'Root volume product', descEn: 'Root volume is the fastest lever on facial proportion', brandsEn: ['Mise en scène', 'Ryo', 'AMOS'] },
  ],
  perfume: [
    { label: '향수 시향 세트', desc: '한 병 지르기 전에 계열부터 좁히는 가장 안전한 순서', brands: ['조말론', '딥티크', '탬버린즈'], coupangQuery: '향수 미니 시향 세트', clio: false, clioCategory: 'main', labelEn: 'Discovery set', descEn: 'Narrow the family before committing to a full bottle', brandsEn: ['Jo Malone', 'Diptyque', 'tamburins'] },
  ],
  // 추구미 글은 "이 무드를 내 얼굴에 어떻게?"로 끝난다 — 무드를 가장 싸게 바꾸는 두 품목으로 받는다.
  style: [
    { label: '아이섀도 팔레트', desc: '무드를 가장 크게 바꾸는 단일 품목 — 청순/시크/글램이 여기서 갈림', brands: ['클리오', '데이지크', '페리페라'], coupangQuery: '아이섀도 팔레트 무드', clio: true, clioCategory: 'eye', labelEn: 'Eyeshadow palette', descEn: 'The single item that shifts your mood the most', brandsEn: ['CLIO', 'dasique', 'peripera'] },
    { label: '립 틴트', desc: '같은 얼굴도 립 하나로 인상이 바뀜 — 추구미 실험의 최저 비용', brands: ['롬앤', '페리페라', '클리오'], coupangQuery: '립틴트 무드 데일리', clio: true, clioCategory: 'lip', labelEn: 'Lip tint', descEn: 'The cheapest way to test a new mood on your face', brandsEn: ['rom&nd', 'peripera', 'CLIO'] },
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
  tpo: [
    { label: '데일리 메이크업 세트', desc: 'TPO에 맞춰 활용하기 좋은 기본 구성', brands: ['클리오', '페리페라', '롬앤'], coupangQuery: '데일리 메이크업 세트', clio: true, clioCategory: 'main', labelEn: 'Everyday makeup set', descEn: 'A core kit you can adapt to any occasion', brandsEn: ['CLIO', 'peripera', 'rom&nd'] },
  ],
  glasses: [
    { label: '마스카라', desc: '안경 속에서도 또렷한 눈매를 위한 컬링', brands: ['클리오', '힌스', '페리페라'], coupangQuery: '롱래쉬 마스카라 컬링', clio: true, clioCategory: 'eye', labelEn: 'Mascara', descEn: 'Curls and defines lashes even behind lenses', brandsEn: ['CLIO', 'hince', 'peripera'] },
    { label: '아이브로우', desc: '안경 프레임과 균형 잡는 자연 눈썹', brands: ['클리오', '롬앤', '에뛰드'], coupangQuery: '아이브로우 펜슬 브라운', clio: true, clioCategory: 'eye', labelEn: 'Brow pencil', descEn: 'Natural brows that balance your frames', brandsEn: ['CLIO', 'rom&nd', 'ETUDE'] },
  ],
  longevity: [
    { label: '메이크업 픽서', desc: '완성된 메이크업을 오래 고정하는 마무리', brands: ['클리오', '에스쁘아', '넘버즈인'], coupangQuery: '메이크업 픽서 미스트', clio: true, clioCategory: 'base', labelEn: 'Setting spray', descEn: 'Locks finished makeup in place', brandsEn: ['CLIO', 'espoir', 'numbuzin'] },
    { label: '모공 프라이머', desc: '유분·번짐을 잡아 지속력을 높이는 베이스', brands: ['클리오', '에스쁘아', '롬앤'], coupangQuery: '모공 프라이머 매트', clio: true, clioCategory: 'base', labelEn: 'Pore primer', descEn: 'Controls oil and shine for longer wear', brandsEn: ['CLIO', 'espoir', 'rom&nd'] },
  ],
  tools: [
    { label: '메이크업 브러시 세트', desc: '베이스·아이·치크를 정교하게 표현', brands: ['아르텔', '메이크온', '다이소'], coupangQuery: '메이크업 브러시 세트', clio: false, clioCategory: 'main', labelEn: 'Makeup brush set', descEn: 'Precise application for base, eyes, and cheeks', brandsEn: ['Artel', 'MAKEon', 'Daiso'] },
    { label: '뷰티 블렌더', desc: '베이스를 밀착감 있게 펴 발라주는 스펀지', brands: ['리얼테크닉', '뷰티블렌더', '다이소'], coupangQuery: '뷰티 블렌더 스펀지', clio: false, clioCategory: 'main', labelEn: 'Beauty sponge', descEn: 'Presses base into skin for a seamless finish', brandsEn: ['Real Techniques', 'beautyblender', 'Daiso'] },
  ],
}
