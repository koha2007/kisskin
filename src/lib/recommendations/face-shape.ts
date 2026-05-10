import type { FaceShapeCode } from '../face-shape/types'
import type { ProductRec } from './types'

/**
 * 얼굴형별 추천 제품 카테고리.
 * 각 얼굴형 3개 — 컨투어/하이라이터/블러셔·포인트 (컬러보다 "질감·도구" 중심)
 */
export const FS_RECOMMENDATIONS: Record<FaceShapeCode, ProductRec[]> = {
  oval: [
    {
      category: '하이라이터',
      title: '자연스러운 하이라이터 팔레트',
      features: ['샴페인/펄 중간 밝기', '입자 고운 파우더', '지속력 높은 크림 옵션'],
      brandExamples: ['3CE', 'MAC', '헤라'],
      whyForType: '계란형은 이미 균형이 잡혀 있어 과한 컨투어보다 하이라이터로 자연스러운 입체감만 더하면 충분합니다.',
      searchKeywords: '내추럴 하이라이터 샴페인 펄',
      icon: 'auto_awesome',
    },
    {
      category: '블러셔',
      title: '멀티 블러셔 (위치 자유)',
      features: ['블렌딩 좋은 크림 타입', '자연스러운 발색', '볼 중앙/광대 위 모두 가능'],
      brandExamples: ['롬앤', '클리오', '에뛰드'],
      whyForType: '계란형은 어느 위치에 발러도 조화로워 다양한 시도가 가능합니다. 자유도 높은 블러셔가 최적.',
      searchKeywords: '크림 블러셔 내추럴',
      icon: 'spa',
    },
    {
      category: '립 제품',
      title: '풀 립·오버 립·그라데이션 모두 OK',
      features: ['발색 선명한 틴트', '글로시 립밤', '정교한 립라이너'],
      brandExamples: ['롬앤', '페리페라', '디어달리아'],
      whyForType: '계란형은 립 스타일 제약이 없습니다. 본인 취향에 맞춰 자유롭게 선택하세요.',
      searchKeywords: '틴트 립 글로시 립밤',
      icon: 'favorite',
    },
  ],

  round: [
    {
      category: '컨투어 파우더',
      title: '쿨 톤 컨투어 · 섀도우 파우더',
      features: ['쿨 브라운 (웜 브라운 X)', '파우더 타입 (블렌딩 용이)', '얼굴 옆면 사선 컨투어용'],
      brandExamples: ['클리오', '에뛰드', '퓌르모어'],
      whyForType: '둥근형은 광대 아래 사선 컨투어로 세로 입체감을 만드는 것이 핵심. 쿨 톤 파우더가 자연스럽게 블렌딩됩니다.',
      searchKeywords: '쿨 브라운 컨투어 파우더 섀도우',
      icon: 'grid_3x3',
    },
    {
      category: '하이라이터',
      title: '세로 배치용 하이라이터 스틱',
      features: ['스틱 타입 (정교한 라인)', '펄 입자 고운 것', '콧등/이마 중앙에 세로로'],
      brandExamples: ['3CE', 'MAC', '롬앤'],
      whyForType: '콧등·이마 중앙·턱에 세로로 발라 세로 입체감을 만듭니다. 스틱 타입이 정밀합니다.',
      searchKeywords: '하이라이터 스틱 펄 입자고운',
      icon: 'auto_awesome',
    },
    {
      category: '립 · 블러셔',
      title: '그라데이션 립 + 사선 블러셔',
      features: ['블러드 틴트 (번짐 좋은)', '블러셔는 광대 아래 사선', '가로 풀 립 피하기'],
      brandExamples: ['롬앤', '페리페라', '클리오'],
      whyForType: '가로 포인트를 줄이고 세로 입체감을 강화해야 얼굴이 길어 보입니다.',
      searchKeywords: '블러드 틴트 그라데이션 립',
      icon: 'favorite',
    },
  ],

  square: [
    {
      category: '컨투어 · 블러셔',
      title: '부드러운 블렌딩 컨투어 + 둥근 블러셔',
      features: ['크림 컨투어 (부드러운 블렌딩)', '둥근 컬러 블러셔', '턱·이마 모서리 곡선 완화용'],
      brandExamples: ['MAC', '페리페라', '에뛰드'],
      whyForType: '각진형은 턱·이마 모서리만 부드럽게 풀어주는 것이 핵심. 크림 타입이 경계 없이 블렌딩됩니다.',
      searchKeywords: '크림 컨투어 블렌딩 블러셔',
      icon: 'grid_3x3',
    },
    {
      category: '립 · 눈썹',
      title: '부드러운 곡선 립 + 아치 눈썹',
      features: ['글로시 립밤 (둥근 곡선)', '아치형 눈썹 제품', '일자 눈썹 피하기'],
      brandExamples: ['롬앤', '어뮤즈', '디어달리아'],
      whyForType: '각진형에 직선 요소(일자 눈썹, 매트 풀컬러)는 각을 강조. 곡선이 들어간 제품으로 부드럽게.',
      searchKeywords: '아치 눈썹 글로시 립밤',
      icon: 'favorite',
    },
    {
      category: '하이라이터',
      title: '광대 위 둥근 하이라이터',
      features: ['입자 고운 파우더', '광대 위 둥글게 바를 수 있는 파우더 타입', '이마 중앙·턱 중앙에도'],
      brandExamples: ['3CE', 'MAC', '헤라'],
      whyForType: '광대 위에 둥글게 바르면 각진 얼굴에 "동그라미"가 추가되어 부드러움이 더해집니다.',
      searchKeywords: '파우더 하이라이터 입자고운',
      icon: 'auto_awesome',
    },
  ],

  oblong: [
    {
      category: '컨투어 파우더',
      title: '가로 배치용 컨투어 파우더',
      features: ['자연스러운 브라운 톤', '파우더 타입 (넓게 블렌딩)', '헤어라인/턱 아래 가로 배치'],
      brandExamples: ['클리오', '에뛰드', '퓌르모어'],
      whyForType: '긴형은 이마 위·턱 아래에 가로 쉐이딩을 깔아 세로 길이를 시각적으로 줄이는 것이 핵심입니다.',
      searchKeywords: '브라운 컨투어 파우더 쉐딩',
      icon: 'grid_3x3',
    },
    {
      category: '블러셔',
      title: '가로 드레이핑 블러셔',
      features: ['광대 위 가로로 넓게 바를 수 있는 것', '파우더 또는 액상 블러셔', '사선/광대 아래 배치 피하기'],
      brandExamples: ['롬앤', 'NARS', '에뛰드'],
      whyForType: '볼 중앙에 가로로 넓게 발라 "가로 포인트"를 만들면 세로 길이가 덜 강조됩니다.',
      searchKeywords: '드레이핑 블러셔 파우더',
      icon: 'spa',
    },
    {
      category: '립',
      title: '풀 립 · 선명한 컬러 립',
      features: ['또렷한 매트/풀컬러 립', '입술 너비 강조', '얇게 그리지 말 것'],
      brandExamples: ['MAC', '롬앤', '디어달리아'],
      whyForType: '입술 너비를 충분히 드러내는 풀 립이 긴 얼굴에 가로 존재감을 더합니다.',
      searchKeywords: '풀 립 매트 선명 컬러',
      icon: 'favorite',
    },
  ],

  heart: [
    {
      category: '컨투어 파우더',
      title: '이마 V 컨투어 + 턱 끝 완화 컨투어',
      features: ['크림 또는 파우더 컨투어', '이마 양옆 V자 배치용', '턱 끝 부드럽게 풀어줄 수 있는 것'],
      brandExamples: ['클리오', 'MAC', '페리페라'],
      whyForType: '하트형은 이마 양옆과 턱 끝에 집중 컨투어로 넓은 이마와 뾰족한 턱의 균형을 맞춥니다.',
      searchKeywords: '컨투어 파우더 V라인',
      icon: 'grid_3x3',
    },
    {
      category: '블러셔',
      title: '볼 아래쪽 블러셔',
      features: ['광대 아래에 발라지는 타입', '부드러운 발색', '얼굴 하단에 볼륨 추가용'],
      brandExamples: ['롬앤', '3CE', 'NARS'],
      whyForType: '이마가 넓은 하트형은 볼 아래쪽에 블러셔를 발라 얼굴 하단에 볼륨을 더하면 균형이 잡힙니다.',
      searchKeywords: '크림 블러셔 자연스러운',
      icon: 'spa',
    },
    {
      category: '립',
      title: '풀 립 · 오버 립 제품',
      features: ['입술 볼륨 주는 풀 립', '오버 립용 립라이너', '플러핑 립글로스'],
      brandExamples: ['MAC', '롬앤', '어뮤즈'],
      whyForType: '입술에 볼륨을 더하면 얼굴 하단 포인트가 강화되어 뾰족한 턱이 분산됩니다.',
      searchKeywords: '오버 립 플러핑 립글로스 풀립',
      icon: 'favorite',
    },
  ],
}
