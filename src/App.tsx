import { useState, useRef } from 'react'
import './App.css'
import HomePage from './HomePage'

type Gender = '여성' | '남성' | null
type SkinType = '건성' | '지성' | '중성' | '복합성' | '잘 모름' | null
type Page = 'home' | 'analysis'

const MAKEUP_STYLES = [
  'Natural Glow',
  'Cloud Skin',
  'Blood Lip',
  'Maximalist Eye',
  'Metallic Eye',
  'Bold Lip',
  'Blush Draping & Layering',
  'Grunge Makeup',
  'K-pop Idol Makeup',
]


const SKIN_DATA: Record<string, { en: string; icon: string; desc: string }> = {
  '지성': { en: 'Oily', icon: 'water_drop', desc: '피지 분비가 많은 피부' },
  '건성': { en: 'Dry', icon: 'dry_cleaning', desc: '수분이 부족한 피부' },
  '복합성': { en: 'Combination', icon: 'contrast', desc: 'T존 유분, U존 건조' },
  '중성': { en: 'Normal', icon: 'verified_user', desc: '균형 잡힌 피부' },
  '잘 모름': { en: 'Not sure', icon: 'help', desc: 'AI가 자동 판별' },
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

interface ProductRecommendation {
  category: string
  name: string
  brand: string
  price: string
  reason: string
}

interface AnalysisDetail {
  gender: string
  skinType: string
  skinTypeDetail: string
  tone: string
  toneDetail: string
  advice: string
}

interface StructuredReport {
  analysis?: AnalysisDetail
  summary?: string
  products: ProductRecommendation[]
}

function parseReport(reportStr: string): StructuredReport | null {
  try {
    const parsed = JSON.parse(reportStr)
    if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
      return parsed as StructuredReport
    }
  } catch { /* not JSON */ }
  return null
}

