// Unified landing primitives for the 4 free-tool quizzes (intro phase only).
// Design language (2026-07-22 개편): 중성 배경 + 사각 단색 버튼 + 6단계 타입 스케일
// (.t-display / .t-h1 / .t-h2 / .t-body / .t-caption / .t-label — src/index.css).
// 도구별 색은 옅은 틴트 '액센트 1점'으로만 쓰고 면을 가득 칠하지 않는다(DESIGN_SYSTEM.md).
// 퀴즈 화면은 QuizScreen, 결과 화면은 IdentityCard + ResultGrid 가 같은 언어를 공유한다.

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
    // 2026-07-22 개편: blur blob 2겹(2020~21년 SaaS 랜딩 관용구) 제거, 핑크 그라디언트
    // 알약 배지 → 담백한 eyebrow, 그라디언트+대형 그림자 CTA → 단색 각진 버튼.
    // 구글 클릭의 43%가 도구 랜딩으로 직행하므로 홈보다 오히려 여기가 첫인상이다.
    <section className="relative py-14 md:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
        <p className="t-eyebrow inline-flex items-center gap-2 text-primary mb-5">
          <span className="material-symbols-outlined text-sm">{badgeIcon}</span>
          {badge}
        </p>
        <h1 className="t-display text-navy mb-5">
          {title}
        </h1>
        <p className="t-body text-slate-600 mb-8 max-w-2xl mx-auto">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button
            onClick={onStart}
            className="bg-primary hover:bg-primary-dark text-white px-10 py-4 text-lg font-bold flex items-center justify-center gap-2 transition-colors"
          >
            {startLabel}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          {previewHref && previewLabel && (
            <a
              href={previewHref}
              className="border border-navy/25 hover:border-navy px-10 py-4 text-lg font-bold flex items-center justify-center gap-2 text-navy transition-colors"
            >
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
        <h2 className="t-h1 text-navy text-center mb-8">
          {title}
        </h2>
        <div className="prose max-w-none t-body text-slate-600 space-y-4">{children}</div>
      </div>
    </section>
  )
}

// Deterministic per-type header height → brick rhythm in the preview masonry.
// 2026-07-22: 그라디언트 색면일 땐 세로로 긴 벽돌이 보기 좋았지만, 단색 옅은 틴트로 바꾸니
// 같은 높이가 '텅 빈 회색 상자'로 읽혔다 → 전체적으로 낮춰 여백을 줄인다.
const TYPE_ASPECTS = ['aspect-[5/4]', 'aspect-square', 'aspect-[4/3]', 'aspect-square']
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
      className="group mb-3 block break-inside-avoid overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-navy"
    >
      {/* 2026-07-22: 2색 그라디언트 패널 + 그림자 이모지 → 단색 틴트 면.
          그라디언트는 면을 가득 칠해 '액센트 1점' 원칙(DESIGN_SYSTEM.md)을 깨고 있었고,
          카드 16장이 나란히 놓이면 색면 16개가 서로 싸워 목록 전체가 시끄러웠다. */}
      <div
        className={`relative ${typeAspect(name)} flex items-center justify-center`}
        style={{ background: `color-mix(in srgb, ${accent} 10%, white)` }}
      >
        <span className="text-6xl md:text-7xl select-none" aria-hidden="true">
          {emoji}
        </span>
      </div>
      <div className="border-t border-slate-100 p-3.5 text-center">
        <div className="t-caption font-bold text-navy group-hover:text-primary transition-colors">
          {name}
        </div>
        <div className="t-eyebrow text-slate-400 mt-1">{sub}</div>
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
          <h2 className="t-h1 text-navy mb-2">
            {title}
          </h2>
          <p className="t-caption text-slate-500">{subtitle}</p>
        </div>
        <div className={`${columnsClass} gap-3 [column-fill:_balance]`}>{children}</div>
        <div className="text-center mt-10">
          <button
            onClick={onStart}
            className="bg-primary hover:bg-primary-dark text-white px-10 py-4 text-lg font-bold inline-flex items-center gap-2 transition-colors"
          >
            {startLabel}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  )
}
