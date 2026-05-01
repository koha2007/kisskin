import { usePageContext } from 'vike-react/usePageContext'
import GuidesArticle from '../../../src/pages/GuidesArticle'

export default function Page() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.slug ?? '').toString()
  return <GuidesArticle slug={slug} />
}
