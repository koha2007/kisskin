// 나만의 헤어 컬러 찾기 — /hair-color/ (2026-11-11)
// ─────────────────────────────────────────────────────────────────
// 무료: MediaPipe 머리카락 영역만 색을 바꾼다(기기 안, 서버 0원). 결은 원래 밝기 차이로 살린다.
// AI(1크레딧): 같은 색을 진짜 염색처럼 — 특히 검은 머리 → 밝은 색(탈색이 필요한 색)은 무료 미리보기가 어색하다.
// 계절 태그 = 퍼스널컬러 4계절(/tools/personal-color/)과 이어 "내 계절 추천"으로 거른다.
// ⚠ import 없음 — 샘플 생성 스크립트가 그대로 읽는다.
// ⚠ 회색·백발 사고 3번(styles.ts HAIR_RULE) — 애쉬·실버 계열은 넣지 않는다.

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export interface HairColor {
  id: string
  ko: string
  en: string
  hex: string
  /** AI 에게 줄 색 설명 */
  prompt: string
  seasons: Season[]
  /** 검은 머리에서 탈색이 필요한 밝은 색 */
  bleach?: boolean
}

export const HAIR_COLORS: HairColor[] = [
  { id: 'choco-brown', ko: '초코 브라운', en: 'Chocolate Brown', hex: '#4a2a1c', seasons: ['autumn', 'winter'], prompt: 'a rich glossy chocolate brown' },
  { id: 'milk-brown', ko: '밀크 브라운', en: 'Milk Brown', hex: '#8a5d40', seasons: ['spring', 'summer'], prompt: 'a soft milky medium brown' },
  { id: 'caramel', ko: '카라멜', en: 'Caramel', hex: '#a8662f', seasons: ['spring', 'autumn'], prompt: 'a warm golden caramel brown with subtle honey highlights' },
  { id: 'khaki-brown', ko: '카키 브라운', en: 'Khaki Brown', hex: '#6b5a38', seasons: ['autumn'], prompt: 'a muted olive-khaki brown' },
  { id: 'copper', ko: '코퍼 오렌지', en: 'Copper', hex: '#b9541f', seasons: ['autumn', 'spring'], prompt: 'a vivid copper orange', bleach: true },
  { id: 'cherry-red', ko: '체리 레드', en: 'Cherry Red', hex: '#9b1830', seasons: ['winter'], prompt: 'a deep saturated cherry red' },
  { id: 'wine', ko: '와인', en: 'Burgundy Wine', hex: '#5a1a2c', seasons: ['winter', 'autumn'], prompt: 'a dark burgundy wine red' },
  { id: 'rose-brown', ko: '로즈 브라운', en: 'Rose Brown', hex: '#8c4f52', seasons: ['summer'], prompt: 'a soft rosy pink-brown' },
  { id: 'pink', ko: '베이비 핑크', en: 'Baby Pink', hex: '#e48aa6', seasons: ['summer', 'spring'], prompt: 'a pastel baby pink', bleach: true },
  { id: 'lavender', ko: '라벤더', en: 'Lavender', hex: '#9a86c9', seasons: ['summer'], prompt: 'a pastel lavender purple', bleach: true },
  { id: 'blue-black', ko: '블루 블랙', en: 'Blue Black', hex: '#1b2340', seasons: ['winter'], prompt: 'a glossy blue-black with a cool blue sheen in the light' },
  { id: 'navy', ko: '네이비 블루', en: 'Navy Blue', hex: '#2b3f86', seasons: ['winter'], prompt: 'a deep navy blue', bleach: true },
  { id: 'mint', ko: '민트', en: 'Mint', hex: '#6fbaa8', seasons: ['summer'], prompt: 'a pastel mint green', bleach: true },
  { id: 'honey-blonde', ko: '허니 블론드', en: 'Honey Blonde', hex: '#d39b4c', seasons: ['spring', 'autumn'], prompt: 'a warm golden honey blonde with softly darker roots', bleach: true },
  { id: 'beige-blonde', ko: '베이지 블론드', en: 'Beige Blonde', hex: '#d6b88c', seasons: ['spring', 'summer'], prompt: 'a creamy beige blonde with warmth and softly darker roots', bleach: true },
  { id: 'peach', ko: '피치', en: 'Peach', hex: '#e79a78', seasons: ['spring'], prompt: 'a pastel peach orange-pink', bleach: true },
]

export const hairById = (id: string): HairColor | undefined => HAIR_COLORS.find((c) => c.id === id)

export const SEASON_LABEL: Record<Season, { ko: string; en: string }> = {
  spring: { ko: '봄 웜', en: 'Spring warm' },
  summer: { ko: '여름 쿨', en: 'Summer cool' },
  autumn: { ko: '가을 웜', en: 'Autumn warm' },
  winter: { ko: '겨울 쿨', en: 'Winter cool' },
}

// styles.ts FACE_LOCK_WHOLEFACE·HAIR_RULE 과 같은 뜻(이 파일은 import 금지라 문장을 옮겨 둔다)
export function promptHair(c: HairColor): string {
  return 'You are a top hair colourist. Edit this selfie photo so that ONLY the hair colour changes.\n\n' +
    'ABSOLUTE FACE LOCK — HIGHEST PRIORITY. Do not generate a new face, do not re-draw or reshape the face. Keep identity, bone structure, ' +
    'eye shape and size, nose, mouth, jawline, skin, makeup, expression, clothing, background, lighting, pose, framing and aspect ratio 100% identical. ' +
    'The result must be unmistakably the SAME individual. Do not add any text or watermark.\n\n' +
    `Dye the hair ${c.prompt}. The dye must read as a deliberate, flattering salon colour on a young person: it must keep visible warmth and ` +
    'pigment. Never render the hair grey, silver, white, washed-out, dusty or faded, and never let it look like greying or ageing hair. ' +
    'Recolour ONLY — keep the exact same hairstyle, cut, length, volume, parting, strand-by-strand flow and hairline as the original photo. ' +
    'It must look like real salon-dyed hair with natural shine, depth and dimension — not a flat colour overlay, not a wig. ' +
    'Keep the eyebrows their natural colour. Photorealistic.'
}
