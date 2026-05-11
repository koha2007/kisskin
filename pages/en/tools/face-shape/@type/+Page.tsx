import { usePageContext } from 'vike-react/usePageContext'
import FaceShapeResult from '../../../../../src/pages/FaceShapeResult'
import { getFaceShapeBySlug } from '../../../../../src/lib/face-shape/types'

export default function Page() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.type ?? '').toString()
  const t = getFaceShapeBySlug(slug)
  if (!t) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light gap-4 px-4 text-center">
        <h1 className="text-2xl font-extrabold text-navy">Face shape not found</h1>
        <a href="/en/tools/face-shape/" className="bg-emerald-500 text-white px-6 py-3 rounded-full font-bold">Back to the quiz</a>
      </div>
    )
  }
  return <FaceShapeResult code={t.code} />
}
