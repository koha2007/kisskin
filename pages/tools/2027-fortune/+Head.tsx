import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../src/lib/seo/isExactRoute'
import NewYearHead from '../../../src/lib/fortune/NewYearHead'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/tools/2027-fortune/')) return null
  return <NewYearHead isEn={false} />
}
