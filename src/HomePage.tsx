import { useState, useEffect, useRef } from 'react'
import { useI18n } from './i18n/context'

const PAGE_PATHS: Record<string, string> = {
  home: '/', analysis: '/analysis', terms: '/terms', privacy: '/privacy',
  refund: '/refund', contact: '/contact', auth: '/auth', mypage: '/mypage',
}

interface HomePageProps {
  onNavigate?: (page: string) => void
  user?: { email?: string } | null
  onLogout?: () => void
}

const STYLE_LABELS = [
  'Natural Glow', 'Cloud Skin', 'Blood Lip', 'Maximalist Eye',
  'Metallic Eye', 'Bold Lip', 'Blush Draping', 'Grunge Makeup', 'K-pop Idol',
]

// 9 models — each has 9 style images
const MARQUEE_MODELS: { folder: string; images: string[]; label: string }[] = [
  {
    folder: 'files-01', label: 'Model 1',
    images: ['01_Natural_Glow.jpg', '02_Cloud_Skin.jpg', '03_Blood_Lip.jpg', '04_Maximalist_Eye.jpg', '05_Metallic_Eye.jpg', '06_Bold_Lip.jpg', '07_Blush_Draping_Layering.jpg', '08_Grunge_Makeup.jpg', '09_Kpop_Idol_Makeup.jpg'],
  },
  {
    folder: 'files-02', label: 'Model 2',
    images: ['01_Natural_Glow.jpg', '02_Cloud_Skin.jpg', '03_Blood_Lip.jpg', '04_Maximalist_Eye.jpg', '05_Metallic_Eye.jpg', '06_Bold_Lip.jpg', '07_Blush_Draping_Layering.jpg', '08_Grunge_Makeup.jpg', '09_Kpop_Idol_Makeup.jpg'],
  },
  {
    folder: 'files-04', label: 'Model 3',
    images: ['01_Natural_Glow.jpg', '02_Cloud_Skin.jpg', '03_Blood_Lip.jpg', '04_Maximalist_Eye.jpg', '05_Metallic_Eye.jpg', '06_Bold_Lip.jpg', '07_Blush_Draping_Layering.jpg', '08_Grunge_Makeup.jpg', '09_Kpop_Idol_Makeup.jpg'],
  },
  {
    folder: 'files-12', label: 'Model 4',
    images: ['01_Natural_Glow.jpg', '02_Cloud_Skin.jpg', '03_Blood_Lip.jpg', '04_Maximalist_Eye.jpg', '05_Metallic_Eye.jpg', '06_Bold_Lip.jpg', '07_Blush_Draping_Layering.jpg', '08_Grunge_Makeup.jpg', '09_Kpop_Idol_Makeup.jpg'],
  },
  {
    folder: 'files-13', label: 'Model 5',
    images: ['photo7_Natural_Glow.png', 'photo7_Cloud_Skin.png', 'photo7_Blood_Lip.png', 'photo7_Maximalist_Eye.png', 'photo7_Metallic_Eye.png', 'photo7_Bold_Lip.png', 'photo7_Blush_Draping_Layering.png', 'photo7_Grunge_Makeup.png', 'photo7_Kpop_Idol_Makeup.png'],
  },
  {
    folder: 'files-09', label: 'Model 6',
    images: ['photo2_1.png', 'photo2_2.png', 'photo2_3.png', 'photo2_4.png', 'photo2_5.png', 'photo2_6.png', 'photo2_7.png', 'photo2_8.png', 'photo2_9.png'],
  },
  {
    folder: 'files-11', label: 'Model 7',
    images: ['photo9_01.png', 'photo9_02.png', 'photo9_03.png', 'photo9_04.png', 'photo9_05.png', 'photo9_06.png', 'photo9_07.png', 'photo9_08.png', 'photo9_09.png'],
  },
  {
    folder: 'files-05', label: 'Model 8',
    images: ['01_No-Makeup_Makeup.jpg', '02_Skincare_Hybrid_Base.jpg', '03_Blurred_Lip.jpg', '04_Grunge_Smoky_Eye.jpg', '05_Monochrome.jpg', '06_Utility_Makeup.jpg', '07_Blue_Point_Eye.jpg', '08_Vampire_Romantic.jpg', '09_Kpop_Idol_Makeup.jpg'],
  },
  {
    folder: 'files-06', label: 'Model 9',
    images: ['01_No-Makeup_Makeup.jpg', '02_Skincare_Hybrid_Base.jpg', '03_Blurred_Lip.jpg', '04_Grunge_Smoky_Eye.jpg', '05_Monochrome.jpg', '06_Utility_Makeup.jpg', '07_Blue_Point_Eye.jpg', '08_Vampire_Romantic.jpg', '09_Kpop_Idol_Makeup.jpg'],
  },
]

