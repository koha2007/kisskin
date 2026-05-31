import { isInternalTraffic } from '../lib/internalTraffic'
import { useI18n } from '../i18n/I18nContext'

// Strong "apply this to your own face" upsell for guide articles. Mirrors
// ToolUpsellCTA visually for consistency, but is tailored to editorial guide
// context: the headline references the technique just read, and it shows the
// $2.99 price + homepage trust signals up front. Guides are Korean-only, so the
// copy is Korean. Placed at the end of the article body to convert the
// organic-search readers who land here but currently leave without converting.

interface Props {
  /** Guide slug — used for GA promotion tracking, e.g. "mascara-no-smudge-techniques". */
  slug: string
  /** Category accent hex (from getGuideCategoryMeta). */
  accentColor: string
  /** Optional secondary hex for the gradient; defaults to accentColor. */
  accentColorTo?: string
  /** Context-aware headline, e.g. "이 마스카라 번짐 방지 기법, 내 얼굴로 직접 적용해보세요". */
  hook: string
  /** Position on the page — drives GA creative_slot. */
  variant?: 'middle' | 'bottom'
}

// Trust signals mirror the homepage hero trust band for a consistent promise.
const TRUST = [
  { icon: 'bolt', label: '60초 완성', labelEn: 'Done in 60s' },
  { icon: 'verified_user', label: '7일 환불보장', labelEn: '7-day refund' },
  { icon: 'lock', label: 'Polar 안전결제', labelEn: 'Secure checkout' },
]

export default function GuideUpsellCTA({ slug, accentColor, accentColorTo, hook, variant = 'bottom' }: Props) {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const to = accentColorTo || accentColor

  const trackClick = () => {
    if (isInternalTraffic()) return
    ;(window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', 'select_promotion', {
      promotion_id: `guide_cta_${slug}`,
      promotion_name: `guide ${slug} → AI analysis`,
      creative_slot: variant,
      items: [{ item_id: slug, item_name: `guide:${slug}` }],
    })
  }

  return (
    <aside className="my-10 md:my-12">
      <div
        className="rounded-3xl border p-7 md:p-10 text-center relative overflow-hidden"
        style={{ borderColor: `${accentColor}33`, background: `linear-gradient(135deg, ${accentColor}0d 0%, ${to}1f 100%)` }}
      >
        <span
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
          style={{ color: accentColor, background: `${accentColor}14`, border: `1px solid ${accentColor}33` }}
        >
          <span className="material-symbols-outlined text-base">auto_awesome</span>
          {isEn ? 'AI Makeup Simulation' : 'AI 메이크업 시뮬레이션'}
        </span>

        <h2 className="font-serif text-2xl md:text-[2rem] font-semibold text-navy tracking-tight mb-3 leading-tight">
          {hook}
        </h2>
        <p className="text-slate-600 text-[15px] md:text-lg leading-relaxed max-w-xl mx-auto mb-6">
          {isEn
            ? 'One selfie and AI builds six K-beauty makeup looks in about 60 seconds.'
            : '셀카 한 장이면 AI가 6가지 K-뷰티 메이크업 룩을 약 60초 만에 만들어드려요.'}
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-7">
          {TRUST.map((it) => (
            <span
              key={it.label}
              className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-white text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm"
            >
              <span className="material-symbols-outlined text-sm" style={{ color: accentColor, fontVariationSettings: "'FILL' 1" }}>
                {it.icon}
              </span>
              {isEn ? it.labelEn : it.label}
            </span>
          ))}
        </div>

        <a
          href={isEn ? '/en/' : '/analysis/'}
          onClick={trackClick}
          className="inline-flex items-center justify-center gap-2 text-white px-8 md:px-10 py-4 rounded-full text-base md:text-lg font-bold transition-transform hover:scale-[1.02]"
          style={{ background: `linear-gradient(135deg, ${accentColor}, ${to})`, boxShadow: `0 14px 32px -10px ${accentColor}80` }}
        >
          <span className="text-xl leading-none">💄</span>
          {isEn ? 'Get started · $2.99' : '시작하기 · $2.99'}
          <span className="material-symbols-outlined">arrow_forward</span>
        </a>
        <p className="mt-4 text-xs text-slate-400">
          {isEn ? 'No sign-up · one-time payment' : '가입 없이 바로 시작 · 1회 결제'}
        </p>
      </div>
    </aside>
  )
}
