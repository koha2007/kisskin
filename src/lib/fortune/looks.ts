// ════════════════════════════════════════════════════════════════════
// 관상 메이크업 9종 — 관상·사주 메이크업 (2026-10-21)
// ────────────────────────────────────────────────────────────────────
// 관상 12궁에서 "좋은 상"으로 보는 부위를 메이크업으로 살린다. 운 9가지 = 룩 9가지.
// 9룩(src/lib/makeup/styles.ts)과는 **별도 목록**이다 — MakeupStyleId 는 룩 페이지·클래스·
// 저장 룩 등 22곳이 Record 로 물고 있어 섞으면 전부 흔들린다.
// 생성 경로는 9룩과 같다: promptWholeFace() → /api/makeup-edit (무료권 makeup 풀 / 크레딧).
//
// ⚠ 지시문 원칙
//   • FACE_LOCK(promptWholeFace)이 표정·이목구비를 고정한다. "입꼬리 올림" 같은 처방은
//     반드시 **라이너·하이라이트로 그렇게 보이게** 만 쓰고, 입 모양·표정을 바꾸라고 쓰지 않는다.
//   • 건강운은 혈색·활력만. 수명·질병 표현 금지(운영자 10/21 '생명운' → 건강운).
//   • 헤어는 컬러만(HAIR_RULE 이 무채색·백발을 막는다).
// ════════════════════════════════════════════════════════════════════
import type { Element } from './saju'

export type FortuneLookId =
  | 'wealth'
  | 'love'
  | 'marriage'
  | 'reunion'
  | 'career'
  | 'exam'
  | 'health'
  | 'popularity'
  | 'travel'

export interface FortuneLook {
  id: FortuneLookId
  /** 운 이름 */
  fortuneKo: string
  fortuneEn: string
  emoji: string
  /** 관상 12궁 근거 */
  palaceKo: string
  palaceEn: string
  /** 룩 이름(카드 제목) */
  nameKo: string
  /** promptWholeFace 가 "${subEn} makeup look" 으로 쓴다 */
  subEn: string
  /** 처방 한 줄 */
  descKo: string
  descEn: string
  accent: string
  hair: string
  prompt: string
}

