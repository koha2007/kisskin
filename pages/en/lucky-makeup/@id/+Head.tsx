import { usePageContext } from 'vike-react/usePageContext'
import { LuckyLookHead } from '../../../../src/lib/fortune/FortuneHead'
import { FORTUNE_LOOKS, type FortuneLookId } from '../../../../src/lib/fortune/looks'

export default function Head() {
  const ctx = usePageContext()
  const id = (ctx.routeParams?.id ?? '').toString()
  if (!FORTUNE_LOOKS.some((l) => l.id === id)) return null
  return <LuckyLookHead id={id as FortuneLookId} isEn={true} />
}
