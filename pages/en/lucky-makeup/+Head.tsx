import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../src/lib/seo/isExactRoute'
import FortuneHead from '../../../src/lib/fortune/FortuneHead'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/en/lucky-makeup/')) return null
  return <FortuneHead isEn />
}
