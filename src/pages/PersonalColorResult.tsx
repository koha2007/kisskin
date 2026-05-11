import { PERSONAL_COLOR_TYPES, SEASON_ORDER, type SeasonCode } from '../lib/personal-color/types'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { PC_RECOMMENDATIONS } from '../lib/recommendations/personal-color'
import RecommendedProducts from '../components/RecommendedProducts'
import ToolFaq, { PERSONAL_COLOR_FAQ_BASE, PERSONAL_COLOR_FAQ_BASE_EN } from '../components/ToolFaq'
import ShareBar from '../components/ShareBar'
import RelatedTools from '../components/RelatedTools'
import { useI18n } from '../i18n/I18nContext'

interface Props { code: SeasonCode }

export default function PersonalColorResult({ code }: Props) {
  const t = PERSONAL_COLOR_TYPES[code]
  const { t: i18n, locale } = useI18n()
  const isEn = locale === 'en'

  const name = isEn ? t.enName : t.koName
  const tagline = isEn && t.taglineEn ? t.taglineEn : t.tagline
  const keywords = isEn && t.keywordsEn ? t.keywordsEn : t.keywords
  const traits = isEn && t.traitsEn ? t.traitsEn : t.traits
  const bestColors = isEn && t.bestColorsEn ? t.bestColorsEn : t.bestColors
  const avoidColors = isEn && t.avoidColorsEn ? t.avoidColorsEn : t.avoidColors
  const detailParagraphs = isEn && t.detailParagraphsEn ? t.detailParagraphsEn : t.detailParagraphs
  const shoppingTips = isEn && t.shoppingTipsEn ? t.shoppingTipsEn : t.shoppingTips
  const kissinskinReason = isEn && t.kissinskinReasonEn ? t.kissinskinReasonEn : t.kissinskinStyles.reason
  const basePath = isEn ? '/en/tools/personal-color' : '/tools/personal-color'

  const traitLabels = isEn
    ? { skin: 'Skin', hair: 'Hair', eye: 'Eyes', vibe: 'Vibe' }
    : { skin: '피부', hair: '모발', eye: '눈동자', vibe: '인상' }

  const colorLabels = isEn
    ? { base: 'Base', lip: 'Lip', eye: 'Eye', blush: 'Blush', accessory: 'Accessory', hair: 'Hair' }
    : { base: '베이스', lip: '립', eye: '아이', blush: '블러쉬', accessory: '액세서리', hair: '헤어' }

  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />

      <main>

      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden" style={{ background: `linear-gradient(135deg, ${t.primaryColor}10 0%, ${t.accentColor}18 100%)` }}>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-6xl md:text-7xl mb-3">{t.emoji}</div>
          <p className="font-mono text-xs md:text-sm tracking-[0.3em] text-slate-500 mb-2">{t.enName.toUpperCase()}</p>
          <h1 className="font-serif text-4xl md:text-6xl font-semibold text-navy tracking-tight mb-3 leading-[1.05]">{name}</h1>
          <p className="text-base md:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">{tagline}</p>
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {keywords.map(k => (
              <span key={k} className="px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-bold text-slate-700 border" style={{ borderColor: `${t.primaryColor}40` }}>#{k}</span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <a href={`${basePath}/`} className="bg-white border-2 border-amber-100 hover:border-amber-500 px-6 py-3 rounded-full font-bold text-sm md:text-base text-navy-mid flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">refresh</span> {i18n('tools.common.retakeDiagnosis')}
            </a>
            <a href={isEn ? '/en/' : '/analysis'} className="text-white px-6 py-3 rounded-full font-bold text-sm md:text-base shadow-lg flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, ${t.primaryColor}, ${t.accentColor})` }}>
              <span className="material-symbols-outlined">auto_awesome</span> {i18n('tools.common.applyToMyFace')}
            </a>
          </div>
        </div>
      </section>

      {/* Traits */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-8 tracking-tight leading-tight">
            {isEn ? 'Body coloring of this season' : '이 시즌의 신체 특징'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: 'face', label: traitLabels.skin, v: traits.skin },
              { icon: 'cut', label: traitLabels.hair, v: traits.hair },
              { icon: 'visibility', label: traitLabels.eye, v: traits.eye },
              { icon: 'mood', label: traitLabels.vibe, v: traits.vibe },
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

      {/* Summary */}
      <section className="py-8 md:py-10 bg-gradient-to-b from-background-light to-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-slate-600 leading-relaxed text-[15px] md:text-base text-center">
            {detailParagraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      {/* Best / Avoid Colors */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-8 tracking-tight leading-tight">
            {isEn ? 'Best colors · Colors to avoid' : '어울리는 색 · 피해야 할 색'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl p-6 border-2" style={{ borderColor: `${t.primaryColor}40`, background: `${t.primaryColor}08` }}>
              <h3 className="font-extrabold text-navy-mid mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ color: t.primaryColor }}>check_circle</span>
                {isEn ? 'Best colors' : '어울리는 컬러'}
              </h3>
              <div className="flex flex-wrap gap-2 mb-5">
                {bestColors.clothing.map(c => (
                  <span key={c} className="px-3 py-1 bg-white rounded-full text-xs font-bold text-slate-700 border" style={{ borderColor: `${t.primaryColor}30` }}>{c}</span>
                ))}
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><strong className="text-navy-mid">{colorLabels.base}:</strong> {bestColors.makeup.foundation}</li>
                <li><strong className="text-navy-mid">{colorLabels.lip}:</strong> {bestColors.makeup.lip}</li>
                <li><strong className="text-navy-mid">{colorLabels.eye}:</strong> {bestColors.makeup.eye}</li>
                <li><strong className="text-navy-mid">{colorLabels.blush}:</strong> {bestColors.makeup.blush}</li>
                <li><strong className="text-navy-mid">{colorLabels.accessory}:</strong> {bestColors.accessory}</li>
                <li><strong className="text-navy-mid">{colorLabels.hair}:</strong> {bestColors.hair}</li>
              </ul>
            </div>
            <div className="rounded-3xl p-6 border-2 border-slate-200 bg-slate-50/60">
              <h3 className="font-extrabold text-navy-mid mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">do_not_disturb_on</span>
                {isEn ? 'Colors to avoid' : '피해야 할 컬러'}
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {avoidColors.map(c => (
                  <span key={c} className="px-3 py-1 bg-white rounded-full text-xs font-bold text-slate-500 border border-slate-200 line-through">{c}</span>
                ))}
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {isEn
                  ? `These colors can make a ${name} face look dull or off. Avoid them deliberately in clothing, makeup, and accessories.`
                  : `위 컬러들은 ${name}의 얼굴을 칙칙하거나 부자연스럽게 보이게 할 수 있습니다. 의류·메이크업·액세서리 모두에서 의식적으로 피하는 것이 좋습니다.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shopping Tips */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-background-light to-pink-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-8 tracking-tight leading-tight">
            {isEn ? `${shoppingTips.length} practical shopping tips` : `실전 쇼핑 팁 ${shoppingTips.length}가지`}
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {shoppingTips.map((tip, i) => (
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
        subtitle={
          isEn
            ? `Product categories that match ${name}. Key features to check and reference brands when shopping.`
            : `${name}에게 어울리는 제품 카테고리입니다. 쇼핑 시 꼭 확인할 특징과 참고 브랜드를 정리했습니다.`
        }
      />

      {/* kissinskin crossell */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 text-primary-dark text-sm font-bold uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100 mb-4">
            <span className="material-symbols-outlined text-base">recommend</span>
            {isEn ? 'Recommended K-Beauty look' : '추천 K-뷰티 스타일'}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-navy tracking-tight mb-3 leading-tight">
            {isEn ? `The kissinskin look for ${name}` : `${name}에게 어울리는 kissinskin 룩`}
          </h2>
          <p className="text-slate-500 text-sm md:text-base mb-8">{kissinskinReason}</p>
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
          <a href={isEn ? '/en/' : '/analysis'} className="mt-8 bg-gradient-to-r from-primary to-pink-500 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl shadow-primary/25 inline-flex items-center gap-2">
            {i18n('tools.common.aiSimulation')}
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </div>
      </section>

      {/* FAQ */}
      <ToolFaq
        title={isEn ? `FAQ — ${name}` : `${name} FAQ`}
        items={isEn ? PERSONAL_COLOR_FAQ_BASE_EN : PERSONAL_COLOR_FAQ_BASE}
        accentColor={t.primaryColor}
      />

      {/* Related tools — drive cross-tool retention */}
      <RelatedTools exclude="personal-color" />

      {/* Share */}
      <ShareBar
        url={`https://kissinskin.net${basePath}/${t.slug}/`}
        shareText={
          isEn
            ? `My personal color is "${t.enName}" ${t.emoji}\n${t.taglineEn ?? t.tagline}\n\n`
            : `나의 퍼스널 컬러는 "${t.koName}" ${t.emoji}\n${t.tagline}\n\n`
        }
        shareTitle={isEn ? `Personal Color: ${t.enName}` : `퍼스널 컬러: ${t.koName}`}
        retakeUrl={`${basePath}/`}
      />

      {/* Other seasons */}
      <section className="py-14 bg-gradient-to-b from-white to-background-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-8 tracking-tight leading-tight">
            {isEn ? 'Browse all four seasons' : '4가지 시즌 전체 보기'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SEASON_ORDER.map(c => {
              const s = PERSONAL_COLOR_TYPES[c]
              const isMe = s.code === t.code
              const tone = isEn && s.toneEn ? s.toneEn : s.tone
              return (
                <a key={c} href={`${basePath}/${s.slug}/`} className={`rounded-2xl p-5 border transition-all ${isMe ? 'ring-2' : 'hover:shadow-md'}`} style={{ background: isMe ? `${s.primaryColor}10` : 'white', borderColor: `${s.primaryColor}30` }}>
                  <div className="text-3xl mb-1.5">{s.emoji}</div>
                  <div className="text-[0.65rem] font-mono mb-0.5" style={{ color: s.primaryColor }}>{tone}{isMe ? ` · ${i18n('tools.common.me')}` : ''}</div>
                  <div className="text-sm font-bold text-navy-mid">{isEn ? s.enName : s.koName}</div>
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
