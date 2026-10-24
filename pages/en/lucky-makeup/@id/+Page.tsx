import { usePageContext } from 'vike-react/usePageContext'
import LuckyLookHowTo from '../../../../src/pages/LuckyLookHowTo'
import { FORTUNE_LOOKS, type FortuneLookId } from '../../../../src/lib/fortune/looks'

export default function Page() {
  const ctx = usePageContext()
  const id = (ctx.routeParams?.id ?? '').toString()
  if (!FORTUNE_LOOKS.some((l) => l.id === id)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-extrabold">Look not found</h1>
        <a href="/en/lucky-makeup/" className="bg-navy text-white px-6 py-3 font-bold">All lucky makeup</a>
      </div>
    )
  }
  return <LuckyLookHowTo id={id as FortuneLookId} />
}
