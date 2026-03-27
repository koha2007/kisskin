import { useState, useEffect, useCallback, useRef } from 'react'
import { useI18n } from './i18n/context'

interface HomePageProps {
  onNavigate: (page: 'home' | 'analysis' | 'terms' | 'privacy' | 'refund' | 'contact' | 'auth' | 'mypage') => void
  user?: { email?: string } | null
  onLogout?: () => void
}

const STYLE_NAMES = [
  'Natural_Glow', 'Cloud_Skin', 'Blood_Lip', 'Maximalist_Eye',
  'Metallic_Eye', 'Bold_Lip', 'Blush_Draping_Layering', 'Grunge_Makeup', 'Kpop_Idol_Makeup',
]

const IMAGE_SETS = [
  Array.from({ length: 9 }, (_, i) => `/styles/hero/photo2_${i + 1}.png`),
  STYLE_NAMES.map(s => `/styles/hero/photo5_${s}.png`),
  STYLE_NAMES.map(s => `/styles/hero/photo6_${s}.png`),
  STYLE_NAMES.map(s => `/styles/hero/photo7_${s}.png`),
  Array.from({ length: 9 }, (_, i) => `/styles/hero/photo9_${String(i + 1).padStart(2, '0')}.png`),
]

interface StyleData {
  num: number
  name: string
  eng: string
  icon: string
}

