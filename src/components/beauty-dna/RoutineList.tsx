import type { RoutineStep } from '../../lib/beauty-dna/routine'

interface Props {
  steps: RoutineStep[]
  className?: string
}

export default function RoutineList({ steps, className = '' }: Props) {
  if (!steps.length) return null
  return (
    <ol className={`space-y-3 ${className}`}>
      {steps.map((s, i) => (
        <li key={s.key} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="font-serif text-lg font-semibold text-primary lining-nums">{i + 1}</span>
            <span
              className="material-symbols-outlined text-slate-400 text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {s.icon}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-navy">{s.label}</p>
            <p className="text-sm text-slate-600 leading-relaxed mt-0.5">{s.text}</p>
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{s.source}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
