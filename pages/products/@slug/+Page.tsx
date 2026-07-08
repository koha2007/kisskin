import { usePageContext } from 'vike-react/usePageContext'
import ProductShowcase from '../../../src/pages/ProductShowcase'

export default function Page() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.slug ?? '').toString()
  return <ProductShowcase slug={slug} />
}
