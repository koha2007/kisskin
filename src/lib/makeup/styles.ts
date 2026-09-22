// ════════════════════════════════════════════════════════════════════
// AI 메이크업 9스타일 단일 소스 (여성 9룩 복원, 2026-07-05)
// ────────────────────────────────────────────────────────────────────
// 옛 여성 9룩(그리드 시절, c34fb09^:functions/api/analyze.ts)을 복원해
// "9스타일 중 1장" 모델로 제공한다. 1개 선택 = 1크레딧 = 결과 1장.
//   Natural Glow · Cloud Skin · Blood Lip · Maximalist Eye · Metallic Eye ·
//   Bold Lip · Blush Draping & Layering · Grunge Makeup · K-pop Idol Makeup
// 이름·한 줄 설명은 옛 원본 그대로, 프롬프트는 옛 그리드 1줄 설명의 내용을
// 현재 per-look 인페인팅 구조(base = 피부보정 + 포인트 + 정체성 불변)로 옮겼다.
//
// 성별 분기 제거(2026-07-05): 단일 라인업. (옛 남성 룩·현 5룩은 git 히스토리 보관.)
//
// ── 파이프라인(무변경) ──────────────────────────────────────────────
//   [베이스]  skinInner(이마·볼·코 안쪽 평면) 피부보정 — 얼굴톤 균일·잡티 제거·
//             주름 살짝 완화. 항상 적용.
//   [포인트]  스타일별 립/볼(cheeks)/눈(eyes) — maskAreas 로 부위 지정.
// 마스크 = skinInner + 포인트 부위. 마스크 밖은 원본 픽셀 그대로(compositeInsideMask)라
// 얼굴 구조·이목구비·머리카락은 구조적으로 보존된다(§8). 프롬프트도 정체성 불변 명시.
// 피부 광채(dewy/glass)는 OpenAI 가 아니라 glow(MediaPipe) 레이어가 담당.
//
// ⚠️ 위 마스크 설명은 promptFor(마스크) 경로 한정이다. 머리카락이 마스크 밖이라
//    그 경로에선 머리색을 못 바꾼다. **현재 라이브는 whole-face 경로(promptWholeFace)**라
//    헤어 염색이 실제로 적용된다 — style.hair 참조. (2026-09-22 주석 정정: 이 문구가
//    "머리색은 절대 안 바뀐다"로 오독돼 룩 카드 제작 방향을 잘못 잡을 뻔했다.)
// ════════════════════════════════════════════════════════════════════

export type MakeupStyleId =
  | 'natural-glow'
  | 'cloud-skin'
  | 'blood-lip'
  | 'maximalist-eye'
  | 'metallic-eye'
  | 'bold-lip'
  | 'blush-draping'
  | 'grunge'
  | 'kpop-idol'

/** 마스크/편집 대상 얼굴 부위 (P1-2 maskBuilder 가 소비)
 * - 'skin'      : 얼굴 전체 윤곽 마스크(드리프트 위험 → 사용 금지, 디버그/레거시용)
 * - 'skinInner' : 윤곽 제외 안쪽 평면(이마·볼·코)만 — 베이스 피부보정(잡티/점 제거)
 * - 'lips'/'cheeks'/'eyes'/'brows' : 포인트 메이크업 부위
 */
export type MakeupArea = 'skin' | 'skinInner' | 'lips' | 'cheeks' | 'eyes' | 'brows'

