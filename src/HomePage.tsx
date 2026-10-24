import { useState, useEffect } from 'react'
import { useI18n } from './i18n/I18nContext'
import { useAuth } from './hooks/useAuth'
import ToolCard from './components/ToolCard'
import SectionHeader from './components/home/SectionHeader'
import CollectionDemo from './components/home/CollectionDemo'
import RealPersonSection from './components/home/RealPersonSection'
import DnaProgress from './components/beauty-dna/DnaProgress'
import HomeContentSections from './components/HomeContentSections'
import { EmailSubscribe } from './components/EmailSubscribe'
import MobileBottomNav from './components/home/MobileBottomNav'
import BeforeAfterSlider from './components/makeup/BeforeAfterSlider'
import { MAKEUP_STYLES, type MakeupStyleId } from './lib/makeup/styles'
import { LOOK_HERO, lookThumb } from './lib/makeup/lookImages'
import { trackEvent } from './lib/analytics'
import { TOOL_CARD_IMAGES } from './lib/toolCardImages'
import { useBeautyDna } from './hooks/useBeautyDna'
import { DNA_FIELDS, type DnaField } from './lib/beauty-dna/types'

// 룩 이름 — 버튼 문구·동그라미 라벨용. subEn 은 대문자 표기라 여기선 사람이 읽는 꼴로.
const LOOK_NAME_KO = Object.fromEntries(MAKEUP_STYLES.map((s) => [s.id, s.nameKo])) as Record<MakeupStyleId, string>
const LOOK_NAME_EN = Object.fromEntries(MAKEUP_STYLES.map((s) => [s.id, s.subEn.toLowerCase().replace(/(^|[\s-])\S/g, (c) => c.toUpperCase()).replace('K-pop', 'K-Pop')])) as Record<MakeupStyleId, string>

const DNA_PREVIEW: Record<DnaField, string> = {
  personalColor: TOOL_CARD_IMAGES.personalColor,
  faceShape: TOOL_CARD_IMAGES.faceShape,
  perfume: TOOL_CARD_IMAGES.perfume,
  mbti: TOOL_CARD_IMAGES.mbti,
}

