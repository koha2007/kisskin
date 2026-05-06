// Personal Color — 4-season system (봄웜/여름쿨/가을웜/겨울쿨)
// References: 나무위키 퍼스널컬러, 한국패션협회 자료, 비주얼살롱·언니의파우치 커뮤니티,
// Munsell color system, Carole Jackson "Color Me Beautiful" original framework.

export type SeasonCode = 'spring' | 'summer' | 'autumn' | 'winter'

export interface PersonalColorType {
  code: SeasonCode
  slug: string
  koName: string                 // 봄 웜톤 등
  enName: string                 // Spring Warm 등
  emoji: string
  tone: '웜톤' | '쿨톤'
  primaryColor: string
  accentColor: string
  tagline: string
  keywords: string[]             // 3~5 키워드 (이미지·느낌)
  traits: {
    skin: string                 // 피부 특징
    hair: string                 // 모발
    eye: string                  // 눈동자
    vibe: string                 // 첫인상·이미지
  }
  bestColors: {
    clothing: string[]           // 어울리는 의상 컬러 (6~8개)
    makeup: {
      foundation: string
      lip: string
      eye: string
      blush: string
    }
    accessory: string            // 실버/골드 구분
    hair: string                 // 헤어 염색 추천
  }
  avoidColors: string[]          // 피해야 할 컬러
  detailParagraphs: string[]     // 4~5 문단, SEO 본문
  celebrityVibes: string[]       // 이 시즌 느낌 키워드 (실명 X, 분위기만)
  kissinskinStyles: {
    women: string                // 추천 kissinskin 스타일
    men: string
    reason: string
  }
  shoppingTips: string[]         // 3~5 실전 쇼핑 팁
}

