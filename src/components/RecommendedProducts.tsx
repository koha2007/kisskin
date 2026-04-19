import type { ProductRec } from '../lib/recommendations/types'
import { AFFILIATE_ENABLED, buildSearchLink } from '../lib/recommendations/types'

interface Props {
  items: ProductRec[]
  accentColor?: string         // 테마 색 (각 도구별 기본 색)
  accentGradient?: string      // 그라디언트 (예: "from-amber-500 to-orange-500")
  headingEmoji?: string        // 섹션 아이콘
  subtitle?: string            // 섹션 서브타이틀
}

export default function RecommendedProducts({
  items,
  accentColor = '#eb4763',
  accentGradient = 'from-primary to-pink-500',
  headingEmoji = '🛍️',
  subtitle = '이 유형에 어울리는 제품 카테고리와 꼭 확인해야 할 특징을 정리했습니다. 쇼핑 시 참고하세요.',
}: Props) {
  if (!items.length) return null

  return (
    <section className="py-12 md:py-16 bg-white" aria-label="추천 제품 카테고리">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-3 flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-50 border border-slate-200 text-slate-600">
            <span>{headingEmoji}</span>
            추천 쇼핑 가이드
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-navy tracking-tight">
            이런 제품을 찾아보세요
          </h2>
          <p className="text-sm text-slate-500 max-w-xl leading-relaxed">{subtitle}</p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          {items.map((item, i) => (
            <article
              key={i}
              className="relative bg-white rounded-2xl border p-5 md:p-6 hover:shadow-lg transition-shadow"
              style={{ borderColor: `${accentColor}25` }}
            >
              {/* Category chip */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                    style={{ background: accentColor }}
                  >
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <div className="text-[0.65rem] uppercase tracking-wider font-bold text-slate-400">
                      {item.category}
                    </div>
                    <h3 className="text-base md:text-lg font-extrabold text-navy-mid leading-tight">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Why for type */}
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {item.whyForType}
              </p>

              {/* Features checklist */}
              <div className="mb-4">
                <div className="text-[0.65rem] uppercase tracking-wider font-bold text-slate-400 mb-2">
                  꼭 확인할 특징
                </div>
                <ul className="flex flex-col gap-1.5">
                  {item.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm text-slate-600">
                      <span
                        className="material-symbols-outlined text-base mt-0.5 shrink-0"
                        style={{ color: accentColor, fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Brand examples */}
              <div className="mb-4">
                <div className="text-[0.65rem] uppercase tracking-wider font-bold text-slate-400 mb-2">
                  검색에 참고할 브랜드
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.brandExamples.map((b, bi) => (
                    <span
                      key={bi}
                      className="px-2.5 py-0.5 bg-slate-50 border border-slate-200 rounded-full text-[0.7rem] font-medium text-slate-600"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA — safe Google Shopping search for now; affiliate-ready structure */}
              {AFFILIATE_ENABLED ? (
                <a
                  href={item.affiliateUrl || buildSearchLink(item.searchKeywords)}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 text-sm font-bold bg-gradient-to-r ${accentGradient} bg-clip-text text-transparent group-hover:gap-2 transition-all`}
                >
                  제품 찾아보기
                  <span
                    className="material-symbols-outlined text-base"
                    style={{ color: accentColor }}
                  >
                    arrow_outward
                  </span>
                </a>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  구매 링크 준비 중
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Disclosure — only when affiliate enabled */}
        {AFFILIATE_ENABLED && (
          <p className="mt-8 text-center text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
            이 페이지는 제휴 링크를 포함할 수 있으며, 구매 발생 시 당사가 소정의 수수료를 받을 수 있습니다.
            수수료는 제품 가격에 영향을 주지 않으며, 추천은 유형별 특성 분석을 기반으로 이뤄집니다.
          </p>
        )}
      </div>
    </section>
  )
}
