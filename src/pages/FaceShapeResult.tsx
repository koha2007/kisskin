import { FACE_SHAPE_TYPES, FACE_SHAPE_ORDER, type FaceShapeCode } from '../lib/face-shape/types'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { FS_RECOMMENDATIONS } from '../lib/recommendations/face-shape'
import RecommendedProducts from '../components/RecommendedProducts'
import ToolFaq, { FACE_SHAPE_FAQ_BASE, FACE_SHAPE_FAQ_BASE_EN } from '../components/ToolFaq'
import ShareBar from '../components/ShareBar'
import RelatedTools from '../components/RelatedTools'
import { useI18n } from '../i18n/I18nContext'

interface Props { code: FaceShapeCode }

export default function FaceShapeResult({ code }: Props) {
  const t = FACE_SHAPE_TYPES[code]
  const { t: i18n, locale } = useI18n()
  const isEn = locale === 'en'

  const name = isEn ? t.enName : t.koName
  const tagline = isEn && t.taglineEn ? t.taglineEn : t.tagline
  const features = isEn && t.featuresEn ? t.featuresEn : t.features
  const detailParagraphs = isEn && t.detailParagraphsEn ? t.detailParagraphsEn : t.detailParagraphs
  const contouring = isEn && t.contouringEn ? t.contouringEn : t.contouring
  const recommendedStyle = isEn && t.recommendedStyleEn ? t.recommendedStyleEn : t.recommendedStyle
  const avoidStyle = isEn && t.avoidStyleEn ? t.avoidStyleEn : t.avoidStyle
  const kissinskinReason = isEn && t.kissinskinReasonEn ? t.kissinskinReasonEn : t.kissinskin.reason
  const basePath = isEn ? '/en/tools/face-shape' : '/tools/face-shape'

  const contourLabels = isEn
    ? { forehead: 'Forehead', cheekbone: 'Cheekbones', jawline: 'Jawline', highlighter: 'Highlight' }
    : { forehead: '이마', cheekbone: '광대', jawline: '턱 라인', highlighter: '하이라이터' }
  const styleLabels = isEn
    ? { brow: 'Brow', lip: 'Lip', blush: 'Blush', hair: 'Hair', glasses: 'Glasses' }
    : { brow: '눈썹', lip: '립', blush: '블러쉬', hair: '헤어', glasses: '안경' }

  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />
      <main>

      <section className="relative py-16 md:py-24 overflow-hidden" style={{ background: `linear-gradient(135deg, ${t.primaryColor}10 0%, ${t.accentColor}18 100%)` }}>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-6xl md:text-7xl mb-3">{t.emoji}</div>
          <p className="font-mono text-xs md:text-sm tracking-[0.3em] text-slate-500 mb-2">{t.enName.toUpperCase()}</p>
          <h1 className="font-serif text-4xl md:text-6xl font-semibold text-navy tracking-tight mb-3 leading-[1.05]">{name}</h1>
          <p className="text-base md:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">{tagline}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <a href={`${basePath}/`} className="bg-white border-2 border-emerald-100 hover:border-emerald-500 px-6 py-3 rounded-full font-bold text-sm md:text-base text-navy-mid flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">refresh</span> {i18n('tools.common.retakeDiagnosis')}
            </a>
            <a href={isEn ? '/en/' : '/analysis'} className="text-white px-6 py-3 rounded-full font-bold text-sm md:text-base shadow-lg flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, ${t.primaryColor}, ${t.accentColor})` }}>
              <span className="material-symbols-outlined">auto_awesome</span> {i18n('tools.common.applyToMyFace')}
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-8 tracking-tight leading-tight">
            {isEn ? `Core features of ${name.toLowerCase()}` : `${name}의 핵심 특징`}
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border flex gap-4" style={{ borderColor: `${t.primaryColor}30` }}>
                <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm" style={{ background: t.primaryColor }}>{i + 1}</div>
                <p className="text-sm text-slate-600 leading-relaxed pt-0.5">{f}</p>
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

      {/* Contouring Map */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-3 tracking-tight leading-tight">
            {isEn ? 'Tailored contouring guide' : '맞춤 컨투어링 가이드'}
          </h2>
          <p className="text-center text-slate-500 text-sm mb-8">
            {isEn ? `Shadow and highlight placement optimized for ${name.toLowerCase()} faces` : `${name}에 최적화된 쉐이딩·하이라이터 배치`}
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { icon: 'grid_3x3', label: contourLabels.forehead, v: contouring.forehead },
              { icon: 'face', label: contourLabels.cheekbone, v: contouring.cheekbone },
              { icon: 'call_to_action', label: contourLabels.jawline, v: contouring.jawline },
              { icon: 'auto_awesome', label: contourLabels.highlighter, v: contouring.highlighter },
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

      {/* Style Recommendations */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-background-light to-pink-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-8 tracking-tight leading-tight">
            {isEn ? 'Styling guide' : '스타일링 가이드'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: 'visibility', label: styleLabels.brow, v: recommendedStyle.brow },
              { icon: 'favorite', label: styleLabels.lip, v: recommendedStyle.lip },
              { icon: 'spa', label: styleLabels.blush, v: recommendedStyle.blush },
              { icon: 'cut', label: styleLabels.hair, v: recommendedStyle.hair },
              { icon: 'visibility_lock', label: styleLabels.glasses, v: recommendedStyle.glasses },
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

      {/* Avoid */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-amber-500 text-3xl">warning</span>
              <h2 className="text-xl font-extrabold text-navy tracking-tight">
                {isEn ? 'Styles to avoid' : '피해야 할 스타일'}
              </h2>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              {avoidStyle.map((a, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <RecommendedProducts
        items={FS_RECOMMENDATIONS[t.code]}
        accentColor={t.primaryColor}
        accentGradient="from-emerald-500 to-teal-500"
        headingEmoji="🛍️"
        subtitle={
          isEn
            ? `Recommended product categories for ${name.toLowerCase()} faces. Use these as a reference to complete tailored contouring and styling.`
            : `${name} 얼굴형에 추천하는 제품 카테고리입니다. 맞춤 컨투어와 스타일을 완성할 때 참고하세요.`
        }
        pageType="face_shape"
        pageSlug={t.code}
      />

      {/* kissinskin CTA */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-pink-50/40 via-white to-pink-50/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 text-primary-dark text-sm font-bold uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100 mb-4">
            <span className="material-symbols-outlined text-base">recommend</span>
            {isEn ? 'Recommended K-Beauty look' : '추천 K-뷰티 스타일'}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-navy tracking-tight mb-3 leading-tight">
            {isEn ? `The kissinskin look for ${name.toLowerCase()} faces` : `${name}에게 어울리는 kissinskin 룩`}
          </h2>
          <p className="text-slate-500 text-sm md:text-base mb-8">{kissinskinReason}</p>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-pink-50/50 rounded-2xl p-6 border border-pink-100">
              <span className="material-symbols-outlined text-primary text-3xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>female</span>
              <h3 className="font-extrabold text-navy-mid mb-1">{i18n('tools.common.female')}</h3>
              <p className="text-xl font-bold text-primary">{t.kissinskin.women}</p>
            </div>
            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
              <span className="material-symbols-outlined text-blue-500 text-3xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>male</span>
              <h3 className="font-extrabold text-navy-mid mb-1">{i18n('tools.common.male')}</h3>
              <p className="text-xl font-bold text-blue-500">{t.kissinskin.men}</p>
            </div>
          </div>
          <a href={isEn ? '/en/' : '/analysis'} className="bg-gradient-to-r from-primary to-pink-500 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl shadow-primary/25 inline-flex items-center gap-2">
            {i18n('tools.common.aiSimulation')}
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </div>
      </section>

      {/* FAQ */}
      <ToolFaq
        title={isEn ? `FAQ — ${name} faces` : `${name} 얼굴형 FAQ`}
        items={isEn ? FACE_SHAPE_FAQ_BASE_EN : FACE_SHAPE_FAQ_BASE}
        accentColor={t.primaryColor}
      />

      {/* Related tools — drive cross-tool retention */}
      <RelatedTools exclude="face-shape" />

      {/* Share */}
      <ShareBar
        url={`https://kissinskin.net${basePath}/${t.slug}/`}
        shareText={
          isEn
            ? `My face shape is "${t.enName}" ${t.emoji}\n${t.taglineEn ?? t.tagline}\n\n`
            : `나의 얼굴형은 "${t.koName}" ${t.emoji}\n${t.tagline}\n\n`
        }
        shareTitle={isEn ? `Face shape: ${t.enName}` : `얼굴형: ${t.koName}`}
        retakeUrl={`${basePath}/`}
      />

      {/* Other shapes */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-8 tracking-tight leading-tight">
            {isEn ? 'Browse all five shapes' : '5가지 얼굴형 전체 보기'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {FACE_SHAPE_ORDER.map(c => {
              const s = FACE_SHAPE_TYPES[c]
              const isMe = s.code === t.code
              return (
                <a key={c} href={`${basePath}/${s.slug}/`} className={`rounded-2xl p-5 border transition-all ${isMe ? 'ring-2' : 'hover:shadow-md'}`} style={{ background: isMe ? `${s.primaryColor}10` : 'white', borderColor: `${s.primaryColor}30` }}>
                  <div className="text-3xl mb-1.5">{s.emoji}</div>
                  <div className="text-[0.65rem] mb-0.5" style={{ color: s.primaryColor }}>{isMe ? i18n('tools.common.me') : ''}</div>
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
