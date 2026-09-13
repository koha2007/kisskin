import { useI18n } from '../../i18n/I18nContext'
import { useBeautyDna } from '../../hooks/useBeautyDna'
import { DNA_FIELDS, DNA_FIELD_META, type DnaField } from '../../lib/beauty-dna/types'
import { dnaTypeDisplay } from '../../lib/beauty-dna/display'

// 홈 도구 카드(HomePage.tsx)와 같은 무드컷 재사용 — 미완성 슬롯의 블러 티저용.
// "완성하면 이런 느낌" 미리보기로 완주 동기를 준다(빈 점선 박스보다 궁금증 유발이 큼).
const PREVIEW_IMAGE: Record<DnaField, string> = {
  personalColor: '/mood/tool-personal-color.webp',
  faceShape: '/mood/tool-face-shape.webp',
  perfume: '/mood/tool-perfume.webp',
  mbti: '/mood/tool-mbti.webp',
}

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
              className="group relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white transition-colors hover:border-navy"
            >
              {/* 블러 티저 — 이 진단을 마치면 실제로 이런 카드가 뜬다는 걸 미리 보여준다 */}
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={PREVIEW_IMAGE[f]}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full scale-110 object-cover object-center opacity-70 blur-[7px] transition-opacity group-hover:opacity-85"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-navy/15">
                  <span
                    className="material-symbols-outlined text-[26px] text-white drop-shadow"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    lock
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  {t('tools.beautyDna.doQuiz')}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
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
