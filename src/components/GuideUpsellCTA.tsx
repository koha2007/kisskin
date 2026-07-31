import { isInternalTraffic } from '../lib/internalTraffic'
import { useI18n } from '../i18n/I18nContext'

// Strong "apply this to your own face" upsell for guide articles. Mirrors
// ToolUpsellCTA visually for consistency, but is tailored to editorial guide
// context: the headline references the technique just read. Placed at the end
// of the article body to convert organic-search readers who land here but
// currently leave without converting.
//
// 2026-07-31 — 문구가 제품과 어긋나 있어 전면 교정했다. 아래 셋 다 사실이 아니었다:
//   ① "시작하기 · $2.99" → 첫 1회는 **무료**다. 값부터 들이밀어 클릭을 스스로 눌렀다.
//      $2.99 는 소진 뒤 크레딧 5회 팩 가격이지 진입 가격이 아니다.
//   ② "가입 없이 바로 시작" → AI 메이크업은 무료 1회도 **로그인이 필요**하다
//      (MakeupFlow 의 로그인 게이트, 익명 무료 남용 차단). 없다고 해놓고 벽을 세우면
//      배지 몇 개로 쌓는 신뢰보다 훨씬 크게 깎아먹는다.
//   ③ "5가지 룩" → 실제 스타일은 **9종**(src/lib/makeup/styles.ts). 우리 값어치를
//      우리가 깎아 말하고 있었다. 게다가 한 번에 5장이 아니라 고른 룩을 하나씩 만든다.

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
// 첫 칩은 "무료"다 — 진입 장벽을 먼저 없애야 나머지 안심 요소가 읽힌다.
// 결제 관련 칩(환불·Polar)은 소진 후 충전 단계에서 실제로 적용되는 내용이라 유지한다.
const TRUST = [
  { icon: 'card_giftcard', label: '첫 1회 무료', labelEn: '1st try free' },
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
            ? 'Pick from 9 K-beauty looks and AI puts it on your own selfie — your face stays exactly the same.'
            : '9가지 K-뷰티 룩 중에 골라 내 셀카에 그대로 입혀보세요. 얼굴은 변하지 않아요.'}
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
          {isEn ? 'Try it free' : '무료로 체험하기'}
          <span className="material-symbols-outlined">arrow_forward</span>
        </a>
        <p className="mt-4 text-xs text-slate-400">
          {isEn
            ? 'Log in for your free try · no card needed · credits from $2.99 after that'
            : '로그인하면 1회 무료 · 카드 필요 없어요 · 이후 크레딧 $2.99부터'}
        </p>
      </div>
    </aside>
  )
}
