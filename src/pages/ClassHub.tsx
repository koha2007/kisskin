import { useI18n } from '../i18n/I18nContext'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { CLASS_PARTS, CURRICULUM } from '../lib/class/curriculum'
import { CLASS_LESSONS, isPublished, chartSrc } from '../lib/class/lessons'

// 메이크업 클래스 허브 (/class/) — 2026-10-10.
// 36편 커리큘럼을 파트별로 전부 보여준다. 나온 편은 카드(차트 썸네일), 아직 안 나온 편은
// "곧 공개" 줄로 — 앞으로 무엇이 나오는지 보이게 해서 재방문·구독 이유를 만든다.
// 숨김은 조건부 렌더가 아니라 처음부터 렌더(크롤러가 커리큘럼 전체를 본다).
export default function ClassHub() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const prefix = isEn ? '/en' : ''
  const first = CLASS_LESSONS[0]

  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <header className="grid md:grid-cols-[1fr_auto] gap-6 items-end mb-10 md:mb-14">
          <div className="max-w-2xl">
            <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-primary-dark mb-3">
              {isEn ? 'Free makeup class' : '무료 메이크업 클래스'}
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-navy leading-tight break-keep">
              {isEn ? 'Makeup from zero, one lesson a week' : '완전 기초부터, 매주 한 편씩'}
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed">
              {isEn
                ? `${CURRICULUM.length} lessons in order — from the right order of steps to eyeliner, contour and gradient lips. Each one is drawn on a makeup artist’s face chart, with the products to look for.`
                : `메이크업 순서부터 아이라인 · 컨투어 · 그라데이션 립까지 ${CURRICULUM.length}편을 순서대로. 편마다 아티스트의 페이스 차트로 어디에 바르는지 그렸고, 단계별 제품도 찾아 드려요.`}
            </p>
            <p className="mt-3 text-sm font-semibold text-slate-500">
              {isEn ? `${CLASS_LESSONS.length} of ${CURRICULUM.length} lessons out · new lesson every Tuesday` : `${CURRICULUM.length}편 중 ${CLASS_LESSONS.length}편 공개 · 매주 화요일 새 편`}
            </p>
          </div>
          {first && (
            <a href={`${prefix}/class/${first.slug}/`} className="inline-flex w-fit items-center gap-1.5 bg-navy px-6 py-3.5 text-sm font-bold text-white hover:bg-navy-mid transition-colors">
              {isEn ? 'Start with lesson 1' : '1편부터 시작하기'}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          )}
        </header>

        <div className="space-y-12 md:space-y-16">
          {CLASS_PARTS.map((p, pi) => {
            const items = CURRICULUM.filter((c) => c.part === p.id)
            const out = items.filter((c) => isPublished(c.slug))
            const soon = items.filter((c) => !isPublished(c.slug))
            return (
              <section key={p.id} id={p.id} className="scroll-mt-20">
                <h2 className="flex items-baseline gap-3 border-b border-slate-200 pb-3 mb-5">
                  <span className="text-xs font-bold tracking-[0.16em] text-primary-dark">PART {pi + 1}</span>
                  <span className="text-xl md:text-2xl font-extrabold text-navy">{isEn ? p.en : p.ko}</span>
                  <span className="ml-auto text-xs font-semibold text-slate-500">{items.length}{isEn ? ' lessons' : '편'}</span>
                </h2>
                {out.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-4">
                    {out.map((c) => (
                      <a key={c.slug} href={`${prefix}/class/${c.slug}/`} className="group block bg-white border border-slate-200 hover:border-navy transition-colors">
                        <span className="relative block aspect-[4/5] overflow-hidden bg-cream">
                          <img src={chartSrc(c.slug)} alt={isEn ? `${c.titleEn} — face chart` : `${c.titleKo} 페이스 차트`}
                            loading="lazy" decoding="async"
                            className="absolute left-1/2 top-[-27%] w-[140%] max-w-none -translate-x-1/2 transition-transform duration-500 group-hover:scale-[1.04]" />
                          <span className="absolute left-2 top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-navy px-1.5 text-[11px] font-extrabold text-white">{c.n}</span>
                        </span>
                        <span className="block p-3 md:p-4">
                          <span className="block text-sm md:text-base font-extrabold text-navy leading-snug break-keep">{isEn ? c.titleEn : c.titleKo}</span>
                          {c.kbeauty && <span className="mt-1.5 inline-block text-[10px] font-bold text-primary-dark">K-beauty</span>}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
                {soon.length > 0 && (
                  <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                    {soon.map((c) => (
                      <li key={c.slug} className="flex items-baseline gap-2 text-sm text-slate-500">
                        <span className="w-6 shrink-0 text-right font-mono text-xs tabular-nums">{c.n}</span>
                        <span className="break-keep">{isEn ? c.titleEn : c.titleKo}</span>
                        <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">{isEn ? 'Soon' : '곧 공개'}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>

        <aside className="mt-16 bg-white border border-slate-200 p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-4 items-center">
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-navy">{isEn ? 'Ready for a full look?' : '기초를 익혔다면, 완성된 룩으로'}</h2>
            <p className="mt-1.5 text-sm text-slate-600">{isEn ? '9 K-beauty looks, each in 4 steps — and you can try any of them on your own selfie.' : 'K-뷰티 9룩을 4단계씩. 내 셀카에 입혀 볼 수도 있어요.'}</p>
          </div>
          <a href={`${prefix}/looks/`} className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-navy border-b-2 border-navy pb-0.5">
            {isEn ? 'See the 9 looks' : '9룩 방법 보기'}<span className="material-symbols-outlined text-base">arrow_forward</span>
          </a>
        </aside>

        <p className="mt-10 text-center text-[11px] text-slate-400 max-w-xl mx-auto leading-relaxed">
          {isEn
            ? 'Face-chart illustrations are AI-generated. They show where each step goes — not a photo of a real result.'
            : '페이스 차트 일러스트는 AI로 생성했어요. 어디에 바르는지 보여주는 그림이며 실제 결과 사진이 아니에요.'}
        </p>
      </main>
      <ToolsFooter />
    </div>
  )
}