export interface MakeupStyle {
  id: MakeupStyleId
  /** 한글 표시명 (카드 제목) */
  nameKo: string
  /** 영어 부제 (카드 부제, 대문자) */
  subEn: string
  /** 한글 한 줄 설명 (옛 원본 그대로) */
  descKo: string
  /** 영문 한 줄 설명 */
  descEn: string
  /** 카드 무드 색 — 글래스 위에 깔리는 스타일별 그라데이션 (CSS) */
  mood: string
  /** 무드 대표 hex — 선택 링·접근성 폴백용 */
  accent: string
  /**
   * OpenAI 인페인팅 대상 부위 — maskBuilder + makeup-edit 워커가 소비.
   * 모든 스타일이 'skinInner'(베이스 피부보정)을 공통 포함하고, 포인트 부위(lips/cheeks/eyes)를
   * 더해 단일 마스크로 합친다. 'skin'(얼굴 전체)은 절대 넣지 않는다.
   */
  maskAreas: MakeupArea[]
  /**
   * MediaPipe 스킨 광채 강도(0~1). 원본 픽셀 위 합성이라 얼굴 100% 보존.
   * 글래스/데일리 룩의 '촉촉한 광'은 OpenAI가 아니라 이 레이어로 만든다(looksEngine highlight/smooth).
   */
  glow: number
  /**
   * 룩과 함께 바뀌는 헤어 "컬러" (2026-07-12). 룩마다 다른 염색을 입혀 변화를 크게 보여준다.
   * ⚠ 컬러만 바꾼다 — 헤어스타일/길이/컷/가르마/헤어라인은 FACE_LOCK 이 그대로 고정한다.
   *   (헤어라인이 움직이면 얼굴 동일성이 깨진다.)
   * ⚠ 무채색 금지 — HAIR_RULE 이 모든 값 뒤에 자동으로 붙는다(아래 참조).
   */
  hair: string
  /** 스타일별 "적용할 메이크업" raw 지시문. promptWholeFace(whole-face)/promptFor(마스크)가 프리앰블로 감싼다. */
  prompt: string
}

// ── 베이스 공통(피부보정) — 모든 스타일 프롬프트 앞단에 합쳐진다. ──
const BASE_RETOUCH =
  'first retouch the facial skin to look clean and healthy — even out the skin tone, remove blemishes, ' +
  'freckles, dark spots, acne and acne marks, and slightly soften wrinkles and fine lines, while keeping ' +
  'realistic natural skin texture with visible pores (never plastic, waxy, over-smoothed or airbrushed)'

// 정체성·구조 불변 지시(§8). 이목구비·얼굴형·표정·마스크 밖은 절대 불변.
const PRESERVE =
  ' Preserve the exact same person: identity, facial structure, face shape, proportions, eye shape and gaze, ' +
  'nose, mouth and jawline must stay identical — you may clean and even the skin, but never change facial ' +
  'features or expression. Edit strictly inside the masked area only; do not change anything outside the mask. ' +
  'Photorealistic, natural, seamless blend at the mask edges.'

const base = (point: string) => `Within the masked area, ${BASE_RETOUCH}. Then, ${point}${PRESERVE}`

/**
 * 헤어 공통 규칙 — 모든 style.hair 뒤에 promptWholeFace() 가 자동으로 붙인다.
 *
 * 왜(2026-09-22): "회색기 도는 염색"이 전부 백발(노화)로 읽히는 사고가 세 번 났다.
 *   · 2026-07-12 metallic-eye 의 실버 그레이 → 브론즈로 교체(개별 대응)
 *   · 2026-09-22 cloud-skin('ash' + 'milky') → 회백색. 운영자 표현 "할머니 머리"
 *   · 2026-09-22 grunge('ash greige') → 같은 증상 + cloud-skin 과 색이 겹침
 * 개별 값에 'never grey' 를 하나씩 적는 방식은 두 번 빠뜨렸으므로(위 2·3번),
 * 규칙을 여기 한 곳에 두고 전 룩에 강제한다. 새 룩을 추가해도 자동 적용된다.
 *
 * ⚠ 의도적으로 무채색/애쉬 염색을 넣고 싶어지면, 이 규칙을 지우지 말고 해당 룩에만
 *   예외를 적을 것 — 지우면 위 세 사고가 전부 되돌아온다.
 */
