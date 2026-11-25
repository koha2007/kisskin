// AI 이상형 테스트 — 동물상 8유형 (2026-11-25, docs/IDEAL_TYPE_PLAN.md)
// 이름은 동물·무드형만. 연예인 이름·"○○ 닮은" 표현은 쓰지 않는다(10/29 원칙).
// 그림: public/ideal-type/{slug}-{m|f}-{place}.webp — 8유형 × 남·여 × Q1 장소 4 = 64장(화풍 B안, AI 생성)
import type { IdentityCardData } from '../identityCard/types'
import { CARD_NAVY } from '../identityCard/types'
import type { MakeupStyleId } from '../makeup/styles'

export type IdealTypeCode = 'golden-retriever' | 'black-cat' | 'fox' | 'bunny' | 'teddy-bear' | 'deer' | 'wolf' | 'dino'
export type IdealGender = 'm' | 'f'
export type IdealPlace = 'picnic' | 'lpbar' | 'exhibition' | 'amusement'

export const IDEAL_ORDER: IdealTypeCode[] = ['golden-retriever', 'black-cat', 'fox', 'bunny', 'teddy-bear', 'deer', 'wolf', 'dino']
export const IDEAL_PLACES: IdealPlace[] = ['picnic', 'lpbar', 'exhibition', 'amusement']
export const PLACE_LABEL: Record<IdealPlace, { ko: string; en: string }> = {
  picnic: { ko: '한강 피크닉', en: 'Riverside picnic' },
  lpbar: { ko: 'LP 카페', en: 'Vinyl café' },
  exhibition: { ko: '전시회', en: 'Art gallery' },
  amusement: { ko: '놀이공원', en: 'Amusement park' },
}

export interface IdealType {
  code: IdealTypeCode
  emoji: string
  ko: string
  en: string
  /** 유형 고정 색(그림의 큰 종이 도형과 같은 색) */
  color: string
  taglineKo: string
  taglineEn: string
  faceKo: string[]
  faceEn: string[]
  fashionKo: string[]
  fashionEn: string[]
  /** 이 사람 만나는 날 내 메이크업 — 우리 9룩 id */
  look: MakeupStyleId
  lookWhyKo: string
  lookWhyEn: string
  bodyKo: string[]
  bodyEn: string[]
  card: IdentityCardData
}

const card = (nickname: string, nicknameEn: string, enName: string, line: string, lineEn: string, tags: string[], tagsEn: string[], color: string): IdentityCardData => ({
  nickname, nicknameEn, enName, identityLine: line, identityLineEn: lineEn, hashtags: tags, hashtagsEn: tagsEn, gradient: [CARD_NAVY, color],
})

