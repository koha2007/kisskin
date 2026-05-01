import { usePageContext } from 'vike-react/usePageContext'
import ReviewsArticle from '../../../src/pages/ReviewsArticle'

export default function Page() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.slug ?? '').toString()
  return <ReviewsArticle slug={slug} />
}
