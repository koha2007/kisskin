import { I18nProvider } from '../src/i18n/context'
import '../src/index.css'
import '../src/App.css'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      {children}
    </I18nProvider>
  )
}
