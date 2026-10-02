import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../src/lib/seo/isExactRoute'
import { LooksHubHead } from '../../src/lib/looks/LooksHead'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/looks/')) return null
  return <LooksHubHead isEn={false} />
}
