// 메이크업 클래스 커리큘럼 — 36편, 완전 기초부터 (2026-10-10 운영자 확정)
// ────────────────────────────────────────────────────────────────────
// 9룩(/looks/)과는 별도 섹션(/class/). 같은 디자인(페이스 차트 + 번호 단계 + 제품 찾기)을 쓴다.
// 발행 순서 = 이 배열 순서. 첫 4편(파트 1)은 손으로 써서 한 번에 올렸고, 5편부터는
// scripts/gen-class.mjs 가 매주 화요일(weekly-content.yml) 다음 편 하나를 만든다.
// 메일은 9룩이 끝난 다음 주(2026-12-13)부터 이 순서대로 1편씩(scripts/build-digest-payload.mjs).
//
// 주제 선정 근거(2026-10-10 조사): 검색량 큰 기초(makeup tutorial·eyeliner·contour·
// beginners) + 해외가 한국 메이크업에 끌리는 지점(자연스러운 피부·한 부위 강조) + 눈 모양별
// (후드·무쌍) + 2026 상승 키워드(립라이너·하이 블러셔). ★ = K-뷰티 차별화 편.
//
// 주제를 바꾸거나 순서를 바꿀 땐 **이미 발행된 편(lessons.json)의 slug 는 건드리지 말 것**
// (주소가 바뀌면 색인·메일 링크가 깨진다). 아직 안 나간 편만 고친다.
import type { MakeupStyleId } from '../makeup/styles'

export type ClassPart = 'start' | 'base' | 'brows' | 'eyes' | 'cheeks' | 'lips' | 'everyday'

export const CLASS_PARTS: { id: ClassPart; ko: string; en: string }[] = [
  { id: 'start', ko: '시작하기', en: 'Getting started' },
  { id: 'base', ko: '베이스', en: 'Base' },
  { id: 'brows', ko: '눈썹', en: 'Brows' },
  { id: 'eyes', ko: '눈', en: 'Eyes' },
  { id: 'cheeks', ko: '볼 · 윤곽', en: 'Cheeks & contour' },
  { id: 'lips', ko: '입술', en: 'Lips' },
  { id: 'everyday', ko: '응용', en: 'Everyday' },
]

export interface CurriculumItem {
  n: number
  slug: string
  part: ClassPart
  titleKo: string
  titleEn: string
  /** 생성기에게 주는 이 편의 범위 — 무엇을 다루고 무엇은 다른 편으로 미루는지 */
  focus: string
  /** 이 기술을 쓰는 9룩 — 페이지 하단 "이 기술이 들어간 룩" */
  looks?: MakeupStyleId[]
  /** 이어지는 무료 도구 */
  tool?: 'face-shape' | 'personal-color'
  kbeauty?: boolean
}

