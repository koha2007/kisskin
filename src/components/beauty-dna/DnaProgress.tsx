import { useI18n } from '../../i18n/I18nContext'
import { useBeautyDna } from '../../hooks/useBeautyDna'
import { DNA_FIELDS, DNA_FIELD_META } from '../../lib/beauty-dna/types'
import { dnaTypeDisplay } from '../../lib/beauty-dna/display'

interface Props {
  /** true = 4슬롯 그리드 없이 도트 + 문구만 (홈/허브용) */
  compact?: boolean
  /** compact + 어두운 배경 위 (네이비 카드 안) */
  dark?: boolean
  className?: string
}

export default function DnaProgress({ compact = false, dark = false, className = '' }: Props) {
  const { locale, t } = useI18n()
  const isEn = locale === 'en'
  const { dna, done, total, complete } = useBeautyDna()
  const toolHref = (p: string) => (isEn ? `/en${p}` : p)

  const dots = (
    <span className="inline-flex items-center gap-1.5" aria-hidden="true">
      {DNA_FIELDS.map((f) => (
        <span
          key={f}
          className={`h-2 w-2 rounded-full ${dna[f] ? (dark ? 'bg-white' : 'bg-primary') : (dark ? 'bg-white/25' : 'bg-slate-300')}`}
        />
      ))}
    </span>
  )

  const countLine = (
    <span className={`text-sm font-bold ${dark ? 'text-white' : 'text-navy'}`}>
      {done} / {total} {t('tools.beautyDna.done')}
    </span>
  )

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {dots}
        {countLine}
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-center gap-3 mb-6">
        {dots}
        {countLine}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto">
        {DNA_FIELDS.map((f) => {
          const meta = DNA_FIELD_META[f]
          const disp = dnaTypeDisplay(f, dna, isEn)
          const label = isEn ? meta.labelEn : meta.labelKo
          if (disp) {
            return (
              <div
                key={f}
                className="relative overflow-hidden rounded-2xl border bg-white"
                style={{ borderColor: `${disp.accent}40` }}
              >
                <div className="aspect-[4/3] bg-slate-100">
                  {disp.image && (
                    <img src={disp.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  )}
                </div>
                <span
                  className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-primary shadow-sm"
                  aria-hidden="true"
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check
                  </span>
                </span>
                <div className="p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="text-sm font-bold text-navy leading-tight">
                    {disp.emoji} {disp.name}
                  </p>
                </div>
              </div>
            )
          }
          return (
            <a
              key={f}
              href={toolHref(meta.path)}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-5 text-center transition-colors hover:border-navy hover:bg-white"
            >
              <span className="material-symbols-outlined text-slate-400">add_circle</span>
              <span className="text-sm font-bold text-navy">{label}</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                {t('tools.beautyDna.doQuiz')}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </a>
          )
        })}
      </div>

      {complete && (
        <p className="mt-6 text-center text-sm font-semibold text-primary-dark">
          {t('tools.beautyDna.allDone')}
        </p>
      )}
    </div>
  )
}
