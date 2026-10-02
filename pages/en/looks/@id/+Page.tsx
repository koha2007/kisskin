import { usePageContext } from 'vike-react/usePageContext'
import LookHowTo from '../../../../src/pages/LookHowTo'
import { MAKEUP_STYLES, type MakeupStyleId } from '../../../../src/lib/makeup/styles'

export default function Page() {
  const ctx = usePageContext()
  const id = (ctx.routeParams?.id ?? '').toString()
  if (!MAKEUP_STYLES.some((s) => s.id === id)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-extrabold text-navy">Look not found</h1>
        <a href="/en/looks/" className="bg-navy text-white px-6 py-3 font-bold">All looks</a>
      </div>
    )
  }
  return <LookHowTo id={id as MakeupStyleId} />
}
