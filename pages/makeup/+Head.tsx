import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../src/lib/seo/isExactRoute'
import MakeupPageHead from '../../src/lib/makeup/MakeupPageHead'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/makeup/')) return null
  return <MakeupPageHead isEn={false} />
}
