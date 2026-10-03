// 9룩 메이크업 방법 — 단일 소스 (룩 상세 /looks/{id}/ · 허브 /looks/ · 틱톡 방법 슬라이드가 공유)
// ────────────────────────────────────────────────────────────────────
// 2026-10-02 운영자 결정: 틱톡 캐러셀 "디테일 크롭" 대신 "메이크업 방법"을 보여주고,
// 같은 내용을 사이트에 섹션으로 올린다. **방법은 공개**(검색 유입 + 틱톡에서 온 사람이
// 입구에서 떠나지 않게), 가입 후엔 "내 것으로 만드는 것"(내 셀카에 입히기 · 내 퍼스널컬러
// 색 추천 · 저장)을 연다.
//
// 문구 규칙(법적 점검 2026-10-02 — 바꿀 때도 지킬 것):
//   · 효능 표현 금지(화장품법 제13조): "주름 개선·미백·진정·커버 치료" ✗ → "~해 보이게" 연출 표현만.
//   · 실존 인물(아이돌 등) 이름 금지(퍼블리시티권). "K-pop idol"은 일반명칭이라 OK.
//   · 다른 크리에이터의 문장 복붙 금지 — 방법(기법)은 공통 지식, 문장은 우리가 쓴다.
//     출처는 일반적인 기법 확인용(L'Oréal·NYX·makeup.com·INKEY 등 공개 튜토리얼).
//   · 사진은 AI 시각화 — 페이지에 "이 방법대로 칠한 실제 결과가 아님" 고지(LookHowTo 하단).
//   · 안전 안내: 염색 = 48시간 전 패치테스트, 눈가 펄·글리터 = 눈가용 표기 제품만.
import type { MakeupStyleId } from '../makeup/styles'
import type { SeasonCode } from '../personal-color/types'

/** 사진에서 확대해 보여줄 부위 — 9룩 사진이 전부 같은 모델·같은 구도라 좌표 하나로 된다 */
export type HowToArea = 'skin' | 'eyes' | 'cheeks' | 'lips' | 'hair'

/** 1024×1536 룩 사진 기준 크롭 (비율 0~1). 9룩 사진은 얼굴 위치가 같아 좌표 한 세트로 된다.
 *  기본 **2:1**(단계 카드 높이를 고르게), 피부만 **1:1** — 베이스는 얼굴 전체에 바르는 단계라
 *  얼굴이 다 보여야 한다. 2026-10-03 재실측: 예전 좌표는 피부=눈+코, 볼=눈·코·입 전체가 잡혀
 *  "번호대로 부위가 안 나온다"는 보고가 나왔다 → 부위끼리 겹치지 않게 다시 잡음.
 *    skin   = 눈썹~턱(얼굴 전체)  eyes = 눈썹+눈
 *    cheeks = 한쪽 볼(사진 왼쪽) + 콧방울 — 눈·입이 안 들어가야 볼로 읽힌다
 *    lips   = 입술만 */
const r = (x: number, y: number, w: number, ratio = 2) => ({ x, y, w, h: (w * 1024) / 1536 / ratio })
export const AREA_CROP: Record<HowToArea, { x: number; y: number; w: number; h: number }> = {
  skin: r(0.21, 0.375, 0.58, 1),
  eyes: r(0.23, 0.36, 0.52),
  cheeks: r(0.16, 0.47, 0.4),
  lips: r(0.32, 0.585, 0.34),
  hair: r(0, 0.02, 1),
}

/** 같은 부위가 여러 단계에 나올 때 단계 글이 가리키는 **바로 그 자리**를 보여주는 확대 컷.
 *  (예전엔 볼 3단계가 똑같은 사진 3장이었다.) 단계에 `crop` 을 주면 area 대신 이걸 쓴다. */
export type CropKey = HowToArea | 'eyeLid' | 'eyeOuter' | 'underEye' | 'cheekTemple' | 'lipLine'
export const STEP_CROP: Record<CropKey, { x: number; y: number; w: number; h: number }> = {
  ...AREA_CROP,
  eyeLid: r(0.2, 0.385, 0.34), // 한쪽 눈 — 눈두덩·속눈썹
  eyeOuter: r(0.5, 0.385, 0.36), // 사진 오른쪽 눈 꼬리 — 윙·바깥 V
  underEye: r(0.24, 0.43, 0.3), // 한쪽 눈 아래 — 애교살
  cheekTemple: r(0.1, 0.36, 0.42, 1), // 관자놀이~광대~볼 — C자 블러셔
  lipLine: r(0.35, 0.6, 0.28), // 입술 윤곽 확대 — 라이너·선 정리
}

/** 단계 카드 그림 = 페이스 차트(public/looks/charts/{id}.webp, 1024×1536)에서 같은 자리를 확대.
 *  2026-10-03 운영자: 위 차트(그림)와 아래 단계 사진이 따로 노는 느낌 → 단계도 그림체로 통일.
 *  사진은 상단 비포/애프터 슬라이더에만 남는다. 9룩 차트가 같은 빈 도안이라 좌표 한 세트. */
export const CHART_CROP: Record<CropKey, { x: number; y: number; w: number; h: number }> = {
  skin: r(0.13, 0.235, 0.74, 1),
  eyes: r(0.22, 0.3, 0.56),
  cheeks: r(0.14, 0.4, 0.42),
  lips: r(0.326, 0.527, 0.34),
  hair: r(0, 0.02, 1),
  eyeLid: r(0.193, 0.343, 0.34),
  eyeOuter: r(0.54, 0.34, 0.36),
  underEye: r(0.213, 0.375, 0.3),
  cheekTemple: r(0.098, 0.33, 0.42, 1),
  lipLine: r(0.356, 0.537, 0.28),
}

