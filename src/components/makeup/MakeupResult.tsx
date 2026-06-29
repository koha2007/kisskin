// AI 메이크업 — 비포/애프터 결과 화면 (FREE_PIVOT_PLAN §2 / 커밋 P1-1, screen3 시안)
// ────────────────────────────────────────────────────────────────────
// Stitch 시안(screen3.png) 레이아웃 채용: 상단 스타일 칩 → 비포/애프터 슬라이더
// → 저장/공유/다시 액션 → 룩 설명 → 추천 제품. 시안 폰트·색은 전부 우리 토큰.
//
// §8 가짜 이미지 금지(실데이터 연결 전 플레이스홀더):
//   · 비포/애프터: BeforeAfterSlider 의 텍스트+무드 스와치 플레이스홀더 (AI 가짜 얼굴 X)
//   · 추천 제품: 실제 affiliate 구조인 ProductGridCard 그대로 (이미지 없는 구조) +
//     플레이스홀더 ProductRec 데이터. AI 생성 가짜 제품 이미지 X.
// 실제 비포/애프터(P1-3)·실제 추천(도구 추천 데이터)이 붙으면 props 만 교체.

import ResultGrid from '../result-grid/ResultGrid'
import { ProductGridCard } from '../result-grid/ProductGridCard'
import BeforeAfterSlider from './BeforeAfterSlider'
import { styleById, type MakeupStyleId } from '../../lib/makeup/styles'
import type { ProductRec } from '../../lib/recommendations/types'

const PRIMARY = '#eb4763'
const NAVY = '#070953'
const screenBg = { background: `linear-gradient(170deg, ${NAVY} 0%, #15123f 60%, #241a52 100%)` }

// 플레이스홀더 추천 (실제 도구 추천 데이터 연결 전). searchKeywords 는
// check:keywords 규칙(≤5단어·제품속성만) 준수 → 실제 affiliate 검색 동작.
const PLACEHOLDER_PRODUCTS: ProductRec[] = [
  {
    category: '베이스', categoryEn: 'Base',
    title: '루미너스 실크 파운데이션', titleEn: 'Luminous silk foundation',
    features: ['은은한 광채', '얇은 밀착', '자연 커버'],
    brandExamples: ['에스쁘아', '헤라'],
    whyForType: '속광 베이스로 글래스 스킨의 핵심인 촉촉한 광을 만들어줘요.',
    searchKeywords: '루미너스 실크 파운데이션 광채',
    icon: 'water_drop',
  },
  {
    category: '스킨케어', categoryEn: 'Care',
    title: '하이드레이팅 세럼', titleEn: 'Hydrating serum',
    features: ['수분 충전', '결 정돈', '광 부스터'],
    brandExamples: ['토리든', '아누아'],
    whyForType: '메이크업 전 수분 베이스를 잡아 광채가 더 오래 갑니다.',
    searchKeywords: '하이드레이팅 수분 세럼',
    icon: 'spa',
  },
  {
    category: '립', categoryEn: 'Lip',
    title: '모브 글로우 틴트', titleEn: 'Mauve glow tint',
    features: ['촉촉 글로우', '자연 발색', 'MLBB'],
    brandExamples: ['롬앤', '페리페라'],
    whyForType: '은은한 모브 톤으로 속광 룩과 자연스럽게 어울려요.',
    searchKeywords: 'MLBB 모브 글로우 틴트',
    icon: 'favorite',
  },
]

interface Props {
  styleId: MakeupStyleId
  /** 원본 셀카 */
  beforeSrc?: string
  /** 실제 인페인팅 결과(P1-3). 없으면 "생성 준비 중" 자리표시 — 디버그 마스크는 노출 안 함. */
  afterSrc?: string
  onRetake: () => void
  onBack: () => void
  isEn?: boolean
}

