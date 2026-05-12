import type { PerfumeTypeCode } from '../perfume-type/types'
import type { ProductRec } from './types'

/**
 * 향수 타입별 추천 향수 카테고리 — 어필리에이트 검색 링크용.
 * searchKeywords ≤ 5단어, 제품 속성(계열·노트·텍스처)만 사용.
 * 한국 시장 인지도 높은 브랜드를 brandExamples로 노출 (구매 참고용).
 */
export const PERFUME_TYPE_RECOMMENDATIONS: Record<PerfumeTypeCode, ProductRec[]> = {
  floral: [
    {
      category: '플로럴 입문',
      title: '프리지아·페어 블렌드 향수',
      features: ['모던한 가벼운 플로럴', '20~30대 데일리 추천', '봄·초여름 강력'],
      brandExamples: ['조말론', '딥디크', '랑방'],
      whyForType: '플로럴 입문자에게 가장 안전한 모던 플로럴 — 헤비한 장미향 부담 없이 우아함만 살립니다.',
      searchKeywords: '프리지아 향수',
      icon: 'spa',
    },
    {
      category: '클래식 로즈',
      title: '장미 중심 페미닌 향수',
      features: ['장미 솔리플로럴 또는 부케형', '데이트·결혼식 자리에 강력', '오 드 퍼퓸 권장'],
      brandExamples: ['딥디크', '크리드', '톰포드'],
      whyForType: '플로럴 정수를 체험하고 싶은 분에게 추천 — 클래식한 페미닌 무드의 결정판입니다.',
      searchKeywords: '장미향 향수',
      icon: 'favorite',
    },
    {
      category: '유니섹스 플로럴',
      title: '플로럴 + 그린 노트 블렌드',
      features: ['모던 유니섹스 향수', '오피스·갤러리 자리 무난', '플로럴 + 그린 조합'],
      brandExamples: ['이솝', '르라보', '바이레도'],
      whyForType: '여성스러운 인상은 살리되 너무 페미닌하지 않은 톤을 원할 때 — 유니섹스 플로럴이 정답.',
      searchKeywords: '플로럴 향수',
      icon: 'eco',
    },
  ],

  citrus: [
    {
      category: '클래식 시트러스',
      title: '베르가못·레몬 블렌드 향수',
      features: ['가장 가벼운 톱노트', '오피스·운동 후 강력', '오 드 콜로뉴 또는 오 드 토일렛'],
      brandExamples: ['아쿠아 디 파르마', '조말론', '4711'],
      whyForType: '시트러스의 정수 — 깔끔하고 활기찬 첫인상을 만드는 데 가장 검증된 조합입니다.',
      searchKeywords: '유니섹스 시트러스 향수',
      icon: 'wb_sunny',
    },
    {
      category: '시트러스 + 허브',
      title: '라임·바질·만다린 블렌드',
      features: ['시트러스에 허브 깊이 추가', '입문자도 부담 없음', '봄~여름 데일리'],
      brandExamples: ['조말론', '아쿠아 디 파르마', '아틀리에 코롱'],
      whyForType: '단순 시트러스에 입체감을 더한 조합 — 가볍지만 단순하지 않은 향을 찾을 때 추천.',
      searchKeywords: '라임 바질 향수',
      icon: 'grass',
    },
    {
      category: '시트러스 + 플로럴',
      title: '시트러스 플로럴 가성비 라인',
      features: ['시트러스 톱 + 플로럴 미들', '데일리 향수로 무난', '한국 백화점 인지도 높음'],
      brandExamples: ['샤넬', '돌체앤가바나', '랑콤'],
      whyForType: '시트러스의 청량함과 플로럴의 우아함을 동시에 — 가장 무난한 데일리 향수 카테고리.',
      searchKeywords: '시트러스 플로럴 향수',
      icon: 'auto_awesome',
    },
  ],

  woody: [
    {
      category: '시그니처 우디',
      title: '샌달우드 중심 향수',
      features: ['우디 향수의 아이콘', '유니섹스 라인업', '가을·겨울 강력'],
      brandExamples: ['르라보', '딥디크', '톰포드'],
      whyForType: '우디 입문자에게 가장 검증된 샌달우드 — 부드럽고 따뜻한 톤으로 부담 없이 시작 가능.',
      searchKeywords: '샌달우드 향수',
      icon: 'forest',
    },
    {
      category: '스모키 우디',
      title: '베티버·패촐리 블렌드',
      features: ['깊고 묵직한 베이스', '저녁 자리 강력', '오 드 퍼퓸 권장'],
      brandExamples: ['톰포드', '크리드', '바이레도'],
      whyForType: '우디의 깊이를 더 강화한 라인 — 비즈니스·격식 디너 자리의 무게감을 만들어 줍니다.',
      searchKeywords: '베티버 우디 향수',
      icon: 'local_fire_department',
    },
    {
      category: '우디 + 스파이시',
      title: '시더우드·페퍼·카더멈',
      features: ['우디 + 스파이시 노트', '남성·유니섹스 추천', '가을~겨울 시그니처'],
      brandExamples: ['톰포드', '메종 마르지엘라', '에르메스'],
      whyForType: '우디에 스파이시 톤을 더한 변형 — 가장 시그니처에 가까운 우디를 찾을 때 추천.',
      searchKeywords: '시더우드 스파이시 향수',
      icon: 'whatshot',
    },
  ],

  amber: [
    {
      category: '클래식 앰버',
      title: '바닐라·통카빈 베이스 향수',
      features: ['진하고 달콤한 베이스', '저녁·밤 자리 강력', '오 드 퍼퓸 / 퍼퓸 권장'],
      brandExamples: ['톰포드', '이브 생 로랑', '게를랑'],
      whyForType: '앰버의 정수 — 잊을 수 없는 임팩트를 만들고 싶을 때 가장 검증된 라인.',
      searchKeywords: '앰버 바닐라 향수',
      icon: 'whatshot',
    },
    {
      category: '앰버 + 우디',
      title: '앰버 우디 블렌드 향수',
      features: ['앰버의 깊이 + 우디의 따뜻함', '가을·겨울 시그니처', '8시간 이상 지속'],
      brandExamples: ['메종 마르지엘라', '톰포드', '크리드'],
      whyForType: '앰버의 강도를 살짝 톤다운한 우디 앰버 — 입문자도 부담 없이 시도 가능한 조합.',
      searchKeywords: '앰버 우디 향수',
      icon: 'park',
    },
    {
      category: '앰버 구르망',
      title: '앰버 + 카라멜·바닐라 디저트 노트',
      features: ['앰버의 깊이 + 달콤함', '20~30대 여성 인기', '저녁 데이트 강력'],
      brandExamples: ['이브 생 로랑', '랑콤', '몽블랑'],
      whyForType: '앰버에 달콤함을 더한 라인 — 관능과 사랑스러움을 동시에 잡는 변형.',
      searchKeywords: '앰버 구르망 향수',
      icon: 'bakery_dining',
    },
  ],

  fresh: [
    {
      category: '비누향 프레시',
      title: '아쿠아·머스크 블렌드 향수',
      features: ['비누·세제 향 무드', '학생·신입사원 추천', '여름 데일리 강력'],
      brandExamples: ['시슬리', '돌체앤가바나', '클린'],
      whyForType: '프레시 입문자에게 가장 안전한 비누향 — 호불호 없이 모든 자리에서 깨끗한 인상.',
      searchKeywords: '비누향 머스크 향수',
      icon: 'shower',
    },
    {
      category: '아쿠아틱 프레시',
      title: '바다·오존 노트 향수',
      features: ['시원한 바다 무드', '여름·운동 후 강력', '오 드 토일렛 권장'],
      brandExamples: ['아쿠아 디 파르마', '겐조', '입생로랑'],
      whyForType: '여름의 시원함을 직접 입은 듯한 아쿠아틱 라인 — 더운 날씨에 가장 매력적.',
      searchKeywords: '아쿠아틱 향수',
      icon: 'water_drop',
    },
    {
      category: '유니섹스 프레시',
      title: '그린 + 미네랄 블렌드',
      features: ['모던 유니섹스', '오피스 데일리 강력', '한국 브랜드 인지도 높음'],
      brandExamples: ['이솝', '르라보', '한율'],
      whyForType: '프레시에 모던한 미네랄·그린 노트를 더한 유니섹스 — 데일리 시그니처로 가장 무난.',
      searchKeywords: '그린 미네랄 향수',
      icon: 'eco',
    },
  ],

  gourmand: [
    {
      category: '클래식 구르망',
      title: '바닐라·카라멜 중심 향수',
      features: ['구르망의 시조 라인업', '20~30대 인기', '가을·겨울 강력'],
      brandExamples: ['티에리 뮈글러', '이브 생 로랑', '랑콤'],
      whyForType: '구르망 입문자에게 가장 검증된 라인 — 디저트 향의 정수를 체험할 수 있는 베스트셀러.',
      searchKeywords: '바닐라 카라멜 향수',
      icon: 'cake',
    },
    {
      category: '체리·베리 구르망',
      title: '체리·라즈베리 디저트 노트',
      features: ['프루티 디저트 톤', '봄·가을 데일리', '카페 데이트 강력'],
      brandExamples: ['톰포드', '디올', '게를랑'],
      whyForType: '바닐라·카라멜이 부담스러울 때 — 더 가볍고 상큼한 디저트 톤의 구르망을 추천.',
      searchKeywords: '체리 베리 향수',
      icon: 'restaurant',
    },
    {
      category: '우디 구르망',
      title: '구르망 + 샌달우드·앰버 블렌드',
      features: ['30대 이후 어른스러운 진화', '가을·겨울 시그니처', '구르망 + 우디 깊이'],
      brandExamples: ['메종 마르지엘라', '몽블랑', '톰포드'],
      whyForType: '구르망의 달콤함에 우디·앰버 깊이를 더한 진화형 — 30대 이후 추천 카테고리.',
      searchKeywords: '우디 구르망 향수',
      icon: 'park',
    },
  ],
}
