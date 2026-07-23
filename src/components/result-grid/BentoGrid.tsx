// 무료 도구 결과 페이지 — 벤토(bento) 그리드.
//
// 왜 바꿨나 (2026-07-23):
//   기존 ResultGrid 는 column-count 마소니라 **모든 타일이 같은 폭**이었다. 그래서 사진,
//   막대그래프, 한 줄짜리 팩트, 팁, 제품, CTA 가 전부 똑같은 회색 라운드 박스로 나열됐다.
//   특히 `시그니처 · 립 / 아이 / 베이스 / 블러쉬` 처럼 **접두사가 같은 한 줄짜리 카드 4~5개**가
//   각각 박스를 하나씩 차지해, 결과 페이지가 "문장 하나에 테두리를 두른 것"의 벽이 됐다.
//   카드의 존재 이유는 정보를 스캔 가능한 단위로 **묶는** 것인데 정반대로 쓰고 있었다.
//
// 두 가지 원칙:
//   ① 크기가 정보의 종류를 말한다 — 사진·데이터 패널은 넓게, 한 줄 팩트는 묶어서 촘촘히.
//   ② 표면(surface)은 아껴 쓴다 — 여러 팩트를 묶는 타일과 제품만 테두리를 갖고,
//      단일 노트는 테두리 없이 은은한 틴트만 깔아 크림 배경 위에 얹는다.
//
// 레이아웃은 열 스팬만 쓴다(행 스팬은 사진 1장 예외). 타일은 행 높이에 맞춰 늘어나며
// 내용은 위로 정렬된다 — 전형적인 벤토이고, 텍스트 길이가 달라져도 깨지지 않는다.

import { useState, type ReactNode } from 'react'
import { isInternalTraffic } from '../../lib/internalTraffic'

// 타일 제목 공통 스타일.
// ⚠️ uppercase / tracking 확장을 붙이지 말 것 — 이 제목들은 대부분 한글이고(`시그니처 룩`,
//    `나를 설명하는 것`), 한글에 자간을 벌리면 글자가 낱개로 흩어져 읽기 나빠진다.
//    index.css 의 .t-eyebrow(영문 전용) / .t-label(한글) 구분이 그 이유로 있다.
const TILE_TITLE = 't-label text-slate-400 mb-3'

/** 타일 폭. 모바일은 2열, md 이상 4열 기준. */
export type BentoSpan = 'sm' | 'wide' | 'full'

const SPAN: Record<BentoSpan, string> = {
  sm: 'col-span-1',
  wide: 'col-span-2',
  full: 'col-span-2 md:col-span-4',
}

/** 표면 종류. `plain` 이 기본이어야 회색 박스 벽이 다시 생기지 않는다. */
export type BentoSurface = 'card' | 'tint' | 'plain'

export default function BentoGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3 md:auto-rows-[minmax(9rem,auto)] [grid-auto-flow:dense]">
      {children}
    </div>
  )
}

