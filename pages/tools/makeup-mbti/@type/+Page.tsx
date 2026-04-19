import { usePageContext } from 'vike-react/usePageContext'
import MakeupMbtiResult from '../../../../src/pages/MakeupMbtiResult'
import { getMbtiTypeBySlug } from '../../../../src/lib/makeup-mbti/types'

export default function Page() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.type ?? '').toString()
  const type = getMbtiTypeBySlug(slug)
  if (!type) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light gap-4 px-4 text-center">
        <h1 className="text-2xl font-extrabold text-navy">유형을 찾을 수 없습니다</h1>
        <p className="text-slate-500">URL이 올바른지 확인해 주세요.</p>
        <a href="/tools/makeup-mbti/" className="bg-primary text-white px-6 py-3 rounded-full font-bold">
          테스트로 돌아가기
        </a>
      </div>
    )
  }
  return <MakeupMbtiResult code={type.code} />
}
