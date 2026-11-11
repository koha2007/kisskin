import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../src/lib/seo/isExactRoute'
import { FacePaintHead } from '../../src/lib/paint/PaintHeads'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/face-paint/')) return null
  return <FacePaintHead isEn={false} />
}
