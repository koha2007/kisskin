import { lazy, Suspense, useEffect, useState } from 'react'

const AnalysisApp = lazy(() => import('../../src/AnalysisApp'))

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <div style={{ width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid #eb4763', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

/** SSR에서는 SEO용 정적 콘텐츠를 렌더링하고, 클라이언트에서 실제 앱을 로드 */
function SeoShell() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>
        AI 퍼스널컬러 메이크업 분석
      </h1>
      <p style={{ color: '#555', lineHeight: 1.6, marginBottom: 24 }}>
        셀카 한 장으로 퍼스널컬러 진단과 함께 9가지 K-뷰티 메이크업 룩을 AI가 직접 시뮬레이션해 드립니다.
        피부 톤 분석, 맞춤 화장품 추천까지 한 번에 받아보세요.
      </p>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>분석 과정</h2>
      <ol style={{ color: '#555', lineHeight: 1.8, paddingLeft: 20 }}>
        <li>셀카 사진 업로드</li>
        <li>AI가 피부 톤 &amp; 퍼스널컬러 분석</li>
        <li>9가지 맞춤 메이크업 룩 시뮬레이션</li>
        <li>화장품 추천 리포트 제공</li>
      </ol>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: 24, marginBottom: 12 }}>제공되는 메이크업 스타일</h2>
      <ul style={{ color: '#555', lineHeight: 1.8, paddingLeft: 20 }}>
        <li>Natural Glow · Cloud Skin · Blood Lip</li>
        <li>Maximalist Eye · Metallic Eye · Bold Lip</li>
        <li>Blush Draping · Grunge Makeup · K-pop Idol</li>
      </ul>
    </div>
  )
}

export default function Page() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <SeoShell />

  return (
    <Suspense fallback={<Loading />}>
      <AnalysisApp />
    </Suspense>
  )
}
