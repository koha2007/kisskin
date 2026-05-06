// Makeup MBTI — 16 Type Definitions
// Research-informed mapping of MBTI dimensions to makeup preferences.
// References: euleraiapp.com (314-student Korean study), Dear Peachie 8-archetype system,
// marieclairekorea.com skin-MBTI editorial, Korean beauty trend reports 2024-2026.
//
// Axes interpretation for makeup:
//  E/I — Expression    : Expressive (bold, high-impact) vs Intimate (subtle, private glow)
//  N/S — Source        : Novel (experimental, trend-forward) vs Signature (curated, verified)
//  F/T — Feel          : Feel (blur/soft/mood) vs Technique (sharp/structured/precise)
//  P/J — Routine       : Playful (mood-driven, flexible) vs Journal (consistent, formulaic)

export type MbtiCode =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP'

export interface MakeupMbtiType {
  code: MbtiCode
  slug: string                     // lowercased for URL
  emoji: string
  koName: string                   // 한글 페르소나 이름
  enName: string                   // 영문 페르소나 이름
  tagline: string                  // 한 줄 슬로건
  axisScores: {
    e: number // 0..100, higher = more Expressive
    n: number // 0..100, higher = more Novel
    f: number // 0..100, higher = more Feel-driven
    p: number // 0..100, higher = more Playful
  }
  primaryColor: string             // hex for UI theming
  accentColor: string
  shortDesc: string                // 2~3 sentences, used in cards
  detailParagraphs: string[]       // 3-5 paragraphs, each 80-150 words — SEO body
  traits: { icon: string; title: string; desc: string }[] // exactly 3
  signature: {
    lip: string
    eye: string
    base: string
    blush: string
  }
  // Mapping to kissinskin's existing 9 women / 9 men styles
  // Values must match the existing style folder or label used in HomePage.tsx
  recommended: {
    women: { primary: string; secondary: string; reason: string }
    men: { primary: string; secondary: string; reason: string }
  }
  // Relationships with other MBTI types
  goodMatch: MbtiCode              // 서로 영감을 주는 유형
  opposite: MbtiCode               // 완전 반대 스타일이지만 배울 점이 있음
  // Real-world cues (generic, not real-name endorsements)
  vibes: string[]                  // 3~5 단어: '에디토리얼', '런웨이', '스튜디오' 등
  avoidTip: string                 // 이 유형이 피하면 좋은 스타일 함정
  boostTip: string                 // 이 유형이 더 강점을 살릴 팁
}

/* =====================================================
 * 16 TYPE DATA
 * All descriptions are original content written for kissinskin.
 * Distribution across 4 meta-groups: NT / NF / SJ / SP
 * ===================================================== */

