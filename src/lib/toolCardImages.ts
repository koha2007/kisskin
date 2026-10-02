// 무료 도구 카드 사진 — 단일 소스 (홈 · /tools/ 허브 · beauty-dna 진행 띠가 공유).
//
// 왜 모듈로 뺐나(2026-09-23): 세 곳이 각자 `/mood/tool-*.webp` 문자열을 갖고 있었다.
// 파일명이 고정이라 사진을 바꿔도 이미 방문한 브라우저는 `cache-control: max-age=14400`
// (4시간) 동안 옛 사진을 계속 쓴다 — 룩 카드를 갈아끼운 날 "반영이 안 된다"는 보고가
// 실제로 나왔다(서버는 새 파일, 브라우저가 옛 파일). 버전을 한 곳에서 붙인다.
//
// ⚠ **사진을 다시 만들 때마다 V 를 올릴 것.** 안 올리면 같은 일이 반복된다.
//
// 사진 방향(2026-10-02 운영자 결정, 9/23 안 대체): **"미술 × 메이크업" 아트 정물 4장 한 세트**.
//   같은 화가 작업실·창가 빛·크림 톤으로 묶어 브랜드 비전("메이크업도 아트다")을 홈에서 보이게 한다.
//   · MBTI = 캔버스 위 립·섀도 16색 스와치(4×4 = 16유형)
//   · 퍼스널컬러 = 화가 팔레트의 계절색 덩어리
//   · 얼굴형 = 석고 흉상에 목탄 컨투어(실존 인물 아님 — 인물 대신 조각)
//   · 향수 = 수채 번짐 위 향수병
//   얼굴 사진이 없어 카드끼리 구분은 확실하다. 모델 얼굴은 히어로·9룩 그리드가 담당.
//   원본 PNG: _archive/originals/art-samples/ (gpt-image-2 high). 홈 beauty-dna 카드
//   (public/dna/feature.webp) 도 같은 세트 — 4요소가 한 작업대에 모인 컷.
const V = '20261002a'

const src = (name: string) => `/mood/${name}.webp?v=${V}`

export const TOOL_CARD_IMAGES = {
  mbti: src('tool-mbti'),
  personalColor: src('tool-personal-color'),
  faceShape: src('tool-face-shape'),
  perfume: src('tool-perfume'),
  guide: src('tool-guide'),
} as const
