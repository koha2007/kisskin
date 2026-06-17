// Perfume Type — 6 families (Floral / Citrus / Woody / Amber / Fresh / Gourmand)
// References: global fragrance industry classification (Estée Lauder, Le Labo, Fragrantica 2024)
// "Oriental" deprecated post-2018 — replaced by "Amber" for cultural neutrality.

import type { IdentityCardData } from '../identityCard/types'

export type PerfumeTypeCode = 'floral' | 'citrus' | 'woody' | 'amber' | 'fresh' | 'gourmand'

export interface PerfumeType {
  code: PerfumeTypeCode
  slug: string
  card: IdentityCardData          // 9:16 정체성 카드 데이터 (FINAL §3-4/3-5/3-6)
  koName: string            // "로맨틱 플로럴"
  koFamily: string          // "Floral" — 영문 계열명 한글 컨텍스트
  enName: string
  emoji: string
  primaryColor: string
  accentColor: string
  tagline: string
  taglineEn?: string
  features: string[]              // 3~4 핵심 특징
  featuresEn?: string[]
  detailParagraphs: string[]      // 5 문단 (정체성/대상/상황·계절/메이크업 매치/주의)
  detailParagraphsEn?: string[]
  scene: {                        // 상황·계절·시간대
    season: string
    occasion: string
    timeOfDay: string
    avoidSituation: string
  }
  sceneEn?: {
    season: string
    occasion: string
    timeOfDay: string
    avoidSituation: string
  }
  makeupMatch: {                  // 함께 어울리는 메이크업
    base: string
    lip: string
    eye: string
    cheek: string
  }
  makeupMatchEn?: {
    base: string
    lip: string
    eye: string
    cheek: string
  }
  cautions: string[]              // 주의할 점 (3개)
  cautionsEn?: string[]
  kissinskin: {                   // 매칭 메이크업 시뮬레이터 룩
    women: string
    men: string
    reason: string
  }
  kissinskinReasonEn?: string
  celebrityVibes: string[]
  celebrityVibesEn?: string[]
}