export interface HowToStep {
  area: HowToArea
  /** 단계 사진을 area 기본 크롭 대신 더 좁은 자리로(STEP_CROP) */
  crop?: CropKey
  titleKo: string
  titleEn: string
  bodyKo: string
  bodyEn: string
  /** 이 단계에 쓰는 제품 종류(브랜드 아님) */
  toolsKo: string
  toolsEn: string
  /** 색 칩 — 틱톡 슬라이드·페이지 공용 */
  swatches: string[]
  /** 이 단계 제품 찾기 — 쿠팡 검색어(src/lib/recommendations/types.ts searchKeywords 규칙:
   *  ≤5단어·제품 속성만·위치/행동 금지. `npm run check:keywords` 가 이 파일도 검사) */
  searchKeywords: string
  /** 해외(YesStyle·Amazon) 검색어 */
  shopEn: string
}

/** 가입 후 "내 퍼스널컬러 색"이 고르는 색 계열 */
export type ShadeFamily = 'nudeLip' | 'deepLip' | 'brightLip' | 'gradientLip' | 'blush' | 'colorEye' | 'metalEye' | 'smokyEye'

export interface LookHowTo {
  id: MakeupStyleId
  /** 한 줄 소개 — 이 룩이 어떤 인상인지 */
  introKo: string
  introEn: string
  minutes: number
  levelKo: '쉬움' | '보통' | '도전'
  levelEn: 'Easy' | 'Medium' | 'Bold'
  steps: HowToStep[]
  /** 이 룩의 핵심 색 — 퍼스널컬러 맞춤 추천이 이 계열에서 고른다 */
  keyShade: ShadeFamily
  /** 안전 안내(있을 때만) */
  safetyKo?: string
  safetyEn?: string
}

const HAIR_SAFETY_KO = '헤어 컬러는 사진 속 연출이에요. 염색할 땐 48시간 전에 패치테스트를 꼭 하세요.'
const HAIR_SAFETY_EN = 'The hair color is part of the styling in the photo. If you dye, do a patch test 48 hours before.'

