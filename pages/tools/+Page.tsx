import { MBTI_ORDER, MAKEUP_MBTI_TYPES } from '../../src/lib/makeup-mbti/types'
import { ToolsNav, ToolsFooter } from '../../src/components/ToolsLayout'

interface Tool {
  href: string
  icon: string
  title: string
  subtitle: string
  desc: string
  cta: string
  accent: string
  badge?: 'NEW' | 'POPULAR' | 'CORE'
  available: boolean
}

const TOOLS: Tool[] = [
  {
    href: '/analysis/',
    icon: 'auto_awesome',
    title: 'AI 메이크업 시뮬레이터',
    subtitle: 'kissinskin 시그니처',
    desc: '셀카 한 장으로 9가지 K-뷰티 메이크업을 30초 이내에 생성. 여성·남성 각각 18가지 스타일 지원.',
    cta: '시작하기',
    accent: '#eb4763',
    badge: 'CORE',
    available: true,
  },
  {
    href: '/tools/makeup-mbti/',
    icon: 'quiz',
    title: '메이크업 MBTI 테스트',
    subtitle: '16가지 성향 분석',
    desc: '10문항으로 알아보는 나의 메이크업 성향. 유형별 맞춤 K-뷰티 스타일과 시그니처 룩 공식을 제안합니다.',
    cta: '테스트',
    accent: '#a855f7',
    badge: 'POPULAR',
    available: true,
  },
  {
    href: '/tools/personal-color/',
    icon: 'palette',
    title: '퍼스널 컬러 자가 진단',
    subtitle: '봄웜·여름쿨·가을웜·겨울쿨',
    desc: '10문항으로 알아보는 나의 퍼스널 컬러. 4가지 시즌별로 어울리는 컬러·메이크업·헤어·액세서리 가이드.',
    cta: '진단',
    accent: '#f59e0b',
    available: true,
  },
  {
    href: '/tools/face-shape/',
    icon: 'face',
    title: '얼굴형 자가 진단',
    subtitle: '5가지 얼굴형 맞춤 가이드',
    desc: '8문항으로 알아보는 계란형·둥근형·각진형·긴형·하트형. 얼굴형별 컨투어링·블러쉬·헤어·안경 배치 가이드.',
    cta: '진단',
    accent: '#10b981',
    available: true,
  },
  {
    href: '/tools/perfume-type/',
    icon: 'local_florist',
    title: '나에게 어울리는 향수',
    subtitle: '6가지 향수 타입 진단',
    desc: '5문항으로 알아보는 플로럴·시트러스·우디·앰버·프레시·구르망. 타입별 씬/메이크업 매칭 + 향 추천 큐레이션.',
    cta: '진단',
    accent: '#ec4899',
    badge: 'NEW',
    available: true,
  },
  {
    href: '/about-makeup-ai/',
    icon: 'menu_book',
    title: 'K-뷰티 메이크업 완전 가이드',
    subtitle: '3,000단어 심화 아티클',
    desc: 'K-뷰티 메이크업의 역사, 18가지 스타일 상세, AI 시뮬레이션 원리, 사진 촬영 팁까지. 메이크업을 깊이 이해하는 심화 가이드.',
    cta: '읽기',
    accent: '#0ea5e9',
    available: true,
  },
]

const BADGE_LABEL: Record<NonNullable<Tool['badge']>, string> = {
  CORE: '시그니처',
  POPULAR: '인기',
  NEW: '신규',
}

export default function ToolsHub() {
  return (
    <div className="font-display bg-white min-h-screen">
      <ToolsNav />

      <main>
        {/* Header — same minimal pattern as other hubs */}
        <section className="border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">
              kissinskin · Tools
            </div>
            <h1 className="text-[28px] md:text-[40px] font-bold text-navy leading-[1.15] tracking-tight mb-4">
              뷰티의 모든 답을 한 곳에서
            </h1>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed">
              메이크업 · 퍼스널 컬러 · 얼굴형 · MBTI까지. 모두 무료로 30초 안에.
            </p>
            <div className="mt-6 text-xs text-slate-500">
              {TOOLS.filter((t) => t.available).length}개 도구 · 회원가입 불필요
            </div>
          </div>
        </section>

        {/* Tools — color-accented card grid for visual pull + at-a-glance scan */}
        <section className="py-10 md:py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS.map((tool) => (
                <a
                  key={tool.title}
                  href={tool.available ? tool.href : undefined}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all ${
                    tool.available
                      ? 'hover:-translate-y-1 hover:shadow-xl hover:border-transparent'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Accent bar */}
                  <span className="h-1.5 w-full shrink-0" style={{ background: tool.accent }} />

                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <div className="mb-4 flex items-start justify-between gap-2">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
                        style={{ background: tool.accent }}
                      >
                        <span
                          className="material-symbols-outlined text-[22px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {tool.icon}
                        </span>
                      </div>
                      {tool.badge && (
                        <span
                          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                          style={{ background: `${tool.accent}15`, color: tool.accent }}
                        >
                          {BADGE_LABEL[tool.badge]}
                        </span>
                      )}
                    </div>

                    <div
                      className="mb-1 text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: tool.accent }}
                    >
                      {tool.subtitle}
                    </div>
                    <h2 className="mb-2 text-lg font-bold leading-snug text-navy">
                      {tool.title}
                    </h2>
                    <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-600">
                      {tool.desc}
                    </p>

                    {tool.available && (
                      <div
                        className="inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white shadow-sm transition-all group-hover:gap-2.5 group-hover:shadow-md"
                        style={{ background: tool.accent }}
                      >
                        {tool.cta}
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* MBTI types preview — clean grid */}
        <section className="border-t border-slate-200 bg-slate-50 py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">
              16가지 메이크업 MBTI
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-navy mb-2 tracking-tight">
              테스트 전에 유형을 먼저 살펴볼 수도 있어요
            </h2>
            <p className="text-sm text-slate-600 mb-7">
              각 유형 페이지에는 시그니처 룩, 추천 컬러, 매칭 팁이 정리되어 있습니다.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {MBTI_ORDER.map((code) => {
                const t = MAKEUP_MBTI_TYPES[code]
                return (
                  <a
                    key={code}
                    href={`/tools/makeup-mbti/${t.slug}/`}
                    className="group bg-white border border-slate-200 hover:border-navy rounded-lg px-3 py-2.5 transition-colors"
                  >
                    <div className="text-[10px] font-mono text-slate-400 mb-0.5">
                      {t.code}
                    </div>
                    <div className="text-sm font-semibold text-navy group-hover:text-primary truncate">
                      {t.koName}
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <ToolsFooter />
    </div>
  )
}
