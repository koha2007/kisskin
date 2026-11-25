import { usePageContext } from 'vike-react/usePageContext'
import IdealTypeResult from '../../../../src/pages/IdealTypeResult'
import { getIdealTypeBySlug } from '../../../../src/lib/ideal-type/types'

export default function Page() {
  const ctx = usePageContext()
  const t = getIdealTypeBySlug((ctx.routeParams?.type ?? '').toString())
  if (!t) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light gap-4 px-4 text-center">
        <h1 className="text-2xl font-extrabold text-navy">{'유형을 찾을 수 없어요'}</h1>
        <a href="/tools/ideal-type/" className="bg-navy text-white px-6 py-3 rounded-full font-bold">테스트로 돌아가기</a>
      </div>
    )
  }
  return <IdealTypeResult code={t.code} />
}
