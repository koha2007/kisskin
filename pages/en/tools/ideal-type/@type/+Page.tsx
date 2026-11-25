import { usePageContext } from 'vike-react/usePageContext'
import IdealTypeResult from '../../../../../src/pages/IdealTypeResult'
import { getIdealTypeBySlug } from '../../../../../src/lib/ideal-type/types'

export default function Page() {
  const ctx = usePageContext()
  const t = getIdealTypeBySlug((ctx.routeParams?.type ?? '').toString())
  if (!t) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light gap-4 px-4 text-center">
        <h1 className="text-2xl font-extrabold text-navy">{'Ideal type not found'}</h1>
        <a href="/en/tools/ideal-type/" className="bg-navy text-white px-6 py-3 rounded-full font-bold">Back to the test</a>
      </div>
    )
  }
  return <IdealTypeResult code={t.code} />
}
