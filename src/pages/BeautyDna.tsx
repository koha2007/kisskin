import { useState, useEffect } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import SectionHeader from '../components/home/SectionHeader'
import DnaProgress from '../components/beauty-dna/DnaProgress'
import DnaPortrait from '../components/beauty-dna/DnaPortrait'
import RoutineList from '../components/beauty-dna/RoutineList'
import RelatedTools from '../components/RelatedTools'
import ShareBar from '../components/ShareBar'
import ToolFaq from '../components/ToolFaq'
import RegionToggle from '../components/RegionToggle'
import { ProductGridCard } from '../components/result-grid/ProductGridCard'
import { AFFILIATE_ENABLED } from '../lib/recommendations/types'
import { useBeautyDna } from '../hooks/useBeautyDna'
import { getPersona } from '../lib/beauty-dna/persona'
import { buildRoutine } from '../lib/beauty-dna/routine'
import { buildReadingCards } from '../lib/beauty-dna/readingCards'
import { mergeDnaRecs } from '../lib/beauty-dna/products'
import { dnaTypeDisplay } from '../lib/beauty-dna/display'
import { DNA_PORTRAIT_ENABLED } from '../lib/beauty-dna/config'
import { DNA_FIELDS, encodeDnaCode, decodeDnaCode, clearDna, type BeautyDna } from '../lib/beauty-dna/types'

