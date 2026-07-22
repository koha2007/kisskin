// Unified landing primitives for the 4 free-tool quizzes (intro phase only).
// Design language (2026-07-22 개편): 중성 배경 + 사각 단색 버튼 + 6단계 타입 스케일
// (.t-display / .t-h1 / .t-h2 / .t-body / .t-caption / .t-label — src/index.css).
// 도구별 색은 옅은 틴트 '액센트 1점'으로만 쓰고 면을 가득 칠하지 않는다(DESIGN_SYSTEM.md).
// 퀴즈 화면은 QuizScreen, 결과 화면은 IdentityCard + ResultGrid 가 같은 언어를 공유한다.

import type { ReactNode } from 'react'

export type HeroChip = { icon: string; label: string }

/** 히어로 수치 스트립 한 칸 — 값이 먼저, 라벨이 뒤. */
export type HeroStat = { value: string; label: string }

/** 히어로 안에서 바로 답하는 1번 문항. */
export type HeroFirstQuestion = {
  tag: string
  text: string
  options: { key: string | number; label: string; emoji?: string; onSelect: () => void }[]
}

/**
 * 도구 랜딩 히어로 (2026-07-22 구조 개편).
 *
 * 이전 구조: 제목 → 설명 → [테스트 시작] 버튼 → 아이콘 칩 3개.
 * 문제 ① 시작하려면 버튼을 한 번 눌러 화면을 갈아엎어야 했다. 진단 도구에서
 *        이 한 단계가 통째로 이탈 지점이다.
 *      ② 아이콘 칩("약 2분", "무료")은 장식에 가까웠고, 정작 사람이 알고 싶은
 *        "몇 문항이고 결과가 몇 가지냐"는 어디에도 없었다.
 *
 * 바꾼 것:
 * · YouCam 이 업로드존을 히어로에 박아 "시작" 단계를 없앤 것처럼,
 *   **1번 문항을 히어로 안에 그대로 노출**한다. 보기를 누르면 곧바로 2번 문항이다.
 * · 16Personalities 가 규모("10억 회 응시")를 앞세우듯 **수치 스트립**을 올린다.
 *   단, 지어낸 숫자는 쓰지 않는다 — 문항 수·소요 시간·유형 수는 전부 사실이다.
 */
export function ToolHero({
  badge,
  badgeIcon,
  title,
  subtitle,
  startLabel,
  onStart,
  previewHref,
  previewLabel,
  stats,
  firstQuestion,
}: {
  badge: string
  badgeIcon: string
  title: ReactNode
  subtitle: ReactNode
  startLabel: string
  onStart: () => void
  previewHref?: string
  previewLabel?: string
  stats: HeroStat[]
  firstQuestion?: HeroFirstQuestion
}) {
  return (
    <section className="relative bg-white py-14 md:py-20">
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <p className="t-eyebrow mb-5 inline-flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-sm">{badgeIcon}</span>
          {badge}
        </p>
        <h1 className="t-display mb-5 text-navy">{title}</h1>
        <p className="t-body mx-auto mb-8 max-w-2xl text-slate-600">{subtitle}</p>

        {/* 수치 스트립 — 값이 크고 라벨이 작다. 전부 실제 값이다. */}
        <dl className="mx-auto mb-10 flex max-w-lg justify-center divide-x divide-slate-200 border-y border-slate-200">
          {stats.map((s) => (
            <div key={s.label} className="flex-1 px-3 py-4">
              <dd className="t-h2 tabular-nums text-navy">{s.value}</dd>
              <dt className="t-label mt-1 text-slate-500">{s.label}</dt>
            </div>
          ))}
        </dl>

        {firstQuestion ? (
          /* 첫 문항을 여기서 바로 받는다 — "시작" 버튼 단계가 사라진다 */
          <div className="mx-auto max-w-xl border border-navy/20 bg-cream p-5 text-left md:p-7">
            <p className="t-eyebrow mb-2 text-primary">{firstQuestion.tag}</p>
            <p className="t-h2 mb-5 text-navy">{firstQuestion.text}</p>
            <div className="flex flex-col gap-2.5">
              {firstQuestion.options.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={o.onSelect}
                  className="flex w-full items-center gap-3 border border-slate-300 bg-white px-4 py-3.5 text-left transition-colors hover:border-navy"
                >
                  {o.emoji && <span className="shrink-0 text-xl">{o.emoji}</span>}
                  <span className="t-body flex-1 font-semibold text-navy">{o.label}</span>
                  <span className="material-symbols-outlined shrink-0 text-slate-400">arrow_forward</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={onStart}
            className="bg-primary px-10 py-4 text-lg font-bold text-white transition-colors hover:bg-primary-dark"
          >
            {startLabel}
          </button>
        )}

        {previewHref && previewLabel && (
          <p className="mt-6">
            <a href={previewHref} className="t-caption font-bold text-navy underline underline-offset-4 hover:text-primary">
              {previewLabel}
            </a>
          </p>
        )}
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
  image,
}: {
  href: string
  emoji: string
  name: string
  sub: string
  accent: string
  /** 실제 결과 사진. 없으면 기존 이모지 + 틴트 면으로 폴백한다. */
  image?: string
}) {
  return (
    <a
      href={href}
      className="group mb-3 block break-inside-avoid overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-navy"
    >
      {/* 2026-07-22: 2색 그라디언트 패널 + 그림자 이모지 → 단색 틴트 면.
          그라디언트는 면을 가득 칠해 '액센트 1점' 원칙(DESIGN_SYSTEM.md)을 깨고 있었고,
          카드 16장이 나란히 놓이면 색면 16개가 서로 싸워 목록 전체가 시끄러웠다. */}
      {/* 2026-07-22: 이모지 + 색면이던 자리에 **실제 결과 사진**을 넣는다.
          유형 16개가 전부 이모지 하나로 구분되던 상태라, 목록을 훑어도 무엇이
          어떻게 다른지 보이지 않았다. 우리 최대 자산은 결과물 사진이다. */}
      <div
        className={`relative ${typeAspect(name)} flex items-center justify-center overflow-hidden`}
        style={{ background: `color-mix(in srgb, ${accent} 10%, white)` }}
      >
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : (
          <span className="text-6xl md:text-7xl select-none" aria-hidden="true">
            {emoji}
          </span>
        )}
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
