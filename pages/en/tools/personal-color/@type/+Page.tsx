import { usePageContext } from 'vike-react/usePageContext'
import PersonalColorResult from '../../../../../src/pages/PersonalColorResult'
import { getSeasonBySlug } from '../../../../../src/lib/personal-color/types'

export default function Page() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.type ?? '').toString()
  const t = getSeasonBySlug(slug)
  if (!t) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light gap-4 px-4 text-center">
        <h1 className="text-2xl font-extrabold text-navy">Season not found</h1>
        <a href="/en/tools/personal-color/" className="bg-amber-500 text-white px-6 py-3 rounded-full font-bold">Back to the quiz</a>
      </div>
    )
  }
  return <PersonalColorResult code={t.code} />
}
