import { useState, useEffect } from 'react'
import { useI18n } from './i18n/I18nContext'
import { useAuth } from './hooks/useAuth'

const PAGE_PATHS: Record<string, string> = {
  home: '/', analysis: '/analysis/', terms: '/terms/', privacy: '/privacy/',
  refund: '/refund/', contact: '/contact/', auth: '/auth/', mypage: '/mypage/',
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
    images: ['01_Natural_Glow.webp', '02_Cloud_Skin.webp', '03_Blood_Lip.webp', '04_Maximalist_Eye.webp', '05_Metallic_Eye.webp', '06_Bold_Lip.webp', '07_Blush_Draping_Layering.webp', '08_Grunge_Makeup.webp', '09_Kpop_Idol_Makeup.webp'],
  },
  {
    folder: 'files-02', label: 'Model 2',
    images: ['01_Natural_Glow.webp', '02_Cloud_Skin.webp', '03_Blood_Lip.webp', '04_Maximalist_Eye.webp', '05_Metallic_Eye.webp', '06_Bold_Lip.webp', '07_Blush_Draping_Layering.webp', '08_Grunge_Makeup.webp', '09_Kpop_Idol_Makeup.webp'],
  },
  {
    folder: 'files-04', label: 'Model 3',
    images: ['01_Natural_Glow.webp', '02_Cloud_Skin.webp', '03_Blood_Lip.webp', '04_Maximalist_Eye.webp', '05_Metallic_Eye.webp', '06_Bold_Lip.webp', '07_Blush_Draping_Layering.webp', '08_Grunge_Makeup.webp', '09_Kpop_Idol_Makeup.webp'],
  },
  {
    folder: 'files-12', label: 'Model 4',
    images: ['01_Natural_Glow.webp', '02_Cloud_Skin.webp', '03_Blood_Lip.webp', '04_Maximalist_Eye.webp', '05_Metallic_Eye.webp', '06_Bold_Lip.webp', '07_Blush_Draping_Layering.webp', '08_Grunge_Makeup.webp', '09_Kpop_Idol_Makeup.webp'],
  },
  {
    folder: 'files-13', label: 'Model 5',
    images: ['photo7_Natural_Glow.webp', 'photo7_Cloud_Skin.webp', 'photo7_Blood_Lip.webp', 'photo7_Maximalist_Eye.webp', 'photo7_Metallic_Eye.webp', 'photo7_Bold_Lip.webp', 'photo7_Blush_Draping_Layering.webp', 'photo7_Grunge_Makeup.webp', 'photo7_Kpop_Idol_Makeup.webp'],
  },
  {
    folder: 'files-09', label: 'Model 6',
    images: ['photo2_1.webp', 'photo2_2.webp', 'photo2_3.webp', 'photo2_4.webp', 'photo2_5.webp', 'photo2_6.webp', 'photo2_7.webp', 'photo2_8.webp', 'photo2_9.webp'],
  },
  {
    folder: 'files-11', label: 'Model 7',
    images: ['photo9_01.webp', 'photo9_02.webp', 'photo9_03.webp', 'photo9_04.webp', 'photo9_05.webp', 'photo9_06.webp', 'photo9_07.webp', 'photo9_08.webp', 'photo9_09.webp'],
  },
  {
    folder: 'files-05', label: 'Model 8',
    images: ['01_No-Makeup_Makeup.webp', '02_Skincare_Hybrid_Base.webp', '03_Blurred_Lip.webp', '04_Grunge_Smoky_Eye.webp', '05_Monochrome.webp', '06_Utility_Makeup.webp', '07_Blue_Point_Eye.webp', '08_Vampire_Romantic.webp', '09_Kpop_Idol_Makeup.webp'],
  },
  {
    folder: 'files-06', label: 'Model 9',
    images: ['01_No-Makeup_Makeup.webp', '02_Skincare_Hybrid_Base.webp', '03_Blurred_Lip.webp', '04_Grunge_Smoky_Eye.webp', '05_Monochrome.webp', '06_Utility_Makeup.webp', '07_Blue_Point_Eye.webp', '08_Vampire_Romantic.webp', '09_Kpop_Idol_Makeup.webp'],
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
  // Rotate styles every 3.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setStyleIndices(prev => prev.map((idx) => (idx + 1) % 9))
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  // Preload every rotation image so the 3.5s style swaps are instant (no blank
  // pop-in mid-scroll). Deferred so it never competes with first paint.
  useEffect(() => {
    const id = window.setTimeout(() => {
      MARQUEE_MODELS.forEach(m =>
        m.images.forEach(file => {
          const img = new Image()
          img.src = `/styles/marquee/${m.folder}_${file}`
        })
      )
    }, 1200)
    return () => window.clearTimeout(id)
  }, [])

  // Render the model cards. The track holds two identical copies (a + b) and the
  // CSS scrolls it by exactly -50%, so copy B lands where copy A began — a truly
  // seamless loop. Both copies read the same styleIndices, so they always show
  // the same image (the old cloneNode froze copies on their initial image, which
  // popped at every loop seam). Copy B is decorative: hidden from a11y + focus.
  const renderCards = (copy: 'a' | 'b') =>
    MARQUEE_MODELS.map((model, mi) => {
      const src = `/styles/marquee/${model.folder}_${model.images[styleIndices[mi]]}`
      return (
        <div
          key={`${copy}-${model.folder}`}
          className="ks-card"
          onClick={onClick}
          role="button"
          tabIndex={copy === 'a' ? 0 : -1}
          aria-hidden={copy === 'b' || undefined}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
          aria-label={`Try AI makeup — ${STYLE_LABELS[styleIndices[mi]]}`}
        >
          <img
            src={src}
            alt={`${STYLE_LABELS[styleIndices[mi]]} - AI makeup`}
            width={200}
            height={280}
            loading={copy === 'a' && mi < 2 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={copy === 'a' && mi === 0 ? 'high' : 'auto'}
          />
          <div className="ks-card-label">
            <span>{STYLE_LABELS[styleIndices[mi]]}</span>
            <span className="ks-card-try" aria-hidden="true">Try →</span>
          </div>
        </div>
      )
    })

  return (
    <>
      <style>{`
        .ks-hero-wrap {
          position: relative;
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          overflow: hidden;
          padding: 20px 0;
          min-height: 320px;
          contain: layout style;
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
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .ks-marquee-track:hover,
        .ks-marquee-track.ks-paused {
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
          aspect-ratio: 200 / 280;
          border-radius: 16px;
          overflow: hidden;
          flex-shrink: 0;
          cursor: pointer;
          /* touch-action: manipulation kills the iOS 300ms tap delay and the
             double-tap-zoom gesture on these cards — without it some quick
             single taps on the rotating carousel were counted as dead clicks. */
          touch-action: manipulation;
          -webkit-tap-highlight-color: rgba(235, 71, 99, 0.25);
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.35s ease;
          background: #111;
          contain: layout style paint;
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
          padding: 36px 14px 12px;
          background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 50%, transparent 100%);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          transition: opacity 0.8s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        /* "Try →" hint pill on every card — makes the carousel obviously tappable
           (cards were getting a lot of dead clicks because nothing on the card
           visually said "you can click this"). */
        .ks-card-try {
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.95);
          color: #eb4763;
          padding: 3px 8px;
          border-radius: 999px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        @media (max-width: 768px) {
          .ks-card {
            width: 155px;
            height: 220px;
            aspect-ratio: 155 / 220;
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
        <div
          className="ks-marquee-track"
          onTouchStart={(e) => e.currentTarget.classList.add('ks-paused')}
          onTouchEnd={(e) => {
            const el = e.currentTarget
            window.setTimeout(() => el.classList.remove('ks-paused'), 1500)
          }}
        >
          {renderCards('a')}
          {renderCards('b')}
        </div>
      </div>
    </>
  )
}

function StyleCard({ style, gender }: { style: StyleData, gender: 'women' | 'men' }) {
  const { locale } = useI18n()
  const bgColor = gender === 'women'
    ? 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-100 hover:border-pink-300 hover:shadow-pink-100/50'
    : 'bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 hover:border-blue-300 hover:shadow-blue-100/50'
  const iconColor = gender === 'women' ? 'text-rose-400' : 'text-blue-400'
  const numColor = gender === 'women' ? 'bg-rose-400' : 'bg-blue-400'

  return (
    <a
      href="/analysis/"
      aria-label={locale === 'en' ? `Start AI makeup in the ${style.name} style` : `${style.name} 스타일로 AI 메이크업 시작`}
      className={`${bgColor} border rounded-2xl p-4 transition-all hover:shadow-lg hover:-translate-y-0.5 group block`}
    >
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
    </a>
  )
}

function HomePage({ onNavigate: onNavigateProp, user: userProp }: HomePageProps) {
  const onNavigate = (page: string) => {
    if (onNavigateProp) { onNavigateProp(page); return }
    const path = PAGE_PATHS[page] || '/'
    window.location.href = path
  }

  const { user: authUser } = useAuth()
  const user = userProp ?? authUser

  const { t, locale, setLocale } = useI18n()
  const isEn = locale === 'en'
  // Bottom-of-home guide FAQ — shared by the accordion and the FAQPage JSON-LD so
  // structured data always matches the visible text in the active language.
  const homeFaq = isEn
    ? [
        { q: 'What happens to my selfie after I upload it?', a: 'Your uploaded photo is used only for the AI makeup synthesis, then processed and deleted. It is never reused as training data, and unless you tap save or share yourself, the result image is never made public.' },
        { q: 'How close is the result to real makeup?', a: 'For a front-facing selfie in natural light, the visual match is roughly 85–95%. Color can vary with your monitor or phone display calibration, so for a look you love we recommend confirming the shade in-store once before buying.' },
        { q: 'Can I use it without signing up?', a: 'The Makeup MBTI, Personal Color, and Face Shape tools are all usable instantly without an account. The AI makeup simulation is available after payment, as a single-use pass or a subscription.' },
        { q: 'Can I get a refund?', a: 'If the analysis is still unused right after payment, a refund is available within 7 days. Once you have used the analysis or downloaded the result image, refunds are limited due to the nature of digital content. See the refund policy page for the full terms.' },
        { q: 'Where can I buy the recommended cosmetics?', a: 'We give recommendations by category (lipstick, eyeshadow, blush, and so on). For specific products, search and compare on the channels you already use — Olive Young, Sephora, Coupang, Amazon, and others. We never lock you into a single store.' },
        { q: 'Can men use it too?', a: 'Yes. We curate a separate set of 6 men’s looks (Skincare Glow Base, No-Makeup Makeup, K-Pop Idol, and more) — from a natural grooming base all the way to K-pop stage makeup, plus a 2026 trend hair color.' },
      ]
    : [
        { q: '셀카 업로드 후 사진은 어떻게 처리되나요?', a: '업로드된 사진은 AI 메이크업 합성에 한해 일시 사용된 뒤 처리·삭제됩니다. 학습 데이터로 재사용되지 않으며, 본인이 직접 저장·공유 버튼을 누르지 않으면 결과 이미지도 외부에 공개되지 않습니다.' },
        { q: '결과가 실제 메이크업과 얼마나 비슷한가요?', a: '정면 자연광 셀카 기준 약 85~95%의 시각적 일치도를 보입니다. 다만 색감은 모니터·휴대폰 디스플레이 캘리브레이션에 따라 차이가 있을 수 있어, 마음에 드는 룩은 매장에서 한 번 더 발색을 확인한 뒤 구매하는 것을 권장합니다.' },
        { q: '회원가입 없이도 사용할 수 있나요?', a: '메이크업 MBTI · 퍼스널 컬러 · 얼굴형 진단 도구는 모두 비회원으로 즉시 사용 가능합니다. AI 메이크업 시뮬레이션은 결제 후 1회 사용권 또는 구독 형태로 제공됩니다.' },
        { q: '환불은 가능한가요?', a: '결제 직후 분석 미사용 상태라면 7일 이내 환불 가능합니다. 분석을 이미 사용했거나 결과 이미지를 다운로드한 이후에는 디지털 콘텐츠 특성상 환불이 제한됩니다. 자세한 조건은 환불 정책 페이지에서 확인할 수 있습니다.' },
        { q: '추천된 화장품은 어디서 살 수 있나요?', a: '카테고리별 추천(립스틱·아이섀도우·블러쉬 등)을 제공하며, 구체적인 제품은 올리브영·세포라·쿠팡·아마존 등 사용자가 평소 이용하는 채널에서 검색해 비교 구매하면 됩니다. 우리는 구매 채널을 강제하지 않습니다.' },
        { q: '남성도 사용할 수 있나요?', a: '네. 남성 전용 6가지 룩(Skincare Glow Base, No-Makeup Makeup, K-Pop Idol 등)을 별도 큐레이션해 제공합니다. 그루밍 단계의 자연스러운 베이스부터 K-팝 무대 메이크업, 2026 트렌드 헤어 컬러까지 시뮬레이션 가능합니다.' },
      ]
  const [activeTab, setActiveTab] = useState<'women' | 'men'>('women')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [mobileMenuOpen])

  // 2026 트렌드 6종 (메이크업 5 + 헤어 1). 백엔드 _makeupStyles.ts와 동일 세트.
  const womenStyles: StyleData[] = [
    { num: 1, name: t('style.w1'), eng: 'Glass Skin Glow', icon: 'water_drop' },
    { num: 2, name: t('style.w2'), eng: 'Blurred Tint Lip', icon: 'blur_on' },
    { num: 3, name: t('style.w3'), eng: 'Lingerie Makeup', icon: 'spa' },
    { num: 4, name: t('style.w4'), eng: 'Glazed Lavender Lip', icon: 'palette' },
    { num: 5, name: t('style.w5'), eng: 'K-Pop Idol Makeup', icon: 'star' },
    { num: 6, name: t('style.w6'), eng: 'Copper Auburn Hair', icon: 'colorize' },
  ]

  const menStyles: StyleData[] = [
    { num: 1, name: t('style.m1'), eng: 'Skincare Glow Base', icon: 'water_drop' },
    { num: 2, name: t('style.m2'), eng: 'No-Makeup Makeup', icon: 'face' },
    { num: 3, name: t('style.m3'), eng: 'K-Pop Idol Makeup', icon: 'star' },
    { num: 4, name: t('style.m4'), eng: 'Grunge Smoky Eye', icon: 'contrast' },
    { num: 5, name: t('style.m5'), eng: 'Monochrome Makeup', icon: 'palette' },
    { num: 6, name: t('style.m6'), eng: 'Ash Brown Hair', icon: 'colorize' },
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
      <nav className="sticky top-0 z-50 w-full bg-navy border-b border-navy-light/50" role="navigation" aria-label={t('nav.mainMenu')}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand → home. Was a non-interactive <div>, so logo taps registered as
             dead clicks in Clarity (people expect logos to be home links). */}
          <a href={isEn ? '/en/' : '/'} className="flex items-center gap-2 rounded-md -ml-1 px-1 py-1 hover:bg-navy-light/30 transition-colors" aria-label="kissinskin home">
            <img src="/logo-sm.webp" alt="kissinskin" className="h-9 w-9 rounded-full object-cover" width={36} height={36} />
            <span className="text-xl font-bold tracking-tight text-white">kissinskin</span>
          </a>
          {/* Unified site nav — must match ToolsNav in src/components/ToolsLayout.tsx */}
          <div className="hidden md:flex items-center gap-5">
            <a href="#tools-showcase" className="text-sm font-medium text-slate-200 hover:text-primary transition-colors cursor-pointer">{t('common.freeTools')}</a>
            <a href={isEn ? '/en/guides/' : '/guides/'} className="text-sm font-medium text-slate-200 hover:text-primary transition-colors cursor-pointer">{t('nav.guides')}</a>
            <a href={isEn ? '/en/reviews/' : '/reviews/'} className="text-sm font-medium text-slate-200 hover:text-primary transition-colors cursor-pointer">{t('nav.reviews')}</a>
            <a href={isEn ? '/en/news/' : '/news/'} className="text-sm font-medium text-slate-200 hover:text-primary transition-colors cursor-pointer">{t('nav.news')}</a>
            <a href={isEn ? '/en/about/' : '/about/'} className="text-sm font-medium text-slate-200 hover:text-primary transition-colors cursor-pointer">{t('nav.about')}</a>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
              className="hidden md:inline-flex text-sm font-medium text-slate-200 hover:text-primary transition-colors px-2 py-1 rounded-md border border-slate-500"
            >
              {locale === 'ko' ? 'EN' : '한국어'}
            </button>
            {user ? (
              <button
                onClick={() => onNavigate('mypage')}
                className="hidden md:flex text-sm font-medium text-slate-200 hover:text-primary transition-colors px-3 py-1.5 rounded-md border border-slate-500 items-center gap-1.5"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                <span>{t('auth.mypage')}</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="hidden md:inline-flex text-sm font-medium text-slate-200 hover:text-primary transition-colors px-3 py-1.5 rounded-md border border-slate-500"
              >
                {t('auth.login')}
              </button>
            )}
            <button
              className="hidden sm:flex bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/20 items-center gap-1.5"
              onClick={() => onNavigate('analysis')}
            >
              {t('tools.nav.aiMakeup')}
            </button>

            {/* Mobile-only AI button + hamburger */}
            <button
              onClick={() => onNavigate('analysis')}
              className="sm:hidden bg-gradient-to-r from-primary to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5"
            >
              {t('tools.nav.aiMakeup')}
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label={t('nav.openMenu')}
              aria-expanded={mobileMenuOpen}
              className="md:hidden text-white p-2 rounded-md border border-slate-500 hover:bg-navy-light/30"
            >
              <span className="material-symbols-outlined text-2xl leading-none align-middle">menu</span>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-navy/70 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute top-0 right-0 h-full w-[80%] max-w-sm bg-white shadow-2xl flex flex-col">
              <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
                <span className="text-base font-bold text-navy">{t('nav.menu')}</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={t('nav.closeMenu')}
                  className="p-2 rounded-md hover:bg-slate-100 text-navy"
                >
                  <span className="material-symbols-outlined text-2xl leading-none align-middle">close</span>
                </button>
              </div>
              <ul className="flex-1 overflow-y-auto py-2">
                {[
                  { href: isEn ? '/en/' : '/tools/', label: t('common.freeTools') },
                  { href: isEn ? '/en/guides/' : '/guides/', label: t('nav.guides') },
                  { href: isEn ? '/en/reviews/' : '/reviews/', label: t('nav.reviews') },
                  { href: isEn ? '/en/news/' : '/news/', label: t('nav.news') },
                  { href: isEn ? '/en/about/' : '/about/', label: t('nav.about') },
                ].map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-5 py-4 text-base font-semibold text-navy border-b border-slate-100 hover:bg-slate-50"
                    >
                      {l.label}
                      <span className="material-symbols-outlined text-lg text-slate-400">chevron_right</span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="p-4 border-t border-slate-200 space-y-3">
                <button
                  onClick={() => {
                    setLocale(locale === 'ko' ? 'en' : 'ko')
                    setMobileMenuOpen(false)
                  }}
                  className="w-full text-sm font-medium text-slate-700 hover:text-navy py-2.5 rounded-lg border border-slate-300"
                >
                  {locale === 'ko' ? 'English' : '한국어'}
                </button>
                {user ? (
                  <button
                    onClick={() => {
                      onNavigate('mypage')
                      setMobileMenuOpen(false)
                    }}
                    className="w-full text-sm font-medium text-slate-700 hover:text-navy py-2.5 rounded-lg border border-slate-300 inline-flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                    {t('auth.mypage')}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onNavigate('auth')
                      setMobileMenuOpen(false)
                    }}
                    className="w-full text-sm font-medium text-slate-700 hover:text-navy py-2.5 rounded-lg border border-slate-300"
                  >
                    {t('auth.login')}
                  </button>
                )}
                <button
                  onClick={() => {
                    onNavigate('analysis')
                    setMobileMenuOpen(false)
                  }}
                  className="w-full bg-gradient-to-r from-primary to-pink-500 text-white py-3 rounded-full text-sm font-bold inline-flex items-center justify-center gap-1.5"
                >
                  {t('tools.nav.aiMakeup')}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>
      {/* Hero */}
      <section className="relative py-6 md:py-16 lg:py-24 overflow-hidden bg-cream" aria-labelledby="hero-title">
        {/* Soft mesh gradient (Stripe/Vercel pattern, muted K-beauty palette) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(at 22% 18%, rgba(251, 207, 232, 0.7) 0px, transparent 55%),' +
              'radial-gradient(at 78% 28%, rgba(254, 215, 170, 0.55) 0px, transparent 50%),' +
              'radial-gradient(at 55% 85%, rgba(244, 232, 255, 0.55) 0px, transparent 60%),' +
              'radial-gradient(at 12% 90%, rgba(255, 228, 230, 0.5) 0px, transparent 45%)',
          }}
        />
        {/* Grainy noise texture (Linear/Vercel pattern) */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col items-center gap-6 md:gap-10">
            <div className="flex flex-col gap-4 md:gap-6 items-center text-center max-w-2xl">
              {/* Compressed eyebrow — single trust line (was: badge + 3 chips) */}
              <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-pink-200 text-primary text-xs font-bold uppercase tracking-wider w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                {t('home.hero.eyebrow')}
              </div>

              <h1 id="hero-title" className="animate-fade-in-up font-serif text-4xl md:text-5xl lg:text-[3.25rem] font-semibold leading-[1.1] tracking-tight text-navy">
                {t('home.hero.title1')}<br />
                <span className="shimmer-text">{t('home.hero.title2')}</span><br />
                {t('home.hero.title3')}
              </h1>

              <p className="animate-fade-in-up-delay text-base md:text-lg text-slate-600 max-w-lg leading-relaxed">
                {t('home.hero.subtitle')}
                <strong className="text-primary"> {t('home.hero.subtitleBold')}</strong>{t('home.hero.subtitleEnd')}
              </p>

              {/* Single primary CTA — free-first; paid AI demoted to a small secondary link */}
              <div className="animate-fade-in-up-delay2 flex flex-col items-center gap-3 pt-2 w-full">
                <a
                  href="#tools-showcase"
                  className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-10 py-4 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/25 group w-full sm:w-auto"
                >
                  {t('home.hero.startFree')}
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </a>
                <button
                  onClick={() => onNavigate('analysis')}
                  className="text-sm text-slate-500 hover:text-primary font-medium underline underline-offset-4 decoration-slate-300 hover:decoration-primary inline-flex items-center gap-1 transition-colors"
                >
                  {t('home.hero.paidLink')}
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            </div>

          </div>

          {/* Marquee Hero — 9 models with cycling styles */}
          <MarqueeHero onClick={() => onNavigate('analysis')} />

          {/* Safety strip — moved below the hero per redesign (operator/payment trust) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 text-[11px] sm:text-xs text-slate-400">
            {[
              { icon: 'lock', text: t('home.hero.safe1') },
              { icon: 'verified_user', text: t('home.hero.safe2') },
              { icon: 'delete_sweep', text: t('home.hero.safe3') },
            ].map(s => (
              <span key={s.text} className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-slate-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                {s.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Free Tools Showcase — Big, prominent section for all tools (moved directly under hero) */}
      <section id="tools-showcase" className="py-20 md:py-28 scroll-mt-16 relative overflow-hidden bg-cream" aria-labelledby="tools-title">

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Big Heading */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider mb-5">
              <span className="text-base">💄</span>
              {isEn ? 'ALL FREE · No signup' : 'ALL FREE · 로그인 불필요'}
            </div>
            <h2 id="tools-title" className="font-serif text-4xl md:text-[3.25rem] font-semibold tracking-tight text-navy leading-[1.1] mb-4">
              {t('home.toolsShowcase.title1')}<br />
              <span className="bg-gradient-to-r from-primary via-pink-500 to-purple-600 bg-clip-text text-transparent">{t('home.toolsShowcase.title2')}</span>
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {t('home.toolsShowcase.subtitle')}
            </p>
          </div>

          {/* 4 Tool Cards Grid — FREE tools surfaced first (redesign: free before paid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {[
              {
                href: '/tools/makeup-mbti/',
                emoji: '💫',
                title: t('home.toolsShowcase.t1Title'),
                desc: t('home.toolsShowcase.t1Desc'),
                gradient: 'from-violet-500 to-purple-600',
                bgGradient: 'from-violet-50 to-purple-50',
                tag: t('home.toolsShowcase.t1Tag'),
              },
              {
                href: '/tools/personal-color/',
                emoji: '🎨',
                title: t('home.toolsShowcase.t2Title'),
                desc: t('home.toolsShowcase.t2Desc'),
                gradient: 'from-amber-500 to-orange-500',
                bgGradient: 'from-amber-50 to-orange-50',
                tag: t('home.toolsShowcase.t2Tag'),
              },
              {
                href: '/tools/face-shape/',
                emoji: '🌟',
                title: t('home.toolsShowcase.t3Title'),
                desc: t('home.toolsShowcase.t3Desc'),
                gradient: 'from-emerald-500 to-teal-500',
                bgGradient: 'from-emerald-50 to-teal-50',
                tag: t('home.toolsShowcase.t3Tag'),
              },
              {
                href: '/tools/perfume-type/',
                emoji: '🌸',
                title: t('home.toolsShowcase.t4Title'),
                desc: t('home.toolsShowcase.t4Desc'),
                gradient: 'from-rose-500 to-pink-500',
                bgGradient: 'from-rose-50 to-pink-50',
                tag: t('home.toolsShowcase.t4Tag'),
              },
            ].map(tool => (
              <a
                key={tool.title}
                href={tool.href}
                className="group bg-white rounded-3xl p-5 md:p-6 border border-white hover:border-primary/30 shadow-md hover:shadow-xl hover:shadow-pink-100 transition-all hover:-translate-y-1 flex flex-col"
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${tool.bgGradient} border border-white flex items-center justify-center text-3xl md:text-4xl mb-4 shadow-sm`}>
                  {tool.emoji}
                </div>
                <div className={`inline-block self-start text-[0.65rem] uppercase tracking-widest font-bold bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent mb-1`}>
                  {tool.tag}
                </div>
                <h3 className="text-base md:text-lg font-extrabold text-navy mb-2 leading-tight">
                  {tool.title}
                </h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-4 flex-1">
                  {tool.desc}
                </p>
                <div className={`inline-flex items-center gap-1 text-sm font-bold bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent group-hover:gap-2 transition-all`}>
                  {t('home.toolsShowcase.cardCta')}
                  <span className={`material-symbols-outlined bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent`} style={{ WebkitBackgroundClip: 'text', color: 'transparent' }}>arrow_forward</span>
                </div>
              </a>
            ))}
          </div>

          {/* Premium pick: AI Makeup (paid) — moved below the free tools */}
          <div className="mt-6">
            <a
              href="/analysis/"
              className="group block relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-pink-500 to-rose-400 p-6 md:p-10 text-white shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10">
                <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-6xl md:text-7xl shadow-inner">
                  💄
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-widest">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                      {t('home.toolsShowcase.signatureBadge')}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-white text-primary rounded-full text-xs font-extrabold">
                      $2.99 · {isEn ? 'Premium' : '프리미엄'}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold mb-2 leading-tight">
                    {t('home.toolsShowcase.mainTitle')}
                  </h3>
                  <p className="text-white/90 text-sm md:text-base mb-5 max-w-xl">
                    {t('home.toolsShowcase.mainDesc')}
                  </p>
                  <div className="inline-flex items-center gap-2 font-bold text-sm md:text-base bg-white text-primary px-6 py-3 rounded-full shadow-lg group-hover:gap-3 transition-all">
                    {t('home.toolsShowcase.mainCta')}
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </div>
                </div>
              </div>
            </a>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-10 md:mt-12">
            <a
              href="/tools/"
              className="inline-flex items-center gap-2 bg-white hover:bg-pink-50 border border-pink-200 hover:border-primary/40 text-slate-700 hover:text-primary px-8 py-3.5 rounded-full font-bold text-sm md:text-base shadow-sm transition-all"
            >
              <span className="material-symbols-outlined">grid_view</span>
              {t('home.toolsShowcase.seeAllTools')}
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>

      {/* Value Props — moved below the free tools (redesign) */}
      <section className="py-16 bg-white" aria-label={isEn ? 'Key features' : '핵심 기능'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: 'bolt', title: t('home.value.title1'), desc: t('home.value.desc1'), gradient: 'from-amber-400 to-orange-500' },
              { icon: 'palette', title: t('home.value.title2'), desc: t('home.value.desc2'), gradient: 'from-pink-400 to-rose-500' },
              { icon: 'devices', title: t('home.value.title3'), desc: t('home.value.desc3'), gradient: 'from-violet-400 to-purple-500' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center gap-4 p-8 rounded-3xl border border-slate-100 bg-white">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg`}>
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <h2 className="text-lg font-bold text-navy-mid">{item.title}</h2>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Makeup Styles Section */}
      <section id="styles" className="py-20 md:py-28 scroll-mt-16 relative overflow-hidden bg-white" aria-labelledby="styles-title">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 flex flex-col items-center gap-3">
            <span className="inline-flex items-center gap-2 text-primary-dark text-sm font-bold uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              {t('home.styles.badge')}
            </span>
            <h2 id="styles-title" className="font-serif text-3xl md:text-[2.75rem] font-semibold tracking-tight text-navy mt-2 leading-tight">
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
      <section id="how" className="py-20 md:py-28 bg-cream scroll-mt-16" aria-labelledby="how-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 flex flex-col items-center gap-3">
            <span className="text-primary-dark text-sm font-bold uppercase tracking-widest">{t('home.how.badge')}</span>
            <h2 id="how-title" className="font-serif text-3xl md:text-[2.75rem] font-semibold tracking-tight leading-tight">{t('home.how.title')}</h2>
          </div>

          {/* Example Preview: input photo → 9-style result grid */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="text-center mb-8 flex flex-col items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-primary-dark text-xs font-bold uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
                {t('home.how.exampleBadge')}
              </span>
              <h3 className="text-xl md:text-2xl font-extrabold text-navy tracking-tight mt-1">
                {t('home.how.exampleTitle')}
              </h3>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
              {/* Input photo */}
              <figure className="flex flex-col items-center gap-3 w-full md:w-auto">
                <div className="relative rounded-2xl overflow-hidden border-2 border-pink-100 shadow-lg shadow-pink-100/50 bg-white">
                  <img
                    src="/example-input.webp"
                    alt={t('home.how.exampleInputLabel')}
                    width={240}
                    height={320}
                    loading="lazy"
                    decoding="async"
                    className="block w-[200px] h-[267px] md:w-[240px] md:h-[320px] object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[0.65rem] font-bold text-slate-600 border border-pink-100">
                    {t('home.how.exampleInputLabel')}
                  </div>
                </div>
              </figure>

              {/* Arrow */}
              <div className="flex items-center justify-center shrink-0" aria-hidden="true">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shadow-lg shadow-primary/30">
                  <span className="material-symbols-outlined text-white text-2xl rotate-90 md:rotate-0">arrow_forward</span>
                </div>
              </div>

              {/* Result grid */}
              <figure className="flex flex-col items-center gap-3 w-full md:w-auto">
                <div className="relative rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl shadow-primary/10 bg-white">
                  <img
                    src="/example-result.webp"
                    alt={t('home.how.exampleResultLabel')}
                    width={360}
                    height={540}
                    loading="lazy"
                    decoding="async"
                    className="block w-[260px] h-[390px] md:w-[360px] md:h-[540px] object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-primary to-pink-500 px-2.5 py-1 rounded-full text-[0.65rem] font-bold text-white shadow-md">
                    {t('home.how.exampleResultLabel')}
                  </div>
                </div>
              </figure>
            </div>

            {/* Highlight tip */}
            <div className="mt-8 max-w-2xl mx-auto rounded-2xl border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 p-4 sm:p-5 flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md shadow-primary/30">
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              </div>
              <p className="text-sm md:text-base text-navy-mid leading-relaxed font-semibold pt-1">
                {t('home.how.exampleTipHighlight')}
              </p>
            </div>
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
                <h3 className="text-xl font-bold text-navy-mid">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* In-depth Guide — content-rich section for SEO + AdSense quality */}
      <section id="guide" className="py-16 md:py-24 bg-white scroll-mt-16" aria-labelledby="guide-title">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-primary-dark text-xs font-bold uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100 mb-4">
              <span className="material-symbols-outlined text-base">menu_book</span>
              {isEn ? 'kissinskin Guide' : 'kissinskin 가이드'}
            </span>
            <h2 id="guide-title" className="font-serif text-3xl md:text-[2.75rem] font-semibold tracking-tight text-navy mb-3 leading-[1.1]">
              {isEn
                ? <>How to get the most out of<br className="hidden md:block" /> the AI makeup simulator</>
                : <>AI 메이크업 시뮬레이터를<br className="hidden md:block" /> 똑똑하게 활용하는 법</>}
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">
              {isEn
                ? 'The fastest way to try makeup transformations — without wasting time or money on products that don’t suit you.'
                : '실패 없는 메이크업 변신, 시간과 화장품 비용을 아끼는 가장 빠른 방법.'}
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 leading-[1.85] text-[15px] md:text-base space-y-10">
            {isEn ? (
            <>
            <article>
              <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">Why AI makeup simulation helps</h3>
              <p>
                The biggest hesitation before trying a new look is the question <strong className="text-primary">“will this actually suit me?”</strong> — and the time and money you lose if it doesn’t. Swatching every shade in-store is a hassle, and once you’ve bought color cosmetics online, returns are often difficult or impossible. kissinskin lets you simulate 6 signature K-beauty looks from a single selfie, so you can preview the real color payoff and the change in impression before you commit.
              </p>
              <p>
                The AI reads your facial contours, features, and skin tone, then blends the makeup on naturally. Unlike a Photoshop paste-over, it keeps the direction of light, your skin texture, and the curves of your face intact — adding only the lip, eye, blush, and highlighter placement with precision. The result looks close to “you, actually wearing the makeup,” so any look you like is easy to recreate.
              </p>
            </article>

            <article>
              <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">How kissinskin differs from a regular filter</h3>
              <p>
                TikTok and Instagram makeup filters are layered uniformly over the screen, so the same color lands on everyone regardless of face shape or skin tone. kissinskin is different: an AI trained on K-beauty makeup artists’ know-how <strong> analyzes your skin tone, face shape, and feature proportions and decides how to adapt each style for you</strong>. The same “Bold Lip” becomes a blue-toned red on a cool-toned user and a coral-based red on a warm-toned one, so it brings your features to life.
              </p>
              <p>
                kissinskin also goes beyond a filter: it adds analysis notes on why a look suits you, a step-by-step makeup guide, and recommended product categories (lipstick, eyeshadow palettes, blush, and more). The biggest difference is that the result is something you can actually recreate at your own vanity.
              </p>
            </article>

            <article>
              <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">The 6 signature K-beauty looks, at a glance</h3>
              <p>
                kissinskin curates 6 looks that define current Korean beauty trends.
                <strong> Glass Skin Glow</strong> is the essence of Korean luminous skin — a dewy, glass-clear glow.
                <strong> Blurred Tint Lip</strong> is a center-deep gradient tint, and
                <strong> Lingerie Makeup</strong> is a soft, sensual neutral mood that melts into the skin.
                For a more current edge, try <strong>Glazed Lavender Lip</strong> — the 2026 new-nude trend — or
                <strong> K-Pop Idol Makeup</strong> for a bright, on-stage idol look.
                The sixth, <strong>Copper Auburn Hair</strong>, changes only your hair color to a 2026 trend shade while your face stays exactly the same.
              </p>
              <p>
                For men, we curate a separate set: Skincare Glow Base, No-Makeup Makeup, K-Pop Idol Makeup,
                Grunge Smoky Eye, Monochrome Makeup, and Ash Brown Hair.
                The question “men wear makeup?” was settled long ago by K-pop and the global K-beauty movement.
                The six span a barely-there base to full stage makeup and a trend hair color — each generated separately so your face stays unmistakably yours.
              </p>
            </article>

            <article>
              <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">Putting Makeup MBTI, Personal Color &amp; Face Shape to work</h3>
              <p>
                To read your AI simulation more accurately, it helps to know your own makeup tendencies.
                <strong> Makeup MBTI</strong> is an 8-question quiz that identifies 16 makeup personalities and the signature colors, textures, and iconic looks that suit each.
                <strong> Personal Color</strong> analysis sorts you into one of four seasons — spring warm, summer cool, autumn warm, winter cool — so you can find your most flattering colors in advance.
                <strong> Face Shape</strong> analysis covers oval, round, square, oblong, and heart, bundling contouring, hair, and eyewear tips for each.
              </p>
              <p>
                Once you’ve done all three, you end up with concrete guidelines like “my Makeup MBTI is ENFP-Natural, I’m a spring warm with a round face, so coral lips, pink blush, and a not-too-long eyeliner work best.” Bring those results back to the AI simulation and it becomes even clearer why a given look suits you.
              </p>
            </article>

            <article>
              <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">Privacy and AI accuracy</h3>
              <p>
                Your uploaded selfie is used for the AI analysis and then processed and deleted without delay; it is never reused as training data. Result images are not exposed externally unless you explicitly save or share them. kissinskin processes data only within the scope you’ve consented to — see our <a href="/en/privacy/" className="text-primary font-semibold hover:underline">Privacy Policy</a> for details.
              </p>
              <p>
                AI makeup synthesis is highly accurate, but not perfect. Photos where the face is turned too far to the side, the lighting is heavily skewed, or a mask or glasses cover a lot can look awkward in some looks. A front-facing selfie in natural light gives the most natural result, and if you don’t like the outcome, try again with a different photo. Confirming the actual shade in-store one more time right before you apply your makeup greatly reduces the chance of a miss.
              </p>
            </article>
            </>
            ) : (
            <>
            <article>
              <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">AI 메이크업 시뮬레이션이 필요한 이유</h3>
              <p>
                새로운 메이크업 룩에 도전할 때 가장 큰 부담은 <strong className="text-primary">"내 얼굴에 어울릴까?"</strong>라는 의문과
                실패할 경우 발생하는 시간·비용 손실입니다. 매장에서 일일이 발색하기에는 매장 동선이 부담스럽고,
                온라인 색조 화장품을 구매한 뒤에는 환불이 까다롭거나 사실상 불가능한 경우도 많습니다.
                kissinskin은 셀카 한 장으로 6가지 K-뷰티 시그니처 룩을 즉시 시뮬레이션해
                실제 발색과 인상 변화를 미리 확인할 수 있게 해 줍니다.
              </p>
              <p>
                AI 모델은 사용자의 얼굴 윤곽·이목구비·피부 톤을 인식해 메이크업을 자연스럽게 합성합니다.
                포토샵 합성과 다른 점은 빛의 방향, 피부 결, 얼굴 굴곡을 그대로 유지하면서
                립·아이·블러쉬·하이라이터의 위치만 정밀하게 더한다는 것입니다.
                덕분에 결과 이미지는 "내가 실제로 화장한 모습"에 가깝고, 마음에 든 룩은 곧바로 따라할 수 있습니다.
              </p>
            </article>

            <article>
              <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">kissinskin이 일반 필터와 다른 점</h3>
              <p>
                틱톡·인스타그램의 메이크업 필터는 화면 위에 일률적으로 입혀지기 때문에 얼굴형이나 피부톤과 무관하게
                같은 색이 적용됩니다. 반면 kissinskin은 K-뷰티 메이크업 아티스트의 노하우를 학습한 AI가
                <strong> 사용자의 피부 톤·얼굴형·이목구비 비율을 분석해 각 스타일을 어떻게 변형할지 자동으로 결정</strong>합니다.
                예를 들어 같은 "Bold Lip" 스타일이라도 쿨톤 사용자에게는 푸른빛이 도는 레드를,
                웜톤 사용자에게는 코랄 베이스의 레드를 적용해 인상이 더 살아나도록 합니다.
              </p>
              <p>
                또한 kissinskin은 단순 필터에 그치지 않고 "왜 이 룩이 어울리는지"에 대한 분석 코멘트와
                메이크업 단계별 가이드, 추천 제품 카테고리(립스틱·아이섀도우 팔레트·블러쉬 등)까지 제공합니다.
                실제 화장대 앞에서 따라 할 수 있도록 한 결과물이라는 점이 가장 큰 차별점입니다.
              </p>
            </article>

            <article>
              <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">6가지 K-뷰티 시그니처 룩, 한눈에</h3>
              <p>
                kissinskin은 최신 한국 메이크업 트렌드를 대표하는 6가지 룩을 큐레이션했습니다.
                <strong> Glass Skin Glow</strong>는 유리알처럼 맑고 촉촉한 한국 광채 피부의 정수이고,
                <strong> Blurred Tint Lip</strong>은 중앙이 진하게 번지는 그라데이션 틴트,
                <strong> Lingerie Makeup</strong>은 피부에 녹아드는 은은하고 관능적인 뉴트럴 무드입니다.
                더 트렌디한 인상을 원한다면 2026 신상 누드 트렌드 <strong>Glazed Lavender Lip</strong>을,
                화사한 무대 룩을 원한다면 <strong>K-Pop Idol Makeup</strong>을 시도해 보세요.
                여섯 번째 <strong>Copper Auburn Hair</strong>는 얼굴은 그대로 둔 채 머리색만 2026 유행 컬러로 바꿔 줍니다.
              </p>
              <p>
                남성 사용자를 위해서는 Skincare Glow Base, No-Makeup Makeup, K-Pop Idol Makeup,
                Grunge Smoky Eye, Monochrome Makeup, Ash Brown Hair를 별도 큐레이션합니다.
                "남자도 메이크업을 한다고?"라는 의문은 이미 K-팝과 글로벌 K-뷰티 트렌드가 깬 지 오래입니다.
                자연스러운 베이스부터 무대 메이크업, 트렌드 헤어 컬러까지 6가지를 각각 따로 생성해 얼굴 동일성을 보존합니다.
              </p>
            </article>

            <article>
              <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">메이크업 MBTI · 퍼스널 컬러 · 얼굴형 진단의 활용</h3>
              <p>
                AI 시뮬레이션 결과를 더 정확하게 해석하려면 자신의 메이크업 성향을 알아야 합니다.
                <strong> 메이크업 MBTI</strong>는 8문항 퀴즈로 16가지 메이크업 성향을 진단하고,
                각 유형에 어울리는 시그니처 컬러·텍스처·아이코닉 룩을 알려 줍니다.
                <strong> 퍼스널 컬러 진단</strong>은 봄웜·여름쿨·가을웜·겨울쿨 4계절을 판별해
                평소 잘 어울리는 색을 미리 찾을 수 있게 해 줍니다.
                <strong> 얼굴형 진단</strong>은 oval·round·square·oblong·heart 5가지 형태별로
                컨투어링·헤어·안경 추천까지 묶어 줍니다.
              </p>
              <p>
                3가지 진단을 모두 마치면 "내 메이크업 MBTI는 ENFP-자연계, 봄웜, 둥근 얼굴형이라
                립은 코랄·블러쉬는 핑크·아이라이너는 너무 길게 빼지 않는 쪽이 좋다"라는 식으로
                구체적인 메이크업 가이드라인이 만들어집니다. 이 결과를 들고 AI 시뮬레이션으로 돌아오면
                "왜 이 룩이 나에게 어울리는지" 한층 더 명확해집니다.
              </p>
            </article>

            <article>
              <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">개인정보 보호와 AI의 정확도</h3>
              <p>
                업로드된 셀카는 AI 분석에 사용된 후 지체 없이 처리·삭제되며, 학습 데이터로 재사용되지 않습니다.
                결과 이미지는 본인이 명시적으로 저장·공유하지 않는 한 외부에 노출되지 않습니다.
                kissinskin은 사용자가 동의한 범위 내에서만 데이터를 처리하며,
                자세한 내용은 <a href="/privacy/" className="text-primary font-semibold hover:underline">개인정보처리방침</a> 페이지에서 확인할 수 있습니다.
              </p>
              <p>
                AI 메이크업 합성은 매우 정확하지만 완벽하지는 않습니다.
                얼굴이 측면으로 너무 기울거나, 조명이 한쪽에 강하게 치우치거나,
                마스크·안경 등 가림이 큰 사진은 일부 룩에서 결과가 어색할 수 있습니다.
                정면을 향한 자연광 셀카가 가장 자연스러운 결과를 만들며,
                결과가 마음에 들지 않으면 다른 사진으로 다시 시도하는 것을 권장합니다.
                실제 메이크업 직전, 한 번 더 색조 발색만 매장에서 확인하면 실패 확률을 크게 줄일 수 있습니다.
              </p>
            </article>
            </>
            )}
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h3 className="text-xl md:text-2xl font-extrabold text-navy text-center mb-8 tracking-tight">{isEn ? 'Frequently asked questions' : '자주 묻는 질문'}</h3>
            <div className="space-y-3">
              {homeFaq.map((item, i) => (
                <details
                  key={i}
                  className="group bg-white rounded-2xl border border-pink-100 hover:border-primary/30 transition-colors"
                >
                  <summary className="cursor-pointer list-none p-5 flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary shrink-0 mt-0.5 group-open:rotate-180 transition-transform">expand_more</span>
                    <span className="font-bold text-navy-mid text-sm md:text-base flex-1">{item.q}</span>
                  </summary>
                  <div className="px-5 pb-5 pl-14 text-slate-600 text-sm md:text-[15px] leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* JSON-LD FAQPage */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: homeFaq.map((x) => ({
                  '@type': 'Question',
                  name: x.q,
                  acceptedAnswer: { '@type': 'Answer', text: x.a },
                })),
              }),
            }}
          />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28 bg-cream scroll-mt-16" aria-labelledby="pricing-title">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 flex flex-col items-center gap-3">
            <span className="text-primary-dark text-sm font-bold uppercase tracking-widest">{t('pricing.badge')}</span>
            <h2 id="pricing-title" className="font-serif text-3xl md:text-[2.75rem] font-semibold tracking-tight leading-tight">{t('pricing.title')}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Per-analysis */}
            <div className="relative rounded-2xl border border-slate-200 bg-white p-8 flex flex-col gap-5">
              <h3 className="text-lg font-bold text-navy">{t('pricing.perAnalysis')}</h3>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-extrabold text-navy">{t('pricing.perAnalysisPrice')}</span>
                <span className="text-slate-500 text-sm mb-1">{t('pricing.perAnalysisUnit')}</span>
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
                className="mt-auto w-full py-3.5 rounded-xl border-2 border-primary-dark text-primary-dark font-bold text-sm hover:bg-pink-50 transition-colors"
                onClick={() => onNavigate('analysis')}
              >
                {t('pricing.startBtn')}
              </button>
            </div>
            {/* Subscription */}
            <div className="relative rounded-2xl border-2 border-primary bg-white p-8 flex flex-col gap-5 shadow-lg shadow-primary/10">
              <span className="absolute -top-3 right-6 bg-primary-dark text-white text-xs font-bold px-3 py-1 rounded-full">{t('pricing.popular')}</span>
              <h3 className="text-lg font-bold text-navy">{t('pricing.subscription')}</h3>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-extrabold text-primary">{t('pricing.subscriptionPrice')}</span>
                <span className="text-slate-500 text-sm mb-1">{t('pricing.subscriptionUnit')}</span>
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
          <p className="text-center text-xs text-slate-500 mt-6">{t('pricing.trialNote')}</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-200/20 rounded-full blur-2xl"></div>

        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <span className="material-symbols-outlined text-primary text-5xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <h2 className="font-serif text-3xl md:text-[2.75rem] font-semibold tracking-tight mb-4 text-navy leading-tight">
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

      {/* About this site — operator transparency block for E-E-A-T */}
      <section id="about-this-site" className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">
            About this site
          </div>
          <h2 className="font-serif text-3xl md:text-[2.5rem] font-semibold text-navy tracking-tight mb-4 leading-snug">
            {isEn ? 'Who builds this, and how it’s run' : '누가 만들고, 어떻게 운영되는가'}
          </h2>
          <p className="text-slate-600 text-base leading-relaxed mb-4">
            {isEn ? (
              <>kissinskin is an indie site built and run single-handedly by <strong>Yonghun Kim</strong>, based in South Korea — he writes the code, content, and design himself. Every guide, blog post, news piece, and review is planned and written in-house, and whenever we cite industry data we name the public sources (BeautyMatter, Mintel, NIQ, NPD Group, and others) directly in the text.</>
            ) : (
              <>kissinskin은 대한민국에 거주하는 1인 운영자 <strong>김용헌(Yonghun Kim)</strong>이
              직접 코드·콘텐츠·디자인을 만들고 운영하는 인디 사이트입니다.
              모든 가이드·블로그·뉴스·리뷰는 직접 기획·작성하며, 산업 데이터를
              인용할 때는 BeautyMatter, Mintel, NIQ, NPD Group 등 공개 보고서를
              본문에 명시합니다.</>
            )}
          </p>
          <p className="text-slate-600 text-base leading-relaxed mb-4">
            {isEn ? (
              <>AI is used only for the tool features (image simulation and diagnostics); the body text is written by a human. Uploaded photos are discarded right after analysis, and payments are handled by Polar (Merchant of Record), so your card details are never stored on this site. The site is funded by user payments, Google AdSense revenue, and Coupang Partners affiliate commissions — there is no outside investment. Affiliate commissions don’t affect product prices and have no bearing on which products we recommend.</>
            ) : (
              <>AI는 도구 기능(이미지 시뮬레이션·진단)에만 사용되며, 본문 텍스트는
              사람이 직접 씁니다. 업로드한 사진은 분석 직후 폐기되고, 결제는
              Polar(Merchant of Record)가 처리하므로 카드 정보가 본 사이트에
              저장되지 않습니다. 사이트 운영비는 사용자 결제·Google AdSense 광고
              수익·쿠팡 파트너스 어필리에이트 수수료로 충당하며, 외부 투자는 없습니다.
              어필리에이트 수수료는 제품 가격에 영향을 주지 않고 추천 선정에도 영향이 없습니다.</>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm pt-3">
            <a href={isEn ? '/en/about/' : '/about/'} className="text-navy font-semibold underline hover:text-primary">
              {isEn ? 'Operator & editorial principles →' : '운영자·편집 원칙 자세히 보기 →'}
            </a>
            <a href={isEn ? '/en/privacy/' : '/privacy/'} className="text-slate-600 hover:text-navy underline">
              {isEn ? 'Privacy & Cookie Policy' : '개인정보·쿠키 정책'}
            </a>
            <a href={isEn ? '/en/contact/' : '/contact/'} className="text-slate-600 hover:text-navy underline">
              {isEn ? 'Contact' : '문의 채널'}
            </a>
          </div>

          {/* Editorial standards — compact (full details on /about) */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-slate-500">
            <span className="font-semibold uppercase tracking-[0.18em] text-slate-400">{isEn ? 'Editorial standards' : '편집 기준'}</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-rose-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              {isEn ? 'Original content' : '고유 콘텐츠'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sky-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
              {isEn ? 'Verified sources' : '검증된 출처'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
              {isEn ? 'Expert guidance' : '전문가 권고'}
            </span>
          </div>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="bg-navy text-white pt-14 pb-8" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <img src="/logo-sm.webp" alt="kissinskin" className="h-10 w-10 rounded-full object-cover" />
                <span className="text-2xl font-bold tracking-tight">kissinskin</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
                {t('home.footer.desc')}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-100">{t('home.footer.service')}</h3>
              <ul className="flex flex-col gap-2 text-slate-300 text-sm">
                <li><a href="#styles" className="hover:text-primary transition-colors cursor-pointer">{t('home.footer.styles')}</a></li>
                <li><a href="#how" className="hover:text-primary transition-colors cursor-pointer">{t('home.footer.howTo')}</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors cursor-pointer">{t('pricing.badge')}</a></li>
                <li><a href={isEn ? '/en/' : '/tools/'} className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'Free Tools' : '무료 도구 모음'}</a></li>
                <li><a href={isEn ? '/en/tools/makeup-mbti/' : '/tools/makeup-mbti/'} className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'Makeup MBTI' : '메이크업 MBTI'}</a></li>
                <li><a href={isEn ? '/en/tools/personal-color/' : '/tools/personal-color/'} className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'Personal Color' : '퍼스널 컬러 진단'}</a></li>
                <li><a href={isEn ? '/en/tools/face-shape/' : '/tools/face-shape/'} className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'Face Shape' : '얼굴형 진단'}</a></li>
                <li><a href="/tools/perfume-type/" className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'Perfume Type' : '향수 진단'}</a></li>
                <li><a href={isEn ? '/en/guides/' : '/guides/'} className="hover:text-primary transition-colors cursor-pointer">{t('nav.guides')}</a></li>
                <li><a href={isEn ? '/en/reviews/' : '/reviews/'} className="hover:text-primary transition-colors cursor-pointer">{t('nav.reviews')}</a></li>
                <li><a href={isEn ? '/en/news/' : '/news/'} className="hover:text-primary transition-colors cursor-pointer">{t('nav.news')}</a></li>
                <li><a href={isEn ? '/en/about-makeup-ai/' : '/about-makeup-ai/'} className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'K-Beauty Guide' : 'K-뷰티 가이드'}</a></li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-100">{t('home.footer.legal')}</h3>
              <ul className="flex flex-col gap-2 text-slate-300 text-sm">
                <li><a href={isEn ? '/en/about/' : '/about/'} className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'About · Operator' : 'About · 운영자 소개'}</a></li>
                <li><a href={isEn ? '/en/terms/' : '/terms/'} className="hover:text-primary transition-colors cursor-pointer">Terms of Service</a></li>
                <li><a href={isEn ? '/en/refund/' : '/refund/'} className="hover:text-primary transition-colors cursor-pointer">Refund Policy</a></li>
                <li><a href={isEn ? '/en/privacy/' : '/privacy/'} className="hover:text-primary transition-colors cursor-pointer">Privacy Policy · Cookies</a></li>
                <li><a href={isEn ? '/en/contact/' : '/contact/'} className="hover:text-primary transition-colors cursor-pointer">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-navy-mid flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
            <p>&copy; 2026 kissinskin · Operated by <a href={isEn ? '/en/about/' : '/about/'} className="hover:text-primary">Yonghun Kim</a> · {isEn ? 'Solo indie project in South Korea' : '대한민국 1인 인디 프로젝트'}</p>
            <p>Contact: <a href="mailto:support@kissinskin.net" className="hover:text-primary">support@kissinskin.net</a> · <time dateTime="2026-05-02">{isEn ? 'As of May 2026' : '2026년 5월 기준'}</time></p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
