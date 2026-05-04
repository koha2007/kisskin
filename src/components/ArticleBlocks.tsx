import type { ReactNode } from 'react'

type CalloutType = 'key' | 'warn' | 'data' | 'tip'

const CALLOUT_STYLES: Record<CalloutType, { bg: string; border: string; iconColor: string; icon: string; label: string }> = {
  key: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    iconColor: 'text-rose-500',
    icon: 'lightbulb',
    label: '핵심',
  },
  warn: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-600',
    icon: 'warning',
    label: '주의',
  },
  data: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    iconColor: 'text-sky-600',
    icon: 'insights',
    label: '데이터',
  },
  tip: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    icon: 'tips_and_updates',
    label: '팁',
  },
}

export function Callout({ type = 'key', children }: { type?: CalloutType; children: ReactNode }) {
  const s = CALLOUT_STYLES[type]
  return (
    <aside className={`not-prose my-7 p-5 md:p-6 ${s.bg} border ${s.border} rounded-xl flex gap-4`}>
      <span className={`material-symbols-outlined ${s.iconColor} text-2xl shrink-0 mt-0.5`} style={{ fontVariationSettings: "'FILL' 1" }}>
        {s.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className={`text-[11px] font-bold uppercase tracking-[0.18em] ${s.iconColor} mb-1.5`}>
          {s.label}
        </div>
        <div className="text-[15px] md:text-base text-slate-700 leading-relaxed">
          {children}
        </div>
      </div>
    </aside>
  )
}

export function PullQuote({ text, source }: { text: string; source?: string }) {
  return (
    <blockquote className="not-prose my-9 md:my-10 px-2 md:px-0">
      <div className="border-l-4 border-primary pl-5 md:pl-6 py-1">
        <p className="text-[20px] md:text-[26px] font-bold text-navy leading-[1.35] tracking-tight">
          “{text}”
        </p>
        {source && (
          <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {source}
          </div>
        )}
      </div>
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
    <figure className="not-prose my-7 overflow-x-auto rounded-xl border border-slate-200">
      {caption && (
        <figcaption className="px-4 md:px-5 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {caption}
        </figcaption>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50/50">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 md:px-5 py-3 text-left text-[12px] font-bold text-navy border-b border-slate-200 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/40">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 md:px-5 py-3 align-top text-slate-700 ${j === 0 ? 'font-semibold text-navy' : ''}`}
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
    <ol className="not-prose my-8 space-y-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-primary/40 transition-colors">
          <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-pink-500 text-white flex items-center justify-center font-bold text-sm">
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {item.icon && (
                <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {item.icon}
                </span>
              )}
              <h3 className="text-[15px] md:text-base font-bold text-navy">{item.title}</h3>
            </div>
            <p className="text-[14px] md:text-[15px] text-slate-600 leading-relaxed">{item.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/**
 * Body block parser — interpret special string prefixes inside body[] arrays.
 * Returns React nodes ordered the same way.
 *
 * Markers:
 *   `> KEY: ...`         -> <Callout type="key">
 *   `> WARN: ...`        -> <Callout type="warn">
 *   `> DATA: ...`        -> <Callout type="data">
 *   `> TIP: ...`         -> <Callout type="tip">
 *   `> QUOTE: text`      -> <PullQuote>
 *   `> QUOTE: text | src`-> <PullQuote source=src>
 *   `## Heading`         -> <h2>
 *   plain string         -> <p>
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
