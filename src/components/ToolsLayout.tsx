import { useState, useEffect } from 'react'
import { useI18n } from '../i18n/I18nContext'

type NavLink = { href: string; label: string }

export function ToolsNav() {
  const { t, locale, setLocale } = useI18n()
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
    { href: '/tools/', label: t('tools.nav.toolsLink') },
    { href: '/guides/', label: '가이드' },
    { href: '/reviews/', label: '리뷰' },
    { href: '/news/', label: '뉴스' },
    { href: '/blog/', label: '블로그' },
    { href: '/about/', label: '소개' },
  ]

  return (
    <nav className="sticky top-0 z-40 w-full bg-navy border-b border-navy-light/50" role="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img src="/logo-sm.webp" alt="kissinskin" className="h-9 w-9 rounded-full object-cover" width={36} height={36} />
          <span className="text-xl font-bold tracking-tight text-white">kissinskin</span>
        </a>

        {/* Desktop links — visible from md up */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs lg:text-sm font-medium text-slate-200 hover:text-primary px-2 lg:px-3 py-1.5 rounded-md border border-slate-500"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
            className="text-xs lg:text-sm font-medium text-slate-200 hover:text-primary px-2 py-1 rounded-md border border-slate-500"
            aria-label="Switch language"
          >
            {locale === 'ko' ? 'EN' : '한국어'}
          </button>
          <a
            href="/analysis"
            className="bg-gradient-to-r from-primary to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-1.5"
          >
            {t('tools.nav.aiMakeup')}
          </a>
        </div>

        {/* Mobile cluster — visible below md */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href="/analysis"
            className="bg-gradient-to-r from-primary to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5"
          >
            {t('tools.nav.aiMakeup')}
          </a>
          <button
            onClick={() => setOpen(true)}
            aria-label="메뉴 열기"
            aria-expanded={open}
            className="text-white p-2 rounded-md border border-slate-500 hover:bg-navy-light/30"
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
              <span className="text-base font-bold text-navy">메뉴</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="메뉴 닫기"
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
              <a
                href="/analysis"
                onClick={() => setOpen(false)}
                className="w-full bg-gradient-to-r from-primary to-pink-500 text-white py-3 rounded-full text-sm font-bold inline-flex items-center justify-center gap-1.5"
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
  const { t } = useI18n()
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
              <li><a href="/analysis" className="hover:text-primary">{t('tools.footer.aiMakeup')}</a></li>
              <li><a href="/tools/makeup-mbti/" className="hover:text-primary">{t('tools.footer.mbti')}</a></li>
              <li><a href="/tools/personal-color/" className="hover:text-primary">{t('tools.footer.personalColor')}</a></li>
              <li><a href="/tools/face-shape/" className="hover:text-primary">{t('tools.footer.faceShape')}</a></li>
              <li><a href="/guides/" className="hover:text-primary">가이드</a></li>
              <li><a href="/reviews/" className="hover:text-primary">리뷰</a></li>
              <li><a href="/news/" className="hover:text-primary">뉴스</a></li>
              <li><a href="/blog/" className="hover:text-primary">블로그</a></li>
              <li><a href="/about-makeup-ai/" className="hover:text-primary">K-뷰티 가이드</a></li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-100">{t('tools.footer.legal')}</h3>
            <ul className="flex flex-col gap-2 text-slate-300 text-sm">
              <li><a href="/about" className="hover:text-primary">소개 · 운영자</a></li>
              <li><a href="/terms" className="hover:text-primary">{t('tools.footer.terms')}</a></li>
              <li><a href="/privacy" className="hover:text-primary">{t('tools.footer.privacy')}</a></li>
              <li><a href="/refund" className="hover:text-primary">{t('tools.footer.refund')}</a></li>
              <li><a href="/contact" className="hover:text-primary">{t('tools.footer.contact')}</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-navy-mid text-center text-slate-400 text-xs space-y-2">
          <p>&copy; 2026 kissinskin · 운영자: Yonghun Kim · 대한민국 소재 1인 인디 프로젝트</p>
          <p>문의: <a href="mailto:support@kissinskin.net" className="hover:text-primary">support@kissinskin.net</a></p>
          <p className="max-w-3xl mx-auto leading-relaxed">
            모든 글은 직접 기획·편집한 고유 콘텐츠이며, 시장 데이터는 BeautyMatter · NIQ · Mintel · Sephora · Olive Young
            공개 보고서를 교차 참조합니다. 의학·법적 판단이 필요한 내용은 전문가 상담을 권고합니다.
          </p>
        </div>
      </div>
    </footer>
  )
}
