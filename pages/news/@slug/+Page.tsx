import { usePageContext } from 'vike-react/usePageContext'
import NewsArticle from '../../../src/pages/NewsArticle'

export default function Page() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.slug ?? '').toString()
  return <NewsArticle slug={slug} />
}
