import { lazy, Suspense } from 'react'

const AnalysisApp = lazy(() => import('../../src/AnalysisApp'))

export default function Page() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid #eb4763', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <AnalysisApp />
    </Suspense>
  )
}
