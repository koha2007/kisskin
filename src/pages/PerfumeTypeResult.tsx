import { PERFUME_TYPES, PERFUME_TYPE_ORDER, type PerfumeTypeCode } from '../lib/perfume-type/types'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { PERFUME_TYPE_RECOMMENDATIONS } from '../lib/recommendations/perfume-type'
import RecommendedProducts from '../components/RecommendedProducts'
import ShareBar from '../components/ShareBar'
import RelatedTools from '../components/RelatedTools'

interface Props { code: PerfumeTypeCode }

export default function PerfumeTypeResult({ code }: Props) {
  const t = PERFUME_TYPES[code]
  const basePath = '/tools/perfume-type'

  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />
      <main>

      <section className="relative py-16 md:py-24 overflow-hidden" style={{ background: `linear-gradient(135deg, ${t.primaryColor}10 0%, ${t.accentColor}18 100%)` }}>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-6xl md:text-7xl mb-3">{t.emoji}</div>
          <p className="font-mono text-xs md:text-sm tracking-[0.3em] text-slate-500 mb-2">{t.enName.toUpperCase()}</p>
          <h1 className="font-serif text-4xl md:text-6xl font-semibold text-navy tracking-tight mb-3 leading-[1.05]">{t.koName}</h1>
          <p className="text-base md:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">{t.tagline}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <a href={`${basePath}/`} className="bg-white border-2 border-rose-100 hover:border-rose-500 px-6 py-3 rounded-full font-bold text-sm md:text-base text-navy-mid flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">refresh</span> 다시 진단하기
            </a>
            <a href="/analysis" className="text-white px-6 py-3 rounded-full font-bold text-sm md:text-base shadow-lg flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, ${t.primaryColor}, ${t.accentColor})` }}>
              <span className="material-symbols-outlined">auto_awesome</span> 어울리는 메이크업 시뮬레이션
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-8 tracking-tight leading-tight">
            {t.koName}의 핵심 특징
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {t.features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border flex gap-4" style={{ borderColor: `${t.primaryColor}30` }}>
                <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm" style={{ background: t.primaryColor }}>{i + 1}</div>
                <p className="text-sm text-slate-600 leading-relaxed pt-0.5">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detail paragraphs */}
      <section className="py-8 md:py-10 bg-gradient-to-b from-background-light to-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-slate-600 leading-relaxed text-[15px] md:text-base space-y-5">
            {t.detailParagraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      {/* Scene Guide */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-3 tracking-tight leading-tight">
            상황·계절 가이드
          </h2>
          <p className="text-center text-slate-500 text-sm mb-8">
            {t.koName}이 가장 매력적으로 발산되는 시간과 자리
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { icon: 'calendar_month', label: '베스트 계절', v: t.scene.season },
              { icon: 'event', label: '추천 상황', v: t.scene.occasion },
              { icon: 'schedule', label: '베스트 시간대', v: t.scene.timeOfDay },
              { icon: 'block', label: '피해야 할 자리', v: t.scene.avoidSituation },
            ].map(it => (
              <div key={it.label} className="bg-white rounded-2xl p-5 border" style={{ borderColor: `${t.primaryColor}30`, background: `${t.primaryColor}06` }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: t.primaryColor }}>
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{it.icon}</span>
                  </div>
                  <div className="font-extrabold text-navy-mid">{it.label}</div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{it.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Makeup Match */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-background-light to-pink-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-3 tracking-tight leading-tight">
            어울리는 메이크업
          </h2>
          <p className="text-center text-slate-500 text-sm mb-8">
            향수와 톤이 자연스럽게 맞는 메이크업 무드
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: 'palette', label: '베이스', v: t.makeupMatch.base },
              { icon: 'favorite', label: '립', v: t.makeupMatch.lip },
              { icon: 'visibility', label: '아이', v: t.makeupMatch.eye },
              { icon: 'spa', label: '치크', v: t.makeupMatch.cheek },
            ].map(it => (
              <div key={it.label} className="bg-white rounded-2xl p-5 border border-pink-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3" style={{ background: t.primaryColor }}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{it.icon}</span>
                </div>
                <div className="text-[0.65rem] uppercase tracking-wider font-bold text-slate-400 mb-1">{it.label}</div>
                <p className="text-sm text-slate-600 leading-relaxed">{it.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cautions */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-amber-500 text-3xl">warning</span>
              <h2 className="text-xl font-extrabold text-navy tracking-tight">
                향수 입히기 전 주의할 점
              </h2>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              {t.cautions.map((a, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Recommended Products — Coupang Partners search affiliate */}
      <RecommendedProducts
        items={PERFUME_TYPE_RECOMMENDATIONS[t.code]}
        accentColor={t.primaryColor}
        accentGradient="from-rose-500 to-amber-500"
        headingEmoji="🌹"
        subtitle={`${t.koName} 타입에 추천하는 향수 카테고리입니다. 한국 시장 인지도 높은 브랜드를 참고하세요.`}
      />

      {/* kissinskin CTA */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-pink-50/40 via-white to-pink-50/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 text-primary-dark text-sm font-bold uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100 mb-4">
            <span className="material-symbols-outlined text-base">recommend</span>
            추천 K-뷰티 스타일
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-navy tracking-tight mb-3 leading-tight">
            {t.koName}과 어울리는 kissinskin 룩
          </h2>
          <p className="text-slate-500 text-sm md:text-base mb-8">{t.kissinskin.reason}</p>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-pink-50/50 rounded-2xl p-6 border border-pink-100">
              <span className="material-symbols-outlined text-primary text-3xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>female</span>
              <h3 className="font-extrabold text-navy-mid mb-1">여성</h3>
              <p className="text-xl font-bold text-primary">{t.kissinskin.women}</p>
            </div>
            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
              <span className="material-symbols-outlined text-blue-500 text-3xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>male</span>
              <h3 className="font-extrabold text-navy-mid mb-1">남성</h3>
              <p className="text-xl font-bold text-blue-500">{t.kissinskin.men}</p>
            </div>
          </div>
          <a href="/analysis" className="bg-gradient-to-r from-primary to-pink-500 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl shadow-primary/25 inline-flex items-center gap-2">
            AI 메이크업 시뮬레이션 ($2.99)
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </div>
      </section>

      {/* Related tools */}
      <RelatedTools exclude="face-shape" titleKo="다른 무료 진단도 함께" />

      {/* Share */}
      <ShareBar
        url={`https://kissinskin.net${basePath}/${t.slug}/`}
        shareText={`나의 향수 타입은 "${t.koName}" ${t.emoji}\n${t.tagline}\n\n`}
        shareTitle={`향수 타입: ${t.koName}`}
        retakeUrl={`${basePath}/`}
      />

      {/* All types */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-8 tracking-tight leading-tight">
            6가지 향수 타입 전체 보기
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PERFUME_TYPE_ORDER.map(c => {
              const s = PERFUME_TYPES[c]
              const isMe = s.code === t.code
              return (
                <a key={c} href={`${basePath}/${s.slug}/`} className={`rounded-2xl p-5 border transition-all ${isMe ? 'ring-2' : 'hover:shadow-md'}`} style={{ background: isMe ? `${s.primaryColor}10` : 'white', borderColor: `${s.primaryColor}30` }}>
                  <div className="text-3xl mb-1.5">{s.emoji}</div>
                  <div className="text-[0.65rem] mb-0.5" style={{ color: s.primaryColor }}>{isMe ? '나의 결과' : ''}</div>
                  <div className="text-sm font-bold text-navy-mid">{s.koName}</div>
                  <div className="text-[0.65rem] text-slate-400 mt-0.5">{s.enName}</div>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      </main>
      <ToolsFooter />
    </div>
  )
}
