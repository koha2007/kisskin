// ════════════════════════════════════════════════════════════════════
// AI 메이크업 5스타일 단일 소스 (FREE_PIVOT_PLAN §2-1 / 커밋 P1-1)
// ────────────────────────────────────────────────────────────────────
// 9종 그리드를 폐기하고 "5스타일 중 1장" 모델로 전환한다.
//   1개 선택 = 1크레딧 = 결과 1장.
// 라벨·한 줄 설명·무드 색은 여기서만 관리하고, 마스크 부위(maskAreas)와
// 편집 프롬프트(prompt)는 P1-2(MediaPipe 마스크)·P1-3(OpenAI 인페인팅)이
// 그대로 소비한다. 트렌드 갱신 시 이 파일만 수정.
//
// ── 2층 구조 (STEP 2, 2026-06-18 확정) ──────────────────────────────
// 모든 스타일 = [베이스 공통] + [스타일별 포인트] 를 **단일 마스크·단일 프롬프트**로
// OpenAI 1회 호출(비용 2배 방지)한다.
//   [베이스]  skinInner(이마·볼·코 안쪽 평면) 피부보정 — 얼굴톤 균일·기미/잡티 제거·
//             주름 살짝 완화. STEP 1 검증 통과(피부 깨끗 + 얼굴 불변 + 안 과함).
//   [포인트]  스타일별 립(·볼). 볼(블러셔)은 홍조처럼 과하지 않게 "사과볼만 좁고 옅게",
//             SIGNATURE 는 블러셔를 아예 빼고 글래스 광(glow 레이어)만.
// 마스크 = skinInner + lips (볼은 skinInner 안에 이미 포함 → 프롬프트로 블러셔 제어).
// §8 금지: 얼굴 구조 변형 금지 → 마스크 밖 원본 합성(compositeInsideMask)이 정체성을
// 구조적으로 보존하고, 프롬프트도 이목구비·얼굴형·표정 불변을 항상 명시한다.
// 피부 광채(dewy/glass)는 OpenAI 가 아니라 glow(MediaPipe) 레이어가 담당.
// ════════════════════════════════════════════════════════════════════

export type MakeupStyleId = 'natural' | 'everyday' | 'signature' | 'pop' | 'bold'

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
  /** 한글 한 줄 설명 (시안의 영어 부제 대신/추가) */
  descKo: string
  /** 영문 한 줄 설명 */
  descEn: string
  /** 카드 무드 색 — 글래스 위에 깔리는 스타일별 그라데이션 (CSS) */
  mood: string
  /** 무드 대표 hex — 선택 링·접근성 폴백용 */
  accent: string
  /**
   * OpenAI 인페인팅 대상 부위 — P1-2 마스크 생성기 + P1-3 makeup-edit 워커가 소비.
   * 2층 구조(2026-06-18): 모든 스타일이 'skinInner'(베이스 피부보정)을 공통 포함하고,
   * 'lips'(포인트)를 더해 단일 마스크로 합친다. 'skin'(얼굴 전체)은 절대 넣지 않는다.
   * 볼(블러셔)은 skinInner 가 이미 볼을 덮으므로 별도 area 없이 프롬프트로 제어한다.
   */
  maskAreas: MakeupArea[]
  /**
   * MediaPipe 스킨 광채 강도(0~1). 원본 픽셀 위 합성이라 얼굴 100% 보존.
   * 글래스/데일리 룩의 '촉촉한 광'은 OpenAI가 아니라 이 레이어로 만든다(looksEngine highlight/smooth).
   */
  glow: number
  /** OpenAI 이미지 편집 프롬프트 — 베이스 피부보정 + 스타일 포인트 + 정체성/구조 불변 */
  prompt: string
}

// ── 베이스 공통(피부보정) — 모든 스타일 프롬프트 앞단에 합쳐진다(STEP 1 검증본). ──
const BASE_RETOUCH =
  'first retouch the facial skin to look clean and healthy — even out the skin tone, remove blemishes, ' +
  'freckles, dark spots, acne and acne marks, and slightly soften wrinkles and fine lines, while keeping ' +
  'realistic natural skin texture with visible pores (never plastic, waxy, over-smoothed or airbrushed)'

// 정체성·구조 불변 지시(§8). 베이스가 피부를 정돈하므로 "피부톤 동일"은 빼되,
// 이목구비·얼굴형·표정·마스크 밖은 절대 불변을 강제한다.
const PRESERVE =
  ' Preserve the exact same person: identity, facial structure, face shape, proportions, eye shape and gaze, ' +
  'nose, mouth and jawline must stay identical — you may clean and even the skin, but never change facial ' +
  'features or expression. Edit strictly inside the masked area only; do not change anything outside the mask. ' +
  'Photorealistic, natural, seamless blend at the mask edges.'

const base = (point: string) => `Within the masked area, ${BASE_RETOUCH}. Then, ${point}${PRESERVE}`