interface StyleData {
  num: number
  name: string
  eng: string
  icon: string
}

function MarqueeHero({ onClick }: { onClick: () => void }) {
  const [styleIndices, setStyleIndices] = useState<number[]>(
    MARQUEE_MODELS.map((_, i) => i % 9) // stagger initial styles
  )
  const trackRef = useRef<HTMLDivElement>(null)

  // Rotate styles every 3.5s with crossfade
  useEffect(() => {
    const interval = setInterval(() => {
      setStyleIndices(prev => prev.map((idx) => (idx + 1) % 9))
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  // Clone cards for seamless loop
  useEffect(() => {
    const track = trackRef.current
    if (!track || track.dataset.cloned) return
    track.dataset.cloned = 'true'
    const originals = Array.from(track.children)
    originals.forEach(card => {
      const clone = card.cloneNode(true) as HTMLElement
      clone.setAttribute('aria-hidden', 'true')
      track.appendChild(clone)
    })
  }, [])

  // Preload first image of each model
  useEffect(() => {
    MARQUEE_MODELS.forEach(m => {
      const img = new Image()
      img.src = `/styles/marquee/${m.folder}_${m.images[0]}`
    })
  }, [])

  return (
    <>
      <style>{`
        .ks-hero-wrap {
          position: relative;
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          overflow: hidden;
          padding: 20px 0;
        }
        .ks-hero-wrap::before,
        .ks-hero-wrap::after {
          content: '';
          position: absolute;
          top: 0;
          width: 120px;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }
        .ks-hero-wrap::before {
          left: 0;
          background: linear-gradient(to right, var(--bg, #faf9f8) 0%, transparent 100%);
        }
        .ks-hero-wrap::after {
          right: 0;
          background: linear-gradient(to left, var(--bg, #faf9f8) 0%, transparent 100%);
        }
        .ks-marquee-track {
          display: flex;
          gap: 14px;
          width: max-content;
          animation: ks-scroll 28s linear infinite;
          will-change: transform;
        }
        .ks-marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes ks-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ks-card {
          position: relative;
          width: 200px;
          height: 280px;
          border-radius: 16px;
          overflow: hidden;
          flex-shrink: 0;
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.35s ease;
          background: #111;
        }
        .ks-card:hover {
          transform: translateY(-10px) scale(1.03);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        .ks-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: opacity 0.8s ease, transform 0.5s ease;
        }
        .ks-card:hover img {
          transform: scale(1.06);
        }
        .ks-card-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 28px 14px 12px;
          background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          transition: opacity 0.8s ease;
        }
        @media (max-width: 768px) {
          .ks-card {
            width: 155px;
            height: 220px;
          }
          .ks-hero-wrap::before,
          .ks-hero-wrap::after {
            width: 50px;
          }
          .ks-marquee-track {
            gap: 10px;
            animation-duration: 20s;
          }
        }
      `}</style>
      <div className="ks-hero-wrap">
        <div className="ks-marquee-track" ref={trackRef}>
          {MARQUEE_MODELS.map((model, mi) => {
            const imgFile = model.images[styleIndices[mi]]
            const src = `/styles/marquee/${model.folder}_${imgFile}`
            return (
              <div key={model.folder} className="ks-card" onClick={onClick}>
                <img
                  src={src}
                  alt={`${STYLE_LABELS[styleIndices[mi]]} - AI makeup`}
                  loading="eager"
                />
                <div className="ks-card-label">{STYLE_LABELS[styleIndices[mi]]}</div>
              </div>
            )
          })}
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

function HomePage({ onNavigate: onNavigateProp, user }: HomePageProps) {
  const onNavigate = (page: string) => {
    if (onNavigateProp) { onNavigateProp(page); return }
    const path = PAGE_PATHS[page] || '/'
    window.location.href = path
  }

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
          <div className="flex flex-col items-center gap-10">
            <div className="flex flex-col gap-6 items-center text-center max-w-2xl">
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
              <div className="animate-fade-in-up-delay flex items-start gap-3 bg-white/80 rounded-2xl p-4 border border-pink-100 shadow-sm max-w-lg backdrop-blur-sm text-left">
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

          </div>

          {/* Marquee Hero — 9 models with cycling styles */}
          <MarqueeHero onClick={() => onNavigate('analysis')} />
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

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 flex flex-col items-center gap-3">
            <span className="text-primary text-sm font-bold uppercase tracking-widest">{t('pricing.badge')}</span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">{t('pricing.title')}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Per-analysis */}
            <div className="relative rounded-2xl border border-slate-200 bg-white p-8 flex flex-col gap-5">
              <h3 className="text-lg font-bold text-navy">{t('pricing.perAnalysis')}</h3>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-extrabold text-navy">{t('pricing.perAnalysisPrice')}</span>
                <span className="text-slate-400 text-sm mb-1">{t('pricing.perAnalysisUnit')}</span>
              </div>
              <p className="text-slate-500 text-sm">{t('pricing.perAnalysisDesc')}</p>
              <ul className="flex flex-col gap-2.5 text-sm text-slate-600 mt-2">
                {['perAnalysisF1', 'perAnalysisF2', 'perAnalysisF3'].map(k => (
                  <li key={k} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-500 text-base">check_circle</span>
                    {t(`pricing.${k}`)}
                  </li>
                ))}
              </ul>
              <button
                className="mt-auto w-full py-3.5 rounded-xl border-2 border-primary text-primary font-bold text-sm hover:bg-pink-50 transition-colors"
                onClick={() => onNavigate('analysis')}
              >
                {t('pricing.startBtn')}
              </button>
            </div>
            {/* Subscription */}
            <div className="relative rounded-2xl border-2 border-primary bg-white p-8 flex flex-col gap-5 shadow-lg shadow-primary/10">
              <span className="absolute -top-3 right-6 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">{t('pricing.popular')}</span>
              <h3 className="text-lg font-bold text-navy">{t('pricing.subscription')}</h3>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-extrabold text-primary">{t('pricing.subscriptionPrice')}</span>
                <span className="text-slate-400 text-sm mb-1">{t('pricing.subscriptionUnit')}</span>
              </div>
              <p className="text-slate-500 text-sm">{t('pricing.subscriptionDesc')}</p>
              <ul className="flex flex-col gap-2.5 text-sm text-slate-600 mt-2">
                {['subscriptionF1', 'subscriptionF2', 'subscriptionF3', 'subscriptionF4', 'subscriptionF5'].map(k => (
                  <li key={k} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-500 text-base">check_circle</span>
                    {t(`pricing.${k}`)}
                  </li>
                ))}
              </ul>
              <button
                className="mt-auto w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-pink-500 text-white font-bold text-sm hover:from-primary/90 hover:to-pink-500/90 transition-all shadow-md shadow-primary/20"
                onClick={() => onNavigate('analysis')}
              >
                {t('pricing.startBtn')}
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">{t('pricing.trialNote')}</p>
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
                <li><a href="#pricing" className="hover:text-primary transition-colors cursor-pointer">{t('pricing.badge')}</a></li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <h5 className="font-bold text-sm uppercase tracking-wider text-slate-300">{t('home.footer.legal')}</h5>
              <ul className="flex flex-col gap-2 text-slate-400 text-sm">
                <li><a href="/terms" className="hover:text-primary transition-colors cursor-pointer">Terms of Service</a></li>
                <li><a href="/refund" className="hover:text-primary transition-colors cursor-pointer">Refund Policy</a></li>
                <li><a href="/privacy" className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors cursor-pointer">Contact Us</a></li>
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
