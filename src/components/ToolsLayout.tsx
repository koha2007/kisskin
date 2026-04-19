import { useI18n } from '../i18n/I18nContext'

export function ToolsNav() {
  const { t, locale, setLocale } = useI18n()
  return (
    <nav className="sticky top-0 z-40 w-full bg-navy border-b border-navy-light/50" role="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img src="/logo-sm.webp" alt="kissinskin" className="h-9 w-9 rounded-full object-cover" width={36} height={36} />
          <span className="text-xl font-bold tracking-tight text-white">kissinskin</span>
        </a>
        <div className="flex items-center gap-2 sm:gap-3">
          <a href="/tools/" className="text-xs sm:text-sm font-medium text-slate-200 hover:text-primary px-2 sm:px-3 py-1.5 rounded-md border border-slate-500">
            {t('tools.nav.toolsLink')}
          </a>
          <button
            onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
            className="text-xs sm:text-sm font-medium text-slate-200 hover:text-primary px-2 py-1 rounded-md border border-slate-500"
            aria-label="Switch language"
          >
            {locale === 'ko' ? 'EN' : '한국어'}
          </button>
          <a href="/analysis" className="hidden sm:flex bg-gradient-to-r from-primary to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold items-center gap-1.5">
            {t('tools.nav.aiMakeup')}
          </a>
        </div>
      </div>
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
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-100">{t('tools.footer.legal')}</h3>
            <ul className="flex flex-col gap-2 text-slate-300 text-sm">
              <li><a href="/terms" className="hover:text-primary">{t('tools.footer.terms')}</a></li>
              <li><a href="/privacy" className="hover:text-primary">{t('tools.footer.privacy')}</a></li>
              <li><a href="/refund" className="hover:text-primary">{t('tools.footer.refund')}</a></li>
              <li><a href="/contact" className="hover:text-primary">{t('tools.footer.contact')}</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-navy-mid text-center">
          <p className="text-slate-400 text-xs">&copy; 2026 kissinskin. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
