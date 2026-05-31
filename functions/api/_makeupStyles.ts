// ════════════════════════════════════════════════════════════════════
// AI 메이크업 스타일 정의 (단일 소스)
// ────────────────────────────────────────────────────────────────────
// 매년 글로벌 + K-뷰티 트렌드 갱신 시 **이 파일만** 수정하면 된다.
// 각 항목:
//   id          – 내부 식별자 (변경 시 과거 공유결과와의 호환 깨짐, 신중)
//   displayName – 결과 카드/공유에 노출되는 짧은 영문 라벨
//   seoName     – 이미지 alt·다운로드명·메타에 쓰는 긴 키워드(K-Beauty SEO)
//   type        – 'makeup'(화장만) | 'hair'(머리색만)
//   prompt      – 해당 스타일에서 **무엇을 바꾸는지**의 한국어 지시문.
//                 얼굴 보존(face-lock) 공통 프리앰블은 analyze.ts가 감싸므로
//                 여기엔 "적용할 메이크업/헤어"만 적는다.
//
// 구조상 9칸 그리드를 한 번에 생성하던 방식을 폐기하고, 원본 셀카 1장으로
// 항목당 1회 image-to-image 편집을 돌려 얼굴 동일성을 보존한다.
// (헤어 컬러는 글로벌 2026 유행색 고정)
// ════════════════════════════════════════════════════════════════════

export type StyleType = 'makeup' | 'hair'

export interface MakeupStyle {
  id: string
  displayName: string
  seoName: string
  type: StyleType
  prompt: string
}

// ── 여성 6종 (메이크업 5 + 헤어 1) ──
export const FEMALE_STYLES: MakeupStyle[] = [
  {
    id: 'glass-skin',
    displayName: 'Glass Skin Glow',
    seoName: 'K-Beauty Glass Skin Glow Makeup 2026',
    type: 'makeup',
    prompt: '2026 K-뷰티 클라우드 글로우. 투명하고 촉촉한 유리알 광채 베이스로 맑고 윤기 있는 피부를 표현. 은은한 핑크/피치 블러셔, 촉촉한 누드~피치 글로시 립. 과하지 않게 자연스러운 광이 도는 맑은 물광 피부.',
  },
  {
    id: 'blurred-lip',
    displayName: 'Blurred Tint Lip',
    seoName: 'K-Beauty Blurred Tint Lip Makeup',
    type: 'makeup',
    prompt: 'K-뷰티 블러드 틴트 립. 입술 중앙은 진하고 바깥으로 갈수록 흐려지는 로즈/코랄 그라데이션 틴트가 핵심. 입술 색이 사진에서 가장 먼저 눈에 띄어야 함. 깨끗하고 보송한 베이스에 은은한 아이 메이크업.',
  },
  {
    id: 'lingerie',
    displayName: 'Lingerie Makeup',
    seoName: 'Korean Lingerie Makeup 2026 Trend',
    type: 'makeup',
    prompt: '2026 트렌드 란제리 메이크업. 뮤트 베이지·로지 브라운 톤이 피부에 녹아드는 소프트 매트 베이스. 속옷처럼 은은하고 관능적인 뉴트럴 무드. 뮤트 베이지/누드 립, 브라운 톤 셰이딩과 차분한 아이.',
  },
  {
    id: 'lavender-lip',
    displayName: 'Glazed Lavender Lip',
    seoName: 'Glazed Lavender Lip Makeup 2026',
    type: 'makeup',
    prompt: '2026 신상 누드립 트렌드. 글레이즈드 라벤더/모브 톤의 글로시한 누드 립이 핵심. 차분한 라벤더 기운이 도는 뮤트 베이스, 클린하고 깔끔한 아이. 입술의 라벤더 글레이즈가 확실히 보여야 함.',
  },
  {
    id: 'kpop-idol',
    displayName: 'K-Pop Idol Makeup',
    seoName: 'K-Pop Idol Makeup Look',
    type: 'makeup',
    prompt: '제니/IVE 스타일 K-pop 아이돌 무대 메이크업. 유리알 광 베이스, 그라데이션 핑크 립, 콧대·광대·앞머리 라인에 쉬머 하이라이터. 또렷하고 화사한 아이. 무대 위 아이돌처럼 화려하되 얼굴은 그대로.',
  },
  {
    id: 'copper-hair',
    displayName: 'Copper Auburn Hair',
    seoName: 'Copper Auburn Hair Color 2026 Trend',
    type: 'hair',
    prompt: 'Copper Auburn (구리빛 어번/적갈색). 2026 글로벌 유행 헤어 컬러. 자연스럽고 윤기 있는 코퍼 어번 색조.',
  },
]

