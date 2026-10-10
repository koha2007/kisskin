import { usePageContext } from 'vike-react/usePageContext'
import ClassLesson from '../../../../src/pages/ClassLesson'
import { isPublished } from '../../../../src/lib/class/lessons'

export default function Page() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.slug ?? '').toString()
  if (!isPublished(slug)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-extrabold text-navy">Lesson not found</h1>
        <a href="/en/class/" className="bg-navy text-white px-6 py-3 font-bold">All lessons</a>
      </div>
    )
  }
  return <ClassLesson slug={slug} />
}