const HAIR_RULE =
  ' The dye must read as a deliberate, flattering salon colour on a young person: it must keep visible warmth ' +
  'and pigment. Never render the hair grey, silver, white, washed-out, dusty or faded, and never let it look ' +
  'like greying or ageing hair — if the colour is a light or cool shade, keep it clearly tinted (beige, blonde, ' +
  'rose or brown) with softly darker roots rather than desaturated grey.'

// 옛 여성 9룩(그리드 좌→우, 위→아래) 순서 그대로 복원.
export const MAKEUP_STYLES: MakeupStyle[] = [
  {
    id: 'natural-glow',
    nameKo: '내추럴 글로우',
    subEn: 'NATURAL GLOW',
    descKo: '광채 피부, 피치 블러셔, 누드 립. 자연스러운 건강미',
    descEn: 'Radiant skin, peach blush, nude lip — natural healthy glow',
    mood: 'linear-gradient(150deg, #fdeef0 0%, #f7c9b0 100%)',
    accent: '#f4b79c',
    maskAreas: ['skinInner', 'lips', 'cheeks'],
    glow: 0.24,
    hair: 'a soft natural dark brown with warm chocolate depth, subtly lighter and glossier than plain black.',
    prompt:
      // 2026-09-22 — 비포와 애프터가 거의 구분되지 않았다("안 바뀌었네"). 9칸 중 첫 칸이자
      // 무료 체험이 가장 많이 닿는 룩이라 변화가 안 보이면 바로 이탈이다. 자연스러움은 유지하되
      // "한 듯 안 한 듯"이 **한 듯** 쪽으로 오도록 각 요소를 한 단계씩 올린다.
      'give the skin a dewy, luminous healthy glow (moist but never greasy) that is clearly more radiant and ' +
        'even than bare skin, add a soft natural peach blush on the apples of the cheeks — subtle and narrow, ' +
        'but with enough colour to be plainly visible — softly define and groom the brows, add gently defined ' +
        'lashes, and a soft nude "my-lips-but-better" lip with a healthy tint and sheen, keeping the ' +
        'original lip shape. The result must still read as effortless everyday makeup, but it must be ' +
        'unmistakable at a glance that makeup has been applied — never identical to the bare face.',
  },
  {
    id: 'cloud-skin',
    nameKo: '클라우드 스킨',
    subEn: 'CLOUD SKIN',
    descKo: '구름처럼 뽀얀 피부, 깨끗한 베이스',
    descEn: 'Cloud-soft luminous complexion, a flawless clean base',
    mood: 'linear-gradient(150deg, #f3f1fb 0%, #d7d3ee 100%)',
    accent: '#cfc9e8',
    maskAreas: ['skinInner', 'lips'],
    glow: 0.2,
    // 2026-09-22 — 'ash' + 'milky' 조합이 회백색(백발)으로 나왔다. 뽀얀 무드는 유지하되
    // 밝기를 회색이 아니라 "따뜻한 베이지"로 낸다. HAIR_RULE 이 추가로 무채색을 막는다.
    hair:
      'a soft milk-tea beige brown — light and creamy with clear golden-beige warmth and softly darker roots, ' +
      'glossy and healthy like a fresh salon dye.',
    prompt:
      'create a soft "cloud skin" complexion — a smooth, poreless-looking soft-matte veil that is noticeably ' +
        'brighter and more even than bare skin (cloud-like and airy, never cakey, and never grey, ashen or ' +
        'drained of colour — the skin must keep its own healthy warmth), and keep the lips a ' +
        'clean natural tone with no strong color. Do NOT add blush to the cheeks.',
  },
  {
    id: 'blood-lip',
    nameKo: '블러드 립',
    subEn: 'BLOOD LIP',
    descKo: '진한 버건디/레드 립. 입술이 가장 먼저 눈에 띄게, 깔끔한 아이 메이크업',
    descEn: 'Deep burgundy-red lip that steals focus, clean eyes',
    mood: 'linear-gradient(150deg, #b0243a 0%, #6f0f22 100%)',
    accent: '#8f1728',
    maskAreas: ['skinInner', 'lips'],
    glow: 0.12,
    hair: 'a deep burgundy wine, dark and rich with red light catching the surface.',
    prompt:
      'apply a deep, saturated burgundy blood-red lip — bold and clearly the first thing you notice — keeping ' +
        'the original lip shape, and keep the eyes clean and minimal. Do NOT add any blush.',
  },
  {
    id: 'maximalist-eye',
    nameKo: '맥시멀리스트 아이',
    subEn: 'MAXIMALIST EYE',
    descKo: '컬러 아이섀도(보라/파랑/초록), 굵은 아이라인. 화려한 눈매',
    descEn: 'Colorful eyeshadow and bold liner — a statement eye',
    mood: 'linear-gradient(150deg, #7c5cff 0%, #3aa0e0 55%, #37c39a 100%)',
    accent: '#6a5cff',
    maskAreas: ['skinInner', 'eyes'],
    glow: 0.1,
    hair: 'a glossy jet black with a healthy mirror-like shine, so the bold eyes stay the focus.',
    prompt:
      'apply a bold, colorful maximalist eye look — vivid blended eyeshadow across the lids in purple, blue and ' +
        'green tones with a thick, well-defined eyeliner for dramatic, statement-making eyes, and keep the lips a ' +
        'neutral nude tone. Do NOT change the eye shape; only add makeup on the lids.',
  },
  {
    id: 'metallic-eye',
    nameKo: '메탈릭 아이',
    subEn: 'METALLIC EYE',
    descKo: '골드/실버 메탈릭 아이섀도, 글로시 눈매. 확실한 반짝임',
    descEn: 'Gold/silver metallic shimmer for glossy, glinting eyes',
    mood: 'linear-gradient(150deg, #f5e2a8 0%, #d9b45f 55%, #b8bcc4 100%)',
    accent: '#d3b25e',
    maskAreas: ['skinInner', 'eyes'],
    glow: 0.2,
    // 실버 그레이는 모델을 가리지 않고 "백발(노화)"로 읽힐 위험이 컸다(2026-07-12 실측).
    // 룩의 핵심인 금속광은 유지하되, 따뜻한 브론즈로 바꿔 의도한 패션 염색으로 읽히게 한다.
    hair: 'a burnished metallic bronze with warm copper shine and softly darker roots — a deliberate fashion dye, never grey or ageing.',
    prompt:
      'apply a metallic eye look — reflective gold and silver shimmer eyeshadow packed on the lids for a glossy, ' +
        'clearly glinting metallic finish, and keep the lips a soft neutral tone. Do NOT change the eye shape; ' +
        'only add shimmer makeup on the lids.',
  },
  {
    id: 'bold-lip',
    nameKo: '볼드 립',
    subEn: 'BOLD LIP',
    descKo: '선명한 빨강/코랄 립. 밝고 비비드한 컬러',
    descEn: 'A bright, vivid red-coral statement lip',
    mood: 'linear-gradient(150deg, #ff6f5e 0%, #e02638 100%)',
    accent: '#f0384a',
    maskAreas: ['skinInner', 'lips'],
    glow: 0.16,
    hair: 'a warm caramel brown with sun-lit golden highlights.',
    prompt:
      'apply a bright, vivid red-coral bold lip — brighter and more vivid than a deep burgundy — with clear, ' +
        'eye-catching color, keeping the original lip shape. Do NOT add any blush.',
  },
  {
    id: 'blush-draping',
    nameKo: '블러쉬 드레이핑 & 레이어링',
    subEn: 'BLUSH DRAPING & LAYERING',
    descKo: '광대~관자놀이 진한 분홍/코랄 블러셔. 볼 색이 확실히',
    descEn: 'Draped pink-coral blush swept from cheeks to temples',
    mood: 'linear-gradient(150deg, #ffd2df 0%, #f4879f 100%)',
    accent: '#f18aa0',
    maskAreas: ['skinInner', 'cheeks', 'lips'],
    glow: 0.16,
    hair: 'a soft rose brown with a mauve-pink cast, romantic and dusty.',
    prompt:
      // 2026-09-22 — "clearly visible" 만으론 광대에 뭉친 붉은 얼룩(술 취한 볼)이 나왔다.
      // 드레이핑의 핵심은 채도가 아니라 **방향(광대→관자놀이)과 가장자리 그라데이션**이라
      // 강도 상한과 경계 처리를 명시한다.
      'apply a "blush draping" look — a layered pink-coral blush swept diagonally from the cheekbones up toward ' +
        'the temples, following that lifted direction so it sculpts the face, and keep the lips a soft ' +
        'coordinating rosy tone. The blush must be sheer and fully blended: veil-like layers of colour with no ' +
        'hard edge, no solid patch and no round dot on the apples, and the natural skin texture must still show ' +
        'through it. Flushed and sculpted, never sunburnt, blotchy or feverish.',
  },
  {
    id: 'grunge',
    nameKo: '그런지 메이크업',
    subEn: 'GRUNGE MAKEUP',
    descKo: '스모키 아이, 다크 베리 립, 매트 피부. 강렬한 무드',
    descEn: 'Smoky eyes, dark berry lip, matte skin — an edgy mood',
    mood: 'linear-gradient(150deg, #5b4a63 0%, #2a2130 100%)',
    accent: '#4a3d52',
    maskAreas: ['skinInner', 'eyes', 'lips'],
    glow: 0.06,
    // 2026-09-22 — 'ash greige(desaturated grey-brown)' 가 백발로 읽혔고 cloud-skin 과도 겹쳤다.
    // 그런지의 "날것" 무드는 회색이 아니라 **자란 뿌리가 드러난 탈색**으로 내는 게 정확하다.
    hair:
      'a lived-in bleached blonde with deliberately dark grown-out roots — a cool, slightly undone punk salon ' +
      'bleach that still reads unmistakably blonde (never grey or silver), with visible root contrast.',
    prompt:
      'create an edgy grunge look — a smudged smoky eye in dark grey-brown tones, a dark berry lip, and a matte ' +
        'skin finish for an intense, moody vibe. Do NOT change the eye or lip shape; only add makeup.',
  },
  {
    id: 'kpop-idol',
    nameKo: 'K-pop 아이돌 메이크업',
    subEn: 'K-POP IDOL MAKEUP',
    descKo: '유리알 광택, 그라데이션 핑크 립, 쉬머 하이라이트',
    descEn: 'Glass-glow skin, gradient pink lip, shimmer highlight',
    mood: 'linear-gradient(150deg, #ffe3ef 0%, #f7a9cf 100%)',
    accent: '#f39ac4',
    maskAreas: ['skinInner', 'lips', 'cheeks'],
    glow: 0.32,
    // 2026-07-12 — "네이비 블루블랙"이 그냥 검정으로 읽혀 변화가 안 보여 사파이어 블루로 올렸다.
    // 2026-09-22 — 그 파랑이 반대로 **메이크업을 잡아먹었다**. 이 룩의 핵심은 유리알 광택·그라데
    //   이션 핑크 립인데 화면엔 파란 머리만 남았고, 셀카를 넣은 사용자에게도 "내가 아닌" 결과가 된다.
    //   머리는 거들고 메이크업이 주인공이 되도록, 요즘 아이돌 톤의 밝은 브라운으로 되돌린다.
    hair:
      'a warm rose-brown "milk tea" — a bright, on-trend K-pop idol brown with a soft pink cast, high gloss and ' +
      'softly darker roots. Keep it a natural-looking brown so the makeup, not the hair, is the focus.',
    prompt:
      'create a K-pop idol look — glossy "glass skin" with a luminous glazed glow, a soft gradient blurred pink ' +
        'lip (deeper in the center fading out), a light pink flush on the apples of the cheeks, and a subtle ' +
        'shimmer highlight on the high points for a fresh, youthful idol finish.',
  },
]