export function BentoTile({
  children,
  span = 'sm',
  surface = 'plain',
  accent,
  className = '',
  rowSpan,
}: {
  children: ReactNode
  span?: BentoSpan
  surface?: BentoSurface
  accent?: string
  className?: string
  rowSpan?: 2
}) {
  const a = accent ?? '#d8503c'
  const style =
    surface === 'card'
      ? { background: '#fff', borderColor: `${a}26` }
      : surface === 'tint'
        ? { background: `${a}14`, borderColor: 'transparent' }
        : { background: 'transparent', borderColor: 'transparent' }
  return (
    <div
      className={`${SPAN[span]} ${rowSpan === 2 ? 'md:row-span-2' : ''} min-w-0 rounded-lg border overflow-hidden ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

/** 이미지가 없거나 로드에 실패하면 유형색 그라데이션으로 떨어진다. 절대 깨진 이미지 박스를
 *  보여주지 않는다(운영자 지시). ResultGrid 의 동작을 그대로 승계. */
function MoodImage({
  src,
  alt,
  gradient,
  emoji,
}: {
  src?: string
  alt: string
  gradient?: [string, string]
  emoji?: string
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
      className="absolute inset-0 h-full w-full object-cover"
    />
  )
}

/** 히어로 사진 타일 — 격자에서 가장 큰 덩어리. 시선의 출발점을 만든다. */
export function BentoPhoto({
  image,
  caption,
  emoji,
  gradient,
  span = 'wide',
}: {
  image?: string
  caption: string
  emoji?: string
  gradient: [string, string]
  span?: BentoSpan
}) {
  return (
    <BentoTile span={span} rowSpan={2} className="relative min-h-[15rem] md:min-h-0">
      <MoodImage src={image} alt={caption} gradient={gradient} emoji={emoji} />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4">
        <p className="t-caption font-semibold text-white">{caption}</p>
      </div>
    </BentoTile>
  )
}

/** 제목 + 임의 내용의 넓은 패널. 막대그래프·스와치처럼 **시각 정보**에만 쓴다. */
export function BentoPanel({
  title,
  children,
  span = 'wide',
  accent,
}: {
  title: string
  children: ReactNode
  span?: BentoSpan
  accent?: string
}) {
  return (
    <BentoTile span={span} surface="card" accent={accent} className="p-4 md:p-5">
      <h3 className={TILE_TITLE}>{title}</h3>
      {children}
    </BentoTile>
  )
}

/** ★ 이 파일의 핵심.
 *  접두사가 같은 한 줄짜리 팩트들(`시그니처 · 립/아이/베이스/블러쉬`)을 카드 4장이 아니라
 *  **타일 1장 안의 행 4개**로 낸다. 행 사이는 머리카락 선 하나뿐이고 개별 테두리·아이콘 칩이
 *  없어서, 회색 박스 4개가 사라지고 대신 읽히는 표 하나가 남는다. */
export function BentoFacts({
  title,
  rows,
  accent,
  span = 'wide',
}: {
  title?: string
  rows: { label: string; text: string }[]
  accent?: string
  span?: BentoSpan
}) {
  const a = accent ?? '#d8503c'
  return (
    <BentoTile span={span} surface="card" accent={accent} className="p-4 md:p-5">
      {title && <h3 className={TILE_TITLE}>{title}</h3>}
      <dl className="divide-y" style={{ borderColor: `${a}1f` }}>
        {rows.map((r, i) => (
          <div key={`${r.label}-${i}`} className="py-2.5 first:pt-0 last:pb-0 sm:flex sm:gap-4" style={i > 0 ? { borderTopWidth: 1, borderColor: `${a}1f` } : undefined}>
            <dt className="t-label shrink-0 sm:w-24 mb-0.5 sm:mb-0 sm:pt-[0.15rem]" style={{ color: a }}>
              {r.label}
            </dt>
            <dd className="t-caption text-slate-600 min-w-0">{r.text}</dd>
          </div>
        ))}
      </dl>
    </BentoTile>
  )
}

/** 단일 노트(팁·주의). 테두리 없이 틴트만 — 격자 안의 '쉼표' 역할이다. */
export function BentoNote({
  icon,
  label,
  text,
  accent,
  span = 'sm',
  tone = 'tint',
}: {
  icon: string
  label?: string
  text: string
  accent?: string
  span?: BentoSpan
  tone?: BentoSurface
}) {
  const a = accent ?? '#d8503c'
  return (
    <BentoTile span={span} surface={tone} accent={accent} className="p-4">
      <span className="material-symbols-outlined text-lg mb-2 block" style={{ color: a }}>
        {icon}
      </span>
      {label && <div className="t-label mb-1" style={{ color: a }}>{label}</div>}
      <p className="t-caption text-slate-600">{text}</p>
    </BentoTile>
  )
}

/** 텍스트 칩 묶음(어울리는/피할 색 등). */
export function BentoChips({
  title,
  chips,
  strike = false,
  accent,
  span = 'wide',
}: {
  title: string
  chips: string[]
  strike?: boolean
  accent?: string
  span?: BentoSpan
}) {
  return (
    <BentoTile span={span} surface="card" accent={accent} className="p-4 md:p-5">
      <h3 className={TILE_TITLE}>{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <span
            key={c}
            className={`t-label px-2.5 py-1 rounded-full border ${
              strike ? 'text-slate-400 border-slate-200 line-through' : 'text-slate-700 border-slate-200 bg-slate-50'
            }`}
          >
            {c}
          </span>
        ))}
      </div>
    </BentoTile>
  )
}

/** 색 스와치 패널 — 퍼스널컬러 전용. 색 자체가 진단 내용이라 가장 넓게 간다. */
export function BentoPalette({
  title,
  swatches,
  accent,
  span = 'wide',
}: {
  title: string
  swatches: { label: string; hex: string }[]
  accent?: string
  span?: BentoSpan
}) {
  return (
    <BentoPanel title={title} span={span} accent={accent}>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
        {swatches.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1.5">
            <span className="w-full aspect-square rounded-md border border-black/5" style={{ background: s.hex }} />
            <span className="t-label text-slate-500 text-center leading-tight">{s.label}</span>
          </div>
        ))}
      </div>
    </BentoPanel>
  )
}

/** 축 점수 막대 — MBTI 전용. */
export function BentoAxes({
  title,
  axes,
  accent,
  span = 'wide',
}: {
  title: string
  axes: { label: string; left: string; right: string; value: number }[]
  accent?: string
  span?: BentoSpan
}) {
  const a = accent ?? '#d8503c'
  return (
    <BentoPanel title={title} span={span} accent={accent}>
      <div className="space-y-3">
        {axes.map((x) => (
          <div key={x.label}>
            <div className="t-label flex items-center justify-between text-slate-500 mb-1">
              <span>{x.left}</span>
              <span>{x.right}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${x.value}%`, background: a }} />
            </div>
          </div>
        ))}
      </div>
    </BentoPanel>
  )
}

