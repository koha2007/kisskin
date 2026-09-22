import { PERFUME_TYPES, PERFUME_TYPE_ORDER, type PerfumeTypeCode } from '../lib/perfume-type/types'
import { PERFUME_MOOD } from '../lib/perfume-type/moodImages'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { PERFUME_TYPE_RECOMMENDATIONS } from '../lib/recommendations/perfume-type'
import { AFFILIATE_ENABLED } from '../lib/recommendations/types'
import RegionToggle from '../components/RegionToggle'
import { useRegion } from '../hooks/useRegion'
import ShareBar from '../components/ShareBar'
import IdentityCard from '../components/IdentityCard'
import { localizeCard } from '../lib/identityCard/types'
import RelatedTools from '../components/RelatedTools'
import DnaTracker from '../components/beauty-dna/DnaTracker'
import { SaveToAccount } from '../components/beauty-dna/SaveToAccount'
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
import { EmailSubscribe } from '../components/EmailSubscribe'
import { readableInk } from '../lib/a11y/readableInk'

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

  // 카드 본문(닉네임·한 줄 문장·해시태그)을 로케일에 맞춰 한 번만 갈아끼운다.
  // 화면 미리보기와 저장되는 1080×1920 PNG 가 같은 객체를 읽으므로 자동으로 같이 맞는다.
  const card = localizeCard(t.card, isEn)

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
  // 2026-09-22: `핵심 특징` 타일을 여기서 뺐다 — 같은 목록이 히어로로 올라갔다.
  const baseTiles = [
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
        {/* Hero — 2026-09-22 재설계. 메이크업 MBTI 에 먼저 적용한 구조를 4종 전체에 맞춘다.
            전: 이름·해시태그·9:16 카드·다시진단을 한 줄로 세로로 쌓아 모바일 세로를 크게
                먹었고, 데스크톱에선 넓은 화면 한가운데 좁은 기둥 하나만 섰다.
            후: 데스크톱은 **왼쪽 정보 / 오른쪽 카드** 2단. 중복 CTA(다시 진단)를 걷어내고,
                "왜 내가 이 유형인가"의 근거(핵심 특징)를 이름 바로 아래로 끌어올렸다. */}
        <section className="relative pt-10 pb-8 md:pt-16 md:pb-12 overflow-hidden" style={{ background: `linear-gradient(135deg, ${t.primaryColor}10 0%, ${t.accentColor}18 100%)` }}>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center md:text-left md:grid md:grid-cols-[minmax(0,1fr)_300px] md:items-center md:gap-12">
            <div className="md:order-1">
              <p className="font-mono text-xs md:text-sm tracking-[0.3em] text-slate-500 mb-2">{t.enName.toUpperCase()}</p>
              <h1 className="font-serif text-4xl md:text-6xl font-semibold text-navy tracking-tight mb-3 leading-[1.02]">{name}</h1>
              <p className="text-base md:text-xl text-slate-700 max-w-xl mx-auto md:mx-0 leading-relaxed font-medium mb-5">{tagline}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-7">
                {card.hashtags.map(k => (
                  <span key={k} className="px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-bold text-slate-700 border" style={{ borderColor: `${t.primaryColor}40` }}>{k}</span>
                ))}
              </div>

              {/* 핵심 특징 — 벤토 첫 타일에 있던 걸 히어로로 끌어올렸다(2026-09-22).
                  이게 "왜 이 향수 타입인가"의 유일한 근거인데 롱폼과 구독 폼을 지나
                  한참 내려가야 나왔고, 2단으로 바꾼 왼쪽 칸이 비어 보였다.
                  벤토의 흰 패널 대신 번호 + 본문만 쓴다(히어로 위에 카드를 또 얹지 않는다). */}
              <ul className="mx-auto md:mx-0 max-w-sm space-y-2 mb-2 text-left">
                {features.map((f, i) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="font-mono t-label mt-0.5 shrink-0" style={{ color: readableInk(accent) }}>{`0${i + 1}`}</span>
                    <span className="text-sm md:text-base text-slate-700 leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:order-2 mt-7 md:mt-0">
            <IdentityCard
              label={isEn ? 'Perfume Type' : '향수 타입'}
              emoji={t.emoji}
              card={card}
              fileSlug={`perfume-${t.code}`}
              saveLabel={L.save}
              isEn={isEn}
              share={{
                url: `https://kissinskin.net${basePath}/${t.slug}/`,
                text: isEn
                  ? `My perfume type is "${t.enName}" ${t.emoji}\n${tagline}\n\n`
                  : `나의 향수 타입은 "${t.koName}" ${t.emoji}\n${t.tagline}\n\n`,
                title: isEn ? `Perfume type: ${t.enName}` : `향수 타입: ${t.koName}`,
              }}
              shareLabel={isEn ? 'Share' : '공유하기'}
            />
            {/* '다시 진단' 을 여기서 뺐다 — 아래 공유 섹션에 '다시 하기'가 이미 있어
                같은 동작을 한 페이지에서 두 번 권하고 있었다(2026-09-22). */}
            </div>
          </div>
        </section>

        {/* 다른 진단 2~3개 끝난 사람에게 "완성까지 N개" 넛지 — 히어로 바로 아래(2026-09-10) */}
        <DnaTracker field="perfume" code={code} />
        {/* 진단 직후 = 저장 의향이 가장 높은 자리. 무로그인 결과는 이 브라우저에만 남으므로
            "잃지 않으려면"이라는 납득되는 이유로만 로그인을 권한다(도구 자체는 계속 무로그인).
            로그인 상태거나 저장할 게 없으면 SaveToAccount 가 스스로 숨는다.
            ⚠ 여태 이 띠는 /tools/beauty-dna/ 에만 있었다. 4종을 다 끝내고 그 페이지까지
              가야 처음 나오니, 1개만 하고 떠나는 대다수에게선 아무것도 못 남겼다. */}
        <SaveToAccount />

        {/* 유형별 롱폼 본문 — 아코디언 안 마소니 한 칸에 갇혀 있던 고유 콘텐츠를 꺼냈다.
            이 글이 각 유형을 다른 유형과 구별해 주는 유일한 자산인데, 접혀 있는 데다
            정보 한 조각 취급을 받아 유형 페이지들이 서로 85% 유사해졌었다(2026-07-14
            색인 이탈 62건). 16Personalities 처럼 긴 단일 컬럼으로 낸다. */}
        <ToolLongform
          eyebrow={LF_EYEBROW}
          title={L.more}
          moreLabel={isEn ? 'Keep reading' : '이어서 읽기'}
          paragraphs={detailParagraphs}
          image={mood.image}
          imageAlt={tagline}
        />

        {/* 주간 레터 — 2026-09-22 에 **페이지 끝에서 여기로 올렸다.**
            사람은 페이지 길이와 무관하게 위 40% 에서 시간의 65% 를 쓴다. 맨 아래(86~96% 지점)에
            있던 구독 폼은 사실상 아무에게도 보이지 않았다. 글을 다 읽은 직후에 둔다. */}
        <section className="pt-2 pb-10 md:pb-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <EmailSubscribe
              source="perfume-type"
              resultName={name}
              result={{
                tool: 'perfume-type',
                code: t.code,
                label: isEn ? 'Perfume Type' : '향수 타입',
                name,
                tagline,
                emoji: t.emoji,
                path: `${basePath}/${t.slug}/`,
                image: mood.image,
                facts: features,
              }}
            />
          </div>
        </section>

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
                tool="perfume_type"
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
            {/* 2026-09-22: 4:5 · 2열 → 정사각 · 3열 + compact. 이 그리드는 '읽을 것'이
                아니라 '고를 것'이라 카드가 클 필요가 없다. 같은 6개 내부링크는 그대로. */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
              {PERFUME_TYPE_ORDER.map(c => {
                const s = PERFUME_TYPES[c]
                const isMe = s.code === t.code
                return (
                  <TypePreviewCard
                    key={c}
                    href={`${basePath}/${s.slug}/`}
                    emoji={s.emoji}
                    name={isEn ? s.enName : s.koName}
                    sub={isMe ? L.me : (isEn ? s.koName : s.enName)}
                    accent={s.primaryColor}
                    image={PERFUME_MOOD[c].image}
                    current={isMe}
                    aspectClass="aspect-square"
                    compact
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