export const FORTUNE_LOOKS: FortuneLook[] = [
  {
    id: 'wealth',
    fortuneKo: '재물운', fortuneEn: 'Wealth', emoji: '💰',
    palaceKo: '재백궁 · 코끝과 콧방울', palaceEn: 'Wealth palace · nose tip',
    nameKo: '재물운 관상 메이크업', subEn: 'WEALTH FACE-READING',
    descKo: '코끝 윤광 · 맑은 이마 · 올라가 보이는 입꼬리',
    descEn: 'Lit nose tip · clear forehead · lifted-looking lip corners',
    accent: '#c9a227',
    hair: 'a rich warm chestnut brown with soft golden glints catching the light.',
    // 2026-10-21 샘플 1차: 코끝 광·금빛이 거의 안 보여 다른 룩과 구분이 안 됐다 → 시그니처를 "한눈에" 로.
    prompt:
      'the signature of this look is a GOLDEN, LIT NOSE — make it clearly visible at a glance: a luminous ' +
      'champagne-gold highlighter stripe down the nose bridge and a bright glowing gold point on the nose tip ' +
      '(the "wealth palace" in Korean face reading), plus a clear bright glow on the centre of the forehead. ' +
      'Eyes: a visible warm bronze-gold metallic shimmer across the eyelids with a fine brown liner. Groom the ' +
      'brows full and neat. Cheeks: a soft warm peach-gold blush. Lips: a warm coral-rose satin colour, with a ' +
      'fine lip liner that gently extends the outer corners upward so the lip corners LOOK lifted — achieve this ' +
      'only with liner and colour placement, never by changing the mouth shape or expression. Overall: ' +
      'prosperous, polished, golden and glowing — unmistakably made-up, never identical to the bare face.',
  },
  {
    id: 'love',
    fortuneKo: '연애운', fortuneEn: 'Love', emoji: '💕',
    palaceKo: '남녀궁 · 눈 밑 애교살', palaceEn: 'Love palace · under-eye',
    nameKo: '연애운 관상 메이크업', subEn: 'LOVE FACE-READING',
    descKo: '도톰한 애교살 · 볼 중앙 생기 · 촉촉한 입술',
    descEn: 'Plump aegyo-sal · flushed cheeks · glossy lips',
    accent: '#e8708a',
    hair: 'a soft rosy brown with a subtle pink-mauve sheen.',
    prompt:
      'emphasise the under-eye "aegyo-sal" (the love palace in Korean face reading): a soft pearly highlight ' +
      'right under the lower lash line with a faint shadow beneath it so it looks plump and smiling. Add a ' +
      'romantic pink flush on the centre of the cheeks (peach-blossom glow), a soft slightly downturned brown ' +
      'eyeliner for a gentle innocent eye, fluttery lashes, and juicy glossy jelly-pink lips. Lovely, warm, ' +
      'approachable.',
  },
  {
    id: 'marriage',
    fortuneKo: '결혼·인연운', fortuneEn: 'Marriage & Fate', emoji: '💍',
    palaceKo: '처첩궁 · 눈꼬리 옆', palaceEn: 'Spouse palace · outer eye corners',
    nameKo: '인연운 관상 메이크업', subEn: 'DESTINY FACE-READING',
    descKo: '눈꼬리 옆 은은한 광 · 길게 빼는 브라운 라인 · 로즈 립',
    descEn: 'Glow beside the eye corners · elongated soft liner · rose lip',
    accent: '#b5838d',
    hair: 'a soft mocha brown with a warm satin shine.',
    prompt:
      'brighten the area just beside the outer corners of the eyes toward the temples (the spouse palace in ' +
      'Korean face reading) with a soft, clean luminous highlight so it looks smooth and full. Elongate the eye ' +
      'with a soft brown liner gently extended outward, warm mauve-rose eyeshadow, and a mauve-rose blush swept ' +
      'from the cheekbones up toward the temples. Lips: a satin rose-nude. Elegant, gentle, graceful.',
  },
  {
    id: 'reunion',
    fortuneKo: '재회운', fortuneEn: 'Reunion', emoji: '🔁',
    palaceKo: '남녀궁 · 처첩궁', palaceEn: 'Love & spouse palaces',
    nameKo: '재회운 관상 메이크업', subEn: 'FIRST-LOVE FACE-READING',
    descKo: '첫 만남 같은 맑은 피부 · 일자 눈썹 · 체리 틴트',
    descEn: 'First-meeting clear skin · soft straight brows · cherry tint',
    accent: '#d1495b',
    hair: 'a soft natural black-brown with a clean healthy shine.',
    prompt:
      'create a "first love" look: very clear, translucent fresh skin, soft natural straight brows, almost bare ' +
      'eyes with just a light peach wash and lightly curled lashes, a sheer peach flush high on the cheeks, and ' +
      'a sheer cherry-red lip tint blotted from the centre (gradient lip). Innocent, fresh, nostalgic.',
  },
  {
    id: 'career',
    fortuneKo: '직업·승진운', fortuneEn: 'Career', emoji: '💼',
    palaceKo: '관록궁 · 이마 중앙', palaceEn: 'Career palace · mid-forehead',
    nameKo: '승진운 관상 메이크업', subEn: 'CAREER FACE-READING',
    descKo: '이마 중앙 광 · 반듯한 눈썹 · 신뢰감 있는 립',
    descEn: 'Lit mid-forehead · structured brows · confident lip',
    accent: '#3d5a80',
    hair: 'a deep espresso brown, glossy and polished.',
    prompt:
      'give the centre of the forehead a clear, bright, smooth glow (the career palace in Korean face reading). ' +
      'Define structured, well-groomed brows with a clean tail, a crisp thin dark-brown eyeliner, matte taupe ' +
      'eyeshadow, subtle soft contour under the cheekbones, and a confident matte rose-brown MLBB lip. ' +
      'Composed, capable, trustworthy.',
  },
  {
    id: 'exam',
    fortuneKo: '합격·면접운', fortuneEn: 'Exams & Interviews', emoji: '🎓',
    palaceKo: '명궁 · 미간', palaceEn: 'Life palace · between the brows',
    nameKo: '합격운 관상 메이크업', subEn: 'SUCCESS FACE-READING',
    descKo: '깨끗한 미간 · 또렷한 눈빛 · 단정한 혈색',
    descEn: 'Clean brow-space · bright eyes · neat healthy colour',
    accent: '#2a9d8f',
    hair: 'a neat natural dark brown with a healthy gloss.',
    prompt:
      'keep the space between the brows (the life palace in Korean face reading) clean and bright with a ' +
      'very subtle highlight, and groom the inner brows neatly. Make the eyes look awake and bright: a fine ' +
      'brown tightline, curled lashes, a soft brightening of the inner corners. Add a healthy rosy-beige ' +
      'colour to the cheeks and a soft coral lip. Natural, neat, trustworthy — interview-ready.',
  },
  {
    id: 'health',
    fortuneKo: '건강운', fortuneEn: 'Vitality', emoji: '🌿',
    palaceKo: '질액궁 · 콧대 시작점', palaceEn: 'Health palace · nose root',
    nameKo: '건강운 관상 메이크업', subEn: 'VITALITY FACE-READING',
    descKo: '속광 피부 · 혈색 치크 · 맑은 눈',
    descEn: 'Inner-glow skin · healthy flush · clear eyes',
    accent: '#52b788',
    hair: 'a healthy glossy auburn brown with warm red undertones.',
    prompt:
      'create radiant, healthy "inner glow" skin with a smooth, even and luminous complexion, brighten and even ' +
      'out the under-eye area and the root of the nose between the eyes (the health palace in Korean face ' +
      'reading), add a fresh rosy flush across the cheeks and lightly over the nose bridge as if just back from a ' +
      'walk, keep the eyes clear and fresh with minimal liner, and hydrated natural pink lips. Vital, fresh, ' +
      'full of energy.',
  },
  {
    id: 'popularity',
    fortuneKo: '인복·인기운', fortuneEn: 'Popularity', emoji: '🤝',
    palaceKo: '노복궁 · 턱과 입', palaceEn: 'Friendship palace · chin & mouth',
    nameKo: '인기운 관상 메이크업', subEn: 'CHARM FACE-READING',
    descKo: '웃어 보이는 입꼬리 · 둥근 볼 블러셔 · 부드러운 턱선',
    descEn: 'Smiling-looking lips · round cheek blush · soft jawline',
    accent: '#f4a261',
    hair: 'a warm honey brown with soft caramel light.',
    prompt:
      'make the face look warm and approachable: a round warm coral blush on the apples of the cheeks, soft ' +
      'peach eyeshadow, a glossy warm orange-coral lip with fine liner at the outer corners so the lips LOOK ' +
      'softly upturned (never change the actual mouth shape or expression), and a gentle soft shading that ' +
      'makes the chin and jawline look smooth and rounded (the friendship palace in Korean face reading). ' +
      'Friendly, sunny, charming.',
  },
  {
    id: 'travel',
    fortuneKo: '해외·이동운', fortuneEn: 'Travel & Abroad', emoji: '✈️',
    palaceKo: '천이궁 · 이마 양옆', palaceEn: 'Travel palace · forehead sides',
    nameKo: '해외운 관상 메이크업', subEn: 'WANDERLUST FACE-READING',
    descKo: '이마 양옆 하이라이트 · 컬러 아이라인 포인트 · 선키스 볼',
    descEn: 'Lit temples · a pop of colour liner · sun-kissed cheeks',
    accent: '#0077b6',
    hair: 'a warm caramel brown with sun-lightened honey tones toward the ends.',
    prompt:
      'add a luminous highlight on the upper outer forehead and temples (the travel palace in Korean face ' +
      'reading), a sun-kissed warm bronze flush across the cheeks and nose, a confident pop of vivid cobalt-blue ' +
      'eyeliner flick on the upper lash line, and a glossy terracotta-nude lip. Adventurous, bright, free.',
  },
]

