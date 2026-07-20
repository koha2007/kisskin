import { FACE_SHAPE_TYPES, FACE_SHAPE_ORDER, type FaceShapeCode } from '../lib/face-shape/types'
import { FACE_SHAPE_MOOD } from '../lib/face-shape/moodImages'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { FS_RECOMMENDATIONS } from '../lib/recommendations/face-shape'
import { AFFILIATE_ENABLED } from '../lib/recommendations/types'
import RegionToggle from '../components/RegionToggle'
import { useRegion } from '../hooks/useRegion'
import ToolFaq, { FACE_SHAPE_FAQ_BASE, FACE_SHAPE_FAQ_BASE_EN } from '../components/ToolFaq'
import ShareBar from '../components/ShareBar'
import IdentityCard from '../components/IdentityCard'
import RelatedTools from '../components/RelatedTools'
import ResultGrid, {
  MoodCard,
  IconCard,
  AccordionCard,
  BannerCard,
} from '../components/result-grid/ResultGrid'
import { ProductGridCard } from '../components/result-grid/ProductGridCard'
import { useI18n } from '../i18n/I18nContext'

interface Props { code: FaceShapeCode }

export default function FaceShapeResult({ code }: Props) {
  const t = FACE_SHAPE_TYPES[code]
  const mood = FACE_SHAPE_MOOD[code]
  const { t: i18n, locale } = useI18n()
  const [region] = useRegion()
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

  const accent = t.primaryColor
  // Rotate the type's two signature colors as soft card tints so the grid reads
  // as a moodboard rather than a wall of identical white cards (재설계 지시 §3).
  const tints = [t.primaryColor, t.accentColor, t.card.gradient[1]]
  const tint = (i: number) => tints[i % tints.length]

  // 제품 카드가 그리드 맨 뒤라 2단 masonry 바닥에 깔렸다(affiliate_click 28일 0건).
  // 대표 1장만 상단으로 올리고 나머지는 원래 자리에 둔다.
  const recs = FS_RECOMMENDATIONS[t.code] ?? []
  const [leadRec, ...restRecs] = recs

  const L = isEn
    ? {
        feature: 'Core feature', contour: 'Contouring', style: 'Styling', avoid: 'Style to avoid',
        look: 'Recommended look', more: 'Read the full analysis', allShapes: 'Browse all five shapes', me: 'You',
        retake: 'Retake', save: 'Save image', female: i18n('tools.common.female'), male: i18n('tools.common.male'),
        bannerTitle: 'See your look on your own face', bannerDesc: 'Try AI makeup on your selfie — your face stays exactly the same.',
        bannerCta: 'Try AI makeup',
        forehead: 'Forehead', cheekbone: 'Cheekbones', jawline: 'Jawline', highlighter: 'Highlight',
        brow: 'Brow', lip: 'Lip', blush: 'Blush', hair: 'Hair', glasses: 'Glasses',
      }
    : {
        feature: '핵심 특징', contour: '컨투어링', style: '스타일링', avoid: '피해야 할 스타일',
        look: '추천 룩', more: '더 알아보기 (상세 분석)', allShapes: '5가지 얼굴형 전체 보기', me: '나',
        retake: '다시 진단', save: '이미지 저장하기', female: i18n('tools.common.female'), male: i18n('tools.common.male'),
        bannerTitle: '이 룩, 내 얼굴에 직접', bannerDesc: 'AI로 어울리는 메이크업을 내 셀카에 입혀보세요. 얼굴은 그대로예요.',
        bannerCta: 'AI 메이크업 체험',
        forehead: '이마', cheekbone: '광대', jawline: '턱 라인', highlighter: '하이라이터',
        brow: '눈썹', lip: '립', blush: '블러쉬', hair: '헤어', glasses: '안경',
      }

  const featureIcons = ['face', 'star', 'auto_awesome', 'verified', 'bolt']

  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />

      <main>
        {/* Hero — slim: identity card + save (재설계 지시 §2 상단) */}
        <section className="relative pt-12 pb-8 md:pt-16 md:pb-10 overflow-hidden" style={{ background: `linear-gradient(135deg, ${t.primaryColor}10 0%, ${t.accentColor}18 100%)` }}>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="font-mono text-xs md:text-sm tracking-[0.3em] text-slate-500 mb-2">{t.enName.toUpperCase()}</p>
            <h1 className="font-serif text-3xl md:text-5xl font-semibold text-navy tracking-tight mb-3 leading-[1.05]">{name}</h1>
            <p className="text-base md:text-lg text-slate-700 max-w-xl mx-auto leading-relaxed font-medium mb-5">{tagline}</p>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {t.card.hashtags.map(k => (
                <span key={k} className="px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-bold text-slate-700 border" style={{ borderColor: `${t.primaryColor}40` }}>{k}</span>
              ))}
            </div>
            {!isEn && (
              <IdentityCard label="얼굴형" emoji={t.emoji} card={t.card} fileSlug={`face-shape-${t.code}`} saveLabel={L.save} />
            )}
            <div className="mt-7">
              <a href={`${basePath}/`} className="inline-flex items-center gap-2 bg-white border-2 border-amber-100 hover:border-amber-500 px-6 py-2.5 rounded-full font-bold text-sm text-navy-mid">
                <span className="material-symbols-outlined text-lg">refresh</span> {L.retake}
              </a>
            </div>
          </div>
        </section>

        {/* Masonry grid — 산문을 카드 1개=정보 1조각으로 분해 (재설계 지시 §3) */}
        <section className="py-8 md:py-12">
          <div className="max-w-5xl mx-auto px-3 sm:px-6">
            {AFFILIATE_ENABLED && <RegionToggle pageType="face_shape" className="mb-7" />}
            <ResultGrid>
              <MoodCard image={mood.image} caption={tagline} emoji={t.emoji} gradient={t.card.gradient} />

              {features.map((f, i) => (
                <IconCard key={`feat-${i}`} icon={featureIcons[i % featureIcons.length]} label={L.feature} text={f} accent={accent} tint={tint(i)} />
              ))}

              {leadRec && (
                <ProductGridCard item={leadRec} accent={accent} pageType="face_shape" pageSlug={t.code} />
              )}

              <IconCard icon="grid_3x3" label={`${L.contour} · ${L.forehead}`} text={contouring.forehead} accent={accent} tint={tint(0)} />
              <IconCard icon="face" label={`${L.contour} · ${L.cheekbone}`} text={contouring.cheekbone} accent={accent} tint={tint(1)} />
              <IconCard icon="call_to_action" label={`${L.contour} · ${L.jawline}`} text={contouring.jawline} accent={accent} tint={tint(2)} />
              <IconCard icon="auto_awesome" label={`${L.contour} · ${L.highlighter}`} text={contouring.highlighter} accent={accent} tint={tint(3)} />

              <IconCard icon="visibility" label={`${L.style} · ${L.brow}`} text={recommendedStyle.brow} accent={accent} tint={tint(1)} />
              <IconCard icon="favorite" label={`${L.style} · ${L.lip}`} text={recommendedStyle.lip} accent={accent} tint={tint(2)} />
              <IconCard icon="spa" label={`${L.style} · ${L.blush}`} text={recommendedStyle.blush} accent={accent} tint={tint(3)} />
              <IconCard icon="content_cut" label={`${L.style} · ${L.hair}`} text={recommendedStyle.hair} accent={accent} tint={tint(4)} />
              <IconCard icon="eyeglasses" label={`${L.style} · ${L.glasses}`} text={recommendedStyle.glasses} accent={accent} tint={tint(0)} />

              {avoidStyle.map((a, i) => (
                <IconCard key={`avoid-${i}`} icon="do_not_disturb_on" label={L.avoid} text={a} accent={accent} tint={tint(i + 2)} />
              ))}

              <IconCard icon="female" label={`${L.look} · ${L.female}`} text={t.kissinskin.women} accent={accent} tint={tint(0)} />
              <IconCard icon="male" label={`${L.look} · ${L.male}`} text={t.kissinskin.men} accent={accent} tint={tint(1)} />
              <IconCard icon="recommend" label={L.look} text={kissinskinReason} accent={accent} tint={tint(2)} />

              {restRecs.map((item, i) => (
                <ProductGridCard key={`prod-${i}`} item={item} accent={accent} pageType="face_shape" pageSlug={t.code} />
              ))}

              <AccordionCard title={L.more} paragraphs={detailParagraphs} accent={accent} />

              <BannerCard
                title={L.bannerTitle}
                desc={L.bannerDesc}
                ctaLabel={L.bannerCta}
                href={isEn ? '/en/' : '/analysis/'}
                gradient={t.card.gradient}
              />
            </ResultGrid>
            {AFFILIATE_ENABLED && (
              <p className="mt-7 text-center text-[11px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {i18n(region === 'global' ? 'recProducts.disclosureGlobal' : 'recProducts.disclosure')}
              </p>
            )}
          </div>
        </section>

        {/* FAQ — SEO 보존 */}
        <ToolFaq
          title={isEn ? `FAQ — ${name} faces` : `${name} 얼굴형 FAQ`}
          items={isEn ? FACE_SHAPE_FAQ_BASE_EN : FACE_SHAPE_FAQ_BASE}
          accentColor={t.primaryColor}
        />

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

        {/* Cross-promo — 다른 진단 3종 */}
        <RelatedTools exclude="face-shape" />

        {/* Other shapes */}
        <section className="py-14 bg-gradient-to-b from-white to-background-light">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-8 tracking-tight leading-tight">
              {L.allShapes}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {FACE_SHAPE_ORDER.map(c => {
                const s = FACE_SHAPE_TYPES[c]
                const isMe = s.code === t.code
                return (
                  <a key={c} href={`${basePath}/${s.slug}/`} className={`rounded-2xl p-5 border transition-all ${isMe ? 'ring-2' : 'hover:shadow-md'}`} style={{ background: isMe ? `${s.primaryColor}10` : 'white', borderColor: `${s.primaryColor}30` }}>
                    <div className="text-3xl mb-1.5">{s.emoji}</div>
                    <div className="text-[0.65rem] mb-0.5" style={{ color: s.primaryColor }}>{isMe ? L.me : ''}</div>
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
