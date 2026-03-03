import { useState, useEffect, useCallback, useRef } from 'react'

interface HomePageProps {
  onNavigate: (page: 'home' | 'analysis') => void
}

const HERO_IMAGES = [
  // photo2 series
  ...Array.from({ length: 9 }, (_, i) => `/styles/hero/photo2_${i + 1}.png`),
  // photo5 series
  ...[
    'Blood_Lip', 'Blush_Draping_Layering', 'Bold_Lip', 'Cloud_Skin',
    'Grunge_Makeup', 'Kpop_Idol_Makeup', 'Maximalist_Eye', 'Metallic_Eye', 'Natural_Glow',
  ].map(s => `/styles/hero/photo5_${s}.png`),
  // photo6 series
  ...[
    'Blood_Lip', 'Blush_Draping_Layering', 'Bold_Lip', 'Cloud_Skin',
    'Grunge_Makeup', 'Kpop_Idol_Makeup', 'Maximalist_Eye', 'Metallic_Eye', 'Natural_Glow',
  ].map(s => `/styles/hero/photo6_${s}.png`),
  // photo7 series
  ...[
    'Blood_Lip', 'Blush_Draping_Layering', 'Bold_Lip', 'Cloud_Skin',
    'Grunge_Makeup', 'Kpop_Idol_Makeup', 'Maximalist_Eye', 'Metallic_Eye', 'Natural_Glow',
  ].map(s => `/styles/hero/photo7_${s}.png`),
  // photo9 series
  ...Array.from({ length: 9 }, (_, i) => `/styles/hero/photo9_${String(i + 1).padStart(2, '0')}.png`),
  // photo10 series
  ...[
    'Blood_Lip', 'Blush_Draping_Layering', 'Bold_Lip', 'Cloud_Skin',
    'Grunge_Makeup', 'Kpop_Idol_Makeup', 'Maximalist_Eye', 'Metallic_Eye', 'Natural_Glow',
  ].map(s => `/styles/hero/photo10_${s}.png`),
]

const FLOAT_CONFIGS = [
  { dur: 4.0, x: 6, y: 10 },
  { dur: 5.2, x: -5, y: 8 },
  { dur: 4.6, x: 7, y: -9 },
  { dur: 5.8, x: -6, y: 11 },
  { dur: 4.3, x: 5, y: -7 },
  { dur: 5.5, x: -7, y: 9 },
  { dur: 4.8, x: 8, y: -10 },
  { dur: 5.0, x: -5, y: 8 },
  { dur: 4.4, x: 6, y: -8 },
]

const WOMEN_STYLES = [
  { num: 1, name: '내추럴 글로우', eng: 'Natural Glow', icon: 'wb_sunny' },
  { num: 2, name: '클라우드 스킨', eng: 'Cloud Skin', icon: 'cloud' },
  { num: 3, name: '블러드 립', eng: 'Blood Lip', icon: 'favorite' },
  { num: 4, name: '맥시멀리스트 아이', eng: 'Maximalist Eye', icon: 'visibility' },
  { num: 5, name: '메탈릭 아이', eng: 'Metallic Eye', icon: 'diamond' },
  { num: 6, name: '볼드 립', eng: 'Bold Lip', icon: 'local_fire_department' },
  { num: 7, name: '블러쉬 드레이핑 & 레이어링', eng: 'Blush Draping', icon: 'spa' },
  { num: 8, name: '그런지 메이크업', eng: 'Grunge Makeup', icon: 'contrast' },
  { num: 9, name: 'K-pop 아이돌 메이크업', eng: 'K-pop Idol', icon: 'star' },
]

const MEN_STYLES = [
  { num: 1, name: '내추럴 소프트포커스 스킨', eng: 'No-Makeup Makeup', icon: 'face' },
  { num: 2, name: '스킨케어 하이브리드 베이스', eng: 'Skincare Hybrid', icon: 'water_drop' },
  { num: 3, name: '디퓨즈드 립', eng: 'Blurred Lip', icon: 'blur_on' },
  { num: 4, name: '그런지 / 스모키 아이', eng: 'Grunge Smoky Eye', icon: 'contrast' },
  { num: 5, name: '톤인톤 모노크롬 메이크업', eng: 'Monochrome', icon: 'palette' },
  { num: 6, name: '유틸리티 메이크업', eng: 'Utility Makeup', icon: 'shield' },
  { num: 7, name: '블루 & 컬러 포인트 아이', eng: 'Color Point Eye', icon: 'colorize' },
  { num: 8, name: '뱀파이어 로맨틱', eng: 'Vampire Romantic', icon: 'nightlight' },
  { num: 9, name: 'K-팝 아이돌 메이크업', eng: 'K-pop Idol', icon: 'star' },
]

