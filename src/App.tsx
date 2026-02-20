import { useState, useRef } from 'react'
import './App.css'
import HomePage from './HomePage'

type Gender = '여성' | '남성' | null
type SkinType = '건성' | '지성' | '중성' | '복합성' | '잘 모름' | null
type Page = 'home' | 'analysis'

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="report-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h3 class="report-h3">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n{2,}/g, '<br /><br />')
    .replace(/\n/g, '<br />')
}

function BottomNav({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <>
      <nav className="bottom-nav">
        <a className="nav-item" onClick={() => onNavigate('home')}>
          <span className="material-symbols-outlined">home</span>
          <p>Home</p>
        </a>
        <a className="nav-item active">
          <span className="material-symbols-outlined">auto_awesome</span>
          <p>Analysis</p>
        </a>
        <a className="nav-item" href="#">
          <span className="material-symbols-outlined">palette</span>
          <p>Styles</p>
        </a>
        <a className="nav-item" href="#">
          <span className="material-symbols-outlined">person</span>
          <p>Profile</p>
        </a>
      </nav>
      <div className="nav-spacer" />
    </>
  )
}

function AnalysisHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="app-header">
      <button className="header-back" onClick={onBack}>
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
      <div className="header-brand">
        <div className="header-icon">
          <span className="material-symbols-outlined">face_6</span>
        </div>
        <span className="header-name">KisSkin</span>
      </div>
      <div className="header-spacer" />
    </header>
  )
}

function App() {
  const [page, setPage] = useState<Page>('home')
  const [photo, setPhoto] = useState<string | null>(null)
  const [gender, setGender] = useState<Gender>(null)
  const [skinType, setSkinType] = useState<SkinType>(null)
  const [loading, setLoading] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [report, setReport] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleNavigate = (target: Page) => {
    setPage(target)
    window.scrollTo(0, 0)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => setPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const isComplete = photo && gender && skinType

  const handleSubmit = async () => {
    if (!isComplete) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo, gender, skinType }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다.')
      }

      if (data.image) setResultImage(data.image)
      if (data.report) setReport(data.report)
    } catch (e) {
      setError(e instanceof Error ? e.message : '분석 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResultImage(null)
    setReport(null)
    setError(null)
  }

  const handleDownload = () => {
    if (!resultImage) return
    const link = document.createElement('a')
    link.href = resultImage
    link.download = 'kisskin-makeup.png'
    link.click()
  }

  // 홈 페이지
  if (page === 'home') {
    return <HomePage onNavigate={handleNavigate} />
  }

  // 로딩 화면
  if (loading) {
    return (
      <div className="analysis-page">
        <AnalysisHeader onBack={() => handleNavigate('home')} />
        <div className="analysis-content">
          <div className="page-title-area">
            <h1 className="page-title">AI 분석 중</h1>
            <p className="page-subtitle">잠시만 기다려주세요</p>
          </div>
          <div className="card loading-card">
            <div className="spinner" />
            <p className="loading-text">AI가 맞춤 메이크업을 분석하고 있어요...</p>
            <p className="loading-sub">약 30~60초 소요</p>
          </div>
        </div>
        <BottomNav onNavigate={handleNavigate} />
      </div>
    )
  }

  // 결과 화면
  if (resultImage || report) {
    return (
      <div className="analysis-page">
        <AnalysisHeader onBack={() => handleNavigate('home')} />
        <div className="analysis-content">
          <div className="page-title-area">
            <h1 className="page-title">분석 결과</h1>
            <p className="page-subtitle">나만의 퍼스널 메이크업</p>
          </div>
          <div className="card">
            <div className="report-meta">
              <span>{gender}</span>
              <span>{skinType}</span>
            </div>

            {resultImage && (
              <section className="result-image-section">
                <h3 className="label-text">메이크업 스타일 6종</h3>
                <img src={resultImage} alt="메이크업 스타일 6종" className="result-image" />
                <button className="download-btn" onClick={handleDownload}>
                  <span className="material-symbols-outlined">download</span>
                  이미지 저장하기
                </button>
              </section>
            )}

            {report && (
              <section className="report-section">
                <h3 className="label-text">맞춤 화장품 추천</h3>
                <div
                  className="report-content"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(report) }}
                />
              </section>
            )}

            <button className="cta-btn" onClick={handleReset}>
              <span className="material-symbols-outlined">refresh</span>
              다시 분석하기
            </button>
          </div>
        </div>
        <BottomNav onNavigate={handleNavigate} />
      </div>
    )
  }

  // 입력 화면 (분석 페이지)
  return (
    <div className="analysis-page">
      <AnalysisHeader onBack={() => handleNavigate('home')} />
      <div className="analysis-content">
        <div className="page-title-area">
          <h1 className="page-title">AI 메이크업 분석</h1>
          <p className="page-subtitle">사진과 정보를 입력하면 맞춤 스타일을 추천해드려요</p>
        </div>

        <div className="card">
          {/* 사진 업로드 */}
          <section className="form-section">
            <div className="form-label-row">
              <span className="material-symbols-outlined form-label-icon">add_a_photo</span>
              <h2 className="label-text">사진 업로드</h2>
            </div>
            <div
              className={`photo-upload ${photo ? 'has-photo' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {photo ? (
                <img src={photo} alt="업로드된 사진" className="photo-preview" />
              ) : (
                <div className="photo-placeholder">
                  <div className="upload-icon-wrap">
                    <span className="material-symbols-outlined">cloud_upload</span>
                  </div>
                  <span className="upload-text">클릭 또는 드래그하여<br />사진을 업로드하세요</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                hidden
              />
            </div>
            {photo && (
              <button className="photo-reset" onClick={(e) => { e.stopPropagation(); setPhoto(null) }}>
                <span className="material-symbols-outlined">swap_horiz</span>
                사진 변경
              </button>
            )}
          </section>

          {/* 성별 */}
          <section className="form-section">
            <div className="form-label-row">
              <span className="material-symbols-outlined form-label-icon">person</span>
              <h2 className="label-text">성별</h2>
            </div>
            <div className="button-group">
              {(['여성', '남성'] as const).map((g) => (
                <button
                  key={g}
                  className={`select-btn ${gender === g ? 'active' : ''}`}
                  onClick={() => setGender(g)}
                >
                  <span className="material-symbols-outlined select-btn-icon">
                    {g === '여성' ? 'female' : 'male'}
                  </span>
                  {g}
                </button>
              ))}
            </div>
          </section>

          {/* 피부 타입 */}
          <section className="form-section">
            <div className="form-label-row">
              <span className="material-symbols-outlined form-label-icon">dermatology</span>
              <h2 className="label-text">피부 타입</h2>
            </div>
            <div className="button-group skin-type">
              {(['건성', '지성', '중성', '복합성'] as const).map((type) => (
                <button
                  key={type}
                  className={`select-btn ${skinType === type ? 'active' : ''}`}
                  onClick={() => setSkinType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
            <button
              className={`select-btn skin-unknown ${skinType === '잘 모름' ? 'active' : ''}`}
              onClick={() => setSkinType('잘 모름')}
            >
              잘 모름 (AI가 자동 판별)
            </button>
          </section>

          {error && (
            <div className="error-msg">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <button
            className={`cta-btn ${!isComplete ? 'disabled' : ''}`}
            disabled={!isComplete}
            onClick={handleSubmit}
          >
            <span className="material-symbols-outlined">auto_fix_high</span>
            분석 시작하기
          </button>
        </div>
      </div>
      <BottomNav onNavigate={handleNavigate} />
    </div>
  )
}

export default App