/** 다음 행동 배너(AI 메이크업 등). 격자 폭을 다 쓴다. */
export function BentoBanner({
  title,
  desc,
  ctaLabel,
  href,
  gradient,
  tool,
  slug,
}: {
  title: string
  desc: string
  ctaLabel: string
  href: string
  gradient: [string, string]
  /** GA4 프로모션 추적용 도구 식별자(예: 'personal_color'). 없으면 추적하지 않는다. */
  tool?: string
  /** 결과 유형 슬러그. */
  slug?: string
}) {
  /**
   * 무료 도구 결과 → AI 메이크업으로 넘어가는 유일한 지점이라 측정이 필요하다.
   *
   * 2026-06-17 그리드 재설계(b4821e1)에서 ToolUpsellCTA 가 결과 페이지 4종에서
   * 빠지면서 `select_promotion` 이 5주 넘게 한 번도 발화하지 않았다(GA4 이벤트
   * 목록에 이름조차 없었다). 그 자리를 이 배너가 대신하고 있었는데 이벤트가
   * 붙어 있지 않아, 결과를 본 사람 중 몇 명이 넘어가는지 알 수 없었다.
   *
   * 이벤트 이름·파라미터는 옛 ToolUpsellCTA 와 똑같이 맞춘다 — 이름을 바꾸면
   * 5월~6월 데이터와 이어 볼 수 없다. creative_slot 만 'bento_banner' 로 구분한다.
   */
  const trackClick = () => {
    if (!tool || isInternalTraffic()) return
    ;(window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', 'select_promotion', {
      promotion_id: `tool_cta_${tool}`,
      promotion_name: `${tool} result → AI analysis`,
      creative_slot: 'bento_banner',
      items: slug ? [{ item_id: slug, item_name: `${tool}:${slug}` }] : undefined,
    })
  }

  return (
    <BentoTile span="full">
      <a
        href={href}
        onClick={trackClick}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 md:p-6 text-white"
        style={{ background: `linear-gradient(120deg, ${gradient[0]}, ${gradient[1]})` }}
      >
        <div className="min-w-0">
          <h3 className="t-body font-bold mb-1">{title}</h3>
          <p className="t-caption text-white/85">{desc}</p>
        </div>
        <span className="t-caption inline-flex shrink-0 items-center gap-1.5 font-bold bg-white/20 px-4 py-2.5">
          {ctaLabel}
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </span>
      </a>
    </BentoTile>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   ④ 구매 CTA — 결정적 분산(deterministic scatter)

   운영자 요청은 "구매 메뉴를 랜덤 위치로"였다. 방향은 맞다 — 제품 카드를 늘 격자 끝에
   두었더니 affiliate_click 이 28일간 0건이었고, 원인은 그 카드가 마소니 18/20번째였다는
   것이었다(배너 블라인드니스: 사용자는 정해진 위치를 학습해서 건너뛴다).

   다만 **순수 랜덤은 쓰지 않는다.**
     ⓐ 새로고침마다 위치가 바뀌면 레이아웃이 흔들려 CLS 가 튄다. 바로 직전에 CLS 0.56(나쁨)을
        잡아 놓은 참이다.
     ⓑ GA4 에서 "몇 번째 슬롯이 먹혔는가"를 잴 수 없어진다. 측정이 안 되면 다음 판단도 없다.

   그래서 **유형 코드를 시드로 한 해시**로 위치를 정한다. ISTJ 는 언제나 3번째, ENFP 는
   언제나 7번째 — 페이지마다 흩어지지만 같은 페이지는 항상 같은 자리다. 랜덤의 효과(위치
   학습 방지)는 얻고 CLS 와 측정 가능성은 잃지 않는다.
   ───────────────────────────────────────────────────────────────────────── */

/** FNV-1a — 짧은 문자열용 결정적 해시. 암호용이 아니라 슬롯 선택용. */
function seedHash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * `items` 를 `base` 안의 결정적 위치들에 흩어 넣는다.
 * 구간을 items 개수만큼 나눈 뒤 각 구간 안에서 시드 해시로 한 자리를 고르므로,
 * 제품 카드끼리 몰리지 않으면서 페이지마다 다른 자리에 앉는다.
 *
 * @param minIndex 이 인덱스 앞으로는 넣지 않는다(사진·주요 패널을 밀어내지 않도록).
 */
export function insertScattered<T>(base: T[], items: T[], seed: string, minIndex = 2): T[] {
  if (items.length === 0) return base
  const start = Math.min(minIndex, base.length)
  const room = Math.max(1, base.length - start)
  const span = Math.max(1, Math.floor(room / items.length))
  let h = seedHash(seed)

  const picks = items.map((item, i) => {
    h = Math.imul(h ^ (i + 1), 16777619) >>> 0
    const at = Math.min(base.length, start + i * span + (h % span))
    return { at, item }
  })

  const out = [...base]
  // 뒤에서부터 넣어야 앞서 계산한 인덱스가 밀리지 않는다.
  picks.sort((a, b) => b.at - a.at).forEach(({ at, item }) => out.splice(at, 0, item))
  return out
}

/** 제품 카드가 실제로 앉은 슬롯 번호 — GA4 에 실어 "몇 번째가 먹히는가"를 잰다. */
export function scatterSlot(seed: string, index: number, total: number, baseLen: number, minIndex = 2): number {
  const start = Math.min(minIndex, baseLen)
  const room = Math.max(1, baseLen - start)
  const span = Math.max(1, Math.floor(room / Math.max(1, total)))
  let h = seedHash(seed)
  for (let i = 0; i <= index; i++) h = Math.imul(h ^ (i + 1), 16777619) >>> 0
  return Math.min(baseLen, start + index * span + (h % span))
}
