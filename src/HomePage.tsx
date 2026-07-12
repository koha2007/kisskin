import { useState, useEffect, useRef } from 'react'
import { useI18n } from './i18n/I18nContext'
import { useAuth } from './hooks/useAuth'
import ToolCard from './components/ToolCard'
import HomeContentSections from './components/HomeContentSections'
import MobileBottomNav from './components/home/MobileBottomNav'
import BeforeAfterSlider from './components/makeup/BeforeAfterSlider'
import { MAKEUP_STYLES, type MakeupStyleId } from './lib/makeup/styles'
import { LOOK_IMAGES } from './lib/makeup/lookImages'
import { savePendingSelfie } from './lib/makeup/pendingSelfie'

const PAGE_PATHS: Record<string, string> = {
  home: '/', analysis: '/analysis/', terms: '/terms/', privacy: '/privacy/',
  refund: '/refund/', contact: '/contact/', auth: '/auth/', mypage: '/mypage/',
}

interface HomePageProps {
  onNavigate?: (page: string) => void
  user?: { email?: string } | null
  onLogout?: () => void
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

  // ── 히어로 업로드 → /analysis/ 로 사진째 넘김(업로드 단계 중복 제거) ──
  const heroFileRef = useRef<HTMLInputElement>(null)
  const onHeroFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''            // 같은 파일 재선택도 발화하도록
    if (!f) return
    // 저장에 실패해도(HEIC 디코드 불가 등) 그냥 이동한다 — 그쪽 업로드 화면이 처리한다.
    await savePendingSelfie(f)
    window.location.href = '/analysis/'
  }

  // ── 비포/애프터 섹션 ── 기본은 기존 대표 컷(룩 라벨 없음). 룩 칩/카드를 누르면 그 룩으로 교체.
  const [baLook, setBaLook] = useState<MakeupStyleId | null>(null)
  const showLook = (id: MakeupStyleId) => {
    setBaLook(id)
    document.getElementById('ba-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  const baStyle = baLook ? MAKEUP_STYLES.find((s) => s.id === baLook) : null
  const baBefore = baLook ? LOOK_IMAGES[baLook].before : '/home-ba-before.webp'
  const baAfter = baLook ? LOOK_IMAGES[baLook].after : '/home-ba-after.webp'
  // Bottom-of-home guide FAQ — shared by the accordion and the FAQPage JSON-LD so
  // structured data always matches the visible text in the active language.
  const homeFaq = isEn
    ? [
        { q: 'What happens to my selfie after I upload it?', a: 'Your uploaded photo is used only for the AI makeup synthesis, then processed and deleted. It is never reused as training data, and unless you tap save or share yourself, the result image is never made public.' },
        { q: 'How close is the result to real makeup?', a: 'For a front-facing selfie in natural light, the visual match is roughly 85–95%. Color can vary with your monitor or phone display calibration, so for a look you love we recommend confirming the shade in-store once before buying.' },
        { q: 'Can I use it for free?', a: 'Yes — you get 1 free AI makeup generation with no sign-up. The Makeup MBTI, Personal Color, Face Shape, and Perfume tools are all free and unlimited. If you need more makeup generations, credits start at $2.99.' },
        { q: 'Where can I buy the recommended cosmetics?', a: 'We give recommendations by category (lipstick, eyeshadow, blush, and so on). For specific products, search and compare on the channels you already use — Olive Young, Sephora, Coupang, Amazon, and others. We never lock you into a single store.' },
        { q: 'Can men use it too?', a: 'Yes. Men get a grooming-focused set — a natural healthy base, clean skin tone-up, and tinted-balm looks — with no lipstick or eye makeup forced on.' },
        { q: 'Is the result really me, not a different face?', a: 'Yes. The makeup is applied as a precise overlay that locks your facial structure, features, and expression. We add only lip, cheek, and skin retouching inside a tight mask — your identity stays exactly the same.' },
      ]
    : [
        { q: '셀카 업로드 후 사진은 어떻게 처리되나요?', a: '업로드된 사진은 AI 메이크업 합성에 한해 일시 사용된 뒤 처리·삭제됩니다. 학습 데이터로 재사용되지 않으며, 본인이 직접 저장·공유 버튼을 누르지 않으면 결과 이미지도 외부에 공개되지 않습니다.' },
        { q: '결과가 실제 메이크업과 얼마나 비슷한가요?', a: '정면 자연광 셀카 기준 약 85~95%의 시각적 일치도를 보입니다. 다만 색감은 모니터·휴대폰 디스플레이 캘리브레이션에 따라 차이가 있을 수 있어, 마음에 드는 룩은 매장에서 한 번 더 발색을 확인한 뒤 구매하는 것을 권장합니다.' },
        { q: '무료로 사용할 수 있나요?', a: '네. 가입 없이 AI 메이크업을 무료 1회 생성할 수 있어요. 메이크업 MBTI · 퍼스널 컬러 · 얼굴형 · 향수 진단 도구는 모두 무료·무제한입니다. 메이크업을 더 만들고 싶다면 크레딧을 $2.99부터 충전할 수 있습니다.' },
        { q: '추천된 화장품은 어디서 살 수 있나요?', a: '카테고리별 추천(립스틱·아이섀도우·블러쉬 등)을 제공하며, 구체적인 제품은 올리브영·세포라·쿠팡·아마존 등 사용자가 평소 이용하는 채널에서 검색해 비교 구매하면 됩니다. 우리는 구매 채널을 강제하지 않습니다.' },
        { q: '남성도 사용할 수 있나요?', a: '네. 남성은 그루밍 중심으로 자연스러운 혈색 베이스·깨끗한 피부 톤업·틴티드 밤 룩을 제공하며, 립스틱이나 아이 메이크업을 억지로 입히지 않습니다.' },
        { q: '결과가 정말 제 얼굴인가요, 다른 얼굴이 되진 않나요?', a: '네. 메이크업은 얼굴 구조·이목구비·표정을 고정한 채 정밀한 오버레이로만 입혀집니다. 좁은 마스크 안쪽의 립·볼·피부 보정만 더하므로 정체성은 그대로 유지됩니다.' },
      ]

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

  return (
    <div className="font-display bg-background-light text-navy antialiased overflow-x-hidden pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fade-in-up-delay { animation: fadeInUp 0.8s ease-out 0.2s forwards; opacity: 0; }
        .animate-fade-in-up-delay2 { animation: fadeInUp 0.8s ease-out 0.4s forwards; opacity: 0; }
        .shimmer-text {
          background: linear-gradient(90deg, #eb4763, #f472b6, #eb4763);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* ── 상단바 (로고 + 메뉴 + AI CTA + 햄버거) ── */}
      <nav className="sticky top-0 z-50 w-full bg-navy border-b border-navy-light/50" role="navigation" aria-label={t('nav.mainMenu')}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href={isEn ? '/en/' : '/'} className="flex items-center gap-2 rounded-md -ml-1 px-1 py-1 hover:bg-navy-light/30 transition-colors" aria-label="kissinskin home">
            <img src="/logo-sm.webp" alt="kissinskin" className="h-9 w-9 rounded-full object-cover" width={36} height={36} />
            <span className="text-xl font-bold tracking-tight text-white">kissinskin</span>
          </a>
          {/* Unified site nav — must match ToolsNav in src/components/ToolsLayout.tsx */}
          <div className="hidden md:flex items-center gap-5">
            <a href="#tools-showcase" className="text-sm font-medium text-slate-200 hover:text-primary transition-colors cursor-pointer">{t('common.freeTools')}</a>
            <a href={isEn ? '/en/news/' : '/news/'} className="text-sm font-medium text-slate-200 hover:text-primary transition-colors cursor-pointer">{t('nav.news')}</a>
            <a href={isEn ? '/en/products/' : '/products/'} className="text-sm font-medium text-slate-200 hover:text-primary transition-colors cursor-pointer">{isEn ? 'Makeup Products' : '메이크업 제품'}</a>
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
            {/* 크레딧 충전 진입 — 로그인 버튼 옆 (충전 화면 직행) */}
            <a
              href="/analysis/?topup=1"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-slate-200 hover:text-primary transition-colors px-3 py-1.5 rounded-md border border-slate-500"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>toll</span>
              {isEn ? 'Credits' : '충전하기'}
            </a>
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
                  { href: isEn ? '/en/news/' : '/news/', label: t('nav.news') },
                  { href: isEn ? '/en/products/' : '/products/', label: isEn ? 'Makeup Products' : '메이크업 제품' },
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
      {/* ── 히어로 ── */}
      <section className="relative py-10 md:py-20 overflow-hidden bg-cream" aria-labelledby="hero-title">
        {/* Soft mesh gradient (muted K-beauty palette) */}
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

        {/* 좌: 카피 / 우: 업로드 박스. 홈에서 바로 사진을 고르면 /analysis/ 가 업로드
            단계를 건너뛰고 이어받는다(경쟁사 패턴 — 진입 마찰 1단계 제거). */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative grid md:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-5">
            <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 text-primary text-xs font-bold uppercase tracking-wider w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t('home.hero.badge')}
            </div>

            <h1 id="hero-title" className="animate-fade-in-up font-serif text-4xl md:text-5xl lg:text-[3.25rem] font-semibold leading-[1.12] tracking-tight text-navy">
              {t('home.hero.title1')}<br />
              <span className="shimmer-text">{t('home.hero.title2')}</span> {t('home.hero.title3')}
            </h1>

            <p className="animate-fade-in-up-delay text-base md:text-lg text-slate-600 max-w-md leading-relaxed">
              {t('home.hero.subtitle')}
            </p>

            {/* 신뢰 띠 — 배지 그리드보다 가볍게, 카피 바로 아래에서 안심시킨다 */}
            <div className="animate-fade-in-up-delay2 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">
              {[t('home.hero.trust1'), t('home.hero.trust2'), t('home.hero.trust3')].map((txt) => (
                <span key={txt} className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {txt}
                </span>
              ))}
            </div>
          </div>

          {/* 업로드 박스 */}
          <div className="animate-fade-in-up-delay2 bg-white/90 backdrop-blur border-2 border-dashed border-pink-200 rounded-3xl p-6 md:p-7 text-center shadow-xl shadow-navy/5">
            <div className="w-14 h-14 rounded-full bg-blush flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
            </div>
            <p className="text-base font-bold text-navy">{isEn ? 'Drop your selfie here' : '여기에 셀카를 올려주세요'}</p>
            <p className="mt-1 text-xs text-slate-500">
              {isEn ? 'Click to choose · JPG / PNG / HEIC' : '눌러서 선택 · JPG / PNG / HEIC'}
            </p>

            <input
              ref={heroFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onHeroFile}
            />
            <button
              onClick={() => heroFileRef.current?.click()}
              className="mt-4 w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white py-4 rounded-full text-base font-bold transition-all shadow-lg shadow-primary/25"
            >
              {t('home.hero.uploadCta')}
            </button>
            <p className="mt-2 text-xs font-medium text-slate-500">{t('home.hero.priceSub')}</p>

            {/* 사진이 없는 방문자용 — 예시 룩을 눌러 결과부터 보게 한다 */}
            <div className="mt-5 text-left">
              <p className="text-[11px] text-slate-400 mb-2">
                {isEn ? 'No photo? See an example first' : '사진이 없다면, 예시로 먼저 볼까요?'}
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {MAKEUP_STYLES.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => showLook(s.id)}
                    aria-label={isEn ? `See ${s.subEn} example` : `${s.nameKo} 예시 보기`}
                    className="rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                  >
                    <img
                      src={LOOK_IMAGES[s.id].after}
                      alt=""
                      loading="lazy"
                      className="w-full aspect-[3/4] object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <a
              href="/analysis/?topup=1"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark underline underline-offset-2 decoration-primary/40"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>toll</span>
              {isEn ? 'Out of free tries? Buy credits' : '무료 다 썼다면 크레딧 충전하기'}
            </a>
          </div>
        </div>
      </section>

      {/* ── Before / After ── */}
      <section className="py-16 md:py-20 bg-white" aria-labelledby="ba-title">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="ba-title" className="font-serif text-3xl md:text-[2.5rem] font-semibold tracking-tight text-navy leading-tight mb-2">
            {t('home.ba.title')}
          </h2>
          <p className="text-slate-500 text-sm md:text-base mb-8">{t('home.ba.subtitle')}</p>

          {/* 룩 칩 — 누르면 그 룩의 비포/애프터로 교체. 기본(선택 없음)은 대표 컷. */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {MAKEUP_STYLES.map((s) => {
              const on = baLook === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setBaLook(on ? null : s.id)}
                  aria-pressed={on}
                  className={`rounded-full px-4 py-2 text-[13px] font-bold border transition-colors ${
                    on
                      ? 'bg-navy text-white border-navy'
                      : 'bg-white text-navy border-slate-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {isEn ? s.subEn : s.nameKo}
                </button>
              )
            })}
          </div>

          {/* 우리 파이프라인으로 직접 생성한 실제 결과. 결과 화면의 드래그 슬라이더 재사용 */}
          <div className="max-w-[300px] sm:max-w-[340px] mx-auto">
            <BeforeAfterSlider
              key={baLook ?? 'hero'}
              beforeSrc={baBefore}
              afterSrc={baAfter}
              isEn={isEn}
            />
            {baStyle && (
              <p className="mt-3 text-sm font-bold text-navy">
                {isEn ? baStyle.subEn : baStyle.nameKo}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-400">
              {isEn ? 'Drag the handle to compare' : '가운데 손잡이를 좌우로 드래그해 비교해보세요'}
            </p>
            {baLook && (
              <a
                href={`/analysis/?style=${baLook}`}
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-primary/25 hover:bg-primary-dark transition-colors"
              >
                {isEn ? 'Try this look on my photo' : '이 룩으로 내 사진 만들기'}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── 스타일 슬라이더 (트렌디한 K-뷰티 스타일) ── */}
      <section id="styles" className="py-16 md:py-20 bg-cream scroll-mt-16" aria-labelledby="slider-title">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-2">
          <span className="inline-flex items-center gap-2 text-primary-dark text-xs font-bold uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100 mb-3">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            {t('home.styles.badge')}
          </span>
          <h2 id="slider-title" className="font-serif text-3xl md:text-[2.5rem] font-semibold tracking-tight text-navy leading-tight">
            {t('home.slider.title')}
          </h2>
          <p className="text-slate-500 text-sm md:text-base mt-2">{t('home.slider.subtitle')}</p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-pink-50 border border-pink-100 px-4 py-1.5 text-primary-dark text-xs md:text-sm font-semibold">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>touch_app</span>
            {t('home.slider.selectHint')}
          </p>
        </div>
        {/* 9룩 카드 — 각 룩의 실제 결과 이미지. 카드를 누르면 그 룩으로 바로 생성.
            (2026-07-12: 가로 무한 마퀴 → 3×3 그리드. 룩 9개가 한눈에 안 들어와
             스크롤 없이는 고를 수 없었다. 이미지도 신규 결과물로 교체.) */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {MAKEUP_STYLES.map((s) => (
              <a
                key={s.id}
                href={`/analysis/?style=${s.id}`}
                aria-label={isEn ? `Try AI makeup — ${s.subEn}` : `AI 메이크업 — ${s.nameKo}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-lg shadow-navy/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <img
                  src={LOOK_IMAGES[s.id].after}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 to-transparent" />
                <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  TRY →
                </span>
                <span className="absolute inset-x-3.5 bottom-3 text-left text-white">
                  <span className="block text-[15px] font-extrabold leading-tight">{isEn ? s.subEn : s.nameKo}</span>
                  <span className="block text-[10px] font-bold tracking-wider text-white/75 mt-0.5">{s.subEn}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3단계 (네이비 배경) ── */}
      <section id="how" className="py-20 md:py-28 bg-navy text-white scroll-mt-16" aria-labelledby="how-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 flex flex-col items-center gap-3">
            <span className="text-primary text-sm font-bold uppercase tracking-widest">{t('home.how.badge')}</span>
            <h2 id="how-title" className="font-serif text-3xl md:text-[2.75rem] font-semibold tracking-tight leading-tight">{t('home.how.title')}</h2>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8 lg:gap-16 max-w-4xl mx-auto">
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
            {[
              { num: '1', icon: 'photo_camera', title: t('home.how.step1'), desc: t('home.how.step1Desc') },
              { num: '2', icon: 'psychology', title: t('home.how.step2'), desc: t('home.how.step2Desc') },
              { num: '3', icon: 'auto_awesome', title: t('home.how.step3'), desc: t('home.how.step3Desc') },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center gap-5 relative">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-5xl">{step.icon}</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-br from-primary to-pink-500 text-white flex items-center justify-center font-extrabold text-sm shadow-lg">{step.num}</div>
                </div>
                <h3 className="text-xl font-bold text-white">{step.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 무료 도구 그리드 (나만을 위한 뷰티 솔루션) ── */}
      <section id="tools-showcase" className="py-20 md:py-28 scroll-mt-16 bg-white" aria-labelledby="tools-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-primary-dark text-xs font-bold uppercase tracking-wider mb-5">
              <span className="text-base">💄</span>
              {isEn ? 'ALL FREE · No signup' : 'ALL FREE · 로그인 불필요'}
            </div>
            <h2 id="tools-title" className="font-serif text-4xl md:text-[3rem] font-semibold tracking-tight text-navy leading-[1.1] mb-4">
              {t('home.toolsShowcase.title1')}<br />
              <span className="bg-gradient-to-r from-primary via-pink-500 to-purple-600 bg-clip-text text-transparent">{t('home.toolsShowcase.title2')}</span>
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {t('home.toolsShowcase.subtitle')}
            </p>
          </div>

          {/* Featured: AI Makeup (네이비 강조 카드) */}
          <div className="mb-6">
            <a
              href="/analysis/"
              className="group block relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy-mid to-navy-light p-6 md:p-10 text-white shadow-xl shadow-navy/20 hover:shadow-2xl transition-all hover:-translate-y-0.5"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10">
                <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-6xl md:text-7xl shadow-inner">
                  💄
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/90 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    {t('home.toolsShowcase.signatureBadge')}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold mb-2 leading-tight">
                    {t('home.toolsShowcase.mainTitle')}
                  </h3>
                  <p className="text-white/85 text-sm md:text-base mb-5 max-w-xl">
                    {t('home.toolsShowcase.mainDesc')}
                  </p>
                  <div className="inline-flex items-center gap-2 font-bold text-sm md:text-base bg-white text-navy px-6 py-3 rounded-full shadow-lg group-hover:gap-3 transition-all">
                    {t('home.toolsShowcase.mainCta')}
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </div>
                </div>
              </div>
            </a>
          </div>

          {/* 4 Tool Cards — 공통 ToolCard 재사용, 각 "무료" 뱃지 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {[
              { href: '/tools/makeup-mbti/', icon: 'quiz', accent: 'var(--color-tool-mbti)',
                title: t('home.toolsShowcase.t1Title'), desc: t('home.toolsShowcase.t1Desc') },
              { href: '/tools/personal-color/', icon: 'palette', accent: 'var(--color-tool-pc)',
                title: t('home.toolsShowcase.t2Title'), desc: t('home.toolsShowcase.t2Desc') },
              { href: '/tools/face-shape/', icon: 'face', accent: 'var(--color-tool-face)',
                title: t('home.toolsShowcase.t3Title'), desc: t('home.toolsShowcase.t3Desc') },
              { href: '/tools/perfume-type/', icon: 'local_florist', accent: 'var(--color-tool-perfume)',
                title: t('home.toolsShowcase.t4Title'), desc: t('home.toolsShowcase.t4Desc') },
            ].map(tool => (
              <ToolCard
                key={tool.title}
                href={tool.href}
                icon={tool.icon}
                accent={tool.accent}
                title={tool.title}
                desc={tool.desc}
                tag={isEn ? 'FREE' : '무료'}
                cta={t('home.toolsShowcase.cardCta')}
              />
            ))}
          </div>

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

      {/* ── 최신 콘텐츠 (메이크업 제품 + 뉴스) — 매일 자동 발행 피드 노출 ── */}
      <HomeContentSections />

      {/* ── 하단 CTA (핑크) ── */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-primary via-pink-500 to-rose-400 text-white">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/15 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <span className="material-symbols-outlined text-white text-5xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <h2 className="font-serif text-3xl md:text-[2.75rem] font-semibold tracking-tight mb-4 leading-tight">
            {t('home.cta.title1')}<br />{t('home.cta.title2')}
          </h2>
          <p className="text-base text-white/85 mb-8 max-w-md mx-auto">
            {t('home.cta.subtitle')}
          </p>
          <button
            className="bg-white text-primary px-12 py-5 rounded-full text-xl font-extrabold transition-all shadow-2xl shadow-black/10 inline-flex items-center gap-3 hover:scale-[1.02]"
            onClick={() => onNavigate('analysis')}
          >
            {t('home.cta.button')}
            <span className="material-symbols-outlined text-2xl">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* ── About this site — operator transparency (E-E-A-T) ── */}
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
              <>kissinskin is run by <strong>koha</strong>. Our news and guides are compiled and edited (AI-assisted) from public sources on the fast-moving global beauty market, and whenever we cite industry data we name the public sources (BeautyMatter, Mintel, NIQ, NPD Group, and others) directly in the text.</>
            ) : (
              <>kissinskin은 <strong>koha</strong>가 운영합니다.
              뉴스·가이드는 매일 급변하는 글로벌 뷰티 시장 정보를 공개 자료 기반으로
              정리·편집한 콘텐츠이며(AI 지원), 산업 데이터를 인용할 때는
              BeautyMatter, Mintel, NIQ, NPD Group 등 공개 보고서를 본문에 명시합니다.</>
            )}
          </p>
          <p className="text-slate-600 text-base leading-relaxed mb-4">
            {isEn ? (
              <>AI assists both the tool features (image simulation and diagnostics) and the compiling of our news and guides from public sources. Uploaded photos are discarded right after analysis, and payments are handled by Polar (Merchant of Record), so your card details are never stored on this site. The site is funded by user payments, Google AdSense revenue, and Coupang Partners affiliate commissions — there is no outside investment. Affiliate commissions don’t affect product prices and have no bearing on which products we recommend.</>
            ) : (
              <>AI는 도구 기능(이미지 시뮬레이션·진단)과 뉴스·가이드의 공개 자료
              정리에 활용됩니다. 업로드한 사진은 분석 직후 폐기되고, 결제는
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

      {/* ── 심화 가이드 + FAQ (홈 하단 접기 — DOM 유지로 SEO 손실 0) ── */}
      <section id="guide" className="py-12 md:py-16 bg-cream scroll-mt-16" aria-labelledby="guide-title">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <details className="group rounded-2xl border border-pink-100 bg-white open:shadow-sm">
            <summary className="cursor-pointer list-none p-6 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">menu_book</span>
                <span id="guide-title" className="font-bold text-navy text-base md:text-lg">
                  {isEn ? 'In-depth guide & FAQ — how to get the most out of it' : '심화 가이드 & 자주 묻는 질문 — 똑똑하게 활용하는 법'}
                </span>
              </span>
              <span className="material-symbols-outlined text-slate-400 shrink-0 group-open:rotate-180 transition-transform">expand_more</span>
            </summary>

            <div className="px-6 pb-8">
              <div className="prose prose-slate max-w-none text-slate-700 leading-[1.85] text-[15px] md:text-base space-y-10">
                {isEn ? (
                <>
                <article>
                  <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">Why AI makeup simulation helps</h3>
                  <p>
                    The biggest hesitation before trying a new look is the question <strong className="text-primary">“will this actually suit me?”</strong> — and the time and money you lose if it doesn’t. Swatching every shade in-store is a hassle, and once you’ve bought color cosmetics online, returns are often difficult or impossible. kissinskin lets you simulate 9 signature K-beauty looks from a single selfie, so you can preview the real color payoff and the change in impression before you commit.
                  </p>
                  <p>
                    The AI reads your facial contours, features, and skin tone, then blends the makeup on naturally. Unlike a Photoshop paste-over, it keeps the direction of light, your skin texture, and the curves of your face intact — adding only the lip, cheek, and skin retouching with precision. The result looks close to “you, actually wearing the makeup,” so any look you like is easy to recreate.
                  </p>
                </article>

                <article>
                  <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">How kissinskin differs from a regular filter</h3>
                  <p>
                    TikTok and Instagram makeup filters are layered uniformly over the screen, so the same color lands on everyone regardless of face shape or skin tone. kissinskin is different: an AI trained on K-beauty makeup artists’ know-how <strong> analyzes your skin tone, face shape, and feature proportions and decides how to adapt each style for you</strong>. The same “Bold Lip” becomes a blue-toned red on a cool-toned user and a coral-based red on a warm-toned one, so it brings your features to life.
                  </p>
                  <p>
                    Just as importantly, your face stays your face. The makeup is applied inside a tight mask while your identity, facial structure, and expression are locked — so the result is something you can actually recreate at your own vanity, not a different person.
                  </p>
                </article>

                <article>
                  <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">Making the most of the free diagnostic tools</h3>
                  <p>
                    To read your AI simulation more accurately, it helps to know your own makeup tendencies.
                    <strong> Makeup MBTI</strong> is an 8-question quiz that identifies 16 makeup personalities and the signature colors, textures, and iconic looks that suit each.
                    <strong> Personal Color</strong> analysis sorts you into one of four seasons — spring warm, summer cool, autumn warm, winter cool — so you can find your most flattering colors in advance.
                    <strong> Face Shape</strong> analysis covers oval, round, square, oblong, and heart, bundling contouring, hair, and eyewear tips for each, and the <strong>Perfume</strong> quiz suggests scent families that match your vibe.
                  </p>
                  <p>
                    Once you’ve done them, you end up with concrete guidelines like “I’m a spring warm with a round face, so coral lips, pink blush, and a not-too-long eyeliner work best.” Bring those results back to the AI simulation and it becomes even clearer why a given look suits you. Every diagnostic tool is free and needs no sign-up.
                  </p>
                </article>

                <article>
                  <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">Privacy and AI accuracy</h3>
                  <p>
                    Your uploaded selfie is used for the AI synthesis and then processed and deleted without delay; it is never reused as training data. Result images are not exposed externally unless you explicitly save or share them. kissinskin processes data only within the scope you’ve consented to — see our <a href="/en/privacy/" className="text-primary font-semibold hover:underline">Privacy Policy</a> for details.
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
                    kissinskin은 셀카 한 장으로 9가지 K-뷰티 시그니처 룩을 즉시 시뮬레이션해
                    실제 발색과 인상 변화를 미리 확인할 수 있게 해 줍니다.
                  </p>
                  <p>
                    AI 모델은 사용자의 얼굴 윤곽·이목구비·피부 톤을 인식해 메이크업을 자연스럽게 합성합니다.
                    포토샵 합성과 다른 점은 빛의 방향, 피부 결, 얼굴 굴곡을 그대로 유지하면서
                    립·볼·피부 보정만 정밀하게 더한다는 것입니다.
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
                    무엇보다 내 얼굴은 그대로 유지됩니다. 메이크업은 좁은 마스크 안쪽에만 입혀지고
                    정체성·얼굴 구조·표정은 고정되므로, 결과물은 다른 사람이 아니라
                    실제 화장대 앞에서 따라 할 수 있는 "내 모습"이라는 점이 가장 큰 차별점입니다.
                  </p>
                </article>

                <article>
                  <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">무료 진단 도구 200% 활용하기</h3>
                  <p>
                    AI 시뮬레이션 결과를 더 정확하게 해석하려면 자신의 메이크업 성향을 알아야 합니다.
                    <strong> 메이크업 MBTI</strong>는 8문항 퀴즈로 16가지 메이크업 성향을 진단하고,
                    각 유형에 어울리는 시그니처 컬러·텍스처·아이코닉 룩을 알려 줍니다.
                    <strong> 퍼스널 컬러 진단</strong>은 봄웜·여름쿨·가을웜·겨울쿨 4계절을 판별해
                    평소 잘 어울리는 색을 미리 찾을 수 있게 해 줍니다.
                    <strong> 얼굴형 진단</strong>은 5가지 형태별로 컨투어링·헤어·안경 추천까지 묶어 주고,
                    <strong> 향수 진단</strong>은 분위기에 맞는 향 계열을 추천합니다.
                  </p>
                  <p>
                    진단을 마치면 "나는 봄웜에 둥근 얼굴형이라 립은 코랄·블러쉬는 핑크·아이라이너는 너무 길게 빼지 않는 쪽이 좋다"라는 식으로
                    구체적인 메이크업 가이드라인이 만들어집니다. 이 결과를 들고 AI 시뮬레이션으로 돌아오면
                    "왜 이 룩이 나에게 어울리는지" 한층 더 명확해집니다. 모든 진단 도구는 가입 없이 무료입니다.
                  </p>
                </article>

                <article>
                  <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">개인정보 보호와 AI의 정확도</h3>
                  <p>
                    업로드된 셀카는 AI 합성에 사용된 후 지체 없이 처리·삭제되며, 학습 데이터로 재사용되지 않습니다.
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
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-extrabold text-navy text-center mb-8 tracking-tight">{isEn ? 'Frequently asked questions' : '자주 묻는 질문'}</h3>
                <div className="space-y-3">
                  {homeFaq.map((item, i) => (
                    <details
                      key={i}
                      className="group/q bg-cream rounded-2xl border border-pink-100 hover:border-primary/30 transition-colors"
                    >
                      <summary className="cursor-pointer list-none p-5 flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary shrink-0 mt-0.5 group-open/q:rotate-180 transition-transform">expand_more</span>
                        <span className="font-bold text-navy-mid text-sm md:text-base flex-1">{item.q}</span>
                      </summary>
                      <div className="px-5 pb-5 pl-14 text-slate-600 text-sm md:text-[15px] leading-relaxed">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </details>

          {/* JSON-LD FAQPage — 접힘과 무관하게 DOM에 항상 존재(구조화 데이터 유지) */}
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
                <li><a href="/analysis/" className="hover:text-primary transition-colors cursor-pointer">{t('tools.nav.aiMakeup')}</a></li>
                <li><a href="#styles" className="hover:text-primary transition-colors cursor-pointer">{t('home.footer.styles')}</a></li>
                <li><a href="#how" className="hover:text-primary transition-colors cursor-pointer">{t('home.footer.howTo')}</a></li>
                <li><a href={isEn ? '/en/' : '/tools/'} className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'Free Tools' : '무료 도구 모음'}</a></li>
                <li><a href={isEn ? '/en/tools/makeup-mbti/' : '/tools/makeup-mbti/'} className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'Makeup MBTI' : '메이크업 MBTI'}</a></li>
                <li><a href={isEn ? '/en/tools/personal-color/' : '/tools/personal-color/'} className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'Personal Color' : '퍼스널 컬러 진단'}</a></li>
                <li><a href={isEn ? '/en/tools/face-shape/' : '/tools/face-shape/'} className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'Face Shape' : '얼굴형 진단'}</a></li>
                <li><a href="/tools/perfume-type/" className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'Perfume Type' : '향수 진단'}</a></li>
                <li><a href={isEn ? '/en/news/' : '/news/'} className="hover:text-primary transition-colors cursor-pointer">{t('nav.news')}</a></li>
                <li><a href={isEn ? '/en/products/' : '/products/'} className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'Makeup Products' : '메이크업 제품'}</a></li>
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
            <p>&copy; 2026 kissinskin · Operated by <a href={isEn ? '/en/about/' : '/about/'} className="hover:text-primary">koha</a> · {isEn ? 'Solo indie project in South Korea' : '대한민국 1인 인디 프로젝트'}</p>
            <p>Contact: <a href="mailto:support@kissinskin.net" className="hover:text-primary">support@kissinskin.net</a> · <time dateTime="2026-06-29">{isEn ? 'As of June 2026' : '2026년 6월 기준'}</time></p>
          </div>
        </div>
      </footer>

      {/* 모바일 하단 고정 네비 — 홈/진단/결과/마이 */}
      <MobileBottomNav />
    </div>
  )
}

export default HomePage
