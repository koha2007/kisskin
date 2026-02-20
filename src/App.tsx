import { useState, useRef } from 'react'
import './App.css'
import HomePage from './HomePage'

type Gender = '여성' | '남성' | null
type SkinType = '건성' | '지성' | '중성' | '복합성' | '잘 모름' | null
type Page = 'home' | 'analysis'

const SKIN_LABELS: Record<string, string> = {
  '건성': 'Dry',
  '지성': 'Oily',
  '중성': 'Normal',
  '복합성': 'Combination',
  '잘 모름': 'Not sure',
}

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

  const progress = [photo, gender, skinType].filter(Boolean).length
  const progressPercent = Math.round((progress / 3) * 100)

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
        <div className="top-bar">
          <button className="top-bar-back" onClick={() => handleNavigate('home')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="top-bar-title">AI 분석 중</h2>
        </div>
        <div className="analysis-body">
          <div className="loading-card">
            <div className="spinner" />
            <p className="loading-text">AI가 맞춤 메이크업을 분석하고 있어요...</p>
            <p className="loading-sub">약 30~60초 소요</p>
          </div>
        </div>
      </div>
    )
  }

  // 결과 화면
  if (resultImage || report) {
    return (
      <div className="analysis-page">
        <div className="top-bar">
          <button className="top-bar-back" onClick={() => handleNavigate('home')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="top-bar-title">분석 결과</h2>
        </div>
        <div className="analysis-body">
          <div className="report-meta">
            <span>{gender}</span>
            <span>{skinType}</span>
          </div>

          {resultImage && (
            <section className="result-section">
              <h3 className="section-heading">메이크업 스타일 6종</h3>
              <img src={resultImage} alt="메이크업 스타일 6종" className="result-image" />
              <button className="download-btn" onClick={handleDownload}>
                <span className="material-symbols-outlined">download</span>
                이미지 저장하기
              </button>
            </section>
          )}

          {report && (
            <section className="report-section">
              <h3 className="section-heading">맞춤 화장품 추천</h3>
              <div
                className="report-content"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(report) }}
              />
            </section>
          )}

          {/* Fixed CTA */}
          <div className="fixed-cta-spacer" />
          <div className="fixed-cta">
            <button className="cta-btn" onClick={handleReset}>
              다시 분석하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 입력 화면
  return (
    <div className="analysis-page">
      {/* Top Bar */}
      <div className="top-bar">
        <button className="top-bar-back" onClick={() => handleNavigate('home')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="top-bar-title">프로필 설정</h2>
      </div>

      {/* Progress */}
      <div className="progress-area">
        <div className="progress-row">
          <p className="progress-label">프로필 설정</p>
          <p className="progress-count">{progress}/3</p>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="progress-hint">밝은 조명에서 촬영하면 AI 분석 정확도가 높아져요.</p>
      </div>

      <div className="analysis-body">
        {/* Photo Upload */}
        <div
          className={`upload-card ${photo ? 'has-photo' : ''}`}
          onClick={() => !photo && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {photo ? (
            <div className="upload-preview-wrap">
              <img src={photo} alt="업로드된 사진" className="upload-preview-img" />
              <button className="upload-change-btn" onClick={(e) => { e.stopPropagation(); setPhoto(null) }}>
                <span className="material-symbols-outlined">swap_horiz</span>
                사진 변경
              </button>
            </div>
          ) : (
            <>
              <div className="upload-icon-circle">
                <span className="material-symbols-outlined">add_a_photo</span>
              </div>
              <div className="upload-text-group">
                <p className="upload-title">탭하여 사진을 업로드하세요</p>
                <p className="upload-desc">얼굴이 잘 보이고 정면을 향한 사진이 가장 정확한 분석 결과를 제공합니다.</p>
              </div>
              <button className="upload-select-btn" onClick={() => fileInputRef.current?.click()}>
                사진 선택
              </button>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            hidden
          />
        </div>

        {/* Gender Selection */}
        <div className="form-group">
          <h3 className="form-heading">성별 선택</h3>
          <div className="gender-row">
            {(['여성', '남성'] as const).map((g) => (
              <label key={g} className="radio-card">
                <input
                  type="radio"
                  name="gender"
                  checked={gender === g}
                  onChange={() => setGender(g)}
                  hidden
                />
                <div className={`radio-card-inner ${gender === g ? 'checked' : ''}`}>
                  {g}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Skin Type Selection */}
        <div className="form-group">
          <h3 className="form-heading">피부 타입</h3>
          <div className="skin-grid">
            {(['건성', '지성', '중성', '복합성'] as const).map((type) => (
              <label key={type} className="radio-card">
                <input
                  type="radio"
                  name="skintype"
                  checked={skinType === type}
                  onChange={() => setSkinType(type)}
                  hidden
                />
                <div className={`skin-card-inner ${skinType === type ? 'checked' : ''}`}>
                  <span className="skin-kr">{type}</span>
                  <span className="skin-en">{SKIN_LABELS[type]}</span>
                </div>
              </label>
            ))}
            <label className="radio-card full-width">
              <input
                type="radio"
                name="skintype"
                checked={skinType === '잘 모름'}
                onChange={() => setSkinType('잘 모름')}
                hidden
              />
              <div className={`skin-card-inner ${skinType === '잘 모름' ? 'checked' : ''}`}>
                <span className="skin-kr">잘 모름</span>
                <span className="skin-en">Not sure</span>
              </div>
            </label>
          </div>
        </div>

        {/* Info Tip */}
        <div className="info-tip">
          <span className="material-symbols-outlined">info</span>
          <p>AI가 피부 톤과 얼굴 특징을 분석하여 가장 어울리는 메이크업 제품을 추천해드립니다.</p>
        </div>

        {error && (
          <div className="error-msg">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}
      </div>

      {/* Fixed CTA */}
      <div className="fixed-cta-spacer" />
      <div className="fixed-cta">
        <button
          className={`cta-btn ${!isComplete ? 'disabled' : ''}`}
          disabled={!isComplete}
          onClick={handleSubmit}
        >
          Analyze My Look
        </button>
      </div>
    </div>
  )
}

export default App
