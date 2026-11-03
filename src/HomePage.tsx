import { useState, useEffect } from 'react'
import { useI18n } from './i18n/I18nContext'
import { useAuth } from './hooks/useAuth'
import { EmailSubscribe } from './components/EmailSubscribe'
import MobileBottomNav from './components/home/MobileBottomNav'
import HomeServices from './components/home/HomeServices'
import { BUILD_DATE, BUILD_MONTH_KO, BUILD_MONTH_EN } from './lib/buildDate'

// 히어로에서 "완성 예시" 로 먼저 보여줄 룩 4종 — 톤(내추럴/블러쉬/눈/아이돌)이 서로 겹치지
// 않게 고른다. 썸네일은 각 룩의 실제 결과(after)를 쓴다.

const PAGE_PATHS: Record<string, string> = {
  home: '/', analysis: '/makeup/', terms: '/terms/', privacy: '/privacy/',
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
    let path = PAGE_PATHS[page] || '/'
    if (page === 'analysis' && window.location.pathname.startsWith('/en')) path = '/en/makeup/'
    // location.assign(): href= 대입과 동작 동일하지만 메서드 호출이라
    // eslint react-hooks/immutability(전역 객체 속성 대입 금지)에 걸리지 않는다.
    window.location.assign(path)
  }

  const { user: authUser } = useAuth()
  const user = userProp ?? authUser

  const { t, locale, setLocale } = useI18n()
  const isEn = locale === 'en'

  // 도구 4종과 도구 허브는 /en/ 아래 완전한 영문 미러가 프리렌더된다 → 영문일 땐 프리픽스를 붙인다.
  // (/analysis/ 는 예외 — KO·EN 공용 앱이라 프리픽스가 없다.)
  const toolHref = (path: string) => (isEn ? `/en${path}` : path)

  // ── 히어로 업로드 CTA ──
  // 2026-07-27: 예전엔 이 버튼이 pickImage('gallery') 로 **앨범 피커를 곧바로** 열었다.
  // 업로드 단계를 한 번 줄이려는 의도였지만, 버튼에 붙은 건 카메라 아이콘이라
  // "사진기를 눌렀는데 앨범이 열린다"는 혼란이 생겼다(운영자 리포트).
  // 이제는 업로드 화면(/analysis/)으로 보내 거기서 '카메라로 촬영 / 앨범에서 선택'을
  // 사용자가 직접 고르게 한다 — 아래 네이비 CTA 와 목적지가 같아졌다.

  // Bottom-of-home guide FAQ — shared by the accordion and the FAQPage JSON-LD so
  // structured data always matches the visible text in the active language.
  const homeFaq = isEn
    ? [
        { q: 'What happens to my selfie after I upload it?', a: 'Your photo is sent securely for AI processing and deleted as soon as it’s done. It’s never used for training, and unless you tap save or share yourself, the result image is never made public.' },
        { q: 'How close is the result to real makeup?', a: 'You’ll get the most natural result from a front-facing selfie in natural light. Lighting, angle, and anything covering your face (glasses, masks) can make it look different from real makeup. Swatch in store before you buy.' },
        { q: 'Can I use it for free?', a: 'Yes. The Makeup MBTI, Personal Color, Face Shape, and Perfume tools are all free and unlimited with no sign-up. AI makeup: sign up and get your first look free, no card needed (sign-in keeps people from farming unlimited free generations). After that, 1 look = 1 credit · credits from $2.99 (5 credits) · all 9 looks $4.99.' },
        { q: 'Where can I buy the recommended cosmetics?', a: 'Your results recommend by category (lipstick, eyeshadow, blush, and so on), and This week’s look on the home page links to specific product pages. We don’t sell products ourselves — you buy from outside stores such as Olive Young, Sephora, Coupang or Amazon. We never lock you into a single store.' },
        { q: 'Can men use it too?', a: 'Yes. Men get a grooming-focused set — a natural healthy base, clean skin tone-up, and tinted-balm looks — with no lipstick or eye makeup forced on.' },
        { q: 'Is the result really me, not a different face?', a: 'Yes. The makeup is applied as a precise overlay that locks your facial structure, features, and expression. We add only lip, cheek, and skin retouching inside a tight mask — your identity stays exactly the same.' },
      ]
    : [
        { q: '셀카 업로드 후 사진은 어떻게 처리되나요?', a: '사진은 AI 처리를 위해 안전하게 전송되고, 처리가 끝나면 바로 삭제돼요. 학습 데이터로 쓰이지 않아요. 또한 본인이 직접 저장·공유 버튼을 누르지 않으면 결과 이미지도 외부에 공개되지 않습니다.' },
        { q: '결과가 실제 메이크업과 얼마나 비슷한가요?', a: '정면을 향한 자연광 셀카에서 가장 자연스러운 결과가 나와요. 조명, 각도, 안경이나 마스크 같은 가림에 따라 실제 메이크업과 다르게 보일 수 있어요. 구매 전에는 매장에서 한 번 더 발색을 확인해 보세요.' },
        { q: '무료로 사용할 수 있나요?', a: '네. 메이크업 MBTI · 퍼스널 컬러 · 얼굴형 · 향수 진단 도구는 가입 없이 모두 무료·무제한입니다. AI 메이크업은 회원가입하면 첫 1룩 무료이고 카드 등록은 필요 없어요(이 기능만 로그인이 필요한 건 무제한 무료 생성 악용을 막기 위해서예요). 그다음은 1룩 = 크레딧 1개 · 크레딧 5개 $2.99부터 · 9룩 전부 $4.99예요.' },
        { q: '추천된 화장품은 어디서 살 수 있나요?', a: '결과에서는 카테고리별 추천(립스틱·아이섀도우·블러쉬 등)을, 홈의 ‘이번 주 추천 룩’에서는 제품 페이지를 안내해요. 키스인스킨이 직접 판매하지는 않고, 구매는 올리브영·세포라·쿠팡·아마존 등 외부 판매처에서 합니다. 우리는 구매 채널을 강제하지 않습니다.' },
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
          background: linear-gradient(90deg, #ef4da0, #e0a63c, #ef4da0);
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
            <a href={isEn ? '/en/lucky-makeup/' : '/lucky-makeup/'} className="text-sm font-medium text-slate-200 hover:text-primary transition-colors cursor-pointer">{isEn ? 'Lucky Makeup' : '럭키 메이크업'}</a>
            <a href="#free" className="text-sm font-medium text-slate-200 hover:text-primary transition-colors cursor-pointer">{t('common.freeTools')}</a>
            <a href={isEn ? '/en/looks/' : '/looks/'} className="text-sm font-medium text-slate-200 hover:text-primary transition-colors cursor-pointer">{isEn ? 'How-To' : '메이크업 방법'}</a>
            <a href={isEn ? '/en/class/' : '/class/'} className="text-sm font-medium text-slate-200 hover:text-primary transition-colors cursor-pointer">{isEn ? 'Class' : '메이크업 클래스'}</a>
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
              className="hidden sm:flex bg-primary-dark hover:bg-primary-dark text-white px-5 py-2 rounded-md text-sm font-bold transition-colors items-center gap-1.5"
              onClick={() => onNavigate('analysis')}
            >
              {t('tools.nav.aiMakeup')}
            </button>

            {/* Mobile-only AI button + hamburger */}
            <button
              onClick={() => onNavigate('analysis')}
              className="sm:hidden bg-primary-dark text-white px-3 py-1.5 rounded-md text-xs font-bold inline-flex items-center gap-1.5"
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
                  { href: isEn ? '/en/lucky-makeup/' : '/lucky-makeup/', label: isEn ? 'Lucky Makeup' : '럭키 메이크업' },
                  { href: toolHref('/tools/'), label: t('common.freeTools') },
                  { href: isEn ? '/en/looks/' : '/looks/', label: isEn ? 'Makeup How-To' : '메이크업 방법' },
                  { href: isEn ? '/en/class/' : '/class/', label: isEn ? 'Makeup Class' : '메이크업 클래스' },
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
                  className="w-full bg-primary-dark hover:bg-primary-dark transition-colors text-white py-3 rounded-md text-sm font-bold inline-flex items-center justify-center gap-1.5"
                >
                  {t('tools.nav.aiMakeup')}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>
      {/* 2026-11-02 개편 — 두 문 → 사용법 영상 → 유료 → 무료 (HomeServices) */}
      <HomeServices isEn={isEn} />

      {/* 메일 구독 — 1단계 목표(구독 1,000) */}
      <section className="bg-cream py-8 md:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <EmailSubscribe source="home" />
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
            {isEn
              ? <>kissinskin is run by an independent developer, <strong>koha</strong>. Uploaded photos are deleted right after analysis, payments are handled by Polar (Merchant of Record), and the site is funded by user payments and affiliate commissions — with no outside investment.</>
              : <>kissinskin은 개인 개발자 <strong>koha</strong>가 운영합니다. 업로드한 사진은 분석 직후 삭제되고, 결제는 Polar(Merchant of Record)가 처리하며, 운영비는 사용자 결제와 제휴 수수료로 충당합니다(외부 투자 없음).</>}
          </p>
          {/* 2026-09-10: 두 문단이 홈에 통째로 노출돼 너무 길다는 지적 → 요지는 위 한 문단으로
              올리고, 상세(데이터·AI·수익 구조)는 접는다. DOM 은 유지되므로 SEO 손실 0. */}
          <details className="group mb-4">
            <summary className="cursor-pointer list-none inline-flex items-center gap-1 text-sm font-semibold text-navy underline hover:text-primary">
              {isEn ? 'How it’s run — data, AI, and revenue' : '운영 방식 · 데이터 · 수익 구조 자세히'}
              <span className="material-symbols-outlined text-base group-open:rotate-180 transition-transform">expand_more</span>
            </summary>
            <div className="mt-3 space-y-4">
              <p className="text-slate-600 text-base leading-relaxed">
                {isEn ? (
                  <>Our news and guides are compiled and edited (AI-assisted) from public sources on the fast-moving global beauty market, and whenever we cite industry data we name the public sources (BeautyMatter, Mintel, NIQ, NPD Group, and others) directly in the text.</>
                ) : (
                  <>뉴스·가이드는 매일 급변하는 글로벌 뷰티 시장 정보를 공개 자료 기반으로
                  정리·편집한 콘텐츠이며(AI 지원), 산업 데이터를 인용할 때는
                  BeautyMatter, Mintel, NIQ, NPD Group 등 공개 보고서를 본문에 명시합니다.</>
                )}
              </p>
              <p className="text-slate-600 text-base leading-relaxed">
                {isEn ? (
                  <>AI assists both the tool features (image simulation and diagnostics) and the compiling of our news and guides from public sources. Uploaded photos are discarded right after analysis, and payments are handled by Polar (Merchant of Record), so your card details are never stored on this site. The site is funded by user payments and affiliate commissions (Coupang Partners and others) — there is no outside investment. Affiliate commissions don’t affect product prices and have no bearing on which products we recommend.</>
                ) : (
                  <>AI는 도구 기능(이미지 시뮬레이션·진단)과 뉴스·가이드의 공개 자료
                  정리에 활용됩니다. 업로드한 사진은 분석 직후 폐기되고, 결제는
                  Polar(Merchant of Record)가 처리하므로 카드 정보가 본 사이트에
                  저장되지 않습니다. 사이트 운영비는 사용자 결제와 쿠팡 파트너스 등
                  제휴 수수료로 충당하며, 외부 투자는 없습니다.
                  어필리에이트 수수료는 제품 가격에 영향을 주지 않고 추천 선정에도 영향이 없습니다.</>
                )}
              </p>
            </div>
          </details>
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
              <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
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
          <details className="group border border-slate-200 bg-white">
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
                    The biggest hesitation before trying a new look is the question <strong className="text-primary-dark">“will this actually suit me?”</strong> — and the time and money you lose if it doesn’t. Swatching every shade in-store is a hassle, and once you’ve bought color cosmetics online, returns are often difficult or impossible. kissinskin lets you simulate 9 signature K-beauty looks from a single selfie, so you can preview the real color payoff and the change in impression before you commit.
                  </p>
                  <p>
                    The AI reads your facial contours, features, and skin tone, then blends the makeup on naturally. Unlike a Photoshop paste-over, it keeps the direction of light, your skin texture, and the curves of your face intact — adding only the lip, cheek, and skin retouching with precision. The result looks close to “you, actually wearing the makeup,” so any look you like is easy to recreate.
                  </p>
                </article>

                <article>
                  <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">How kissinskin differs from a regular filter</h3>
                  <p>
                    TikTok and Instagram makeup filters are layered uniformly over the screen, so the same color lands on everyone regardless of face shape or skin tone. kissinskin is different: the AI <strong>applies each look directly to your own photo</strong>, so the result follows your real face and lighting instead of a flat overlay.
                  </p>
                  <p>
                    Just as importantly, the AI is instructed to keep your identity, facial structure, and expression as they are and change only the makeup and hair color — so the result stays close to you. AI output can vary slightly, so if a result looks off, try another photo.
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
                    Your uploaded selfie is used for the AI synthesis and then processed and deleted without delay; it is never reused as training data. Result images are not exposed externally unless you explicitly save or share them. kissinskin processes data only within the scope you’ve consented to — see our <a href="/en/privacy/" className="text-primary-dark font-semibold hover:underline">Privacy Policy</a> for details.
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
                    새로운 메이크업 룩에 도전할 때 가장 큰 부담은 <strong className="text-primary-dark">"내 얼굴에 어울릴까?"</strong>라는 의문과
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
                    같은 색이 적용됩니다. 반면 kissinskin은 AI가 <strong>내 사진 위에 각 룩을 직접 입혀</strong> 내 얼굴과 조명을 따라 결과를 만듭니다.
                  </p>
                  <p>
                    또한 AI에 정체성·얼굴 구조·표정은 그대로 두고 메이크업과 머리색만 바꾸도록 지시합니다. AI 결과는 조금씩 달라질 수 있으니, 어색하면 다른 사진으로 다시 시도해 보세요.
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
                    자세한 내용은 <a href="/privacy/" className="text-primary-dark font-semibold hover:underline">개인정보처리방침</a> 페이지에서 확인할 수 있습니다.
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
                      className="group/q bg-white border border-slate-200 hover:border-navy/40 transition-colors"
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
                <img src="/logo-sm.webp" alt={isEn ? 'kissinskin' : '키스인스킨 kissinskin'} className="h-10 w-10 rounded-full object-cover" />
                <span className="text-2xl font-bold tracking-tight">kissinskin</span>
                {!isEn && <span className="text-sm text-slate-400 font-medium">키스인스킨</span>}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
                {t('home.footer.desc')}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-100">{t('home.footer.service')}</h3>
              <ul className="flex flex-col gap-2 text-slate-300 text-sm">
                <li><a href={isEn ? '/en/makeup/' : '/makeup/'} className="hover:text-primary transition-colors cursor-pointer">{t('tools.nav.aiMakeup')}</a></li>
                <li><a href={isEn ? '/en/looks/' : '/looks/'} className="hover:text-primary transition-colors cursor-pointer">{t('home.footer.styles')}</a></li>
                <li><a href="#demo" className="hover:text-primary transition-colors cursor-pointer">{t('home.footer.howTo')}</a></li>
                <li><a href={toolHref('/tools/')} className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'Free Tools' : '무료 도구 모음'}</a></li>
                <li><a href={toolHref('/tools/makeup-mbti/')} className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'Makeup MBTI' : '메이크업 MBTI'}</a></li>
                <li><a href={toolHref('/tools/personal-color/')} className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'Personal Color' : '퍼스널 컬러 진단'}</a></li>
                <li><a href={toolHref('/tools/face-shape/')} className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'Face Shape' : '얼굴형 진단'}</a></li>
                <li><a href={toolHref('/tools/perfume-type/')} className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'Perfume Type' : '향수 진단'}</a></li>
                <li><a href={isEn ? '/en/looks/' : '/looks/'} className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'Makeup How-To' : '메이크업 방법'}</a></li>
                <li><a href={isEn ? '/en/class/' : '/class/'} className="hover:text-primary transition-colors cursor-pointer">{isEn ? 'Makeup Class' : '메이크업 클래스'}</a></li>
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
            <p>&copy; 2026 kissinskin{isEn ? '' : '(키스인스킨)'} · Operated by <a href={isEn ? '/en/about/' : '/about/'} className="hover:text-primary">koha</a></p>
            <p>Contact: <a href="mailto:support@kissinskin.net" className="hover:text-primary">support@kissinskin.net</a> · <time dateTime={BUILD_DATE}>{isEn ? `Last updated: ${BUILD_MONTH_EN}` : `최종 업데이트: ${BUILD_MONTH_KO}`}</time></p>
            {/* 언어 전환 — 상단 토글은 <button onClick> 이라 크롤러가 못 따라간다. 검색엔진이
                반대편 언어를 발견하고 링크 가중치를 넘기려면 진짜 <a> 가 하나는 있어야 한다.
                ⚠ ToolsLayout 푸터는 이걸 갖고 있는데(그 주석에 "홈을 제외한 전 페이지"라고
                  적혀 있다) 홈만 빠져 있었다. 홈이 권위가 가장 높은 페이지인데 여기서
                  /en/ 로 가는 크롤 경로가 0이었다 — 영어권 유입의 입구가 막혀 있던 셈. */}
            <p>
              {isEn ? '한국어로 보기: ' : 'Read in English: '}
              <a href={isEn ? '/' : '/en/'} className="hover:text-primary underline underline-offset-2">
                {isEn ? '한국어' : 'English'}
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* 모바일 하단 고정 네비 — 홈/진단/결과/마이 */}
      <MobileBottomNav />
    </div>
  )
}

export default HomePage
