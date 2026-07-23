import { PERSONAL_COLOR_TYPES, SEASON_ORDER, type SeasonCode } from '../lib/personal-color/types'
import { SEASON_MOOD } from '../lib/personal-color/moodImages'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { PC_RECOMMENDATIONS } from '../lib/recommendations/personal-color'
import { AFFILIATE_ENABLED } from '../lib/recommendations/types'
import RegionToggle from '../components/RegionToggle'
import { useRegion } from '../hooks/useRegion'
import ShareBar from '../components/ShareBar'
import IdentityCard from '../components/IdentityCard'
import RelatedTools from '../components/RelatedTools'
import ToolLongform from '../components/tools/ToolLongform'
import BentoGrid, {
  BentoPalette,
  BentoFacts,
  BentoNote,
  BentoChips,
  BentoBanner,
  insertScattered,
  scatterSlot,
} from '../components/result-grid/BentoGrid'
import { ProductGridCard } from '../components/result-grid/ProductGridCard'
import { useI18n } from '../i18n/I18nContext'
import { TypePreviewCard } from '../components/tools/ToolLanding'

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
  const LF_EYEBROW = isEn ? 'Personal Color · In depth' : '퍼스널 컬러 · 자세히'
  const shoppingTips = isEn && t.shoppingTipsEn ? t.shoppingTipsEn : t.shoppingTips
  const basePath = isEn ? '/en/tools/personal-color' : '/tools/personal-color'
  const accent = t.primaryColor

  // ④ 제품 카드는 시즌 코드 해시로 격자 안에 흩는다(결정적 분산).
  // 늘 마지막 자리라 20장 중 18번째였고 affiliate_click 이 28일간 0건이었다.
  const recs = PC_RECOMMENDATIONS[t.code] ?? []

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

  // ⑤ 벤토 타일 — 퍼스널컬러는 **색 자체가 진단 내용**이라 팔레트가 히어로다.
  // 무드 사진은 바로 위 롱폼이 이미 크게 쓰고 있어 여기서 또 쓰면 같은 사진이 두 번 나온다.
  // 예전엔 `메이크업 · 립/베이스/아이/블러쉬` 4장 + 컬러링 4장이 전부 따로 박스였다.
  const baseTiles = [
    <BentoPalette key="palette" title={L.palette} swatches={mood.palette} accent={accent} span="full" />,
    <BentoFacts
      key="coloring"
      title={L.traits}
      accent={accent}
      rows={[
        { label: L.skin, text: traits.skin },
        { label: L.eye, text: traits.eye },
        { label: L.hair, text: traits.hair },
        { label: L.vibe, text: traits.vibe },
      ]}
    />,
    <BentoFacts
      key="makeup"
      title={L.makeup}
      accent={accent}
      rows={[
        { label: L.lip, text: bestColors.makeup.lip },
        { label: L.base, text: bestColors.makeup.foundation },
        { label: L.eyeMk, text: bestColors.makeup.eye },
        { label: L.blush, text: bestColors.makeup.blush },
      ]}
    />,
    <BentoChips key="best" title={L.best} chips={bestColors.clothing} accent={accent} />,
    <BentoChips key="avoid" title={L.avoid} chips={avoidColors} strike accent={accent} />,
    <BentoFacts
      key="styling"
      accent={accent}
      rows={[
        { label: L.accessory, text: bestColors.accessory },
        { label: L.hairColor, text: bestColors.hair },
      ]}
    />,
    ...shoppingTips.map((tip, i) => (
      <BentoNote key={`tip-${i}`} icon="lightbulb" label={L.tips} text={tip} accent={accent} />
    )),
  ]

  const tiles = insertScattered(
    baseTiles,
    recs.map((item, i) => (
      <ProductGridCard
        key={`prod-${i}`}
        item={item}
        accent={accent}
        pageType="personal_color"
        pageSlug={t.code}
        span="sm"
        slot={scatterSlot(t.code, i, recs.length, baseTiles.length)}
      />
    )),
    t.code,
  )

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
              <IdentityCard
                label="퍼스널컬러"
                emoji={t.emoji}
                card={t.card}
                fileSlug={`personal-color-${t.code}`}
                saveLabel={L.save}
                share={{
                  url: `https://kissinskin.net${basePath}/${t.slug}/`,
                  text: isEn
                    ? `My personal color is "${t.enName}" ${t.emoji}\n${t.taglineEn ?? t.tagline}\n\n`
                    : `나의 퍼스널 컬러는 "${t.koName}" ${t.emoji}\n${t.tagline}\n\n`,
                  title: isEn ? `Personal Color: ${t.enName}` : `퍼스널 컬러: ${t.koName}`,
                }}
                shareLabel={isEn ? 'Share' : '공유하기'}
              />
            )}
            <div className="mt-7">
              <a href={`${basePath}/`} className="inline-flex items-center gap-2 bg-white border border-navy/25 hover:border-navy px-6 py-3 font-bold t-caption text-navy-mid transition-colors">
                <span className="material-symbols-outlined text-lg">refresh</span> {L.retake}
              </a>
            </div>
          </div>
        </section>

        {/* 유형별 롱폼 본문 — 아코디언 안 마소니 한 칸에 갇혀 있던 고유 콘텐츠를 꺼냈다.
            이 글이 각 유형을 다른 유형과 구별해 주는 유일한 자산인데, 접혀 있는 데다
            정보 한 조각 취급을 받아 유형 페이지들이 서로 85% 유사해졌었다(2026-07-14
            색인 이탈 62건). 16Personalities 처럼 긴 단일 컬럼으로 낸다. */}
        <ToolLongform
          eyebrow={LF_EYEBROW}
          title={L.more}
          paragraphs={detailParagraphs}
          image={mood.image}
          imageAlt={tagline}
        />

        {/* 결과 벤토 — 팔레트가 히어로, 한 줄 팩트는 한 타일에 묶어서 */}
        <section className="py-8 md:py-12">
          <div className="max-w-5xl mx-auto px-3 sm:px-6">
            {/* 구매 지역 토글 — 쿠팡/클리오(한국) ↔ Amazon/YesStyle(글로벌) */}
            {AFFILIATE_ENABLED && <RegionToggle pageType="personal_color" className="mb-7" />}
            <BentoGrid>
              {tiles}
              <BentoBanner
                title={L.bannerTitle}
                desc={L.bannerDesc}
                ctaLabel={L.bannerCta}
                href={isEn ? '/en/' : '/analysis/'}
                tool="personal_color"
                slug={t.code}
                gradient={t.card.gradient}
              />
            </BentoGrid>
            {AFFILIATE_ENABLED && (
              <p className="mt-7 text-center text-[11px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {i18n(region === 'global' ? 'recProducts.disclosureGlobal' : 'recProducts.disclosure')}
              </p>
            )}
          </div>
        </section>

        {/* FAQ — SEO 보존 */}
        {/* FAQ 는 **도구 랜딩에만** 둔다 (2026-07-23).
            같은 FAQ 5개가 유형 페이지 16장에 그대로 복제되면서 페이지 간 문장 중복률이
            54~67% 까지 올라갔고, 구글이 "사실상 같은 페이지"로 보고 유형별로 1~2개만
            색인했다(크롤링됨-색인 미생성 24건 중 15건이 도구 결과 페이지였다).
            FAQ 는 "이 도구가 뭔가"에 답하므로 진단 **전** 사용자를 위한 것이고,
            그 자리는 랜딩이다. 결과 페이지는 이미 진단을 받은 사람이 본다. */
        }

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
                  <TypePreviewCard
                    key={c}
                    href={`${basePath}/${s.slug}/`}
                    emoji={s.emoji}
                    name={isEn ? s.enName : s.koName}
                    sub={`${tone}${isMe ? ` · ${L.me}` : ''}`}
                    accent={s.primaryColor}
                    image={SEASON_MOOD[c].image}
                    current={isMe}
                    aspectClass="aspect-[4/5]"
                  />
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
