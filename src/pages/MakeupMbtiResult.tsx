import { useEffect, useState } from 'react'
import { MAKEUP_MBTI_TYPES, MBTI_ORDER, type MbtiCode } from '../lib/makeup-mbti/types'
import { MAKEUP_MBTI_EN } from '../lib/makeup-mbti/types.en'
import { MBTI_MOOD } from '../lib/makeup-mbti/moodImages'
import { MBTI_RECOMMENDATIONS } from '../lib/recommendations/makeup-mbti'
import { AFFILIATE_ENABLED } from '../lib/recommendations/types'
import RegionToggle from '../components/RegionToggle'
import { useRegion } from '../hooks/useRegion'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import ToolFaq, { MBTI_FAQ_BASE, MBTI_FAQ_BASE_EN } from '../components/ToolFaq'
import ShareBar from '../components/ShareBar'
import IdentityCard from '../components/IdentityCard'
import RelatedTools from '../components/RelatedTools'
import ResultGrid, {
  MoodCard,
  IconCard,
  TipCard,
  AxisCard,
  AccordionCard,
  BannerCard,
} from '../components/result-grid/ResultGrid'
import { ProductGridCard } from '../components/result-grid/ProductGridCard'
import { useI18n } from '../i18n/I18nContext'

interface Props {
  code: MbtiCode
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
    sessionStorage.removeItem('makeup-mbti-answers')
    const raf = requestAnimationFrame(() => setConfetti(true))
    const hide = window.setTimeout(() => setConfetti(false), 1800)
    return () => { cancelAnimationFrame(raf); window.clearTimeout(hide) }
  }, [])

  const accent = type.primaryColor
  // Rotate the type's two signature colors as soft card tints so the grid reads
  // as a moodboard rather than a wall of identical white cards (재설계 지시 §3).
  const tints = [type.primaryColor, type.accentColor, type.card.gradient[1]]
  const tint = (i: number) => tints[i % tints.length]

  const L = isEn
    ? {
        axisTitle: 'Your axes', sigTitle: 'Signature look', match: 'Compatible type', contrast: 'Contrast type',
        avoid: 'Pitfall to avoid', boost: 'Play to your strength', look: 'Recommended look',
        more: 'My story', allTypes: 'All 16 Makeup MBTI types', me: i18n('tools.common.me'),
        retake: 'Retake', save: 'Save image', female: i18n('tools.common.female'), male: i18n('tools.common.male'),
        lip: 'Lip', eye: 'Eye', base: 'Base', blush: 'Blush',
        bannerTitle: 'See this look on your own face', bannerDesc: 'Try AI makeup on your selfie — your face stays exactly the same.',
        bannerCta: 'Try AI makeup',
      }
    : {
        axisTitle: '나의 4가지 축', sigTitle: '시그니처 룩', match: '잘 맞는 유형', contrast: '대조되는 유형',
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
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {/* 영문 페이지에 한글 해시태그(#ESTJ메이크업 …)가 그대로 노출되고 있었다. */}
              {(isEn ? en.hashtags : type.card.hashtags).map(k => (
                <span key={k} className="px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-bold text-slate-700 border" style={{ borderColor: `${type.primaryColor}40` }}>{k}</span>
              ))}
            </div>
            {!isEn && (
              <IdentityCard label="메이크업 MBTI" emoji={type.emoji} card={type.card} fileSlug={`makeup-mbti-${type.slug}`} saveLabel={L.save} />
            )}
            <div className="mt-7">
              <a href={`${basePath}/`} className="inline-flex items-center gap-2 bg-white border-2 border-pink-100 hover:border-primary px-6 py-2.5 rounded-full font-bold text-sm text-navy-mid">
                <span className="material-symbols-outlined text-lg">refresh</span> {L.retake}
              </a>
            </div>
          </div>
        </section>

        {/* Masonry grid — 산문을 카드 1개=정보 1조각으로 분해 (재설계 지시 §3) */}
        <section className="py-8 md:py-12">
          <div className="max-w-5xl mx-auto px-3 sm:px-6">
            {AFFILIATE_ENABLED && <RegionToggle pageType="mbti" className="mb-7" />}
            <ResultGrid>
              <MoodCard image={mood.image} caption={tagline} emoji={type.emoji} gradient={type.card.gradient} />

              <AxisCard title={L.axisTitle} axes={axes} accent={accent} tint={tint(0)} />

              {traits.map((tr, i) => (
                <IconCard key={`trait-${i}`} icon={tr.icon} label={tr.title} text={tr.desc} accent={accent} tint={tint(i + 1)} />
              ))}

              <IconCard icon="favorite" label={`${L.sigTitle} · ${L.lip}`} text={signature.lip} accent={accent} tint={tint(0)} />
              <IconCard icon="visibility" label={`${L.sigTitle} · ${L.eye}`} text={signature.eye} accent={accent} tint={tint(1)} />
              <IconCard icon="auto_fix_high" label={`${L.sigTitle} · ${L.base}`} text={signature.base} accent={accent} tint={tint(2)} />
              <IconCard icon="spa" label={`${L.sigTitle} · ${L.blush}`} text={signature.blush} accent={accent} tint={tint(3)} />

              <IconCard icon="warning" label={L.avoid} text={avoidTip} accent={accent} tint={tint(2)} />
              <TipCard tip={boostTip} accent={accent} tint={tint(3)} />

              <IconCard icon="female" label={`${L.look} · ${L.female}`} text={`${type.recommended.women.primary} — ${recWomenReason}`} accent={accent} tint={tint(0)} />
              <IconCard icon="male" label={`${L.look} · ${L.male}`} text={`${type.recommended.men.primary} — ${recMenReason}`} accent={accent} tint={tint(1)} />

              <IconCard
                icon="favorite_border"
                label={L.match}
                text={`${isEn ? goodEn.enPersona : good.koName} (${good.code}) · ${isEn ? oppEn.enPersona : opp.koName} (${opp.code}) ${isEn ? '— a contrast to learn from' : '— 배울 점 있는 반대 유형'}`}
                accent={accent}
                tint={tint(2)}
              />

              {(MBTI_RECOMMENDATIONS[type.code] ?? []).map((item, i) => (
                <ProductGridCard key={`prod-${i}`} item={item} accent={accent} pageType="mbti" pageSlug={type.code} />
              ))}

              {/* 영문 본문(en.detailParagraphs)이 없어서 `!isEn` 으로 막아뒀던 자리다.
                  그 결과 영문 유형 페이지는 본문이 통째로 비어 16개가 서로 거의 같아졌고,
                  구글이 전부 색인에서 버렸다. 이제 양쪽 다 본문이 있다. */}
              {detailParagraphs.length > 0 && (
                <AccordionCard title={L.more} paragraphs={detailParagraphs} accent={accent} />
              )}

              <BannerCard
                title={L.bannerTitle}
                desc={L.bannerDesc}
                ctaLabel={L.bannerCta}
                href={isEn ? '/en/' : '/analysis/'}
                gradient={type.card.gradient}
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
      const colors = ['#eb4763', '#f472b6', '#c084fc', '#fbbf24', '#60a5fa']
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