export const fortuneLookById = (id: FortuneLookId): FortuneLook =>
  FORTUNE_LOOKS.find((l) => l.id === id) ?? FORTUNE_LOOKS[0]

/**
 * 사주에서 부족한 오행을 메이크업 "포인트 색"으로 보충한다(같은 룩도 사람마다 달라짐).
 * 룩 지시문 뒤에 덧붙인다 — 룩의 전체 인상은 바꾸지 않고 포인트만.
 */
export const ELEMENT_ACCENT: Record<Element, { ko: string; en: string; prompt: string }> = {
  wood: { ko: '목(木) — 올리브·코랄 포인트', en: 'Wood — olive & coral accents',
    prompt: 'Add a subtle fresh accent of the Wood element: a hint of soft olive-green on the outer lash line or a fresh coral touch.' },
  fire: { ko: '화(火) — 따뜻한 레드 포인트', en: 'Fire — warm red accents',
    prompt: 'Add a subtle accent of the Fire element: slightly warmer, redder tones in the lips and cheeks.' },
  earth: { ko: '토(土) — 테라코타·베이지 포인트', en: 'Earth — terracotta & beige accents',
    prompt: 'Add a subtle accent of the Earth element: warm terracotta and beige-brown tones in the eye shadow and blush.' },
  metal: { ko: '금(金) — 샴페인 골드·실버 포인트', en: 'Metal — champagne gold & silver accents',
    prompt: 'Add a subtle accent of the Metal element: a fine champagne-gold or soft silver shimmer on the highlights and eyelids.' },
  water: { ko: '수(水) — 딥 네이비·물광 포인트', en: 'Water — deep navy & dewy accents',
    prompt: 'Add a subtle accent of the Water element: a deeper navy-brown definition at the lash line and a dewy, watery sheen on the skin.' },
}
