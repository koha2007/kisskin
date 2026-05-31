import { useI18n } from '../i18n/I18nContext'
import { isInternalTraffic } from '../lib/internalTraffic'

// Prominent "apply this result to your own face" upsell, shared by every tool
// result page. Goal: convert free-tool traffic into the $2.99 AI analysis by
// showing value (6 looks) and the price up front before the call to action.
// Used twice per page — once right after the result (variant="top") and once
// at the very bottom (variant="bottom").

interface Props {
  /** Result type display name, e.g. "봄 웜톤", "둥근형", "Spring Warm". */
  name: string
  /** Hex accent (the type's primaryColor). */
  accentColor: string
  /** Secondary hex for the gradient (the type's accentColor); defaults to accentColor. */
  accentColorTo?: string
  /** Tool slug for GA promotion tracking, e.g. "personal_color". */
  tool: string
  /** Result type slug for GA promotion tracking. */
  slug: string
  /** "top" = right after the result; "bottom" = repeat near the page end. */
  variant?: 'top' | 'bottom'
}

export default function ToolUpsellCTA({ name, accentColor, accentColorTo, tool, slug, variant = 'top' }: Props) {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const to = accentColorTo || accentColor
  const href = isEn ? '/en/' : '/analysis/'

  const headline = variant === 'top'
    ? (isEn ? `See ${name} on your own face` : `${name} 결과, 내 얼굴로 직접 확인해보세요`)
    : (isEn ? 'Ready to see it on your own face?' : '이제 내 얼굴로 직접 적용해볼까요?')

  const subline = isEn
    ? `Upload one selfie and AI creates 6 K-beauty makeup looks tailored to ${name} in about 60 seconds.`
    : `셀카 한 장이면 AI가 ${name}에 어울리는 6가지 K-뷰티 룩을 약 60초 만에 만들어드려요.`

  const trust = isEn
    ? [
        { icon: 'bolt', label: 'Results in ~60s' },
        { icon: 'verified_user', label: 'Refund if unsatisfied' },
      ]
    : [
        { icon: 'bolt', label: '약 60초면 완성' },
        { icon: 'verified_user', label: '결과 불만족 시 환불' },
      ]

  const trackClick = () => {
    if (isInternalTraffic()) return
    ;(window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', 'select_promotion', {
      promotion_id: `tool_cta_${tool}`,
      promotion_name: `${tool} result → AI analysis`,
      creative_slot: variant,
      items: [{ item_id: slug, item_name: `${tool}:${slug}` }],
    })
  }

  return (
    <section className="px-4 sm:px-6 py-10 md:py-14 bg-white">
      <div
        className="max-w-3xl mx-auto rounded-3xl border p-7 md:p-10 text-center relative overflow-hidden"
        style={{ borderColor: `${accentColor}33`, background: `linear-gradient(135deg, ${accentColor}0d 0%, ${to}1f 100%)` }}
      >
        <span
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
          style={{ color: accentColor, background: `${accentColor}14`, border: `1px solid ${accentColor}33` }}
        >
          <span className="material-symbols-outlined text-base">auto_awesome</span>
          {isEn ? 'AI Makeup Simulation' : 'AI 메이크업 시뮬레이션'}
        </span>

        <h2 className="font-serif text-2xl md:text-4xl font-semibold text-navy tracking-tight mb-3 leading-tight">
          {headline}
        </h2>
        <p className="text-slate-600 text-[15px] md:text-lg leading-relaxed max-w-xl mx-auto mb-6">
          {subline}
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-7">
          {trust.map((it) => (
            <span
              key={it.label}
              className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-white text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm"
            >
              <span className="material-symbols-outlined text-sm" style={{ color: accentColor, fontVariationSettings: "'FILL' 1" }}>
                {it.icon}
              </span>
              {it.label}
            </span>
          ))}
        </div>

        <a
          href={href}
          onClick={trackClick}
          className="inline-flex items-center justify-center gap-2 text-white px-8 md:px-10 py-4 rounded-full text-base md:text-lg font-bold transition-transform hover:scale-[1.02]"
          style={{ background: `linear-gradient(135deg, ${accentColor}, ${to})`, boxShadow: `0 14px 32px -10px ${accentColor}80` }}
        >
          <span className="text-xl leading-none">💄</span>
          {isEn ? 'Start now · $2.99' : '시작하기 · $2.99'}
          <span className="material-symbols-outlined">arrow_forward</span>
        </a>
        <p className="mt-4 text-xs text-slate-400">
          {isEn ? 'No sign-up needed · one-time payment' : '가입 없이 바로 시작 · 1회 결제'}
        </p>
      </div>
    </section>
  )
}
