import { useState, useRef } from 'react'
import './App.css'

type Gender = '여성' | '남성' | null
type SkinType = '건성' | '지성' | '중성' | '복합성' | null

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
  const [photo, setPhoto] = useState<string | null>(null)
  const [gender, setGender] = useState<Gender>(null)
  const [skinType, setSkinType] = useState<SkinType>(null)
  const [loading, setLoading] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [report, setReport] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // 로딩 화면
  if (loading) {
    return (
      <div className="container">
        <header className="header">
          <h1 className="title">KisSkin</h1>
          <p className="subtitle">나만의 퍼스널 메이크업 분석</p>
        </header>
        <div className="card loading-card">
          <div className="spinner" />
          <p className="loading-text">AI가 맞춤 메이크업을 분석하고 있어요...</p>
          <p className="loading-sub">약 30~60초 소요</p>
        </div>
      </div>
    )
  }

  // 결과 화면
  if (resultImage || report) {
    return (
      <div className="container">
        <header className="header">
          <h1 className="title">KisSkin</h1>
          <p className="subtitle">나만의 퍼스널 메이크업 분석</p>
        </header>
        <div className="card report-card">
          <div className="report-meta">
            <span>{gender}</span>
            <span>{skinType}</span>
          </div>

          {resultImage && (
            <section className="result-image-section">
              <h3 className="section-title">메이크업 스타일 6종</h3>
              <img src={resultImage} alt="메이크업 스타일 6종" className="result-image full" />
              <button className="download-btn" onClick={handleDownload}>
                이미지 저장하기
              </button>
            </section>
          )}

          {report && (
            <section className="report-section">
              <h3 className="section-title">맞춤 화장품 추천</h3>
              <div
                className="report-content"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(report) }}
              />
            </section>
          )}

          <button className="submit-btn ready" onClick={handleReset}>
            다시 분석하기
          </button>
        </div>
      </div>
    )
  }

  // 입력 화면
  return (
    <div className="container">
      <header className="header">
        <h1 className="title">KisSkin</h1>
        <p className="subtitle">나만의 퍼스널 메이크업 분석</p>
      </header>

      <div className="card">
        <section className="section">
          <h2 className="section-title">사진 업로드</h2>
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
                <span className="upload-icon">+</span>
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
              사진 변경
            </button>
          )}
        </section>

        <section className="section">
          <h2 className="section-title">성별</h2>
          <div className="button-group">
            {(['여성', '남성'] as const).map((g) => (
              <button
                key={g}
                className={`select-btn ${gender === g ? 'active' : ''}`}
                onClick={() => setGender(g)}
              >
                {g === '여성' ? '👩' : '👨'} {g}
              </button>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">피부 타입</h2>
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
        </section>

        {error && <p className="error-msg">{error}</p>}

        <button
          className={`submit-btn ${isComplete ? 'ready' : ''}`}
          disabled={!isComplete}
          onClick={handleSubmit}
        >
          분석 시작하기
        </button>
      </div>
    </div>
  )
}

export default App
