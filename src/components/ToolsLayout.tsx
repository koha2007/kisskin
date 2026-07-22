import { useState, useEffect } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { useAuth } from '../hooks/useAuth'

type NavLink = { href: string; label: string }

// Paths under `/tools/...` that have a prerendered /en/... variant.
// Used to swap nav/footer hrefs when locale === 'en'.
// ⚠ 여기에 등록하고 **호출부에서도 localePath() 를 쓰지 않으면** 영문 페이지가 한국어로 샌다.
//   실제로 그랬다(2026-07-14): 이 Set 에 향수가 빠져 있었고 푸터 3개 링크는 아예 하드코딩이라,
//   영문 페이지 77개 중 73개가 영어 라벨 + 한국어 목적지로 나가고 있었다. 도구를 추가할 땐
//   이 Set 과 호출부를 같이 볼 것.
const EN_TOOL_PATHS = new Set<string>([
  '/tools/',
  '/tools/face-shape/',
  '/tools/personal-color/',
  '/tools/makeup-mbti/',
  '/tools/perfume-type/',
])

function localePath(path: string, isEn: boolean): string {
  if (!isEn) return path
  if (EN_TOOL_PATHS.has(path)) return `/en${path}`
  // Other top-level EN landing pages
  if (path === '/about/' || path === '/about') return '/en/about/'
  if (path === '/about-makeup-ai/' || path === '/about-makeup-ai') return '/en/about-makeup-ai/'
  if (path === '/contact' || path === '/contact/') return '/en/contact/'
  if (path === '/privacy' || path === '/privacy/') return '/en/privacy/'
  if (path === '/terms' || path === '/terms/') return '/en/terms/'
  if (path === '/refund' || path === '/refund/') return '/en/refund/'
  return path
}

