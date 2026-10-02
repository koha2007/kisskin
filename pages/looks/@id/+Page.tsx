import { usePageContext } from 'vike-react/usePageContext'
import LookHowTo from '../../../src/pages/LookHowTo'
import { MAKEUP_STYLES, type MakeupStyleId } from '../../../src/lib/makeup/styles'

export default function Page() {
  const ctx = usePageContext()
  const id = (ctx.routeParams?.id ?? '').toString()
  if (!MAKEUP_STYLES.some((s) => s.id === id)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-extrabold text-navy">룩을 찾을 수 없어요</h1>
        <a href="/looks/" className="bg-navy text-white px-6 py-3 font-bold">전체 룩 보기</a>
      </div>
    )
  }
  return <LookHowTo id={id as MakeupStyleId} />
}