function AnimatedGrid({ onClick }: { onClick: () => void }) {
  const [cells, setCells] = useState(() =>
    shuffleArray([...HERO_IMAGES]).map(img => ({
      images: [img],
      key: 0,
    }))
  )
  const cellsRef = useRef(cells)
  cellsRef.current = cells
  const busyRef = useRef<Set<number>>(new Set())

  const swapCell = useCallback(() => {
    const current = cellsRef.current
    const candidates = Array.from({ length: 9 }, (_, i) => i).filter(i => !busyRef.current.has(i))
    if (candidates.length === 0) return
    const cellIdx = candidates[Math.floor(Math.random() * candidates.length)]
    const currentImg = current[cellIdx].images[0]
    const available = HERO_IMAGES.filter(img => img !== currentImg)
    const nextImg = available[Math.floor(Math.random() * available.length)]
    busyRef.current.add(cellIdx)
    setCells(prev => prev.map((cell, i) =>
      i === cellIdx ? { images: [nextImg, ...cell.images.slice(0, 1)], key: cell.key + 1 } : cell
    ))
    setTimeout(() => {
      setCells(prev => prev.map((cell, i) =>
        i === cellIdx ? { ...cell, images: [cell.images[0]] } : cell
      ))
      busyRef.current.delete(cellIdx)
    }, 800)
  }, [])

  useEffect(() => {
    const schedule = () => {
      const delay = 1200 + Math.random() * 800
      return setTimeout(() => {
        swapCell()
        timerRef.current = schedule()
      }, delay)
    }
    const timerRef = { current: schedule() }
    return () => clearTimeout(timerRef.current)
  }, [swapCell])

  return (
    <>
      <style>{`
        @keyframes heroFloat {
          0%, 100% { translate: var(--fx) var(--fy); }
          50% { translate: calc(var(--fx) * -1) calc(var(--fy) * -1); }
        }
        @keyframes slideUp {
          from { translate: 0 100%; }
          to   { translate: 0 0; }
        }
        @keyframes slideOut {
          from { translate: 0 0; }
          to   { translate: 0 -100%; }
        }
        .hero-cell {
          animation: heroFloat var(--dur) ease-in-out infinite;
        }
        .hero-slide-in {
          animation: slideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .hero-slide-out {
          animation: slideOut 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
      <div className="grid grid-cols-3 gap-1.5 md:gap-2.5 cursor-pointer" onClick={onClick}>
        {cells.map((cell, i) => {
          const fc = FLOAT_CONFIGS[i]
          const isSwapping = cell.images.length > 1
          return (
            <div
              key={i}
              className="hero-cell relative overflow-hidden rounded-lg md:rounded-xl"
              style={{
                aspectRatio: '3 / 4',
                '--dur': `${fc.dur}s`,
                '--fx': `${fc.x}px`,
                '--fy': `${fc.y}px`,
                animationDelay: `${i * -0.8}s`,
              } as React.CSSProperties}
            >
              <img
                key={cell.key}
                src={cell.images[0]}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover ${isSwapping ? 'hero-slide-in' : ''}`}
                style={{ zIndex: 2 }}
              />
              {isSwapping && cell.images[1] && (
                <img
                  key={cell.key - 1}
                  src={cell.images[1]}
                  alt=""
                  className="hero-slide-out absolute inset-0 w-full h-full object-cover"
                  style={{ zIndex: 1 }}
                />
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function StyleCard({ style, gender }: { style: typeof WOMEN_STYLES[0], gender: 'women' | 'men' }) {
  const bgColor = gender === 'women'
    ? 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-100 hover:border-pink-300 hover:shadow-pink-100/50'
    : 'bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 hover:border-blue-300 hover:shadow-blue-100/50'
  const iconColor = gender === 'women' ? 'text-rose-400' : 'text-blue-400'
  const numColor = gender === 'women' ? 'bg-rose-400' : 'bg-blue-400'

  return (
    <div className={`${bgColor} border rounded-2xl p-4 transition-all hover:shadow-lg hover:-translate-y-0.5 group`}>
      <div className="flex items-center gap-3">
        <div className={`${numColor} w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
          {style.num}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm leading-tight">{style.name}</p>
          <p className="text-[0.65rem] text-slate-400 mt-0.5">{style.eng}</p>
        </div>
        <span className={`material-symbols-outlined ${iconColor} text-xl flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity`} style={{ fontVariationSettings: "'FILL' 1" }}>{style.icon}</span>
      </div>
    </div>
  )
}

function HomePage({ onNavigate }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<'women' | 'men'>('women')

  return (
    <div className="font-display bg-background-light text-slate-900 antialiased overflow-x-hidden">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-fade-in-up-delay {
          animation: fadeInUp 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }
        .animate-fade-in-up-delay2 {
          animation: fadeInUp 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }
        .shimmer-text {
          background: linear-gradient(90deg, #eb4763, #f472b6, #eb4763);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full glass-card border-b border-pink-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>flare</span>
            <span className="text-xl font-bold tracking-tight text-slate-900">KisSkin</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#styles" className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Styles</a>
            <a href="#how" className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">How it Works</a>
          </div>
          <button
            className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/20"
            onClick={() => onNavigate('analysis')}
          >
            무료 분석 시작
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-14 lg:py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-pink-200/40 via-rose-100/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200/20 via-pink-100/30 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-amber-100/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" style={{ animation: 'pulse-soft 4s ease-in-out infinite' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="flex flex-col gap-6 order-2 lg:order-1">
              <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 text-primary text-xs font-bold uppercase tracking-wider w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                AI Beauty Technology
              </div>

              <h1 className="animate-fade-in-up text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.15] tracking-tight text-slate-900">
                사진 한장으로 완성하는<br />
                <span className="shimmer-text">9가지 놀라운</span><br />
                메이크업 룩
              </h1>

              <p className="animate-fade-in-up-delay text-base md:text-lg text-slate-600 max-w-lg leading-relaxed">
                셀카 한장이면 충분해요. AI가 당신에게 가장 어울리는
                <strong className="text-primary"> 9가지 프로페셔널 메이크업</strong>을 만들어 드립니다.
              </p>

              {/* Product recommendation highlight */}
              <div className="animate-fade-in-up-delay flex items-start gap-3 bg-white/80 rounded-2xl p-4 border border-pink-100 shadow-sm max-w-lg backdrop-blur-sm">
                <span className="material-symbols-outlined text-primary text-2xl flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">피부타입을 분석</strong>해서 가장 적합한 제품을 추천해 드리고,
                  <strong className="text-primary"> 구매 링크</strong>도 함께 제공합니다.
                </p>
              </div>

              <div className="animate-fade-in-up-delay2 flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-8 py-4 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/25 group"
                  onClick={() => onNavigate('analysis')}
                >
                  무료 분석 시작하기
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <a
                  href="#styles"
                  className="border border-pink-200 hover:border-primary/30 hover:bg-pink-50 px-8 py-4 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-slate-700"
                >
                  <span className="material-symbols-outlined text-primary">grid_view</span>
                  스타일 보기
                </a>
              </div>

              <div className="animate-fade-in-up-delay2 flex items-center gap-6 pt-1">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className="material-symbols-outlined text-amber-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="text-sm text-slate-500"><strong className="text-slate-700">50,000+</strong> 명이 사용 중</p>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative order-1 lg:order-2">
              <div className="absolute -inset-6 bg-gradient-to-br from-pink-200/30 via-rose-100/40 to-purple-100/30 rounded-[3rem] blur-2xl"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-[2rem] p-3 md:p-5 shadow-2xl border border-pink-100/50">
                <AnimatedGrid onClick={() => onNavigate('analysis')} />
                <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-primary to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-primary/30 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-lg">auto_awesome</span>
                  AI Powered
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: 'bolt', title: '즉시 분석', desc: 'AI가 얼굴을 분석하고 60초 안에 9가지 룩을 생성합니다.', gradient: 'from-amber-400 to-orange-500' },
              { icon: 'palette', title: '맞춤 추천', desc: '피부타입에 맞는 제품을 추천하고 구매 링크를 제공합니다.', gradient: 'from-pink-400 to-rose-500' },
              { icon: 'devices', title: '모든 기기 지원', desc: 'Galaxy, iPhone, PC 어디서든 카메라 또는 갤러리에서 업로드하세요.', gradient: 'from-violet-400 to-purple-500' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center gap-4 p-8 rounded-3xl border border-slate-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-50 transition-all group bg-white">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg`}>
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Makeup Styles Section */}
      <section id="styles" className="py-20 scroll-mt-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background-light via-pink-50/30 to-background-light"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 flex flex-col items-center gap-3">
            <span className="inline-flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              2026 Makeup Trends
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 mt-2">
              여성과 남성의 <span className="text-primary">9가지 메이크업 스타일</span>은<br className="hidden sm:block" />
              이렇게 변화가 이루어져요
            </h2>
            <p className="text-slate-500 max-w-lg text-sm md:text-base">
              AI가 당신의 얼굴에 맞춰 최신 트렌드 메이크업을 적용합니다
            </p>
          </div>

          {/* Gender Tab */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-full p-1 border border-pink-100 shadow-sm">
              <button
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeTab === 'women'
                    ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-md shadow-primary/20'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setActiveTab('women')}
              >
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>female</span>
                  2026 여자 메이크업
                </span>
              </button>
              <button
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeTab === 'men'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setActiveTab('men')}
              >
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>male</span>
                  2026 남자 메이크업
                </span>
              </button>
            </div>
          </div>

          {/* Style Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(activeTab === 'women' ? WOMEN_STYLES : MEN_STYLES).map((style) => (
              <StyleCard key={style.num} style={style} gender={activeTab} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              className={`${
                activeTab === 'women'
                  ? 'bg-gradient-to-r from-primary to-pink-500 shadow-primary/25'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-blue-500/25'
              } text-white px-10 py-4 rounded-full text-lg font-bold transition-all shadow-xl inline-flex items-center gap-2 hover:scale-[1.02]`}
              onClick={() => onNavigate('analysis')}
            >
              9가지 스타일 체험하기
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 flex flex-col items-center gap-3">
            <span className="text-primary text-sm font-bold uppercase tracking-widest">Simple Process</span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">간단한 3단계</h2>
          </div>
          <div className="relative grid md:grid-cols-3 gap-8 lg:gap-16 max-w-4xl mx-auto">
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-pink-200 via-primary/30 to-pink-200"></div>
            {[
              { num: '1', icon: 'photo_camera', title: '사진 업로드', desc: '셀카를 찍거나 갤러리에서 사진을 선택하세요', gradient: 'from-pink-400 to-rose-500' },
              { num: '2', icon: 'psychology', title: 'AI 분석', desc: '피부타입, 피부톤, 얼굴 특징을 분석합니다', gradient: 'from-violet-400 to-purple-500' },
              { num: '3', icon: 'auto_awesome', title: '결과 확인', desc: '9가지 메이크업 + 맞춤 제품 추천을 받으세요', gradient: 'from-amber-400 to-orange-500' },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center gap-5 relative">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center border-2 border-pink-100">
                    <span className="material-symbols-outlined text-primary text-5xl">{step.icon}</span>
                  </div>
                  <div className={`absolute -top-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center font-extrabold text-sm shadow-lg`}>{step.num}</div>
                </div>
                <h4 className="text-xl font-bold text-slate-800">{step.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-200/20 rounded-full blur-2xl"></div>

        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <span className="material-symbols-outlined text-primary text-5xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
            나에게 어울리는<br />메이크업을 찾아보세요
          </h2>
          <p className="text-base text-slate-500 mb-8 max-w-md mx-auto">
            50,000명 이상이 KisSkin AI로 자신만의 시그니처 스타일을 발견했습니다.
          </p>
          <button
            className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-12 py-5 rounded-full text-xl font-extrabold transition-all shadow-2xl shadow-primary/30 inline-flex items-center gap-3 hover:scale-[1.02]"
            onClick={() => onNavigate('analysis')}
          >
            무료 분석 시작하기
            <span className="material-symbols-outlined text-2xl">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>flare</span>
                <span className="text-2xl font-bold tracking-tight">KisSkin</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                AI 기반 메이크업 분석과 맞춤형 뷰티 추천 서비스
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h5 className="font-bold text-sm uppercase tracking-wider text-slate-300">서비스</h5>
              <ul className="flex flex-col gap-2 text-slate-400 text-sm">
                <li><a href="#styles" className="hover:text-primary transition-colors cursor-pointer">9가지 스타일</a></li>
                <li><a href="#how" className="hover:text-primary transition-colors cursor-pointer">이용 방법</a></li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <h5 className="font-bold text-sm uppercase tracking-wider text-slate-300">법적 고지</h5>
              <ul className="flex flex-col gap-2 text-slate-400 text-sm">
                <li><a className="hover:text-primary transition-colors cursor-pointer">개인정보처리방침</a></li>
                <li><a className="hover:text-primary transition-colors cursor-pointer">이용약관</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs">&copy; 2026 KisSkin. All rights reserved.</p>
            <p className="text-slate-600 text-xs">Powered by AI</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
