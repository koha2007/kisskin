// Unified landing primitives for the 4 free-tool quizzes (intro phase only).
// Design language = main concept: navy+pink, serif headline + Pretendard body,
// pink-gradient pill CTA, unified rounded-2xl cards. Per-type color is used as a
// single accent point (card header gradient + border), never the whole surface.
// (DESIGN_SYSTEM.md) The quiz flow itself lives in QuizScreen and is untouched.

import type { ReactNode } from 'react'

export type HeroChip = { icon: string; label: string }

/** Navy+pink hero shared by every tool landing. */
export function ToolHero({
  badge,
  badgeIcon,
  title,
  subtitle,
  startLabel,
  onStart,
  previewHref,
  previewLabel,
  chips,
}: {
  badge: string
  badgeIcon: string
  title: ReactNode
  subtitle: ReactNode
  startLabel: string
  onStart: () => void
  previewHref?: string
  previewLabel?: string
  chips: HeroChip[]
}) {
  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      {/* Unified soft blobs — brand pink + navy, no per-tool hue. */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-navy/5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 pointer-events-none" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 text-primary text-xs font-bold uppercase tracking-wider mb-6">
          <span className="material-symbols-outlined text-sm">{badgeIcon}</span>
          {badge}
        </div>
        <h1 className="font-serif text-3xl md:text-5xl font-semibold leading-tight tracking-tight text-navy mb-4">
          {title}
        </h1>
        <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-6 max-w-2xl mx-auto">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button
            onClick={onStart}
            className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-10 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/25 transition-all"
          >
            {startLabel}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          {previewHref && previewLabel && (
            <a
              href={previewHref}
              className="border border-slate-300 hover:border-primary/40 hover:bg-pink-50/60 px-10 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 text-navy transition-colors"
            >
              <span className="material-symbols-outlined text-primary">grid_view</span>
              {previewLabel}
            </a>
          )}
        </div>
        <div className="flex items-center justify-center gap-6 text-sm text-slate-500 flex-wrap">
          {chips.map((c) => (
            <span key={c.label} className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">{c.icon}</span> {c.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

/** "Why it matters" prose section — serif headline, neutral surface. Body is
 * content-specific so callers pass it as children (untouched copy). */
export function ToolWhySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-8 tracking-tight">
          {title}
        </h2>
        <div className="prose max-w-none text-slate-600 leading-relaxed space-y-4">{children}</div>
      </div>
    </section>
  )
}

// Deterministic per-type header height → brick rhythm in the preview masonry.
const TYPE_ASPECTS = ['aspect-[4/5]', 'aspect-square', 'aspect-[5/6]', 'aspect-[4/5]']
function typeAspect(key: string) {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0
  return TYPE_ASPECTS[Math.abs(h) % TYPE_ASPECTS.length]
}

/** One type-preview card — gradient+emoji header (accent = single point), links
 * to the type result page. Href is preserved verbatim by the caller. */
export function TypePreviewCard({
  href,
  emoji,
  name,
  sub,
  accent,
}: {
  href: string
  emoji: string
  name: string
  sub: string
  accent: string
}) {
  return (
    <a
      href={href}
      className="group mb-3 block break-inside-avoid overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
      style={{ borderColor: `${accent}30` }}
    >
      <div
        className={`relative ${typeAspect(name)} flex items-center justify-center`}
        style={{ background: `linear-gradient(150deg, ${accent}, color-mix(in srgb, ${accent} 55%, #070953))` }}
      >
        <span className="text-5xl md:text-6xl drop-shadow-lg select-none" aria-hidden="true">
          {emoji}
        </span>
      </div>
      <div className="p-3.5 text-center">
        <div className="font-serif font-semibold text-navy leading-snug group-hover:text-primary transition-colors">
          {name}
        </div>
        <div className="text-[0.7rem] text-slate-400 mt-0.5">{sub}</div>
      </div>
    </a>
  )
}

/** Section wrapping the Pinterest-style type-preview masonry + a bottom CTA. */
export function TypePreviewSection({
  id,
  title,
  subtitle,
  columnsClass = 'columns-2 md:columns-4',
  children,
  startLabel,
  onStart,
}: {
  id?: string
  title: string
  subtitle: string
  columnsClass?: string
  children: ReactNode
  startLabel: string
  onStart: () => void
}) {
  return (
    <section id={id} className="py-14 bg-background-light">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy mb-2 tracking-tight">
            {title}
          </h2>
          <p className="text-slate-500 text-sm">{subtitle}</p>
        </div>
        <div className={`${columnsClass} gap-3 [column-fill:_balance]`}>{children}</div>
        <div className="text-center mt-10">
          <button
            onClick={onStart}
            className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl shadow-primary/25 inline-flex items-center gap-2 transition-all"
          >
            {startLabel}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  )
}