function WaveGrid({ onClick }: { onClick: () => void }) {
  const [currentSet, setCurrentSet] = useState(0)
  const [tileStates, setTileStates] = useState<string[]>(Array(9).fill(''))
  const isAnimatingRef = useRef(false)
  const currentSetRef = useRef(0)

  const getWaveDelay = (index: number) => {
    const row = Math.floor(index / 3)
    const col = index % 3
    return (row + col) * 130
  }

  const playWave = useCallback(() => {
    for (let i = 0; i < 9; i++) {
      const delay = getWaveDelay(i)
      setTimeout(() => {
        setTileStates(prev => prev.map((s, idx) => idx === i ? 'wave' : s))
      }, delay)
      setTimeout(() => {
        setTileStates(prev => prev.map((s, idx) => idx === i ? '' : s))
      }, delay + 850)
    }
  }, [])

  const switchSet = useCallback(() => {
    if (isAnimatingRef.current) return
    isAnimatingRef.current = true

    // Fade out
    for (let i = 0; i < 9; i++) {
      const delay = getWaveDelay(i)
      setTimeout(() => {
        setTileStates(prev => prev.map((s, idx) => idx === i ? 'fade-out' : s))
      }, delay)
    }

    // Switch images
    setTimeout(() => {
      const nextSet = (currentSetRef.current + 1) % IMAGE_SETS.length
      currentSetRef.current = nextSet
      setCurrentSet(nextSet)
      setTileStates(Array(9).fill('fade-in'))

      // Fade in
      requestAnimationFrame(() => {
        for (let i = 0; i < 9; i++) {
          const delay = getWaveDelay(i) * 0.8
          setTimeout(() => {
            setTileStates(prev => prev.map((s, idx) => idx === i ? 'fade-in show' : s))
          }, delay)
        }
      })

      // Clean up and wave
      setTimeout(() => {
        setTileStates(Array(9).fill(''))
        playWave()
        isAnimatingRef.current = false
      }, 1300)
    }, 850)
  }, [playWave])

  useEffect(() => {
    // Preload all images
    IMAGE_SETS.flat().forEach(src => {
      const img = new Image()
      img.src = src
    })

    // Initial wave
    const waveTimer = setTimeout(() => playWave(), 250)

    // Loop
    const interval = setInterval(() => switchSet(), 4200)

    return () => {
      clearTimeout(waveTimer)
      clearInterval(interval)
    }
  }, [playWave, switchSet])

  const images = IMAGE_SETS[currentSet]

  return (
    <>
      <style>{`
        .wave-scene {
          perspective: 1200px;
        }
        .wave-glow {
          position: absolute;
          inset: -8%;
          background: radial-gradient(circle at center, rgba(255,255,255,0.08), transparent 58%);
          filter: blur(28px);
          pointer-events: none;
        }
        .wave-grid {
          transform-style: preserve-3d;
        }
        .wave-tile {
          position: relative;
          overflow: hidden;
          background: #111;
          box-shadow: 0 10px 30px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.06);
          transform-origin: center center;
          transition: transform 1.1s cubic-bezier(0.22, 1, 0.36, 1), filter 1.1s ease, opacity 1.1s ease;
          will-change: transform, opacity, filter;
        }
        .wave-tile img {
          width: 100%; height: 100%;
          display: block; object-fit: cover;
          transform: scale(1.02);
          transition: transform 1.2s ease, filter 1.1s ease, opacity 1.1s ease;
          user-select: none; pointer-events: none;
          -webkit-user-drag: none;
        }
        .wave-tile.wave {
          z-index: 2;
          transform: translateY(-14px) scale(1.05) rotateX(6deg) rotateY(-4deg);
          filter: brightness(1.08);
        }
        .wave-tile.wave img {
          transform: scale(1.08);
          filter: saturate(1.08);
        }
        .wave-tile.fade-out {
          opacity: 0; transform: scale(0.96); filter: blur(4px);
        }
        .wave-tile.fade-in {
          opacity: 0; transform: scale(1.04); filter: blur(4px);
        }
        .wave-tile.fade-in.show {
          opacity: 1; transform: scale(1); filter: blur(0);
        }
        @media (max-width: 480px) {
          .wave-tile.wave {
            transform: translateY(-8px) scale(1.03) rotateX(3deg) rotateY(-2deg);
          }
        }
      `}</style>
      <div className="wave-scene relative cursor-pointer" onClick={onClick}>
        <div className="wave-glow"></div>
        <div className="wave-grid relative z-[1] grid grid-cols-3 gap-[10px] md:gap-3 rounded-2xl overflow-hidden bg-black/90 p-[10px] md:p-3">
          {images.map((src, i) => (
            <div
              key={`${currentSet}-${i}`}
              className={`wave-tile rounded-xl md:rounded-2xl ${tileStates[i]}`}
              style={{ aspectRatio: '3 / 4' }}
            >
              <img src={src} alt={`K-beauty makeup look ${i + 1} - AI generated Korean makeup style`} loading="eager" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function StyleCard({ style, gender }: { style: StyleData, gender: 'women' | 'men' }) {
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
          <p className="font-bold text-navy-mid text-sm leading-tight">{style.name}</p>
          <p className="text-[0.65rem] text-slate-400 mt-0.5">{style.eng}</p>
        </div>
        <span className={`material-symbols-outlined ${iconColor} text-xl flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity`} style={{ fontVariationSettings: "'FILL' 1" }}>{style.icon}</span>
      </div>
    </div>
  )
}

function HomePage({ onNavigate, user }: HomePageProps) {
  const { t, locale, setLocale } = useI18n()
  const [activeTab, setActiveTab] = useState<'women' | 'men'>('women')

  const womenStyles: StyleData[] = [
    { num: 1, name: t('style.w1'), eng: 'Natural Glow', icon: 'wb_sunny' },
    { num: 2, name: t('style.w2'), eng: 'Cloud Skin', icon: 'cloud' },
    { num: 3, name: t('style.w3'), eng: 'Blood Lip', icon: 'favorite' },
    { num: 4, name: t('style.w4'), eng: 'Maximalist Eye', icon: 'visibility' },
    { num: 5, name: t('style.w5'), eng: 'Metallic Eye', icon: 'diamond' },
    { num: 6, name: t('style.w6'), eng: 'Bold Lip', icon: 'local_fire_department' },
    { num: 7, name: t('style.w7'), eng: 'Blush Draping', icon: 'spa' },
    { num: 8, name: t('style.w8'), eng: 'Grunge Makeup', icon: 'contrast' },
    { num: 9, name: t('style.w9'), eng: 'K-pop Idol', icon: 'star' },
  ]

  const menStyles: StyleData[] = [
    { num: 1, name: t('style.m1'), eng: 'No-Makeup Makeup', icon: 'face' },
    { num: 2, name: t('style.m2'), eng: 'Skincare Hybrid', icon: 'water_drop' },
    { num: 3, name: t('style.m3'), eng: 'Blurred Lip', icon: 'blur_on' },
    { num: 4, name: t('style.m4'), eng: 'Grunge Smoky Eye', icon: 'contrast' },
    { num: 5, name: t('style.m5'), eng: 'Monochrome', icon: 'palette' },
    { num: 6, name: t('style.m6'), eng: 'Utility Makeup', icon: 'shield' },
    { num: 7, name: t('style.m7'), eng: 'Color Point Eye', icon: 'colorize' },
    { num: 8, name: t('style.m8'), eng: 'Vampire Romantic', icon: 'nightlight' },
    { num: 9, name: t('style.m9'), eng: 'K-pop Idol', icon: 'star' },
  ]

  return (
    <div className="font-display bg-background-light text-navy antialiased overflow-x-hidden">
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
      <nav className="sticky top-0 z-50 w-full bg-navy border-b border-navy-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="kissinskin" className="h-9 w-9 rounded-full object-cover" />
            <span className="text-xl font-bold tracking-tight text-white">kissinskin</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#styles" className="text-sm font-medium text-slate-300 hover:text-primary transition-colors cursor-pointer">{t('common.styles')}</a>
            <a href="#how" className="text-sm font-medium text-slate-300 hover:text-primary transition-colors cursor-pointer">{t('common.howItWorks')}</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
              className="text-sm font-medium text-slate-300 hover:text-primary transition-colors px-2 py-1 rounded-md border border-slate-600"
            >
              {locale === 'ko' ? 'EN' : '한국어'}
            </button>
            {user ? (
              <button
                onClick={() => onNavigate('mypage')}
                className="text-sm font-medium text-slate-300 hover:text-primary transition-colors px-3 py-1.5 rounded-md border border-slate-600 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                <span className="hidden sm:inline">{t('auth.mypage')}</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="text-sm font-medium text-slate-300 hover:text-primary transition-colors px-3 py-1.5 rounded-md border border-slate-600"
              >
                {t('auth.login')}
              </button>
            )}
            <button
              className="hidden sm:flex bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/20 items-center gap-1.5"
              onClick={() => onNavigate('analysis')}
            >
              {t('common.startAnalysis')}
            </button>
          </div>
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
                {t('home.hero.badge')}
              </div>

              <h1 className="animate-fade-in-up text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.15] tracking-tight text-navy">
                {t('home.hero.title1')}<br />
                <span className="shimmer-text">{t('home.hero.title2')}</span><br />
                {t('home.hero.title3')}
              </h1>

              <p className="animate-fade-in-up-delay text-base md:text-lg text-slate-600 max-w-lg leading-relaxed">
                {t('home.hero.subtitle')}
                <strong className="text-primary"> {t('home.hero.subtitleBold')}</strong>{t('home.hero.subtitleEnd')}
              </p>

              {/* Product recommendation highlight */}
              <div className="animate-fade-in-up-delay flex items-start gap-3 bg-white/80 rounded-2xl p-4 border border-pink-100 shadow-sm max-w-lg backdrop-blur-sm">
                <span className="material-symbols-outlined text-primary text-2xl flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong className="text-navy-mid">{t('home.hero.productHighlightBold')}</strong>{t('home.hero.productHighlight')}
                  <strong className="text-primary"> {t('home.hero.productHighlightLink')}</strong>{t('home.hero.productHighlightEnd')}
                </p>
              </div>

              <div className="animate-fade-in-up-delay2 flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-8 py-4 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/25 group"
                  onClick={() => onNavigate('analysis')}
                >
                  {t('common.startAnalysisLong')}
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <a
                  href="#styles"
                  className="border border-pink-200 hover:border-primary/30 hover:bg-pink-50 px-8 py-4 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-slate-700"
                >
                  <span className="material-symbols-outlined text-primary">grid_view</span>
                  {t('home.hero.viewStyles')}
                </a>
              </div>

              <div className="animate-fade-in-up-delay2 flex items-center gap-6 pt-1">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className="material-symbols-outlined text-amber-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="text-sm text-slate-500">{t('home.hero.userCount')}</p>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative order-1 lg:order-2">
              <div className="absolute -inset-6 bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-navy/30 rounded-[3rem] blur-2xl"></div>
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl">
                <WaveGrid onClick={() => onNavigate('analysis')} />
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
              { icon: 'bolt', title: t('home.value.title1'), desc: t('home.value.desc1'), gradient: 'from-amber-400 to-orange-500' },
              { icon: 'palette', title: t('home.value.title2'), desc: t('home.value.desc2'), gradient: 'from-pink-400 to-rose-500' },
              { icon: 'devices', title: t('home.value.title3'), desc: t('home.value.desc3'), gradient: 'from-violet-400 to-purple-500' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center gap-4 p-8 rounded-3xl border border-slate-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-50 transition-all group bg-white">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg`}>
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-navy-mid">{item.title}</h3>
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
              {t('home.styles.badge')}
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-navy mt-2">
              {t('home.styles.title')} <span className="text-primary">{t('home.styles.titleHighlight')}</span>{t('home.styles.titleEnd')}
            </h2>
            <p className="text-slate-500 max-w-lg text-sm md:text-base">
              {t('home.styles.subtitle')}
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
                  {t('home.styles.womenTab')}
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
                  {t('home.styles.menTab')}
                </span>
              </button>
            </div>
          </div>

          {/* Style Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(activeTab === 'women' ? womenStyles : menStyles).map((style) => (
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
              {t('home.styles.cta')}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 flex flex-col items-center gap-3">
            <span className="text-primary text-sm font-bold uppercase tracking-widest">{t('home.how.badge')}</span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">{t('home.how.title')}</h2>
          </div>
          <div className="relative grid md:grid-cols-3 gap-8 lg:gap-16 max-w-4xl mx-auto">
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-pink-200 via-primary/30 to-pink-200"></div>
            {[
              { num: '1', icon: 'photo_camera', title: t('home.how.step1'), desc: t('home.how.step1Desc'), gradient: 'from-pink-400 to-rose-500' },
              { num: '2', icon: 'psychology', title: t('home.how.step2'), desc: t('home.how.step2Desc'), gradient: 'from-violet-400 to-purple-500' },
              { num: '3', icon: 'auto_awesome', title: t('home.how.step3'), desc: t('home.how.step3Desc'), gradient: 'from-amber-400 to-orange-500' },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center gap-5 relative">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center border-2 border-pink-100">
                    <span className="material-symbols-outlined text-primary text-5xl">{step.icon}</span>
                  </div>
                  <div className={`absolute -top-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center font-extrabold text-sm shadow-lg`}>{step.num}</div>
                </div>
                <h4 className="text-xl font-bold text-navy-mid">{step.title}</h4>
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
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 text-navy">
            {t('home.cta.title1')}<br />{t('home.cta.title2')}
          </h2>
          <p className="text-base text-slate-500 mb-8 max-w-md mx-auto">
            {t('home.cta.subtitle')}
          </p>
          <button
            className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-12 py-5 rounded-full text-xl font-extrabold transition-all shadow-2xl shadow-primary/30 inline-flex items-center gap-3 hover:scale-[1.02]"
            onClick={() => onNavigate('analysis')}
          >
            {t('common.startAnalysisLong')}
            <span className="material-symbols-outlined text-2xl">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-white pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="kissinskin" className="h-10 w-10 rounded-full object-cover" />
                <span className="text-2xl font-bold tracking-tight">kissinskin</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                {t('home.footer.desc')}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h5 className="font-bold text-sm uppercase tracking-wider text-slate-300">{t('home.footer.service')}</h5>
              <ul className="flex flex-col gap-2 text-slate-400 text-sm">
                <li><a href="#styles" className="hover:text-primary transition-colors cursor-pointer">{t('home.footer.styles')}</a></li>
                <li><a href="#how" className="hover:text-primary transition-colors cursor-pointer">{t('home.footer.howTo')}</a></li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <h5 className="font-bold text-sm uppercase tracking-wider text-slate-300">{t('home.footer.legal')}</h5>
              <ul className="flex flex-col gap-2 text-slate-400 text-sm">
                <li><a className="hover:text-primary transition-colors cursor-pointer" onClick={() => onNavigate('terms')}>Terms of Service</a></li>
                <li><a className="hover:text-primary transition-colors cursor-pointer" onClick={() => onNavigate('refund')}>Refund Policy</a></li>
                <li><a className="hover:text-primary transition-colors cursor-pointer" onClick={() => onNavigate('privacy')}>Privacy Policy</a></li>
                <li><a className="hover:text-primary transition-colors cursor-pointer" onClick={() => onNavigate('contact')}>Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-navy-mid flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs">&copy; 2026 kissinskin. All rights reserved.</p>
            <p className="text-slate-600 text-xs">Powered by AI</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
