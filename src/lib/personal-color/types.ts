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
  toneEn?: 'Warm' | 'Cool'
  primaryColor: string
  accentColor: string
  tagline: string
  taglineEn?: string
  keywords: string[]             // 3~5 키워드 (이미지·느낌)
  keywordsEn?: string[]
  traits: {
    skin: string                 // 피부 특징
    hair: string                 // 모발
    eye: string                  // 눈동자
    vibe: string                 // 첫인상·이미지
  }
  traitsEn?: {
    skin: string
    hair: string
    eye: string
    vibe: string
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
  bestColorsEn?: {
    clothing: string[]
    makeup: {
      foundation: string
      lip: string
      eye: string
      blush: string
    }
    accessory: string
    hair: string
  }
  avoidColors: string[]          // 피해야 할 컬러
  avoidColorsEn?: string[]
  detailParagraphs: string[]     // 4~5 문단, SEO 본문
  detailParagraphsEn?: string[]
  celebrityVibes: string[]       // 이 시즌 느낌 키워드 (실명 X, 분위기만)
  celebrityVibesEn?: string[]
  kissinskinStyles: {
    women: string                // 추천 kissinskin 스타일
    men: string
    reason: string
  }
  kissinskinReasonEn?: string
  shoppingTips: string[]         // 3~5 실전 쇼핑 팁
  shoppingTipsEn?: string[]
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
    toneEn: 'Warm',
    taglineEn: 'Bright, fresh, and at your best in sunlight',
    keywordsEn: ['energetic', 'bright', 'youthful', 'cute', 'luminous'],
    traitsEn: {
      skin: 'Bright, translucent skin with a yellow undertone. Some pigmentation but overall clear.',
      hair: 'Natural light-to-medium brown that warms in sunlight.',
      eye: 'Bright brown or amber eyes with crisp whites and a sparkling iris.',
      vibe: 'Youthful, energetic first impression. Often called "baby-faced."',
    },
    bestColorsEn: {
      clothing: ['coral', 'peach', 'sunny yellow', 'ivory', 'mint', 'light camel', 'colorful pastels', 'bright turquoise'],
      makeup: {
        foundation: 'Yellow-base light tone with a glow finish',
        lip: 'Coral orange, peach, salmon pink',
        eye: 'Champagne gold, light brown, warm peach',
        blush: 'Peach, salmon coral',
      },
      accessory: 'Yellow gold and rose gold',
      hair: 'Honey brown, caramel, orange brown, light ash (heavy bleach not recommended)',
    },
    avoidColorsEn: ['burgundy', 'deep navy', 'mustard', 'charcoal grey', 'pure black', 'plum with a blue undertone'],
    detailParagraphsEn: [
      'Spring Warm is a bright, warm tone that fits roughly 20–25% of Koreans. The skin reads bright and translucent with a yellow undertone, with little to no flush. In sunlight the skin reads as glowing; in shade it still reads as bright. The signature rule for this season is "high brightness, mid-to-high saturation warm colors" — those are what make the face come alive.',
      'The most flattering colors are coral, peach, sunny yellow, ivory, and bright turquoise. Coral and peach in particular are the signature lip and blush families: applied to the lips and cheeks they make the whole face look "sun-kissed." On the other end, cool tones like burgundy, deep navy, and charcoal grey make the skin look dull and dim, so they should be avoided consciously.',
      'Makeup direction is glow, glow, glow. Use a yellow-base light foundation, and rotate lips between coral orange, peach, and salmon pink. For eyes, champagne gold, light brown, and warm peach define the eye best, and a peach or salmon-coral blush placed on the apples of the cheeks adds the freshness Spring Warm is known for.',
      'For accessories, gold beats silver — yellow gold and rose gold harmonize best with the warm undertone. For hair color, warm browns like honey brown and caramel are the go-to. Heavy bleaching into ash territory tends to make the skin look sallow.',
      'The classic trap for Spring Warm is assuming "any bright color works." Cool brights — cool pink, ice blue — actually wash out the skin. The real rule is "bright AND warm" together; only colors meeting both conditions are truly yours.',
    ],
    celebrityVibesEn: ['fresh spring blossom', 'bright juice campaign shot', 'lead in a warm illustration'],
    kissinskinReasonEn:
      'A bright, warm glow brings out the freshness and translucency that Spring Warm naturally has.',
    shoppingTipsEn: [
      'When picking foundation, look for "warm light", "Y21", "W21" or any yellow-base light tone.',
      'For lipsticks, prioritize products tagged "coral", "peach", or "salmon".',
      'Eyeshadow palettes labeled "warm tone · gold · coral" are the safe bet.',
      'When shopping clothes, watch for tags like "burgundy", "plum", or "charcoal" — they can dim your skin.',
      'If you must wear silver, keep it on the wrists or ankles (away from the face). Necklaces and earrings are safer in gold.',
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
    toneEn: 'Cool',
    taglineEn: 'Most elegant in soft pastels — quiet and refined',
    keywordsEn: ['soft', 'elegant', 'pure', 'translucent', 'cool'],
    traitsEn: {
      skin: 'Bright skin with a blue or pink undertone. Thin and translucent — veins show easily.',
      hair: 'Dark brown, ash brown, or natural black. Little red.',
      eye: 'Greyish brown or soft brown. Whites and iris contrast softly.',
      vibe: 'Calm, pure first impression. Often called "neat" or "polished."',
    },
    bestColorsEn: {
      clothing: ['lavender', 'baby blue', 'rose pink', 'mint', 'light grey', 'soft lilac', 'cool cobalt', 'white'],
      makeup: {
        foundation: 'Pink-base light tone, semi-matte or skin-glow finish',
        lip: 'Rose pink, sheer plum, soft raspberry',
        eye: 'Lavender, soft mauve, cool brown',
        blush: 'Rose pink, peach with a pink base',
      },
      accessory: 'Silver, white gold, platinum',
      hair: 'Ash brown, lavender ash, blue black, charcoal — avoid orange brown',
    },
    avoidColorsEn: ['orange', 'mustard', 'khaki', 'terracotta', 'yellow gold', 'warm brown'],
    detailParagraphsEn: [
      'Summer Cool is the most common season in Korea — about 35–40% of the population sits here. The skin reads bright with a blue or pink undertone; the surface is thin enough that the veins on the inner wrist read distinctly blue. Even when there is flush, it shows as cool and clear rather than warm.',
      'The most flattering colors are lavender, baby blue, rose pink, and soft lilac. The signature rule is "low saturation, mid-to-high brightness cool pastels." Watered-down softness flatters Summer Cool more than primary intensity. Warm shades like orange, mustard, and khaki, on the other hand, dull the skin and should be avoided.',
      'Makeup direction is "toned-down cool pastels." Use a pink-base foundation, and lean lipsticks rose pink, sheer plum, or soft raspberry — sheer-finish lips especially read pure on this season. Eyeshadow in lavender, soft mauve, or cool brown adds depth without harshness, and a rose-pink blush on the apples of the cheeks finishes the look.',
      'Accessory-wise, silver, white gold, and platinum brighten the face. Yellow gold makes the skin look sallow and is best avoided. For hair, ash families — especially lavender ash and blue black — push the cool feel further. Stay away from orange brown and caramel.',
      'A common Summer Cool worry is "I look too soft / not strong enough." That softness is the strength, not a problem to fix. Trying to add presence with high-saturation colors usually backfires. Aim for elegance inside the soft pastels — that is the right answer for this season.',
    ],
    celebrityVibesEn: ['early-morning fog scene', 'lead in a watercolor illustration', 'Nordic photography model'],
    kissinskinReasonEn:
      'Soft cloud-skin texture and a blurred lip click perfectly with the translucency and elegance of Summer Cool.',
    shoppingTipsEn: [
      'For foundation, look for "cool light", "P21", "C21" or any pink-base light tone.',
      'For lipsticks, prioritize products labeled "rose", "mauve", or "sheer plum".',
      'Clothes described as "shaved-ice color" or "macaron color" pastels are usually safe.',
      'Make silver your main accessory metal; mix in only a small amount of rose gold.',
      'When dyeing hair, avoid the words "orange", "caramel", "honey" — go for "ash", "lavender", or "blue" instead.',
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
    toneEn: 'Warm',
    taglineEn: 'Deep, rich autumn-forest mood',
    keywordsEn: ['rich', 'composed', 'intellectual', 'natural', 'deep'],
    traitsEn: {
      skin: 'Deeper skin with a yellow undertone. Less natural flush; tans easily in the sun.',
      hair: 'Naturally dark to deep brown. A hint of red, but warm overall.',
      eye: 'Deep brown to dark brown. Iris-vs-white contrast is soft and rich.',
      vibe: 'Intellectual, composed first impression. Often called "mature" or "grown-up."',
    },
    bestColorsEn: {
      clothing: ['mustard', 'khaki', 'burgundy', 'olive green', 'terracotta', 'caramel', 'deep orange', 'brown'],
      makeup: {
        foundation: 'Yellow-base medium tone, semi-matte or velvet finish',
        lip: 'Brick, terracotta, deep red orange, burgundy orange',
        eye: 'Bronze, deep brown, olive, copper',
        blush: 'Terracotta, mustard peach',
      },
      accessory: 'Yellow gold, bronze, copper',
      hair: 'Dark brown, copper brown, chocolate brown, deep orange tones',
    },
    avoidColorsEn: ['pure black', 'ice blue', 'cool pink', 'silver', 'lavender', 'cool pastels'],
    detailParagraphsEn: [
      'Autumn Warm is the rarest of the four seasons in Korea, accounting for only about 10–15% of the population. The skin sits at a medium-to-deep brightness with a yellow undertone, has very little pink or flush, and tans easily. Because there is little visible flush, Autumn Warm types are sometimes (incorrectly) read as "tired-looking" — but in fact this season is the one that handles deep, rich color the best.',
      'The most flattering colors are mustard, khaki, burgundy, olive green, terracotta, and caramel. The signature rule is "mid-to-low brightness, mid saturation warm-deep colors." Think autumn-leaf brown, oak-wine red, forest-moss olive — these are what make Autumn Warm look luxurious.',
      'Makeup direction is "toned-down warm deeps." A yellow-base medium foundation matches the skin best. For lips, rotate brick, terracotta, deep red orange, and burgundy orange. Eyeshadow in bronze, deep brown, olive, and copper makes the eye look mature and deep, and a terracotta blush blended naturally on the apples of the cheeks finishes the look.',
      'Accessory-wise, yellow gold, bronze, and copper match the skin warmth. Silver and white gold make the skin look dull and unwell, so use them sparingly or not at all. For hair, dark brown, copper brown, and chocolate brown are the staples. Heavy bleach into ash territory clashes badly with this skin.',
      'A common Autumn Warm mistake is reaching for a bright pink lip. Pink-based lips clash hard with this skin tone and make the face look pale and sick. Stay strictly within the orange / brown / deep red trio — that is where the intellectual, expensive read of Autumn Warm comes alive.',
    ],
    celebrityVibesEn: ['portrait shot inside an autumn forest', 'wine-cellar editorial', 'lead in a vintage film campaign'],
    kissinskinReasonEn:
      'A deep warm-red lip clicks most strongly with the rich skin tone Autumn Warm naturally has.',
    shoppingTipsEn: [
      'For foundation, look for "warm medium", "Y25", "W25" or similar.',
      'For lipsticks, prioritize products tagged "brick", "terracotta", "copper", or "burgundy orange".',
      'Clothes labeled "mustard", "olive", or "caramel" are usually safe.',
      'Treat gold as your only metal; eliminating silver entirely removes most failures.',
      'For hair, avoid level-8 (light ash) bleach and above — stay at level 6–7 dark brown and shift tone instead.',
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
    toneEn: 'Cool',
    taglineEn: 'Urban, modern, and sharpest in high contrast',
    keywordsEn: ['urban', 'polished', 'charismatic', 'modern', 'chic'],
    traitsEn: {
      skin: 'Pure, almost-white skin with a blue undertone. Little flush; clean contrast.',
      hair: 'Naturally black or blue-black. No red.',
      eye: 'Black-brown to deep black. Sharp iris-vs-white contrast.',
      vibe: 'Urban, cool first impression. Often called "chic."',
    },
    bestColorsEn: {
      clothing: ['true black', 'pure white', 'hot pink', 'royal blue', 'blue-undertone plum', 'emerald', 'cool burgundy', 'cool lemon yellow'],
      makeup: {
        foundation: 'Pink or neutral cool light-to-medium tone, matte or semi-matte',
        lip: 'Black cherry, true red, wine plum, cool hot pink',
        eye: 'Black, deep navy, silver glitter, ice lavender',
        blush: 'Cool rose, sheer plum',
      },
      accessory: 'Silver, platinum, white gold',
      hair: 'Blue black, charcoal, true black, ash silver — never orange',
    },
    avoidColorsEn: ['camel', 'mustard', 'coral', 'peach', 'all yellow-gold tones', 'earth tones'],
    detailParagraphsEn: [
      'Winter Cool is one of the rarer seasons in Korea (about 15–20%), defined by the strong contrast between very pale skin with a blue undertone and very dark hair. The most typical combo is "porcelain skin with no flush + blue-black eyes + pure black hair," and the read is uniformly urban and cool.',
      'The most flattering colors are true black, pure white, hot pink, royal blue, and emerald. The signature rule is "high saturation + extremes of brightness (very bright OR very dark)." Pure colors with no grey muddiness — true red without warmth, plum with a real blue undertone — pair best with the strong contrast Winter Cool already carries.',
      'Makeup direction is "high contrast and cool." Use a pink or neutral cool foundation finished matte or semi-matte. For lips, lean black cherry, true red, wine plum, or cool hot pink for impact. Eyeshadow in black, deep navy, or silver glitter sharpens the eye, and a cool-rose blush in minimal amounts preserves the contrast instead of softening it.',
      'Silver, platinum, and white gold all flatter the skin. Yellow gold is a poor match and should usually be skipped. For hair, cool darks — blue black, charcoal, ash silver — keep the look clean. Warm tones like orange or copper break the natural contrast and look off.',
      'A classic Winter Cool mistake is "I want to look polished, so I will wear a beige or camel coat." Warm neutrals dilute the natural contrast and make the outfit look formless. When you need a neutral, take it cool — charcoal, pure white, cool grey.',
    ],
    celebrityVibesEn: ['silhouette in a city night view', 'black-and-white editorial', 'fashion-week front row'],
    kissinskinReasonEn:
      'High-contrast, modern color most effectively pulls out the urban charisma of Winter Cool.',
    shoppingTipsEn: [
      'For foundation, look for "cool medium", "P25", "C23" or similar cool-neutral codes.',
      'For lipsticks, prioritize "black cherry", "true red", "cool red", or "blue-undertone red".',
      'Black, white, royal blue, and emerald are nearly always safe in clothing.',
      'Skip gold accessories entirely — silver and white gold are the safe defaults.',
      'Replace beige and camel with charcoal or cool grey to make the tone come alive.',
    ],
  },
}

export const SEASON_ORDER: SeasonCode[] = ['spring', 'summer', 'autumn', 'winter']

export function getSeasonBySlug(slug: string): PersonalColorType | null {
  return SEASON_ORDER.map(c => PERSONAL_COLOR_TYPES[c]).find(t => t.slug === slug.toLowerCase()) ?? null
}
