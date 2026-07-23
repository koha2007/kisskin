import type { ReactNode } from 'react'
import { useI18n } from '../i18n/I18nContext'

type CalloutType = 'key' | 'warn' | 'data' | 'tip'

const CALLOUT_STYLES: Record<CalloutType, { border: string; label: string; labelEn: string; labelColor: string }> = {
  key: {
    border: 'border-primary',
    label: '핵심',
    labelEn: 'Key',
    labelColor: 'text-primary',
  },
  warn: {
    border: 'border-amber-500',
    label: '주의',
    labelEn: 'Note',
    labelColor: 'text-amber-600',
  },
  data: {
    border: 'border-slate-400',
    label: '데이터',
    labelEn: 'Data',
    labelColor: 'text-slate-500',
  },
  tip: {
    border: 'border-emerald-500',
    label: '팁',
    labelEn: 'Tip',
    labelColor: 'text-emerald-600',
  },
}

export function Callout({ type = 'key', children }: { type?: CalloutType; children: ReactNode }) {
  const { locale } = useI18n()
  const s = CALLOUT_STYLES[type]
  return (
    <aside className={`not-prose my-7 border-l-2 ${s.border} pl-5 py-1`}>
      <div className={`text-[10px] font-bold uppercase tracking-[0.22em] ${s.labelColor} mb-2`}>
        {locale === 'en' ? s.labelEn : s.label}
      </div>
      <div className="text-[15px] md:text-[16px] text-slate-700 leading-[1.7]">
        {children}
      </div>
    </aside>
  )
}

/**
 * TLDR — top-of-article summary box (Stratechery / Allure pattern).
 * Renders 3-bullet "이 글의 핵심" before body so skimmers get value
 * without reading to the end.
 */
