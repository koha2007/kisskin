// 추천 카드 brandExamples 의 한글 브랜드명 → 영어 화면용 공식 표기 (2026-10-10 전체 점검).
// 영문 페이지에 '헤라·롬앤' 같은 한글이 그대로 나와 해외 사용자가 검색할 수 없었다.
// 표에 없는 한글 이름은 영어 화면에서 **숨긴다**(어설픈 로마자는 검색해도 안 나온다).
// 새 브랜드를 recommendations/*.ts 에 한글로 넣으면 여기에도 추가할 것.
const KO_TO_EN: Record<string, string> = {
  게를랑: 'Guerlain', 겐조: 'Kenzo', 데이지크: 'dasique', 돌체앤가바나: 'Dolce&Gabbana', 디어달리아: 'Dear Dahlia',
  디올: 'Dior', 딥디크: 'Diptyque', 랑방: 'Lanvin', 랑콤: 'Lancôme', 롬앤: 'rom&nd', 르라보: 'Le Labo', 맥: 'MAC',
  메이블린: 'Maybelline', '메종 마르지엘라': 'Maison Margiela', 몽블랑: 'Montblanc', 바이레도: 'Byredo', 샤넬: 'Chanel',
  설화수: 'Sulwhasoo', 시슬리: 'Sisley', 아모레퍼시픽: 'Amorepacific', 아이오페: 'IOPE', '아쿠아 디 파르마': 'Acqua di Parma',
  '아틀리에 코롱': 'Atelier Cologne', 어뮤즈: 'AMUSE', 에뛰드: 'Etude', 에르메스: 'Hermès', 에스쁘아: 'espoir',
  에스티로더: 'Estée Lauder', 이니스프리: 'innisfree', '이브 생 로랑': 'YSL Beauty', 입생로랑: 'YSL Beauty', 이솝: 'Aesop',
  조말론: 'Jo Malone London', 크리드: 'Creed', 클리오: 'CLIO', 클린: 'CLEAN Reserve', 톰포드: 'Tom Ford',
  '티에리 뮈글러': 'Mugler', 페리페라: 'peripera', 한율: 'Hanyul', 헤라: 'HERA',
}
const HANGUL = /[가-힣]/

/** 영어 화면용 브랜드 목록 — 한글은 공식 영문으로, 모르는 한글 이름은 뺀다(중복 제거) */
export function brandsForLocale(brands: string[], isEn: boolean): string[] {
  if (!isEn) return brands
  const out = brands.map((b) => (HANGUL.test(b) ? KO_TO_EN[b] : b)).filter((b): b is string => !!b)
  return [...new Set(out)]
}