export const MAKEUP_MBTI_TYPES: Record<MbtiCode, MakeupMbtiType> = {
  /* ============ NT (분석가 계열) ============ */
  INTJ: {
    code: 'INTJ',
    slug: 'intj',
    emoji: '🖤',
    koName: '메탈릭 전략가',
    enName: 'The Architect',
    tagline: '완성된 설계도처럼 정확한 메탈릭 시그니처',
    axisScores: { e: 65, n: 55, f: 30, p: 20 },
    primaryColor: '#2a2a2a',
    accentColor: '#c9a961',
    shortDesc: 'INTJ의 메이크업은 잘 설계된 건축물을 닮았습니다. 절제된 배경 위에 메탈릭 아이나 샤프한 립 하나로 존재감을 완성하는 "계산된 강렬함"이 시그니처입니다.',
    detailParagraphs: [
      'INTJ의 메이크업은 정교한 시스템입니다. 메탈릭 아이·매트 베이스·검증된 누드 립의 최소 구성으로 "계산된 강렬함"을 완성하며, 즉흥보다 리허설된 일관성을 편안해합니다.',
    ],
    traits: [
      { icon: 'architecture', title: '구조적 설계', desc: '포인트 위치와 각도를 계산해서 배치합니다.' },
      { icon: 'gavel', title: '검증된 고정', desc: '한 번 만족한 제품을 오래 재구매합니다.' },
      { icon: 'diamond', title: '미니멀 존재감', desc: '최소 요소로 최대 임팩트를 만듭니다.' },
    ],
    signature: { lip: 'MLBB 베이지 누드', eye: '건메탈 메탈릭', base: '세미매트', blush: '내추럴 코랄' },
    recommended: {
      women: {
        primary: 'Metallic Eye',
        secondary: 'Blood Lip',
        reason: '메탈릭 아이의 정교한 포인트가 INTJ의 "계산된 강렬함"과 정확히 맞물립니다.',
      },
      men: {
        primary: 'Monochrome',
        secondary: 'Utility Makeup',
        reason: '단일 톤으로 정돈된 모노크롬 룩이 절제된 설계 감각과 이상적으로 어울립니다.',
      },
    },
    goodMatch: 'ENTP',
    opposite: 'ESFP',
    vibes: ['에디토리얼', '스튜디오', '아키텍처', '이브닝'],
    avoidTip: '블러·번짐이 과한 소프트 무드 — 설계의 경계가 흐려져 불편해집니다.',
    boostTip: '계절에 한 번 포인트 컬러(레드/플럼/에메랄드 등)로 공식을 업데이트해 보세요.',
  },

  INTP: {
    code: 'INTP',
    slug: 'intp',
    emoji: '🧪',
    koName: '컬러 연금술사',
    enName: 'The Alchemist',
    tagline: '예상 밖 컬러 조합을 실험하는 이론가',
    axisScores: { e: 55, n: 85, f: 40, p: 70 },
    primaryColor: '#4a5568',
    accentColor: '#9f7aea',
    shortDesc: 'INTP의 메이크업은 실험실입니다. 남들이 시도하지 않는 컬러 조합을 분석적으로 탐구하고, "왜 이 조합이 말이 되는가"를 스스로 해석합니다.',
    detailParagraphs: [
      'INTP의 메이크업은 컬러 실험실입니다. 모스·바이올렛·오렌지 브라운 같은 비관습 컬러를 언더라인·이너 코너에 던져 전체 해석을 바꾸는 개념적 포인트가 시그니처입니다.',
    ],
    traits: [
      { icon: 'science', title: '컬러 실험', desc: '관습을 의심하고 새로운 조합을 분석합니다.' },
      { icon: 'layers', title: '레이어 해석', desc: '언더라인·이너코너 등 비관습 위치에 포인트.' },
      { icon: 'hub', title: '개인 이론', desc: '모든 선택에 자기만의 해석이 있습니다.' },
    ],
    signature: { lip: '모카 브라운', eye: '언더라인 바이올렛', base: '내추럴 글로우', blush: '코럴 오렌지' },
    recommended: {
      women: {
        primary: 'Maximalist Eye',
        secondary: 'Metallic Eye',
        reason: '비관습적 컬러 레이어링을 실험할 여지가 가장 넓은 스타일입니다.',
      },
      men: {
        primary: 'Color Point Eye',
        secondary: 'Grunge Smoky Eye',
        reason: '부분 포인트로 "생각하게 하는" 룩을 완성하는 데 최적화된 구성입니다.',
      },
    },
    goodMatch: 'ENTJ',
    opposite: 'ESFJ',
    vibes: ['컨셉추얼', '아트', '에디토리얼', '얼터너티브'],
    avoidTip: '트렌드를 무비판적으로 따라가는 풀메이크업 — INTP의 해석 없이 그대로면 의미가 사라집니다.',
    boostTip: '룩당 컬러 3가지 이하 규칙. 실험의 지적 매력을 지키면서 완성도를 올립니다.',
  },

  ENTJ: {
    code: 'ENTJ',
    slug: 'entj',
    emoji: '♠️',
    koName: '파워 레드',
    enName: 'The Commander',
    tagline: '한 번의 레드 립으로 회의실을 장악한다',
    axisScores: { e: 90, n: 50, f: 25, p: 25 },
    primaryColor: '#8b0000',
    accentColor: '#d4a574',
    shortDesc: 'ENTJ에게 메이크업은 "퍼포먼스 도구"입니다. 또렷한 레드 립, 구조적인 아이라인, 선명한 윤곽 — 공간을 장악하는 파워풀한 시그니처가 본질입니다.',
    detailParagraphs: [
      'ENTJ에게 메이크업은 인상 설계 도구입니다. 또렷한 레드 립·매트 베이스·확실한 아이라인 — 5분 이내 완성되는 짧은 루틴과 한 방의 명확한 임팩트가 핵심입니다.',
    ],
    traits: [
      { icon: 'bolt', title: '한 방 임팩트', desc: '복잡한 레이어 대신 명확한 포인트 하나로 승부.' },
      { icon: 'schedule', title: '5분 효율', desc: '짧은 루틴, 고가치 아이템에 집중 투자.' },
      { icon: 'military_tech', title: '퍼포먼스 도구', desc: '메이크업을 인상 설계의 도구로 활용.' },
    ],
    signature: { lip: '클래식 레드', eye: '블랙 리퀴드 라인', base: '세미매트', blush: '로즈 우드' },
    recommended: {
      women: {
        primary: 'Bold Lip',
        secondary: 'Blood Lip',
        reason: '명확한 레드 포인트 하나로 공간을 장악하는 ENTJ의 본질과 일치합니다.',
      },
      men: {
        primary: 'Utility Makeup',
        secondary: 'Monochrome',
        reason: '기능적이고 군더더기 없는 정돈이 실용주의 성향과 가장 잘 맞습니다.',
      },
    },
    goodMatch: 'INTP',
    opposite: 'ISFP',
    vibes: ['파워슈트', '회의실', '이그제큐티브', '런웨이'],
    avoidTip: '글리터·과한 글로우 — 전문성 신호가 희석됩니다.',
    boostTip: '주 1회 소프트 블러쉬나 립 틴트로 "다가가기 쉬움"을 의도적으로 설계하세요.',
  },

  ENTP: {
    code: 'ENTP',
    slug: 'entp',
    emoji: '⚡',
    koName: '아이디어 런웨이',
    enName: 'The Trendsetter',
    tagline: '매주 다른 실험, 그게 나의 시그니처',
    axisScores: { e: 80, n: 95, f: 45, p: 80 },
    primaryColor: '#e53e3e',
    accentColor: '#f6e05e',
    shortDesc: 'ENTP의 "일관성"은 "일관되게 다름"입니다. 이번 주는 그런지 스모키, 다음 주는 파스텔 이너글로우. 매번 다른 실험 그 자체가 시그니처입니다.',
    detailParagraphs: [
      'ENTP는 같은 룩을 두 번 반복하지 않는 실험가입니다. 매주 다른 트렌드를 가장 먼저 시도하고 자기 버전으로 변주하는 그런지·맥시멀리스트가 시그니처입니다.',
    ],
    traits: [
      { icon: 'bolt', title: '즉시 실험', desc: '트렌드를 가장 먼저 시도하고 자기 것으로 변주.' },
      { icon: 'palette', title: '월간 테마', desc: '한 달 단위로 컬러 팔레트를 전면 교체.' },
      { icon: 'all_inclusive', title: '크로스 장르', desc: '그런지+파스텔 같은 모순된 조합도 시도.' },
    ],
    signature: { lip: '블러드 틴트', eye: '번진 스모키', base: '글로시', blush: '번진 레드 블러쉬' },
    recommended: {
      women: {
        primary: 'Grunge Makeup',
        secondary: 'Maximalist Eye',
        reason: '완벽을 부수는 그런지의 철학이 ENTP의 실험 정신과 완벽하게 일치합니다.',
      },
      men: {
        primary: 'Grunge Smoky Eye',
        secondary: 'Color Point Eye',
        reason: '실험성과 대중성의 교집합을 정확히 포착해 "아이디어 런웨이"가 완성됩니다.',
      },
    },
    goodMatch: 'INTJ',
    opposite: 'ISTJ',
    vibes: ['스트리트', '패션위크', '바이럴', '얼터너티브'],
    avoidTip: '한 룩에 트렌드 요소 4개 이상을 섞지 말 것. 파편적으로 보입니다.',
    boostTip: '한 테마를 최소 2주 유지하며 디테일을 다듬으면 완성도가 급상승합니다.',
  },

  /* ============ NF (이상주의자 계열) ============ */
  INFJ: {
    code: 'INFJ',
    slug: 'infj',
    emoji: '🌙',
    koName: '몽환 시인',
    enName: 'The Dreamweaver',
    tagline: '블러 무드로 조용히 내면을 그립니다',
    axisScores: { e: 30, n: 70, f: 85, p: 35 },
    primaryColor: '#6b46c1',
    accentColor: '#fbb6ce',
    shortDesc: 'INFJ의 메이크업은 내면의 무드를 그림처럼 번지게 합니다. 블러 블러쉬, 소프트 글로우, 번진 틴트 — 경계가 부드러운 감성 메이크업이 시그니처입니다.',
    detailParagraphs: [
      'INFJ의 메이크업은 감정의 그림자입니다. 또렷한 포인트보다 부드럽게 번진 경계, 강한 컬러보다 채도가 낮은 무드 컬러로 얼굴 전체를 하나의 무드에 녹여냅니다.',
    ],
    traits: [
      { icon: 'blur_on', title: '경계의 번짐', desc: '또렷한 선보다 자연스럽게 번진 경계를 선호.' },
      { icon: 'favorite', title: '브랜드 서사', desc: '제품 뒤의 이야기와 철학에 반응합니다.' },
      { icon: 'self_improvement', title: '조율 의식', desc: '메이크업이 하루를 조율하는 작은 명상입니다.' },
    ],
    signature: { lip: '블러드 번짐 틴트', eye: '라벤더 모브', base: '클라우드 스킨', blush: '라일락 소프트' },
    recommended: {
      women: {
        primary: 'Blush Draping',
        secondary: 'Cloud Skin',
        reason: '얼굴 전체를 하나의 무드로 연결하는 드레이핑이 내면의 감정선과 일치합니다.',
      },
      men: {
        primary: 'Blurred Lip',
        secondary: 'Skincare Hybrid',
        reason: '경계가 번진 부드러운 립이 INFJ 특유의 내밀한 감성을 잘 전달합니다.',
      },
    },
    goodMatch: 'ENFP',
    opposite: 'ESTP',
    vibes: ['몽환', '문학적', '무드보드', '달빛'],
    avoidTip: '강한 매트 풀메이크업 — 감성이 차갑게 읽힐 수 있습니다.',
    boostTip: '월 1~2회 의도적으로 볼드 립을 시도해 감성에 선명함을 더하세요.',
  },

  INFP: {
    code: 'INFP',
    slug: 'infp',
    emoji: '✨',
    koName: '별빛 화가',
    enName: 'The Stargazer',
    tagline: '파스텔 글리터와 꿈같은 판타지',
    axisScores: { e: 45, n: 80, f: 90, p: 75 },
    primaryColor: '#d53f8c',
    accentColor: '#b794f4',
    shortDesc: 'INFP의 메이크업은 판타지 일러스트를 닮았습니다. 파스텔 글리터, 로맨틱한 립, 꿈 같은 글로우 — 현실 너머의 로맨스를 한 폭의 그림처럼 구현합니다.',
    detailParagraphs: [
      'INFP의 메이크업은 판타지 일러스트입니다. 파스텔 글리터·로맨틱 립·꿈 같은 글로우로 추상적 영감을 컬러로 번역하는 별빛 화가의 시그니처입니다.',
    ],
    traits: [
      { icon: 'auto_stories', title: '이야기 번역', desc: '추상적 영감을 구체적 컬러로 옮깁니다.' },
      { icon: 'auto_awesome', title: '글리터 사랑', desc: '파스텔 글리터로 꿈 같은 반짝임을 추구.' },
      { icon: 'collections', title: '감정 수집', desc: '필수가 아닌 기쁨을 위해 컬러를 모읍니다.' },
    ],
    signature: { lip: '글로시 피치', eye: '샴페인 글리터', base: '듀이 글로우', blush: '베이비 핑크' },
    recommended: {
      women: {
        primary: 'Metallic Eye',
        secondary: 'Blush Draping',
        reason: '파스텔 글리터로 변주한 메탈릭이 판타지 감성을 가장 자연스럽게 표현합니다.',
      },
      men: {
        primary: 'Vampire Romantic',
        secondary: 'Blurred Lip',
        reason: '다크 판타지와 내면 서사를 동시에 담는 로맨틱 계열과 완벽한 궁합입니다.',
      },
    },
    goodMatch: 'ENFJ',
    opposite: 'ESTJ',
    vibes: ['판타지', '빈티지', '몽환', '로맨틱'],
    avoidTip: '한 룩에 글리터 여러 지점 + 컬러 여러 개 = 파편화됩니다.',
    boostTip: '글리터 1지점 + 컬러 포인트 1개 규칙으로 일상성과 로맨스의 균형을 맞추세요.',
  },

  ENFJ: {
    code: 'ENFJ',
    slug: 'enfj',
    emoji: '🌸',
    koName: '뮤즈',
    enName: 'The Muse',
    tagline: '주변에 영감을 주는 따뜻한 빛',
    axisScores: { e: 75, n: 60, f: 80, p: 40 },
    primaryColor: '#ed8936',
    accentColor: '#fbd38d',
    shortDesc: 'ENFJ의 메이크업은 주변에 온기를 전합니다. 피치 블러쉬, 따뜻한 코랄 립, 내추럴 글로우 — 따뜻한 존재감이 시그니처입니다.',
    detailParagraphs: [
      'ENFJ는 메이크업으로 온기를 전합니다. 피치 블러쉬·코랄 블러드 틴트·내추럴 글로우 — 상대가 편안한 인상을 만드는 따뜻한 존재감이 시그니처입니다.',
    ],
    traits: [
      { icon: 'favorite', title: '온기 설계', desc: '웜톤 중심으로 상대가 편안한 인상을 만듭니다.' },
      { icon: 'diversity_3', title: '공유 루틴', desc: '친구와 제품 정보를 교환하는 걸 즐깁니다.' },
      { icon: 'wb_sunny', title: '균형 타임', desc: '20~25분의 딱 균형 잡힌 루틴.' },
    ],
    signature: { lip: '코랄 블러드 틴트', eye: '소프트 브라운', base: '글로우', blush: '피치 코랄' },
    recommended: {
      women: {
        primary: 'Natural Glow',
        secondary: 'Blood Lip',
        reason: '따뜻한 글로우와 안에서 붉은 듯한 립이 ENFJ의 온기 가득한 인상을 완성합니다.',
      },
      men: {
        primary: 'Kpop Idol Makeup',
        secondary: 'Skincare Hybrid',
        reason: '친근함과 카리스마의 균형이 ENFJ 특유의 "대중적 매력"과 일치합니다.',
      },
    },
    goodMatch: 'INFP',
    opposite: 'ISTP',
    vibes: ['따뜻함', '글로우', '커뮤니티', '선데이 브런치'],
    avoidTip: '차가운 매트 계열만 고집하면 ENFJ의 본질인 온기가 사라집니다.',
    boostTip: '중요한 자리엔 의도적 레드 립 — 리더십과 온기를 동시에 보여주세요.',
  },

  ENFP: {
    code: 'ENFP',
    slug: 'enfp',
    emoji: '🎨',
    koName: '오늘의 팔레트',
    enName: "Today's Palette",
    tagline: '기분 따라 컬러를 바꾸는 자유로운 화가',
    axisScores: { e: 80, n: 85, f: 75, p: 90 },
    primaryColor: '#f56565',
    accentColor: '#f6ad55',
    shortDesc: 'ENFP는 매일 다른 팔레트입니다. 오늘은 오렌지 아이, 내일은 모브 립 — 기분과 에너지에 따라 컬러가 춤추는 게 시그니처입니다.',
    detailParagraphs: [
      'ENFP는 매일 다른 팔레트입니다. 그날의 기분·날씨·사람에 반응해 컬러가 결정되는 즉흥과 다양성, 한 눈에 3-4가지 컬러 레이어링이 시그니처입니다.',
    ],
    traits: [
      { icon: 'palette', title: '일일 팔레트', desc: '매일 컬러 스킴을 새로 고릅니다.' },
      { icon: 'auto_awesome', title: '감정 컬러', desc: '기분이 컬러 선택의 1순위 기준입니다.' },
      { icon: 'shuffle', title: '즉흥 스타일링', desc: '정해진 순서·아이템 없이 자유롭게 조합.' },
    ],
    signature: { lip: '변동 — 코랄/플럼/모브', eye: '레이어드 컬러', base: '글로우', blush: '컬러 매치 블러쉬' },
    recommended: {
      women: {
        primary: 'Maximalist Eye',
        secondary: 'Metallic Eye',
        reason: '레이어드 컬러 아이가 ENFP의 다채로운 감정 에너지를 가장 잘 표현합니다.',
      },
      men: {
        primary: 'Color Point Eye',
        secondary: 'Kpop Idol Makeup',
        reason: '날마다 다른 컬러 포인트로 기분을 표현하는 자유로움과 완벽하게 맞물립니다.',
      },
    },
    goodMatch: 'INFJ',
    opposite: 'ISTJ',
    vibes: ['자유', '카니발', '플레이풀', '크리에이티브'],
    avoidTip: '매일 모든 것을 리셋하지 말 것 — 선택 피로로 지각합니다.',
    boostTip: '느슨한 요일 공식 (월=코랄, 수=플럼)으로 자유+효율을 동시에 잡으세요.',
  },

  /* ============ SJ (전통주의자 계열) ============ */
  ISTJ: {
    code: 'ISTJ',
    slug: 'istj',
    emoji: '🌿',
    koName: '정석 장인',
    enName: 'The Classicist',
    tagline: '검증된 루틴, 10년짜리 내추럴 공식',
    axisScores: { e: 30, n: 20, f: 40, p: 15 },
    primaryColor: '#38a169',
    accentColor: '#d69e2e',
    shortDesc: 'ISTJ의 메이크업은 검증된 정석입니다. 같은 내추럴 루틴을 수년간 유지하며, 피부 본연의 건강한 톤을 정직하게 드러내는 것이 시그니처입니다.',
    detailParagraphs: [
      'ISTJ의 메이크업은 검증된 정석입니다. 10년짜리 내추럴 글로우 공식·MLBB 로즈 립·같은 루틴의 일관성으로 피부 본연의 건강함을 정직하게 드러냅니다.',
    ],
    traits: [
      { icon: 'verified', title: '검증 우선', desc: '수년간 재구매한 아이템으로 루틴을 고정.' },
      { icon: 'savings', title: '절약 운영', desc: '제품을 끝까지 사용하는 신중한 소비.' },
      { icon: 'eco', title: '본연의 톤', desc: '피부 본연의 건강함이 핵심 목표.' },
    ],
    signature: { lip: 'MLBB 로즈', eye: '내추럴 브라운', base: '세미매트', blush: '살구 코랄' },
    recommended: {
      women: {
        primary: 'Natural Glow',
        secondary: 'Cloud Skin',
        reason: '피부 본연의 건강함을 정직하게 드러내는 내추럴 글로우가 정석 장인 스타일의 본질입니다.',
      },
      men: {
        primary: 'No-Makeup Makeup',
        secondary: 'Skincare Hybrid',
        reason: '화장한 듯 안 한 듯한 스타일이 ISTJ의 정직함·성실함과 완벽하게 맞물립니다.',
      },
    },
    goodMatch: 'ESFJ',
    opposite: 'ENFP',
    vibes: ['클래식', '단정', '성실', '일상'],
    avoidTip: '트렌드를 억지로 따라가다 얼굴이 어색해지는 순간 — 본인 공식이 최우선.',
    boostTip: '계절마다 립 컬러 한 톤만 변주 — 신뢰성은 유지, 새로움은 확보.',
  },

  ISFJ: {
    code: 'ISFJ',
    slug: 'isfj',
    emoji: '🌷',
    koName: '온기 수호자',
    enName: 'The Warm Guardian',
    tagline: '촉촉 글로우로 감싸는 포근함',
    axisScores: { e: 35, n: 25, f: 75, p: 25 },
    primaryColor: '#ed64a6',
    accentColor: '#fbb6ce',
    shortDesc: 'ISFJ의 메이크업은 포근한 담요 같습니다. 촉촉한 클라우드 스킨, 연한 핑크 블러쉬, 은은한 립 틴트 — 누구에게도 부담 없는 따뜻함이 시그니처입니다.',
    detailParagraphs: [
      'ISFJ의 메이크업은 포근한 담요입니다. 클라우드 스킨·연한 핑크 블러쉬·은은한 틴트 립으로 누구에게도 부담 없는 따뜻함을 만드는 돌봄의 미학입니다.',
    ],
    traits: [
      { icon: 'shower', title: '피부 결 우선', desc: '색조보다 피부 질감이 기준입니다.' },
      { icon: 'spa', title: '조용한 의식', desc: '루틴 자체가 하루를 여는 치유입니다.' },
      { icon: 'healing', title: '순한 선택', desc: '저자극·무향·순성분 제품을 신뢰합니다.' },
    ],
    signature: { lip: '로즈 핑크 틴트', eye: '아이보리 핑크', base: '클라우드 스킨', blush: '베이비 피치' },
    recommended: {
      women: {
        primary: 'Cloud Skin',
        secondary: 'Natural Glow',
        reason: '부드럽게 빛나는 구름 피부가 ISFJ의 "포근한 돌봄" 철학을 시각적으로 구현합니다.',
      },
      men: {
        primary: 'Skincare Hybrid',
        secondary: 'No-Makeup Makeup',
        reason: '색조보다 피부결에 집중하는 접근이 돌봄의 본질과 완벽하게 일치합니다.',
      },
    },
    goodMatch: 'ESTP',
    opposite: 'ENTP',
    vibes: ['포근함', '핑크 라떼', '스파 데이', '코지'],
    avoidTip: '너무 옅어서 사진에서 피부와 구분 안 되는 톤 — 혈색감은 꼭 남기세요.',
    boostTip: '특별한 날엔 립 채도 한 단계 업. 포근함은 유지, 인상은 또렷해집니다.',
  },

  ESTJ: {
    code: 'ESTJ',
    slug: 'estj',
    emoji: '🍷',
    koName: '공식의 지휘자',
    enName: 'The Director',
    tagline: '단정한 레드와 공식 자리의 정석',
    axisScores: { e: 70, n: 25, f: 30, p: 20 },
    primaryColor: '#9b2c2c',
    accentColor: '#c05621',
    shortDesc: 'ESTJ의 메이크업은 공식 자리의 정석입니다. 단정한 레드 립, 또렷한 눈썹, 깔끔한 베이스 — 신뢰감 있는 인상 설계가 시그니처입니다.',
    detailParagraphs: [
      'ESTJ에게 메이크업은 역할 수행입니다. 단정한 블러드 레드 립·또렷한 브라운 아이라인·세미매트 베이스 — 공식 자리의 정답을 15분 안에 정확히 구현합니다.',
    ],
    traits: [
      { icon: 'task_alt', title: '상황별 공식', desc: '각 자리에 맞는 정답 룩을 갖고 있습니다.' },
      { icon: 'schedule', title: '15분 정확', desc: '체계적이고 효율적인 완성 루틴.' },
      { icon: 'inventory', title: '재고 관리', desc: '떨어지기 전 미리 재구매합니다.' },
    ],
    signature: { lip: '블러드 레드', eye: '브라운 아이라인', base: '세미매트', blush: '로즈 우드' },
    recommended: {
      women: {
        primary: 'Blood Lip',
        secondary: 'Bold Lip',
        reason: '단정하면서도 존재감 있는 레드가 ESTJ의 "신뢰받는 정석"을 완성합니다.',
      },
      men: {
        primary: 'Monochrome',
        secondary: 'Utility Makeup',
        reason: '체계적이고 정돈된 모노크롬 룩이 공식적 미감과 이상적으로 맞물립니다.',
      },
    },
    goodMatch: 'ISTJ',
    opposite: 'INFP',
    vibes: ['공식', '이그제큐티브', '클래식', '와이너리'],
    avoidTip: '너무 경직된 룩만 고집하면 다가가기 어려운 인상이 됩니다.',
    boostTip: '주말엔 소프트 립 틴트 — 신뢰감에 인간적 면모를 더합니다.',
  },

  ESFJ: {
    code: 'ESFJ',
    slug: 'esfj',
    emoji: '🌟',
    koName: '모임의 주연',
    enName: 'The Hostess',
    tagline: '자리마다 가장 어울리는 K-아이돌 룩',
    axisScores: { e: 85, n: 50, f: 70, p: 30 },
    primaryColor: '#ec4899',
    accentColor: '#fbbf24',
    shortDesc: 'ESFJ는 어디서든 모임의 중심입니다. 트렌디한 K-pop 아이돌 룩, 친근한 핑크 블러쉬, 반짝이는 립 — 자리에 맞춘 사랑스러움이 시그니처입니다.',
    detailParagraphs: [
      'ESFJ는 자리마다 다른 룩을 정확히 매칭합니다. K-pop 아이돌 룩의 글로우 베이스·핑크 골드 아이·시어 로즈 립으로 트렌드와 친근함의 균형을 잡는 모임의 주연입니다.',
    ],
    traits: [
      { icon: 'groups', title: 'TPO 마스터', desc: '자리에 맞는 완성도 조율이 탁월합니다.' },
      { icon: 'trending_up', title: '트렌드 감각', desc: '유행과 클래식을 균형 있게 조합.' },
      { icon: 'mood', title: '친근한 무대', desc: '친근함과 무대성의 교집합이 시그니처.' },
    ],
    signature: { lip: '시어 로즈', eye: '핑크 골드', base: '글로우', blush: '피치 핑크' },
    recommended: {
      women: {
        primary: 'Kpop Idol Makeup',
        secondary: 'Natural Glow',
        reason: 'K-pop 아이돌 룩이 트렌드·친근함·무대성의 3박자를 한 번에 담습니다.',
      },
      men: {
        primary: 'Kpop Idol Makeup',
        secondary: 'Skincare Hybrid',
        reason: '대중적 매력과 세련된 디테일의 균형이 ESFJ의 본질과 정확히 일치합니다.',
      },
    },
    goodMatch: 'ISTJ',
    opposite: 'INTP',
    vibes: ['K-pop', '파티', '생일', '프렌들리'],
    avoidTip: '주변 기대만 따라가다 본인 취향이 사라지는 지점을 경계하세요.',
    boostTip: '월 1회 "내 취향의 날" — 주변보다 본인을 먼저 두세요.',
  },

  /* ============ SP (장인·모험가 계열) ============ */
  ISTP: {
    code: 'ISTP',
    slug: 'istp',
    emoji: '⚙️',
    koName: '미니멀 장인',
    enName: 'The Minimalist',
    tagline: '필요한 만큼만, 그 이상은 낭비',
    axisScores: { e: 25, n: 40, f: 20, p: 60 },
    primaryColor: '#4a5568',
    accentColor: '#a0aec0',
    shortDesc: 'ISTP의 메이크업은 엔지니어링입니다. 3분 이내 완성되는 최소 루틴, 기능 중심 아이템, 불필요한 단계 제로 — 효율의 미학이 시그니처입니다.',
    detailParagraphs: [
      'ISTP의 메이크업은 엔지니어링입니다. 3-5분 안에 완성되는 멀티 유즈 스틱·BB 크림·틴트 립밤의 최소 구성, 불필요한 단계 제로의 효율 미학이 시그니처입니다.',
    ],
    traits: [
      { icon: 'settings', title: '엔지니어링', desc: '단계를 분해하고 불필요한 것을 제거합니다.' },
      { icon: 'auto_fix_high', title: '멀티 유즈', desc: '한 제품이 여러 역할을 하는 아이템 선호.' },
      { icon: 'timer', title: '3~5분', desc: '보유량 10개 이내, 루틴 5분 이내.' },
    ],
    signature: { lip: '틴트 립밤', eye: '없음 또는 마스카라 한 번', base: 'BB 크림 세미매트', blush: '없음' },
    recommended: {
      women: {
        primary: 'Natural Glow',
        secondary: 'Cloud Skin',
        reason: '최소 터치로 피부 본연을 정돈하는 접근이 ISTP의 효율 철학과 완벽하게 맞물립니다.',
      },
      men: {
        primary: 'No-Makeup Makeup',
        secondary: 'Utility Makeup',
        reason: '불필요한 단계를 제거한 기능 중심 메이크업이 엔지니어링 성향의 본질입니다.',
      },
    },
    goodMatch: 'ESTJ',
    opposite: 'ENFJ',
    vibes: ['미니멀', '기능주의', '투어', '어반'],
    avoidTip: '기능만 있고 매력 신호 제로인 날들 — 행사엔 포인트 하나 추가.',
    boostTip: '월 1~2회 강한 포인트 실험 — 숨은 강단을 세상에 보여주세요.',
  },

  ISFP: {
    code: 'ISFP',
    slug: 'isfp',
    emoji: '🍃',
    koName: '꾸안꾸 아티스트',
    enName: 'The Soft Artist',
    tagline: '힘 빼고, 그러나 감성은 가득',
    axisScores: { e: 40, n: 55, f: 80, p: 75 },
    primaryColor: '#48bb78',
    accentColor: '#f6ad55',
    shortDesc: 'ISFP의 메이크업은 꾸안꾸의 정석입니다. 촉촉한 피부, 흐릿한 립 틴트, 자연스러운 속눈썹 — 힘은 뺐지만 감성은 가득한 스타일이 시그니처입니다.',
    detailParagraphs: [
      'ISFP의 메이크업은 꾸안꾸의 정석입니다. 클라우드 스킨·번진 체리 틴트·내추럴 마스카라 — 힘은 뺐지만 자세히 보면 디테일이 살아있는 섬세한 감각이 시그니처입니다.',
    ],
    traits: [
      { icon: 'nature', title: '꾸안꾸', desc: '한 듯 안 한 듯한 자연스러움이 기준.' },
      { icon: 'brush', title: '섬세한 감각', desc: '자세히 보면 보이는 디테일을 아낍니다.' },
      { icon: 'local_florist', title: '인디 브랜드', desc: '핸드메이드·지역 브랜드 애호.' },
    ],
    signature: { lip: '번진 체리 틴트', eye: '내추럴 마스카라', base: '클라우드 스킨', blush: '소프트 피치' },
    recommended: {
      women: {
        primary: 'Cloud Skin',
        secondary: 'Blush Draping',
        reason: '뽀얗고 촉촉한 피부와 번진 틴트가 ISFP의 꾸안꾸 감성을 정확히 완성합니다.',
      },
      men: {
        primary: 'Skincare Hybrid',
        secondary: 'Blurred Lip',
        reason: '피부결 중심 + 번진 립 조합이 ISFP의 "자연스러움 + 개성" 균형과 이상적으로 맞물립니다.',
      },
    },
    goodMatch: 'ESFJ',
    opposite: 'ENTJ',
    vibes: ['꾸안꾸', '어스톤', '카페', '로컬'],
    avoidTip: '힘만 뺀 무기력한 날 — 월 2~3회 컬러 포인트 추가해주세요.',
    boostTip: '특별한 날은 글리터 한 줌 — ISFP의 숨은 예술 감각을 드러냅니다.',
  },

  ESTP: {
    code: 'ESTP',
    slug: 'estp',
    emoji: '🔥',
    koName: '포인트 러쉬',
    enName: 'The Thrillseeker',
    tagline: '오늘은 풀메이크업, 강한 포인트로 스피드업',
    axisScores: { e: 90, n: 55, f: 30, p: 70 },
    primaryColor: '#c53030',
    accentColor: '#ed8936',
    shortDesc: 'ESTP의 메이크업은 스릴입니다. 강한 스모키, 풀 커버 베이스, 눈에 띄는 립 — 주목받는 것을 즐기는 에너지가 시그니처입니다.',
    detailParagraphs: [
      'ESTP의 메이크업은 즐거움의 증폭기입니다. 강한 스모키·풀 커버 매트 베이스·매트 레드 립 — 풀메이크업을 20분 안에 완성하는 역동적 그런지가 시그니처입니다.',
    ],
    traits: [
      { icon: 'flash_on', title: '에너지 증폭', desc: '메이크업으로 자신의 에너지를 끌어올립니다.' },
      { icon: 'speed', title: '빠른 풀메이크업', desc: '완성도 있는 풀메이크업을 20분 안에.' },
      { icon: 'trending_up', title: '결과 중심', desc: '발색·지속력·밀착력이 제품 선택 기준.' },
    ],
    signature: { lip: '매트 레드 또는 플럼', eye: '강한 스모키', base: '풀 커버 매트', blush: '번진 코랄' },
    recommended: {
      women: {
        primary: 'Grunge Makeup',
        secondary: 'Bold Lip',
        reason: '강렬한 스모키와 볼드 립이 ESTP의 에너지를 정확히 담습니다.',
      },
      men: {
        primary: 'Grunge Smoky Eye',
        secondary: 'Color Point Eye',
        reason: '거친 경계의 스모키가 ESTP의 역동성과 이상적으로 맞물립니다.',
      },
    },
    goodMatch: 'ISFJ',
    opposite: 'INFJ',
    vibes: ['스트리트', '클럽', '페스티벌', '스릴'],
    avoidTip: '매일 풀메이크업 — 피부 회복이 안 되면 발색이 죽습니다.',
    boostTip: '주 1~2회 쉬는 날 룩. 피부가 회복되면 풀메이크업 발색이 살아납니다.',
  },

  ESFP: {
    code: 'ESFP',
    slug: 'esfp',
    emoji: '💎',
    koName: '글로우 파티',
    enName: 'The Spotlight',
    tagline: '반짝이는 모든 것이 내 것',
    axisScores: { e: 85, n: 60, f: 65, p: 85 },
    primaryColor: '#d53f8c',
    accentColor: '#ecc94b',
    shortDesc: 'ESFP의 메이크업은 파티입니다. 반짝이는 메탈릭, 눈부신 글로우, 화사한 블러쉬 — 스포트라이트 아래 가장 빛나는 본능이 시그니처입니다.',
    detailParagraphs: [
      'ESFP의 메이크업은 파티입니다. 샴페인 메탈릭·글로우 풀 베이스·글리터 블러쉬 — 빛을 끌어당기는 스포트라이트의 본능, 사진에서 가장 빛나는 조합을 본능적으로 찾아냅니다.',
    ],
    traits: [
      { icon: 'auto_awesome', title: '빛의 마그넷', desc: '반짝이는 모든 것에 본능적으로 끌립니다.' },
      { icon: 'photo_camera', title: '사진 친화', desc: '카메라에 빛나는 조합을 탁월하게 찾아냅니다.' },
      { icon: 'celebration', title: '한정판 사랑', desc: '세트·한정판 구매에 약합니다.' },
    ],
    signature: { lip: '글로시 체리', eye: '샴페인 메탈릭', base: '글로우 풀', blush: '피치 글리터' },
    recommended: {
      women: {
        primary: 'Metallic Eye',
        secondary: 'Kpop Idol Makeup',
        reason: '빛을 끌어당기는 메탈릭이 ESFP의 "스포트라이트 본능"을 가장 명확히 구현합니다.',
      },
      men: {
        primary: 'Kpop Idol Makeup',
        secondary: 'Color Point Eye',
        reason: '무대성과 친근함을 동시에 담아 사교 에너지와 이상적으로 맞물립니다.',
      },
    },
    goodMatch: 'ISFP',
    opposite: 'INTJ',
    vibes: ['글로우', '파티', 'K-pop', '스포트라이트'],
    avoidTip: '평일·주말 구분 없는 풀 메탈릭 — 진지한 자리에서 부담스럽게 읽힙니다.',
    boostTip: '평일=글로우만, 주말=메탈릭 풀. 본능은 유지, 세련미는 추가.',
  },
}

export const MBTI_ORDER: MbtiCode[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
]

export function getMbtiType(code: string): MakeupMbtiType | null {
  const upper = code.toUpperCase() as MbtiCode
  return MAKEUP_MBTI_TYPES[upper] ?? null
}

export function getMbtiTypeBySlug(slug: string): MakeupMbtiType | null {
  const lower = slug.toLowerCase()
  return MBTI_ORDER.map(code => MAKEUP_MBTI_TYPES[code]).find(t => t.slug === lower) ?? null
}
