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
 *   `> KEY: ...`         -> Callout type="key"
 *   `> WARN: ...`        -> Callout type="warn"
 *   `> DATA: ...`        -> Callout type="data"
 *   `> TIP: ...`         -> Callout type="tip"
 *   `> QUOTE: text`      -> PullQuote
 *   `> QUOTE: text | src`-> PullQuote source=src
 *   `## Heading`         -> h2
 */
export function renderBody(body: string[]): ReactNode[] {
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
    if (p.startsWith('> KEY: ')) return <Callout key={i} type="key">{p.slice(7)}</Callout>
    if (p.startsWith('> WARN: ')) return <Callout key={i} type="warn">{p.slice(8)}</Callout>
    if (p.startsWith('> DATA: ')) return <Callout key={i} type="data">{p.slice(8)}</Callout>
    if (p.startsWith('> TIP: ')) return <Callout key={i} type="tip">{p.slice(7)}</Callout>
    if (p.startsWith('> QUOTE: ')) {
      const rest = p.slice(9)
      const [text, source] = rest.split(' | ')
      return <PullQuote key={i} text={text.trim()} source={source?.trim()} />
    }
    if (i === 0) {
      return (
        <p key={i} className="text-[17px] md:text-[19px] text-slate-800 font-medium">
          {p}
        </p>
      )
    }
    return <p key={i}>{p}</p>
  })
}
