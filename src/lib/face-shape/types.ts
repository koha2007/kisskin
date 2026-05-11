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
      '계란형은 가장 균형 잡힌 이상적 얼굴형으로, 거의 모든 메이크업·헤어·안경테가 어울립니다. 컨투어는 최소한으로 가져가고 하이라이터로 자연스러운 입체감만 더하는 것이 정답입니다.',
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
      '둥근형은 가로와 세로 비율이 1:1에 가까운 동안 얼굴형입니다. 메이크업 목표는 "세로 입체감"을 만드는 것 — 광대 아래 사선 컨투어와 콧등·턱 중앙 하이라이터로 얼굴을 길어 보이게 하면 부드러움과 샤프함이 균형을 이룹니다.',
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
      '각진형은 이마·광대·턱의 너비가 비슷하고 턱 라인이 또렷한 카리스마 얼굴형입니다. 컨투어는 턱·이마 모서리만 부드럽게 풀고, 라운드·오벌 안경과 곡선 립으로 강함과 부드러움의 대비를 즐기는 것이 정답입니다.',
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
      '긴형은 세로 길이가 가로보다 확연히 긴 직사각형 비율의 지적인 얼굴형입니다. 메이크업 목표는 "가로 입체감" — 풀뱅·시스루뱅으로 이마를 가리고, 가로 블러쉬와 풀 립으로 가로 포인트를 만들면 세로 길이가 시각적으로 짧아집니다.',
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
      '하트형은 넓은 이마와 뾰족한 V라인 턱이 만드는 우아한 얼굴형입니다. 컨투어는 이마 양옆 V + 턱 끝 부드러운 쉐이딩, 헤어는 시스루뱅·사선뱅과 쇄골 아래 긴 웨이브가 균형을 잡습니다.',
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