export default function MakeupResult({ styleId, beforeSrc, afterSrc, onRetake, onBack, isEn = false }: Props) {
  const style = styleById(styleId)
  // 실제 메이크업 결과가 아직 없으면(P1-3 미연결) 안전한 "생성 준비 중" 상태만 노출.
  const pending = !afterSrc

  const ActionBtn = ({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) => (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 border border-white/15 py-3 active:scale-[0.97] transition"
    >
      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      <span className="text-[11px] font-bold">{label}</span>
    </button>
  )

  return (
    <div className="min-h-[100dvh] font-display text-white" style={screenBg}>
      {/* 상단: 뒤로 + 타이틀 + 스타일 칩 */}
      <header className="px-5 pt-5 flex items-center gap-3 max-w-xl w-full mx-auto">
        <button
          onClick={onBack}
          aria-label={isEn ? 'Back' : '뒤로'}
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 transition"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-base font-bold tracking-tight">{isEn ? 'AI Makeup' : 'AI 메이크업'}</h1>
        <span className="shrink-0 text-[11px] font-bold bg-white/15 rounded-full px-3 py-1">
          {isEn ? style.subEn : style.nameKo}
        </span>
      </header>

      <main className="px-5 pt-5 pb-10 max-w-xl w-full mx-auto">
        {pending ? (
          /* P1-3 인페인팅 미연결 — 디버그 마스크 대신 안전한 "생성 준비 중" 자리표시 */
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-navy border border-white/10">
            {beforeSrc && <img src={beforeSrc} alt={isEn ? 'Your selfie' : '내 셀카'} className="absolute inset-0 w-full h-full object-cover opacity-35" />}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6" style={{ background: 'linear-gradient(180deg, rgba(7,9,83,0.55), rgba(7,9,83,0.78))' }}>
              <span className="material-symbols-outlined text-4xl text-white/85" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <p className="text-base font-extrabold">{isEn ? 'Preparing your makeup…' : '메이크업 생성 준비 중'}</p>
              <p className="text-xs text-white/70 leading-relaxed max-w-[15rem]">
                {isEn
                  ? 'Your real makeup result will appear here soon.'
                  : '실제 메이크업 결과가 곧 여기에 표시돼요.'}
              </p>
            </div>
          </div>
        ) : (
          <BeforeAfterSlider
            beforeSrc={beforeSrc}
            afterSrc={afterSrc}
            afterMood={style.mood}
            isEn={isEn}
          />
        )}

        {/* 액션 */}
        <div className="mt-4 flex gap-2.5">
          <ActionBtn icon="download" label={isEn ? 'Save' : '저장'} />
          <ActionBtn icon="ios_share" label={isEn ? 'Share' : '공유'} />
          <ActionBtn icon="refresh" label={isEn ? 'Retry' : '다시'} onClick={onRetake} />
        </div>

        {/* 룩 설명 */}
        <section className="mt-8">
          <h2 className="text-2xl font-extrabold tracking-tight">{isEn ? style.subEn : style.nameKo}</h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-white/80">
            {isEn ? style.descEn : style.descKo}
          </p>
        </section>

        {/* 추천 제품 — 실제 ProductGridCard 구조 (플레이스홀더 데이터) */}
        <section className="mt-8">
          <h3 className="text-sm font-bold tracking-[0.15em] text-white/55 uppercase mb-3">
            {isEn ? 'Recommended products' : '추천 제품'}
          </h3>
          <ResultGrid>
            {PLACEHOLDER_PRODUCTS.map((p) => (
              <ProductGridCard key={p.title} item={p} accent={PRIMARY} pageType="makeup" pageSlug={`makeup-${styleId}`} />
            ))}
          </ResultGrid>
          <p className="mt-3 text-center text-[11px] text-white/45">
            {isEn
              ? 'Affiliate links — we may earn a commission. Products shown are placeholders.'
              : '제휴 링크 — 구매 시 수수료를 받을 수 있어요. 표시된 제품은 플레이스홀더입니다.'}
          </p>
        </section>
      </main>
    </div>
  )
}
