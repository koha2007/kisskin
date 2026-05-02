import { I18nProvider } from '../src/i18n/context'
import CookieConsent from '../src/components/CookieConsent'
import '../src/index.css'
import '../src/App.css'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      {children}
      <CookieConsent />
    </I18nProvider>
  )
}
