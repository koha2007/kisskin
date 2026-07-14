import { lazy, Suspense, useEffect, useState } from 'react'
import AnalysisContent from '../../src/components/makeup/AnalysisContent'

// free-pivot P1: 새 무료 플로우(업로드→스타일→마스크→결과)로 교체.
// 기존 유료 리포트 앱(AnalysisApp)은 P1-5(크레딧) 통합까지 파일 보존.
const MakeupFlow = lazy(() => import('../../src/components/makeup/MakeupFlow'))

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <div style={{ width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid #eb4763', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

export default function Page() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <>
      {/* 앱은 브라우저 API 를 쓰므로 클라이언트에서만 뜬다. SSR 에서는 스피너 자리만 잡는다. */}
      {mounted ? (
        <Suspense fallback={<Loading />}>
          <MakeupFlow />
        </Suspense>
      ) : (
        <Loading />
      )}

      {/* 본문 — SSR 과 클라이언트가 **동일하게** 렌더한다.
          예전 구조(SeoShell)는 SSR 에서만 SEO 텍스트를 그리고 마운트되면 앱으로 통째로 교체했다.
          그래서 ① 실제 사용자는 그 글을 영영 못 봤고 ② JS 를 실행하는 구글봇도 앱만 보게 되어
          그 글이 아무 일도 하지 않았다(서치콘솔 본문 394자). 크롤러와 사용자에게 다른 걸 보여주는
          모양새라 위험하기도 했다. 이제 둘이 같은 것을 본다. */}
      <AnalysisContent />
    </>
  )
}
