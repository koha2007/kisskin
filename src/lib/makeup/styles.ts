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
// ⚠️ 머리색 변경(옛 Cloud Skin·K-pop)은 이 아키텍처에선 불가 — 머리카락은 마스크
//    밖이라 원본으로 복원된다. 해당 룩은 피부/메이크업 요소만 반영한다.
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
    prompt:
      'give the skin a dewy, luminous healthy glow (moist but never greasy), add a soft natural peach blush only ' +
        'on the apples of the cheeks kept subtle and narrow, and a soft nude "my-lips-but-better" lip keeping the ' +
        'original lip shape.',
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
    prompt:
      'create a soft "cloud skin" complexion — a smooth, poreless-looking soft-matte veil that is noticeably ' +
        'brighter, milkier and more even than bare skin (cloud-like and airy, never cakey), and keep the lips a ' +
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
    prompt:
      'apply a "blush draping" look — a clearly visible layered pink-coral blush swept from the cheekbones up ' +
        'toward the temples (a diffused, sculpting wash of color, not a small dot), and keep the lips a soft ' +
        'coordinating rosy tone.',
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
  'length, skin texture, moles, freckles and scars 100% IDENTICAL. Keep the SAME hair, clothing, background, ' +
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
    'By default give the lips a naturally glossy, hydrated sheen with a soft healthy shine (unless this ' +
    'specific look calls for a matte finish). ' +
    'Again: keep the original face pixels unchanged — only the makeup changes. Photorealistic and natural.'
  )
}

/**
 * 마스크(부분 편집) 프롬프트 — Stage 2(MediaPipe) 경로용. 현재 whole-face 복원에선
 * 미사용이나 코드 보존을 위해 유지한다. base()가 "마스크 영역 안에서만" 문구로 감싼다.
 */
export function promptFor(style: MakeupStyle): string {
  return base(style.prompt)
}