export const LOOK_HOWTO: Record<MakeupStyleId, LookHowTo> = {
  'natural-glow': {
    id: 'natural-glow',
    introKo: '화장한 티는 덜 나고, 잘 쉬고 온 얼굴처럼 보이는 룩.',
    introEn: 'Looks less like makeup and more like you slept well.',
    minutes: 10, levelKo: '쉬움', levelEn: 'Easy',
    keyShade: 'nudeLip',
    steps: [
      { area: 'skin', titleKo: '얇은 베이스 + 광대 위 윤기', titleEn: 'Sheer base, glow on top',
        bodyKo: '보습제가 흡수된 뒤 스킨 틴트를 손가락으로 얇게 펴요. 필요한 곳만 컨실러를 톡톡. 광대 윗부분에만 크림 하이라이터를 살짝 얹어요.',
        bodyEn: 'Once moisturizer sinks in, spread a skin tint thinly with fingers. Dab concealer only where needed, then tap cream highlighter on the tops of the cheekbones.',
        toolsKo: '스킨 틴트 · 컨실러 · 크림 하이라이터', toolsEn: 'Skin tint · concealer · cream highlighter',
        swatches: ['#f1d6c2', '#f7e7da'],
        searchKeywords: '스킨 틴트 촉촉', shopEn: 'dewy skin tint' },
      { area: 'cheeks', titleKo: '피치 블러셔는 웃을 때 올라오는 곳에', titleEn: 'Peach blush where you smile',
        bodyKo: '웃었을 때 볼이 동그랗게 올라오는 부분에 크림 블러셔를 찍고, 바깥쪽으로 손가락으로 풀어요. 경계가 안 보이면 성공.',
        bodyEn: 'Smile, dot cream blush on the rounded part of the cheek, and blend outward with fingers until there is no edge.',
        toolsKo: '크림 블러셔(피치)', toolsEn: 'Cream blush (peach)',
        swatches: ['#f4a98a', '#f8c4a8'],
        searchKeywords: '피치 크림 블러셔', shopEn: 'peach cream blush' },
      { area: 'eyes', titleKo: '눈은 결만 정리', titleEn: 'Just tidy the eyes',
        bodyKo: '눈두덩에 베이지·라이트 브라운 섀도를 손가락으로 한 번. 마스카라는 뿌리에서 지그재그로 한 번만, 눈썹은 결 따라 빗어 고정해요.',
        bodyEn: 'One sweep of beige or light-brown shadow with a finger. One zig-zag coat of mascara from the roots; brush brows up and set.',
        toolsKo: '베이지 섀도 · 마스카라 · 아이브로우 젤', toolsEn: 'Beige shadow · mascara · brow gel',
        swatches: ['#d8b79c', '#a4795a'],
        searchKeywords: '베이지 아이섀도 싱글', shopEn: 'beige eyeshadow' },
      { area: 'lips', titleKo: '내 입술색보다 한 톤 진한 누드', titleEn: 'A nude one shade deeper',
        bodyKo: '립밤을 바르고 1~2분 뒤, 내 입술보다 살짝 진한 누드 립을 톡톡 두드려 발라요. 선을 따지 않아야 자연스러워요.',
        bodyEn: 'Balm first, wait a minute, then tap on a nude a touch deeper than your lips. Skip the liner to keep it soft.',
        toolsKo: '립밤 · 누드 립(틴트/밤)', toolsEn: 'Lip balm · nude lip (tint or balm)',
        swatches: ['#c98a7a', '#b77468'],
        searchKeywords: '누드 립밤 틴트', shopEn: 'nude tinted lip balm' },
    ],
  },
  'cloud-skin': {
    id: 'cloud-skin',
    introKo: '번들거림 없이 보송하고 흐릿하게 — 소프트 필터를 씌운 듯한 피부.',
    introEn: 'Soft, blurred and velvety — like a soft-focus filter on skin.',
    minutes: 15, levelKo: '보통', levelEn: 'Medium',
    keyShade: 'nudeLip',
    steps: [
      { area: 'skin', crop: 'cheeks', titleKo: '보습이 먼저 — 매트는 건조함이 아니다', titleEn: 'Hydrate first — matte is not dry',
        bodyKo: '가벼운 보습제를 바르고 완전히 흡수시켜요. 모공·결이 신경 쓰이는 코와 볼에만 블러 프라이머를 눌러 발라요.',
        bodyEn: 'Apply a light moisturizer and let it sink in fully. Press a blurring primer only on the nose and cheeks where texture shows.',
        toolsKo: '수분 크림 · 블러 프라이머', toolsEn: 'Light moisturizer · blurring primer',
        swatches: ['#f3e3d8', '#ece0d6'],
        searchKeywords: '블러 프라이머', shopEn: 'blurring primer' },
      { area: 'skin', titleKo: '세미매트 베이스는 젖은 스펀지로', titleEn: 'Semi-matte base with a damp sponge',
        bodyKo: '세미매트 파운데이션을 필요한 곳에만 얇게. 젖은 스펀지로 두드려 피부에 밀착시키면 두꺼워 보이지 않아요.',
        bodyEn: 'Use a semi-matte foundation only where needed, then press it in with a damp sponge so it never looks heavy.',
        toolsKo: '세미매트 파운데이션 · 메이크업 스펀지', toolsEn: 'Semi-matte foundation · makeup sponge',
        swatches: ['#ead2c0', '#e2c4ae'],
        searchKeywords: '세미매트 파운데이션', shopEn: 'semi matte foundation' },
      { area: 'cheeks', titleKo: '고운 파우더로 흐릿하게', titleEn: 'Blur with a fine powder',
        bodyKo: '입자가 고운 파우더를 큰 브러시로 T존 위주로 가볍게. 그 위에 파우더 블러셔를 아주 옅게 쓸어 혈색만 남겨요.',
        bodyEn: 'Dust a finely milled powder with a big brush, mostly on the T-zone. Sweep a whisper of powder blush for color.',
        toolsKo: '피니싱 파우더 · 파우더 블러셔', toolsEn: 'Finishing powder · powder blush',
        swatches: ['#f2c7c0', '#e9b2ab'],
        searchKeywords: '피니싱 파우더', shopEn: 'finishing powder' },
      { area: 'lips', titleKo: '벨벳 립으로 마무리', titleEn: 'Finish with a velvet lip',
        bodyKo: '말린 장미·로즈 누드 계열 벨벳 립을 입술 가운데부터 펴 바르고 손가락으로 경계를 흐려요.',
        bodyEn: 'Press a rosy-nude velvet lip from the center out and soften the edges with a fingertip.',
        toolsKo: '벨벳/매트 립', toolsEn: 'Velvet or matte lip',
        swatches: ['#c08a86', '#a87070'],
        searchKeywords: '로즈 누드 벨벳 립', shopEn: 'velvet rose nude lipstick' },
    ],
  },
  'blood-lip': {
    id: 'blood-lip',
    introKo: '와인을 머금은 듯한 진한 입술 하나로 끝내는 룩. 나머지는 비워 둬요.',
    introEn: 'One wine-stained lip does all the talking — keep everything else bare.',
    minutes: 10, levelKo: '보통', levelEn: 'Medium',
    keyShade: 'deepLip',
    safetyKo: HAIR_SAFETY_KO, safetyEn: HAIR_SAFETY_EN,
    steps: [
      { area: 'skin', titleKo: '피부는 깨끗하게, 거의 아무것도 안 한 듯', titleEn: 'Clean, barely-there skin',
        bodyKo: '쿠션이나 스킨 틴트를 얇게. 입술이 주인공이라 볼 혈색과 하이라이터는 생략하거나 최소로.',
        bodyEn: 'A thin cushion or skin tint. The lip is the star, so skip blush and highlighter or keep them minimal.',
        toolsKo: '쿠션 · 컨실러', toolsEn: 'Cushion · concealer',
        swatches: ['#f0d9c8', '#e8cbb6'],
        searchKeywords: '쿠션 파운데이션', shopEn: 'cushion foundation' },
      { area: 'eyes', titleKo: '눈은 정돈만', titleEn: 'Eyes: just groomed',
        bodyKo: '브라운 섀도로 쌍꺼풀 라인만 살짝 음영. 아이라인은 생략하고 마스카라 한 번, 눈썹은 결 정리.',
        bodyEn: 'A hint of brown in the crease, no liner, one coat of mascara and groomed brows.',
        toolsKo: '브라운 섀도 · 마스카라', toolsEn: 'Brown shadow · mascara',
        swatches: ['#a98068', '#6e4a3a'],
        searchKeywords: '브라운 아이섀도 싱글', shopEn: 'brown eyeshadow' },
      { area: 'lips', titleKo: '버건디를 가운데부터 바르고 휴지로 찍어내기', titleEn: 'Burgundy from the center, then blot',
        bodyKo: '립밤을 미리 발라 흡수시킨 뒤, 버건디 립을 윗입술 가운데에서 바깥으로 채워요. 휴지를 가볍게 물어 한 번 찍어내면 와인에 물든 듯한 질감이 돼요.',
        bodyEn: 'Prep with balm, then fill a burgundy lip from the center of the top lip outward. Press a tissue between your lips once for that wine-stained finish.',
        toolsKo: '립밤 · 버건디 립스틱/틴트 · 티슈', toolsEn: 'Balm · burgundy lipstick or tint · tissue',
        swatches: ['#6d0f1c', '#8b1a2b'],
        searchKeywords: '버건디 립스틱', shopEn: 'burgundy lipstick' },
      { area: 'lips', titleKo: '진하게 원하면 한 겹 더', titleEn: 'Layer again for depth',
        bodyKo: '찍어낸 위에 한 겹 더 바르면 더 깊은 색. 입술 경계 밖으로 번진 곳은 컨실러를 묻힌 작은 브러시로 정리해요.',
        bodyEn: 'Add a second layer over the blotted one for depth. Clean any spill outside the lip line with a small brush and concealer.',
        toolsKo: '립 브러시 · 컨실러', toolsEn: 'Lip brush · concealer',
        swatches: ['#4a0a14', '#6d0f1c'],
        searchKeywords: '립 브러시', shopEn: 'lip brush' },
    ],
  },
  'maximalist-eye': {
    id: 'maximalist-eye',
    introKo: '눈에 색을 얹는 룩. 보라·파랑·초록을 겁내지 않는 날에.',
    introEn: 'Color on the eyes — for days you are not afraid of violet, blue and green.',
    minutes: 20, levelKo: '도전', levelEn: 'Bold',
    keyShade: 'colorEye',
    steps: [
      { area: 'eyes', crop: 'eyeLid', titleKo: '프라이머가 색을 살린다', titleEn: 'Primer makes color pop',
        bodyKo: '눈두덩 전체에 아이 프라이머(또는 컨실러)를 얇게 펴고 마를 때까지 기다려요. 컬러가 선명해지고 오래 가요.',
        bodyEn: 'Spread eye primer (or concealer) thinly over the lid and let it dry. Colors show brighter and last longer.',
        toolsKo: '아이 프라이머', toolsEn: 'Eye primer',
        swatches: ['#efe2d6'],
        searchKeywords: '아이 프라이머', shopEn: 'eyeshadow primer' },
      { area: 'eyes', titleKo: '안쪽은 밝게, 바깥은 진하게', titleEn: 'Light inside, deep outside',
        bodyKo: '눈 앞머리엔 밝은 청록, 가운데는 블루, 바깥쪽은 바이올렛을 얹고 색 사이 경계를 둥글게 블렌딩해요.',
        bodyEn: 'Teal at the inner corner, blue in the center, violet on the outer third — then blend the borders between them.',
        toolsKo: '컬러 섀도 3색 · 블렌딩 브러시', toolsEn: 'Three color shadows · blending brush',
        swatches: ['#2fb3a5', '#3a5fd0', '#7b3fc4'],
        searchKeywords: '컬러 아이섀도 팔레트', shopEn: 'colorful eyeshadow palette' },
      { area: 'eyes', crop: 'eyeOuter', titleKo: '굵은 윙 라인', titleEn: 'A bold winged liner',
        bodyKo: '섀도를 먼저 하고 라인은 나중에(가루 낙하를 닦기 쉬워요). 속눈썹 라인을 따라 그리다 눈꼬리에서 위로 빼 날개를 만들어요.',
        bodyEn: 'Shadow first, liner after (fallout is easier to wipe). Trace the lash line and flick up at the outer corner into a wing.',
        toolsKo: '블랙 펜 라이너', toolsEn: 'Black pen liner',
        swatches: ['#111111'],
        searchKeywords: '블랙 펜 아이라이너', shopEn: 'black liquid eyeliner pen' },
      { area: 'lips', titleKo: '입술은 한 발 물러서기', titleEn: 'Let the lips step back',
        bodyKo: '눈이 주인공이라 입술은 누드 베이지로 낮춰요. 둘 다 강하면 시선이 흩어져요.',
        bodyEn: 'The eyes lead, so keep lips a nude beige. Two loud features fight for attention.',
        toolsKo: '누드 립', toolsEn: 'Nude lip',
        swatches: ['#c4978a'],
        searchKeywords: '누드 베이지 립', shopEn: 'nude beige lipstick' },
    ],
  },
  'metallic-eye': {
    id: 'metallic-eye',
    introKo: '빛이 닿을 때마다 눈두덩이 반짝이는 룩. 골드든 실버든.',
    introEn: 'Lids that catch the light every time you turn — gold or silver.',
    minutes: 15, levelKo: '보통', levelEn: 'Medium',
    keyShade: 'metalEye',
    safetyKo: '눈가에는 "눈가용"으로 표기된 펄·글리터 제품만 쓰세요. 공예용 글리터는 절대 금지. ' + HAIR_SAFETY_KO,
    safetyEn: 'Use only shimmer or glitter labelled safe for the eye area — never craft glitter. ' + HAIR_SAFETY_EN,
    steps: [
      { area: 'eyes', titleKo: '바탕은 매트로 깊이', titleEn: 'Matte depth underneath',
        bodyKo: '쌍꺼풀 라인과 눈꼬리에 매트 브라운을 깔아 깊이를 만들어요. 메탈이 더 빛나 보여요.',
        bodyEn: 'Lay a matte brown in the crease and outer corner for depth — it makes the metal look brighter.',
        toolsKo: '매트 브라운 섀도', toolsEn: 'Matte brown shadow',
        swatches: ['#8a6448'],
        searchKeywords: '매트 브라운 아이섀도', shopEn: 'matte brown eyeshadow' },
      { area: 'eyes', crop: 'eyeLid', titleKo: '촉촉한 브러시로 "포일링"', titleEn: 'Foil it with a damp brush',
        bodyKo: '브러시에 픽서를 살짝 뿌려 촉촉하게(흥건하면 안 돼요). 메탈릭 섀도를 눈두덩 가운데에 눌러 찍고 바깥으로 넓혀요.',
        bodyEn: 'Mist your brush with setting spray — damp, not dripping. Press metallic shadow onto the center of the lid and build outward.',
        toolsKo: '메탈릭 섀도 · 픽서 · 납작 브러시', toolsEn: 'Metallic shadow · setting spray · flat brush',
        swatches: ['#d4a94a', '#c9c9cf'],
        searchKeywords: '메탈릭 골드 아이섀도', shopEn: 'metallic gold eyeshadow' },
      { area: 'eyes', crop: 'underEye', titleKo: '애교살 앞쪽에 한 점', titleEn: 'A dot under the inner eye',
        bodyKo: '남은 메탈을 눈 앞머리와 애교살 안쪽 1/3에 콕. 마스카라는 위아래 모두.',
        bodyEn: 'Tap leftover metal on the inner corner and the inner third of the lower lid. Mascara top and bottom.',
        toolsKo: '작은 섀도 브러시 · 마스카라', toolsEn: 'Small shadow brush · mascara',
        swatches: ['#e6c76e'],
        searchKeywords: '골드 쉬머 아이섀도', shopEn: 'gold shimmer eyeshadow' },
      { area: 'lips', titleKo: '입술은 글로시 누드', titleEn: 'Glossy nude lips',
        bodyKo: '눈과 같은 광택감을 맞추려면 투명·누드 글로스. 색은 가볍게.',
        bodyEn: 'Match the shine with a clear or nude gloss; keep the color light.',
        toolsKo: '립 글로스', toolsEn: 'Lip gloss',
        swatches: ['#d2a093'],
        searchKeywords: '누드 립글로스', shopEn: 'nude lip gloss' },
    ],
  },
  'bold-lip': {
    id: 'bold-lip',
    introKo: '선명한 레드·코랄 입술 하나로 얼굴이 밝아지는 룩.',
    introEn: 'A clean, vivid red-coral lip that lights up the whole face.',
    minutes: 10, levelKo: '보통', levelEn: 'Medium',
    keyShade: 'brightLip',
    safetyKo: HAIR_SAFETY_KO, safetyEn: HAIR_SAFETY_EN,
    steps: [
      { area: 'lips', titleKo: '입술 준비', titleEn: 'Prep the lips',
        bodyKo: '각질을 부드럽게 정리하고 립밤을 바른 뒤 휴지로 한 번 눌러 기름기를 덜어요. 색이 고르게 붙어요.',
        bodyEn: 'Gently smooth flakes, apply balm, then blot once so color grips evenly.',
        toolsKo: '립 스크럽 · 립밤', toolsEn: 'Lip scrub · balm',
        swatches: ['#e8b4a4'],
        searchKeywords: '립 스크럽', shopEn: 'lip scrub' },
      { area: 'lips', crop: 'lipLine', titleKo: '립 라이너로 윤곽', titleEn: 'Outline with liner',
        bodyKo: '라이너를 뾰족하게 깎아 윗입술 산에 X를 그려 대칭을 잡고, 가운데에서 입꼬리 방향으로 윤곽을 그려요.',
        bodyEn: 'Sharpen the liner, mark an X at the cupid’s bow for symmetry, and draw from the center toward each corner.',
        toolsKo: '레드 립 라이너', toolsEn: 'Red lip liner',
        swatches: ['#c8252c'],
        searchKeywords: '레드 립 라이너', shopEn: 'red lip liner' },
      { area: 'lips', titleKo: '채우고, 찍고, 한 번 더', titleEn: 'Fill, blot, repeat',
        bodyKo: '립 브러시로 안을 채우고 휴지로 한 번 찍은 뒤 얇게 한 겹 더. 오래 가고 번짐이 줄어요.',
        bodyEn: 'Fill with a lip brush, blot once, then add one thin layer. It lasts longer and bleeds less.',
        toolsKo: '레드·코랄 립스틱 · 립 브러시', toolsEn: 'Red or coral lipstick · lip brush',
        swatches: ['#e0362f', '#f0563f'],
        searchKeywords: '레드 코랄 립스틱', shopEn: 'red coral lipstick' },
      { area: 'lips', crop: 'lipLine', titleKo: '컨실러로 선 정리', titleEn: 'Sharpen the edge with concealer',
        bodyKo: '작은 브러시에 컨실러를 아주 조금 묻혀 입술 바깥 선을 따라 그리면 경계가 또렷해져요.',
        bodyEn: 'Trace just outside the lip line with a tiny bit of concealer on a small brush for a crisp edge.',
        toolsKo: '컨실러 · 작은 브러시', toolsEn: 'Concealer · small brush',
        swatches: ['#efd6c4'],
        searchKeywords: '컨실러 브러시', shopEn: 'concealer brush' },
    ],
  },
  'blush-draping': {
    id: 'blush-draping',
    introKo: '블러셔로 윤곽을 잡는 룩. 볼에서 관자놀이까지 색을 이어요.',
    introEn: 'Sculpt with blush instead of contour — color swept from cheek to temple.',
    minutes: 10, levelKo: '쉬움', levelEn: 'Easy',
    keyShade: 'blush',
    safetyKo: HAIR_SAFETY_KO, safetyEn: HAIR_SAFETY_EN,
    steps: [
      { area: 'cheeks', titleKo: '시작점은 광대 가장 높은 곳', titleEn: 'Start high on the cheekbone',
        bodyKo: '눈꼬리 바로 아래, 광대가 가장 높은 지점에 블러셔를 처음 얹어요. 색은 여기에 가장 많이 둬요.',
        bodyEn: 'Place the first touch of blush at the highest point of the cheekbone, just under the outer corner of the eye. Keep most color here.',
        toolsKo: '크림 또는 파우더 블러셔', toolsEn: 'Cream or powder blush',
        swatches: ['#e8778f', '#f08c7a'],
        searchKeywords: '핑크 크림 블러셔', shopEn: 'pink cream blush' },
      { area: 'cheeks', crop: 'cheekTemple', titleKo: '관자놀이 쪽으로 C자', titleEn: 'Sweep up in a C',
        bodyKo: '광대에서 관자놀이·헤어라인 방향으로 C자를 그리듯 쓸어 올려요. 브러시에 남은 양으로 끝을 흐려요.',
        bodyEn: 'Sweep up and out toward the temple and hairline in a soft C. Use what is left on the brush to fade the end.',
        toolsKo: '블러셔 브러시', toolsEn: 'Blush brush',
        swatches: ['#f3a3b2'],
        searchKeywords: '블러셔 브러시', shopEn: 'blush brush' },
      { area: 'cheeks', titleKo: '크림 위에 파우더 — 레이어링', titleEn: 'Layer cream, then powder',
        bodyKo: '크림 블러셔를 먼저 얇게 두드리고, 같은 계열 파우더 블러셔로 살짝 고정하면 색이 깊어지고 오래 가요. 두 겹 다 얇게.',
        bodyEn: 'Tap a thin cream blush first, then set with a similar powder. Color deepens and lasts — keep both layers thin.',
        toolsKo: '크림 블러셔 + 파우더 블러셔', toolsEn: 'Cream blush + powder blush',
        swatches: ['#d9607a', '#f0a0a8'],
        searchKeywords: '코랄 파우더 블러셔', shopEn: 'coral powder blush' },
      { area: 'lips', titleKo: '입술은 블러셔와 같은 집안', titleEn: 'Lips from the same family',
        bodyKo: '블러셔와 같은 계열의 MLBB 립으로 맞추면 얼굴 전체가 한 톤으로 묶여요.',
        bodyEn: 'Pick a my-lips-but-better shade from the same family as the blush so the face reads as one tone.',
        toolsKo: '로즈·코랄 MLBB 립', toolsEn: 'Rose or coral MLBB lip',
        swatches: ['#cf7f86'],
        searchKeywords: 'MLBB 로즈 립', shopEn: 'MLBB rose lipstick' },
    ],
  },
  grunge: {
    id: 'grunge',
    introKo: '번진 듯한 스모키 눈매와 다크 베리 입술. 일부러 덜 다듬은 멋.',
    introEn: 'Smudged smoky eyes and a dark berry lip — deliberately undone.',
    minutes: 15, levelKo: '보통', levelEn: 'Medium',
    keyShade: 'smokyEye',
    safetyKo: HAIR_SAFETY_KO, safetyEn: HAIR_SAFETY_EN,
    steps: [
      { area: 'skin', titleKo: '피부는 매트하게, 결은 살리기', titleEn: 'Matte skin, texture left in',
        bodyKo: '스킨 틴트나 가벼운 파운데이션을 얇게. 번들거리는 곳만 파우더로 눌러요. 완벽하게 덮을 필요 없어요.',
        bodyEn: 'A thin skin tint or light foundation; powder only where it gets shiny. No need for perfect coverage.',
        toolsKo: '스킨 틴트 · 파우더', toolsEn: 'Skin tint · powder',
        swatches: ['#ead3c2'],
        searchKeywords: '매트 스킨 틴트', shopEn: 'matte skin tint' },
      { area: 'eyes', titleKo: '블랙 펜슬을 진하게, 바로 번지기', titleEn: 'Heavy black pencil, smudged fast',
        bodyKo: '부드러운 블랙 펜슬로 위아래 속눈썹 라인을 진하게 그리고, 마르기 전에 작은 브러시나 면봉으로 문질러 번지게 해요.',
        bodyEn: 'Line the upper and lower lash lines heavily with a soft black pencil, then smudge right away with a small brush or cotton swab.',
        toolsKo: '소프트 블랙 펜슬 · 스머지 브러시', toolsEn: 'Soft black pencil · smudge brush',
        swatches: ['#1a1a1a', '#3a3438'],
        searchKeywords: '블랙 펜슬 아이라이너', shopEn: 'black kohl eyeliner pencil' },
      { area: 'eyes', crop: 'eyeLid', titleKo: '차콜 섀도로 고정', titleEn: 'Set with charcoal shadow',
        bodyKo: '번진 라인 위에 차콜·다크 브라운 섀도를 얹어 고정하고 깊이를 더해요. 마스카라는 위아래 여러 번.',
        bodyEn: 'Press charcoal or dark-brown shadow over the smudge to set and deepen it. Several coats of mascara, top and bottom.',
        toolsKo: '차콜 섀도 · 마스카라', toolsEn: 'Charcoal shadow · mascara',
        swatches: ['#4a4448', '#5a4038'],
        searchKeywords: '차콜 아이섀도', shopEn: 'charcoal eyeshadow' },
      { area: 'lips', titleKo: '다크 베리를 찍어 바르기', titleEn: 'Dark berry, blotted',
        bodyKo: '플럼·베리 계열 매트 립을 바르고 휴지로 찍어 살짝 빛바랜 느낌으로.',
        bodyEn: 'A matte plum or berry, blotted down so it looks a little lived-in.',
        toolsKo: '베리·플럼 매트 립', toolsEn: 'Berry or plum matte lip',
        swatches: ['#5e1f35', '#7a2a44'],
        searchKeywords: '베리 플럼 매트 립', shopEn: 'berry plum matte lipstick' },
    ],
  },
  'kpop-idol': {
    id: 'kpop-idol',
    introKo: '유리알처럼 맑은 피부, 반짝이는 애교살, 안쪽부터 물든 그라데이션 립.',
    introEn: 'Glass-clear skin, a sparkly under-eye and a lip that fades from the center out.',
    minutes: 20, levelKo: '보통', levelEn: 'Medium',
    keyShade: 'gradientLip',
    safetyKo: '애교살 펄은 "눈가용" 표기 제품만 쓰세요. ' + HAIR_SAFETY_KO,
    safetyEn: 'Use shimmer labelled safe for the eye area. ' + HAIR_SAFETY_EN,
    steps: [
      { area: 'skin', titleKo: '유리알 피부 = 수분 + 쿠션', titleEn: 'Glass skin = hydration + cushion',
        bodyKo: '수분을 충분히 채운 뒤 쿠션을 젖은 스펀지로 두드려요. 가려야 할 곳만 겹쳐 바르면 두껍지 않아요.',
        bodyEn: 'Hydrate well, then pat a cushion compact on with a damp sponge. Build coverage only where you need it.',
        toolsKo: '수분 크림 · 쿠션 · 젖은 스펀지', toolsEn: 'Hydrating cream · cushion · damp sponge',
        swatches: ['#f4e1d4', '#fbefe7'],
        searchKeywords: '수분 쿠션 파운데이션', shopEn: 'dewy cushion foundation' },
      { area: 'eyes', crop: 'underEye', titleKo: '애교살 찾기 → 펄', titleEn: 'Find the aegyo-sal, add shimmer',
        bodyKo: '살짝 웃으면 눈 밑에 도톰하게 올라오는 부분이 애교살이에요. 다크서클 자리가 아니라 그 위에 밝은 쉬머를 얹고, 아래 경계에 연한 브라운으로 그림자를 살짝.',
        bodyEn: 'Smile slightly — the little puff under the eye is the aegyo-sal. Put a light shimmer on it (not on the dark circle) and a soft brown shadow line just beneath.',
        toolsKo: '쉬머 섀도 · 연브라운 섀도', toolsEn: 'Shimmer shadow · soft brown shadow',
        swatches: ['#f6e4d8', '#c9a088'],
        searchKeywords: '애교살 쉬머 섀도', shopEn: 'shimmer eyeshadow' },
      { area: 'cheeks', titleKo: '쉬머 하이라이트', titleEn: 'Shimmer highlight',
        bodyKo: '광대 위, 콧등, 턱 끝에 하이라이터를 콕콕. 피부가 빛을 받아 반짝이는 정도면 충분해요.',
        bodyEn: 'Tap highlighter on the cheekbones, bridge of the nose and chin tip — just enough to catch the light.',
        toolsKo: '하이라이터', toolsEn: 'Highlighter',
        swatches: ['#fbe9df', '#f7d7e0'],
        searchKeywords: '쉬머 하이라이터', shopEn: 'shimmer highlighter' },
      { area: 'lips', titleKo: '그라데이션 립', titleEn: 'Gradient lip',
        bodyKo: '컨실러로 입술 윤곽을 살짝 지우고, 핑크 틴트를 입술 안쪽에만 발라 손가락으로 바깥으로 풀어요. 가운데에 글로스를 한 점.',
        bodyEn: 'Soften the lip line with concealer, apply pink tint only on the inner lips and blend outward with a finger. A dot of gloss in the center.',
        toolsKo: '컨실러 · 핑크 틴트 · 글로스', toolsEn: 'Concealer · pink tint · gloss',
        swatches: ['#e5577a', '#f4a6b8'],
        searchKeywords: '핑크 립 틴트', shopEn: 'pink lip tint' },
    ],
  },
}

