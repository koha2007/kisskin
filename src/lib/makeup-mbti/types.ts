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
      'INTJ 유형은 메이크업을 하나의 정교한 시스템처럼 다룹니다. 전체 얼굴에 골고루 존재감을 배치하기보다, 한 지점에 집중적으로 포인트를 설계하는 방식을 선호합니다. 메탈릭 아이섀도의 하이라이트 위치, 아이라인의 각도, 립 컬러의 채도 — 각 요소가 의도를 가지고 배치됩니다. 감각보다는 구조가 우선이고, 즉흥보다는 리허설된 일관성이 편안합니다.',
      '이 유형이 특히 빛나는 스타일은 메탈릭 아이 룩과 모노크롬 계열입니다. 브론즈·골드·건메탈 톤의 아이섀도를 글로시한 피부 위에 올리면, 차분한 전체 무드와 날카로운 포인트의 대비가 INTJ 특유의 "단단한 존재감"을 만들어냅니다. 남성의 경우 모노크롬 룩 — 눈·피부·입술을 하나의 톤으로 묶은 절제된 스타일 — 이 가장 잘 어울립니다.',
      '루틴은 검증된 아이템 3~5개로 고정되는 경향이 있습니다. 신제품을 무작정 따라가지 않지만, 한 번 "공식"을 찾으면 같은 아이템을 몇 년씩 재구매합니다. 쿠션 하나, 아이섀도 팔레트 하나, 립 하나 — 이 최소 구성이 INTJ에게는 "완성된 알고리즘"입니다. 비슷한 성향의 INTP, ENTJ와 제품 추천을 교환하면 시너지가 큽니다.',
      '주의할 함정은 "너무 엄격해서 지루해지는 순간"입니다. 공식이 완성된 뒤에는 의도적으로 계절에 한 번 정도 포인트 컬러를 바꿔주는 것이 좋습니다. 반대로 피해야 할 것은 블러·번짐 중심의 소프트 룩 — INTJ의 정돈된 설계에는 경계가 흐려진 무드가 불편하게 느껴집니다.',
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
      'INTP 유형의 메이크업은 "질문"에서 시작됩니다. 왜 레드 립에는 블랙 아이라인이 기본으로 묶이는가, 왜 글리터는 이브닝에만 쓰이는가 — 일반 공식을 의심하고 재조합합니다. 모스·바이올렛·오렌지 브라운 같이 대중적이지 않은 컬러를 즐겨 쓰면서도, 선택에는 분명한 논리가 있습니다. "이 톤은 내 홍조와 보색이라 균형이 맞는다" 같은 개인 이론이 루틴의 기반입니다.',
      '가장 빛나는 스타일은 맥시멀리스트 아이(Maximalist Eye)와 컬러 포인트 아이(Color Point Eye)입니다. 넓은 면적에 대담한 컬러를 펼치기보다, 언더라인이나 이너 코너에 예상 밖의 컬러를 던져 전체 얼굴의 해석을 바꾸는 "개념적 포인트"를 선호합니다. 남성의 경우 한 쪽 눈 이너라인에 블루 포인트를 얹는 것만으로 INTP 특유의 "생각하게 만드는" 룩이 완성됩니다.',
      'INTP는 같은 루틴을 반복하는 것에 쉽게 싫증을 냅니다. 팔레트 수집이 많고, 매번 다른 조합을 실험합니다. 다만 이 실험이 "완성형 스타일 없음"으로 이어지기도 하므로, 3~4개의 "기본 테제"를 정해두고 그 안에서 변주하는 편이 안정적입니다.',
      '함정은 "너무 많은 실험이 산만해 보이는 것"입니다. 한 룩에 컬러는 3가지 이하로 제한하는 규칙을 세우면, INTP의 지적인 아이덴티티를 보존하면서 완성도도 올라갑니다.',
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
      'ENTJ의 메이크업은 "효과"로 판단됩니다. 예뻐 보이는 것이 아니라, 회의·발표·중요한 자리에서 원하는 인상을 만드는 데 기여하는가 — 이것이 기준입니다. 그래서 이 유형이 선택하는 아이템은 임팩트가 명확합니다. 또렷한 레드 립, 윤곽을 살리는 컨투어, 확실한 아이라인. 복잡한 레이어링보다 "한 방"의 명확한 파워풀을 선호합니다.',
      '가장 잘 어울리는 스타일은 볼드 립(Bold Lip)과 블러드 립(Blood Lip)입니다. 남성의 경우 유틸리티 메이크업(Utility Makeup) — 기능적이고 군더더기 없는 톤 정리 — 이 ENTJ의 실용주의와 정확히 맞물립니다. 공통적으로 "피부가 지나치게 반짝이지 않는 세미매트 / 매트 베이스"를 선호합니다. 글로우가 과하면 진지함이 희석된다고 느끼기 때문입니다.',
      '루틴은 5분 이내로 짧습니다. ENTJ는 시간을 전략 자원으로 보기 때문에, 메이크업에 30분을 쓰는 일은 거의 없습니다. 대신 제품 자체에는 기꺼이 투자합니다. 10만원대 립스틱 하나, 20만원대 쿠션 하나 — 가격이 퀄리티와 직결된다고 판단하면 망설임이 없습니다.',
      '주의할 지점은 "얼굴이 항상 긴장해 보이는 것"입니다. 의도적으로 한 주에 한 번 정도 블러쉬나 립 틴트로 부드러운 요소를 넣으면, 카리스마는 유지하면서 다가가기 쉬운 분위기도 만들 수 있습니다.',
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
      'ENTP 유형은 같은 룩을 2주 연속으로 하면 지루함을 느낍니다. 새로운 트렌드, 새로운 제품, 새로운 조합 — 호기심 자체가 루틴입니다. SNS에서 뜬 바이럴 룩을 가장 먼저 시도해보는 유형이 이 ENTP입니다. 그리고 시도한 다음에는 거기서 한 단계 더 뒤틀어 자기 버전을 만듭니다.',
      '잘 어울리는 스타일은 그런지 메이크업(Grunge Makeup)입니다. 그런지는 본래 "완벽을 부수는" 스타일이라, 실험 정신과 철학적으로 일치합니다. 여성의 경우 블러드 립·스모키 아이·번진 아이라인이 ENTP의 "아이디어 런웨이"를 구현합니다. 남성의 경우 그런지 스모키 아이(Grunge Smoky Eye)가 실험성과 대중성의 교집합을 정확히 포착합니다.',
      '루틴이라는 단어가 ENTP에게는 어색합니다. 대신 "이번 달 테마" 정도가 자연스럽습니다. 3월엔 시트러스 오렌지, 4월엔 아이스 블루, 5월엔 웜 테라코타. 테마를 바꾸는 것 자체가 동기 부여입니다.',
      '함정은 "매번 다르지만 하나도 완성도 높은 게 없음"입니다. 한 테마를 최소 2주 정도는 유지하며 디테일을 다듬는 연습이 필요합니다. INTJ나 ISTJ 유형에게 "제품 공식"을 배우면 실험 깊이가 급격히 올라갑니다.',
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
      'INFJ 유형의 메이크업은 "감정의 그림자"를 표현하는 도구에 가깝습니다. 또렷한 포인트보다 부드럽게 번진 경계, 강한 컬러보다 채도가 낮고 톤이 깊은 컬러를 선호합니다. 입술과 볼이 분리된 느낌보다, 얼굴 전체가 하나의 무드 안에 녹아드는 방식 — 이것이 INFJ의 본능적 미감입니다.',
      '가장 어울리는 스타일은 블러쉬 드레이핑(Blush Draping)과 클라우드 스킨입니다. 블러쉬 드레이핑은 볼 → 관자놀이 → 눈두덩까지 한 톤으로 연결해 얼굴 전체를 하나의 무드로 만드는 기법입니다. 남성의 경우 블러드 립(Blurred Lip) — 경계가 번진 자연스러운 립 — 이 내면의 부드러움과 외면의 감성을 동시에 표현합니다.',
      'INFJ는 브랜드 스토리와 철학에 반응합니다. 동물 실험을 하지 않는 비건 브랜드, 창업자의 서사가 있는 인디 브랜드, 지역 장인과 협업하는 에코 라인 — 제품의 "이야기"가 구매 결정에 큰 영향을 줍니다. 루틴 자체도 명상적입니다. 아침 메이크업 시간이 하루를 조율하는 작은 의식입니다.',
      '주의할 점은 "무드가 흐릿해서 존재감이 약해 보이는 것"입니다. 한 달에 한두 번은 의도적으로 볼드 립이나 또렷한 아이라인으로 감성에 선을 더해주면, INFJ의 섬세함이 더 깊이 있게 전달됩니다.',
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
      'INFP의 메이크업은 "이야기"를 담습니다. 동화 속 주인공의 한 장면, 빈티지 영화의 특정 프레임, 좋아하는 시의 한 구절 — 추상적인 영감을 구체적인 컬러로 번역합니다. 그래서 같은 핑크라도 INFP에게는 "분홍"이 아니라 "봄날 오후 햇살에 녹은 벚꽃의 색"입니다.',
      '이 유형에게 가장 자연스러운 스타일은 메탈릭 아이의 파스텔 버전입니다. 실버·샴페인·라일락 글리터를 눈두덩 중앙에 얹고, 립은 글로시한 피치 코랄. 남성의 경우 뱀파이어 로맨틱(Vampire Romantic) — 플럼 립과 스모키 보라 아이 — 이 INFP의 다크 판타지를 정확히 구현합니다.',
      '루틴은 기분 따라 크게 달라집니다. 비 오는 날은 더 어두운 플럼, 맑은 날은 코랄 시트러스. 제품 수집이 많고, 한 번에 쓰는 양은 적지만 보유 개수는 50~100개를 넘기도 합니다. 수집 자체가 즐거움이라 필수 소비가 아닌 감정 소비 성격이 강합니다.',
      '함정은 "판타지가 일상복과 괴리되는 것"입니다. 한 룩에 글리터 한 지점, 컬러 포인트 한 개로 제한하면 로맨틱함은 유지하면서 출근·등교 맥락에서도 성립합니다.',
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
      'ENFJ는 메이크업을 "상호작용"으로 접근합니다. 상대가 나를 보며 편안함을 느끼는가, 화면에서 따뜻해 보이는가 — 이것이 기준입니다. 그래서 피치·코랄·로즈 같은 웜톤이 루틴의 중심입니다. 차가운 톤을 시도하더라도, 결국 어딘가에 따뜻한 액센트를 남깁니다.',
      '가장 잘 어울리는 스타일은 내추럴 글로우(Natural Glow)와 블러드 립의 결합입니다. 피부는 은은하게 빛나고, 입술은 안에서 붉어진 듯 자연스러운 톤. 남성의 경우 K-pop 아이돌(Kpop Idol) 룩이 ENFJ의 "대중적 매력"과 정확히 맞물립니다.',
      '루틴은 20~25분 정도로 평균적입니다. 짧게 하지도, 길게 하지도 않는 "균형"이 특징입니다. 친구가 새 제품을 추천하면 기꺼이 시도하지만, 궁극적으로는 "내가 제일 편한 조합"으로 돌아옵니다.',
      '주의할 지점은 "항상 친근해 보이려다 존재감이 옅어지는 것"입니다. 중요한 자리에서는 의도적으로 매트한 레드 립이나 또렷한 아이라인을 시도해 ENFJ의 리더십을 드러내는 것이 좋습니다.',
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
      'ENFP의 메이크업은 그날의 기분, 날씨, 재생 중인 플레이리스트, 만날 사람 — 모든 것에 반응합니다. 기쁨이 많은 날은 시트러스 오렌지, 생각이 깊은 날은 테라코타 브라운, 로맨틱한 기분엔 체리 핑크. 즉흥과 다양성이 본질입니다.',
      '가장 어울리는 스타일은 맥시멀리스트 아이(Maximalist Eye)입니다. 한 눈에 3~4가지 컬러를 레이어링하는 이 스타일은, ENFP의 다채로운 에너지를 정확히 담습니다. 남성의 경우 컬러 포인트 아이(Color Point Eye) — 날마다 다른 컬러 포인트로 기분을 표현합니다.',
      '루틴은 "없음"에 가깝습니다. 순서도, 아이템도 매일 달라집니다. 대신 팔레트 보유량이 많습니다. 15~30개의 아이섀도 팔레트, 50개 이상의 립 제품 — 이게 ENFP에게는 "그날 나를 위한 재료"입니다.',
      '함정은 "선택 피로"입니다. 너무 많은 옵션 앞에서 결정 못 해 지각하는 날이 많다면, "월요는 핑크, 수요는 오렌지" 같은 느슨한 요일 공식을 만들어보세요. 자유는 유지하면서 결정 시간은 줄어듭니다.',
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
      'ISTJ 유형은 메이크업을 "신뢰"로 판단합니다. 10년 동안 만족한 브랜드, 20번 넘게 재구매한 립 컬러, 피부 반응이 검증된 파운데이션 — 새로운 것보다 오래 써본 것이 편합니다. 과도한 장식이나 실험 대신, 피부 본연의 건강함이 드러나는 내추럴 메이크업이 ISTJ의 정답입니다.',
      '가장 어울리는 스타일은 내추럴 글로우(Natural Glow)와 남성의 경우 노메이크업 메이크업(No-Makeup Makeup)입니다. "화장한 듯 안 한 듯" 한 이 두 스타일은 ISTJ의 정직함·성실함과 철학적으로 일치합니다. 피부톤을 정돈하고, 눈썹을 자연스럽게 채우고, 입술에 약간의 혈색을 — 그게 전부입니다.',
      '루틴은 매우 일정합니다. 월요일 아침과 토요일 아침의 메이크업이 거의 같습니다. 제품 수명도 길어서, 마스카라는 공식 유통기한까지, 립스틱은 다 쓸 때까지 — 절약과 신중함이 기본입니다. ENTP·ENFP의 실험 정신과는 정반대지만, 바로 그래서 서로에게 배울 게 많습니다.',
      '함정은 "항상 같아 보이는 지루함"입니다. 같은 루틴이라도 계절에 한 번 립 컬러를 한 톤만 바꿔보세요. 봄=코랄, 여름=피치, 가을=테라코타, 겨울=플럼. ISTJ의 신뢰성은 지키면서 새로움이 더해집니다.',
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
      'ISFJ는 메이크업으로 "돌봄"을 표현합니다. 자신에게도, 주변에도 불편하지 않은 부드러운 톤. 과한 장식이나 강한 포인트 대신, 피부의 촉촉함과 혈색감 있는 자연스러움이 본질입니다. 보는 사람이 편안한 게 ISFJ에게는 무엇보다 중요합니다.',
      '가장 어울리는 스타일은 클라우드 스킨(Cloud Skin)입니다. 부드럽게 빛나는 구름 같은 피부 위에 연한 핑크 블러쉬, 촉촉한 틴트 립. 남성의 경우 스킨케어 하이브리드(Skincare Hybrid) — 화장보다 피부 결 개선 중심의 접근 — 이 ISFJ의 "돌봄 철학"과 정확히 맞물립니다.',
      '루틴은 조용한 아침 의식에 가깝습니다. 커피 한 잔, 스킨케어 7단계, 간단한 색조. 이 과정 자체가 ISFJ에게는 하루를 여는 치유입니다. 제품도 순한 성분, 저자극, 무향 위주로 선택합니다.',
      '주의할 점은 "존재감이 지나치게 옅어지는 것"입니다. 행사나 데이트 같은 특별한 날엔 립 틴트를 한 톤만 더 채도 높은 것으로 바꾸는 것만으로도 ISFJ의 포근함이 더 또렷한 인상으로 전환됩니다.',
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
      'ESTJ는 메이크업을 "역할 수행"으로 이해합니다. 회의, 프레젠테이션, 공식 자리 — 각 상황에 맞는 정답이 있고, 그 정답을 충실히 구현하는 것이 이 유형의 방식입니다. 실험이나 즉흥보다, 신뢰받는 공식을 정확히 실행하는 데 에너지를 씁니다.',
      '가장 잘 어울리는 스타일은 블러드 립(Blood Lip)과 남성의 경우 모노크롬(Monochrome)입니다. 블러드 립은 "정석 레드"의 현대 버전 — 안에서 붉어진 듯 자연스러우면서도 단정한 존재감 — 이 ESTJ의 공식적 미감과 일치합니다.',
      '루틴은 체계적이고 빠릅니다. 15분 이내에 정확한 순서로 완성됩니다. 제품 배치도 서랍 안에서 사용 순서대로 정리되어 있고, 재고가 떨어지기 전에 미리 재구매합니다. ISTJ와 비슷하지만, ESTJ는 좀 더 외향적인 존재감을 더합니다.',
      '주의할 함정은 "항상 단정해서 경직돼 보이는 것"입니다. 주말이나 캐주얼한 자리엔 의도적으로 립 틴트나 소프트 블러쉬를 시도해 ESTJ의 인간적인 면모를 드러내는 것이 좋습니다.',
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
      'ESFJ는 "자리에 맞는 완성도"를 추구합니다. 친구 생일엔 화사한 핑크, 회식엔 단정한 레드, 데이트엔 로맨틱한 글로우. 상황 맥락을 읽고, 거기에 최적화된 룩을 완성하는 능력이 탁월합니다. 유행과 클래식을 균형 있게 섞는 감각도 이 유형의 강점입니다.',
      '가장 어울리는 스타일은 K-pop 아이돌(Kpop Idol) 룩입니다. 이 룩은 그 자체로 "트렌드 + 친근함 + 무대성"의 균형이라, ESFJ의 멀티 페르소나를 단일 스타일로 포괄합니다. 남성의 경우에도 K-pop 아이돌 룩이 1순위 — 대중적 매력과 세련된 디테일을 동시에 보여줍니다.',
      '루틴은 25~35분 정도로 꼼꼼합니다. 매번 단계를 지키지만, 아이템 선택에는 유연성이 있습니다. SNS 트렌드와 친구 추천에 반응하지만, 자기 얼굴에 맞는지 꼼꼼히 판단합니다.',
      '주의할 점은 "주변 기대에 맞추다 본인 취향을 잃는 것"입니다. 한 달에 한 번은 "오늘은 내가 좋아하는 컬러"의 날을 정해 주변보다 본인을 먼저 두는 연습이 필요합니다.',
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
      'ISTP는 "왜 해야 하는가"부터 묻습니다. 5단계 루틴 중 3단계를 생략해도 결과가 유사하다면, 생략하는 게 합리적이라고 판단합니다. 그래서 이 유형의 메이크업은 최대한 간소하며, 각 단계가 분명한 목적을 가집니다. 멀티 유즈 스틱, 틴트 립밤, BB 크림 하나 — 한 제품이 두세 역할을 할수록 좋습니다.',
      '가장 어울리는 스타일은 내추럴 글로우(Natural Glow)와 남성의 노메이크업 메이크업(No-Makeup Makeup)입니다. 최소한의 터치로 피부 톤만 정돈하고, 립밤 하나로 마무리. ISTP에게는 이 정도가 "이미 충분한" 완성도입니다.',
      '루틴 시간은 3~5분. 보유 제품 개수도 10개 이내로 적습니다. 하지만 고른 아이템은 성능이 검증된 것 — ISFJ처럼 "순한 걸 찾는" 게 아니라 "정확히 작동하는 걸 찾는" 관점입니다. 멀티 스틱, 미스트, 립밤이 주력입니다.',
      '주의할 지점은 "기능만 있고 매력 신호가 약한 것"입니다. 행사 자리엔 의도적으로 강한 포인트 하나 — 레드 립이든 스모키 아이든 — 를 시도해 ISTP의 숨은 강단을 드러내는 것이 좋습니다.',
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
      'ISFP는 메이크업에서 "자연스러움"과 "개성"의 균형을 추구합니다. 티 나는 메이크업은 부담스럽지만, 완전히 무채색인 건 ISFP답지 않습니다. 그래서 결론은 "꾸안꾸" — 한 듯 안 한 듯한데, 한 컷만 자세히 보면 섬세한 감각이 있는 스타일입니다.',
      '가장 잘 어울리는 스타일은 클라우드 스킨(Cloud Skin)과 남성의 스킨케어 하이브리드(Skincare Hybrid)입니다. 피부는 뽀얗고 촉촉하게, 입술은 안에서 번진 듯한 틴트, 속눈썹은 마스카라 한 번 — 이게 ISFP의 완성형입니다.',
      'ISFP는 "기분에 따라" 강도를 조절합니다. 평소엔 정말 간소하게, 특별한 날엔 글리터 한 줌이나 스모키 한 겹. 변주 폭은 ENFP보다 좁지만 분명히 있습니다. 제품도 감성적인 패키지, 핸드메이드 브랜드, 지역 인디 라인에 끌립니다.',
      '주의할 함정은 "힘 뺀 게 무기력하게 보이는 것"입니다. 월 2~3회는 컬러 포인트 하나를 의도적으로 강조해 ISFP의 예술 감각이 잠깐이라도 드러나게 해주세요.',
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
      'ESTP는 메이크업을 "즐거움의 증폭기"로 씁니다. 은은함보다 강렬함, 차분함보다 역동성 — 화려한 풀메이크업을 즐깁니다. 보수적인 자리에서도 허용 범위의 최대치를 끌어올리는 감각이 있고, 캐주얼한 자리엔 거침없이 볼드한 선택을 합니다.',
      '가장 잘 어울리는 스타일은 그런지 메이크업(Grunge Makeup)과 남성의 그런지 스모키 아이(Grunge Smoky Eye)입니다. 경계가 거친 스모키, 강렬한 립, 풀 커버 베이스 — ESTP의 에너지를 전부 담는 구성입니다. 이 유형은 "점잖은 버전"이 가장 어색합니다.',
      '루틴은 의외로 빠릅니다. 완성도 있는 풀메이크업을 20분 이내에 해내는 속도감이 있습니다. 제품 선택도 결과 중심 — 발색, 지속력, 밀착력이 기준이고, 성분이나 브랜드 서사엔 관심이 적습니다.',
      '주의할 함정은 "풀메이크업이 매일이어서 피부 컨디션이 떨어지는 것"입니다. 주 1~2회는 의도적으로 "쉬는 날 룩" — 틴트 립밤 + 마스카라 한 번 정도 — 을 설정해 피부를 회복시키세요.',
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
      'ESFP는 "지금 이 순간의 즐거움"이 루틴의 중심입니다. 우아하거나 진지한 스타일보다 반짝이고 화려한 스타일에 본능적으로 끌립니다. 글리터·하이라이터·메탈릭 — 빛을 반사하는 모든 것에 관심이 많고, 사진에서 눈부시게 보이는 조합을 탁월하게 찾아냅니다.',
      '가장 잘 어울리는 스타일은 메탈릭 아이(Metallic Eye)와 남성의 K-pop 아이돌(Kpop Idol) 룩입니다. 메탈릭 아이는 빛을 끌어당기는 스타일의 정점이고, K-pop 아이돌 룩은 무대성과 친근함을 동시에 담아 ESFP의 사교 에너지와 정확히 맞물립니다.',
      '루틴은 유연합니다. 기본은 화려하지만, 기분과 자리에 따라 강도 조절이 자유롭습니다. 제품 수집도 많고, 세트 구매·한정판에 약합니다. SNS 노출에 가장 민감한 유형 중 하나이기도 합니다.',
      '주의할 함정은 "매일 반짝이다 진지한 자리에서 부담스러워지는 것"입니다. 평일과 주말의 강도를 분리하는 규칙 — 평일 = 글로우만, 주말 = 메탈릭 풀 — 을 두면 ESFP의 본능이 상황에 맞게 세련되게 정리됩니다.',
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
