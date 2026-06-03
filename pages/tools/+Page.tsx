import { MBTI_ORDER, MAKEUP_MBTI_TYPES } from '../../src/lib/makeup-mbti/types'
import { ToolsNav, ToolsFooter } from '../../src/components/ToolsLayout'
import ToolCard from '../../src/components/ToolCard'

interface Tool {
  href: string
  icon: string
  title: string
  desc: string
  cta: string
  accent: string
  badge?: 'NEW' | 'POPULAR' | 'CORE'
  available: boolean
}

// 도구색은 토큰(--color-tool-*)에서만 가져온다 — 단일 소스. 설명은 한 줄 핵심.
const TOOLS: Tool[] = [
  {
    href: '/analysis/',
    icon: 'auto_awesome',
    title: 'AI 메이크업 시뮬레이터',
    desc: '셀카 한 장으로 즉시 K-뷰티 메이크업 — 무료.',
    cta: '시작하기',
    accent: 'var(--color-tool-ai)',
    badge: 'CORE',
    available: true,
  },
  {
    href: '/tools/makeup-mbti/',
    icon: 'quiz',
    title: '메이크업 MBTI 테스트',
    desc: '10문항으로 보는 내 메이크업 성향 16타입.',
    cta: '테스트',
    accent: 'var(--color-tool-mbti)',
    badge: 'POPULAR',
    available: true,
  },
  {
    href: '/tools/personal-color/',
    icon: 'palette',
    title: '퍼스널 컬러 자가 진단',
    desc: '10문항으로 찾는 봄·여름·가을·겨울 타입.',
    cta: '진단',
    accent: 'var(--color-tool-pc)',
    available: true,
  },
  {
    href: '/tools/face-shape/',
    icon: 'face',
    title: '얼굴형 자가 진단',
    desc: '8문항으로 보는 5가지 얼굴형 맞춤 가이드.',
    cta: '진단',
    accent: 'var(--color-tool-face)',
    available: true,
  },
  {
    href: '/tools/perfume-type/',
    icon: 'local_florist',
    title: '나에게 어울리는 향수',
    desc: '5문항으로 찾는 6가지 향 타입.',
    cta: '진단',
    accent: 'var(--color-tool-perfume)',
    badge: 'NEW',
    available: true,
  },
  {
    href: '/about-makeup-ai/',
    icon: 'menu_book',
    title: 'K-뷰티 메이크업 완전 가이드',
    desc: 'K-뷰티 메이크업을 깊이 이해하는 심화 가이드.',
    cta: '읽기',
    accent: 'var(--color-tool-guide)',
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
                <ToolCard
                  key={tool.title}
                  href={tool.href}
                  icon={tool.icon}
                  accent={tool.accent}
                  title={tool.title}
                  desc={tool.desc}
                  tag={tool.badge ? BADGE_LABEL[tool.badge] : undefined}
                  cta={tool.cta}
                  available={tool.available}
                />
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