/**
 * 가입 후 열리는 "내 퍼스널컬러 맞춤 색" — 계절 × 색 계열.
 * 진단 결과(4계절)는 무료지만, 룩별로 내 계절에 맞춘 색 추천은 로그인 뒤에 보여준다.
 * 색 이름은 일반 명칭(브랜드·제품명 아님).
 */
export const SEASON_SHADES: Record<SeasonCode, Record<ShadeFamily, { ko: string; en: string; hex: string[] }>> = {
  spring: {
    nudeLip: { ko: '코랄 베이지 · 피치 누드', en: 'Coral beige · peach nude', hex: ['#e09a80', '#eaa98e'] },
    deepLip: { ko: '체리 레드 · 웜 와인(글로시)', en: 'Cherry red · warm wine (glossy)', hex: ['#b3212d', '#8e2130'] },
    brightLip: { ko: '오렌지 레드 · 비비드 코랄', en: 'Orange red · vivid coral', hex: ['#e8462e', '#f26a4b'] },
    gradientLip: { ko: '코랄 핑크 · 살구', en: 'Coral pink · apricot', hex: ['#f07a6e', '#f7a98a'] },
    blush: { ko: '피치 · 코랄', en: 'Peach · coral', hex: ['#f4a084', '#f28b78'] },
    colorEye: { ko: '터콰이즈 · 웜 그린 · 골드 포인트', en: 'Turquoise · warm green · gold accent', hex: ['#2bb3a0', '#7aa83c', '#d6a640'] },
    metalEye: { ko: '샴페인 골드', en: 'Champagne gold', hex: ['#e2c27a'] },
    smokyEye: { ko: '초콜릿 브라운 스모키', en: 'Chocolate-brown smoky', hex: ['#5a3a28'] },
  },
  summer: {
    nudeLip: { ko: '로즈 베이지 · 말린 장미', en: 'Rose beige · dried rose', hex: ['#c48a8c', '#b77a80'] },
    deepLip: { ko: '라즈베리 · 쿨 버건디', en: 'Raspberry · cool burgundy', hex: ['#9b2348', '#7a1e3c'] },
    brightLip: { ko: '로즈 레드 · 푸시아 핑크', en: 'Rose red · fuchsia pink', hex: ['#c8304f', '#d8457a'] },
    gradientLip: { ko: '쿨 핑크 · 라벤더 핑크', en: 'Cool pink · lavender pink', hex: ['#e06c94', '#e9a0c0'] },
    blush: { ko: '라벤더 핑크 · 로즈', en: 'Lavender pink · rose', hex: ['#e79ab6', '#d98095'] },
    colorEye: { ko: '라벤더 · 스카이 블루 · 민트', en: 'Lavender · sky blue · mint', hex: ['#a68ad8', '#6fa8e0', '#8fd6c4'] },
    metalEye: { ko: '실버 · 핑크 실버', en: 'Silver · pink silver', hex: ['#cfd0d6', '#e4c6d0'] },
    smokyEye: { ko: '그레이 모브 스모키', en: 'Grey-mauve smoky', hex: ['#6e5e6a'] },
  },
  autumn: {
    nudeLip: { ko: '말린 장미 · 브릭 누드', en: 'Muted rose · brick nude', hex: ['#a8665a', '#b9735e'] },
    deepLip: { ko: '브릭 레드 · 브라운 와인', en: 'Brick red · brown wine', hex: ['#8e2a22', '#6a2a24'] },
    brightLip: { ko: '테라코타 레드 · 칠리', en: 'Terracotta red · chili', hex: ['#b8402c', '#c0392b'] },
    gradientLip: { ko: '말린 코랄 · 베이지 로즈', en: 'Muted coral · beige rose', hex: ['#c8735e', '#d49a86'] },
    blush: { ko: '테라코타 · 웜 브라운 코랄', en: 'Terracotta · warm brown coral', hex: ['#c7735a', '#b8644e'] },
    colorEye: { ko: '올리브 · 틸 · 브론즈', en: 'Olive · teal · bronze', hex: ['#6b7a3a', '#2a7a72', '#a8703c'] },
    metalEye: { ko: '브론즈 · 코퍼', en: 'Bronze · copper', hex: ['#a8703c', '#b8653a'] },
    smokyEye: { ko: '카키 브라운 스모키', en: 'Khaki-brown smoky', hex: ['#5c4a32'] },
  },
  winter: {
    nudeLip: { ko: '쿨 로즈 누드 · 모브', en: 'Cool rose nude · mauve', hex: ['#b47b86', '#a06478'] },
    deepLip: { ko: '블랙 체리 · 딥 플럼', en: 'Black cherry · deep plum', hex: ['#5a0f22', '#4a1236'] },
    brightLip: { ko: '트루 레드 · 블루 레드', en: 'True red · blue red', hex: ['#c8102e', '#b0102c'] },
    gradientLip: { ko: '푸시아 · 쿨 체리', en: 'Fuchsia · cool cherry', hex: ['#d42a6e', '#b8204a'] },
    blush: { ko: '쿨 핑크 · 베리', en: 'Cool pink · berry', hex: ['#e0608a', '#b8456a'] },
    colorEye: { ko: '코발트 · 퍼플 · 에메랄드', en: 'Cobalt · purple · emerald', hex: ['#1f4fd0', '#6a2cc0', '#0f8a6a'] },
    metalEye: { ko: '실버 · 건메탈', en: 'Silver · gunmetal', hex: ['#c4c6cc', '#5a5c64'] },
    smokyEye: { ko: '블랙 · 차콜 스모키', en: 'Black · charcoal smoky', hex: ['#1c1c20'] },
  },
}

