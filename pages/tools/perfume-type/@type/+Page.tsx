import { usePageContext } from 'vike-react/usePageContext'
import PerfumeTypeResult from '../../../../src/pages/PerfumeTypeResult'
import { getPerfumeTypeBySlug } from '../../../../src/lib/perfume-type/types'

export default function Page() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.type ?? '').toString()
  const t = getPerfumeTypeBySlug(slug)
  if (!t) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light gap-4 px-4 text-center">
        <h1 className="text-2xl font-extrabold text-navy">향수 타입을 찾을 수 없습니다</h1>
        <a href="/tools/perfume-type/" className="bg-rose-500 text-white px-6 py-3 rounded-full font-bold">진단으로 돌아가기</a>
      </div>
    )
  }
  return <PerfumeTypeResult code={t.code} />
}
