import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../src/lib/seo/isExactRoute'
import { TodayFortuneHead } from '../../../src/lib/fortune/FortuneHead'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/tools/today-fortune/')) return null
  return <TodayFortuneHead isEn={false} />
}
