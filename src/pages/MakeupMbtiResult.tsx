import { useEffect, useState } from 'react'
import { MAKEUP_MBTI_TYPES, MBTI_ORDER, type MbtiCode } from '../lib/makeup-mbti/types'
import { computeTypeConfidence, type QuizOption } from '../lib/makeup-mbti/questions'
import { MAKEUP_MBTI_EN } from '../lib/makeup-mbti/types.en'
import { MBTI_MOOD } from '../lib/makeup-mbti/moodImages'
import { LOOK_NAME_TO_ID } from '../lib/makeup-mbti/groupColors'
import { LOOK_IMAGES } from '../lib/makeup/lookImages'
import type { MakeupStyleId } from '../lib/makeup/styles'
import { MBTI_RECOMMENDATIONS } from '../lib/recommendations/makeup-mbti'
import { AFFILIATE_ENABLED } from '../lib/recommendations/types'
import RegionToggle from '../components/RegionToggle'
import { useRegion } from '../hooks/useRegion'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import ToolFaq, { MBTI_FAQ_BASE, MBTI_FAQ_BASE_EN } from '../components/ToolFaq'
import ShareBar from '../components/ShareBar'
import IdentityCard from '../components/IdentityCard'
import RelatedTools from '../components/RelatedTools'
import ToolLongform from '../components/tools/ToolLongform'
import BentoGrid, {
  BentoPhoto,
  BentoFacts,
  BentoNote,
  BentoAxes,
  BentoBanner,
  insertScattered,
  scatterSlot,
} from '../components/result-grid/BentoGrid'
import { ProductGridCard } from '../components/result-grid/ProductGridCard'
import { useI18n } from '../i18n/I18nContext'

interface Props {
  code: MbtiCode
}

// 유형의 추천 룩 → 실제 결과 사진. moodImages 가 채워지면 그쪽이 우선한다.
function lookPhoto(name: string): string | undefined {
  const id = LOOK_NAME_TO_ID[name] as MakeupStyleId | undefined
  return id ? LOOK_IMAGES[id]?.after : undefined
}