export function TLDR({ points }: { points: string[] }) {
  const { locale } = useI18n()
  if (!points.length) return null
  return (
    <aside className="not-prose mb-9 md:mb-10 p-5 md:p-6 bg-slate-50 border border-slate-200 rounded-lg">
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 mb-3">
        {locale === 'en' ? 'The gist' : '이 글의 핵심'}
      </div>
      <ul className="space-y-2.5">
        {points.map((p, i) => (
          <li key={i} className="flex gap-3 text-[14px] md:text-[15px] text-slate-700 leading-[1.6]">
            <span className="shrink-0 mt-2 w-1 h-1 rounded-full bg-primary" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}

/**
 * Verdict — strong end-of-article recommendation box (Byrdie pattern).
 * More visual weight than a Callout — used sparingly for "buy/skip" type
 * conclusions in reviews.
 */
export function Verdict({ children, label = 'Final Verdict' }: { children: ReactNode; label?: string }) {
  return (
    <aside className="not-prose my-10 p-6 md:p-7 bg-primary/5 border border-primary/20 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
          stars
        </span>
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          {label}
        </div>
      </div>
      <div className="text-[16px] md:text-[17px] text-slate-800 leading-[1.6] font-medium">
        {children}
      </div>
    </aside>
  )
}

/**
 * SkipTry — "Skip if / Try if" decision box (Byrdie pattern).
 * Two-column quick-read help.
 */
export function SkipTry({ skip, tryFor }: { skip: string; tryFor: string }) {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  return (
    <div className="not-prose my-8 grid sm:grid-cols-2 gap-4">
      <div className="p-5 border border-slate-200 rounded-lg">
        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
            block
          </span>
          {isEn ? 'SKIP IF' : '이런 분은 SKIP'}
        </div>
        <p className="text-[14px] md:text-[15px] text-slate-700 leading-[1.6]">{skip}</p>
      </div>
      <div className="p-5 border border-slate-200 rounded-lg">
        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-600">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          {isEn ? 'TRY IF' : '이런 분은 TRY'}
        </div>
        <p className="text-[14px] md:text-[15px] text-slate-700 leading-[1.6]">{tryFor}</p>
      </div>
    </div>
  )
}

export function PullQuote({ text, source }: { text: string; source?: string }) {
  return (
    <blockquote className="not-prose my-9 md:my-12 px-2 md:px-0">
      <p className="text-[19px] md:text-[24px] font-semibold text-navy leading-[1.4] tracking-tight">
        {text}
      </p>
      {source && (
        <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
          — {source}
        </div>
      )}
    </blockquote>
  )
}

export function DataTable({
  caption,
  headers,
  rows,
}: {
  caption?: string
  headers: string[]
  rows: string[][]
}) {
  return (
    <figure className="not-prose my-8 overflow-x-auto">
      {caption && (
        <figcaption className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
          {caption}
        </figcaption>
      )}
      <table className="w-full text-sm border-t border-b border-slate-300">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-3 md:px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 border-b border-slate-200 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-b-0">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-3 md:px-4 py-3 align-top text-[14px] text-slate-700 ${j === 0 ? 'font-semibold text-navy' : ''}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

export interface StepItem {
  title: string
  desc: string
  icon?: string
}

export function StepList({ items }: { items: StepItem[] }) {
  return (
    <ol className="not-prose my-8 space-y-5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-4">
          <div className="shrink-0 w-7 h-7 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center font-bold text-[13px] mt-0.5">
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] md:text-[16px] font-bold text-navy mb-1">{item.title}</h3>
            <p className="text-[14px] md:text-[15px] text-slate-600 leading-[1.7]">{item.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/**
 * ToolCta — in-article link into one of our free tools.
 *
 * SEO 유입은 글에 떨어지는데, 정작 그 글에서 도구로 넘어갈 길이 없었다(본문은 링크를
 * 지원하지 않는 평문 배열). 검색 키워드로 들어온 독자를 해당 도구로 넘기는 통로다.
 */
export function ToolCta({ label, href, desc }: { label: string; href: string; desc?: string }) {
  return (
    <a
      href={href}
      className="not-prose group my-8 flex items-center gap-4 rounded-2xl border border-primary/25 bg-primary/[0.04] px-5 py-4 no-underline transition-colors hover:bg-primary/[0.09]"
    >
      <span
        className="material-symbols-outlined shrink-0 text-primary text-[26px]"
        style={{ fontVariationSettings: "'FILL' 1" }}
        aria-hidden
      >
        palette
      </span>
      <span className="flex-1">
        <span className="block font-extrabold text-navy leading-snug">{label}</span>
        {desc && <span className="mt-0.5 block text-[13.5px] leading-snug text-slate-600">{desc}</span>}
      </span>
      <span
        className="material-symbols-outlined shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
        aria-hidden
      >
        arrow_forward
      </span>
    </a>
  )
}

/**
 * Body block parser — interpret special string prefixes inside body[] arrays.
 *
 * Markers:
 *   `> KEY: ...`            -> Callout type="key"
 *   `> WARN: ...`           -> Callout type="warn"
 *   `> DATA: ...`           -> Callout type="data"
 *   `> TIP: ...`            -> Callout type="tip"
 *   `> QUOTE: text`         -> PullQuote
 *   `> QUOTE: text | src`   -> PullQuote source=src
 *   `> VERDICT: text`       -> Verdict (high-emphasis conclusion)
 *   `> SKIP: skip | TRY: t` -> SkipTry decision box
 *   `> TOOL: label | /href | desc`  -> ToolCta (본문 → 무료 도구 링크)
 *   `## Heading`            -> h2
 */
export function renderBody(body: string[]): ReactNode[] {
  let leadAssigned = false
  return body.map((p, i) => {
    if (p.startsWith('## ')) {
      return (
        <h2
          key={i}
          className="text-[22px] md:text-[26px] font-bold text-navy mt-12 mb-2 tracking-tight"
        >
          {p.slice(3)}
        </h2>
      )
    }
    if (p.startsWith('> TLDR: ')) {
      const points = p.slice(8).split(' | ').map((s) => s.trim()).filter(Boolean)
      return <TLDR key={i} points={points} />
    }
    if (p.startsWith('> KEY: ')) return <Callout key={i} type="key">{p.slice(7)}</Callout>
    if (p.startsWith('> WARN: ')) return <Callout key={i} type="warn">{p.slice(8)}</Callout>
    if (p.startsWith('> DATA: ')) return <Callout key={i} type="data">{p.slice(8)}</Callout>
    if (p.startsWith('> TIP: ')) return <Callout key={i} type="tip">{p.slice(7)}</Callout>
    if (p.startsWith('> VERDICT: ')) return <Verdict key={i}>{p.slice(11)}</Verdict>
    if (p.startsWith('> SKIP: ') && p.includes(' | TRY: ')) {
      const [skip, tryFor] = p.slice(8).split(' | TRY: ')
      return <SkipTry key={i} skip={skip.trim()} tryFor={tryFor.trim()} />
    }
    if (p.startsWith('> TOOL: ')) {
      const [label, href, desc] = p.slice(8).split(' | ').map((s) => s.trim())
      if (label && href) return <ToolCta key={i} label={label} href={href} desc={desc} />
    }
    if (p.startsWith('> QUOTE: ')) {
      const rest = p.slice(9)
      const [text, source] = rest.split(' | ')
      return <PullQuote key={i} text={text.trim()} source={source?.trim()} />
    }
    if (!leadAssigned) {
      leadAssigned = true
      return (
        <p key={i} className="text-[17px] md:text-[19px] text-slate-800 font-medium">
          {p}
        </p>
      )
    }
    return <p key={i}>{p}</p>
  })
}
