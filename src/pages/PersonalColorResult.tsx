import { PERSONAL_COLOR_TYPES, SEASON_ORDER, type SeasonCode } from '../lib/personal-color/types'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { PC_RECOMMENDATIONS } from '../lib/recommendations/personal-color'
import RecommendedProducts from '../components/RecommendedProducts'
import ToolFaq, { PERSONAL_COLOR_FAQ_BASE } from '../components/ToolFaq'
import { useI18n } from '../i18n/I18nContext'

interface Props { code: SeasonCode }

export default function PersonalColorResult({ code }: Props) {
  const t = PERSONAL_COLOR_TYPES[code]
  const { t: i18n } = useI18n()

  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />

      <main>

      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden" style={{ background: `linear-gradient(135deg, ${t.primaryColor}10 0%, ${t.accentColor}18 100%)` }}>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-6xl md:text-7xl mb-3">{t.emoji}</div>
          <p className="font-mono text-xs md:text-sm tracking-[0.3em] text-slate-500 mb-2">{t.enName.toUpperCase()}</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy tracking-tight mb-3 leading-tight">{t.koName}</h1>
          <p className="text-base md:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">{t.tagline}</p>
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {t.keywords.map(k => (
              <span key={k} className="px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-bold text-slate-700 border" style={{ borderColor: `${t.primaryColor}40` }}>#{k}</span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <a href="/tools/personal-color/" className="bg-white border-2 border-amber-100 hover:border-amber-500 px-6 py-3 rounded-full font-bold text-sm md:text-base text-navy-mid flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">refresh</span> {i18n('tools.common.retakeDiagnosis')}
            </a>
            <a href="/analysis" className="text-white px-6 py-3 rounded-full font-bold text-sm md:text-base shadow-lg flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, ${t.primaryColor}, ${t.accentColor})` }}>
              <span className="material-symbols-outlined">auto_awesome</span> {i18n('tools.common.applyToMyFace')}
            </a>
          </div>
        </div>
      </section>

      {/* Traits */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl md:text-2xl font-extrabold text-navy text-center mb-8 tracking-tight">이 시즌의 신체 특징</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: 'face', label: '피부', v: t.traits.skin },
              { icon: 'cut', label: '모발', v: t.traits.hair },
              { icon: 'visibility', label: '눈동자', v: t.traits.eye },
              { icon: 'mood', label: '인상', v: t.traits.vibe },
            ].map(it => (
              <div key={it.label} className="bg-white border border-pink-100 rounded-2xl p-4 md:p-5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white mb-3" style={{ background: t.primaryColor }}>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{it.icon}</span>
                </div>
                <div className="text-[0.65rem] uppercase tracking-wider font-bold text-slate-400 mb-1">{it.label}</div>
                <p className="text-sm text-slate-600 leading-relaxed">{it.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detail SEO */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-background-light to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy text-center mb-3 tracking-tight">{t.koName} 상세 가이드</h2>
          <p className="text-center text-slate-500 text-sm mb-10">Carole Jackson의 4계절 시스템과 한국형 퍼스널 컬러 연구를 종합한 해석입니다.</p>
          <div className="prose max-w-none text-slate-600 leading-relaxed space-y-5 text-[15px] md:text-base">
            {t.detailParagraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      {/* Best / Avoid Colors */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl md:text-2xl font-extrabold text-navy text-center mb-8 tracking-tight">어울리는 색 · 피해야 할 색</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl p-6 border-2" style={{ borderColor: `${t.primaryColor}40`, background: `${t.primaryColor}08` }}>
              <h3 className="font-extrabold text-navy-mid mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ color: t.primaryColor }}>check_circle</span>
                어울리는 컬러
              </h3>
              <div className="flex flex-wrap gap-2 mb-5">
                {t.bestColors.clothing.map(c => (
                  <span key={c} className="px-3 py-1 bg-white rounded-full text-xs font-bold text-slate-700 border" style={{ borderColor: `${t.primaryColor}30` }}>{c}</span>
                ))}
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><strong className="text-navy-mid">베이스:</strong> {t.bestColors.makeup.foundation}</li>
                <li><strong className="text-navy-mid">립:</strong> {t.bestColors.makeup.lip}</li>
                <li><strong className="text-navy-mid">아이:</strong> {t.bestColors.makeup.eye}</li>
                <li><strong className="text-navy-mid">블러쉬:</strong> {t.bestColors.makeup.blush}</li>
                <li><strong className="text-navy-mid">액세서리:</strong> {t.bestColors.accessory}</li>
                <li><strong className="text-navy-mid">헤어:</strong> {t.bestColors.hair}</li>
              </ul>
            </div>
            <div className="rounded-3xl p-6 border-2 border-slate-200 bg-slate-50/60">
              <h3 className="font-extrabold text-navy-mid mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">do_not_disturb_on</span>
                피해야 할 컬러
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {t.avoidColors.map(c => (
                  <span key={c} className="px-3 py-1 bg-white rounded-full text-xs font-bold text-slate-500 border border-slate-200 line-through">{c}</span>
                ))}
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                위 컬러들은 {t.koName}의 얼굴을 칙칙하거나 부자연스럽게 보이게 할 수 있습니다. 의류·메이크업·액세서리 모두에서 의식적으로 피하는 것이 좋습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shopping Tips */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-background-light to-pink-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl md:text-2xl font-extrabold text-navy text-center mb-8 tracking-tight">실전 쇼핑 팁 {t.shoppingTips.length}가지</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {t.shoppingTips.map((tip, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-pink-100 flex gap-4">
                <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-extrabold text-sm" style={{ background: t.primaryColor }}>{i + 1}</div>
                <p className="text-sm text-slate-600 leading-relaxed pt-0.5">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <RecommendedProducts
        items={PC_RECOMMENDATIONS[t.code]}
        accentColor={t.primaryColor}
        accentGradient="from-amber-500 to-orange-500"
        headingEmoji="🛍️"
        subtitle={`${t.koName}에게 어울리는 제품 카테고리입니다. 쇼핑 시 꼭 확인할 특징과 참고 브랜드를 정리했습니다.`}
      />

      {/* kissinskin crossell */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 text-primary-dark text-sm font-bold uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100 mb-4">
            <span className="material-symbols-outlined text-base">recommend</span>
            추천 K-뷰티 스타일
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-3">
            {t.koName}에게 어울리는 kissinskin 룩
          </h2>
          <p className="text-slate-500 text-sm md:text-base mb-8">{t.kissinskinStyles.reason}</p>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-pink-50/50 rounded-2xl p-6 border border-pink-100">
              <span className="material-symbols-outlined text-primary text-3xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>female</span>
              <h3 className="font-extrabold text-navy-mid mb-1">{i18n('tools.common.female')}</h3>
              <p className="text-xl font-bold text-primary">{t.kissinskinStyles.women}</p>
            </div>
            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
              <span className="material-symbols-outlined text-blue-500 text-3xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>male</span>
              <h3 className="font-extrabold text-navy-mid mb-1">{i18n('tools.common.male')}</h3>
              <p className="text-xl font-bold text-blue-500">{t.kissinskinStyles.men}</p>
            </div>
          </div>
          <a href="/analysis" className="mt-8 bg-gradient-to-r from-primary to-pink-500 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl shadow-primary/25 inline-flex items-center gap-2">
            {i18n('tools.common.aiSimulation')}
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </div>
      </section>

      {/* In-depth context */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-amber-50/40 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl md:text-2xl font-extrabold text-navy text-center mb-8 tracking-tight">{t.koName}에 대해 더 알아두면 좋은 점</h2>
          <div className="prose prose-slate max-w-none text-slate-700 leading-[1.85] text-[15px] md:text-base space-y-5">
            <p>
              퍼스널 컬러는 1980년대 미국·일본을 거쳐 한국에서 대중화된 컬러 분석 시스템입니다.
              피부의 언더톤(웜·쿨)과 명도·채도 선호를 종합해 봄·여름·가을·겨울 4계절로 큰 분류를 만들고,
              그 안에서 라이트·딥·뮤트·비비드 등 세부 톤으로 다시 나눕니다.
              {t.koName}은 큰 4계절 분류 중 한 가지에 해당하며, 가장 어울리는 컬러군을 일러 줍니다.
            </p>
            <p>
              결과를 가장 정확하게 활용하는 방법은 <strong>"내 시즌 컬러를 매일 입는다"</strong>가 아니라
              <strong>"내 시즌 컬러를 얼굴 가까이에 둔다"</strong>입니다.
              상의·스카프·이너·립·블러쉬처럼 얼굴과 가까운 면적에 시즌 컬러를 두면 인상이 가장 또렷해지고,
              하의나 가방처럼 얼굴에서 먼 부분은 시즌과 무관하게 자유롭게 매치해도 무방합니다.
              이 원칙만 기억해도 옷장에 있는 옷을 그대로 두고도 인상을 크게 바꿀 수 있습니다.
            </p>
            <p>
              온라인 진단의 한계도 알아 두세요.
              조명·카메라·디스플레이의 색온도 차이로 사진 속 피부톤이 실제와 다르게 보일 수 있습니다.
              결과가 애매하다면 자연광 아래에서 흰색 천을 얼굴 가까이 대 보세요.
              피부가 누렇게 떠 보이면 웜톤, 푸르게 식어 보이면 쿨톤일 가능성이 높습니다.
              그래도 헷갈리면 인접 시즌(예: 봄웜·가을웜) 컬러군 모두를 시도해 보고
              사진을 찍어 비교하는 것이 가장 확실한 검증법입니다.
            </p>
            <p>
              메이크업에서는 <a href="/tools/makeup-mbti/" className="text-primary font-semibold hover:underline">메이크업 MBTI</a>의
              컬러 추천과 퍼스널 컬러를 함께 보면 더 정확합니다.
              메이크업 MBTI는 좋아하는 컬러군을, 퍼스널 컬러는 어울리는 컬러군을 알려 주기 때문에
              두 결과의 교집합이 자신만의 베스트 컬러가 됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <ToolFaq
        title={`${t.koName} FAQ`}
        items={PERSONAL_COLOR_FAQ_BASE}
        accentColor={t.primaryColor}
      />

      {/* Other seasons */}
      <section className="py-14 bg-gradient-to-b from-white to-background-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl md:text-2xl font-extrabold text-navy text-center mb-8 tracking-tight">4가지 시즌 전체 보기</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SEASON_ORDER.map(c => {
              const s = PERSONAL_COLOR_TYPES[c]
              const isMe = s.code === t.code
              return (
                <a key={c} href={`/tools/personal-color/${s.slug}/`} className={`rounded-2xl p-5 border transition-all ${isMe ? 'ring-2' : 'hover:shadow-md'}`} style={{ background: isMe ? `${s.primaryColor}10` : 'white', borderColor: `${s.primaryColor}30` }}>
                  <div className="text-3xl mb-1.5">{s.emoji}</div>
                  <div className="text-[0.65rem] font-mono mb-0.5" style={{ color: s.primaryColor }}>{s.tone}{isMe ? ' · 나' : ''}</div>
                  <div className="text-sm font-bold text-navy-mid">{s.koName}</div>
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
