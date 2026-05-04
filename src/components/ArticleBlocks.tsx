import type { ReactNode } from 'react'

type CalloutType = 'key' | 'warn' | 'data' | 'tip'

const CALLOUT_STYLES: Record<CalloutType, { border: string; label: string; labelColor: string }> = {
  key: {
    border: 'border-rose-400',
    label: '핵심',
    labelColor: 'text-rose-500',
  },
  warn: {
    border: 'border-amber-500',
    label: '주의',
    labelColor: 'text-amber-600',
  },
  data: {
    border: 'border-slate-400',
    label: '데이터',
    labelColor: 'text-slate-500',
  },
  tip: {
    border: 'border-emerald-500',
    label: '팁',
    labelColor: 'text-emerald-600',
  },
}

export function Callout({ type = 'key', children }: { type?: CalloutType; children: ReactNode }) {
  const s = CALLOUT_STYLES[type]
  return (
    <aside className={`not-prose my-7 border-l-2 ${s.border} pl-5 py-1`}>
      <div className={`text-[10px] font-bold uppercase tracking-[0.22em] ${s.labelColor} mb-2`}>
        {s.label}
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
  if (!points.length) return null
  return (
    <aside className="not-prose mb-9 md:mb-10 p-5 md:p-6 bg-slate-50 border border-slate-200 rounded-lg">
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 mb-3">
        이 글의 핵심
      </div>
      <ul className="space-y-2.5">
        {points.map((p, i) => (
          <li key={i} className="flex gap-3 text-[14px] md:text-[15px] text-slate-700 leading-[1.6]">
            <span className="shrink-0 mt-2 w-1 h-1 rounded-full bg-rose-400" />
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
    <aside className="not-prose my-10 p-6 md:p-7 bg-gradient-to-br from-rose-50/60 to-pink-50/40 border border-rose-200/70 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-rose-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
          stars
        </span>
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-rose-500">
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
  return (
    <div className="not-prose my-8 grid sm:grid-cols-2 gap-4">
      <div className="p-5 border border-slate-200 rounded-lg">
        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
            block
          </span>
          이런 분은 SKIP
        </div>
        <p className="text-[14px] md:text-[15px] text-slate-700 leading-[1.6]">{skip}</p>
      </div>
      <div className="p-5 border border-slate-200 rounded-lg">
        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-600">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          이런 분은 TRY
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
