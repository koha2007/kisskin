// Face Shape — 5 types
// References: BeautySpark face-shape makeup guide, Korean beauty research papers
// (20대 여성 얼굴 유형 분류 KISTI DIKO0011976303), K-beauty contouring standards 2024-2026

export type FaceShapeCode = 'oval' | 'round' | 'square' | 'oblong' | 'heart'

export interface FaceShapeType {
  code: FaceShapeCode
  slug: string
  koName: string
  enName: string
  emoji: string
  primaryColor: string
  accentColor: string
  tagline: string
  taglineEn?: string
  features: string[]               // 3~5 주요 특징
  featuresEn?: string[]
  detailParagraphs: string[]       // 4~5 문단
  detailParagraphsEn?: string[]
  contouring: {
    forehead: string
    cheekbone: string
    jawline: string
    highlighter: string
  }
  contouringEn?: {
    forehead: string
    cheekbone: string
    jawline: string
    highlighter: string
  }
  recommendedStyle: {
    brow: string
    lip: string
    blush: string
    hair: string
    glasses: string
  }
  recommendedStyleEn?: {
    brow: string
    lip: string
    blush: string
    hair: string
    glasses: string
  }
  avoidStyle: string[]             // 피해야 할 스타일
  avoidStyleEn?: string[]
  kissinskin: {
    women: string
    men: string
    reason: string
  }
  kissinskinReasonEn?: string
  celebrityVibes: string[]
  celebrityVibesEn?: string[]
}

