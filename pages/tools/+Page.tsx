import { MBTI_ORDER, MAKEUP_MBTI_TYPES } from '../../src/lib/makeup-mbti/types'
import { ToolsNav, ToolsFooter } from '../../src/components/ToolsLayout'

interface Tool {
  href: string
  emoji: string
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
    href: '/analysis',
    emoji: '💄',
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
    emoji: '💫',
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
    emoji: '🎨',
    title: '퍼스널 컬러 자가 진단',
    subtitle: '봄웜·여름쿨·가을웜·겨울쿨',
    desc: '10문항으로 알아보는 나의 퍼스널 컬러. 4가지 시즌별로 어울리는 컬러·메이크업·헤어·액세서리 완벽 가이드.',
    cta: '진단',
    accent: '#f59e0b',
    available: true,
  },
  {
    href: '/tools/face-shape/',
    emoji: '🌟',
    title: '얼굴형 자가 진단',
    subtitle: '5가지 얼굴형 맞춤 가이드',
    desc: '8문항으로 알아보는 계란형·둥근형·각진형·긴형·하트형. 얼굴형별 컨투어링·블러쉬·헤어·안경 배치 가이드.',
    cta: '진단',
    accent: '#10b981',
    available: true,
  },
  {
    href: '/about-makeup-ai/',
    emoji: '📖',
    title: 'K-뷰티 메이크업 완전 가이드',
    subtitle: '3,000단어 심화 아티클',
    desc: 'K-뷰티 메이크업의 역사, 18가지 스타일 상세, AI 시뮬레이션 원리, 사진 촬영 팁까지. 메이크업을 깊이 이해하는 심화 가이드.',
    cta: '읽기',
    accent: '#0ea5e9',
    available: true,
  },
]

export default function ToolsHub() {
  return (
    <div className="font-display bg-white min-h-screen">
      <ToolsNav />

      <main>
        {/* Hero — Linear/Vercel inspired: dark, dense, utilitarian */}
        <section className="relative bg-navy text-white py-14 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(235,71,99,0.18),transparent_50%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.15),transparent_50%)] pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-[0.65rem] font-mono uppercase tracking-[0.25em] text-slate-400 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>kissinskin / tools</span>
              <span className="text-slate-600">·</span>
              <span>{TOOLS.filter(t => t.available).length} live</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-5 max-w-3xl">
              뷰티의 모든 답을<br />
              <span className="bg-gradient-to-r from-pink-300 via-rose-300 to-amber-200 bg-clip-text text-transparent">한 곳에서.</span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl mb-8">
              메이크업·퍼스널 컬러·얼굴형·MBTI까지. 모두 무료로 30초 안에.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a href="/analysis" className="inline-flex items-center gap-2 bg-white text-navy px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-100 transition-all">
                AI 메이크업 시뮬레이션
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </a>
              <a href="#all-tools" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-bold border border-white/20 transition-all">
                전체 도구 보기
              </a>
            </div>
          </div>
        </section>

        {/* Tools list — Vercel templates inspired: tight grid, status pills */}
        <section id="all-tools" className="py-14 md:py-20 border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8 pb-4 border-b border-slate-200">
              <div>
                <div className="text-[0.65rem] font-mono uppercase tracking-[0.25em] text-slate-500 mb-1">All tools</div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-navy">전체 {TOOLS.length}개 도구</h2>
              </div>
              <div className="text-xs text-slate-500 hidden md:block">
                <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />무료 · 회원가입 불필요</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOOLS.map(tool => (
                <a
                  key={tool.title}
                  href={tool.available ? tool.href : undefined}
                  className={`group relative bg-white rounded-2xl p-6 border border-slate-200 transition-all ${
                    tool.available ? 'hover:border-navy hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:-translate-y-0.5' : 'opacity-60 cursor-not-allowed'
                  }`}
                  aria-disabled={!tool.available}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: `${tool.accent}15`, border: `1px solid ${tool.accent}30` }}
                    >
                      {tool.emoji}
                    </div>
                    {tool.badge && (
                      <span
                        className="text-[0.6rem] font-mono uppercase tracking-widest px-2 py-1 rounded-md font-bold"
                        style={{
                          background: tool.badge === 'CORE' ? '#0f172a' : tool.badge === 'POPULAR' ? '#fef3c7' : '#dcfce7',
                          color: tool.badge === 'CORE' ? '#fff' : tool.badge === 'POPULAR' ? '#92400e' : '#166534',
                        }}
                      >
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[0.65rem] font-mono uppercase tracking-widest text-slate-500 mb-1">{tool.subtitle}</div>
                  <h3 className="text-lg font-extrabold text-navy mb-2 tracking-tight leading-snug group-hover:text-primary transition-colors">{tool.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-5 line-clamp-3">{tool.desc}</p>
                  <div className={`inline-flex items-center gap-1 font-bold text-sm ${tool.available ? 'text-navy' : 'text-slate-400'}`}>
                    {tool.cta}
                    {tool.available && <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* MBTI types preview — kept but redesigned: monospace coded grid */}
        <section className="py-14 md:py-16 bg-slate-50 border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-7">
              <div className="text-[0.65rem] font-mono uppercase tracking-[0.25em] text-slate-500 mb-1">/ tools / makeup-mbti / types</div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-navy">16가지 메이크업 MBTI 미리보기</h2>
              <p className="text-sm text-slate-500 mt-1">테스트 전에 유형 설명을 먼저 볼 수도 있어요.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {MBTI_ORDER.map(code => {
                const t = MAKEUP_MBTI_TYPES[code]
                return (
                  <a key={code} href={`/tools/makeup-mbti/${t.slug}/`} className="group bg-white rounded-lg p-3 border border-slate-200 hover:border-navy hover:shadow-md transition-all">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl shrink-0">{t.emoji}</span>
                      <div className="min-w-0">
                        <div className="text-[0.6rem] font-mono text-slate-400">{t.code}</div>
                        <div className="text-[0.8rem] font-bold text-navy group-hover:text-primary truncate">{t.koName}</div>
                      </div>
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
