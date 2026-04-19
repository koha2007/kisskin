import { MBTI_ORDER, MAKEUP_MBTI_TYPES } from '../../src/lib/makeup-mbti/types'
import { ToolsNav, ToolsFooter } from '../../src/components/ToolsLayout'

interface Tool {
  href: string
  emoji: string
  title: string
  subtitle: string
  desc: string
  cta: string
  gradient: string
  available: boolean
}

const TOOLS: Tool[] = [
  {
    href: '/analysis',
    emoji: '💄',
    title: 'AI 메이크업 시뮬레이터',
    subtitle: 'kissinskin 시그니처',
    desc: '셀카 한 장으로 9가지 K-뷰티 메이크업을 30초 이내에 생성. 여성·남성 각각 18가지 스타일 지원.',
    cta: '지금 시작하기',
    gradient: 'from-primary to-pink-500',
    available: true,
  },
  {
    href: '/tools/makeup-mbti/',
    emoji: '💫',
    title: '메이크업 MBTI 테스트',
    subtitle: '16가지 성향 분석',
    desc: '10문항으로 알아보는 나의 메이크업 성향. 유형별 맞춤 K-뷰티 스타일과 시그니처 룩 공식을 제안합니다.',
    cta: '테스트 시작',
    gradient: 'from-violet-400 to-purple-500',
    available: true,
  },
  {
    href: '/tools/personal-color/',
    emoji: '🎨',
    title: '퍼스널 컬러 자가 진단',
    subtitle: '봄웜·여름쿨·가을웜·겨울쿨',
    desc: '10문항으로 알아보는 나의 퍼스널 컬러. 4가지 시즌별로 어울리는 컬러·메이크업·헤어·액세서리 완벽 가이드.',
    cta: '진단 시작',
    gradient: 'from-amber-400 to-orange-500',
    available: true,
  },
  {
    href: '/tools/face-shape/',
    emoji: '🌟',
    title: '얼굴형 자가 진단',
    subtitle: '5가지 얼굴형 맞춤 가이드',
    desc: '8문항으로 알아보는 계란형·둥근형·각진형·긴형·하트형. 얼굴형별 컨투어링·블러쉬·헤어·안경 배치 가이드.',
    cta: '진단 시작',
    gradient: 'from-emerald-400 to-teal-500',
    available: true,
  },
  {
    href: '/about-makeup-ai/',
    emoji: '📖',
    title: 'K-뷰티 메이크업 완전 가이드',
    subtitle: '3,000단어 심화 아티클',
    desc: 'K-뷰티 메이크업의 역사, 18가지 스타일 상세, AI 시뮬레이션 원리, 사진 촬영 팁까지. 메이크업을 깊이 이해하는 심화 가이드.',
    cta: '가이드 읽기',
    gradient: 'from-rose-400 to-pink-500',
    available: true,
  },
]

export default function ToolsHub() {
  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />

      <main>
      {/* Hero */}
      <section className="relative py-14 md:py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-pink-200/40 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 text-primary text-xs font-bold uppercase tracking-wider mb-5">
            <span className="material-symbols-outlined text-sm">grid_view</span>
            뷰티 도구 모음
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy tracking-tight leading-tight mb-4">
            K-뷰티 AI 도구 모음
          </h1>
          <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            나에게 맞는 메이크업을 찾기 위한 다양한 AI 도구들. 모두 <strong className="text-primary">무료</strong>로 이용할 수 있으며, 로그인이 필요한 도구는 명시되어 있습니다.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            {TOOLS.map(tool => (
              <a
                key={tool.title}
                href={tool.available ? tool.href : undefined}
                className={`group bg-white rounded-3xl p-6 md:p-8 border border-pink-100 transition-all ${
                  tool.available ? 'hover:border-primary/40 hover:shadow-xl hover:shadow-pink-100/50 hover:-translate-y-1 cursor-pointer' : 'opacity-60 cursor-not-allowed'
                }`}
                aria-disabled={!tool.available}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-3xl shadow-lg mb-5`}>
                  {tool.emoji}
                </div>
                <div className="text-[0.65rem] uppercase tracking-widest text-primary-dark font-bold mb-1">{tool.subtitle}</div>
                <h2 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">{tool.title}</h2>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-5">{tool.desc}</p>
                <div className={`inline-flex items-center gap-1.5 font-bold text-sm ${tool.available ? 'text-primary' : 'text-slate-400'}`}>
                  {tool.cta}
                  {tool.available && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* MBTI types preview teaser */}
      <section className="py-14 bg-gradient-to-b from-background-light via-pink-50/20 to-background-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-extrabold text-navy mb-2 tracking-tight">
              16가지 메이크업 MBTI 미리보기
            </h2>
            <p className="text-sm text-slate-500">궁금한 유형이 있다면 직접 들어가 설명을 먼저 볼 수도 있어요.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {MBTI_ORDER.map(code => {
              const t = MAKEUP_MBTI_TYPES[code]
              return (
                <a key={code} href={`/tools/makeup-mbti/${t.slug}/`} className="group bg-white rounded-xl p-3 border border-pink-100 hover:border-primary/30 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{t.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-[0.6rem] font-mono text-slate-400">{t.code}</div>
                      <div className="text-[0.8rem] font-bold text-navy-mid group-hover:text-primary truncate">{t.koName}</div>
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