export default function BeautyDna() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const { dna, complete } = useBeautyDna()

  // 공유 링크(?c=autumn-warm~heart~woody~enfp)로 열면 남의 조합을 읽기 전용으로 보여준다.
  const [shared] = useState<BeautyDna | null>(() => {
    if (typeof window === 'undefined') return null
    const c = new URLSearchParams(window.location.search).get('c')
    return c ? decodeDnaCode(c) : null
  })
  useEffect(() => {
    if (!shared || typeof document === 'undefined') return
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex'
    document.head.appendChild(m)
    return () => { document.head.removeChild(m) }
  }, [shared])

  const viewDna = shared ?? dna
  const viewComplete = shared ? true : complete
  const readOnly = !!shared

  const subtitle = isEn
    ? 'Personal color, face shape, perfume, and makeup MBTI — we synthesize all four free quiz results into your own makeup and product list. No selfie needed.'
    : '퍼스널컬러 · 얼굴형 · 향수 · 메이크업 MBTI — 무료 진단 4가지 결과를 하나로 종합해, 나에게 딱 맞는 메이크업과 제품을 찾아드려요. 셀카는 필요 없어요.'

  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />
      <main>
        <section className="bg-cream border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
            <SectionHeader
              eyebrow={isEn ? 'kissinskin · Your own makeup' : 'kissinskin · 나만의 메이크업'}
              title={isEn ? 'I found my makeup' : '나만의 메이크업 찾았다'}
              subtitle={subtitle}
              className="!mb-8"
            />
            {readOnly ? (
              <p className="text-center">
                <a
                  href={isEn ? '/en/tools/beauty-dna/' : '/tools/beauty-dna/'}
                  className="inline-flex items-center gap-2 bg-navy text-white px-7 py-3.5 font-bold text-sm hover:bg-navy-mid transition-colors"
                >
                  {isEn ? 'Make my own' : '나도 만들어보기'}
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </a>
              </p>
            ) : (
              <DnaProgress />
            )}
          </div>
        </section>

        {viewComplete ? (
          <CompleteView dna={viewDna} isEn={isEn} readOnly={readOnly} />
        ) : (
          <IncompleteView isEn={isEn} />
        )}
      </main>
      <ToolsFooter />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function CompleteView({ dna, isEn, readOnly = false }: { dna: BeautyDna; isEn: boolean; readOnly?: boolean }) {
  const persona = getPersona(dna, isEn)
  const routine = buildRoutine(dna, isEn)
  const reading = buildReadingCards(dna, isEn)
  const recs = mergeDnaRecs(dna)
  const code = encodeDnaCode(dna) ?? 'dna'
  // 공유 링크는 항상 조합 코드를 실어 상대가 같은 결과를 보게 한다("너도 해봐" 루프).
  const shareUrl = `https://kissinskin.net${isEn ? '/en' : ''}/tools/beauty-dna/${code !== 'dna' ? `?c=${code}` : ''}`
  const cachedPortrait = !readOnly && dna.portraitCode === code ? dna.portraitUrl : undefined

  const L = isEn
    ? { chips: 'Your combination', products: 'Products that finish this look', routine: 'Your makeup routine',
        reading: 'How to read this combination', tryTitle: 'Try this look on your own face',
        tryDesc: 'Take it into AI Makeup and try it on your selfie — your face stays exactly the same.',
        tryCta: 'Open AI Makeup', share: 'Share my result', retake: 'Retake a quiz' }
    : { chips: '내 조합', products: '이 룩을 완성하는 제품', routine: '내 메이크업 루틴',
        reading: '이 조합 읽는 법', tryTitle: '이 룩, 내 얼굴에 직접',
        tryDesc: 'AI 메이크업으로 내 셀카에 입혀보세요. 얼굴은 그대로예요.',
        tryCta: 'AI 메이크업 열기', share: '결과 공유하기', retake: '다시 진단하기' }

  return (
    <>
      {/* 통합 리드아웃 */}
      <section className="py-10 md:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-3">{L.chips}</p>
          <div className="flex flex-wrap justify-center gap-2 mb-5">
            {DNA_FIELDS.map((f) => {
              const d = dnaTypeDisplay(f, dna, isEn)
              if (!d) return null
              return (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold text-navy"
                  style={{ borderColor: `${d.accent}55`, background: `${d.accent}12` }}
                >
                  {d.emoji} {d.name}
                </span>
              )
            })}
          </div>
          {persona && (
            <p className="font-serif text-2xl md:text-[2rem] font-semibold text-navy tracking-tight leading-tight">
              {isEn ? persona : `"${persona}"`}
            </p>
          )}
        </div>
      </section>

      {/* 모델 얼굴 생성 (P1) — 플래그 OFF 여도 캐시된 결과는 보여준다 */}
      {(DNA_PORTRAIT_ENABLED || cachedPortrait) && (
        <DnaPortrait dna={dna} cached={cachedPortrait} readOnly={readOnly} />
      )}

      {/* ★ 제품 — 먼저, 크게 (수익 관문) */}
      {recs.length > 0 && (
        <section className="py-8 md:py-12 bg-white border-y border-slate-100">
          <div className="max-w-5xl mx-auto px-3 sm:px-6">
            <h2 className="font-serif text-2xl md:text-[1.75rem] font-semibold text-navy text-center tracking-tight mb-6">
              {L.products}
            </h2>
            {AFFILIATE_ENABLED && <RegionToggle pageType="beauty_dna" className="mb-7" />}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {recs.map((item, i) => (
                <ProductGridCard key={`${item.category}-${i}`} item={item} pageType="beauty_dna" pageSlug={code} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 루틴 */}
      {routine.length > 0 && (
        <section className="py-10 md:py-14">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-2xl md:text-[1.75rem] font-semibold text-navy text-center tracking-tight mb-7">
              {L.routine}
            </h2>
            <RoutineList steps={routine} />
          </div>
        </section>
      )}

      {/* 읽는 법 */}
      {reading.length > 0 && (
        <section className="py-10 md:py-14 bg-cream">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-2xl md:text-[1.75rem] font-semibold text-navy text-center tracking-tight mb-7">
              {L.reading}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reading.map((c) => (
                <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {c.icon}
                    </span>
                    <p className="text-sm font-bold text-navy">
                      {c.label} · <span className="text-slate-500">{c.typeName}</span>
                    </p>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{c.drives}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AI 메이크업 배너 */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <a
            href={isEn ? '/en/' : '/analysis/'}
            className="group block rounded-2xl bg-navy text-white p-6 md:p-10 text-center transition-colors hover:bg-navy-mid"
          >
            <h2 className="font-serif text-2xl md:text-[1.9rem] font-semibold tracking-tight leading-tight mb-2">{L.tryTitle}</h2>
            <p className="text-white/80 text-sm md:text-base max-w-md mx-auto leading-relaxed mb-5">{L.tryDesc}</p>
            <span className="inline-flex items-center gap-2 bg-white text-navy px-6 py-3 font-bold text-sm group-hover:gap-3 transition-all">
              {L.tryCta}
              <span className="material-symbols-outlined">arrow_forward</span>
            </span>
          </a>
        </div>
      </section>

      <ShareBar
        url={shareUrl}
        shareText={
          isEn
            ? `I found my makeup on kissinskin — ${persona}\n${DNA_FIELDS.map((f) => dnaTypeDisplay(f, dna, true)?.name).filter(Boolean).join(' · ')}\n\n`
            : `키스인스킨에서 나만의 메이크업을 찾았어요 — ${persona}\n${DNA_FIELDS.map((f) => dnaTypeDisplay(f, dna, false)?.name).filter(Boolean).join(' · ')}\n\n`
        }
        shareTitle={isEn ? 'I found my makeup — kissinskin' : '나만의 메이크업 찾았다 — 키스인스킨'}
        retakeUrl={isEn ? '/en/tools/' : '/tools/'}
        retakeLabel={L.retake}
      />

      {!readOnly && (
        <div className="pb-12 text-center">
          <button
            type="button"
            onClick={() => {
              clearDna()
              if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy transition-colors"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            {isEn ? 'Start over (clear my saved results)' : '처음부터 다시 하기 (저장된 결과 지우기)'}
          </button>
          <p className="mt-1.5 text-[11px] text-slate-400">
            {isEn ? 'Your results are saved on this device only.' : '이 결과는 이 기기에만 저장돼 있어요.'}
          </p>
        </div>
      )}

      <RelatedTools exclude="ai-makeup" />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function IncompleteView({ isEn }: { isEn: boolean }) {
  const faq = isEn
    ? [
        { q: 'Do I need to sign up or upload a selfie?', a: 'No. All four quizzes are free with no login and no photo. You only sign in later if you choose to generate the look on an AI model face.' },
        { q: 'What do I get when all four are done?', a: 'A single page that merges your four results into one makeup routine (base, eye, lip, blush, contour, hair, scent) with the reason behind each step, plus a shopping list of product categories that fit the whole combination.' },
        { q: 'Where are my results stored?', a: 'On this device only, in your browser. Nothing is sent to a server. Clearing site data or switching browsers resets it.' },
        { q: 'Can I redo a quiz?', a: 'Yes, any time. The newest result for each quiz is the one used here.' },
      ]
    : [
        { q: '회원가입이나 셀카가 필요한가요?', a: '아니요. 진단 4가지는 로그인도 사진도 필요 없이 무료입니다. 나중에 모델 얼굴로 룩을 생성할 때만 선택적으로 로그인합니다.' },
        { q: '4가지를 다 하면 뭐가 나오나요?', a: '네 결과를 하나로 합쳐, 베이스·아이·립·블러셔·컨투어·헤어·향까지 이어지는 메이크업 루틴을 각 단계 근거와 함께 보여드리고, 조합 전체에 맞는 제품 카테고리 쇼핑 리스트를 만들어드립니다.' },
        { q: '결과는 어디에 저장되나요?', a: '이 기기의 브라우저에만 저장됩니다. 서버로 전송되지 않으며, 사이트 데이터를 지우거나 브라우저를 바꾸면 초기화됩니다.' },
        { q: '진단을 다시 할 수 있나요?', a: '언제든 다시 할 수 있어요. 각 진단의 가장 최근 결과가 여기에 반영됩니다.' },
      ]

  return (
    <>
      <section className="py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl md:text-[1.9rem] font-semibold text-navy tracking-tight mb-4">
            {isEn ? 'What is this?' : '나만의 메이크업 찾았다란?'}
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed text-[15px] md:text-base">
            {(isEn
              ? [
                  'Personal color tells you your shades. Face shape tells you where to place them. Makeup MBTI tells you how bold to go. Perfume type tells you the overall mood. Each on its own is a fragment.',
                  'This page waits until you have all four, then merges them into one routine you can actually follow, step by step, with the reason for each choice — and a shopping list of the product categories that fit the whole picture.',
                  'It is not a filter and not your photo. Everything here is assembled from your four quiz results, on your device.',
                ]
              : [
                  '퍼스널 컬러는 "어떤 색"인지, 얼굴형은 "어디에 놓을지", 메이크업 MBTI는 "얼마나 과감하게", 향수 유형은 "전체 무드"를 알려줍니다. 하나씩만 보면 조각이에요.',
                  '이 페이지는 네 가지가 모두 모일 때까지 기다렸다가, 실제로 따라 할 수 있는 하나의 루틴으로 합쳐줍니다. 각 단계에 왜 그런지 근거를 붙이고, 조합 전체에 맞는 제품 카테고리 쇼핑 리스트도 함께 만들어드려요.',
                  '필터도, 당신 사진도 아닙니다. 여기 모든 내용은 네 가지 진단 결과로 이 기기에서 조립됩니다.',
                ]
            ).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <ToolFaq
        title={isEn ? 'Frequently asked' : '자주 묻는 질문'}
        items={faq}
      />
    </>
  )
}