// ── 남성 6종 (메이크업 5 + 헤어 1) ──
export const MALE_STYLES: MakeupStyle[] = [
  {
    id: 'skincare-base',
    displayName: 'Skincare Glow Base',
    seoName: 'K-Beauty Skincare Glow Base Men',
    type: 'makeup',
    prompt: '남성 스킨케어 글로우 베이스. 이마·코끝·광대에 건강한 수분 광택이 도는 촉촉한 피부. 잡티·다크서클만 살짝 정돈, 무색 립밤. 피부결·모공·수염 자국은 유지하며 "원래 피부 좋은 남자" 느낌으로 과하지 않게.',
  },
  {
    id: 'no-makeup',
    displayName: 'No-Makeup Makeup',
    seoName: 'Korean No-Makeup Makeup Men',
    type: 'makeup',
    prompt: '한국식 노메이크업 메이크업(티 안 나는 정돈). 로우 콘트라스트로 자연스럽게. 피부결·모공·수염 자국 유지하되 매끈하게만 정리. 눈썹은 원본 형태 그대로 가지런히, 투명 립밤. 화장한 티가 거의 안 나야 함.',
  },
  {
    id: 'kpop-idol',
    displayName: 'K-Pop Idol Makeup',
    seoName: 'K-Pop Idol Makeup Men Look',
    type: 'makeup',
    prompt: '남자 아이돌 무대 메이크업. 유리알 글로우 베이스, 눈두덩에 은은한 핑크/피치 쉬머, 또렷하고 깔끔한 아이, 코랄 립 틴트, 콧대·광대 하이라이트. 무대 위 남돌처럼 화사하되 남성적인 얼굴은 그대로.',
  },
  {
    id: 'grunge-smoky',
    displayName: 'Grunge Smoky Eye',
    seoName: 'Grunge Smoky Eye Makeup 2026',
    type: 'makeup',
    prompt: '2026 그런지 부활. 눈두덩에 브라운+다크카키를 블렌딩한 스머지드 스모키 아이, 언더라인도 살짝 번지게. 립은 자연스러운 누드톤. 강렬하고 무드 있는 눈매가 포인트.',
  },
  {
    id: 'monochrome',
    displayName: 'Monochrome Makeup',
    seoName: 'Korean Monochrome Makeup Men',
    type: 'makeup',
    prompt: '톤온톤 모노크롬 미니멀 메이크업. 테라코타/피치 한 가지 톤으로 눈두덩·볼·입술을 통일감 있게. 따뜻한 톤이 얼굴 전체에 은은하게 감도는 정돈된 무드.',
  },
  {
    id: 'ash-brown-hair',
    displayName: 'Ash Brown Hair',
    seoName: 'Ash Brown Hair Color 2026 Trend',
    type: 'hair',
    prompt: 'Ash Brown (애쉬 브라운). 2026 글로벌 유행 헤어 컬러. 자연스럽고 차분한 애쉬 브라운 색조.',
  },
]

export function stylesForGender(gender: string): MakeupStyle[] {
  // analyze.ts는 한국어 성별 라벨('남성'/'여성')을 사용한다.
  return gender === '남성' || gender === 'male' ? MALE_STYLES : FEMALE_STYLES
}
