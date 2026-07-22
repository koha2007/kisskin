import { PERFUME_TYPES, PERFUME_TYPE_ORDER, type PerfumeTypeCode } from '../lib/perfume-type/types'
import { PERFUME_MOOD } from '../lib/perfume-type/moodImages'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { PERFUME_TYPE_RECOMMENDATIONS } from '../lib/recommendations/perfume-type'
import { AFFILIATE_ENABLED } from '../lib/recommendations/types'
import RegionToggle from '../components/RegionToggle'
import { useRegion } from '../hooks/useRegion'
import ShareBar from '../components/ShareBar'
import IdentityCard from '../components/IdentityCard'
import RelatedTools from '../components/RelatedTools'
import ToolLongform from '../components/tools/ToolLongform'
import ResultGrid, {
  MoodCard,
  IconCard,
  BannerCard,
} from '../components/result-grid/ResultGrid'
import { ProductGridCard } from '../components/result-grid/ProductGridCard'
import { useI18n } from '../i18n/I18nContext'

interface Props { code: PerfumeTypeCode }

export default function PerfumeTypeResult({ code }: Props) {
  const t = PERFUME_TYPES[code]
  const mood = PERFUME_MOOD[code]
  const { t: i18n, locale } = useI18n()
  const [region] = useRegion()
  const isEn = locale === 'en'
  const basePath = isEn ? '/en/tools/perfume-type' : '/tools/perfume-type'

  const name = isEn ? t.enName : t.koName
  const tagline = isEn && t.taglineEn ? t.taglineEn : t.tagline
  const features = isEn && t.featuresEn ? t.featuresEn : t.features
  const detailParagraphs = isEn && t.detailParagraphsEn ? t.detailParagraphsEn : t.detailParagraphs
  const LF_EYEBROW = isEn ? 'Perfume Type · In depth' : '향수 타입 · 자세히'
  const scene = isEn && t.sceneEn ? t.sceneEn : t.scene
  const makeupMatch = isEn && t.makeupMatchEn ? t.makeupMatchEn : t.makeupMatch
  const cautions = isEn && t.cautionsEn ? t.cautionsEn : t.cautions
  const kissinskinReason = isEn && t.kissinskinReasonEn ? t.kissinskinReasonEn : t.kissinskin.reason

  const accent = t.primaryColor
  // Rotate the type's two signature colors as soft card tints so the grid reads
  // as a moodboard rather than a wall of identical white cards (재설계 지시 §3).
  const tints = [t.primaryColor, t.accentColor, t.card.gradient[1]]
  const tint = (i: number) => tints[i % tints.length]

  // 제품 카드가 그리드 맨 뒤라 2단 masonry 바닥에 깔렸다(affiliate_click 28일 0건).
  // 대표 1장만 상단으로 올리고 나머지는 원래 자리에 둔다.
  const recs = PERFUME_TYPE_RECOMMENDATIONS[t.code] ?? []
  const [leadRec, ...restRecs] = recs

  const L = isEn
    ? {
        feature: 'Key trait', scene: 'Scene', makeup: 'Makeup match', caution: 'Before you wear it',
        look: 'Recommended look', more: 'Read the full analysis', allTypes: 'Browse all 6 perfume types', me: 'Your result',
        retake: 'Retake the quiz', save: 'Save image', female: i18n('tools.common.female'), male: i18n('tools.common.male'),
        bannerTitle: 'See the matching look on your face', bannerDesc: 'Try AI makeup on your selfie — your face stays exactly the same.',
        bannerCta: 'Try AI makeup',
        season: 'Best season', occasion: 'Best occasions', time: 'Best time', avoid: 'Where to avoid',
        base: 'Base', lip: 'Lip', eye: 'Eye', cheek: 'Cheek',
      }
    : {
        feature: '핵심 특징', scene: '상황·계절', makeup: '메이크업 매치', caution: '주의할 점',
        look: '추천 룩', more: '더 알아보기 (상세 분석)', allTypes: '6가지 향수 타입 전체 보기', me: '나의 결과',
        retake: '다시 진단하기', save: '이미지 저장하기', female: i18n('tools.common.female'), male: i18n('tools.common.male'),
        bannerTitle: '어울리는 룩, 내 얼굴에 직접', bannerDesc: 'AI로 어울리는 메이크업을 내 셀카에 입혀보세요. 얼굴은 그대로예요.',
        bannerCta: 'AI 메이크업 체험',
        season: '베스트 계절', occasion: '추천 상황', time: '베스트 시간대', avoid: '피해야 할 자리',
        base: '베이스', lip: '립', eye: '아이', cheek: '치크',
      }

  const featureIcons = ['auto_awesome', 'star', 'favorite', 'spa', 'bolt']

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
              <IdentityCard
                label="향수 타입"
                emoji={t.emoji}
                card={t.card}
                fileSlug={`perfume-${t.code}`}
                saveLabel={L.save}
                share={{
                  url: `https://kissinskin.net${basePath}/${t.slug}/`,
                  text: isEn
                    ? `My perfume type is "${t.enName}" ${t.emoji}\n${tagline}\n\n`
                    : `나의 향수 타입은 "${t.koName}" ${t.emoji}\n${t.tagline}\n\n`,
                  title: isEn ? `Perfume type: ${t.enName}` : `향수 타입: ${t.koName}`,
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

        {/* 보조 무드보드 — 색·제품처럼 카드가 나은 정보만 남긴다 */}
        <section className="py-8 md:py-12">
          <div className="max-w-5xl mx-auto px-3 sm:px-6">
            {AFFILIATE_ENABLED && <RegionToggle pageType="perfume_type" className="mb-7" />}
            <ResultGrid>
              <MoodCard image={mood.image} caption={tagline} emoji={t.emoji} gradient={t.card.gradient} />

              {features.map((f, i) => (
                <IconCard key={`feat-${i}`} icon={featureIcons[i % featureIcons.length]} label={L.feature} text={f} accent={accent} tint={tint(i)} />
              ))}

              {leadRec && (
                <ProductGridCard item={leadRec} accent={accent} pageType="perfume_type" pageSlug={t.code} />
              )}

              <IconCard icon="calendar_month" label={`${L.scene} · ${L.season}`} text={scene.season} accent={accent} tint={tint(0)} />
              <IconCard icon="event" label={`${L.scene} · ${L.occasion}`} text={scene.occasion} accent={accent} tint={tint(1)} />
              <IconCard icon="schedule" label={`${L.scene} · ${L.time}`} text={scene.timeOfDay} accent={accent} tint={tint(2)} />
              <IconCard icon="block" label={`${L.scene} · ${L.avoid}`} text={scene.avoidSituation} accent={accent} tint={tint(3)} />

              <IconCard icon="palette" label={`${L.makeup} · ${L.base}`} text={makeupMatch.base} accent={accent} tint={tint(1)} />
              <IconCard icon="favorite" label={`${L.makeup} · ${L.lip}`} text={makeupMatch.lip} accent={accent} tint={tint(2)} />
              <IconCard icon="visibility" label={`${L.makeup} · ${L.eye}`} text={makeupMatch.eye} accent={accent} tint={tint(3)} />
              <IconCard icon="spa" label={`${L.makeup} · ${L.cheek}`} text={makeupMatch.cheek} accent={accent} tint={tint(4)} />

              {cautions.map((c, i) => (
                <IconCard key={`caution-${i}`} icon="do_not_disturb_on" label={L.caution} text={c} accent={accent} tint={tint(i + 2)} />
              ))}

              <IconCard icon="female" label={`${L.look} · ${L.female}`} text={t.kissinskin.women} accent={accent} tint={tint(0)} />
              <IconCard icon="male" label={`${L.look} · ${L.male}`} text={t.kissinskin.men} accent={accent} tint={tint(1)} />
              <IconCard icon="recommend" label={L.look} text={kissinskinReason} accent={accent} tint={tint(2)} />

              {restRecs.map((item, i) => (
                <ProductGridCard key={`prod-${i}`} item={item} accent={accent} pageType="perfume_type" pageSlug={t.code} />
              ))}


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

        {/* Share */}
        <ShareBar
          url={`https://kissinskin.net${basePath}/${t.slug}/`}
          shareText={
            isEn
              ? `My perfume type is "${t.enName}" ${t.emoji}\n${tagline}\n\n`
              : `나의 향수 타입은 "${t.koName}" ${t.emoji}\n${t.tagline}\n\n`
          }
          shareTitle={isEn ? `Perfume type: ${t.enName}` : `향수 타입: ${t.koName}`}
          retakeUrl={`${basePath}/`}
        />

        {/* Cross-promo — 다른 진단 3종 */}
        <RelatedTools exclude="perfume-type" titleKo="다른 무료 진단도 함께" titleEn="Try the other free quizzes too" />

        {/* Other types */}
        <section className="py-14 bg-gradient-to-b from-white to-background-light">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-8 tracking-tight leading-tight">
              {L.allTypes}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PERFUME_TYPE_ORDER.map(c => {
                const s = PERFUME_TYPES[c]
                const isMe = s.code === t.code
                return (
                  <a key={c} href={`${basePath}/${s.slug}/`} className={`rounded-2xl p-5 border transition-all ${isMe ? 'ring-2' : 'hover:shadow-md'}`} style={{ background: isMe ? `${s.primaryColor}10` : 'white', borderColor: `${s.primaryColor}30` }}>
                    <div className="text-3xl mb-1.5">{s.emoji}</div>
                    <div className="text-[0.65rem] mb-0.5" style={{ color: s.primaryColor }}>{isMe ? L.me : ''}</div>
                    <div className="text-sm font-bold text-navy-mid">{isEn ? s.enName : s.koName}</div>
                    {!isEn && <div className="text-[0.65rem] text-slate-400 mt-0.5">{s.enName}</div>}
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
