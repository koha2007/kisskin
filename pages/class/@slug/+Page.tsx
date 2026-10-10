import { usePageContext } from 'vike-react/usePageContext'
import ClassLesson from '../../../src/pages/ClassLesson'
import { isPublished } from '../../../src/lib/class/lessons'

export default function Page() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.slug ?? '').toString()
  if (!isPublished(slug)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-extrabold text-navy">클래스를 찾을 수 없어요</h1>
        <a href="/class/" className="bg-navy text-white px-6 py-3 font-bold">전체 클래스 보기</a>
      </div>
    )
  }
  return <ClassLesson slug={slug} />
}