/** 모든 룩 공통 안전 안내 — 화장품 사용 시 주의사항(화장품법 시행규칙 별표3 공통 문구 취지). */
export const COMMON_SAFETY_KO = '처음 쓰는 제품은 팔 안쪽에 먼저 발라 보고, 붉어짐·가려움 등 이상이 있으면 사용을 멈추고 전문의와 상담하세요. 눈가 제품은 눈에 들어가지 않게 주의하세요.'
export const COMMON_SAFETY_EN = 'Try any new product on your inner arm first. If redness, itching or irritation appears, stop using it and consult a dermatologist. Keep eye products out of the eyes.'

export const AREA_LABEL: Record<HowToArea, { ko: string; en: string }> = {
  skin: { ko: '피부', en: 'Skin' },
  eyes: { ko: '눈', en: 'Eyes' },
  cheeks: { ko: '볼', en: 'Cheeks' },
  lips: { ko: '입술', en: 'Lips' },
  hair: { ko: '헤어', en: 'Hair' },
}

/**
 * 페이스 차트(메이크업 아티스트가 쓰는 얼굴 도안, public/looks/charts/{id}.webp).
 * 2026-10-02 벤치마킹: NYX·Makeup by Mario·Estée Lauder 가 공식 페이스 차트를 쓰고,
 * "어디에 바르는지"를 그림으로 보여주는 게 글보다 빨리 읽힌다. 모든 룩이 **같은 빈 도안**
 * (blank.webp)에 그려져 좌표가 고정 → 단계 번호 핀을 코드로 얹는다.
 * 새 룩 차트 생성: _archive/originals/face-charts/ 의 blank.png 를 gpt-image-2 edit 로.
 */
