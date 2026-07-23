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
import { TypePreviewCard } from '../components/tools/ToolLanding'

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
  const LF_EYEBROW = isEn ? 'Face Shape · In depth' : '얼굴형 · 자세히'
  const contouring = isEn && t.contouringEn ? t.contouringEn : t.contouring
  const recommendedStyle = isEn && t.recommendedStyleEn ? t.recommendedStyleEn : t.recommendedStyle
  const avoidStyle = isEn && t.avoidStyleEn ? t.avoidStyleEn : t.avoidStyle
  const kissinskinReason = isEn && t.kissinskinReasonEn ? t.kissinskinReasonEn : t.kissinskin.reason
  const basePath = isEn ? '/en/tools/face-shape' : '/tools/face-shape'

  const accent = t.primaryColor

  // ④ 제품 카드는 얼굴형 코드 해시로 격자 안에 흩는다(결정적 분산).
  const recs = FS_RECOMMENDATIONS[t.code] ?? []

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

  // ⑤ 벤토 타일 — 컨투어링 4장·스타일 5장이 전부 따로 회색 박스였다. 각각 한 타일에 접는다.
  // 무드 사진은 바로 위 롱폼이 이미 본문 안에서 크게 쓰고 있어 여기서 다시 쓰지 않는다.
  const baseTiles = [
    <BentoFacts
      key="features"
      title={L.feature}
      accent={accent}
      span="full"
      rows={features.map((f, i) => ({ label: `0${i + 1}`, text: f }))}
    />,
    <BentoFacts
      key="contour"
      title={L.contour}
      accent={accent}
      rows={[
        { label: L.forehead, text: contouring.forehead },
        { label: L.cheekbone, text: contouring.cheekbone },
        { label: L.jawline, text: contouring.jawline },
        { label: L.highlighter, text: contouring.highlighter },
      ]}
    />,
    <BentoFacts
      key="style"
      title={L.style}
      accent={accent}
      rows={[
        { label: L.brow, text: recommendedStyle.brow },
        { label: L.lip, text: recommendedStyle.lip },
        { label: L.blush, text: recommendedStyle.blush },
        { label: L.hair, text: recommendedStyle.hair },
        { label: L.glasses, text: recommendedStyle.glasses },
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
    ...avoidStyle.map((a, i) => (
      <BentoNote key={`avoid-${i}`} icon="do_not_disturb_on" label={L.avoid} text={a} accent={accent} />
    )),
  ]

  const tiles = insertScattered(
    baseTiles,
    recs.map((item, i) => (
      <ProductGridCard
        key={`prod-${i}`}
        item={item}
        accent={accent}
        pageType="face_shape"
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
                label="얼굴형"
                emoji={t.emoji}
                card={t.card}
                fileSlug={`face-shape-${t.code}`}
                saveLabel={L.save}
                share={{
                  url: `https://kissinskin.net${basePath}/${t.slug}/`,
                  text: isEn
                    ? `My face shape is "${t.enName}" ${t.emoji}\n${t.taglineEn ?? t.tagline}\n\n`
                    : `나의 얼굴형은 "${t.koName}" ${t.emoji}\n${t.tagline}\n\n`,
                  title: isEn ? `Face shape: ${t.enName}` : `얼굴형: ${t.koName}`,
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

        {/* 결과 벤토 — 컨투어링·스타일은 한 타일 안 행으로 */}
        <section className="py-8 md:py-12">
          <div className="max-w-5xl mx-auto px-3 sm:px-6">
            {AFFILIATE_ENABLED && <RegionToggle pageType="face_shape" className="mb-7" />}
            <BentoGrid>
              {tiles}
              <BentoBanner
                title={L.bannerTitle}
                desc={L.bannerDesc}
                ctaLabel={L.bannerCta}
                href={isEn ? '/en/' : '/analysis/'}
                tool="face_shape"
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
                  <TypePreviewCard
                    key={c}
                    href={`${basePath}/${s.slug}/`}
                    emoji={s.emoji}
                    name={isEn ? s.enName : s.koName}
                    sub={isMe ? L.me : (isEn ? s.koName : s.enName)}
                    accent={s.primaryColor}
                    image={FACE_SHAPE_MOOD[c].image}
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