export const CURRICULUM: CurriculumItem[] = [
  // ── 1. 시작하기
  { n: 1, slug: 'makeup-order', part: 'start', titleKo: '메이크업 순서', titleEn: 'The right order of makeup steps',
    focus: '스킨케어 → 선크림 → 베이스 → 컨실러 → 파우더 → 눈썹 → 눈 → 볼 → 입술 → 고정. 왜 이 순서인지(크림 다음 파우더). 각 단계 상세는 뒷 편으로 미룬다.' },
  { n: 2, slug: 'skin-prep', part: 'start', titleKo: '메이크업 전 피부 준비', titleEn: 'How to prep skin before makeup',
    focus: '세안 후 토너 → 가벼운 보습 → 선크림 양(손가락 두 마디) → 흡수 기다리기. 밀림(필링) 방지.' },
  { n: 3, slug: 'undertone-foundation-shade', part: 'start', titleKo: '내 언더톤 찾고 파운데이션 색 고르기', titleEn: 'Find your undertone and foundation shade',
    focus: '손목 혈관·금/은 액세서리·흰 종이로 언더톤 보기, 턱선 3색 스와치, 자연광에서 확인.', tool: 'personal-color' },
  { n: 4, slug: 'makeup-tools-basics', part: 'start', titleKo: '손 · 브러시 · 스펀지, 언제 무엇을', titleEn: 'Fingers, brushes or sponge — when to use which',
    focus: '손가락=크림·밤(체온), 스펀지=촉촉 밀착, 브러시=파우더·정교함. 세척 주기.' },
  // ── 2. 베이스
  { n: 5, slug: 'foundation-not-cakey', part: 'base', titleKo: '두껍지 않게 파운데이션 바르기', titleEn: 'How to apply foundation without looking cakey',
    focus: '양은 적게, 얼굴 중앙에서 바깥으로, 필요한 곳만 레이어링. 들뜸 원인.' },
  { n: 6, slug: 'how-to-use-cushion', part: 'base', titleKo: '쿠션 바르는 법', titleEn: 'How to use a cushion compact (Korean base)', kbeauty: true,
    focus: '퍼프에 묻히는 양, 문지르지 않고 톡톡, 얼굴 중앙 → 바깥, 퍼프 접어 코 옆·눈 밑.', looks: ['kpop-idol', 'natural-glow'] },
  { n: 7, slug: 'under-eye-concealer', part: 'base', titleKo: '다크서클 컨실러', titleEn: 'Under-eye concealer that doesn’t crease',
    focus: '얇게, 눈꼬리 쪽 위로 사선, 손가락 체온으로 두드려 밀착, 아주 얇은 파우더. 색 보정(피치) 개념.' },
  { n: 8, slug: 'cover-blemishes', part: 'base', titleKo: '잡티 · 트러블 자국 가리기', titleEn: 'How to cover blemishes and redness',
    focus: '점처럼 찍고 가장자리만 풀기, 붉은기엔 그린/베이지, 각질 위엔 덜. 효능 표현 금지(가려 보이게).' },
  { n: 9, slug: 'set-makeup-powder', part: 'base', titleKo: '파우더로 고정하기', titleEn: 'How to set makeup with powder',
    focus: 'T존·눈 밑만, 퍼프로 누르기 vs 브러시로 쓸기, 베이킹은 언제(지성), 미스트 마무리.' },
  { n: 10, slug: 'glass-skin-makeup', part: 'base', titleKo: '글래스 스킨 베이스', titleEn: 'Glass skin makeup base', kbeauty: true,
    focus: '보습 레이어 → 얇은 베이스 → 하이라이트 위치(광대 위·콧등·턱끝) → 파우더 최소. 번들거림과 광의 차이.', looks: ['kpop-idol', 'natural-glow'] },
  // ── 3. 눈썹
  { n: 11, slug: 'eyebrow-shape-face-shape', part: 'brows', titleKo: '얼굴형별 눈썹 모양', titleEn: 'Best eyebrow shape for your face shape',
    focus: '시작·산·꼬리 세 점 찾기(콧방울 기준), 얼굴형 5가지별 산 높이·길이.', tool: 'face-shape' },
  { n: 12, slug: 'natural-eyebrows', part: 'brows', titleKo: '펜슬 · 파우더로 자연 눈썹', titleEn: 'Natural brows with pencil and powder',
    focus: '빈 곳만 결 그리기, 앞머리는 파우더로 흐리게, 스풀리로 풀기, 젤로 고정.' },
  { n: 13, slug: 'korean-straight-brows', part: 'brows', titleKo: '일자 눈썹', titleEn: 'Korean straight brows', kbeauty: true,
    focus: '산을 깎지 않고 아래쪽을 채워 수평으로, 두께 균일, 꼬리는 살짝 내림. 부드러운 인상.' },
  // ── 4. 눈
  { n: 14, slug: 'eyeshadow-for-beginners', part: 'eyes', titleKo: '기본 음영 섀도', titleEn: 'Eyeshadow for beginners',
    focus: '베이스 컬러 → 미드톤을 쌍꺼풀 라인 위까지 → 진한 색은 눈꼬리 1/3 → 경계 블렌딩. 브러시 두 개.', looks: ['natural-glow', 'metallic-eye'] },
  { n: 15, slug: 'eyeliner-basics-tightline', part: 'eyes', titleKo: '아이라인 기초 — 점막 채우기', titleEn: 'Eyeliner basics: tightlining',
    focus: '거울을 아래에 두고 눈 위 점막(속눈썹 사이)만 채우기. 눈이 커지지 않고 진해 보임. 펜슬/젤.' },
  { n: 16, slug: 'winged-eyeliner', part: 'eyes', titleKo: '윙 아이라인', titleEn: 'Winged eyeliner, step by step',
    focus: '아래 속눈썹 라인 연장선으로 각도 잡기, 꼬리 먼저 → 안쪽 연결, 테이프·면봉 수정.', looks: ['maximalist-eye'] },
  { n: 17, slug: 'puppy-eyeliner', part: 'eyes', titleKo: '강아지 라인(처진 아이라인)', titleEn: 'Korean puppy eyeliner', kbeauty: true,
    focus: '꼬리를 살짝 아래로 내려 순한 인상, 아래 꼬리 1/3에 브라운 섀도 연결.' },
  { n: 18, slug: 'hooded-eyes-makeup', part: 'eyes', titleKo: '후드 아이(덮인 눈꺼풀) 메이크업', titleEn: 'Makeup for hooded eyes',
    focus: '눈 뜬 상태에서 색 위치 잡기, 음영을 접히는 선보다 위에, 매트 위주, 라인은 가늘게.' },
  { n: 19, slug: 'monolid-makeup', part: 'eyes', titleKo: '무쌍 메이크업', titleEn: 'Monolid eye makeup', kbeauty: true,
    focus: '그라데이션을 위로 넓게, 펄은 눈 중앙, 라인은 점막+꼬리만 길게, 아래 꼬리 음영.' },
  { n: 20, slug: 'aegyo-sal', part: 'eyes', titleKo: '애교살 메이크업', titleEn: 'Aegyo-sal: Korean under-eye makeup', kbeauty: true,
    focus: '웃을 때 볼록한 부분에 밝은 펄, 그 아래 아주 연한 브라운 그림자 선, 과하면 부어 보임.', looks: ['kpop-idol'] },
  { n: 21, slug: 'curl-lashes-mascara', part: 'eyes', titleKo: '뷰러와 마스카라', titleEn: 'How to curl lashes and apply mascara',
    focus: '뷰러 뿌리 → 중간 → 끝 3번, 마스카라 뿌리에서 지그재그, 뭉침 빗기, 컬 오래 가게 하기.' },
  { n: 22, slug: 'smoky-eye-basics', part: 'eyes', titleKo: '스모키 아이 기초', titleEn: 'Smoky eye for beginners',
    focus: '펜슬로 라인 → 손가락/브러시로 번지기 → 같은 계열 섀도로 덮기. 브라운 스모키부터.', looks: ['grunge'] },
  // ── 5. 볼 · 윤곽
  { n: 23, slug: 'blush-placement-face-shape', part: 'cheeks', titleKo: '얼굴형별 블러셔 위치', titleEn: 'Where to put blush for your face shape',
    focus: '웃었을 때 볼·광대 위(하이 블러셔)·관자놀이 C자·W 블러셔. 얼굴형 5가지별 방향.', tool: 'face-shape', looks: ['blush-draping'] },
  { n: 24, slug: 'contour-basics', part: 'cheeks', titleKo: '컨투어 기초', titleEn: 'Contouring for beginners',
    focus: '피부보다 1~2톤 어둡고 회갈색, 귀 앞 → 광대 아래로 짧게, 턱선, 경계 블렌딩.' },
  { n: 25, slug: 'contour-face-shape', part: 'cheeks', titleKo: '얼굴형별 컨투어', titleEn: 'How to contour for your face shape',
    focus: '둥근형=광대 아래 사선, 각진형=턱 모서리, 긴형=이마 위·턱 끝, 하트형=이마 양옆, 계란형=최소.', tool: 'face-shape' },
  { n: 26, slug: 'highlighter-placement', part: 'cheeks', titleKo: '하이라이터 위치', titleEn: 'Where to apply highlighter',
    focus: '광대 위·콧등 짧게·눈 앞머리·윗입술 산, 모공 많은 곳 피하기, 크림 vs 파우더.', looks: ['kpop-idol', 'metallic-eye'] },
  { n: 27, slug: 'nose-contour', part: 'cheeks', titleKo: '노즈 쉐딩', titleEn: 'Nose contouring, softly',
    focus: '눈썹 앞머리에서 콧대 옆으로 연하게, 콧방울 아래 짧게, 콧등 하이라이트 짧게. 선 안 보이게.' },
  // ── 6. 입술
  { n: 28, slug: 'lip-liner-basics', part: 'lips', titleKo: '립라이너와 풀립', titleEn: 'How to use lip liner',
    focus: '입술색과 비슷한 라이너로 산·아랫입술 중앙 점 → 연결, 안쪽 채우기, 립 바르고 블로팅.', looks: ['bold-lip', 'blood-lip'] },
  { n: 29, slug: 'gradient-lip', part: 'lips', titleKo: '그라데이션 립', titleEn: 'Korean gradient lips', kbeauty: true,
    focus: '컨실러로 입술 가장자리 정리 → 안쪽에 틴트 → 손가락으로 바깥쪽 풀기, 밤으로 마무리.', looks: ['kpop-idol', 'blood-lip'] },
  { n: 30, slug: 'overline-lips', part: 'lips', titleKo: '오버립', titleEn: 'How to overline your lips naturally',
    focus: '윗입술 산과 아랫입술 중앙만 1mm 바깥, 입꼬리는 안쪽, 라이너는 입술보다 한 톤 진하게, 중앙에 글로스.' },
  { n: 31, slug: 'long-lasting-lipstick', part: 'lips', titleKo: '묻어나지 않는 립', titleEn: 'Make lipstick last (transfer-proof)',
    focus: '얇게 → 티슈 블로팅 → 다시 얇게, 라이너로 전체 채우기, 매트·틴트 고르기.' },
  // ── 7. 응용
  { n: 32, slug: 'five-minute-makeup', part: 'everyday', titleKo: '5분 데일리 메이크업', titleEn: '5-minute everyday makeup',
    focus: '쿠션 → 컨실러 → 눈썹 → 마스카라 → 틴트를 볼과 입술에 같이. 앞 편 링크로 연결.', looks: ['natural-glow'] },
  { n: 33, slug: 'makeup-with-glasses', part: 'everyday', titleKo: '안경 쓴 날 메이크업', titleEn: 'Makeup for glasses wearers',
    focus: '근시 렌즈=눈이 작아 보임→라인 진하게, 원시=커 보임→매트·깔끔하게, 코받침 자국 파우더, 눈썹과 테 라인.' },
  { n: 34, slug: 'oily-skin-long-lasting', part: 'everyday', titleKo: '지성 · 땀에도 안 무너지게', titleEn: 'Long-lasting makeup for oily skin',
    focus: '피지 조절 프라이머는 T존만, 얇은 레이어, 파우더 두 번, 픽서. 효능 표현 금지(유지돼 보이게).' },
  { n: 35, slug: 'makeup-touch-up', part: 'everyday', titleKo: '수정 화장', titleEn: 'How to touch up makeup during the day',
    focus: '기름종이 → 무너진 곳만 쿠션 소량 → 파우더 → 립. 덧바르기 전 정리가 핵심.' },
  { n: 36, slug: 'colors-for-personal-color', part: 'everyday', titleKo: '내 퍼스널컬러로 색 고르기', titleEn: 'Choose makeup colors for your personal color',
    focus: '봄·여름·가을·겨울별 립·블러셔·섀도 계열, 피해야 할 색, 매장에서 테스트하는 법.', tool: 'personal-color' },
]

export const curriculumBySlug = (slug: string) => CURRICULUM.find((c) => c.slug === slug)
