import type { SeasonCode } from '../personal-color/types'
import type { ProductRec } from './types'

/**
 * 퍼스널 컬러 시즌별 추천 제품 카테고리.
 * 각 시즌 4개 — 쿠션/립/아이섀도/블러셔
 * 실제 브랜드 예시는 쇼핑 검색 참고용 (특정 브랜드 추천 아님).
 */
export const PC_RECOMMENDATIONS: Record<SeasonCode, ProductRec[]> = {
  spring: [
    {
      category: '쿠션 파운데이션',
      title: '웜 옐로우 베이스 라이트 쿠션',
      features: ['Y21/W21 호수', '세미글로우 피니시', '밝은 명도 (라이트/뉴트럴 라이트)'],
      brandExamples: ['에뛰드', '헤라', '이니스프리'],
      whyForType: '봄 웜톤의 밝고 투명한 피부에 옐로우 베이스가 완벽 매치. 글로우 피니시가 생기를 극대화합니다.',
      searchKeywords: '봄웜톤 쿠션 21호 글로우',
      icon: 'palette',
      affiliateUrl: 'https://link.coupang.com/a/eFuqyp',
    },
    {
      category: '립 틴트',
      title: '코랄·피치·살몬 계열 틴트',
      features: ['웜 오렌지 기반 컬러', '시어~세미매트 질감', 'MLBB 변주 가능'],
      brandExamples: ['롬앤', '페리페라', '어뮤즈'],
      whyForType: '코랄·피치는 봄 웜톤의 시그니처 립 컬러. 입술에 바로 생기가 번집니다.',
      searchKeywords: '봄웜톤 코랄 피치 틴트 립',
      icon: 'favorite',
    },
    {
      category: '아이섀도 팔레트',
      title: '샴페인 골드 + 라이트 브라운 팔레트',
      features: ['웜 톤 기반 (쿨 그레이 배제)', '샴페인/골드 시머 포함', '라이트 브라운 · 웜 피치 섀도'],
      brandExamples: ['데이지크', '클리오', '에스쁘아'],
      whyForType: '봄 웜톤은 샴페인 골드·라이트 브라운이 눈매를 가장 또렷하고 화사하게 만듭니다.',
      searchKeywords: '봄웜톤 샴페인 골드 아이섀도 팔레트',
      icon: 'visibility',
    },
    {
      category: '블러셔',
      title: '피치 · 살몬 코랄 블러셔',
      features: ['웜 피치~오렌지 코랄', '새틴~파우더 피니시', '발색 선명한 타입 (은은한 무리)'],
      brandExamples: ['클리오', '에뛰드', '3CE'],
      whyForType: '볼 중앙에 살짝만 얹어도 봄 웜톤 특유의 "햇살을 받은 생기"가 완성됩니다.',
      searchKeywords: '봄웜톤 피치 코랄 블러셔',
      icon: 'spa',
    },
  ],

  summer: [
    {
      category: '쿠션 파운데이션',
      title: '핑크 베이스 라이트 쿠션',
      features: ['P21/C21 호수', '세미매트~스킨 피니시', '라이트 명도 (뉴트럴 라이트~라이트)'],
      brandExamples: ['아이오페', '헤라', 'MAC'],
      whyForType: '핑크 베이스가 여름 쿨톤의 투명하고 차가운 피부 언더톤과 완벽 매치합니다.',
      searchKeywords: '여름쿨톤 핑크 베이스 쿠션 P21',
      icon: 'palette',
    },
    {
      category: '립 틴트',
      title: '로즈 · 시어 플럼 · 소프트 라즈베리 립',
      features: ['쿨 핑크~플럼 기반', '시어~글로시 질감', '안에서 번진 듯한 마무리'],
      brandExamples: ['롬앤', '이니스프리', '디어달리아'],
      whyForType: '로즈 핑크·시어 플럼이 여름 쿨톤의 투명한 피부에 가장 자연스럽게 녹아듭니다.',
      searchKeywords: '여름쿨톤 로즈 시어 립틴트',
      icon: 'favorite',
    },
    {
      category: '아이섀도 팔레트',
      title: '라벤더 · 소프트 모브 · 쿨 브라운 팔레트',
      features: ['쿨 톤 기반 (웜 오렌지 배제)', '라벤더/모브 섀도 포함', '쿨 브라운 · 아이시 핑크 포함'],
      brandExamples: ['데이지크', '무드', '어뮤즈'],
      whyForType: '라벤더·모브가 여름 쿨톤의 서늘한 분위기를 강조하며 눈매를 깊게 만듭니다.',
      searchKeywords: '여름쿨톤 라벤더 모브 아이섀도 팔레트',
      icon: 'visibility',
    },
    {
      category: '블러셔',
      title: '로즈 핑크 · 소프트 베리 블러셔',
      features: ['쿨 로즈~베리 기반', '시어~파우더 피니시', '투명하게 번지는 발색'],
      brandExamples: ['클리오', '에스쁘아', 'NARS'],
      whyForType: '여름 쿨톤의 옥같이 투명한 볼에 로즈 핑크가 청초한 혈색감을 더해줍니다.',
      searchKeywords: '여름쿨톤 로즈 핑크 블러셔',
      icon: 'spa',
    },
  ],

  autumn: [
    {
      category: '쿠션 파운데이션',
      title: '웜 옐로우 베이스 미디엄 쿠션',
      features: ['Y23/W23 호수', '세미매트~벨벳 피니시', '미디엄 명도 (내추럴~미디엄)'],
      brandExamples: ['헤라', '아이오페', '설화수'],
      whyForType: '옐로우 미디엄 톤이 가을 웜톤의 깊이 있는 피부에 정확히 얹혀, 고급스러움을 살립니다.',
      searchKeywords: '가을웜톤 옐로우 미디엄 쿠션 Y23',
      icon: 'palette',
    },
    {
      category: '립',
      title: '벽돌색 · 테라코타 · 버건디 오렌지 립',
      features: ['딥 웜 오렌지 기반', '매트~새틴 질감', '깊고 풍부한 채도'],
      brandExamples: ['롬앤', 'MAC', '3CE'],
      whyForType: '벽돌색·테라코타가 가을 웜톤의 피부 깊이와 어우러지며 "지적인 고급스러움"을 완성합니다.',
      searchKeywords: '가을웜톤 테라코타 립 매트',
      icon: 'favorite',
      affiliateUrl: 'https://link.coupang.com/a/eFuujB',
    },
    {
      category: '아이섀도 팔레트',
      title: '브론즈 · 딥 브라운 · 올리브 · 카퍼 팔레트',
      features: ['웜 딥 톤 기반', '브론즈/카퍼 시머', '올리브·딥 브라운 · 포함'],
      brandExamples: ['데이지크', '에뛰드', '어뮤즈'],
      whyForType: '브론즈·카퍼가 가을 웜톤의 눈매에 깊이와 성숙함을 더하며 시그니처 존재감을 만듭니다.',
      searchKeywords: '가을웜톤 브론즈 아이섀도 팔레트',
      icon: 'visibility',
    },
    {
      category: '블러셔',
      title: '테라코타 · 머스타드 피치 블러셔',
      features: ['웜 딥 오렌지~브라운', '매트~파우더 피니시', '자연스러운 브론징 효과'],
      brandExamples: ['클리오', 'NARS', '에뛰드'],
      whyForType: '테라코타 블러셔가 가을 웜톤 피부에 자연스럽게 녹아 따뜻한 블렌딩을 만듭니다.',
      searchKeywords: '가을웜톤 테라코타 머스타드 블러셔',
      icon: 'spa',
    },
  ],

  winter: [
    {
      category: '쿠션 파운데이션',
      title: '핑크/뉴트럴 쿨 라이트~미디엄 쿠션',
      features: ['C21/P23 호수', '매트~세미매트 피니시', '쿨 뉴트럴 언더톤'],
      brandExamples: ['헤라', 'MAC', '아이오페'],
      whyForType: '쿨 뉴트럴 베이스가 겨울 쿨톤의 새하얀 피부에 깨끗하게 밀착되며 강한 대비를 유지합니다.',
      searchKeywords: '겨울쿨톤 매트 쿠션 21호',
      icon: 'palette',
    },
    {
      category: '립',
      title: '블랙 체리 · 정순 레드 · 와인 플럼 립',
      features: ['쿨 언더 기반 레드', '매트~풀컬러 질감', '높은 채도와 강한 선명도'],
      brandExamples: ['MAC', '롬앤', '디어달리아'],
      whyForType: '정순 레드·블랙 체리가 겨울 쿨톤의 도시적 카리스마를 완성하는 시그니처 컬러입니다.',
      searchKeywords: '겨울쿨톤 와인 매트 립',
      icon: 'favorite',
    },
    {
      category: '아이섀도 팔레트',
      title: '블랙 · 딥 네이비 · 실버 글리터 팔레트',
      features: ['쿨 딥 톤 기반', '실버/차콜 시머 포함', '하이 콘트라스트 (배색 강한)'],
      brandExamples: ['데이지크', '무드', 'NARS'],
      whyForType: '블랙·딥 네이비가 겨울 쿨톤의 강한 대비와 어우러져 세련되고 모던한 눈매를 완성합니다.',
      searchKeywords: '겨울쿨톤 글리터 아이섀도 팔레트',
      icon: 'visibility',
    },
    {
      category: '블러셔',
      title: '쿨 로즈 · 시어 플럼 블러셔',
      features: ['쿨 로즈~플럼', '시어~매트 피니시', '최소한의 채도로 대비 유지'],
      brandExamples: ['클리오', 'NARS', '에스쁘아'],
      whyForType: '겨울 쿨톤은 과한 혈색보다 최소한의 쿨 로즈로 대비를 해치지 않는 것이 정답입니다.',
      searchKeywords: '겨울쿨톤 쿨 로즈 플럼 블러셔',
      icon: 'spa',
    },
  ],
}