export const PERFUME_TYPES: Record<PerfumeTypeCode, PerfumeType> = {
  floral: {
    code: 'floral',
    slug: 'floral',
    card: {
      nickname: '꽃밭의 사람',
      enName: 'FLORAL SOUL',
      identityLine: '우아하고 로맨틱한 분위기를 풍기는 사람',
      hashtags: ['#플로럴', '#로맨틱향', '#꽃향기', '#여성스러움'],
      gradient: ['#070953', '#ff7eb3'],
    },
    koName: '로맨틱 플로럴',
    koFamily: 'Floral',
    enName: 'Floral',
    emoji: '🌸',
    primaryColor: '#ec4899',
    accentColor: '#f472b6',
    tagline: '봄날 정원의 꽃잎이 흩날리는 듯한 우아한 향',
    features: [
      '장미·자스민·피오니·프리지아 등 꽃 추출물 중심',
      '솔리플로럴(단일 꽃)과 부케형(복합 꽃) 두 갈래',
      '첫인상이 부드럽고 다가가기 쉬운 인상',
      '봄·초여름에 발산력이 가장 좋음',
    ],
    detailParagraphs: [
      '플로럴은 향수 카테고리 중 가장 클래식한 계열입니다. 장미·자스민·일랑일랑·피오니·프리지아 같은 꽃 추출물이 핵심이며, 한 가지 꽃만 강조하는 "솔리플로럴"과 여러 꽃을 조합한 "플로럴 부케" 두 갈래로 나뉩니다. 향수 산업의 거의 모든 베스트셀러 라인업에 플로럴이 한 자리씩 들어 있을 정도로 보편적이면서도 고전적입니다.',
      '플로럴 향이 어울리는 사람은 부드럽고 친근한 인상을 주고 싶은 사람, 클래식한 페미닌 무드를 좋아하는 사람입니다. 첫인상에서 "다가가기 쉬운 사람"으로 인식되기 때문에 데이트·면접·결혼식 등 호감을 사야 하는 자리에 강력합니다. 다만 너무 진하면 "올드"한 느낌을 줄 수 있어 20~30대라면 모던 플로럴(피오니·프리지아 베이스)부터 시작하는 것이 안전합니다.',
      '계절은 봄과 초여름이 베스트입니다. 따뜻한 햇살 아래서 꽃향이 부드럽게 퍼지는 효과가 극대화됩니다. 상황은 사무실·카페·갤러리 같은 일상 공간에서 무난하게 사용 가능하며, 강한 술자리나 운동 후엔 어울리지 않습니다. 시간대는 낮·이른 저녁이 자연스럽고, 한밤중 파티에는 다소 가벼울 수 있습니다.',
      '함께 어울리는 메이크업은 핑크·코랄·피치 톤이 중심입니다. 입술은 글로시한 핑크 베리, 볼은 자연스러운 코랄 블러쉬, 아이는 옅은 핑크 또는 라벤더 톤. kissinskin AI 메이크업 시뮬레이터의 "Romantic Floral" 또는 "K-pop Idol" 룩과 가장 자연스럽게 매칭됩니다. 베이스는 약간의 글로우가 살아있는 표현이 잘 어울립니다.',
      '주의할 점은 세 가지입니다. 첫째, 헤비한 장미향은 20대에게 부담스러울 수 있으니 모던 플로럴부터 시작할 것. 둘째, 향을 입힐 땐 손목·귀 뒤 2포인트면 충분하니 과량 분사를 피할 것. 셋째, 다른 사람이 가까이서 인식할 만큼만 발산되어야 하므로 좁은 공간(엘리베이터·작은 회의실)에서는 1푸쉬 이하로 조절할 것.',
    ],
    scene: {
      season: '봄·초여름 (3~6월)',
      occasion: '데이트·면접·결혼식·갤러리·카페',
      timeOfDay: '낮·이른 저녁',
      avoidSituation: '술자리·운동 직후·한밤 클럽',
    },
    makeupMatch: {
      base: '약간의 글로우가 살아있는 자연스러운 베이스',
      lip: '글로시 핑크 베리 / 코랄 틴트',
      eye: '옅은 핑크 또는 라벤더 톤',
      cheek: '자연스러운 코랄 블러쉬',
    },
    cautions: [
      '헤비 장미향은 20~30대에게 올드한 인상을 줄 수 있음 — 모던 플로럴(피오니·프리지아)부터 시작',
      '손목·귀 뒤 2포인트면 충분, 과량 분사 금지',
      '좁은 공간에서는 1푸쉬 이하로 양 조절',
    ],
    kissinskin: {
      women: 'Romantic Floral',
      men: 'Skincare Hybrid',
      reason: '플로럴 향수의 부드러움과 글로시 핑크 메이크업이 만나면 봄날의 우아한 페미닌 무드가 완성됩니다.',
    },
    kissinskinReasonEn: 'The softness of a floral and a glossy pink makeup come together into an elegant, feminine spring mood.',
    celebrityVibes: ['클래식 광고 모델', '봄 화보 표지', '결혼식 신부'],
    celebrityVibesEn: ['Classic campaign model', 'Spring cover editorial', 'A wedding-day bride'],
    taglineEn: 'An elegant scent, like petals drifting through a spring garden',
    featuresEn: [
      'Built on flower extracts — rose, jasmine, peony, freesia',
      'Splits into soliflore (a single flower) and bouquet (many flowers)',
      'Reads soft and approachable on first impression',
      'Projects best in spring and early summer',
    ],
    detailParagraphsEn: [
      'Floral is the most classic of all fragrance families. It centers on flower extracts — rose, jasmine, ylang-ylang, peony, freesia — and divides into two branches: the "soliflore," which spotlights a single flower, and the "floral bouquet," which blends several. It is so universal that nearly every bestselling lineup in the industry keeps a floral in its rotation.',
      'Floral suits people who want to come across as soft and friendly, and anyone who loves a classic feminine mood. Because it reads as "easy to approach," it is powerful for dates, interviews, and weddings — any setting where you want to be liked. If it is too heavy it can feel dated, so if you are in your 20s or 30s, start with a modern floral (a peony or freesia base) to play it safe.',
      'Spring and early summer are its sweet spot, when warm sunlight lets the flowers bloom softly into the air. It works easily in everyday spaces — the office, a café, a gallery — but is not a match for heavy drinking nights or right after a workout. Daytime and early evening feel most natural; for a late-night party it can read a touch light.',
      'For makeup it pairs with pink, coral, and peach tones: a glossy pink-berry lip, a natural coral blush, and a soft pink or lavender eye. In the kissinskin AI makeup simulator it matches the "Romantic Floral" or "K-pop Idol" looks most naturally. A base with a little glow left in suits it well.',
      'Three things to watch. First, heavy rose can feel too mature in your 20s — begin with a modern floral. Second, two points (the wrist and behind the ear) are plenty, so do not over-spray. Third, it only needs to register to someone standing close, so in tight spaces (an elevator, a small meeting room) keep it to one spray or less.',
    ],
    sceneEn: {
      season: 'Spring & early summer (Mar–Jun)',
      occasion: 'Dates, interviews, weddings, galleries, cafés',
      timeOfDay: 'Daytime & early evening',
      avoidSituation: 'Drinking nights, right after a workout, late-night clubs',
    },
    makeupMatchEn: {
      base: 'A natural base with a hint of glow',
      lip: 'Glossy pink-berry / coral tint',
      eye: 'Soft pink or lavender tones',
      cheek: 'Natural coral blush',
    },
    cautionsEn: [
      'Heavy rose can read dated in your 20s–30s — start with a modern floral (peony or freesia)',
      'Two points (the wrist and behind the ear) are enough — never over-spray',
      'In tight spaces, keep it to one spray or less',
    ],
  },

  citrus: {
    code: 'citrus',
    slug: 'citrus',
    card: {
      nickname: '상쾌한 아침의 사람',
      enName: 'FRESH CITRUS',
      identityLine: '활기차고 청량한 첫인상의 사람',
      hashtags: ['#시트러스', '#상큼향', '#청량함', '#데일리향수'],
      gradient: ['#070953', '#ffd86b'],
    },
    koName: '상큼 시트러스',
    koFamily: 'Citrus',
    enName: 'Citrus',
    emoji: '🍋',
    primaryColor: '#f59e0b',
    accentColor: '#fbbf24',
    tagline: '막 짜낸 레몬·자몽처럼 깨끗하고 활기찬 향',
    features: [
      '베르가못·레몬·자몽·라임·만다린 중심',
      '톱노트가 가장 가볍고 지속력은 4시간 내외로 짧음',
      '발산력 좋고 호불호가 가장 적은 안전한 선택',
      '여름·낮 시간에 효과가 극대화됨',
    ],
    detailParagraphs: [
      '시트러스 계열은 베르가못·레몬·자몽·라임·만다린 같은 감귤류 추출물이 중심입니다. 가장 가벼운 톱노트(상단 향)를 가지며, 발산력은 좋지만 지속력이 짧은 것이 특징이에요. 일반적으로 4시간 내외에서 사라지는 경우가 많아 하루 2~3번 덧뿌리는 게 정석입니다.',
      '시트러스 향이 어울리는 사람은 깔끔하고 활기찬 이미지를 주고 싶은 사람, 일 잘하는 프로페셔널 이미지를 원하는 사람입니다. 향에 민감한 사람도 부담스러워하지 않는 범용성이 가장 큰 장점이에요. "씻고 막 나온 듯한 사람"이라는 첫인상은 모든 자리에서 안전합니다.',
      '계절은 봄·여름이 베스트입니다. 더운 날씨에 무거운 향은 답답하지만 시트러스는 시원한 느낌을 줍니다. 오피스, 회의, 운동 후, 점심 미팅 등 청결한 인상이 중요한 자리에 강력합니다. 저녁 데이트나 클럽엔 약간 가볍지만, 데일리 향수로는 가장 무난한 선택지입니다.',
      '함께 어울리는 메이크업은 내추럴·미니멀 룩과 환상의 궁합. 누드 톤 베이스, 살구빛 블러쉬, 클리어한 입술 글로스가 어울립니다. "꾸안꾸" 룩의 완성. kissinskin AI 메이크업 시뮬레이터에서 "Natural Glow" 또는 "Clean Citrus" 룩과 매칭됩니다. 강한 컬러 메이크업과는 향이 충돌하지 않으면서도 묻혀버리는 경향이 있습니다.',
      '주의할 점은 세 가지입니다. 첫째, 지속력이 짧다는 점을 미리 알고 사용해야 함 — 손목·휴대용 미니 사이즈를 가방에 챙기면 좋음. 둘째, 일부 시트러스는 광독성(햇빛에 반응)이 있어 향수 뿌린 부위에 햇빛 직사광선이 닿으면 색소침착 위험이 있으므로 옷에 살짝 뿌리는 것도 방법. 셋째, 강한 임팩트가 부족하므로 첫 만남에서 인상 남기기엔 부족할 수 있음.',
    ],
    scene: {
      season: '봄·여름 (4~9월)',
      occasion: '오피스·회의·점심 미팅·운동 후·첫 만남',
      timeOfDay: '낮 (오전~오후)',
      avoidSituation: '저녁 데이트·격식 디너·한겨울 야외',
    },
    makeupMatch: {
      base: '누드 톤 글로우 베이스',
      lip: '클리어 글로스 / 누드 핑크 틴트',
      eye: '브라운 / 베이지 그라데이션',
      cheek: '살구빛 코랄 블러쉬 가볍게',
    },
    cautions: [
      '지속력 짧음 — 손목·휴대용 미니 사이즈 챙겨 점심 후 덧뿌리기',
      '일부 시트러스는 광독성 — 햇빛 닿는 부위 색소침착 주의 (옷에 살짝 분사)',
      '첫 만남 임팩트는 약함 — 향수로 인상 남기고 싶다면 아쉬울 수 있음',
    ],
    kissinskin: {
      women: 'Natural Glow',
      men: 'Skincare Hybrid',
      reason: '시트러스의 청량함이 누드 톤 글로우 베이스와 만나면 가장 자연스러운 "꾸안꾸" 데일리 룩이 완성됩니다.',
    },
    kissinskinReasonEn: 'The crispness of citrus meets a nude-toned glow base to complete the most natural, effortless everyday look.',
    celebrityVibes: ['커리어 우먼', '아침 화보', '운동 후 클린 룩'],
    celebrityVibesEn: ['Career woman', 'A bright morning editorial', 'The clean post-workout look'],
    taglineEn: 'Clean and lively, like just-squeezed lemon and grapefruit',
    featuresEn: [
      'Centers on bergamot, lemon, grapefruit, lime, mandarin',
      'The lightest top notes — wear time is short, around 4 hours',
      'Projects well and is the safest, most universally liked choice',
      'At its best in summer and during the day',
    ],
    detailParagraphsEn: [
      'The citrus family centers on bergamot, lemon, grapefruit, lime, and mandarin. It carries the lightest top notes of all: great projection but short wear time. Most citrus fades within about four hours, so reapplying two or three times a day is standard practice.',
      'Citrus suits people who want a clean, energetic image, or the polished look of someone who is good at their job. Its biggest strength is versatility — even people sensitive to scent rarely find it overwhelming. The "just-showered" first impression is safe in any setting.',
      'Spring and summer are its sweet spot: heavy scents feel stuffy in the heat, but citrus reads as cool and crisp. It is powerful in offices, meetings, after a workout, or a lunch catch-up — anywhere a clean impression matters. It is a touch light for an evening date or a club, but it is the most foolproof choice for an everyday scent.',
      'For makeup it is a perfect match with natural, minimal looks — a nude-toned base, apricot blush, and a clear lip gloss. It completes the effortless "no-makeup makeup" look. In the kissinskin AI makeup simulator it pairs with the "Natural Glow" or "Clean Citrus" looks. Bold color makeup will not clash, but the scent tends to get buried under it.',
      'Three things to watch. First, know going in that it does not last — keep a wrist-sized travel bottle in your bag. Second, some citrus oils are phototoxic (they react to sunlight), so spraying onto skin in direct sun risks pigmentation; misting onto clothing instead is one workaround. Third, it lacks a strong punch, so it may fall short if you want to make a lasting impression at a first meeting.',
    ],
    sceneEn: {
      season: 'Spring & summer (Apr–Sep)',
      occasion: 'Office, meetings, lunch catch-ups, post-workout, first meetings',
      timeOfDay: 'Daytime (morning to afternoon)',
      avoidSituation: 'Evening dates, formal dinners, mid-winter outdoors',
    },
    makeupMatchEn: {
      base: 'Nude-toned glow base',
      lip: 'Clear gloss / nude-pink tint',
      eye: 'Brown / beige gradient',
      cheek: 'A light wash of apricot-coral blush',
    },
    cautionsEn: [
      'Short wear time — carry a mini bottle and reapply after lunch',
      'Some citrus is phototoxic — beware pigmentation on sun-exposed skin (mist onto clothing instead)',
      'Weak first-meeting impact — underwhelming if you want a scent that makes a statement',
    ],
  },

  woody: {
    code: 'woody',
    slug: 'woody',
    card: {
      nickname: '깊은 숲의 사람',
      enName: 'DEEP WOODY',
      identityLine: '차분하고 깊이 있어 신뢰가 가는 사람',
      hashtags: ['#우디', '#차분한향', '#포근함', '#시그니처향'],
      gradient: ['#070953', '#9b6b3e'],
    },
    koName: '포근 우디',
    koFamily: 'Woody',
    enName: 'Woody',
    emoji: '🌳',
    primaryColor: '#92400e',
    accentColor: '#b45309',
    tagline: '비 온 뒤 숲속을 걷는 듯한 깊고 따뜻한 향',
    features: [
      '샌달우드·시더우드·베티버·패촐리 중심',
      '베이스노트 위치 — 지속력이 강하고 시간이 갈수록 따뜻해짐',
      '비즈니스·격식 자리에서 신뢰감을 더해줌',
      '가을·겨울에 가장 매력적으로 발산됨',
    ],
    detailParagraphs: [
      '우디 계열은 샌달우드·시더우드·베티버·패촐리·오크모스 같은 나무·뿌리 추출물이 핵심입니다. 베이스노트(하단 향)에 위치해 지속력이 강하고, 시간이 지날수록 따뜻하게 변화하는 것이 특징입니다. 시향 후 30분~1시간 지나야 진짜 향이 드러나므로 짧은 시간 테스트로 판단하지 마세요.',
      '우디 향이 어울리는 사람은 차분하고 신뢰감 있는 인상을 주고 싶은 사람, 자기만의 스타일이 확고한 사람입니다. 우디는 "내면이 깊어 보이는 향"으로 인식되며, 비즈니스 미팅·중요한 자리에서 무게감을 더해줍니다. 유니섹스 라인업도 많아 남녀 모두 적합한 카테고리입니다.',
      '계절은 가을·겨울이 베스트입니다. 추운 날씨에 우디의 따뜻함이 극대화됩니다. 저녁 모임, 격식 있는 자리, 가을 데이트, 비 오는 날에 강력. 한여름 야외나 운동 시엔 다소 무겁습니다. 시간대는 저녁이 가장 자연스럽고, 비 오는 낮에도 잘 어울립니다.',
      '함께 어울리는 메이크업은 모카·브라운·번트 오렌지 같은 깊은 톤. 스모키한 아이, 매트한 베이지 입술, 컨투어링이 들어간 베이스. kissinskin AI 메이크업 시뮬레이터에서 "Modern Smoky" 또는 "Autumn Sophisticate" 룩과 매칭됩니다. 글로시·핑크 톤 메이크업과는 톤이 충돌하므로 매트한 마감 위주로 잡는 것이 좋습니다.',
      '주의할 점은 세 가지입니다. 첫째, 우디는 강한 베이스라 처음엔 무겁게 느껴질 수 있으니 점진적 적응 — 1~2 푸쉬부터 시작. 둘째, 좁은 공간(엘리베이터·작은 카페)에서 주변에 부담을 줄 수 있으니 양 조절 필수. 셋째, 한 자루를 너무 오래 보유하기보다 봄·여름엔 시트러스, 가을·겨울엔 우디로 계절별 분리 운영하면 효율적.',
    ],
    scene: {
      season: '가을·겨울 (10~2월)',
      occasion: '비즈니스 미팅·격식 디너·가을 데이트·문화 공연',
      timeOfDay: '저녁 / 비 오는 낮',
      avoidSituation: '한여름 야외·격렬 운동·작은 회의실',
    },
    makeupMatch: {
      base: '컨투어링 들어간 매트 베이스',
      lip: '매트한 베이지·번트 오렌지',
      eye: '스모키 브라운 / 다크 브론즈',
      cheek: '브라운 컨투어와 자연스럽게 블렌딩',
    },
    cautions: [
      '강한 베이스 — 1~2 푸쉬부터 점진적 적응 권장',
      '좁은 공간(엘리베이터·작은 카페) 부담 — 양 조절 필수',
      '계절 분리 운영 — 봄/여름엔 시트러스, 가을/겨울엔 우디',
    ],
    kissinskin: {
      women: 'Modern Smoky',
      men: 'Monochrome',
      reason: '우디 향의 깊이와 매트한 스모키 메이크업이 만나면 가을밤의 차분한 카리스마가 완성됩니다.',
    },
    kissinskinReasonEn: 'The depth of a woody scent and a matte smoky makeup come together into the quiet charisma of an autumn night.',
    celebrityVibes: ['에디토리얼 모델', '재즈바 분위기', '가을 영화 주연'],
    celebrityVibesEn: ['Editorial model', 'A jazz-bar mood', 'The lead in an autumn film'],
    taglineEn: 'Deep and warm, like walking through a forest after the rain',
    featuresEn: [
      'Centers on sandalwood, cedarwood, vetiver, patchouli',
      'Lives in the base notes — long-lasting and grows warmer over time',
      'Adds a sense of trust in business and formal settings',
      'Projects most beautifully in autumn and winter',
    ],
    detailParagraphsEn: [
      'The woody family is built on wood and root extracts — sandalwood, cedarwood, vetiver, patchouli, oakmoss. It sits in the base notes, so it lasts long and turns warmer as time passes. The true scent only reveals itself 30 minutes to an hour after spraying, so do not judge it from a quick test strip.',
      'Woody suits people who want to seem calm and trustworthy, and those with a firm sense of personal style. It reads as a scent "with depth," lending weight to business meetings and important occasions. Many woody lineups are unisex, making it a fitting family for everyone.',
      'Autumn and winter are its sweet spot, when cold weather amplifies its warmth. It is powerful for evening gatherings, formal occasions, autumn dates, and rainy days. It can feel heavy for mid-summer outdoors or a workout. Evening is most natural, though it also suits a rainy afternoon.',
      'For makeup it pairs with deep tones — mocha, brown, burnt orange: a smoky eye, a matte beige lip, and a contoured base. In the kissinskin AI makeup simulator it matches the "Modern Smoky" or "Autumn Sophisticate" looks. Glossy, pink-toned makeup clashes with it, so keep the finish mostly matte.',
      'Three things to watch. First, woody is a strong base and can feel heavy at first, so ease in — start with one or two sprays. Second, it can overwhelm others in tight spaces (an elevator, a small café), so control the amount. Third, rather than keeping one bottle year-round, rotate by season — citrus in spring and summer, woody in autumn and winter — for the best effect.',
    ],
    sceneEn: {
      season: 'Autumn & winter (Oct–Feb)',
      occasion: 'Business meetings, formal dinners, autumn dates, cultural performances',
      timeOfDay: 'Evening / a rainy afternoon',
      avoidSituation: 'Mid-summer outdoors, intense workouts, small meeting rooms',
    },
    makeupMatchEn: {
      base: 'A matte base with contouring',
      lip: 'Matte beige / burnt orange',
      eye: 'Smoky brown / dark bronze',
      cheek: 'Blended naturally into a brown contour',
    },
    cautionsEn: [
      'A strong base — ease in with one or two sprays at first',
      'Can overwhelm in tight spaces (elevators, small cafés) — control the amount',
      'Rotate by season — citrus in spring/summer, woody in autumn/winter',
    ],
  },

  amber: {
    code: 'amber',
    slug: 'amber',
    card: {
      nickname: '관능적인 호박빛의 사람',
      enName: 'AMBER ALLURE',
      identityLine: '따뜻하고 깊은 잔향으로 강렬한 인상을 남기는 사람',
      hashtags: ['#앰버', '#관능향', '#깊은잔향', '#밤향수'],
      gradient: ['#070953', '#d99058'],
    },
    koName: '관능 앰버',
    koFamily: 'Amber',
    enName: 'Amber',
    emoji: '🔥',
    primaryColor: '#c2410c',
    accentColor: '#ea580c',
    tagline: '동방의 사원에서 피어오르는 듯한 신비롭고 관능적인 향',
    features: [
      '바닐라·벤조인·라브다넘·통카빈·머스크 중심',
      '발산력·지속력 모두 가장 강함 — 8시간 이상 유지',
      '"기억에 남는 향" — 호불호가 가장 갈리는 카테고리',
      '가을·겨울 저녁에 가장 매력적',
    ],
    detailParagraphs: [
      '앰버 계열은 (구 "오리엔탈" — 2018년 이후 글로벌 향수 업계에서 폐기 중인 용어) 바닐라·벤조인·라브다넘·통카빈·머스크 같은 진하고 달콤한 베이스 노트가 중심입니다. 발산력과 지속력 모두 강하며, 한 번 뿌리면 8시간 이상 머무르는 경우도 많아요. 향수 카테고리 중 가장 "체취화"되는 계열입니다.',
      '앰버 향이 어울리는 사람은 존재감 있는 인상을 주고 싶은 사람, 미스터리한 매력을 원하는 사람입니다. "기억에 남는 향"으로 인식되며, 처음 만난 사람도 다시 떠올리게 만드는 임팩트가 있어요. 다만 호불호가 가장 갈리는 계열이기도 합니다. 시그니처 향수로 가져가기 좋습니다.',
      '계절은 가을·겨울 저녁이 베스트입니다. 추운 날씨에 따뜻하게 피어오르며, 어둠 속에서 더욱 매력적입니다. 저녁 데이트, 파티, 공연, 와인바 등 분위기 있는 자리에 강력. 오피스·면접·운동엔 부적합. 낮 시간엔 시트러스, 밤엔 앰버처럼 분리 운영하는 것도 좋은 방법입니다.',
      '함께 어울리는 메이크업은 와인·버건디·딥 레드 톤. 진한 레드 립, 스모키 아이, 글로우한 베이스. 글래머러스 룩의 완성. kissinskin AI 메이크업 시뮬레이터에서 "Blood Lip" 또는 "Glamour Evening" 룩과 매칭됩니다. 누드·내추럴 메이크업과는 향의 강도가 맞지 않으므로 메이크업도 강하게 잡아야 균형이 맞습니다.',
      '주의할 점은 세 가지입니다. 첫째, 가장 강한 계열이라 양 조절이 핵심 — 한 번에 1푸쉬 이상이면 주변에 부담. 둘째, 20대 초반의 캐주얼 룩과는 다소 안 어울리며 30대 이상의 성숙한 분위기에 더 자연스럽게 녹아듦. 셋째, 사무실·면접 등 격식 있는 낮 자리에는 부적합 — 같은 사람이라도 향수는 TPO 분리.',
    ],
    scene: {
      season: '가을·겨울 (10~2월)',
      occasion: '저녁 데이트·파티·와인바·공연',
      timeOfDay: '저녁·밤',
      avoidSituation: '오피스·면접·낮 미팅·운동',
    },
    makeupMatch: {
      base: '글로우한 베이스 + 컨투어',
      lip: '진한 레드 / 버건디 / 다크 와인',
      eye: '스모키 브라운 / 메탈릭 다크',
      cheek: '와인 톤 블러쉬 광대 위',
    },
    cautions: [
      '가장 강한 계열 — 한 번에 1푸쉬 이하로 양 조절',
      '20대 초반 캐주얼 룩과는 부조화 — 30대 이상 성숙한 무드에 더 자연스러움',
      '낮·사무실·격식 디너 부적합 — 향수 TPO 분리',
    ],
    kissinskin: {
      women: 'Blood Lip',
      men: 'Monochrome',
      reason: '앰버의 관능과 진한 레드 립이 만나면 잊을 수 없는 글래머러스한 저녁 인상이 완성됩니다.',
    },
    kissinskinReasonEn: 'The sensuality of amber meets a bold red lip to complete an unforgettable, glamorous evening impression.',
    celebrityVibes: ['배우의 레드카펫', '재즈 보컬', '명작 영화 여주인공'],
    celebrityVibesEn: ['An actress on the red carpet', 'A jazz vocalist', 'The heroine of a classic film'],
    taglineEn: 'Mysterious and sensual, like incense rising in an Eastern temple',
    featuresEn: [
      'Centers on vanilla, benzoin, labdanum, tonka bean, musk',
      'The strongest in both projection and longevity — lasts 8+ hours',
      'A "memorable" scent — the most polarizing family',
      'Most alluring on autumn and winter evenings',
    ],
    detailParagraphsEn: [
      'The amber family — formerly called "oriental," a term the global industry has been retiring since 2018 — centers on rich, sweet base notes like vanilla, benzoin, labdanum, tonka bean, and musk. Strong in both projection and longevity, a single spray often lingers eight hours or more. It is the family that melds most into your own skin scent.',
      'Amber suits people who want a commanding presence and a sense of mystery. It reads as a "memorable" scent, the kind that makes even a first acquaintance think of you again. That said, it is also the most polarizing family. It makes a great signature fragrance.',
      'Autumn and winter evenings are its sweet spot — it blooms warmly in the cold and grows even more alluring in the dark. It is powerful for evening dates, parties, performances, and wine bars. It is unsuited to the office, interviews, or workouts. Splitting your wardrobe — citrus by day, amber by night — works well.',
      'For makeup it pairs with wine, burgundy, and deep-red tones: a bold red lip, a smoky eye, and a glowing base. It completes a glamorous look. In the kissinskin AI makeup simulator it matches the "Blood Lip" or "Glamour Evening" looks. Nude, natural makeup does not match its intensity, so go strong on the makeup too for balance.',
      'Three things to watch. First, it is the strongest family, so the amount is everything — more than one spray at a time can overwhelm those around you. Second, it does not quite fit a casual look in your early 20s; it settles in more naturally on a mature, 30-plus mood. Third, it is unsuited to daytime formal settings like the office or interviews — even for the same person, keep your fragrance to the occasion.',
    ],
    sceneEn: {
      season: 'Autumn & winter (Oct–Feb)',
      occasion: 'Evening dates, parties, wine bars, performances',
      timeOfDay: 'Evening & night',
      avoidSituation: 'Office, interviews, daytime meetings, workouts',
    },
    makeupMatchEn: {
      base: 'A glowing base with contour',
      lip: 'Deep red / burgundy / dark wine',
      eye: 'Smoky brown / dark metallic',
      cheek: 'Wine-toned blush high on the cheekbones',
    },
    cautionsEn: [
      'The strongest family — keep it to one spray or less at a time',
      'Clashes with an early-20s casual look — more natural on a mature, 30-plus mood',
      'Unsuited to daytime, office, or formal dinners — match your fragrance to the occasion',
    ],
  },

  fresh: {
    code: 'fresh',
    slug: 'fresh',
    card: {
      nickname: '청량한 바람의 사람',
      enName: 'FRESH BREEZE',
      identityLine: '깨끗하고 시원한 첫인상을 주는 사람',
      hashtags: ['#프레시', '#청량향', '#깨끗한향', '#여름향수'],
      gradient: ['#070953', '#6bd3d8'],
    },
    koName: '청량 프레시',
    koFamily: 'Fresh',
    enName: 'Fresh',
    emoji: '💧',
    primaryColor: '#06b6d4',
    accentColor: '#22d3ee',
    tagline: '막 샤워하고 나온 듯한 깨끗하고 투명한 향',
    features: [
      '아쿠아틱·그린·오존 노트 중심',
      '시트러스와 비슷하나 더 차갑고 미네랄 같음',
      '비누·세제 향과 비슷한 친근함',
      '호불호가 가장 적은 안전한 선택지',
    ],
    detailParagraphs: [
      '프레시 계열은 아쿠아틱(바다 노트)·그린(풀잎·잎사귀)·오존(공기) 같은 청량한 노트가 중심입니다. 시트러스와 비슷하지만 더 차갑고 미네랄 같은 느낌. 비누·세제 향과 비슷한 친근함이 특징입니다. 한국에서는 "비누향 향수"라는 카테고리로도 자주 불립니다.',
      '프레시 향이 어울리는 사람은 깔끔하고 단정한 이미지를 원하는 사람, 향에 부담을 주고 싶지 않은 사람입니다. "씻고 나온 듯한 사람"으로 인식되며, 호불호가 가장 적은 안전한 선택지예요. 학생·신입사원·면접 등 첫인상 관리가 중요한 시기에 가장 추천됩니다.',
      '계절은 여름이 베스트입니다. 더운 날씨에 시원함을 더해줍니다. 오피스, 학교, 운동 후, 첫 만남 등 청결함이 중요한 모든 자리에 강력. 격식 있는 저녁 모임이나 로맨틱한 자리엔 다소 평범할 수 있습니다. 시간대는 낮이 가장 자연스럽고, 야간 모임에서는 약간 가볍게 느껴질 수 있습니다.',
      '함께 어울리는 메이크업은 미니멀·내추럴 룩의 완성. 글로우 베이스, 옅은 핑크 블러쉬, 클리어 글로스. "물광 피부" 룩과 환상 궁합. kissinskin AI 메이크업 시뮬레이터에서 "Glass Skin" 또는 "Minimal Natural" 룩과 매칭됩니다. 진한 컬러 메이크업과는 향의 인상이 분리되므로 가벼운 톤으로 통일하는 것이 좋습니다.',
      '주의할 점은 세 가지입니다. 첫째, 가장 평범하다는 게 양날의 검 — 너무 흔한 향이 될 수 있으니 옷·메이크업·헤어 스타일링에 신경 써야 시너지가 남. 둘째, 지속력이 약해 점심 후 한 번 더 뿌리는 게 정석. 셋째, 시그니처 향수보다는 "기본 데일리"로 포지셔닝 — 다른 향수와 로테이션 운영 추천.',
    ],
    scene: {
      season: '여름 (6~8월)',
      occasion: '학교·오피스·면접·첫 만남·운동 후',
      timeOfDay: '낮 (오전~오후)',
      avoidSituation: '격식 디너·로맨틱 데이트·겨울 야외',
    },
    makeupMatch: {
      base: '글로우 / 물광 베이스',
      lip: '클리어 글로스 / 옅은 핑크 틴트',
      eye: '베이지 옅게 / 펄 없이',
      cheek: '옅은 핑크 자연스럽게',
    },
    cautions: [
      '너무 흔한 향이 될 수 있음 — 옷·헤어·메이크업 스타일링으로 차별점 확보',
      '지속력 약함 — 점심 후 덧뿌리기 필요',
      '시그니처보다 "기본 데일리" 포지셔닝 — 다른 향수와 로테이션 권장',
    ],
    kissinskin: {
      women: 'Glass Skin',
      men: 'Skincare Hybrid',
      reason: '프레시 향의 청량함과 물광 베이스가 만나면 가장 깨끗하고 호감 가는 첫인상이 완성됩니다.',
    },
    kissinskinReasonEn: 'The crispness of a fresh scent meets a dewy base to complete the cleanest, most likable first impression.',
    celebrityVibes: ['신입 사원', '여름 광고', '캠퍼스 첫인상'],
    celebrityVibesEn: ['A new hire', 'A summer commercial', 'The first-day-on-campus impression'],
    taglineEn: 'Clean and transparent, like stepping out of a fresh shower',
    featuresEn: [
      'Centers on aquatic, green, and ozonic notes',
      'Like citrus, but cooler and more mineral',
      'The familiar feel of soap and clean laundry',
      'The safest, least polarizing choice',
    ],
    detailParagraphsEn: [
      'The fresh family centers on cool, crisp notes — aquatic (sea notes), green (leaves and stems), and ozonic (open air). It is like citrus but colder and more mineral, with the familiar feel of soap or clean laundry. In Korea it is often called a "soap-scent" fragrance.',
      'Fresh suits people who want a clean, neat image and do not want their scent to impose. It reads as "someone who just showered," and it is the safest, least polarizing choice. It is the top pick for students, new hires, and interviews — any time first impressions matter most.',
      'Summer is its sweet spot, adding a cooling touch in the heat. It is powerful in the office, at school, after a workout, on first meetings — anywhere cleanliness counts. It can feel a little plain for a formal evening or a romantic setting. Daytime is most natural; at a night gathering it may read slightly light.',
      'For makeup it completes a minimal, natural look — a glowy base, a soft pink blush, a clear gloss. It pairs perfectly with "glass skin." In the kissinskin AI makeup simulator it matches the "Glass Skin" or "Minimal Natural" looks. Bold color makeup separates from the scent, so keep everything in light tones.',
      'Three things to watch. First, being the most ordinary is a double-edged sword — it can become too common, so put thought into clothing, makeup, and hair to keep the synergy. Second, it is weak on longevity, so reapplying once after lunch is standard. Third, position it as a "basic daily" rather than a signature — rotating it with other fragrances works best.',
    ],
    sceneEn: {
      season: 'Summer (Jun–Aug)',
      occasion: 'School, office, interviews, first meetings, post-workout',
      timeOfDay: 'Daytime (morning to afternoon)',
      avoidSituation: 'Formal dinners, romantic dates, winter outdoors',
    },
    makeupMatchEn: {
      base: 'A glowy, dewy base',
      lip: 'Clear gloss / soft pink tint',
      eye: 'A light beige, no shimmer',
      cheek: 'A soft, natural pink',
    },
    cautionsEn: [
      'Can become too common — set yourself apart through clothing, hair, and makeup',
      'Weak longevity — reapply after lunch',
      'Position it as a "basic daily" rather than a signature — rotate with other scents',
    ],
  },

  gourmand: {
    code: 'gourmand',
    slug: 'gourmand',
    card: {
      nickname: '달콤한 디저트의 사람',
      enName: 'SWEET GOURMAND',
      identityLine: '포근하고 사랑스러운 무드의 사람',
      hashtags: ['#구르망', '#달콤한향', '#디저트향', '#포근함'],
      gradient: ['#070953', '#e8a0c0'],
    },
    koName: '달콤 구르망',
    koFamily: 'Gourmand',
    enName: 'Gourmand',
    emoji: '🍯',
    primaryColor: '#e11d48',
    accentColor: '#f43f5e',
    tagline: '베이커리에서 막 구워낸 디저트처럼 달콤한 향',
    features: [
      '바닐라·카라멜·초콜릿·솜사탕·헤이즐넛 중심',
      '1992년 티에리 뮈글러 "엔젤"이 시초 — 가장 최근 카테고리',
      '20~30대 여성에게 가장 인기 많은 계열',
      '가을·겨울에 달콤함이 따뜻하게 피어오름',
    ],
    detailParagraphs: [
      '구르망 계열은 바닐라·카라멜·초콜릿·솜사탕·우유·헤이즐넛 같은 디저트 노트가 핵심입니다. 1992년 티에리 뮈글러 "엔젤"이 시초로, 가장 최근에 등장한 향수 카테고리예요. 달콤함과 깊이를 동시에 가진 독특한 계열입니다. 한국에서는 "디저트 향수"라는 별명으로도 자주 불립니다.',
      '구르망 향이 어울리는 사람은 사랑스럽고 매력적인 인상을 원하는 사람, 개성 있는 향을 좋아하는 사람입니다. "다정한 사람"으로 인식되며, 친근감과 매력을 동시에 줍니다. 특히 20~30대 여성에게 가장 인기 많은 계열이에요. 30대 이후엔 살짝 우디나 앰버가 섞인 "우디 구르망"으로 가는 게 어른스러운 진화 경로입니다.',
      '계절은 가을·겨울이 베스트입니다. 추운 날씨에 달콤함이 따뜻하게 피어오릅니다. 카페 데이트, 친구 모임, 캐주얼 외출 등 친근한 자리에 강력. 격식 있는 비즈니스 미팅엔 다소 캐주얼할 수 있습니다. 시간대는 낮·저녁 모두 가능하며 특히 카페·디저트 가게 같은 친근한 공간에서 더 매력적입니다.',
      '함께 어울리는 메이크업은 달콤한 핑크·코랄·체리 톤. 글로시한 베이비 핑크 립, 하이라이트 강조한 베이스, 살구빛 블러쉬. kissinskin AI 메이크업 시뮬레이터에서 "Sweet Romance" 또는 "Cherry Glow" 룩과 매칭됩니다. 매트한 어두운 메이크업과는 톤이 안 맞으므로 글로시·라이트 톤으로 잡는 것이 자연스럽습니다.',
      '주의할 점은 세 가지입니다. 첫째, 너무 진하면 "어린 향"으로 느껴질 수 있어 한 번에 1푸쉬 이상은 비추 — 양 조절이 핵심. 둘째, 음식점·카페에서 강한 구르망은 음식 향과 충돌하니 식사 직전엔 자제. 셋째, 30대 이후엔 우디·앰버가 살짝 섞인 "우디 구르망"으로 진화 — 같은 카테고리라도 연령대에 맞춰 톤 다운.',
    ],
    scene: {
      season: '가을·겨울 (10~2월)',
      occasion: '카페 데이트·친구 모임·캐주얼 외출',
      timeOfDay: '낮 / 저녁 (특히 카페·디저트 공간)',
      avoidSituation: '비즈니스 미팅·식사 직전·격식 디너',
    },
    makeupMatch: {
      base: '하이라이트 강조 글로우 베이스',
      lip: '글로시 베이비 핑크 / 체리 글로스',
      eye: '핑크 펄 / 코랄 그라데이션',
      cheek: '살구빛 블러쉬 광대 위',
    },
    cautions: [
      '한 번에 1푸쉬 이상은 "어린 향" — 양 조절 필수',
      '식사 직전 분사 자제 — 음식 향과 충돌',
      '30대 이후 우디 구르망으로 진화 — 연령대별 톤 다운',
    ],
    kissinskin: {
      women: 'K-pop Idol',
      men: 'Skincare Hybrid',
      reason: '구르망의 달콤함과 글로시 베이비 핑크 메이크업이 만나면 사랑스러운 K-pop 아이돌 무드가 완성됩니다.',
    },
    kissinskinReasonEn: 'The sweetness of a gourmand meets a glossy baby-pink makeup to complete a lovable K-pop idol mood.',
    celebrityVibes: ['카페 데이트', '뮤직비디오 주인공', '봄 광고 모델'],
    celebrityVibesEn: ['A café date', 'The star of a music video', 'A spring campaign model'],
    taglineEn: 'Sweet as a dessert fresh out of the bakery',
    featuresEn: [
      'Centers on vanilla, caramel, chocolate, cotton candy, hazelnut',
      'Born with Thierry Mugler’s "Angel" in 1992 — the newest family',
      'The most popular family among women in their 20s and 30s',
      'Its sweetness blooms warmly in autumn and winter',
    ],
    detailParagraphsEn: [
      'The gourmand family is built on dessert notes — vanilla, caramel, chocolate, cotton candy, milk, hazelnut. It began with Thierry Mugler’s "Angel" in 1992, making it the most recent fragrance family to emerge. It is a distinctive family that carries both sweetness and depth. In Korea it is often nicknamed the "dessert fragrance."',
      'Gourmand suits people who want a lovable, charming impression and those who enjoy a scent with personality. It reads as "warm and kind," giving off approachability and charm at once. It is especially popular among women in their 20s and 30s. After your 30s, drifting toward a "woody gourmand" laced with a little woods or amber is the grown-up way to evolve it.',
      'Autumn and winter are its sweet spot, when the cold lets its sweetness bloom warmly. It is powerful for café dates, hangs with friends, and casual outings — friendly settings. It can read a little casual for a formal business meeting. It works day or evening, and it is especially charming in cozy spaces like cafés and dessert shops.',
      'For makeup it pairs with sweet pink, coral, and cherry tones: a glossy baby-pink lip, a highlighted base, and an apricot blush. In the kissinskin AI makeup simulator it matches the "Sweet Romance" or "Cherry Glow" looks. Matte, dark makeup does not match the tone, so glossy, light tones feel most natural.',
      'Three things to watch. First, too much can read "youthful," so more than one spray at a time is not recommended — the amount is key. Second, a strong gourmand clashes with food smells in restaurants and cafés, so hold back right before a meal. Third, after your 30s, evolve toward a "woody gourmand" laced with woods or amber — even within the same family, dial the tone down to suit your age.',
    ],
    sceneEn: {
      season: 'Autumn & winter (Oct–Feb)',
      occasion: 'Café dates, hangs with friends, casual outings',
      timeOfDay: 'Day or evening (especially cafés and dessert spots)',
      avoidSituation: 'Business meetings, right before a meal, formal dinners',
    },
    makeupMatchEn: {
      base: 'A glowy base with highlight',
      lip: 'Glossy baby-pink / cherry gloss',
      eye: 'Pink shimmer / coral gradient',
      cheek: 'Apricot blush high on the cheekbones',
    },
    cautionsEn: [
      'More than one spray at a time reads "youthful" — control the amount',
      'Avoid spraying right before a meal — it clashes with food smells',
      'Evolve toward a woody gourmand after your 30s — dial the tone down with age',
    ],
  },
}

export const PERFUME_TYPE_ORDER: PerfumeTypeCode[] = ['floral', 'citrus', 'woody', 'amber', 'fresh', 'gourmand']

export function getPerfumeTypeBySlug(slug: string): PerfumeType | null {
  return PERFUME_TYPE_ORDER.map(c => PERFUME_TYPES[c]).find(t => t.slug === slug.toLowerCase()) ?? null
}
