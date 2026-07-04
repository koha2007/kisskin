// Pinterest-style masonry result layout for the free-tool result pages.
// Pure CSS multi-column (column-count) — zero dependencies (재설계 지시 §2).
// Mobile 2 columns / desktop 3, cards keep their natural height and
// `break-inside-avoid` stops a card from splitting across columns.

import { useState, type ReactNode } from 'react'

/** Masonry container. Children should be <GridCard>-based cards. */
export default function ResultGrid({ children }: { children: ReactNode }) {
  return <div className="columns-2 md:columns-3 gap-3 [column-fill:_balance]">{children}</div>
}

/** Base card shell — rounded, bordered, tap-bounce, never splits across columns.
 * `tint` paints a soft pastel background (type-color family) so the grid reads
 * as a moodboard rather than a wall of identical white cards (재설계 지시 §3). */
export function GridCard({
  children,
  className = '',
  accent,
  tint,
}: {
  children: ReactNode
  className?: string
  accent?: string
  tint?: string
}) {
  const edge = tint ?? accent
  return (
    <div
      className={`mb-3 break-inside-avoid rounded-2xl border shadow-sm active:scale-[0.98] transition-transform ${className}`}
      style={{
        borderColor: edge ? `${edge}33` : '#e9e4dd',
        background: tint ? `${tint}1f` : '#fff',
      }}
    >
      {children}
    </div>
  )
}

/** Image that degrades to a type-color gradient (+ optional emoji) instead of the
 * browser's broken-image box when the src is missing OR fails to load.
 * Operator mood photos land in each tool's `moodImages.ts`; until then (or if a
 * placeholder host 404s) this keeps the moodboard intact — never a red box
 * (운영자 지시: 실패 시 유형색 그라데이션/회색). */
function MoodImage({
  src,
  alt,
  gradient,
  emoji,
  className = 'absolute inset-0 h-full w-full object-cover',
}: {
  src?: string
  alt: string
  gradient?: [string, string]
  emoji?: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    const bg = gradient
      ? `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`
      : 'linear-gradient(135deg, #ece7df, #d3ccc2)'
    return (
      <div className="absolute inset-0 flex items-center justify-center text-7xl select-none" style={{ background: bg }}>
        <span className="drop-shadow-lg">{emoji}</span>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}

/** Big mood image with a one-line caption. Falls back to a gradient + emoji. */
export function MoodCard({
  image,
  caption,
  emoji,
  gradient,
}: {
  image?: string
  caption: string
  emoji?: string
  gradient: [string, string]
}) {
  return (
    <GridCard className="overflow-hidden">
      <div className="relative aspect-[3/4]">
        <MoodImage src={image} alt={caption} gradient={gradient} emoji={emoji} />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent p-3.5">
          <p className="text-white text-sm font-semibold leading-snug">{caption}</p>
        </div>
      </div>
    </GridCard>
  )
}

/** Color-swatch palette card. */
export function PaletteCard({
  title,
  swatches,
  accent,
}: {
  title: string
  swatches: { label: string; hex: string }[]
  accent?: string
}) {
  return (
    <GridCard className="p-4" accent={accent}>
      <h3 className="text-sm font-extrabold text-navy mb-3">{title}</h3>
      <div className="grid grid-cols-4 gap-2.5">
        {swatches.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1.5">
            <span
              className="w-full aspect-square rounded-xl border border-black/5 shadow-inner"
              style={{ background: s.hex }}
            />
            <span className="text-[10px] font-medium text-slate-500 text-center leading-tight">{s.label}</span>
          </div>
        ))}
      </div>
    </GridCard>
  )
}

/** Small icon + label + body. Used for traits / makeup matches.
 * `tint` varies the card background within the type-color family; the icon stays
 * subtle (soft chip, accent glyph) so the row no longer reads as identical
 * orange circles (재설계 지시 §3). */
export function IconCard({
  icon,
  label,
  text,
  accent = '#eb4763',
  tint,
}: {
  icon: string
  label: string
  text: string
  accent?: string
  tint?: string
}) {
  return (
    <GridCard className="p-4" accent={accent} tint={tint}>
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5"
        style={{ background: `${accent}1f`, color: accent }}
      >
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
      <div className="text-[0.62rem] uppercase tracking-wider font-bold text-slate-400 mb-1">{label}</div>
      <p className="text-[13px] text-slate-600 leading-relaxed">{text}</p>
    </GridCard>
  )
}

