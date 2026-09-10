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
 *  2) 다른 진단이 1개 이상 끝나 있고 아직 4/4 가 아니면 "완성까지 N개" 스트립을 띄운다
 * 결과 페이지가 곧 완료 신호이므로 별도 이펙트를 각 파일에 넣지 않는다.
 */
export default function DnaTracker({ field, code }: Props) {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const { dna, setField, done, total, complete, missing } = useBeautyDna()

  useEffect(() => {
    setField(field, code)
  }, [field, code, setField])

  // 이 진단만 끝난 상태(1/4)면 스트립을 아직 안 띄운다 — 허브 카드로 충분.
  // 2/4~3/4 에서만 "거의 다 됐어요" 넛지.
  const others = done - (dna[field] ? 1 : 0)
  if (complete || others < 1) return null

  const nextMeta = DNA_FIELD_META[missing[0]]
  const nextLabel = isEn ? nextMeta.labelEn : nextMeta.labelKo
  const href = isEn ? '/en/tools/beauty-dna/' : '/tools/beauty-dna/'

  return (
    <section className="bg-cream border-t border-slate-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-center sm:text-left">
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-1">
            {isEn ? "Your Own Makeup" : '나만의 메이크업 찾았다'}
          </p>
          <p className="text-sm font-semibold text-navy leading-snug">
            {isEn
              ? `${done}/${total} done — one more (${nextLabel}) and your full routine + shopping list is ready.`
              : `${done}/${total} 완료 — ${nextLabel} 하나만 더 하면 맞춤 루틴과 쇼핑 리스트가 완성돼요.`}
          </p>
        </div>
        <a
          href={href}
          className="shrink-0 inline-flex items-center gap-1.5 bg-navy text-white px-5 py-2.5 text-sm font-bold hover:bg-navy-mid transition-colors"
        >
          {isEn ? 'View progress' : '진행 상황 보기'}
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </a>
      </div>
    </section>
  )
}
