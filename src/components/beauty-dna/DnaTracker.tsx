import { useEffect } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import { useBeautyDna } from '../../hooks/useBeautyDna'
import type { DnaField } from '../../lib/beauty-dna/types'
import { DNA_FIELD_META } from '../../lib/beauty-dna/types'

interface Props {
  field: DnaField
  /** 이 도구의 유형 코드 (route param 에서 온 값) */
  code: string
}

/**
 * 4개 결과 페이지에 하나씩 심는다:
 *  1) 마운트 시 이 진단 결과를 localStorage(kissin:dna:v1)에 기록
 *  2) 진행 중이면 "다음 진단으로 바로 가기" + 완성이면 "결과 보기" 를 띄운다
 * 위치: 결과 페이지 히어로 바로 아래(롱폼 앞).
 */
export default function DnaTracker({ field, code }: Props) {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const { setField, done, total, complete, missing } = useBeautyDna()
  const toolHref = (p: string) => (isEn ? `/en${p}` : p)

  useEffect(() => {
    setField(field, code)
  }, [field, code, setField])

  // 결과 페이지에선 최소 1개(현재 진단)는 항상 저장되므로 done>=1. 아무것도 없으면(이론상) 숨김.
  if (done < 1) return null

  const dnaHref = isEn ? '/en/tools/beauty-dna/' : '/tools/beauty-dna/'
  const missLabels = missing.map((m) => (isEn ? DNA_FIELD_META[m].labelEn : DNA_FIELD_META[m].labelKo))
  const nextMeta = missing.length ? DNA_FIELD_META[missing[0]] : null
  const nextLabel = nextMeta ? (isEn ? nextMeta.labelEn : nextMeta.labelKo) : ''

  const line = complete
    ? isEn
      ? 'All 4 done — your personalized makeup routine and product list are ready.'
      : '4가지 완료 — 나에게 딱 맞는 메이크업 루틴과 제품 리스트가 준비됐어요.'
    : isEn
      ? `${missLabels.length} more (${missLabels.join(', ')}) and your routine + shopping list are ready.`
      : `${missLabels.join(' · ')} ${missLabels.length}가지만 더 하면 맞춤 메이크업 루틴과 쇼핑 리스트가 완성돼요.`

  return (
    <section className="py-8 md:py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div
          className={`rounded-2xl border-2 p-5 md:p-7 ${
            complete ? 'border-primary/30 bg-primary/[0.04]' : 'border-navy/15 bg-white'
          }`}
        >
          <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2.5">
            {complete
              ? (isEn ? 'Ready — I found my makeup' : '완성 — 나만의 메이크업 찾았다')
              : (isEn ? 'kissinskin · I found my makeup' : '나만의 메이크업 찾았다')}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="inline-flex items-center gap-1" aria-hidden="true">
                  {Array.from({ length: total }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-2.5 w-2.5 rounded-full ${i < done ? 'bg-primary' : 'bg-slate-200'}`}
                    />
                  ))}
                </span>
                <span className="text-base md:text-lg font-extrabold text-navy">
                  {done} / {total}
                </span>
              </div>
              <p className="text-sm md:text-base font-semibold text-navy leading-snug">{line}</p>
              {!complete && (
                <a href={dnaHref} className="mt-1 inline-block text-xs font-semibold text-slate-500 underline hover:text-navy">
                  {isEn ? 'View progress' : '진행 상황 보기'}
                </a>
              )}
            </div>
            {complete ? (
              <a
                href={dnaHref}
                className="shrink-0 inline-flex items-center justify-center gap-1.5 bg-navy text-white px-6 py-3 text-sm md:text-base font-bold hover:bg-navy-mid transition-colors"
              >
                {isEn ? 'See my result' : '내 결과 보기'}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </a>
            ) : nextMeta ? (
              <a
                href={toolHref(nextMeta.path)}
                className="shrink-0 inline-flex items-center justify-center gap-1.5 bg-navy text-white px-6 py-3 text-sm md:text-base font-bold hover:bg-navy-mid transition-colors"
              >
                {isEn ? `Next: ${nextLabel}` : `다음: ${nextLabel} 진단하기`}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
