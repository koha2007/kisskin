import { usePageContext } from 'vike-react/usePageContext'
import { I18nProvider } from '../src/i18n/context'
import CookieConsent from '../src/components/CookieConsent'
import '../src/index.css'
import '../src/App.css'

export default function Layout({ children }: { children: React.ReactNode }) {
  // Derive the SSR/prerender locale from the route URL so /en/* pages render in
  // English (not the Korean default). The client confirms the same value from the
  // URL, so hydration matches. This is the source of truth for prerendered HTML.
  const pageContext = usePageContext()
  const initialLocale = pageContext.urlPathname?.startsWith('/en') ? 'en' : 'ko'
  return (
    <I18nProvider initialLocale={initialLocale}>
      {children}
      <CookieConsent />
    </I18nProvider>
  )
}