// 히어로에서 "완성 예시" 로 먼저 보여줄 룩 4종 — 톤(내추럴/블러쉬/눈/아이돌)이 서로 겹치지
// 않게 고른다. 썸네일은 각 룩의 실제 결과(after)를 쓴다.

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
    // location.assign(): href= 대입과 동작 동일하지만 메서드 호출이라
    // eslint react-hooks/immutability(전역 객체 속성 대입 금지)에 걸리지 않는다.
    window.location.assign(path)
  }

  const { user: authUser } = useAuth()
  const { dna } = useBeautyDna()
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

  // ── 히어로 데모 ── 기본은 볼드 립(변화가 가장 눈에 띈다). 사용자가 직접 고르면(baPicked)
  // 주 버튼이 그 룩으로 바로 가는 링크·문구로 바뀐다.
  const [baLook, setBaLook] = useState<MakeupStyleId>('bold-lip')
  const [baPicked, setBaPicked] = useState(false)
  // Bottom-of-home guide FAQ — shared by the accordion and the FAQPage JSON-LD so
  // structured data always matches the visible text in the active language.
  const homeFaq = isEn
    ? [
        { q: 'What happens to my selfie after I upload it?', a: 'Your uploaded photo is used only for the AI makeup synthesis, then processed and deleted. It is never reused as training data, and unless you tap save or share yourself, the result image is never made public.' },
        { q: 'How close is the result to real makeup?', a: 'For a front-facing selfie in natural light, the visual match is roughly 85–95%. Color can vary with your monitor or phone display calibration, so for a look you love we recommend confirming the shade in-store once before buying.' },
        { q: 'Can I use it for free?', a: 'Yes. The Makeup MBTI, Personal Color, Face Shape, and Perfume tools are all free and unlimited with no sign-up. AI makeup gives you 1 free generation — that one does ask you to log in first (it keeps people from farming unlimited free generations), but no card is needed. If you want more generations after that, credits start at $2.99.' },
        { q: 'Where can I buy the recommended cosmetics?', a: 'We give recommendations by category (lipstick, eyeshadow, blush, and so on). For specific products, search and compare on the channels you already use — Olive Young, Sephora, Coupang, Amazon, and others. We never lock you into a single store.' },
        { q: 'Can men use it too?', a: 'Yes. Men get a grooming-focused set — a natural healthy base, clean skin tone-up, and tinted-balm looks — with no lipstick or eye makeup forced on.' },
        { q: 'Is the result really me, not a different face?', a: 'Yes. The makeup is applied as a precise overlay that locks your facial structure, features, and expression. We add only lip, cheek, and skin retouching inside a tight mask — your identity stays exactly the same.' },
      ]
    : [
        { q: '셀카 업로드 후 사진은 어떻게 처리되나요?', a: '업로드된 사진은 AI 메이크업 합성에 한해 일시 사용된 뒤 처리·삭제됩니다. 학습 데이터로 재사용되지 않으며, 본인이 직접 저장·공유 버튼을 누르지 않으면 결과 이미지도 외부에 공개되지 않습니다.' },
        { q: '결과가 실제 메이크업과 얼마나 비슷한가요?', a: '정면 자연광 셀카 기준 약 85~95%의 시각적 일치도를 보입니다. 다만 색감은 모니터·휴대폰 디스플레이 캘리브레이션에 따라 차이가 있을 수 있어, 마음에 드는 룩은 매장에서 한 번 더 발색을 확인한 뒤 구매하는 것을 권장합니다.' },
        { q: '무료로 사용할 수 있나요?', a: '네. 메이크업 MBTI · 퍼스널 컬러 · 얼굴형 · 향수 진단 도구는 가입 없이 모두 무료·무제한입니다. AI 메이크업은 무료 1회를 드리는데, 이 기능만 로그인이 필요해요(무제한 무료 생성 악용을 막기 위한 것이고 카드는 필요 없습니다). 더 만들고 싶다면 크레딧을 $2.99부터 충전할 수 있습니다.' },
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
          background: linear-gradient(90deg, #eb4763, #e0a63c, #eb4763);
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
            <a href="#tools-showcase" className="text-sm font-medium text-slate-200 hover:text-primary transition-colors cursor-pointer">{t('common.freeTools')}</a>
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
              className="hidden sm:flex bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-md text-sm font-bold transition-colors items-center gap-1.5"
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
                  className="w-full bg-primary hover:bg-primary-dark transition-colors text-white py-3 rounded-md text-sm font-bold inline-flex items-center justify-center gap-1.5"
                >
                  {t('tools.nav.aiMakeup')}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>
      {/* ── 히어로 ── 2026-10-18 대개편 (docs/REDESIGN_BENCHMARK_2026-10.md)
          이전: 버튼 5개(무료 진단·예시 보기·셀카 링크·$4.99·첫 1회 무료) + 작은 슬라이더 + 9칸 그리드.
          홈 진입자의 90%가 첫 화면만 본다(Clarity: 45% 지점 도달 PC 9%·모바일 10%)는 데서 출발해
          Remini·Lensa 구조로 바꿨다 — 큰 제목 → 버튼 하나 → 직접 만져 보는 데모.
          · 주 버튼 = "내 얼굴로 해 보기" 하나. 고른 룩이 있으면 그 룩으로 바로 간다.
          · $4.99 9룩 컬렉션은 바로 아래 시연 영상 섹션이 맡는다(가격은 첫 화면에서 뺀다).
          · 셀카가 부담스러운 사람용 무료 진단은 버튼이 아니라 글자 링크 한 줄로.
          · 룩 고르기 = 인스타 스토리식 동그라미 9개(얼굴 확대 썸네일, 192px 경량본).
          GA4: select_promotion creative_slot = home_hero_primary / home_hero_quiz / home_hero_look. */}
      <section className="relative overflow-hidden bg-cream" aria-labelledby="hero-title">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(at 85% 0%, rgba(235, 71, 99, 0.10) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(7, 9, 83, 0.05) 0px, transparent 45%)' }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:py-20 grid md:grid-cols-[1.15fr_0.85fr] gap-8 md:gap-12 lg:gap-16 items-center">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <p className="animate-fade-in-up text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary-dark">
              {t('home.hero.badge')}
            </p>
            {/* 2026-10-18 운영자: 헤드라인을 글로벌 사례처럼 — "사보기 전에, 내 얼굴에 발라본다"(기능 설명) →
                "셀카 한 장, 아홉 명의 나."(결과·정체성). 실측: Rhode "Edited, efficacious, intentional." ·
                Lensa "Create a feed worth following." · Photoroom "Sell at first sight" — 3~6단어, 결과를 말한다.
                예전 문구의 뜻("사기 전에 발라 본다")은 부제로 옮겼다. */}
            <h1
              id="hero-title"
              className="animate-fade-in-up mt-4 md:mt-6 text-[2.9rem] sm:text-[3.4rem] md:text-[4.4rem] lg:text-[5.6rem] font-extrabold leading-[1.02] tracking-[-0.045em] text-navy break-keep"
            >
              {t('home.hero.title1')}<br />
              <span className="text-primary">{t('home.hero.title2')}</span>
            </h1>
            <p className="animate-fade-in-up-delay mt-4 md:mt-7 text-[15px] md:text-lg text-slate-600 max-w-md leading-relaxed break-keep">
              {isEn
                ? 'See K-beauty looks on your own face before you buy. Nine looks from one selfie — still you. Your first look is free.'
                : '사기 전에 내 얼굴에 먼저 발라 보세요. 셀카 한 장으로 K-뷰티 9룩 — 다른 사람이 아니라 나. 첫 1회는 무료예요.'}
            </p>
            <a
              href={baPicked ? `/analysis/?style=${baLook}` : '/analysis/'}
              onClick={() => trackEvent('select_promotion', { creative_slot: 'home_hero_primary', promotion_id: baPicked ? baLook : 'none' })}
              className="animate-fade-in-up-delay2 mt-6 md:mt-9 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary-dark hover:bg-navy text-white h-14 md:h-16 px-9 md:px-11 text-base md:text-lg font-extrabold shadow-lg shadow-primary/25 transition-colors"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>face_retouching_natural</span>
              {baPicked
                ? (isEn ? 'Try this look on my face' : '이 룩, 내 얼굴로 체험')
                : (isEn ? 'Try it on my face — free' : '내 얼굴로 무료 체험')}
            </a>
            <p className="animate-fade-in-up-delay2 mt-3 text-xs font-medium text-slate-500">
              {isEn ? '1st look free · No card · Photo deleted right away' : '첫 1회 무료 · 카드 불필요 · 사진 바로 삭제'}
            </p>
            <a
              href={toolHref('/tools/beauty-dna/')}
              onClick={() => trackEvent('select_promotion', { creative_slot: 'home_hero_quiz' })}
              className="animate-fade-in-up-delay2 mt-4 md:mt-6 inline-flex items-center gap-1 text-[13px] md:text-sm font-bold text-navy underline decoration-navy/25 underline-offset-4 hover:decoration-navy"
            >
              {isEn ? 'No selfie? Start with 4 free 1-minute quizzes' : '셀카가 부담되면 — 1분 무료 진단 4가지부터'}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>

          {/* 데모 — 슬라이더 + 룩 동그라미. 고르면 제자리에서 바뀌고 위 버튼 문구도 그 룩으로 바뀐다. */}
          <div className="animate-fade-in-up-delay w-full max-w-[300px] sm:max-w-[360px] md:max-w-[400px] lg:max-w-[440px] mx-auto">
            <div className="relative">
              <BeforeAfterSlider key={baLook} beforeSrc={LOOK_HERO[baLook].before} afterSrc={LOOK_HERO[baLook].after} isEn={isEn} />
              <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-navy shadow-sm">
                {isEn ? LOOK_NAME_EN[baLook] : LOOK_NAME_KO[baLook]}
              </span>
            </div>
            <div className="mt-4 -mx-4 px-4 md:mx-0 md:px-0 flex md:grid md:grid-cols-9 gap-2.5 md:gap-1 overflow-x-auto md:overflow-visible snap-x pb-1 [scrollbar-width:none]" role="group" aria-label={isEn ? 'Choose a look' : '룩 선택'}>
              {MAKEUP_STYLES.map((s) => {
                const on = baLook === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setBaLook(s.id); setBaPicked(true); trackEvent('select_promotion', { creative_slot: 'home_hero_look', promotion_id: s.id }) }}
                    aria-pressed={on}
                    className="snap-start shrink-0 flex w-[60px] md:w-auto flex-col items-center gap-1"
                  >
                    <span className={`block h-[52px] w-[52px] md:h-11 md:w-11 lg:h-12 lg:w-12 rounded-full p-[2px] transition-all ${on ? 'bg-gradient-to-tr from-primary to-navy' : 'bg-slate-200'}`}>
                      <img
                        src={lookThumb(s.id)}
                        alt={isEn ? `${s.subEn} makeup look — AI-generated model` : `${s.nameKo} 메이크업 룩 — AI 생성 모델`}
                        width={48}
                        height={48}
                        decoding="async"
                        className="h-full w-full rounded-full border-2 border-cream object-cover"
                      />
                    </span>
                    <span className={`w-full truncate text-center text-[10px] leading-tight ${on ? 'font-extrabold text-navy' : 'font-semibold text-slate-500'}`}>
                      {isEn ? LOOK_NAME_EN[s.id] : s.nameKo}
                    </span>
                  </button>
                )
              })}
            </div>
            {/* AI 생성 고지 — EU AI Act Art.50(2026-08-02 시행) */}
            <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-400 break-keep">
              {isEn ? 'Drag to compare. ' : '손잡이를 밀어 비교해 보세요. '}{t('home.slider.aiDisclosure')}
            </p>
          </div>
        </div>
      </section>

      {/* 2026-10-12 운영자: 큰 9룩 사진 섹션(#styles) 제거 — 같은 9장이 히어로 썸네일에 이미 있어 겹쳤다.
          그 자리에 "이렇게 받아요" 시연 영상(사용법 + 결과물), 그 아래 페이스 차트(방법).
          AI 생성 인물 고지는 히어로 슬라이더 아래와 영상 캡션에 있다. */}
      {/* 실제 사람 결과(운영자 본인) — 히어로의 AI 모델 데모 바로 다음에 "진짜 사람도 되나?"에 답한다 */}
      <RealPersonSection isEn={isEn} />

      <CollectionDemo isEn={isEn} />

      {/* ── 주간 레터 구독 ──
          2026-10-12: 페이지 80% 지점에 있어 홈 방문자의 3~6%만 봤다(Clarity 열 지도 30일, PC 3%·모바일 6%).
          구독 1,000 이 1단계 목표라 시연 영상 바로 아래(약 40% 이상이 보는 자리)로 올렸다.
          가입·크레딧이 필요 없는 가장 값싼 전환이라, 결과물을 본 직후 "매주 메일로"를 붙인다. */}
      <section className="bg-white pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmailSubscribe source="home" />
        </div>
      </section>


      {/* ── 메이크업도 아트다 — 페이스 차트 9룩 (2026-10-18 대개편) ──
          이전: 3×3 페이스 차트 그리드(PC 약 1,900px). 브랜드 비전(미술 × 메이크업)이 가장 직접 보이는
          자리라 Rhode 식 아주 큰 한 문장 + 갤러리처럼 옆으로 넘기는 차트 띠로 바꿨다(높이 절반 이하).
          차트는 /looks/{id}/ 단계 페이지로 간다. */}
      <section id="how-to" className="relative py-16 md:py-28 bg-white scroll-mt-16 overflow-hidden" aria-labelledby="howto-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-[1fr_auto] gap-6 md:gap-10 items-end">
          <div>
            <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary-dark">
              {isEn ? 'Face charts · step by step' : '페이스 차트 · 단계별 따라 하기'}
            </p>
            <h2 id="howto-title" className="mt-4 font-serif text-[3.4rem] sm:text-[4.5rem] md:text-[6.5rem] lg:text-[8rem] font-semibold leading-[0.92] tracking-[-0.04em] text-navy break-keep">
              {isEn ? <>Makeup<br /><em className="text-primary-dark">is art.</em></> : <>메이크업도<br /><span className="text-primary-dark">아트다.</span></>}
            </h2>
          </div>
          <div className="max-w-sm md:pb-3">
            <p className="text-[15px] md:text-base text-slate-600 leading-relaxed break-keep">
              {isEn
                ? 'Every look drawn on a makeup artist’s face chart — where each step goes, which shade, and with what. Four steps each.'
                : '9룩 모두 메이크업 아티스트의 페이스 차트로 그렸어요. 어디에, 어떤 색을, 무엇으로 — 룩마다 4단계.'}
            </p>
            <a href={isEn ? '/en/looks/' : '/looks/'} className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-bold text-navy border-b-2 border-navy pb-0.5 hover:text-primary-dark hover:border-primary-dark transition-colors">
              {isEn ? 'All 9 how-tos' : '9룩 방법 전체 보기'}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>
        </div>
        <div className="mt-10 md:mt-14 max-w-6xl mx-auto">
          <ul className="flex gap-3 md:gap-5 overflow-x-auto snap-x snap-mandatory px-4 sm:px-6 lg:px-8 scroll-px-4 sm:scroll-px-6 lg:scroll-px-8 pb-3 [scrollbar-width:thin]">
            {MAKEUP_STYLES.map((s, i) => (
              <li key={s.id} className="snap-start shrink-0 w-[46vw] max-w-[220px] md:w-[230px] md:max-w-none">
                <a href={`${isEn ? '/en' : ''}/looks/${s.id}/`} className="group block">
                  <span className="relative block aspect-[3/4] overflow-hidden bg-cream ring-1 ring-slate-200 group-hover:ring-navy transition-colors">
                    <img
                      src={`/looks/charts/${s.id}.webp`}
                      alt={isEn ? `${s.subEn} face chart` : `${s.nameKo} 페이스 차트`}
                      loading="lazy"
                      decoding="async"
                      className="absolute left-1/2 top-[-28%] w-[150%] max-w-none -translate-x-1/2 transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <span className="absolute left-3 top-3 font-serif text-2xl md:text-3xl font-semibold italic text-navy/80 lining-nums">{String(i + 1).padStart(2, '0')}</span>
                  </span>
                  <span className="mt-2.5 block text-sm md:text-base font-bold text-navy leading-snug break-keep">{isEn ? LOOK_NAME_EN[s.id] : s.nameKo}</span>
                  <span className="block text-xs text-slate-500">{isEn ? '4 steps' : '4단계'} →</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 px-4 sm:px-6 lg:px-8 text-[11px] text-slate-400">{isEn ? 'Face-chart illustrations are AI-generated.' : '페이스 차트 일러스트는 AI로 생성했어요.'}</p>
        </div>
      </section>

      {/* ── 무료 진단 4가지 — 2026-10-18 대개편으로 한 덩어리로 압축 ──
          이전: 회원가입 혜택 띠 + 네이비 대형 카드(beauty-dna) + 하위 제목 + 카드 4장 + 슬림 카드 (PC 약 1,500px).
          진단 → 룩 → 제품을 한 줄로 잇는 게 목적이라(퀴즈 퍼널 10~20%대, Fenty "Find your shade")
          제목 하나 + 카드 4장 + "4가지 모이면 맞춤 결과" 띠 한 줄로 줄였다. */}
      <section id="tools-showcase" className="py-16 md:py-24 scroll-mt-16 bg-white border-t border-slate-200/70" aria-labelledby="tools-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            titleId="tools-title"
            eyebrow={t('home.toolsShowcase.quizzesBadge')}
            title={t('home.toolsShowcase.quizzesTitle')}
            subtitle={t('home.toolsShowcase.quizzesDesc')}
          />

          {/* 4 Tool Cards — ⚠ 도구 링크는 반드시 toolHref()(영문 카드가 한국어 페이지로 떨어지던 2026-07-14 버그) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {[
              { href: toolHref('/tools/personal-color/'), icon: 'palette', accent: 'var(--color-tool-pc)', image: TOOL_CARD_IMAGES.personalColor,
                title: t('home.toolsShowcase.t2Title'), desc: t('home.toolsShowcase.t2Desc'), meta: t('home.toolsShowcase.t2Tag') },
              { href: toolHref('/tools/face-shape/'), icon: 'face', accent: 'var(--color-tool-face)', image: TOOL_CARD_IMAGES.faceShape,
                title: t('home.toolsShowcase.t3Title'), desc: t('home.toolsShowcase.t3Desc'), meta: t('home.toolsShowcase.t3Tag') },
              { href: toolHref('/tools/makeup-mbti/'), icon: 'quiz', accent: 'var(--color-tool-mbti)', image: TOOL_CARD_IMAGES.mbti,
                title: t('home.toolsShowcase.t1Title'), desc: t('home.toolsShowcase.t1Desc'), meta: t('home.toolsShowcase.t1Tag') },
              { href: toolHref('/tools/perfume-type/'), icon: 'local_florist', accent: 'var(--color-tool-perfume)', image: TOOL_CARD_IMAGES.perfume,
                title: t('home.toolsShowcase.t4Title'), desc: t('home.toolsShowcase.t4Desc'), meta: t('home.toolsShowcase.t4Tag') },
            ].map(tool => (
              <ToolCard
                key={tool.title}
                href={tool.href}
                icon={tool.icon}
                accent={tool.accent}
                image={tool.image}
                title={tool.title}
                desc={tool.desc}
                meta={tool.meta}
                tag={isEn ? 'FREE' : '무료'}
                cta={t('home.toolsShowcase.cardCta')}
                compact
              />
            ))}
          </div>

          {/* 4가지가 모이면 — 하나의 맞춤 결과(beauty-dna). 진행 상태가 보이게 체크 4칸 + 진행 막대. */}
          <a
            href={toolHref('/tools/beauty-dna/')}
            className="group mt-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 bg-navy text-white px-5 py-5 md:px-8 md:py-6 hover:bg-navy-mid transition-colors"
          >
            <ul className="flex gap-2 shrink-0" aria-hidden="true">
              {DNA_FIELDS.map((f) => (
                <li key={f} className="relative h-12 w-12 overflow-hidden bg-white/10">
                  <img src={DNA_PREVIEW[f]} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  {dna[f] && (
                    <span className="absolute inset-0 flex items-center justify-center bg-navy/55">
                      <span className="material-symbols-outlined text-[20px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-on-dark">{t('home.dna.featLabel')}</p>
              <p className="mt-1 text-sm md:text-base text-white/85 leading-relaxed break-keep">{t('home.dna.featDesc')}</p>
              <DnaProgress compact dark className="mt-2" />
            </div>
            <span className="inline-flex w-fit shrink-0 items-center gap-2 bg-white text-navy px-5 py-3 text-sm font-bold group-hover:gap-3 transition-all">
              {t('home.dna.homeCta')}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </span>
          </a>
          <p className="mt-3 text-center text-xs text-slate-500 break-keep">
            <span className="font-bold text-navy">{t('home.how.giftTitle')}</span> — {t('home.how.giftDesc')}
          </p>

          {/* 2026-10-18: AI 메이크업 슬림 카드 제거 — 새 히어로의 주 버튼과 같은 일을 했다. */}

          <div className="text-center mt-10 md:mt-12">
            <a
              href={toolHref('/tools/')}
              className="inline-flex items-center gap-2 border border-navy/25 hover:border-navy text-navy px-8 py-3.5 font-bold text-sm md:text-base transition-colors"
            >
              {t('home.toolsShowcase.seeAllTools')}
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── 최신 콘텐츠 (메이크업 제품 + 뉴스) — 주 1회 자동 발행 피드 노출 ── */}
      <HomeContentSections />

      {/* ── 하단 CTA (핑크) ── */}
      {/* 2026-07-22 개편: 핑크 3색 그라디언트 + blur blob + 떠 있는 알약 버튼을 전부 뺐다.
          벤치마킹한 3사(Rhode·MERIT·Glossier)는 배경에 색을 칠하지 않고 사진과 조판으로만
          마무리한다. 여기서는 결과물 한 장을 배경으로 깔고 그 위에 조판을 올렸다. */}
      <section className="relative overflow-hidden bg-navy text-white">
        <img
          src="/home-ba-after.webp"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-25"
        />
        <div className="relative max-w-3xl mx-auto px-4 py-24 md:py-32 text-center">
          <h2 className="font-serif text-[2.25rem] md:text-[3.25rem] font-semibold tracking-tight mb-5 leading-[1.08]">
            {t('home.cta.title1')}<br />{t('home.cta.title2')}
          </h2>
          <p className="text-base text-white/80 mb-9 max-w-md mx-auto leading-relaxed">
            {t('home.cta.subtitle')}
          </p>
          <button
            className="bg-white text-navy px-12 py-5 text-lg font-bold transition-colors hover:bg-slate-100 inline-flex items-center gap-3"
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
                <li><a href="/analysis/" className="hover:text-primary transition-colors cursor-pointer">{t('tools.nav.aiMakeup')}</a></li>
                <li><a href="#how-to" className="hover:text-primary transition-colors cursor-pointer">{t('home.footer.styles')}</a></li>
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
            <p>Contact: <a href="mailto:support@kissinskin.net" className="hover:text-primary">support@kissinskin.net</a> · <time dateTime="2026-06-29">{isEn ? 'As of June 2026' : '2026년 6월 기준'}</time></p>
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
