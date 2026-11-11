import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../src/lib/seo/isExactRoute'
import { HairColorHead } from '../../src/lib/paint/PaintHeads'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/hair-color/')) return null
  return <HairColorHead isEn={false} />
}