export function ToolsNav() {
  const { t, locale, setLocale } = useI18n()
  const { user } = useAuth()
  const isEn = locale === 'en'
  const [open, setOpen] = useState(false)

  // Close on escape + lock body scroll while open
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  const links: NavLink[] = [
    // Unified site nav — must match the home nav in src/HomePage.tsx.
    { href: localePath('/tools/', isEn), label: t('common.freeTools') },
    { href: isEn ? '/en/news/' : '/news/', label: isEn ? 'News' : '뉴스' },
    { href: isEn ? '/en/products/' : '/products/', label: isEn ? 'Makeup Products' : '메이크업 제품' },
    { href: localePath('/about/', isEn), label: isEn ? 'About' : '소개' },
  ]

  return (
    <nav className="sticky top-0 z-40 w-full bg-navy border-b border-navy-light/50" role="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href={isEn ? '/en/' : '/'} className="flex items-center gap-2 rounded-md -ml-1 px-1 py-1 hover:bg-navy-light/30 transition-colors" aria-label="kissinskin home">
          <img src="/logo-sm.webp" alt="kissinskin" className="h-9 w-9 rounded-full object-cover" width={36} height={36} />
          <span className="text-xl font-bold tracking-tight text-white">kissinskin</span>
        </a>

        {/* Desktop links — plain text, matching the home nav in src/HomePage.tsx */}
        <div className="hidden md:flex items-center gap-5">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-200 hover:text-primary transition-colors cursor-pointer"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Actions — language / login keep their outline; AI CTA is a filled pill */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
            className="hidden md:inline-flex text-sm font-medium text-slate-200 hover:text-primary transition-colors px-2 py-1 rounded-md border border-slate-500"
            aria-label="Switch language"
          >
            {locale === 'ko' ? 'EN' : '한국어'}
          </button>
          {user ? (
            <a
              href="/mypage/"
              className="hidden md:flex text-sm font-medium text-slate-200 hover:text-primary transition-colors px-3 py-1.5 rounded-md border border-slate-500 items-center gap-1.5"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
              <span>{t('auth.mypage')}</span>
            </a>
          ) : (
            <a
              href="/auth/"
              className="hidden md:inline-flex text-sm font-medium text-slate-200 hover:text-primary transition-colors px-3 py-1.5 rounded-md border border-slate-500"
            >
              {t('auth.login')}
            </a>
          )}
          {/* Desktop AI CTA */}
          <a
            href={isEn ? '/en/' : '/analysis/'}
            className="hidden sm:flex bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-md text-sm font-bold transition-colors items-center gap-1.5"
          >
            {t('tools.nav.aiMakeup')}
          </a>

          {/* Mobile-only AI button + hamburger */}
          <a
            href={isEn ? '/en/' : '/analysis/'}
            className="sm:hidden bg-primary text-white px-3 py-1.5 rounded-md text-xs font-bold inline-flex items-center gap-1.5"
          >
            {t('tools.nav.aiMakeup')}
          </a>
          <button
            onClick={() => setOpen(true)}
            aria-label={isEn ? 'Open menu' : '메뉴 열기'}
            aria-expanded={open}
            className="md:hidden text-white p-2 rounded-md border border-slate-500 hover:bg-navy-light/30"
          >
            <span className="material-symbols-outlined text-2xl leading-none align-middle">menu</span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-navy/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-0 right-0 h-full w-[80%] max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
              <span className="text-base font-bold text-navy">{isEn ? 'Menu' : '메뉴'}</span>
              <button
                onClick={() => setOpen(false)}
                aria-label={isEn ? 'Close menu' : '메뉴 닫기'}
                className="p-2 rounded-md hover:bg-slate-100 text-navy"
              >
                <span className="material-symbols-outlined text-2xl leading-none align-middle">close</span>
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto py-2">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
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
                  setOpen(false)
                }}
                className="w-full text-sm font-medium text-slate-700 hover:text-navy py-2.5 rounded-lg border border-slate-300"
              >
                {locale === 'ko' ? 'English' : '한국어'}
              </button>
              {user ? (
                <a
                  href="/mypage/"
                  onClick={() => setOpen(false)}
                  className="w-full text-sm font-medium text-slate-700 hover:text-navy py-2.5 rounded-lg border border-slate-300 inline-flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                  {t('auth.mypage')}
                </a>
              ) : (
                <a
                  href="/auth/"
                  onClick={() => setOpen(false)}
                  className="w-full text-sm font-medium text-slate-700 hover:text-navy py-2.5 rounded-lg border border-slate-300 inline-flex items-center justify-center"
                >
                  {t('auth.login')}
                </a>
              )}
              <a
                href={isEn ? '/en/' : '/analysis/'}
                onClick={() => setOpen(false)}
                className="w-full bg-primary hover:bg-primary-dark transition-colors text-white py-3 rounded-md text-sm font-bold inline-flex items-center justify-center gap-1.5"
              >
                {t('tools.nav.aiMakeup')}
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export function ToolsFooter() {
  const { t, locale } = useI18n()
  const isEn = locale === 'en'
  return (
    <footer className="bg-navy text-white pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo-sm.webp" alt="kissinskin" className="h-10 w-10 rounded-full object-cover" />
              <span className="text-2xl font-bold tracking-tight">kissinskin</span>
            </div>
            <p className="text-slate-300 text-sm max-w-xs">{t('tools.footer.brandDesc')}</p>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-100">{t('tools.footer.toolsTitle')}</h3>
            <ul className="flex flex-col gap-2 text-slate-300 text-sm">
              <li><a href={isEn ? '/en/' : '/analysis/'} className="hover:text-primary">{t('tools.footer.aiMakeup')}</a></li>
              <li><a href={localePath('/tools/makeup-mbti/', isEn)} className="hover:text-primary">{t('tools.footer.mbti')}</a></li>
              <li><a href={localePath('/tools/personal-color/', isEn)} className="hover:text-primary">{t('tools.footer.personalColor')}</a></li>
              <li><a href={localePath('/tools/face-shape/', isEn)} className="hover:text-primary">{t('tools.footer.faceShape')}</a></li>
              <li><a href={localePath('/tools/perfume-type/', isEn)} className="hover:text-primary">{t('tools.footer.perfume')}</a></li>
              <li><a href={isEn ? '/en/news/' : '/news/'} className="hover:text-primary">{isEn ? 'News' : '뉴스'}</a></li>
              <li><a href={isEn ? '/en/products/' : '/products/'} className="hover:text-primary">{isEn ? 'Makeup Products' : '메이크업 제품'}</a></li>
              <li><a href={localePath('/about-makeup-ai/', isEn)} className="hover:text-primary">{isEn ? 'K-Beauty Guide' : 'K-뷰티 가이드'}</a></li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-100">{t('tools.footer.legal')}</h3>
            <ul className="flex flex-col gap-2 text-slate-300 text-sm">
              <li><a href={localePath('/about/', isEn)} className="hover:text-primary">{isEn ? 'About · Operator' : '소개 · 운영자'}</a></li>
              <li><a href={localePath('/terms/', isEn)} className="hover:text-primary">{t('tools.footer.terms')}</a></li>
              <li><a href={localePath('/privacy/', isEn)} className="hover:text-primary">{t('tools.footer.privacy')}</a></li>
              <li><a href={localePath('/refund/', isEn)} className="hover:text-primary">{t('tools.footer.refund')}</a></li>
              <li><a href={localePath('/contact/', isEn)} className="hover:text-primary">{t('tools.footer.contact')}</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-navy-mid text-center text-slate-400 text-xs space-y-2">
          {/* 한글 브랜드명은 본문 텍스트로 있어야 검색엔진이 잡는다(스키마 alternateName 만으로는 안 잡힘).
              이 푸터는 홈을 제외한 전 페이지에 깔리므로 여기가 병기 지점이다. */}
          <p>
            &copy; 2026 kissinskin{isEn ? '' : '(키스인스킨)'} · {isEn ? 'Created by koha · One-person indie project based in South Korea' : '제작: koha · 대한민국 소재 1인 인디 프로젝트'}
          </p>
          <p>{isEn ? 'Contact: ' : '문의: '}<a href="mailto:support@kissinskin.net" className="hover:text-primary">support@kissinskin.net</a></p>
          {/* 언어 전환은 상단 토글이 하지만 그건 JS 라 크롤러가 못 따라간다. 검색엔진이 반대편
              언어를 발견하고 링크 가중치를 넘기려면 진짜 <a> 가 하나는 있어야 한다. */}
          <p>
            {isEn ? '한국어로 보기: ' : 'Read in English: '}
            <a href={isEn ? '/' : '/en/'} className="hover:text-primary underline underline-offset-2">
              {isEn ? '한국어' : 'English'}
            </a>
          </p>
          <p className="max-w-3xl mx-auto leading-relaxed">
            {isEn
              ? 'News and guides are compiled and edited (AI-assisted) from public sources on the global beauty market. Market data is cross-referenced against public reports from BeautyMatter, NIQ, Mintel, Sephora, and Olive Young. For medical or legal questions, please consult a qualified professional.'
              : '뉴스·가이드는 글로벌 뷰티 시장 정보를 공개 자료 기반으로 정리·편집한 콘텐츠이며(AI 지원), 시장 데이터는 BeautyMatter · NIQ · Mintel · Sephora · Olive Young 공개 보고서를 교차 참조합니다. 의학·법적 판단이 필요한 내용은 전문가 상담을 권고합니다.'}
          </p>
        </div>
      </div>
    </footer>
  )
}
