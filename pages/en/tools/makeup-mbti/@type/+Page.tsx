import { usePageContext } from 'vike-react/usePageContext'
import MakeupMbtiResult from '../../../../../src/pages/MakeupMbtiResult'
import { getMbtiTypeBySlug } from '../../../../../src/lib/makeup-mbti/types'

export default function Page() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.type ?? '').toString()
  const t = getMbtiTypeBySlug(slug)
  if (!t) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light gap-4 px-4 text-center">
        <h1 className="text-2xl font-extrabold text-navy">Type not found</h1>
        <a href="/en/tools/makeup-mbti/" className="bg-primary text-white px-6 py-3 rounded-full font-bold">Back to the quiz</a>
      </div>
    )
  }
  return <MakeupMbtiResult code={t.code} />
}