export default function MakeupMbtiResult({ code }: Props) {
  const { t: i18n, locale } = useI18n()
  const [region] = useRegion()
  const isEn = locale === 'en'
  const type = MAKEUP_MBTI_TYPES[code]
  const en = MAKEUP_MBTI_EN[code]
  const good = MAKEUP_MBTI_TYPES[type.goodMatch]
  const goodEn = MAKEUP_MBTI_EN[type.goodMatch]
  const opp = MAKEUP_MBTI_TYPES[type.opposite]
  const oppEn = MAKEUP_MBTI_EN[type.opposite]
  const mood = MBTI_MOOD[code]
  const [confetti, setConfetti] = useState(false)
  const basePath = isEn ? '/en/tools/makeup-mbti' : '/tools/makeup-mbti'

  const displayName = isEn ? en.enPersona : type.koName
  const tagline = isEn ? en.tagline : type.tagline
  const detailParagraphs = isEn ? en.detailParagraphs : type.detailParagraphs
  const LF_EYEBROW = isEn ? 'Makeup MBTI · In depth' : '메이크업 MBTI · 자세히'
  const traits = isEn ? en.traits : type.traits
  const signature = isEn ? en.signature : type.signature
  const recWomenReason = isEn ? en.recommended.women.reason : type.recommended.women.reason
  const recMenReason = isEn ? en.recommended.men.reason : type.recommended.men.reason
  const avoidTip = isEn ? en.avoidTip : type.avoidTip
  const boostTip = isEn ? en.boostTip : type.boostTip

  useEffect(() => {
    // Light celebration on first landing (not re-entry)
    if (typeof window === 'undefined') return
    const flag = sessionStorage.getItem('makeup-mbti-answers')
    if (!flag) return
    // 지우기 전에 실제 응답으로 일치도를 계산한다. 숫자를 만들어 내지 않는다.
    try {
      const parsed = JSON.parse(flag) as QuizOption['letter'][]
      if (Array.isArray(parsed)) setConfidence(computeTypeConfidence(parsed))
    } catch { /* 형식이 깨졌으면 그냥 안 보여준다 */ }
    sessionStorage.removeItem('makeup-mbti-answers')
    const raf = requestAnimationFrame(() => setConfetti(true))
    const hide = window.setTimeout(() => setConfetti(false), 1800)
    return () => { cancelAnimationFrame(raf); window.clearTimeout(hide) }
  }, [])

  // 응답 일치도 — 퀴즈를 방금 푼 사람에게만 뜬다(검색으로 바로 들어오면 근거가 없어 안 뜬다).
  const [confidence, setConfidence] = useState<number | null>(null)

  const accent = type.primaryColor

  // ④ 제품 카드는 맨 뒤에 몰아두지 않고 유형 코드 해시로 격자 안에 흩는다.
  // 늘 마지막 자리에 두었더니 affiliate_click 이 28일간 0건이었다(마소니 18/20번째).
  // 순수 랜덤이 아니라 결정적 분산이라 같은 페이지는 항상 같은 자리 → CLS 0, GA4 측정 가능.
  const recs = MBTI_RECOMMENDATIONS[type.code] ?? []

  const L = isEn
    ? {
        axisTitle: 'Your axes', sigTitle: 'Signature look', match: 'Compatible', contrast: 'Contrast',
        traitsTitle: 'What defines you', matchTitle: 'Type chemistry',
        avoid: 'Pitfall to avoid', boost: 'Play to your strength', look: 'Recommended look',
        more: 'My story', allTypes: 'All 16 Makeup MBTI types', me: i18n('tools.common.me'),
        retake: 'Retake', save: 'Save image', female: i18n('tools.common.female'), male: i18n('tools.common.male'),
        lip: 'Lip', eye: 'Eye', base: 'Base', blush: 'Blush',
        bannerTitle: 'See this look on your own face', bannerDesc: 'Try AI makeup on your selfie — your face stays exactly the same.',
        bannerCta: 'Try AI makeup',
      }
    : {
        axisTitle: '나의 4가지 축', sigTitle: '시그니처 룩', match: '잘 맞는 유형', contrast: '대조되는 유형',
        traitsTitle: '나를 설명하는 것', matchTitle: '유형 궁합',
        avoid: '피해야 할 함정', boost: '강점을 살리는 법', look: '추천 룩',
        more: '나에 대한 이야기', allTypes: '16가지 메이크업 MBTI 전체 보기', me: i18n('tools.common.me'),
        retake: '다시 진단', save: '이미지 저장하기', female: i18n('tools.common.female'), male: i18n('tools.common.male'),
        lip: '립', eye: '아이', base: '베이스', blush: '블러쉬',
        bannerTitle: '이 룩, 내 얼굴에 직접', bannerDesc: 'AI로 어울리는 메이크업을 내 셀카에 입혀보세요. 얼굴은 그대로예요.',
        bannerCta: 'AI 메이크업 체험',
      }

  const axes = isEn
    ? [
        { label: 'Expression', left: 'Intimate', right: 'Expressive', value: type.axisScores.e },
        { label: 'Source', left: 'Signature', right: 'Novel', value: type.axisScores.n },
        { label: 'Feel', left: 'Structure', right: 'Feel', value: type.axisScores.f },
        { label: 'Routine', left: 'Journal', right: 'Playful', value: type.axisScores.p },
      ]
    : [
        { label: '표현', left: '내면 I', right: '외현 E', value: type.axisScores.e },
        { label: '영감', left: '검증 S', right: '실험 N', value: type.axisScores.n },
        { label: '무드', left: '구조 T', right: '감성 F', value: type.axisScores.f },
        { label: '루틴', left: '일관 J', right: '즉흥 P', value: type.axisScores.p },
      ]

  // ⑤ 벤토 타일 — 정보의 종류가 칸 크기를 정한다.
  // 예전엔 `시그니처 · 립/아이/베이스/블러쉬` 가 카드 4장, `추천 룩 · 여성/남성` 이 2장,
  // 특징이 3~4장이라 한 줄짜리 회색 박스만 10개 넘게 깔렸다. 전부 BentoFacts 한 장에
  // 행으로 접어 타일 수를 절반 이하로 줄인다.
  const baseTiles = [
    <BentoPhoto
      key="photo"
      // 롱폼 본문이 이미 mood.image 를 크게 쓰고 있다. 여기까지 같은 사진을 또 쓰면
      // 한 페이지에 동일 이미지가 두 번 나오므로 추천 룩 실제 결과 사진을 우선한다.
      image={lookPhoto(type.recommended.women.primary) ?? mood.image}
      caption={tagline}
      emoji={type.emoji}
      gradient={type.card.gradient}
    />,
    <BentoAxes key="axes" title={L.axisTitle} axes={axes} accent={accent} />,
    <BentoFacts
      key="signature"
      title={L.sigTitle}
      accent={accent}
      rows={[
        { label: L.lip, text: signature.lip },
        { label: L.eye, text: signature.eye },
        { label: L.base, text: signature.base },
        { label: L.blush, text: signature.blush },
      ]}
    />,
    <BentoFacts
      key="traits"
      title={L.traitsTitle}
      accent={accent}
      rows={traits.map((tr) => ({ label: tr.title, text: tr.desc }))}
    />,
    <BentoNote key="avoid" icon="warning" label={L.avoid} text={avoidTip} accent={accent} />,
    <BentoNote key="boost" icon="lightbulb" label={L.boost} text={boostTip} accent={accent} />,
    <BentoFacts
      key="look"
      title={L.look}
      accent={accent}
      rows={[
        { label: L.female, text: `${type.recommended.women.primary} — ${recWomenReason}` },
        { label: L.male, text: `${type.recommended.men.primary} — ${recMenReason}` },
      ]}
    />,
    <BentoFacts
      key="match"
      title={L.matchTitle}
      accent={accent}
      rows={[
        { label: L.match, text: `${isEn ? goodEn.enPersona : good.koName} (${good.code})` },
        { label: L.contrast, text: `${isEn ? oppEn.enPersona : opp.koName} (${opp.code})` },
      ]}
    />,
  ]

  const tiles = insertScattered(
    baseTiles,
    recs.map((item, i) => (
      <ProductGridCard
        key={`prod-${i}`}
        item={item}
        accent={accent}
        pageType="mbti"
        pageSlug={type.code}
        span="sm"
        slot={scatterSlot(type.code, i, recs.length, baseTiles.length)}
      />
    )),
    type.code,
  )

  return (
    <div className="font-display bg-background-light min-h-screen">
      <style>{styles}</style>
      {confetti && <ConfettiBurst />}

      <ToolsNav />

      <main>
        {/* Hero — slim: identity card + save (재설계 지시 §2 상단) */}
        <section className="relative pt-12 pb-8 md:pt-16 md:pb-10 overflow-hidden" style={{ background: `linear-gradient(135deg, ${type.primaryColor}12 0%, ${type.accentColor}20 100%)` }}>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="font-mono text-xs md:text-sm tracking-[0.3em] text-slate-500 mb-2">{type.code}</p>
            <h1 className="font-serif text-3xl md:text-5xl font-semibold text-navy tracking-tight mb-3 leading-[1.05]">{displayName}</h1>
            <p className="text-base md:text-lg text-slate-700 max-w-xl mx-auto leading-relaxed font-medium mb-5">{tagline}</p>

            {/* 응답 일치도 — BeautySpark 가 결과에 "94% Match" 를 붙여 공유 동기를 만드는 장치를
                가져왔다. 다만 저쪽 숫자가 무엇을 재는지는 알 수 없으므로 그대로 흉내내지 않고,
                **사용자의 실제 8문항 응답이 이 유형 쪽으로 얼마나 일관되게 기울었는지**를 계산해
                쓴다. 퀴즈를 풀지 않고 검색으로 바로 들어온 방문자에겐 근거가 없으므로 뜨지 않는다.
                (가짜 평점 4.8/150 을 올렸다가 정책 위반으로 내린 전례를 반복하지 않는다.) */}
            {confidence !== null && (
              <div className="mb-6 inline-flex flex-col items-center gap-1">
                <span
                  className="inline-flex items-baseline gap-1.5 border px-4 py-2"
                  style={{ borderColor: `${type.primaryColor}55`, background: `${type.primaryColor}0f` }}
                >
                  <b className="t-h2 tabular-nums" style={{ color: type.primaryColor }}>{confidence}%</b>
                  <span className="t-caption font-bold text-navy">
                    {isEn ? 'answer consistency' : '응답 일치도'}
                  </span>
                </span>
                <span className="t-label text-slate-500">
                  {isEn
                    ? 'How consistently your 8 answers pointed to this type'
                    : '8문항 응답이 이 유형 쪽으로 기운 정도'}
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {/* 영문 페이지에 한글 해시태그(#ESTJ메이크업 …)가 그대로 노출되고 있었다. */}
              {(isEn ? en.hashtags : type.card.hashtags).map(k => (
                <span key={k} className="px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-bold text-slate-700 border" style={{ borderColor: `${type.primaryColor}40` }}>{k}</span>
              ))}
            </div>
            {!isEn && (
              <IdentityCard
                label="메이크업 MBTI"
                emoji={type.emoji}
                card={type.card}
                fileSlug={`makeup-mbti-${type.slug}`}
                saveLabel={L.save}
                share={{
                  url: `https://kissinskin.net${basePath}/${type.slug}/`,
                  text: isEn
                    ? `My Makeup MBTI is "${en.enPersona}" (${type.code}) 💄\n${en.tagline}\n\n`
                    : `나의 메이크업 MBTI는 "${type.koName}" (${type.code}) 💄\n${type.tagline}\n\n`,
                  title: isEn ? `Makeup MBTI: ${en.enPersona}` : `메이크업 MBTI: ${type.koName}`,
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

        {/* 결과 벤토 — 사진·데이터 패널은 넓게, 한 줄 팩트는 한 타일에 묶어서 */}
        <section className="py-8 md:py-12">
          <div className="max-w-5xl mx-auto px-3 sm:px-6">
            {AFFILIATE_ENABLED && <RegionToggle pageType="mbti" className="mb-7" />}
            <BentoGrid>
              {tiles}
              <BentoBanner
                title={L.bannerTitle}
                desc={L.bannerDesc}
                ctaLabel={L.bannerCta}
                href={isEn ? '/en/' : '/analysis/'}
                gradient={type.card.gradient}
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
          title={isEn ? `FAQ — ${displayName}` : `${displayName} 유형 FAQ`}
          items={isEn ? MBTI_FAQ_BASE_EN : MBTI_FAQ_BASE}
          accentColor={type.primaryColor}
        />

        {/* Related tools — drive cross-tool retention */}
        <RelatedTools exclude="makeup-mbti" />

        {/* Share */}
        <ShareBar
          url={`https://kissinskin.net${basePath}/${type.slug}/`}
          shareText={
            isEn
              ? `My Makeup MBTI is "${en.enPersona}" (${type.code}) 💄\n${en.tagline}\n\n`
              : `나의 메이크업 MBTI는 "${type.koName}" (${type.code}) 💄\n${type.tagline}\n\n`
          }
          shareTitle={isEn ? `Makeup MBTI: ${en.enPersona}` : `메이크업 MBTI: ${type.koName}`}
          retakeUrl={`${basePath}/`}
        />

        {/* All 16 types grid (SEO internal linking) */}
        <section className="py-14 bg-gradient-to-b from-white to-background-light">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-2 tracking-tight leading-tight">
              {L.allTypes}
            </h2>
            <p className="text-center text-slate-500 text-sm mb-8">
              {isEn ? 'Read the other types — useful when you want to compare with friends or family.' : '다른 유형의 설명도 확인해 보세요. 주변 사람의 MBTI로 스타일을 탐색할 수 있어요.'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MBTI_ORDER.map(c => {
                const mt = MAKEUP_MBTI_TYPES[c]
                const mtEn = MAKEUP_MBTI_EN[c]
                const isMe = c === type.code
                return (
                  <a key={c} href={`${basePath}/${mt.slug}/`} className={`rounded-2xl p-4 border transition-all ${isMe ? 'ring-2' : 'hover:shadow-md'}`} style={{ background: isMe ? `${mt.primaryColor}10` : 'white', borderColor: `${mt.primaryColor}30` }}>
                    <div className="text-2xl md:text-3xl mb-1.5">{mt.emoji}</div>
                    <div className="text-[0.65rem] font-mono text-slate-400 mb-0.5">{mt.code}{isMe ? ` · ${L.me}` : ''}</div>
                    <div className="text-sm font-bold text-navy-mid leading-tight">{isEn ? mtEn.enPersona : mt.koName}</div>
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

type ConfettiBit = { left: number; delay: number; dur: number; color: string }

function ConfettiBurst() {
  const [bits, setBits] = useState<ConfettiBit[]>([])
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const colors = ['#d8503c', '#e0a63c', '#c084fc', '#fbbf24', '#60a5fa']
      setBits(Array.from({ length: 24 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        dur: 1.2 + Math.random() * 0.8,
        color: colors[i % colors.length],
      })))
    })
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute top-[-20px] w-2.5 h-2.5 rounded-sm"
          style={{
            left: `${b.left}%`,
            background: b.color,
            animation: `mbti-confetti ${b.dur}s linear ${b.delay}s forwards`,
          }}
        />
      ))}
    </div>
  )
}

const styles = `
  @keyframes mbti-confetti {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
`
