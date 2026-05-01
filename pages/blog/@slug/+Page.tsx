import { usePageContext } from 'vike-react/usePageContext'
import BlogArticle from '../../../src/pages/BlogArticle'

export default function Page() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.slug ?? '').toString()
  return <BlogArticle slug={slug} />
}