export const styleById = (id: MakeupStyleId): MakeupStyle =>
  MAKEUP_STYLES.find((s) => s.id === id) ?? MAKEUP_STYLES[0]

// ── 얼굴 보존(face-lock) 프리앰블 — whole-face 편집용(옛 9룩 방식 복원). ──
// 마스크가 없으므로 얼굴 동일성은 전적으로 프롬프트에 위임한다(얼굴 변형 리스크 감수).
// 옛 analyze.ts(c34fb09) FACE_LOCK_MAKEUP 문구를 단일 라인업으로 이식.
const FACE_LOCK_WHOLEFACE =
  'ABSOLUTE FACE LOCK — HIGHEST PRIORITY. DO NOT generate a new face. DO NOT re-draw or reshape the face. ' +
  'Use the EXACT pixels of the original face and composite makeup ON TOP as an overlay. Keep identity, bone ' +
  'structure, eye shape and size, nose, mouth, jawline, cheekbones, forehead, hairline, ears, face width and ' +
  'length, skin texture, moles, freckles and scars 100% IDENTICAL. Keep the SAME hairstyle — same cut, length, ' +
  'volume, parting, strand flow and hairline (only the hair COLOUR changes, as specified below; do not restyle, ' +
  'lengthen, shorten or add hair). Keep the SAME clothing, background, ' +
  'lighting, pose, expression, framing and composition. The result MUST be unmistakably the SAME individual — ' +
  'not a similar-looking or prettier person. Do not add any text, numbers, labels or watermark. If teeth show, ' +
  'keep them white and clean.'

