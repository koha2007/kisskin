import { useEffect, useState } from 'react'
import { MAKEUP_MBTI_TYPES, MBTI_ORDER, type MbtiCode, type MakeupMbtiType } from '../lib/makeup-mbti/types'
import { MBTI_RECOMMENDATIONS } from '../lib/recommendations/makeup-mbti'
import RecommendedProducts from '../components/RecommendedProducts'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import ToolFaq, { MBTI_FAQ_BASE } from '../components/ToolFaq'
import ShareBar from '../components/ShareBar'
import RelatedTools from '../components/RelatedTools'
import { useI18n } from '../i18n/I18nContext'

interface Props {
  code: MbtiCode
}

export default function MakeupMbtiResult({ code }: Props) {
  const { t: i18n } = useI18n()
  const type = MAKEUP_MBTI_TYPES[code]
  const good = MAKEUP_MBTI_TYPES[type.goodMatch]
  const opp = MAKEUP_MBTI_TYPES[type.opposite]
  const [copied, setCopied] = useState(false)
  const [confetti, setConfetti] = useState(false)

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

  const shareUrl = `https://kissinskin.net/tools/makeup-mbti/${type.slug}/`

  const handleShare = async () => {
    const shareText = `나의 메이크업 MBTI는 "${type.koName}" (${type.code}) 💄\n${type.tagline}\n\n`
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: `메이크업 MBTI: ${type.koName}`, text: shareText, url: shareUrl })
        return
      } catch { /* fallback to copy */ }
    }
    try {
      await navigator.clipboard.writeText(shareText + shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div className="font-display bg-background-light min-h-screen">
      <style>{styles}</style>
      {confetti && <ConfettiBurst />}

      <ToolsNav />

      <main>

      {/* Hero Result */}
      <section
        className="relative py-16 md:py-24 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${type.primaryColor}12 0%, ${type.accentColor}20 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-50 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl -translate-y-1/3 translate-x-1/4"
            style={{ background: `radial-gradient(circle, ${type.primaryColor}30, transparent 70%)` }}
          />
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl translate-y-1/4 -translate-x-1/4"
            style={{ background: `radial-gradient(circle, ${type.accentColor}30, transparent 70%)` }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-block text-6xl md:text-7xl mb-3 mbti-bounce">{type.emoji}</div>
          <p className="font-mono text-xs md:text-sm tracking-[0.3em] text-slate-500 mb-2">{type.code}</p>
          <h1 className="font-serif text-4xl md:text-6xl font-semibold text-navy tracking-tight mb-3 leading-[1.05]">
            {type.koName}
          </h1>
          <p className="text-sm md:text-base text-slate-500 italic mb-4">{type.enName}</p>
          <p className="text-base md:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
            {type.tagline}
          </p>

          {/* Axis scores */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <AxisBar label="표현" left="내면 I" right="외현 E" value={type.axisScores.e} color={type.primaryColor} />
            <AxisBar label="영감" left="검증 S" right="실험 N" value={type.axisScores.n} color={type.primaryColor} />
            <AxisBar label="무드" left="구조 T" right="감성 F" value={type.axisScores.f} color={type.primaryColor} />
            <AxisBar label="루틴" left="일관 J" right="즉흥 P" value={type.axisScores.p} color={type.primaryColor} />
          </div>

          {/* Share + CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <button
              onClick={handleShare}
              className="bg-white border-2 border-pink-100 hover:border-primary hover:shadow-lg px-6 py-3 rounded-full font-bold text-sm md:text-base text-navy-mid hover:text-primary transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">share</span>
              {copied ? i18n('tools.common.copiedLink') : i18n('tools.common.shareToFriend')}
            </button>
            <a
              href="/analysis"
              className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-6 py-3 rounded-full font-bold text-sm md:text-base shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">auto_awesome</span>
              {i18n('tools.common.applyToMyFace')}
            </a>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="py-8 md:py-10 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-slate-600 leading-relaxed text-[15px] md:text-base text-center">
            {type.detailParagraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      {/* 3 Traits */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-background-light via-pink-50/30 to-background-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-8 tracking-tight leading-tight">
            이 유형의 3가지 핵심 특징
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {type.traits.map((tr) => (
              <div key={tr.title} className="bg-white rounded-2xl p-6 border border-pink-100 hover:shadow-lg hover:shadow-pink-100/50 transition-all">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md mb-4"
                  style={{ background: `linear-gradient(135deg, ${type.primaryColor}, ${type.accentColor})` }}
                >
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{tr.icon}</span>
                </div>
                <h3 className="font-bold text-navy-mid mb-2">{tr.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{tr.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Look */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-8 tracking-tight leading-tight">
            나의 시그니처 룩 레시피
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <SignatureCard label="립" value={type.signature.lip} icon="favorite" color={type.primaryColor} />
            <SignatureCard label="아이" value={type.signature.eye} icon="visibility" color={type.primaryColor} />
            <SignatureCard label="베이스" value={type.signature.base} icon="auto_fix_high" color={type.primaryColor} />
            <SignatureCard label="블러쉬" value={type.signature.blush} icon="spa" color={type.primaryColor} />
          </div>
        </div>
      </section>

      {/* Recommended Styles (kissinskin integration) */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-pink-50/40 via-white to-pink-50/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-primary-dark text-sm font-bold uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100">
              <span className="material-symbols-outlined text-base">recommend</span>
              추천 K-뷰티 스타일
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-navy mt-4 leading-tight">
              {type.koName}에게 어울리는 kissinskin 스타일
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Women */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-pink-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>female</span>
                <h3 className="font-extrabold text-navy-mid">{i18n('tools.common.female')}</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-extrabold text-primary">{type.recommended.women.primary}</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">+ {type.recommended.women.secondary}</p>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {type.recommended.women.reason}
              </p>
              <a
                href="/analysis"
                className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all"
              >
                이 스타일로 AI 시뮬레이션 하기
                <span className="material-symbols-outlined">arrow_forward</span>
              </a>
            </div>

            {/* Men */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-blue-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>male</span>
                <h3 className="font-extrabold text-navy-mid">{i18n('tools.common.male')}</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-extrabold text-blue-500">{type.recommended.men.primary}</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">+ {type.recommended.men.secondary}</p>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {type.recommended.men.reason}
              </p>
              <a
                href="/analysis"
                className="inline-flex items-center gap-2 text-blue-500 font-bold text-sm hover:gap-3 transition-all"
              >
                이 스타일로 AI 시뮬레이션 하기
                <span className="material-symbols-outlined">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <RecommendedProducts
        items={MBTI_RECOMMENDATIONS[type.code]}
        accentColor={type.primaryColor}
        accentGradient="from-primary to-pink-500"
        headingEmoji="🛍️"
        subtitle={`${type.koName} (${type.code}) 유형에 어울리는 제품 카테고리입니다. 시그니처 룩을 완성할 때 참고하세요.`}
      />

      {/* Tips */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-8 tracking-tight leading-tight">
            이 유형을 위한 2가지 팁
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-5 md:p-6 flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-md">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <h3 className="font-bold text-navy-mid mb-1">피해야 할 함정</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{type.avoidTip}</p>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-pink-200 bg-pink-50/60 p-5 md:p-6 flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                <span className="material-symbols-outlined">lightbulb</span>
              </div>
              <div>
                <h3 className="font-bold text-navy-mid mb-1">강점을 살리는 법</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{type.boostTip}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Relationships */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-background-light to-pink-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-8 tracking-tight leading-tight">
            나와 궁합이 좋은 유형 · 배울 점 있는 반대 유형
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <RelCard t={good} relation="궁합이 좋은 유형" description="영감을 주고받는 찰떡 궁합" tone="good" />
            <RelCard t={opp} relation="대조되는 유형" description="배울 점이 있는 반대 스타일" tone="opp" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <ToolFaq
        title={`${type.koName} 유형 FAQ`}
        items={MBTI_FAQ_BASE}
        accentColor={type.primaryColor}
      />

      {/* Related tools — drive cross-tool retention */}
      <RelatedTools exclude="makeup-mbti" />

      {/* Share */}
      <ShareBar
        url={shareUrl}
        shareText={`나의 메이크업 MBTI는 "${type.koName}" (${type.code}) 💄\n${type.tagline}\n\n`}
        shareTitle={`메이크업 MBTI: ${type.koName}`}
        retakeUrl="/tools/makeup-mbti/"
      />

      {/* All 16 types grid (SEO internal linking) */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-2 tracking-tight leading-tight">
            16가지 메이크업 MBTI 전체 보기
          </h2>
          <p className="text-center text-slate-500 text-sm mb-8">
            다른 유형의 설명도 확인해 보세요. 주변 사람의 MBTI로 스타일을 탐색할 수 있어요.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MBTI_ORDER.map(c => {
              const t = MAKEUP_MBTI_TYPES[c]
              const isMe = c === type.code
              return (
                <a
                  key={c}
                  href={`/tools/makeup-mbti/${t.slug}/`}
                  className={`group rounded-2xl p-4 border transition-all ${
                    isMe
                      ? 'bg-gradient-to-br from-primary/10 to-pink-50 border-primary/40'
                      : 'bg-white border-pink-100 hover:border-primary/30 hover:shadow-md'
                  }`}
                >
                  <div className="text-2xl md:text-3xl mb-1.5">{t.emoji}</div>
                  <div className="text-[0.65rem] font-mono text-slate-400 mb-0.5">{t.code}{isMe ? ' · 나' : ''}</div>
                  <div className="text-sm font-bold text-navy-mid group-hover:text-primary transition-colors leading-tight">
                    {t.koName}
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="material-symbols-outlined text-primary text-5xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight mb-3 text-navy leading-tight">
            이제 당신의 얼굴에 <span className="text-primary">{type.recommended.women.primary}</span> 적용해보세요
          </h2>
          <p className="text-slate-600 mb-6 max-w-lg mx-auto">
            셀카 한 장 업로드하면 30초 이내 9가지 K-뷰티 룩을 생성합니다.
          </p>
          <a
            href="/analysis"
            className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl shadow-primary/25 inline-flex items-center gap-2"
          >
            {i18n('tools.common.aiMakeupStart')}
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </div>
      </section>

      </main>

      <ToolsFooter />
    </div>
  )
}

/* ---------- Sub components ---------- */
function AxisBar({ label, left, right, value, color }: { label: string; left: string; right: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl p-3 border border-white/50 shadow-sm">
      <div className="text-[0.65rem] uppercase tracking-wider font-bold text-slate-400 mb-2 text-center">{label}</div>
      <div className="flex items-center justify-between text-[0.7rem] text-slate-500 mb-1.5">
        <span>{left}</span>
        <span>{right}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
        <div
          className="h-full transition-all duration-1000 ease-out"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <div className="text-xs text-center font-bold text-navy-mid mt-1.5">{value}%</div>
    </div>
  )
}

function SignatureCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="bg-white border border-pink-100 rounded-2xl p-5 text-center hover:shadow-md transition-shadow">
      <div
        className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center text-white"
        style={{ background: color }}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div className="text-[0.7rem] uppercase tracking-wider font-bold text-slate-400 mb-1">{label}</div>
      <div className="text-sm font-bold text-navy-mid leading-snug">{value}</div>
    </div>
  )
}

function RelCard({ t, relation, description, tone }: { t: MakeupMbtiType; relation: string; description: string; tone: 'good' | 'opp' }) {
  const toneClass = tone === 'good'
    ? 'border-primary/30 bg-gradient-to-br from-pink-50/60 to-rose-50/60'
    : 'border-slate-200 bg-white'
  return (
    <a
      href={`/tools/makeup-mbti/${t.slug}/`}
      className={`group rounded-2xl border-2 ${toneClass} p-5 md:p-6 flex items-center gap-4 hover:shadow-lg transition-all`}
    >
      <div className="shrink-0 text-5xl">{t.emoji}</div>
      <div className="flex-1">
        <div className="text-[0.65rem] uppercase tracking-wider font-bold text-slate-400 mb-0.5">{relation}</div>
        <div className="font-extrabold text-navy-mid text-lg group-hover:text-primary transition-colors">{t.koName}</div>
        <div className="font-mono text-[0.7rem] text-slate-400 mb-1">{t.code}</div>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <span className="material-symbols-outlined text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward</span>
    </a>
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
  @keyframes mbti-bounce {
    0%, 100% { transform: translateY(0); }
    30% { transform: translateY(-14px); }
    60% { transform: translateY(-4px); }
  }
  .mbti-bounce { animation: mbti-bounce 1.5s ease-in-out; }
  @keyframes mbti-confetti {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
`
