import { PERSONAL_COLOR_TYPES, SEASON_ORDER, type SeasonCode } from '../lib/personal-color/types'
import { SEASON_MOOD } from '../lib/personal-color/moodImages'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { PC_RECOMMENDATIONS } from '../lib/recommendations/personal-color'
import { AFFILIATE_ENABLED } from '../lib/recommendations/types'
import RegionToggle from '../components/RegionToggle'
import { useRegion } from '../hooks/useRegion'
import ToolFaq, { PERSONAL_COLOR_FAQ_BASE, PERSONAL_COLOR_FAQ_BASE_EN } from '../components/ToolFaq'
import ShareBar from '../components/ShareBar'
import IdentityCard from '../components/IdentityCard'
import RelatedTools from '../components/RelatedTools'
import ResultGrid, {
  MoodCard,
  PaletteCard,
  IconCard,
  TipCard,
  ChipsCard,
  AccordionCard,
  BannerCard,
} from '../components/result-grid/ResultGrid'
import { ProductGridCard } from '../components/result-grid/ProductGridCard'
import { useI18n } from '../i18n/I18nContext'

interface Props { code: SeasonCode }

export default function PersonalColorResult({ code }: Props) {
  const t = PERSONAL_COLOR_TYPES[code]
  const mood = SEASON_MOOD[code]
  const { t: i18n, locale } = useI18n()
  const [region] = useRegion()
  const isEn = locale === 'en'

  const name = isEn ? t.enName : t.koName
  const tagline = isEn && t.taglineEn ? t.taglineEn : t.tagline
  const keywords = isEn && t.keywordsEn ? t.keywordsEn : t.keywords
  const traits = isEn && t.traitsEn ? t.traitsEn : t.traits
  const bestColors = isEn && t.bestColorsEn ? t.bestColorsEn : t.bestColors
  const avoidColors = isEn && t.avoidColorsEn ? t.avoidColorsEn : t.avoidColors
  const detailParagraphs = isEn && t.detailParagraphsEn ? t.detailParagraphsEn : t.detailParagraphs
  const shoppingTips = isEn && t.shoppingTipsEn ? t.shoppingTipsEn : t.shoppingTips
  const basePath = isEn ? '/en/tools/personal-color' : '/tools/personal-color'
  const accent = t.primaryColor
  // Rotate the season's signature swatches as soft card tints so the grid reads
  // as a moodboard (재설계 지시 §3). Falls back to accent if a swatch is missing.
  const pal = mood.palette.map(p => p.hex)
  const tint = (i: number) => pal[i % pal.length] ?? accent

  const L = isEn
    ? {
        palette: 'Signature palette', best: 'Best colors', avoid: 'Colors to avoid',
        makeup: 'Makeup match', traits: 'Your coloring', tips: 'Shopping tips',
        products: 'Recommended products', more: 'Read the full analysis',
        bannerTitle: 'See this look on your own face', bannerDesc: 'Try AI makeup on your selfie — your face stays exactly the same.',
        bannerCta: 'Try AI makeup', retake: 'Retake', save: 'Save image', allSeasons: 'Browse all four seasons', me: 'You',
        skin: 'Skin', hair: 'Hair', eye: 'Eyes', vibe: 'Vibe', base: 'Base', lip: 'Lip', eyeMk: 'Eye', blush: 'Blush', accessory: 'Accessory', hairColor: 'Hair color',
      }
    : {
        palette: '핵심 팔레트', best: '어울리는 컬러', avoid: '피해야 할 컬러',
        makeup: '메이크업 매치', traits: '나의 컬러링', tips: '쇼핑 팁',
        products: '추천 제품', more: '더 알아보기 (상세 분석)',
        bannerTitle: '이 룩, 내 얼굴에 직접', bannerDesc: 'AI로 어울리는 메이크업을 내 셀카에 입혀보세요. 얼굴은 그대로예요.',
        bannerCta: 'AI 메이크업 체험', retake: '다시 진단', save: '이미지 저장하기', allSeasons: '4가지 시즌 전체 보기', me: '나',
        skin: '피부', hair: '모발', eye: '눈동자', vibe: '인상', base: '베이스', lip: '립', eyeMk: '아이', blush: '블러쉬', accessory: '액세서리', hairColor: '헤어',
      }

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
              {keywords.map(k => (
                <span key={k} className="px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-bold text-slate-700 border" style={{ borderColor: `${t.primaryColor}40` }}>#{k}</span>
              ))}
            </div>
            {!isEn && (
              <IdentityCard label="퍼스널컬러" emoji={t.emoji} card={t.card} fileSlug={`personal-color-${t.code}`} saveLabel={L.save} />
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
            {/* 구매 지역 토글 — 쿠팡/클리오(한국) ↔ Amazon/YesStyle(글로벌) */}
            {AFFILIATE_ENABLED && <RegionToggle pageType="personal_color" className="mb-7" />}
            <ResultGrid>
              <MoodCard image={mood.image} caption={tagline} emoji={t.emoji} gradient={t.card.gradient} />

              <PaletteCard title={L.palette} swatches={mood.palette} accent={accent} />

              <IconCard icon="face" label={L.skin} text={traits.skin} accent={accent} tint={tint(0)} />
              <IconCard icon="favorite" label={`${L.makeup} · ${L.lip}`} text={bestColors.makeup.lip} accent={accent} tint={tint(3)} />
              <ChipsCard title={L.best} chips={bestColors.clothing} accent={accent} tint={tint(1)} />
              <IconCard icon="content_cut" label={L.hair} text={traits.hair} accent={accent} tint={tint(2)} />

              <IconCard icon="visibility" label={L.eye} text={traits.eye} accent={accent} tint={tint(4)} />
              <IconCard icon="palette" label={`${L.makeup} · ${L.base}`} text={bestColors.makeup.foundation} accent={accent} tint={tint(0)} />

              <ChipsCard title={L.avoid} chips={avoidColors} strike accent={accent} tint={tint(1)} />
              <IconCard icon="visibility" label={`${L.makeup} · ${L.eyeMk}`} text={bestColors.makeup.eye} accent={accent} tint={tint(2)} />
              <IconCard icon="mood" label={L.vibe} text={traits.vibe} accent={accent} tint={tint(3)} />

              <IconCard icon="spa" label={`${L.makeup} · ${L.blush}`} text={bestColors.makeup.blush} accent={accent} tint={tint(4)} />
              <IconCard icon="diamond" label={L.accessory} text={bestColors.accessory} accent={accent} tint={tint(0)} />
              <IconCard icon="brush" label={L.hairColor} text={bestColors.hair} accent={accent} tint={tint(1)} />

              {shoppingTips.map((tip, i) => (
                <TipCard key={`tip-${i}`} tip={tip} accent={accent} tint={tint(i + 2)} />
              ))}

              {(PC_RECOMMENDATIONS[t.code] ?? []).map((item, i) => (
                <ProductGridCard key={`prod-${i}`} item={item} accent={accent} pageType="personal_color" pageSlug={t.code} />
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
          title={isEn ? `FAQ — ${name}` : `${name} FAQ`}
          items={isEn ? PERSONAL_COLOR_FAQ_BASE_EN : PERSONAL_COLOR_FAQ_BASE}
          accentColor={t.primaryColor}
        />

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

        {/* Cross-promo — 다른 진단 3종 */}
        <RelatedTools exclude="personal-color" />

        {/* Other seasons */}
        <section className="py-14 bg-gradient-to-b from-white to-background-light">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-8 tracking-tight leading-tight">
              {L.allSeasons}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SEASON_ORDER.map(c => {
                const s = PERSONAL_COLOR_TYPES[c]
                const isMe = s.code === t.code
                const tone = isEn && s.toneEn ? s.toneEn : s.tone
                return (
                  <a key={c} href={`${basePath}/${s.slug}/`} className={`rounded-2xl p-5 border transition-all ${isMe ? 'ring-2' : 'hover:shadow-md'}`} style={{ background: isMe ? `${s.primaryColor}10` : 'white', borderColor: `${s.primaryColor}30` }}>
                    <div className="text-3xl mb-1.5">{s.emoji}</div>
                    <div className="text-[0.65rem] font-mono mb-0.5" style={{ color: s.primaryColor }}>{tone}{isMe ? ` · ${L.me}` : ''}</div>
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