export const PERSONAL_COLOR_TYPES: Record<SeasonCode, PersonalColorType> = {
  spring: {
    code: 'spring',
    slug: 'spring-warm',
    koName: '봄 웜톤',
    enName: 'Spring Warm',
    emoji: '🌸',
    tone: '웜톤',
    primaryColor: '#f59e0b',
    accentColor: '#fb923c',
    tagline: '생기 가득, 햇살 아래 가장 빛나는 사람',
    keywords: ['생동감', '화사함', '동안', '귀여움', '밝음'],
    traits: {
      skin: '노란 기운이 있는 밝고 투명한 피부. 잡티는 있지만 전체적으로 맑음.',
      hair: '자연 갈색·밝은 브라운. 햇빛에 갈색 톤이 살아남.',
      eye: '밝은 갈색·호박색 눈동자. 흰자가 또렷하고 홍채가 반짝임.',
      vibe: '생기 있고 젊어 보이는 첫인상. "동안"이라는 말을 자주 들음.',
    },
    bestColors: {
      clothing: ['코랄', '피치', '샛노랑', '아이보리', '민트', '라이트 카멜', '컬러풀한 파스텔', '밝은 터쿼이즈'],
      makeup: {
        foundation: '옐로우 베이스 라이트 톤 · 글로우 피니시',
        lip: '코랄 오렌지, 피치, 살몬 핑크',
        eye: '샴페인 골드, 라이트 브라운, 웜 피치',
        blush: '피치, 살몬 코랄',
      },
      accessory: '옐로우 골드, 로즈 골드',
      hair: '허니 브라운, 캐러멜, 오렌지 브라운, 라이트 애쉬 (탈색 주의)',
    },
    avoidColors: ['버건디', '딥 네이비', '머스타드', '차콜 그레이', '블랙', '푸른빛 도는 플럼'],
    detailParagraphs: [
      '봄 웜톤은 노란 기운의 밝고 투명한 피부에 명도·채도가 모두 높은 웜 컬러가 어울리는 계열입니다. 코랄·피치·아이보리·옐로우 골드가 시그니처이며, 차가운 색(버건디·차콜·실버)은 피부를 칙칙하게 만들기 때문에 피하는 것이 좋습니다.',
    ],
    celebrityVibes: ['봄햇살 갓 틔운 꽃봉오리', '프레쉬 주스 광고 컷', '따뜻한 일러스트 속 주인공'],
    kissinskinStyles: {
      women: 'Natural Glow',
      men: 'Skincare Hybrid',
      reason: '밝고 따뜻한 글로우가 봄 웜톤의 생기와 투명함을 가장 잘 강조합니다.',
    },
    shoppingTips: [
      '파운데이션 고를 때 "웜 라이트", "Y21", "W21" 같은 옐로우 베이스 라이트 톤을 확인하세요.',
      '립은 "코랄", "피치", "살몬" 키워드가 포함된 제품을 우선 시도합니다.',
      '아이섀도 팔레트는 "웜 톤 · 골드 · 코랄" 조합이 있는 제품이 안전합니다.',
      '의류 쇼핑 시 "버건디", "플럼", "차콜" 태그는 주의하세요 — 피부가 어두워 보일 수 있습니다.',
      '은색 액세서리를 꼭 쓰고 싶다면 얼굴에서 먼 손목·발목 위주로, 목걸이·귀걸이는 골드가 안전합니다.',
    ],
  },

  summer: {
    code: 'summer',
    slug: 'summer-cool',
    koName: '여름 쿨톤',
    enName: 'Summer Cool',
    emoji: '💎',
    tone: '쿨톤',
    primaryColor: '#60a5fa',
    accentColor: '#c084fc',
    tagline: '부드러운 파스텔 속에서 가장 우아한 사람',
    keywords: ['부드러움', '우아함', '청순', '투명', '서늘함'],
    traits: {
      skin: '푸른 기운·핑크 기운의 밝은 피부. 얇고 투명해 혈관이 잘 비침.',
      hair: '짙은 갈색·애쉬 브라운·자연 검정. 붉은 기 적음.',
      eye: '회갈색·소프트 브라운. 흰자와 홍채의 대비가 부드러움.',
      vibe: '차분하고 청순한 첫인상. "단정하다"는 말을 자주 들음.',
    },
    bestColors: {
      clothing: ['라벤더', '베이비 블루', '로즈 핑크', '민트', '라이트 그레이', '소프트 라일락', '코발트(부드러운 톤)', '화이트'],
      makeup: {
        foundation: '핑크 베이스 라이트 톤 · 세미매트 또는 스킨 글로우',
        lip: '로즈 핑크, 시어 플럼, 라즈베리(소프트)',
        eye: '라벤더, 소프트 모브, 쿨 브라운',
        blush: '로즈 핑크, 피치(핑크 베이스)',
      },
      accessory: '실버, 화이트 골드, 플래티넘',
      hair: '애쉬 브라운, 라벤더 애쉬, 블루 블랙, 차콜 (오렌지 브라운 피하기)',
    },
    avoidColors: ['오렌지', '머스타드', '카키', '테라코타', '노란빛 골드', '웜 브라운'],
    detailParagraphs: [
      '여름 쿨톤은 푸른·핑크 기운의 밝고 투명한 피부에 채도가 낮은 쿨 파스텔이 가장 잘 맞는 계열입니다. 라벤더·베이비 블루·로즈 핑크·실버가 시그니처이며, 오렌지·머스타드·옐로우 골드는 피부를 노랗게 떠 보이게 만들어 피하는 것이 좋습니다.',
    ],
    celebrityVibes: ['이른 아침 안개 속 장면', '수채화 일러스트의 주인공', '북유럽 사진 집의 모델'],
    kissinskinStyles: {
      women: 'Cloud Skin',
      men: 'Blurred Lip',
      reason: '부드러운 구름 피부와 번진 립이 여름 쿨톤의 투명함·우아함과 완벽하게 맞물립니다.',
    },
    shoppingTips: [
      '파운데이션은 "쿨 라이트", "P21", "C21" 같은 핑크 베이스를 확인하세요.',
      '립은 "로즈", "모브", "시어 플럼" 키워드 제품을 시도합니다.',
      '"팥빙수 색", "마카롱 색" 같은 파스텔 컬러 설명이 있는 옷이 대체로 안전합니다.',
      '실버 액세서리를 메인으로, 골드는 로즈 골드 정도만 소량 섞으세요.',
      '헤어 염색 시 "오렌지", "캐러멜", "허니" 같은 단어는 피하고 "애쉬", "라벤더", "블루" 쪽을 선택합니다.',
    ],
  },

  autumn: {
    code: 'autumn',
    slug: 'autumn-warm',
    koName: '가을 웜톤',
    enName: 'Autumn Warm',
    emoji: '🍂',
    tone: '웜톤',
    primaryColor: '#b45309',
    accentColor: '#dc2626',
    tagline: '가을 숲처럼 깊고 풍부한 무드',
    keywords: ['고급스러움', '차분함', '지적', '내추럴', '깊이'],
    traits: {
      skin: '노란 기운의 짙은 피부. 혈색과 윤기가 적고 햇볕에 잘 탐.',
      hair: '자연 다크 브라운·짙은 브라운. 붉은 기는 있지만 따뜻함.',
      eye: '짙은 갈색·다크 브라운. 홍채와 흰자 대비가 부드럽고 깊음.',
      vibe: '지적이고 차분한 첫인상. "성숙하다"는 말을 자주 들음.',
    },
    bestColors: {
      clothing: ['머스타드', '카키', '버건디', '올리브 그린', '테라코타', '캐러멜', '딥 오렌지', '브라운'],
      makeup: {
        foundation: '옐로우 베이스 미디엄 톤 · 세미매트 또는 벨벳',
        lip: '벽돌색, 테라코타, 딥 레드 오렌지, 버건디 오렌지',
        eye: '브론즈, 딥 브라운, 올리브, 카퍼',
        blush: '테라코타, 머스타드 피치',
      },
      accessory: '옐로우 골드, 브론즈, 구리',
      hair: '다크 브라운, 카퍼 브라운, 초콜릿 브라운, 진한 오렌지 계열',
    },
    avoidColors: ['블랙(순흑)', '아이스 블루', '쿨 핑크', '실버', '라벤더', '파스텔 쿨 톤'],
    detailParagraphs: [
      '가을 웜톤은 노란 기운의 차분하고 깊은 피부에 톤 다운된 웜 딥 컬러가 가장 잘 맞는 계열입니다. 머스타드·카키·테라코타·올리브·브론즈가 시그니처이며, 정순 블랙·아이스 블루·실버는 풍부한 깊이를 죽여 피하는 것이 좋습니다.',
    ],
    celebrityVibes: ['가을 숲속의 한 컷', '와인 셀러 사진의 모델', '빈티지 필름 광고 주인공'],
    kissinskinStyles: {
      women: 'Blood Lip',
      men: 'Vampire Romantic',
      reason: '딥한 웜 레드 계열이 가을 웜톤의 풍부한 피부톤과 가장 깊이 있게 맞물립니다.',
    },
    shoppingTips: [
      '파운데이션은 "웜 미디엄", "Y25", "W25" 같은 키워드를 확인하세요.',
      '립은 "벽돌", "테라코타", "카퍼", "버건디 오렌지" 제품 우선 시도.',
      '의류에서 "머스타드", "올리브", "캐러멜" 단어가 붙은 제품은 대체로 안전합니다.',
      '골드 액세서리만 쓴다고 생각하고, 실버는 아예 제외하면 실패가 없습니다.',
      '헤어 탈색 기준으로 8레벨(밝은 애쉬) 이상은 피하고, 6~7레벨 다크 브라운에서 톤만 바꾸세요.',
    ],
  },

  winter: {
    code: 'winter',
    slug: 'winter-cool',
    koName: '겨울 쿨톤',
    enName: 'Winter Cool',
    emoji: '❄️',
    tone: '쿨톤',
    primaryColor: '#1e293b',
    accentColor: '#dc2626',
    tagline: '도시적이고 세련된, 강한 대비가 살아나는 사람',
    keywords: ['도시적', '세련', '카리스마', '모던', '시크'],
    traits: {
      skin: '푸른 기운의 새하얀 피부. 홍조가 거의 없고 깨끗한 대비.',
      hair: '자연 검정·블루 블랙. 붉은 기 없음.',
      eye: '검은 갈색·진한 검정. 흰자와 홍채의 대비가 또렷함.',
      vibe: '도시적이고 차가운 첫인상. "시크하다"는 말을 자주 들음.',
    },
    bestColors: {
      clothing: ['정순 블랙', '퓨어 화이트', '핫 핑크', '로열 블루', '푸른빛 플럼', '에메랄드', '버건디(쿨)', '레몬 옐로우(차가운)'],
      makeup: {
        foundation: '핑크·뉴트럴 쿨 라이트~미디엄 · 매트 또는 세미매트',
        lip: '블랙 체리, 정순 레드, 와인 플럼, 쿨 핫핑크',
        eye: '블랙, 딥 네이비, 실버 글리터, 아이스 라벤더',
        blush: '쿨 로즈, 시어 플럼',
      },
      accessory: '실버, 플래티넘, 화이트 골드',
      hair: '블루 블랙, 차콜, 정순 블랙, 애쉬 실버 (오렌지 제외)',
    },
    avoidColors: ['카멜', '머스타드', '코랄', '피치', '옐로우 골드 계열 전체', '어스 톤'],
    detailParagraphs: [
      '겨울 쿨톤은 푸른 기운의 새하얀 피부와 짙은 모발의 강한 대비가 특징인 계열입니다. 정순 블랙·퓨어 화이트·핫 핑크·로열 블루·실버가 시그니처이며, 카멜·머스타드·코랄 같은 웜 어스 톤은 강한 대비를 흐리게 만들어 피해야 합니다.',
    ],
    celebrityVibes: ['도시 야경 속 실루엣', '블랙 앤 화이트 에디토리얼', '패션 위크 프런트 로우'],
    kissinskinStyles: {
      women: 'Bold Lip',
      men: 'Monochrome',
      reason: '강한 대비와 모던한 컬러가 겨울 쿨톤의 도시적 카리스마를 가장 효과적으로 끌어냅니다.',
    },
    shoppingTips: [
      '파운데이션은 "쿨 미디엄", "P25", "C23" 같은 쿨 뉴트럴 톤을 확인하세요.',
      '립은 "블랙 체리", "정순 레드", "쿨 레드", "블루 언더 레드" 키워드 제품 우선.',
      '의류에서 블랙·화이트·로열 블루·에메랄드는 거의 무조건 어울립니다.',
      '골드 액세서리는 제외. 실버와 화이트 골드만 선택해도 실수가 없습니다.',
      '베이지·카멜 계열은 "차콜", "쿨 그레이"로 대체하면 톤이 살아납니다.',
    ],
  },
}

export const SEASON_ORDER: SeasonCode[] = ['spring', 'summer', 'autumn', 'winter']

export function getSeasonBySlug(slug: string): PersonalColorType | null {
  return SEASON_ORDER.map(c => PERSONAL_COLOR_TYPES[c]).find(t => t.slug === slug.toLowerCase()) ?? null
}