export const IDEAL_TYPES: Record<IdealTypeCode, IdealType> = {
  'golden-retriever': {
    code: 'golden-retriever', emoji: '🐶', ko: '강아지상', en: 'Golden Retriever', color: '#e2a823',
    taglineKo: '웃음 하나에 하루가 환해지는 사람', taglineEn: 'One smile and your whole day lights up',
    faceKo: ['살짝 처진 눈꼬리', '크게 웃는 입', '부드러운 웨이브 머리'], faceEn: ['Gently down-turned eyes', 'A big open smile', 'Soft wavy hair'],
    fashionKo: ['크림 꽈배기 니트', '연청 데님', '흰 운동화'], fashionEn: ['Cream cable knit', 'Light-wash denim', 'White sneakers'],
    look: 'spring-blush', lookWhyKo: '밝은 사람 옆에선 코랄·피치 볼이 같이 환해 보여요.', lookWhyEn: 'Next to someone this bright, coral-peach cheeks glow along with them.',
    bodyKo: ['강아지상 이상형은 표정이 먼저 보이는 사람이에요. 처진 눈꼬리와 큰 웃음이 경계를 풀어 주고, 처음 만나도 오래 안 사람처럼 편합니다.', '이 유형을 고른 사람은 대개 "같이 있을 때 내가 편한가"를 가장 중요하게 봐요. 연락이 잦고, 먼저 사과하고, 작은 일에도 크게 기뻐해 주는 사람에게 끌립니다.', '패션은 꾸민 듯 안 꾸민 니트·데님 캐주얼. 데이트 메이크업은 피부를 맑게 두고 볼과 입술에 코랄·피치를 얹으면 둘이 한 장면처럼 어울려요.'],
    bodyEn: ['Your Golden Retriever ideal type is someone whose face says "happy to see you" before they say a word. Soft, down-turned eyes and a wide grin put everyone at ease.', 'People who land here usually care most about how comfortable they feel together: someone who texts often, apologizes first and celebrates small wins out loud.', 'Their style is easy knit-and-denim casual. For date makeup, keep the skin fresh and add coral-peach to cheeks and lips so you look like one warm scene together.'],
    card: card('웃음에 약한 사람', 'Weak for a Big Smile', 'GOLDEN RETRIEVER', '웃는 얼굴 하나에 마음이 다 풀려요', 'One warm smile and all my guard comes down', ['#강아지상', '#다정함', '#니트데님', '#코랄볼'], ['#GoldenRetriever', '#Warmth', '#KnitAndDenim', '#CoralCheeks'], '#e2a823'),
  },
  'black-cat': {
    code: 'black-cat', emoji: '🐈‍⬛', ko: '고양이상', en: 'Black Cat', color: '#4a2a4f',
    taglineKo: '말수는 적어도 눈빛이 다 말해 주는 사람', taglineEn: 'Few words, but the eyes say everything',
    faceKo: ['올라간 눈매', '무심한 듯 옅은 미소', '단정한 생머리'], faceEn: ['Upturned, cat-like eyes', 'A faint, unbothered smile', 'Sleek straight hair'],
    fashionKo: ['블랙 미니멀 니트', '와이드 슬랙스', '로퍼'], fashionEn: ['Black minimal knit', 'Wide trousers', 'Loafers'],
    look: 'maximalist-eye', lookWhyKo: '차분한 블랙 옆에선 또렷하게 그린 눈매가 분위기를 맞춰 줘요.', lookWhyEn: 'Beside all that calm black, a bold defined eye matches the mood.',
    bodyKo: ['고양이상 이상형은 처음엔 차갑게 보이지만 가까워질수록 다정해지는 사람이에요. 올라간 눈매와 옅은 미소가 묘한 긴장을 만듭니다.', '이 유형을 고른 사람은 "적당한 거리"를 중요하게 여겨요. 연락은 짧고 굵게, 다툼은 시간을 두고 차분히 푸는 관계에 끌립니다.', '패션은 블랙·차콜 미니멀. 데이트 날엔 피부는 매트하게, 눈매는 아이라인으로 또렷하게 잡으면 둘의 분위기가 맞춰져요.'],
    bodyEn: ['A Black Cat ideal type seems cool at first and gets softer the closer you get. Upturned eyes and a barely-there smile create a quiet pull.', 'People who land here value a little space: short, meaningful texts and arguments solved calmly after some time apart.', 'Their style is black and charcoal minimalism. For date makeup, go soft-matte on the skin and define the eyes with a bold liner.'],
    card: card('눈빛에 약한 사람', 'Weak for a Look', 'BLACK CAT', '말보다 눈빛이 먼저 닿는 사람이 좋아요', 'I fall for eyes that speak before words do', ['#고양이상', '#시크', '#올블랙', '#또렷한눈매'], ['#BlackCat', '#Chic', '#AllBlack', '#DefinedEye'], '#4a2a4f'),
  },
  fox: {
    code: 'fox', emoji: '🦊', ko: '여우상', en: 'Fox', color: '#c8582c',
    taglineKo: '한발 앞서 나를 알아채는 영리한 사람', taglineEn: 'Clever, and always one step ahead of you',
    faceKo: ['가늘고 긴 눈', '날렵한 턱선', '알 듯 말 듯한 미소'], faceEn: ['Long, narrow eyes', 'A sharp jawline', 'A knowing smile'],
    fashionKo: ['베이지 트렌치코트', '셔츠·슬랙스', '브라운 로퍼'], fashionEn: ['Beige trench coat', 'Shirt and slim trousers', 'Brown loafers'],
    look: 'autumn-berry', lookWhyKo: '세련된 베이지 옆에선 모카·베리 음영이 깊이를 더해요.', lookWhyEn: 'Next to polished beige, mocha-berry shading adds depth.',
    bodyKo: ['여우상 이상형은 센스가 먼저 보이는 사람이에요. 가는 눈매와 날렵한 턱선, 알 듯 말 듯한 미소가 대화를 계속 궁금하게 만듭니다.', '이 유형을 고른 사람은 깜짝 이벤트와 재치 있는 대화에 약해요. 계획은 완벽하게, 표현은 세련되게 하는 사람에게 끌립니다.', '패션은 트렌치·셔츠의 댄디 클래식. 데이트 메이크업은 누드 베이스에 모카·베리 음영으로 눈매에 깊이를 주면 잘 어울려요.'],
    bodyEn: ['A Fox ideal type leads with wit. Narrow eyes, a sharp jaw and a knowing smile keep every conversation interesting.', 'People who land here love clever surprises and smart banter — someone who plans perfectly and expresses things with style.', 'Their style is trench-and-shirt classic. For date makeup, keep the base nude and add mocha-berry shading for depth around the eyes.'],
    card: card('센스에 약한 사람', 'Weak for Wit', 'FOX', '나보다 먼저 나를 알아채는 사람이 좋아요', 'I fall for someone who reads me first', ['#여우상', '#센스', '#트렌치', '#음영메이크업'], ['#Fox', '#Wit', '#TrenchCoat', '#MochaShading'], '#c8582c'),
  },
  bunny: {
    code: 'bunny', emoji: '🐰', ko: '토끼상', en: 'Bunny', color: '#ec9ab3',
    taglineKo: '보고만 있어도 웃음이 나는 사랑스러운 사람', taglineEn: 'So sweet you smile just looking at them',
    faceKo: ['동그랗고 큰 눈', '앞니가 보이는 웃음', '보송한 앞머리'], faceEn: ['Big round eyes', 'A smile that shows the front teeth', 'Soft fluffy bangs'],
    fashionKo: ['파스텔 카디건', '칼라 셔츠', '플리츠·치노'], fashionEn: ['Pastel cardigan', 'Collared shirt', 'Pleats or chinos'],
    look: 'kpop-idol', lookWhyKo: '파스텔 옆에선 핑크 볼과 반짝이는 눈가가 사랑스러움을 더해요.', lookWhyEn: 'Beside pastels, pink cheeks and a little sparkle add to the sweetness.',
    bodyKo: ['토끼상 이상형은 사랑스러움이 무기인 사람이에요. 동그란 눈과 앞니가 보이는 웃음이 보는 사람까지 웃게 만듭니다.', '이 유형을 고른 사람은 애교와 표현이 많은 관계에 끌려요. 하루 종일 수다를 떨고, 손편지를 주고받고, 다툼도 애교로 푸는 사이를 좋아합니다.', '패션은 파스텔 프레피. 데이트 메이크업은 핑크 볼에 눈가 반짝임을 살짝 더하고 입술은 촉촉하게 두면 둘이 같은 동화 속에 있는 것 같아요.'],
    bodyEn: ['A Bunny ideal type wins you over with pure sweetness. Big round eyes and a toothy grin make everyone around them smile.', 'People who land here love an expressive, affectionate relationship: all-day chatter, handwritten notes and making up with a little charm.', 'Their style is pastel preppy. For date makeup, add pink cheeks, a touch of sparkle and soft glossy lips.'],
    card: card('귀여움에 약한 사람', 'Weak for Sweetness', 'BUNNY', '같이 있으면 자꾸 웃게 되는 사람이 좋아요', 'I fall for someone who keeps me smiling', ['#토끼상', '#사랑스러움', '#파스텔', '#핑크볼'], ['#Bunny', '#Sweet', '#Pastel', '#PinkBlush'], '#ec9ab3'),
  },
  'teddy-bear': {
    code: 'teddy-bear', emoji: '🧸', ko: '곰상', en: 'Teddy Bear', color: '#8a5a3c',
    taglineKo: '기대면 다 괜찮아지는 듬직한 사람', taglineEn: 'Lean on them and everything feels fine',
    faceKo: ['둥근 얼굴선', '순하게 처진 눈', '포근한 미소'], faceEn: ['A soft round face', 'Gentle, sleepy eyes', 'A cozy smile'],
    fashionKo: ['오버핏 코듀로이·플리스', '와이드 팬츠', '투박한 신발'], fashionEn: ['Oversized corduroy or fleece', 'Wide trousers', 'Chunky shoes'],
    look: 'natural-glow', lookWhyKo: '포근한 브라운 옆에선 결 살린 맑은 피부가 가장 자연스러워요.', lookWhyEn: 'Beside cozy browns, fresh glowing skin looks the most natural.',
    bodyKo: ['곰상 이상형은 듬직함과 포근함을 같이 가진 사람이에요. 둥근 얼굴선과 순한 눈이 "이 사람이면 괜찮다"는 안정감을 줍니다.', '이 유형을 고른 사람은 화려한 이벤트보다 꾸준함에 끌려요. 맛집을 같이 다니고, "잘 자"는 꼭 챙기고, 실용적인 선물을 고르는 사람을 좋아합니다.', '패션은 아메카지·오버핏. 데이트 메이크업은 피부결을 살린 내추럴 글로우에 웜 브라운 톤을 더하면 편안한 분위기가 완성돼요.'],
    bodyEn: ['A Teddy Bear ideal type is both steady and soft. A round face and gentle eyes say "you are safe with me."', 'People who land here prefer consistency over grand gestures: food dates, a goodnight text every night and practical, thoughtful gifts.', 'Their style is relaxed, oversized Americana. For date makeup, go with natural glowing skin and a warm brown tone.'],
    card: card('듬직함에 약한 사람', 'Weak for Steady Love', 'TEDDY BEAR', '기대면 다 괜찮아지는 사람이 좋아요', 'I fall for someone I can lean on', ['#곰상', '#포근함', '#오버핏', '#내추럴글로우'], ['#TeddyBear', '#Cozy', '#Oversized', '#NaturalGlow'], '#8a5a3c'),
  },
  deer: {
    code: 'deer', emoji: '🦌', ko: '사슴상', en: 'Deer', color: '#8fa889',
    taglineKo: '조용히 곁에 있어도 마음이 맑아지는 사람', taglineEn: 'Quietly there, and your mind feels clear',
    faceKo: ['맑고 큰 눈', '긴 목선', '고요한 표정'], faceEn: ['Big clear eyes', 'A long neckline', 'A serene expression'],
    fashionKo: ['화이트 리넨 셔츠', '세이지 톤 하의', '가죽 샌들·플랫'], fashionEn: ['White linen shirt', 'Sage-toned bottoms', 'Leather sandals or flats'],
    look: 'cloud-skin', lookWhyKo: '맑은 사람 옆에선 투명한 클라우드 스킨이 가장 잘 어울려요.', lookWhyEn: 'Next to someone this clear, sheer cloud skin fits best.',
    bodyKo: ['사슴상 이상형은 맑고 차분한 사람이에요. 큰 눈과 긴 목선, 고요한 표정이 함께 있는 시간을 느리고 편안하게 만듭니다.', '이 유형을 고른 사람은 서로의 시간을 존중하는 관계에 끌려요. 카페에서 각자 책을 읽다가 눈이 마주치는 순간을 좋아합니다.', '패션은 리넨·셔츠의 내추럴. 데이트 메이크업은 투명한 클라우드 스킨에 혈색만 살짝 더하면 둘 다 한 폭의 그림처럼 보여요.'],
    bodyEn: ['A Deer ideal type is calm and clear. Wide eyes, a long neckline and a serene face make time together feel slow and easy.', 'People who land here value respecting each other\'s space — reading side by side in a café and looking up at the same moment.', 'Their style is natural linen. For date makeup, go with sheer cloud skin and just a hint of flush.'],
    card: card('맑음에 약한 사람', 'Weak for Calm', 'DEER', '조용히 곁에 있어 주는 사람이 좋아요', 'I fall for a quiet, steady presence', ['#사슴상', '#맑음', '#리넨', '#클라우드스킨'], ['#Deer', '#Calm', '#Linen', '#CloudSkin'], '#8fa889'),
  },
  wolf: {
    code: 'wolf', emoji: '🐺', ko: '늑대상', en: 'Wolf', color: '#b3242c',
    taglineKo: '한 사람만 바라보는 강렬하고 단단한 사람', taglineEn: 'Intense, loyal and only has eyes for you',
    faceKo: ['짙은 눈썹', '각진 턱', '흔들림 없는 눈빛'], faceEn: ['Strong, thick brows', 'An angular jaw', 'A steady, intense gaze'],
    fashionKo: ['블랙 레더 재킷', '후디', '카고 팬츠·워커'], fashionEn: ['Black leather jacket', 'Hoodie', 'Cargo pants and boots'],
    look: 'blood-lip', lookWhyKo: '강렬한 사람 옆에선 레드 립 하나로 존재감을 맞춰요.', lookWhyEn: 'Beside someone this intense, one red lip holds its own.',
    bodyKo: ['늑대상 이상형은 강렬함과 의리를 같이 가진 사람이에요. 짙은 눈썹과 각진 턱, 흔들림 없는 눈빛이 "내 사람"이라는 확신을 줍니다.', '이 유형을 고른 사람은 직진하는 관계에 끌려요. 다투면 바로 풀고, 연락은 짧아도 진심인 사람을 좋아합니다.', '패션은 레더·스트릿. 데이트 메이크업은 베이스를 단정히 하고 레드 립 하나로 포인트를 주면 둘의 분위기가 팽팽하게 맞아요.'],
    bodyEn: ['A Wolf ideal type is intense and fiercely loyal. Strong brows, an angular jaw and a steady gaze make you feel chosen.', 'People who land here like a straight-forward relationship: fix arguments right away, keep texts short but sincere.', 'Their style is leather-and-street. For date makeup, keep the base clean and let one red lip do the talking.'],
    card: card('직진에 약한 사람', 'Weak for Devotion', 'WOLF', '나만 바라보는 단단한 사람이 좋아요', 'I fall for someone who only looks at me', ['#늑대상', '#직진', '#레더재킷', '#레드립'], ['#Wolf', '#Loyal', '#LeatherJacket', '#RedLip'], '#b3242c'),
  },
  dino: {
    code: 'dino', emoji: '🦖', ko: '공룡상', en: 'Dino', color: '#1f9a8c',
    taglineKo: '같이 있으면 매일이 모험이 되는 사람', taglineEn: 'Every day turns into an adventure together',
    faceKo: ['시원한 이목구비', '활짝 웃는 입', '짧고 경쾌한 머리'], faceEn: ['Bold, open features', 'A wide bright grin', 'Short, sporty hair'],
    fashionKo: ['바람막이', '트랙 팬츠·레깅스', '트레일 운동화·캡'], fashionEn: ['Windbreaker', 'Track pants or leggings', 'Trail sneakers and a cap'],
    look: 'summer-glow', lookWhyKo: '활동적인 사람 옆에선 땀에도 빛나는 글로시 피부가 잘 어울려요.', lookWhyEn: 'Next to someone this active, sweat-proof glossy skin shines.',
    bodyKo: ['공룡상 이상형은 에너지가 넘치는 사람이에요. 시원한 이목구비와 활짝 웃는 얼굴이 어디든 같이 가고 싶게 만듭니다.', '이 유형을 고른 사람은 계획 없이 떠나는 여행과 갑작스러운 전화에 설레요. 운동·캠핑처럼 몸으로 하는 데이트를 좋아합니다.', '패션은 스포티·고프코어. 데이트 메이크업은 가볍고 촉촉한 글로시 피부에 립밤 정도만 더하면 둘 다 생기 있어 보여요.'],
    bodyEn: ['A Dino ideal type is pure energy. Bold features and a huge grin make you want to follow them anywhere.', 'People who land here love unplanned trips and surprise calls — active dates like hiking, sports or camping.', 'Their style is sporty gorpcore. For date makeup, keep it light: dewy, glossy skin and a tinted balm.'],
    card: card('모험에 약한 사람', 'Weak for Adventure', 'DINO', '매일이 모험이 되는 사람이 좋아요', 'I fall for someone who makes life an adventure', ['#공룡상', '#에너지', '#고프코어', '#글로시'], ['#Dino', '#Energy', '#Gorpcore', '#GlossySkin'], '#1f9a8c'),
  },
}

export function getIdealTypeBySlug(slug: string): IdealType | null {
  return (IDEAL_ORDER as string[]).includes(slug) ? IDEAL_TYPES[slug as IdealTypeCode] : null
}

/** 그림 경로. 버전 쿼리는 그림 교체 시 새 값으로(브라우저 캐시 4시간). */
export const IDEAL_IMG_V = '20261125'
export function idealImage(code: IdealTypeCode, g: IdealGender, place: IdealPlace = 'picnic'): string {
  return `/ideal-type/${code}-${g}-${place}.webp?v=${IDEAL_IMG_V}`
}

/** 저장 카드용 클로즈업 — 같은 그림을 얼굴 기준으로 자른 것(11/25, OpenCV YuNet 얼굴 위치, 다시 그리지 않음) */
export function idealCardImage(code: IdealTypeCode, g: IdealGender, place: IdealPlace = 'picnic'): string {
  return `/ideal-type/card/${code}-${g}-${place}.webp?v=${IDEAL_IMG_V}`
}
