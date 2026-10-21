// 동물상 9종 + 시크릿 — 이름·한 줄 성향·소개(한/영) (2026-10-21)
// 배지 이미지: public/fortune/badges/{id}.webp (민화 배지, 동물별 고유색·길상 소품)
// ⚠ 재미용 문장. 사람을 깎아내리는 말·외모 평가는 쓰지 않는다 — 모든 동물상은 "매력"으로만 묘사.
import type { AnimalId } from './face'

export interface AnimalInfo {
  id: AnimalId
  ko: string
  en: string
  hanja: string
  /** 카드 앞면 한 줄(성향 키워드) */
  vibeKo: string
  vibeEn: string
  /** 카드 뒷면 손글씨 한 줄 */
  quoteKo: string
  quoteEn: string
  /** 결과 화면 소개 2~3문장 */
  descKo: string
  descEn: string
  /** 민화 배지 소품(왜 이 그림인지) */
  symbolKo: string
  symbolEn: string
  /** 배지 대표색 */
  color: string
}

export const ANIMALS: Record<AnimalId, AnimalInfo> = {
  fox: {
    id: 'fox', ko: '여우상', en: 'Fox Face', hanja: '狐', color: '#d6402f',
    vibeKo: '매혹의 눈빛', vibeEn: 'Magnetic gaze',
    quoteKo: '눈빛 하나로 판을 읽는 사람', quoteEn: 'Reads the room with one look',
    descKo: '올라간 눈꼬리와 섬세한 이목구비가 만드는 도도한 매력. 처음엔 차가워 보여도 가까워질수록 재치와 센스가 드러나는 타입이에요.',
    descEn: 'Lifted eye corners and fine features give you a cool, captivating charm. You look aloof at first, then win people over with wit.',
    symbolKo: '아홉 꼬리 구미호와 여우구슬 — 지혜와 매력', symbolEn: 'Nine-tailed gumiho with a fox pearl — wisdom and allure',
  },
  cat: {
    id: 'cat', ko: '고양이상', en: 'Cat Face', hanja: '猫',
    color: '#e8708a',
    vibeKo: '도도한 사랑스러움', vibeEn: 'Aloof but adorable',
    quoteKo: '내 사람에게만 다정한 사람', quoteEn: 'Sweet only to my people',
    descKo: '또렷한 눈매와 균형 잡힌 얼굴. 혼자서도 잘 지내지만 마음을 연 사람에게는 누구보다 다정한 반전 매력이 있어요.',
    descEn: 'Clear eyes and a balanced face. Independent, yet surprisingly warm once you let someone in.',
    symbolKo: '모란과 나비(묘접도) — 부귀와 장수', symbolEn: 'Peony and butterfly — prosperity and long life',
  },
  dog: {
    id: 'dog', ko: '강아지상', en: 'Puppy Face', hanja: '犬', color: '#4a90c2',
    vibeKo: '무장해제 미소', vibeEn: 'Disarming warmth',
    quoteKo: '있는 것만으로 분위기가 밝아지는 사람', quoteEn: 'Lights up any room just by being there',
    descKo: '살짝 처진 순한 눈매가 주는 편안함. 처음 만난 사람도 금방 마음을 여는, 신뢰와 호감의 아이콘이에요.',
    descEn: 'Gently downturned eyes make you instantly approachable — strangers open up to you fast.',
    symbolKo: '삽살개 — 나쁜 기운을 쫓는 복덩이', symbolEn: 'Sapsal-gae — the lucky dog that chases bad spirits',
  },
  rabbit: {
    id: 'rabbit', ko: '토끼상', en: 'Bunny Face', hanja: '兎', color: '#1f3a6b',
    vibeKo: '맑고 상큼한 기운', vibeEn: 'Fresh and bright',
    quoteKo: '보고만 있어도 기분 좋아지는 사람', quoteEn: 'Makes people smile at a glance',
    descKo: '동그란 눈과 아담한 이목구비의 상큼함. 밝은 에너지로 주변을 환하게 만드는 막내 같은 매력이에요.',
    descEn: 'Round eyes and petite features — a bright, youthful energy that lifts everyone around you.',
    symbolKo: '보름달 속 옥토끼 — 소원과 장수', symbolEn: 'The moon rabbit — wishes and long life',
  },
  bear: {
    id: 'bear', ko: '곰상', en: 'Bear Face', hanja: '熊', color: '#2f8f5b',
    vibeKo: '듬직한 포근함', vibeEn: 'Steady and cozy',
    quoteKo: '기대고 싶은 든든한 사람', quoteEn: 'The one everyone leans on',
    descKo: '부드럽고 넉넉한 인상이 주는 안정감. 말수가 많지 않아도 곁에 있으면 마음이 놓이는 타입이에요.',
    descEn: 'A soft, generous look that makes people feel safe — calm presence, big heart.',
    symbolKo: '쑥과 마늘 — 단군신화의 인내와 탄생', symbolEn: 'Mugwort and garlic — patience from Korea’s founding myth',
  },
  deer: {
    id: 'deer', ko: '사슴상', en: 'Deer Face', hanja: '鹿', color: '#1f8a8a',
    vibeKo: '우아한 청순함', vibeEn: 'Graceful and pure',
    quoteKo: '조용히 시선을 끄는 사람', quoteEn: 'Draws eyes without trying',
    descKo: '크고 맑은 눈과 갸름한 선이 만드는 청초함. 차분하지만 한 번 보면 잊히지 않는 분위기가 있어요.',
    descEn: 'Big clear eyes and slender lines — calm, elegant and quietly unforgettable.',
    symbolKo: '불로초와 학(십장생) — 장수와 복록', symbolEn: 'Lingzhi and crane — longevity and fortune',
  },
  tiger: {
    id: 'tiger', ko: '호랑이상', en: 'Tiger Face', hanja: '虎', color: '#e0a100',
    vibeKo: '압도적 카리스마', vibeEn: 'Commanding charisma',
    quoteKo: '들어서는 순간 공기가 바뀌는 사람', quoteEn: 'Changes the air when you walk in',
    descKo: '선명한 눈매와 굵직한 이목구비의 존재감. 리더의 기운이 강하고, 내 사람은 끝까지 지키는 의리파예요.',
    descEn: 'Strong eyes and bold features — natural leader energy and fierce loyalty.',
    symbolKo: '까치와 소나무(호작도) — 기쁜 소식과 액막이', symbolEn: 'Magpie and pine (Hojakdo) — good news and protection',
  },
  wolf: {
    id: 'wolf', ko: '늑대상', en: 'Wolf Face', hanja: '狼', color: '#2b3a67',
    vibeKo: '서늘한 섹시함', vibeEn: 'Cool intensity',
    quoteKo: '말없이 다 알아보는 사람', quoteEn: 'Sees everything, says little',
    descKo: '날카로운 눈매와 또렷한 선의 서늘한 분위기. 신비로워 보이지만 한 번 마음먹으면 끝까지 가는 뚝심이 있어요.',
    descEn: 'Sharp eyes and clean lines — mysterious, cool, and fiercely determined.',
    symbolKo: '보름달과 구름 — 밤을 지키는 수호자', symbolEn: 'Full moon and clouds — guardian of the night',
  },
  dino: {
    id: 'dino', ko: '공룡상', en: 'Dino Face', hanja: '龍', color: '#6a3fa0',
    vibeKo: '반전 귀여움', vibeEn: 'Bold yet lovable',
    quoteKo: '센 첫인상, 알고 보면 순둥이', quoteEn: 'Strong first impression, total softie',
    descKo: '시원시원한 이목구비가 주는 강한 첫인상. 그런데 웃으면 확 귀여워지는 반전 매력의 소유자예요.',
    descEn: 'Big, bold features make a strong first impression — then your smile turns it adorable.',
    symbolKo: '여의주를 든 아기 용 — 소원 성취', symbolEn: 'Baby dragon with a wish-granting pearl',
  },
}