function buildBuyLink(brand: string, name: string): string {
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brand + ' ' + name)}`
}

const CATEGORY_STYLE: Record<string, { icon: string; bg: string }> = {
  Skin: { icon: 'face', bg: '#f0abfc' },
  Base: { icon: 'palette', bg: '#fbbf24' },
  Eyes: { icon: 'visibility', bg: '#818cf8' },
  Lips: { icon: 'lip_touch', bg: '#fb7185' },
  Cheeks: { icon: 'brush', bg: '#f9a8d4' },
}

// 원본 사진을 3x3 타일 그리드로 만들어 AI에게 전달 (얼굴 위치 고정)
function createTiledGrid(photoUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const GRID = 1024
      const CELL = Math.floor(GRID / 3)
      const cvs = document.createElement('canvas')
      cvs.width = GRID
      cvs.height = GRID
      const ctx = cvs.getContext('2d')
      if (!ctx) { reject(new Error('Canvas not supported')); return }

      // 원본을 정사각형으로 크롭 (상단 유지 - 셀피 얼굴 보존)
      const w = img.naturalWidth
      const h = img.naturalHeight
      const cropSize = Math.min(w, h)
      const sx = Math.floor((w - cropSize) / 2)
      const sy = h > w ? Math.floor((h - cropSize) * 0.2) : Math.floor((h - cropSize) / 2)

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          ctx.drawImage(img, sx, sy, cropSize, cropSize, col * CELL, row * CELL, CELL, CELL)
        }
      }
      resolve(cvs.toDataURL('image/jpeg', 0.92))
    }
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = photoUrl
  })
}

function App() {
  const [page, setPage] = useState<Page>('home')
  const [photo, setPhoto] = useState<string | null>(null)
  const [gender, setGender] = useState<Gender>(null)
  const [skinType, setSkinType] = useState<SkinType>(null)
  const [loading, setLoading] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [resultCells, setResultCells] = useState<string[]>([])
  const [report, setReport] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleNavigate = (target: Page) => {
    setPage(target)
    window.scrollTo(0, 0)
  }

  const loadPhoto = (dataUrl: string) => {
    const img = new Image()
    img.onload = () => {
      // 모바일 카메라 사진 리사이즈 & 압축 (EXIF 방향도 자동 보정)
      const MAX = 1280
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w > MAX || h > MAX) {
        if (w > h) {
          h = Math.round(h * (MAX / w))
          w = MAX
        } else {
          w = Math.round(w * (MAX / h))
          h = MAX
        }
      }
      const cvs = document.createElement('canvas')
      cvs.width = w
      cvs.height = h
      const ctx = cvs.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0, w, h)
      const compressed = cvs.toDataURL('image/jpeg', 0.85)
      setPhoto(compressed)
    }
    img.onerror = () => {
      setError('이미지를 불러올 수 없습니다. 다른 사진을 선택해주세요.')
    }
    img.src = dataUrl
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드할 수 있습니다.')
        return
      }
      setError(null)
      const reader = new FileReader()
      reader.onloadend = () => loadPhoto(reader.result as string)
      reader.onerror = () => setError('파일을 읽을 수 없습니다. 다시 시도해주세요.')
      reader.readAsDataURL(file)
    }
    // Reset input so same file/camera can be re-selected
    e.target.value = ''
  }

  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => loadPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const isComplete = photo && gender && skinType

  const handleSubmit = async () => {
    if (!isComplete) return

    setLoading(true)
    setError(null)

    try {
      // 원본 사진을 3x3 타일 그리드로 만들어서 전송
      const gridPhoto = await createTiledGrid(photo!)

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo, gridPhoto, gender, skinType }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다.')
      }

      if (data.image) {
        setResultImage(data.image)
        const img = new Image()
        img.onload = () => {
          const cellW = Math.floor(img.width / 3)
          const cellH = Math.floor(img.height / 3)
          const cells: string[] = []
          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
              const cvs = document.createElement('canvas')
              cvs.width = cellW
              cvs.height = cellH
              const ctx = cvs.getContext('2d')!
              ctx.drawImage(img, col * cellW, row * cellH, cellW, cellH, 0, 0, cellW, cellH)
              cells.push(cvs.toDataURL('image/png'))
            }
          }
          setResultCells(cells)
        }
        img.src = data.image
      }
      if (data.report) setReport(data.report)
    } catch (e) {
      setError(e instanceof Error ? e.message : '분석 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResultImage(null)
    setResultCells([])
    setReport(null)
    setError(null)
  }

  const handleDownload = () => {
    if (!resultImage) return

    const img = new Image()
    img.onload = () => {
      const srcCellW = img.width / 3
      const srcCellH = img.height / 3

      const gap = Math.round(srcCellW * 0.035)
      const pad = Math.round(srcCellW * 0.04)
      const labelH = Math.round(srcCellH * 0.13)
      const radius = Math.round(srcCellW * 0.045)
      const fontSize = Math.max(14, Math.round(srcCellW * 0.065))

      const cellW = srcCellW
      const cellH = srcCellH + labelH
      const totalW = pad * 2 + cellW * 3 + gap * 2
      const totalH = pad * 2 + cellH * 3 + gap * 2

      const canvas = document.createElement('canvas')
      canvas.width = totalW
      canvas.height = totalH
      const ctx = canvas.getContext('2d')!

      // Background
      ctx.fillStyle = '#f8f6f6'
      ctx.fillRect(0, 0, totalW, totalH)

      const roundRect = (x: number, y: number, w: number, h: number, r: number[]) => {
        const [tl, tr, br, bl] = r
        ctx.beginPath()
        ctx.moveTo(x + tl, y)
        ctx.lineTo(x + w - tr, y)
        ctx.arcTo(x + w, y, x + w, y + tr, tr)
        ctx.lineTo(x + w, y + h - br)
        ctx.arcTo(x + w, y + h, x + w - br, y + h, br)
        ctx.lineTo(x + bl, y + h)
        ctx.arcTo(x, y + h, x, y + h - bl, bl)
        ctx.lineTo(x, y + tl)
        ctx.arcTo(x, y, x + tl, y, tl)
        ctx.closePath()
      }

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const i = row * 3 + col
          const sx = col * srcCellW
          const sy = row * srcCellH
          const dx = pad + col * (cellW + gap)
          const dy = pad + row * (cellH + gap)

          // Cell background (white, fully rounded)
          ctx.save()
          roundRect(dx, dy, cellW, cellH, [radius, radius, radius, radius])
          ctx.fillStyle = '#ffffff'
          ctx.shadowColor = 'rgba(0,0,0,0.08)'
          ctx.shadowBlur = 6
          ctx.shadowOffsetY = 1
          ctx.fill()
          ctx.restore()

          // Image with rounded top corners
          ctx.save()
          roundRect(dx, dy, cellW, srcCellH, [radius, radius, 0, 0])
          ctx.clip()
          ctx.drawImage(img, sx, sy, srcCellW, srcCellH, dx, dy, cellW, srcCellH)
          ctx.restore()

          // Label text
          ctx.fillStyle = '#0f172a'
          ctx.font = `700 ${fontSize}px Manrope, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(MAKEUP_STYLES[i], dx + cellW / 2, dy + srcCellH + labelH / 2)
        }
      }

      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = 'kisskin-makeup.png'
      link.click()
    }
    img.src = resultImage
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
          {/* AI 분석 리포트 */}
          {report && (() => {
            const structured = parseReport(report)
            const a = structured?.analysis
            if (a) {
              return (
                <section className="ai-analysis-section">
                  <div className="ai-analysis-header">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    <h3>AI Skin Analysis</h3>
                  </div>

                  <div className="analysis-badges">
                    <span className="analysis-badge">{a.gender}</span>
                    <span className="analysis-badge">{a.skinType}</span>
                    <span className="analysis-badge tone">{a.tone}</span>
                  </div>

                  <div className="analysis-cards">
                    <div className="analysis-card">
                      <div className="analysis-card-icon">
                        <span className="material-symbols-outlined">dermatology</span>
                      </div>
                      <div className="analysis-card-content">
                        <h4>피부 타입</h4>
                        <p>{a.skinTypeDetail}</p>
                      </div>
                    </div>

                    <div className="analysis-card">
                      <div className="analysis-card-icon tone-icon">
                        <span className="material-symbols-outlined">palette</span>
                      </div>
                      <div className="analysis-card-content">
                        <h4>톤 분석</h4>
                        <p>{a.toneDetail}</p>
                      </div>
                    </div>

                    <div className="analysis-advice">
                      <span className="material-symbols-outlined">tips_and_updates</span>
                      <p>{a.advice}</p>
                    </div>
                  </div>
                </section>
              )
            }
            return null
          })()}

          {/* 메이크업 그리드 */}
          {resultCells.length === 9 && (
            <section className="result-section">
              <h3 className="section-heading">메이크업 스타일 9종</h3>
              <div className="makeup-grid">
                {MAKEUP_STYLES.map((style, i) => (
                  <div key={style} className="makeup-cell">
                    <img src={resultCells[i]} alt={style} className="makeup-cell-img" />
                    <p className="makeup-cell-label">{style}</p>
                  </div>
                ))}
              </div>
              <button className="download-btn" onClick={handleDownload}>
                <span className="material-symbols-outlined">download</span>
                이미지 저장하기
              </button>
            </section>
          )}

          {/* 추천 제품 */}
          {report && (() => {
            const structured = parseReport(report)
            if (structured) {
              return (
                <section className="report-section">
                  <h3 className="section-heading">맞춤 화장품 추천</h3>
                  <div className="product-cards">
                    {structured.products.map((p, i) => {
                      const cat = CATEGORY_STYLE[p.category] || { icon: 'cosmetics', bg: '#94a3b8' }
                      return (
                        <div key={i} className="product-card">
                          <div className="product-card-left">
                            <span
                              className="product-category-badge"
                              style={{ backgroundColor: cat.bg }}
                            >
                              <span className="material-symbols-outlined">{cat.icon}</span>
                            </span>
                          </div>
                          <div className="product-card-body">
                            <p className="product-category-label">{p.category}</p>
                            <p className="product-name">{p.name}</p>
                            <p className="product-brand-price">{p.brand} · {p.price}</p>
                            <p className="product-reason">{p.reason}</p>
                          </div>
                          <a
                            className="product-buy-btn"
                            href={buildBuyLink(p.brand, p.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Buy Now
                          </a>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            }
            return (
              <section className="report-section">
                <h3 className="section-heading">맞춤 화장품 추천</h3>
                <div
                  className="report-content"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(report) }}
                />
              </section>
            )
          })()}

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
        <h2 className="top-bar-title">Profile Setup</h2>
      </div>

      <div className="analysis-body setup-body">
        {/* Upload Section */}
        <section className="upload-section">
          <h3 className="upload-heading">사진을 업로드하세요</h3>
          <p className="upload-sub">밝은 조명에서 촬영하면 AI 분석 정확도가 높아져요</p>

          <div
            className={`avatar-upload ${dragging ? 'dragging' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div className={`avatar-circle ${photo ? 'has-photo' : ''} ${dragging ? 'dragging' : ''}`}>
              {photo ? (
                <>
                  <img src={photo} alt="업로드된 사진" className="avatar-img" />
                  <div className="avatar-hover">
                    <span className="material-symbols-outlined">photo_camera</span>
                    <span>사진 변경</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined avatar-placeholder-icon">add_a_photo</span>
                  <span className="avatar-placeholder-text">사진 선택</span>
                </>
              )}
            </div>
            {photo && (
              <div className="avatar-edit-badge">
                <span className="material-symbols-outlined">edit</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ position: 'absolute', width: 0, height: 0, opacity: 0, overflow: 'hidden' }}
          />
        </section>

        {/* Gender Selection */}
        <section className="form-group">
          <h4 className="section-label">성별</h4>
          <div className="gender-row">
            {(['여성', '남성'] as const).map((g) => (
              <button
                key={g}
                className={`gender-btn ${gender === g ? 'selected' : ''}`}
                onClick={() => setGender(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </section>

        {/* Skin Type Selection */}
        <section className="form-group">
          <div className="section-label-row">
            <h4 className="section-label">피부 타입</h4>
            <span className="section-label-hint">하나 선택</span>
          </div>
          <div className="skin-grid">
            {(['지성', '건성', '복합성', '중성'] as const).map((type) => (
              <button
                key={type}
                className={`skin-card ${skinType === type ? 'selected' : ''}`}
                onClick={() => setSkinType(type)}
              >
                <div className="skin-card-top">
                  <span className="material-symbols-outlined skin-card-icon">{SKIN_DATA[type].icon}</span>
                  {skinType === type && <span className="material-symbols-outlined skin-card-check">check_circle</span>}
                </div>
                <span className="skin-card-name">{type}</span>
                <span className="skin-card-desc">{SKIN_DATA[type].desc}</span>
              </button>
            ))}
            <button
              className={`skin-card full-width horizontal ${skinType === '잘 모름' ? 'selected' : ''}`}
              onClick={() => setSkinType('잘 모름')}
            >
              <div className="skin-card-h-left">
                <span className="material-symbols-outlined skin-card-icon">{SKIN_DATA['잘 모름'].icon}</span>
                <div className="skin-card-h-text">
                  <span className="skin-card-name">잘 모름</span>
                  <span className="skin-card-desc">{SKIN_DATA['잘 모름'].desc}</span>
                </div>
              </div>
              {skinType === '잘 모름' ? (
                <span className="material-symbols-outlined skin-card-check">check_circle</span>
              ) : (
                <span className="material-symbols-outlined skin-card-chevron">chevron_right</span>
              )}
            </button>
          </div>
        </section>

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
      <div className="fixed-cta gradient">
        <button
          className={`cta-btn ${!isComplete ? 'disabled' : ''}`}
          disabled={!isComplete}
          onClick={handleSubmit}
        >
          <span>Generate My Looks</span>
          <span className="material-symbols-outlined">auto_awesome</span>
        </button>
      </div>
    </div>
  )
}

export default App