export const FACE_SHAPE_TYPES: Record<FaceShapeCode, FaceShapeType> = {
  oval: {
    code: 'oval',
    slug: 'oval',
    koName: '계란형',
    enName: 'Oval',
    emoji: '🥚',
    primaryColor: '#10b981',
    accentColor: '#34d399',
    tagline: '가장 균형 잡힌 이상적 얼굴형',
    features: [
      '얼굴 세로 길이가 가로의 약 1.5배',
      '이마 > 광대 > 턱 순으로 자연스럽게 좁아짐',
      '턱 끝이 부드럽게 둥글거나 완만한 V',
      '광대가 과하게 튀어나오지 않음',
    ],
    detailParagraphs: [
      '계란형은 동·서양을 막론하고 가장 "이상적"이라고 불리는 얼굴형입니다. 세로가 가로의 약 1.5배이며 이마·광대·턱이 위에서 아래로 자연스럽게 좁아지는 비례를 가집니다. 턱 끝은 뾰족하지도 둥글지도 않은 부드러운 곡선이고, 광대는 과하게 튀어나오지 않아 정면에서 보면 깔끔한 타원이 그려집니다.',
      '계란형의 가장 큰 장점은 "선택의 폭"입니다. 어떤 메이크업 룩, 헤어스타일, 안경 프레임, 귀걸이를 시도해도 보통은 어울립니다. 보완해야 할 비율이 거의 없기 때문이죠. 그래서 계란형은 정해진 공식보다 그날의 기분·취향·옷차림에 따라 자유롭게 메이크업을 바꿔도 됩니다. 가장 흔한 실수는 오히려 "과한 컨투어링"입니다. 이미 균형이 잡힌 비율 위에 짙은 쉐이딩을 더하면 자연스러움이 깨지므로, 빼는 것이 더하는 것보다 잘 먹힙니다.',
      '컨투어는 최소한으로 가져갑니다. 이마 양옆이나 광대 아래에 짙은 쉐이딩을 깔면 본래의 비례가 무너지므로, 헤어라인 외곽을 가볍게 따라 그리는 정도로 충분합니다. 입체감은 컨투어보다 하이라이터로 만듭니다. 이마 중앙·콧등·광대 윗부분·턱 중앙에 빛이 떨어지는 부분만 살짝 밝혀 주면 자연스러운 3D 효과가 완성됩니다.',
      '헤어스타일은 거의 모든 길이와 컷이 어울립니다. 짧은 단발, 긴 웨이브, 시스루뱅, 올백 모두 시도해 볼 수 있습니다. 다만 "얼굴을 더 작아 보이게 하고 싶다"면 옆 머리를 살짝 남겨 광대 옆을 가려 주는 정도가 가장 안전합니다. 그 외에는 본인이 추구하는 스타일 무드에 따라 자유롭게 선택하면 됩니다.',
      '립과 블러쉬도 위치에 큰 제약이 없습니다. 풀 립·그라데이션 립·오버 립 모두 비율을 망가뜨리지 않으며, 블러쉬는 볼 중앙·광대 위·광대 아래 어느 위치든 가능합니다. 그날의 퍼스널 컬러나 옷 색에 맞춰 위치와 컬러만 바꿔 가며 다양한 분위기를 즐겨 보세요.',
    ],
    contouring: {
      forehead: '헤어라인 외곽만 가볍게 — 과한 쉐이딩 X',
      cheekbone: '광대 아래 가볍게 — 얼굴 좁히기 효과만 최소로',
      jawline: '턱 라인 외곽 따라 자연스럽게',
      highlighter: '이마 중앙, 콧등, 광대 윗부분, 턱 중앙',
    },
    recommendedStyle: {
      brow: '자연스러운 아치형 또는 일자형 — 본인 얼굴 각도에 맞춰',
      lip: '풀 립, 그라데이션 립, 오버 립 등 자유롭게',
      blush: '볼 중앙 또는 광대 위 — 어느 위치든 OK',
      hair: '긴머리·단발·앞머리·올백 모두 소화',
      glasses: '라운드·스퀘어·웨이파러·캣아이 모두 어울림',
    },
    avoidStyle: ['과한 컨투어링 (자연 비율을 깨뜨림)', '지나치게 얇은 눈썹 (얼굴이 길어 보임)'],
    avoidStyleEn: [
      'Heavy contouring — it disturbs the natural balance you already have',
      'Overly thin brows — they make the face look longer than it is',
    ],
    kissinskin: {
      women: 'Natural Glow',
      men: 'Skincare Hybrid',
      reason: '이상적 비율 위에 자연스러운 글로우를 얹으면 계란형의 본연의 균형이 가장 돋보입니다.',
    },
    kissinskinReasonEn:
      'Layering a soft glow over already-balanced proportions lets the oval face read at its best — restraint wins.',
    celebrityVibes: ['균형미의 정석', '광고 포스터 컷', '고전 초상화'],
    celebrityVibesEn: ['textbook balance', 'campaign-poster face', 'classical portrait energy'],
    taglineEn: 'The most balanced, ideally proportioned face shape',
    featuresEn: [
      'Face length is roughly 1.5× the width',
      'Forehead > cheekbones > jaw — narrows naturally',
      'Soft, gently rounded chin (or a mellow V)',
      'Cheekbones do not visibly protrude',
    ],
    detailParagraphsEn: [
      'The oval is treated across both Eastern and Western beauty as the "ideal" face shape. The face is roughly 1.5× as long as it is wide, with the forehead being slightly wider than the cheekbones and the cheekbones wider than the jaw — a smooth, narrowing taper from top to bottom. The chin lands somewhere between sharp and round: a soft, almost-curved point. Cheekbones sit politely without jutting forward.',
      'The biggest advantage of an oval face is range. Almost every makeup style, hairstyle, glasses frame, or earring will work, because nothing needs to be "compensated for." That means an oval face does not need to follow a strict makeup formula — preference and mood can lead. In fact, the most common mistake on oval faces is over-contouring; restraint usually reads better than correction.',
      'Keep contouring minimal. Heavy shading on the forehead, cheeks, or jaw breaks the natural proportions you already have. Trace the outer hairline lightly, then add highlight to the center of the forehead, the bridge of the nose, the top of the cheekbones, and the center of the chin for soft, three-dimensional brightness — that is enough.',
      'Almost any haircut works on an oval face: short bobs, long waves, fringes, full slick-backs. If your goal is to make the face look smaller, leaving a little side-hair to frame the cheeks is the safest choice. Otherwise, follow your style mood.',
      'Lip and blush placement is equally flexible. Full lips, gradient lips, and overlined lips all work without distorting balance. Blush on the apples, on the upper cheekbone, or just under the cheekbone — pick whichever your personal color and outfit calls for that day.',
    ],
    contouringEn: {
      forehead: 'Outer hairline only — keep heavy shading off the brow area',
      cheekbone: 'Just under the cheekbone, very lightly — slim only if needed',
      jawline: 'Trace the outer jaw naturally, no deep cut',
      highlighter: 'Center forehead, bridge of nose, upper cheekbone, center chin',
    },
    recommendedStyleEn: {
      brow: 'Soft arch or straight — match your natural angle',
      lip: 'Full, gradient, overlined — all fair game',
      blush: 'Apples, upper cheekbone, or under cheekbone — any placement works',
      hair: 'Long, bob, fringe, slick-back — every length flatters',
      glasses: 'Round, square, wayfarer, cat-eye — pick by mood, not face',
    },
  },

  round: {
    code: 'round',
    slug: 'round',
    koName: '둥근형',
    enName: 'Round',
    emoji: '🌕',
    primaryColor: '#f59e0b',
    accentColor: '#fbbf24',
    tagline: '볼살 풍성한 동안의 포근함',
    features: [
      '얼굴 세로와 가로 길이가 거의 비슷',
      '광대가 얼굴에서 가장 넓은 부분',
      '턱선이 둥글고 부드러움',
      '볼살이 풍성해 동안 인상',
    ],
    detailParagraphs: [
      '둥근형은 세로와 가로 비율이 1:1에 가까운 얼굴형으로, 광대가 얼굴에서 가장 넓은 부분을 차지합니다. 턱선은 둥글고 부드러우며 볼살이 풍성해 동안의 인상을 줍니다. 한국 20대 여성에게 가장 흔한 얼굴형 중 하나이며, K-pop 멤버 중에서도 자주 보이는 친근하고 따뜻한 인상의 얼굴형입니다.',
      '메이크업 목표는 "세로 입체감"을 만드는 것입니다. 둥근형은 가로로 넓어 보이기 때문에 시선을 위아래로 끌어올려 주어야 합니다. 얼굴 옆면과 턱 아래에 쉐이딩을 집중시키고, 콧등·이마 중앙·턱 중앙을 따라 세로로 하이라이터를 발라 빛이 떨어지는 라인을 만들어 줍니다.',
      '컨투어링은 광대 시작점에서 입꼬리 방향으로 사선으로 깔아 줍니다. 이 사선이 얼굴 옆을 시각적으로 좁혀 주는 핵심 포인트입니다. 추가로 이마 양옆(헤어라인 모서리)에 작은 V자 쉐이딩을 넣어 폭을 줄이고, 턱 아래에도 가볍게 쉐이딩을 더해 세로 길이를 늘려 줍니다.',
      '헤어스타일은 일자 단발 같은 컷보다 시스루뱅이나 옆가르마가 안전합니다. 길이는 턱선 아래로 떨어지는 미디엄 길이나 쇄골 아래 긴 웨이브가 세로 라인을 만들어 줍니다. 단발을 자르더라도 턱선이 아닌 그보다 살짝 긴 길이를 추천합니다.',
      '립은 가로보다 세로로 볼륨을 주는 것이 좋습니다. 풀 립 오버 립보다는 중앙 그라데이션 립이 둥근 얼굴에 더 잘 어울립니다. 블러쉬는 볼 중앙이 아닌 광대 아래에 사선으로, 안경은 스퀘어·브로우라인처럼 각이 있는 프레임이 둥근형에 부족한 직선미를 채워 줍니다.',
    ],
    contouring: {
      forehead: '이마 양옆(헤어라인)에 V 형태로 쉐이딩 — 가로 폭 축소',
      cheekbone: '광대 시작점부터 입꼬리 방향 사선으로 깊게',
      jawline: '턱 양옆 깊게 · 턱 아래에 세로 쉐이딩 추가',
      highlighter: '콧등, 이마 중앙, 턱 중앙 — 세로 입체감',
    },
    recommendedStyle: {
      brow: '아치형 또는 각진 형 — 얼굴에 각도 추가',
      lip: '중앙 그라데이션 립 · 인중 꽉 채우지 않기',
      blush: '광대 아래 사선 방향',
      hair: '시스루뱅, 옆가르마, 턱선 아래 길이 미디엄/롱',
      glasses: '스퀘어, 브로우라인, 하프림 — 각진 프레임',
    },
    avoidStyle: [
      '일자 단발 턱선 길이 (얼굴 더 둥글어 보임)',
      '라운드 안경테 (둥근 인상 가중)',
      '볼 중앙 풀 블러쉬 (가로 폭 확장)',
    ],
    avoidStyleEn: [
      'Blunt bobs cut at the jaw — make a round face look rounder',
      'Round glasses frames — pile soft on soft',
      'Full blush on the apples of the cheeks — widens the face',
    ],
    kissinskin: {
      women: 'Cloud Skin',
      men: 'Skincare Hybrid',
      reason: '부드러운 피부 질감이 둥근형의 동안 이미지를 자연스럽게 살려줍니다. 컨투어는 별도로.',
    },
    kissinskinReasonEn:
      'Soft cloud-skin texture leans into the youthful softness of a round face — keep the contour separate from the base.',
    celebrityVibes: ['동안의 아이콘', '친근한 광고 모델', '귀여운 K-pop 멤버'],
    celebrityVibesEn: ['baby-faced icon', 'approachable campaign face', 'lovable K-pop member'],
    taglineEn: 'Soft cheek volume and a youthful, baby-faced softness',
    featuresEn: [
      'Face length and width are roughly equal',
      'Cheekbones are the widest point of the face',
      'Soft, rounded jawline',
      'Full cheeks give a youthful first impression',
    ],
    detailParagraphsEn: [
      'A round face has near-1:1 proportions — length and width are almost the same — and the cheekbones are its widest point. The jaw is round and soft and the cheeks carry visible volume, so the overall impression reads as youthful and friendly. It is one of the most common shapes among Korean women in their twenties, and many K-pop members share it, which is part of why it gets coded as approachable and warm.',
      'The makeup goal here is to add vertical lift. Round faces look horizontally wide, so the trick is to push the eye upward — concentrate shading along the sides of the face and under the chin, then place highlight vertically down the center of the face (nose bridge, mid-forehead, mid-chin).',
      'For contour, lay shadow diagonally from the start of the cheekbone toward the corner of the mouth. That diagonal cut is what visually narrows the sides. Add a small V-shape of shading at the upper hairline corners to shrink the perceived width, and a touch under the chin to elongate the bottom.',
      'For hair, blunt bangs make the face look rounder, so a side part or see-through fringe is safer. Length-wise, mid-length that covers the jawline or long waves below the collarbone elongate the silhouette. If you cut a bob, take it just past the jaw rather than at the jaw.',
      'Lips should add vertical, not horizontal, weight — a center gradient lip works better than an overlined full lip on a round face. Blush goes diagonally under the cheekbone, not on the apples. For glasses, square or browline frames add the angles a round face is missing.',
    ],
    contouringEn: {
      forehead: 'V-shaped shading at the upper hairline corners — pulls width in',
      cheekbone: 'From the start of the cheekbone diagonally toward the corner of the mouth, deeply',
      jawline: 'Deep shading on the sides of the jaw + a vertical line under the chin',
      highlighter: 'Bridge of nose, center of forehead, center of chin — vertical lift',
    },
    recommendedStyleEn: {
      brow: 'Arched or angled — add definition the face is missing',
      lip: 'Center gradient lip — leave the corners soft',
      blush: 'Diagonally under the cheekbone',
      hair: 'See-through fringe, side part, mid-length cut below the jawline',
      glasses: 'Square, browline, half-rim — pick frames with corners',
    },
  },

  square: {
    code: 'square',
    slug: 'square',
    koName: '각진형',
    enName: 'Square',
    emoji: '🧊',
    primaryColor: '#3b82f6',
    accentColor: '#6366f1',
    tagline: '강한 턱선의 또렷한 카리스마',
    features: [
      '이마·광대·턱 너비가 비슷',
      '턱 라인이 또렷하게 각짐',
      '헤어라인이 직선에 가까움',
      '강하고 카리스마 있는 인상',
    ],
    detailParagraphs: [
      '각진형은 이마·광대·턱의 너비가 거의 비슷하고 턱 라인이 또렷한 각을 이루는 얼굴형입니다. 헤어라인도 거의 직선에 가깝습니다. 전체적인 인상은 강하고 카리스마 있게 읽히며, 패션 위크 모델이나 남성 K-pop 비주얼에서 많이 보이는 얼굴형으로 사진이 매우 잘 받는 특징이 있습니다.',
      '메이크업 목표는 "각을 죽이지 말고 부드럽게 풀어 주기"입니다. 각을 완전히 둥글게 만들면 본래의 시그니처가 사라지므로, 모서리 부분만 살짝 라운드를 더해 자연스러운 인상으로 다듬는 것이 핵심입니다.',
      '컨투어는 턱과 이마의 모서리에 집중합니다. 턱 모서리와 이마 양옆 헤어라인에 곡선으로 부드럽게 쉐이딩을 넣으면 각진 부분이 자연스럽게 풀립니다. 중요한 점은 광대 컨투어는 거의 하지 않는다는 것입니다. 각진형은 광대가 좌우로 넓은 얼굴이 아니므로, 광대 컨투어를 넣으면 얼굴이 작아지는 게 아니라 인상이 약해질 수 있습니다.',
      '헤어스타일은 직선보다 곡선이 어울립니다. 웨이브가 들어간 미디엄·롱 헤어, 사선 시스루뱅, 레이어드 컷이 각진 턱선을 자연스럽게 풀어 줍니다. 일자 단발은 각을 더 강조하므로 피하는 것이 좋습니다.',
      '립은 부드러운 곡선이 들어간 풀 립이 잘 맞습니다. 인중 끝을 살짝 둥글게 오버 립으로 그리면 직선적 인상이 풀립니다. 블러쉬는 광대 위에 둥글게, 안경은 라운드·오벌·캣아이 등 곡선 프레임이 강한 직선미와 대비를 만들어 매력을 살려 줍니다.',
    ],
    contouring: {
      forehead: '이마 모서리(헤어라인 양 끝)에 부드럽게 쉐이딩',
      cheekbone: '광대 쉐이딩은 최소화 — 얼굴 축소 X',
      jawline: '턱 모서리(각) 부분에만 곡선으로 쉐이딩',
      highlighter: '광대 위 둥글게 · 이마 중앙 · 턱 중앙',
    },
    recommendedStyle: {
      brow: '아치형 — 직선 눈썹은 각을 강조하므로 피하기',
      lip: '부드러운 곡선 · 오버 립으로 인중 끝 둥글게',
      blush: '광대 위 둥글게',
      hair: '웨이브 · 레이어드 컷 · 사선 시스루뱅',
      glasses: '라운드, 오벌, 캣아이 — 둥근 프레임',
    },
    avoidStyle: [
      '일자 단발 턱선 길이 (각 강조)',
      '스퀘어·직선 안경테 (딱딱한 인상 가중)',
      '직선 눈썹 (각 대비 강화)',
    ],
    avoidStyleEn: [
      'Blunt bobs at the jawline — exaggerate the angles',
      'Square / straight glasses frames — pile hard on hard',
      'Straight, flat brows — strengthen the angular impression',
    ],
    kissinskin: {
      women: 'Blood Lip',
      men: 'Monochrome',
      reason: '각진형의 또렷한 인상과 매트한 립의 조합이 모던한 카리스마를 완성합니다.',
    },
    kissinskinReasonEn:
      'A defined matte lip plays into the sharp impression of a square jaw — modern, decisive, photo-ready.',
    celebrityVibes: ['모던 패션 쇼 모델', '블랙 에디토리얼 컷', '샤프한 K-pop 비주얼'],
    celebrityVibesEn: ['runway model', 'black-and-white editorial', 'sharp K-pop visual'],
    taglineEn: 'A defined jaw, sharp profile, and natural charisma',
    featuresEn: [
      'Forehead, cheekbones, and jaw are roughly equal in width',
      'A clearly angled jawline',
      'Hairline reads almost straight',
      'Strong, charismatic first impression',
    ],
    detailParagraphsEn: [
      'A square face has near-equal forehead, cheekbone, and jaw widths, with a jawline that drops in a defined angle. The hairline tends to be close to straight as well. The overall read is strong and decisive — many fashion-week models and male K-pop visuals share this shape, and it is highly photogenic.',
      'The makeup goal is "soften the angles without erasing the charisma." If you fully round it out, you lose the signature look. Take just enough off the corners to make them feel polished rather than rigid.',
      'For contour, work the corners — the jaw corners and the upper hairline corners. A small amount of shadow there softens the edges. Importantly: skip cheekbone contour. The square face is not horizontally wide at the cheekbones, so adding shadow there shrinks the face and weakens the impression instead of helping.',
      'Hair-wise, soft waves and layered cuts work better than straight cuts. Long waves below the jawline help the angular jaw read smoother. A side-swept see-through fringe softens the straight forehead line. Avoid short blunt bobs — they push the angles harder.',
      'For lips, soft curves work best — slightly overline the philtrum to add roundness. Place blush in a soft round shape on the upper cheekbone — that adds the curve the face is missing. Round, oval, or cat-eye glasses are the strongest contrast partner; square frames double down where you do not need to.',
    ],
    contouringEn: {
      forehead: 'Soft shading at the upper hairline corners',
      cheekbone: 'Minimal cheekbone shading — do not shrink the face',
      jawline: 'Small curved shadow at the jaw corners — round the corner only',
      highlighter: 'Round highlight on upper cheekbones, center forehead, center chin',
    },
    recommendedStyleEn: {
      brow: 'Arched — straight brows reinforce the angle',
      lip: 'Soft curves — gently overline the philtrum',
      blush: 'Round placement on the upper cheekbone',
      hair: 'Waves, layered cuts, side-swept see-through fringe',
      glasses: 'Round, oval, cat-eye — round frames for contrast',
    },
  },

  oblong: {
    code: 'oblong',
    slug: 'oblong',
    koName: '긴형',
    enName: 'Oblong / Long',
    emoji: '🫒',
    primaryColor: '#8b5cf6',
    accentColor: '#a78bfa',
    tagline: '세로 라인의 지적이고 우아한 인상',
    features: [
      '얼굴 세로가 가로보다 확연히 긴 비율',
      '이마·광대·턱 너비가 비슷한 직사각형',
      '볼살이 적고 뺨이 길어 보임',
      '지적이고 성숙한 첫인상',
    ],
    detailParagraphs: [
      '긴형(오블롱)은 세로 길이가 가로보다 확연히 긴 직사각형 비율의 얼굴형입니다. 이마·광대·턱의 너비가 거의 비슷해 전체 윤곽이 직사각형에 가깝습니다. 볼살이 적은 편이라 뺨이 더 길어 보이는 경향이 있고, 지적이고 성숙한 첫인상을 줍니다. 패션 화보나 런웨이에서 자주 보이지만 일상에서는 "얼굴이 길어 보인다"는 고민이 따라오기도 합니다.',
      '메이크업 목표는 둥근형과 정반대로 "가로 입체감"을 만드는 것입니다. 세로 길이를 시각적으로 줄이려면 이마 위·턱 아래에 가로 방향 쉐이딩을 깔아 시선이 가로로 분산되게 해야 합니다.',
      '컨투어의 핵심은 이마 헤어라인과 턱 아래에 가로로 쉐이딩을 까는 것입니다. 헤어라인을 따라 가로로 쉐이딩을 깔면 이마가 시각적으로 짧아지고, 턱 아래에도 가로로 쉐이딩을 더하면 턱 영역이 줄어듭니다. 광대 컨투어는 거의 필요하지 않습니다. 광대 옆을 좁히면 가뜩이나 좁은 가로 폭이 더 줄어들기 때문입니다.',
      '헤어스타일은 앞머리가 정답입니다. 풀뱅이나 시스루뱅으로 이마를 가리면 세로 길이가 즉시 줄어듭니다. 옆 머리를 살짝 앞으로 가져와 볼 옆에 볼륨을 더하는 것도 도움이 됩니다. 길이는 어깨~쇄골 사이가 가장 안전하며, 너무 긴 머리는 세로감을 다시 늘립니다.',
      '블러쉬는 볼 중앙에 가로로 넓게 발라 가로 포인트를 강조합니다. 사선이나 광대 아래 배치는 세로 라인을 더 강조하므로 피해야 합니다. 립은 풀 립으로 가로 너비를 충분히 드러내고, 안경은 오버사이즈나 브로우라인처럼 가로로 넓은 프레임이 세로 비율을 분산시킵니다.',
    ],
    contouring: {
      forehead: '헤어라인 따라 가로 쉐이딩 — 세로 축소',
      cheekbone: '쉐이딩 최소 — 얼굴 좁히기 X',
      jawline: '턱 끝 아래 가로 쉐이딩 — 세로 잘라주기',
      highlighter: '광대 위 가로로 넓게 · 콧등은 짧게만',
    },
    recommendedStyle: {
      brow: '일자형 — 아치형은 세로 강조',
      lip: '풀 립, 가로로 선명하게',
      blush: '볼 중앙에 가로로 넓게',
      hair: '풀뱅·시스루뱅 · 옆머리 볼륨 · 어깨~쇄골 길이',
      glasses: '오버사이즈, 브로우라인, 가로 와이드',
    },
    avoidStyle: [
      '올백 · 앞머리 없는 긴머리 (세로 극대화)',
      '세로 긴 아치 눈썹',
      '사선 광대 쉐이딩 (세로 연장)',
    ],
    avoidStyleEn: [
      'Slick-back / no-fringe long hair — maximizes vertical line',
      'Tall, dramatic arched brows — extend the vertical pull',
      'Diagonal cheekbone shading — also extends the face vertically',
    ],
    kissinskin: {
      women: 'Blush Draping',
      men: 'Blurred Lip',
      reason: '가로 드레이핑과 번진 립이 세로 길이를 가로로 분산시키는 효과를 냅니다.',
    },
    kissinskinReasonEn:
      'Horizontal blush draping and a blurred lip pull the eye sideways, breaking up the long vertical proportion of the face.',
    celebrityVibes: ['런웨이 모델', '에디토리얼 컷', '지적인 배우'],
    celebrityVibesEn: ['runway model', 'editorial shoot', 'intellectual actor'],
    taglineEn: 'Long, vertical lines — intelligent and elegant first impression',
    featuresEn: [
      'Face is noticeably longer than it is wide',
      'Forehead, cheekbones, and jaw are roughly equal in width — rectangle silhouette',
      'Less cheek volume; longer-looking cheeks',
      'Reads as intellectual and mature',
    ],
    detailParagraphsEn: [
      'An oblong (long) face is noticeably longer than wide, with the forehead, cheekbones, and jaw roughly equal in width — the overall outline is closer to a rectangle. Cheek volume is on the lighter side, which makes the cheeks look longer. The overall read is intellectual and grown-up. Common on runways and editorial shoots — but in everyday life, "my face looks too long" is a common concern with this shape.',
      'The makeup goal is the exact opposite of round: add horizontal weight. To shorten the visual length, place shading horizontally at the upper hairline and under the chin. This visually "cuts" the vertical run.',
      'The key contour move is horizontal shadow on the forehead and under the chin. Lay it across the hairline to shorten the forehead, and across the under-chin area to shorten the jaw zone. Cheekbone contour is mostly unnecessary — narrowing what is already narrow makes things worse.',
      'For hair, fringes are the answer. A full or see-through fringe instantly cuts the visual length. Side hair pulled slightly forward to add cheek volume helps too. Length should land between shoulder and collarbone — too long pulls the line back down.',
      'Blush goes horizontally across the apples to anchor a horizontal point. Diagonal or under-cheekbone blush would re-emphasize the vertical line — avoid those. Lips should read horizontal too: keep them full, not thin or small. Glasses-wise, oversized or browline frames disperse the long vertical proportion of the face.',
    ],
    contouringEn: {
      forehead: 'Horizontal shading along the hairline — shortens the vertical',
      cheekbone: 'Minimal — do not narrow what is already narrow',
      jawline: 'Horizontal shading under the chin — visually cuts the length',
      highlighter: 'Wide horizontal highlight on upper cheekbone; keep nose-bridge highlight short',
    },
    recommendedStyleEn: {
      brow: 'Straight brows — arched ones reinforce vertical',
      lip: 'Full, horizontally defined lip',
      blush: 'Wide and horizontal across the apples',
      hair: 'Full or see-through fringe, side volume, shoulder-to-collarbone length',
      glasses: 'Oversized, browline, wide horizontal frames',
    },
  },

  heart: {
    code: 'heart',
    slug: 'heart',
    koName: '하트형',
    enName: 'Heart',
    emoji: '💖',
    primaryColor: '#ec4899',
    accentColor: '#f472b6',
    tagline: '넓은 이마와 뾰족한 턱의 사랑스러운 V',
    features: [
      '이마가 얼굴에서 가장 넓은 부분',
      '광대는 중간, 턱으로 갈수록 뾰족해짐',
      'V라인 턱선이 특징적',
      '우아하고 사랑스러운 첫인상',
    ],
    detailParagraphs: [
      '하트형은 이마가 얼굴에서 가장 넓고 턱으로 갈수록 좁아져 뾰족한 V라인을 그리는 얼굴형입니다. 광대는 중간 정도의 너비이며, 전체적으로 역삼각형 또는 하트 모양에 가깝습니다. 우아하고 사랑스러운 첫인상을 주며, V라인 성형이 추구하는 "이상형"으로 가장 자주 언급되는 모양이기도 합니다.',
      '메이크업 목표는 "넓은 이마는 좁혀 보이게, 뾰족한 턱은 부드럽게" 입니다. 이마를 시각적으로 살짝 좁혀 주고, V라인 끝을 살짝 둥글려 균형을 맞춥니다. 광대는 이미 적당한 너비이므로 따로 손대지 않아도 됩니다.',
      '컨투어는 이마 양옆 헤어라인과 턱 끝에 집중합니다. 이마 양옆에 V자 형태로 쉐이딩을 넣어 이마 폭을 좁히고, 턱 끝 아래에 작은 양의 쉐이딩을 더해 뾰족함을 살짝 풀어 줍니다. 광대 컨투어는 생략합니다. 사선 광대 컨투어를 넣으면 V라인이 더 뾰족하게 보일 수 있습니다.',
      '헤어스타일은 앞머리가 핵심입니다. 시스루뱅이나 사선뱅으로 넓은 이마를 적당히 가려 줍니다. 중앙 가르마 올백은 이마를 더 드러내므로 피하는 것이 좋습니다. 길이는 쇄골 아래 긴 웨이브가 턱 옆을 감싸 V라인을 부드럽게 만듭니다. 짧은 단발은 턱 끝을 더 강조할 위험이 있어 신중하게 선택해야 합니다.',
      '블러쉬는 일반적인 광대 위치보다 살짝 아래(광대 아래)에 발라 얼굴 하단에 볼륨을 더합니다. 하트형은 상단이 무거운 비율이므로 시선을 하단으로 끌어내려 균형을 잡아야 합니다. 립은 풀 립이나 오버 립으로 입술 볼륨을 더해 시선을 분산시키고, 안경은 라운드·오벌·하단이 무거운 프레임이 이마와 턱의 비율을 맞춰 줍니다.',
    ],
    contouring: {
      forehead: '이마 양옆(헤어라인)에 V 형태로 깊게 쉐이딩',
      cheekbone: '쉐이딩 최소 — 광대 이미 중간 너비',
      jawline: '턱 끝 아래 부드럽게 쉐이딩 — 뾰족함 완화',
      highlighter: '이마 중앙(작게), 콧등, 볼 위쪽',
    },
    recommendedStyle: {
      brow: '아치형 또는 자연스러운 곡선',
      lip: '풀 립 · 오버 립 — 입술 볼륨으로 하단 포인트',
      blush: '볼 아래쪽(광대 아래) — 하단 볼륨 추가',
      hair: '시스루뱅 · 사선뱅 · 쇄골 아래 긴 웨이브',
      glasses: '라운드, 오벌, 하단 무거운 프레임',
    },
    avoidStyle: [
      '중앙 가르마 올백 (이마 강조)',
      '짧은 턱선 단발 (턱 뾰족 강조)',
      '사선 광대 쉐이딩 (턱 뾰족 강조)',
    ],
    avoidStyleEn: [
      'Center-part slick-back — exposes the wide forehead',
      'Short bobs at the jaw — emphasize the pointed chin',
      'Diagonal cheekbone shading — also sharpens the chin point',
    ],
    kissinskin: {
      women: 'Kpop Idol Makeup',
      men: 'Kpop Idol Makeup',
      reason: 'V라인이 돋보이는 K-pop 아이돌 룩이 하트형의 우아한 라인을 가장 잘 살립니다.',
    },
    kissinskinReasonEn:
      'A K-pop idol makeup celebrates the V-line — exactly what the heart shape already gives you naturally.',
    celebrityVibes: ['V라인 아이돌', '사랑스러운 광고 모델', '우아한 영화 주연'],
    celebrityVibesEn: ['V-line idol', 'lovable campaign model', 'elegant lead actress'],
    taglineEn: 'A wide forehead and pointed chin — the lovable V-line',
    featuresEn: [
      'Forehead is the widest part of the face',
      'Cheekbones sit at medium width; the face narrows toward the chin',
      'A signature V-line jaw',
      'Elegant, lovable first impression',
    ],
    detailParagraphsEn: [
      'A heart face has its widest point at the forehead and tapers toward a pointed chin, forming a V-line. It is sometimes called an inverted triangle. Cheekbones land in the middle of the face. The overall read is elegant and lovable, and this is the shape most often used as the ideal in V-line cosmetic surgery references.',
      'The makeup goal is to balance the wide forehead and soften the very pointed chin. Visually narrow the forehead a little and round off the chin point a little. Cheekbones already sit at a reasonable middle width, so leave them alone.',
      'Contour at the upper hairline corners and at the chin tip. A V-shape of shadow at the temples narrows the forehead, and a small amount of shadow under the chin softens the point. Skip cheekbone contour — heavy diagonal contour here would make the chin look even sharper.',
      'For hair, fringes win — a see-through or side fringe covers the wide forehead. A center part exposes the forehead more, so avoid that. Length: long waves below the collarbone wrap the jaw and visually soften the point. Short bobs are risky on this shape; the chin point gets sharpened.',
      'Blush sits lower than usual — under the cheekbone — to add weight to the lower half of the face. Heart faces are top-heavy; do not double down up top. Lips can be full or overlined; lip volume distracts from the chin tip. For glasses, round, oval, or bottom-heavy frames balance the forehead-vs-chin proportions.',
    ],
    contouringEn: {
      forehead: 'V-shape shading at the upper hairline corners — narrow the wide forehead',
      cheekbone: 'Minimal — cheekbones already at middle width',
      jawline: 'Soft shading under the chin tip — soften the V point',
      highlighter: 'Small dab on center forehead, nose bridge, upper cheekbone',
    },
    recommendedStyleEn: {
      brow: 'Arched or naturally curved',
      lip: 'Full or overlined — lip volume balances the chin point',
      blush: 'Under the cheekbone — add weight to the lower face',
      hair: 'See-through or side fringe; long waves below the collarbone',
      glasses: 'Round, oval, or bottom-heavy frames',
    },
  },
}

export const FACE_SHAPE_ORDER: FaceShapeCode[] = ['oval', 'round', 'square', 'oblong', 'heart']

export function getFaceShapeBySlug(slug: string): FaceShapeType | null {
  return FACE_SHAPE_ORDER.map(c => FACE_SHAPE_TYPES[c]).find(t => t.slug === slug.toLowerCase()) ?? null
}
