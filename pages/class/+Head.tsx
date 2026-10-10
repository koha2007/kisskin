import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../src/lib/seo/isExactRoute'
import { ClassHubHead } from '../../src/lib/class/ClassHead'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/class/')) return null
  return <ClassHubHead isEn={false} />
}