// 강도 순서: natural(가장 옅음) → bold(가장 강함). 시안 레이아웃의
// 2열×2 + 가운데 5번째(bold)와 동일 순서.
export const MAKEUP_STYLES: MakeupStyle[] = [
  {
    id: 'natural',
    nameKo: '클린 데일리',
    subEn: 'CLEAN DEWY',
    descKo: '민낯 같지만 화사한, 물기 어린 본판 룩',
    descEn: 'Bare-skin glow, barely-there but radiant',
    mood: 'linear-gradient(150deg, #fdeef0 0%, #f6cdd4 100%)',
    accent: '#f3b6c0',
    maskAreas: ['skinInner', 'lips'],
    glow: 0.16,
    prompt: base(
      'give the lips a soft natural "my-lips-but-better" rosy-nude tint with a subtle dewy sheen, keeping the ' +
        'original lip shape. Do NOT add any blush or color to the cheeks.',
    ),
  },
  {
    id: 'everyday',
    nameKo: 'MLBB 데일리',
    subEn: 'MY-LIPS-BUT-BETTER',
    descKo: '내 입술보다 살짝 예쁜, 매일 데일리 톤',
    descEn: 'My-lips-but-better, the everyday daily tone',
    mood: 'linear-gradient(150deg, #f3d8c9 0%, #d8a48f 100%)',
    accent: '#d8a48f',
    maskAreas: ['skinInner', 'lips'],
    glow: 0.18,
    prompt: base(
      'apply a soft mauve-rose "my-lips-but-better" lip, and only a very faint, narrow healthy flush placed ' +
        'just on the apples of the cheeks — keep it subtle and wearable, never a wide or strong blush.',
    ),
  },
  {
    id: 'signature',
    nameKo: '글래스 스킨',
    subEn: 'GLOWING GLASS',
    descKo: '촉촉한 광채 베이스의 생기 넘치는 시그니처 룩',
    descEn: 'Dewy glass-skin glow, the signature radiant look',
    mood: 'linear-gradient(150deg, #dcebf1 0%, #a9d4e3 100%)',
    accent: '#a9d4e3',
    // 글래스 광은 glow(MediaPipe) 레이어가 강하게(0.32). 블러셔는 빼고 립만.
    maskAreas: ['skinInner', 'lips'],
    glow: 0.32,
    prompt: base(
      'apply a glossy, dewy natural-pink lip for a luminous K-beauty "glass skin" finish. Do NOT add any blush ' +
        'or color to the cheeks — leave the cheeks as clean, glowing bare skin.',
    ),
  },
  {
    id: 'pop',
    nameKo: '과즙 메이크업',
    subEn: 'JUICY FRUITY POP',
    descKo: '과즙 가득 코랄 블러셔와 통통한 글로시 립',
    descEn: 'Juicy coral blush with a plump glossy lip',
    mood: 'linear-gradient(150deg, #ffe0bd 0%, #f7956a 100%)',
    accent: '#f7956a',
    maskAreas: ['skinInner', 'lips'],
    glow: 0.18,
    prompt: base(
      'apply a plump glossy coral lip, and a small, soft coral blush placed only on the apples of the cheeks — ' +
        'keep the blush subtle and narrow, a light wash and not a wide or heavy flush.',
    ),
  },
  {
    id: 'bold',
    nameKo: '시크 레드',
    subEn: 'CHIC BOLD RED',
    descKo: '선명한 레드 립으로 완성하는 시크한 무드',
    descEn: 'A chic mood finished with a bold red lip',
    mood: 'linear-gradient(150deg, #e0566a 0%, #b81d33 100%)',
    accent: '#d61f2b',
    maskAreas: ['skinInner', 'lips'],
    glow: 0.12,
    prompt: base(
      'apply a bold, saturated classic-red lip, keeping the original lip shape. Do NOT add any blush; keep the ' +
        'eyes and eyebrows unchanged.',
    ),
  },
]

export const styleById = (id: MakeupStyleId): MakeupStyle =>
  MAKEUP_STYLES.find((s) => s.id === id) ?? MAKEUP_STYLES[0]

// ── 성별 분기 (2026-06-18) ──────────────────────────────────────────
// 남성: 모든 스타일에서 립 색·블러셔·메이크업을 빼고 베이스(피부보정)만 적용.
//   입술이 칙칙할 때만 "건강한 혈색" 정도로 아주 미세하게(립스틱·글로시 절대 금지).
//   → 5스타일이 남성에선 사실상 동일한 '깨끗한 피부' 룩으로 수렴(의도).
//   glow(스킨 광채) 레이어는 스타일별 강도 그대로 유지(피부 위 광채라 무해).
const MALE_POINT =
  'do NOT apply any lipstick, lip tint, gloss, blush or visible makeup of any kind — the subject is a man, ' +
  'keep the look completely natural and masculine. Leave the lips their own natural color; only if the lips ' +
  'look dull or pale, restore a subtle healthy natural lip tone (never glossy, never colored lipstick).'

export type MakeupGender = 'male' | 'female'

/** 성별 반영 프롬프트 — 남성은 베이스만(립/블러셔 제거), 여성은 스타일 그대로. */
export function promptFor(style: MakeupStyle, gender: MakeupGender): string {
  return gender === 'male' ? base(MALE_POINT) : style.prompt
}
