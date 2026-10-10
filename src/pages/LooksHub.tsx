import { useI18n } from '../i18n/I18nContext'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { MAKEUP_STYLES } from '../lib/makeup/styles'
import { LOOK_HOWTO } from '../lib/looks/howto'
import { useSavedLooks } from '../lib/looks/savedLooks'

// 메이크업 방법 허브 (/looks/) — 9룩 카드 → 룩별 단계 페이지.
export default function LooksHub() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const prefix = isEn ? '/en' : ''
  const { saved } = useSavedLooks()

  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <header className="max-w-2xl mb-10 md:mb-14">
          <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-primary-dark mb-3">
            {isEn ? 'Makeup how-to' : '메이크업 방법'}
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-navy leading-tight break-keep">
            {isEn ? '9 K-beauty looks, step by step' : 'K-뷰티 9룩, 단계별로 따라 하기'}
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed">
            {isEn
              ? 'Every look broken into 4 steps — skin, eyes, cheeks, lips — with the shades and tools for each. Pick one and start.'
              : '룩마다 피부·눈·볼·입술 4단계로 나눠, 단계별 색과 도구까지 정리했어요. 하나 골라 시작해 보세요.'}
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {MAKEUP_STYLES.map((s) => {
            const how = LOOK_HOWTO[s.id]
            return (
              <a key={s.id} href={`${prefix}/looks/${s.id}/`} className="group block bg-white border border-slate-200 hover:border-navy transition-colors">
                {/* 2026-10-02: 모델 사진 → 페이스 차트. 홈 9룩 섹션(사진)과 겹치지 않고 "방법" 섹션임이 한눈에 보인다 */}
                <span className="relative block aspect-[4/5] overflow-hidden bg-cream">
                  <img src={`/looks/charts/${s.id}.webp`} alt={isEn ? `${s.subEn} face chart` : `${s.nameKo} 페이스 차트`}
                    loading="lazy" decoding="async"
                    className="absolute left-1/2 top-[-27%] w-[140%] max-w-none -translate-x-1/2 transition-transform duration-500 group-hover:scale-[1.04]" />
                  {saved.includes(s.id) && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 bg-primary px-2 py-1 text-[10px] font-bold text-white">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                      {isEn ? 'Saved' : '저장됨'}
                    </span>
                  )}
                </span>
                <span className="block p-3 md:p-5">
                  <span className="block text-sm md:text-lg font-extrabold text-navy leading-tight">{isEn ? s.subEn : s.nameKo}</span>
                  <span className="mt-1.5 hidden md:block text-sm text-slate-600 leading-relaxed">{isEn ? how.introEn : how.introKo}</span>
                  <span className="mt-2 block text-[11px] md:text-xs font-semibold text-slate-500">
                    {how.minutes}{isEn ? ' min' : '분'} · {isEn ? how.levelEn : how.levelKo}
                  </span>
                </span>
              </a>
            )
          })}
        </div>

        {/* 2026-10-10 점검: 허브 본문이 카드 제목뿐(768자)이라 얇은 페이지로 잡혔다 →
            난이도별 "어디서 시작할까" 안내(데이터에서 생성 — 룩이 바뀌면 같이 바뀐다). */}
        <section className="mt-14 md:mt-20 border-t border-slate-200 pt-10" aria-labelledby="looks-start">
          <h2 id="looks-start" className="text-xl md:text-2xl font-extrabold text-navy">{isEn ? 'Which look should you start with?' : '어떤 룩부터 해 볼까요?'}</h2>
          <p className="mt-2 text-sm md:text-base text-slate-600 max-w-2xl leading-relaxed">
            {isEn
              ? 'Every look uses the same four areas — skin, eyes, cheeks, lips — so the skills carry over. Start easy, then move up when the basics feel natural.'
              : '9룩 모두 피부 · 눈 · 볼 · 입술 네 부분으로 나뉘어 있어서, 한 룩에서 익힌 손기술이 다음 룩으로 그대로 이어져요. 쉬운 룩으로 손에 익힌 뒤 한 단계씩 올라가 보세요.'}
          </p>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {([['쉬움', 'Easy', '처음이라면', 'New to makeup', '얇은 베이스와 자연스러운 색만으로 완성돼요. 매일 하기 좋아요.', 'Sheer base and soft color only — easy to wear every day.'],
               ['보통', 'Medium', '조금 익숙해졌다면', 'Getting comfortable', '한 부분에 포인트를 주는 룩이에요. 블렌딩과 선 정리가 핵심이에요.', 'One feature takes the lead — blending and clean edges matter.'],
               ['도전', 'Bold', '색으로 놀고 싶다면', 'Ready to play', '진한 색과 그래픽 라인을 쓰는 룩이에요. 사진·공연·특별한 날에.', 'Strong color and graphic lines — for photos, shows and big nights.']] as const).map(([lk, le, hk, he, dk, de]) => {
              const list = MAKEUP_STYLES.filter((s) => LOOK_HOWTO[s.id].levelKo === lk)
              if (!list.length) return null
              return (
                <div key={lk} className="bg-white border border-slate-200 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-dark">{isEn ? le : lk}</p>
                  <h3 className="mt-1 font-extrabold text-navy">{isEn ? he : hk}</h3>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{isEn ? de : dk}</p>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {list.map((s) => (
                      <li key={s.id}>
                        <a href={`${prefix}/looks/${s.id}/`} className="font-bold text-navy underline-offset-4 hover:underline">{isEn ? s.subEn : s.nameKo}</a>
                        <span className="text-slate-500"> · {LOOK_HOWTO[s.id].minutes}{isEn ? ' min' : '분'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>

        <a href={`${prefix}/class/`} className="mt-12 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 border border-slate-200 bg-white px-5 py-4 hover:border-navy transition-colors">
          <span className="text-sm md:text-base font-bold text-navy flex-1">{isEn ? 'Want the basics first? Order of steps, cushion, eyeliner, contour — one lesson a week.' : '기초부터 배우고 싶다면 — 메이크업 순서·쿠션·아이라인·컨투어까지 매주 한 편'}</span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-navy">{isEn ? 'Makeup class' : '메이크업 클래스'}<span className="material-symbols-outlined text-base">arrow_forward</span></span>
        </a>

        <p className="mt-10 text-center text-[11px] text-slate-400 max-w-xl mx-auto leading-relaxed">
          {isEn
            ? 'Face-chart illustrations are AI-generated. They show where each step goes — not a photo of a real result. Each look page also has an AI-model before/after.'
            : '페이스 차트 일러스트는 AI로 생성했어요. 어디에 바르는지 보여주는 그림이며 실제 결과 사진이 아니에요. 룩 페이지에는 AI 모델 비포·애프터도 있어요.'}
        </p>
      </main>
      <ToolsFooter />
    </div>
  )
}
