import { usePageContext } from 'vike-react/usePageContext'
import { LookHead } from '../../../src/lib/looks/LooksHead'
import type { MakeupStyleId } from '../../../src/lib/makeup/styles'

export default function Head() {
  const ctx = usePageContext()
  const id = (ctx.routeParams?.id ?? '').toString() as MakeupStyleId
  return <LookHead id={id} isEn={false} />
}