/**
 * whole-face 편집 프롬프트(옛 9룩 방식, 마스크 없음). 사진 전체를 재생성하되
 * FACE_LOCK 프리앰블로 얼굴 동일성을 지시한다. MakeupFlow whole-face 경로가 사용.
 */
export function promptWholeFace(style: MakeupStyle): string {
  return (
    `You are a top makeup artist. Edit this selfie photo to apply the "${style.subEn}" makeup look. ` +
    `${FACE_LOCK_WHOLEFACE}\n\n` +
    'Keep the exact same image aspect ratio, framing and crop as the input photo — do not zoom, pad, ' +
    'letterbox or change the composition; the output must have the same proportions as the input.\n\n' +
    `First, ${BASE_RETOUCH}. Then apply the makeup: ${style.prompt}\n\n` +
    // 헤어 컬러도 룩의 일부 — 염색만 하고 헤어 "형태"는 손대지 않는다(헤어라인이 움직이면 동일인이 아니게 됨).
    `Then dye the hair: ${style.hair}${HAIR_RULE} Recolour ONLY — keep the exact same hairstyle, cut, length, volume, ` +
    'parting, strand-by-strand flow and hairline as the original photo. The dye must look like real salon-dyed ' +
    'hair with natural shine, depth and darker roots — not a flat colour overlay, not a wig. Keep the eyebrows ' +
    'their natural colour unless the look says otherwise.\n\n' +
    'By default give the lips a naturally glossy, hydrated sheen with a soft healthy shine (unless this ' +
    'specific look calls for a matte finish). ' +
    'Again: keep the original face pixels unchanged — only the makeup and the hair colour change. ' +
    'Photorealistic and natural.'
  )
}

/**
 * 마스크(부분 편집) 프롬프트 — Stage 2(MediaPipe) 경로용. 현재 whole-face 복원에선
 * 미사용이나 코드 보존을 위해 유지한다. base()가 "마스크 영역 안에서만" 문구로 감싼다.
 */
export function promptFor(style: MakeupStyle): string {
  return base(style.prompt)
}