export const CHART_LOOKS: readonly MakeupStyleId[] = [
  'natural-glow', 'cloud-skin', 'blood-lip', 'maximalist-eye', 'metallic-eye', 'bold-lip', 'blush-draping', 'grunge', 'kpop-idol',
]

/** 1024×1536 차트 기준 부위 중심·반경(px). 핀 위치와 스포트라이트에 쓴다.
 *  px·py = 번호 핀 자리 — 타원 가장자리가 아니라 **그 부위 위**에 둔다(2026-10-03:
 *  피부 1번이 이마 위 머리선 근처에 떠 있어 어느 부위인지 헷갈렸다). */
export const CHART_ZONE: Record<HowToArea, { cx: number; cy: number; rx: number; ry: number; px: number; py: number }> = {
  skin: { cx: 512, cy: 740, rx: 310, ry: 380, px: 512, py: 470 },
  eyes: { cx: 512, cy: 614, rx: 250, ry: 80, px: 735, py: 614 },
  cheeks: { cx: 512, cy: 765, rx: 290, ry: 105, px: 700, py: 775 },
  lips: { cx: 508, cy: 896, rx: 120, ry: 56, px: 628, py: 896 },
  hair: { cx: 512, cy: 330, rx: 340, ry: 240, px: 512, py: 330 },
}