/** 10번째 시크릿 — 활동 보상(9종 모으기 / 궁합 3회 / 신년 이벤트). 확률형 유료 판매 X. */
export const SECRET_BADGE = {
  id: 'secret-gumiho' as const,
  ko: '황금 구미호', en: 'Golden Gumiho', hanja: '九尾',
  descKo: '도감 9종을 모두 채운 사람에게만 나타나는 전설의 배지.',
  descEn: 'A legendary badge that appears only for those who complete all 9.',
}

export const badgeSrc = (id: AnimalId | 'secret-gumiho') => `/fortune/badges/${id}.webp`

/** 측정 근거 한 줄 — 눈매 축·이목구비 축이 왜 이 동물인지 */
export function whyAnimal(x: number, y: number, isEn: boolean): string {
  const eye = x > 0.3 ? (isEn ? 'lifted, sharp eyes' : '올라간 날렵한 눈매')
    : x < -0.3 ? (isEn ? 'soft, rounded eyes' : '둥글고 순한 눈매')
      : (isEn ? 'balanced eyes' : '균형 잡힌 눈매')
  const feat = y > 0.6 ? (isEn ? 'bold features' : '굵직한 이목구비')
    : y < -0.6 ? (isEn ? 'delicate features' : '섬세한 이목구비')
      : (isEn ? 'well-balanced features' : '조화로운 이목구비')
  return `${eye} + ${feat}`
}
