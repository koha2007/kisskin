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
  const path = pageContext.urlPathname ?? ''
  const initialLocale = path.startsWith('/en') ? 'en' : 'ko'
  // 팔레트 2층 구조(src/index.css 주석 참고).
  // 힐다(크림+버밀리언) = **콘텐츠** — 무료 도구·결과와 읽을거리 허브.
  // 브랜드(네이비+핑크) = **외피** — 홈·AI 메이크업·결제 리포트·계정·법적 페이지.
  // 경계를 URL 한 곳에서 정하므로 페이지마다 클래스를 흩뿌릴 필요가 없다.
  // display:contents 라 박스를 만들지 않아 레이아웃에 영향이 없고,
  // 커스텀 프로퍼티 상속은 그대로 통과한다.
  const isContentArea = /^(\/en)?\/(tools|guides|news|reviews|products)(\/|$)/.test(path)
  return (
    <I18nProvider initialLocale={initialLocale}>
      {isContentArea ? (
        <div className="palette-hilda" style={{ display: 'contents' }}>{children}</div>
      ) : (
        children
      )}
      <CookieConsent />
    </I18nProvider>
  )
}