/** Mid-size mood image with a label + caption overlay. Smaller sibling of
 * MoodCard — used to lift the image-to-text ratio (재설계 지시 §2). Degrades to a
 * type-color gradient (+emoji) when the image is missing or fails to load. */
export function ImageCard({
  image,
  label,
  caption,
  gradient,
  emoji,
}: {
  image?: string
  label?: string
  caption: string
  gradient?: [string, string]
  emoji?: string
}) {
  return (
    <GridCard className="overflow-hidden">
      <div className="relative aspect-[4/5]">
        <MoodImage src={image} alt={caption} gradient={gradient} emoji={emoji} />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent p-3">
          {label && (
            <div className="text-[0.6rem] uppercase tracking-wider font-bold text-white/80 mb-0.5">{label}</div>
          )}
          <p className="text-white text-[13px] font-semibold leading-snug">{caption}</p>
        </div>
      </div>
    </GridCard>
  )
}

/** Axis-score bars (E/I · S/N …) for the MBTI result. Mirrors the type-color
 * family via `tint` so it sits inside the moodboard rather than a stark panel. */
export function AxisCard({
  title,
  axes,
  accent = '#eb4763',
  tint,
}: {
  title: string
  axes: { label: string; left: string; right: string; value: number }[]
  accent?: string
  tint?: string
}) {
  return (
    <GridCard className="p-4" accent={accent} tint={tint}>
      <h3 className="text-sm font-extrabold text-navy mb-3">{title}</h3>
      <div className="space-y-3">
        {axes.map((a) => (
          <div key={a.label}>
            <div className="flex items-center justify-between text-[0.68rem] text-slate-500 mb-1">
              <span>{a.left}</span>
              <span>{a.right}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full" style={{ width: `${a.value}%`, background: accent }} />
            </div>
          </div>
        ))}
      </div>
    </GridCard>
  )
}

/** Single tip with a bulb glyph. */
export function TipCard({ tip, accent = '#eb4763', tint }: { tip: string; accent?: string; tint?: string }) {
  return (
    <GridCard className="p-4" accent={accent} tint={tint}>
      <span className="material-symbols-outlined text-lg mb-2 block" style={{ color: accent }}>
        lightbulb
      </span>
      <p className="text-[13px] text-slate-600 leading-relaxed">{tip}</p>
    </GridCard>
  )
}

/** Title + text chips (optionally struck-through for "avoid" lists). */
export function ChipsCard({
  title,
  chips,
  strike = false,
  accent,
  tint,
}: {
  title: string
  chips: string[]
  strike?: boolean
  accent?: string
  tint?: string
}) {
  return (
    <GridCard className="p-4" accent={accent} tint={tint}>
      <h3 className="text-sm font-extrabold text-navy mb-3">{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <span
            key={c}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              strike ? 'text-slate-400 border-slate-200 line-through' : 'text-slate-700 border-slate-200 bg-slate-50'
            }`}
          >
            {c}
          </span>
        ))}
      </div>
    </GridCard>
  )
}

/** Collapsible card that preserves long SEO prose under a tap. */
export function AccordionCard({
  title,
  paragraphs,
  accent = '#eb4763',
}: {
  title: string
  paragraphs: string[]
  accent?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <GridCard className="p-4" accent={accent}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-extrabold text-navy">{title}</span>
        <span className="material-symbols-outlined text-slate-400 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
          expand_more
        </span>
      </button>
      {open && (
        <div className="mt-3 space-y-3 text-[13px] text-slate-600 leading-relaxed">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
    </GridCard>
  )
}

/** Simple promo banner card — e.g. AI makeup CTA. No price (재설계 지시 §3). */
export function BannerCard({
  title,
  desc,
  ctaLabel,
  href,
  gradient,
}: {
  title: string
  desc: string
  ctaLabel: string
  href: string
  gradient: [string, string]
}) {
  return (
    <GridCard className="overflow-hidden">
      <a
        href={href}
        className="block p-5 text-white"
        style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
      >
        <span className="material-symbols-outlined text-2xl mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>
          auto_awesome
        </span>
        <h3 className="text-base font-extrabold mb-1.5 leading-snug">{title}</h3>
        <p className="text-[12px] text-white/85 leading-relaxed mb-3">{desc}</p>
        <span className="inline-flex items-center gap-1 text-[13px] font-bold bg-white/20 rounded-full px-3.5 py-1.5">
          {ctaLabel}
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </span>
      </a>
    </GridCard>
  )
}
