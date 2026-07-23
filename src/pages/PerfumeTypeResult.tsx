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
import BentoGrid, {
  BentoFacts,
  BentoNote,
  BentoBanner,
  insertScattered,
  scatterSlot,
} from '../components/result-grid/BentoGrid'
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

  // ④ 제품 카드는 향수 타입 코드 해시로 격자 안에 흩는다(결정적 분산).
  const recs = PERFUME_TYPE_RECOMMENDATIONS[t.code] ?? []

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

  // ⑤ 벤토 타일 — `상황 · 계절/장소/시간/피할곳`, `메이크업 · 베이스/립/아이/치크` 가
  // 각각 카드 4장이었다. 접두사가 같은 팩트는 한 타일 안의 행으로 접는다.
  // 무드 사진(정물)은 바로 위 롱폼이 이미 쓰고 있어 여기서 다시 쓰지 않는다.
  const baseTiles = [
    <BentoFacts
      key="features"
      title={L.feature}
      accent={accent}
      span="full"
      rows={features.map((f, i) => ({ label: `0${i + 1}`, text: f }))}
    />,
    <BentoFacts
      key="scene"
      title={L.scene}
      accent={accent}
      rows={[
        { label: L.season, text: scene.season },
        { label: L.occasion, text: scene.occasion },
        { label: L.time, text: scene.timeOfDay },
        { label: L.avoid, text: scene.avoidSituation },
      ]}
    />,
    <BentoFacts
      key="makeup"
      title={L.makeup}
      accent={accent}
      rows={[
        { label: L.base, text: makeupMatch.base },
        { label: L.lip, text: makeupMatch.lip },
        { label: L.eye, text: makeupMatch.eye },
        { label: L.cheek, text: makeupMatch.cheek },
      ]}
    />,
    <BentoFacts
      key="look"
      title={L.look}
      accent={accent}
      rows={[
        { label: L.female, text: t.kissinskin.women },
        { label: L.male, text: t.kissinskin.men },
      ]}
    />,
    <BentoNote key="reason" icon="recommend" label={L.look} text={kissinskinReason} accent={accent} />,
    ...cautions.map((c, i) => (
      <BentoNote key={`caution-${i}`} icon="do_not_disturb_on" label={L.caution} text={c} accent={accent} />
    )),
  ]

  const tiles = insertScattered(
    baseTiles,
    recs.map((item, i) => (
      <ProductGridCard
        key={`prod-${i}`}
        item={item}
        accent={accent}
        pageType="perfume_type"
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

        {/* 결과 벤토 — 상황·메이크업 매치는 한 타일 안 행으로 */}
        <section className="py-8 md:py-12">
          <div className="max-w-5xl mx-auto px-3 sm:px-6">
            {AFFILIATE_ENABLED && <RegionToggle pageType="perfume_type" className="mb-7" />}
            <BentoGrid>
              {tiles}
              <BentoBanner
                title={L.bannerTitle}
                desc={L.bannerDesc}
                ctaLabel={L.bannerCta}
                href={isEn ? '/en/' : '/analysis/'}
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
