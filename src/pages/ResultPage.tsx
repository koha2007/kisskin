import { useState, useEffect } from 'react'
import { loadSharedResult, type SharedResultData } from '../lib/shareResult'
import { useI18n } from '../i18n/context'

interface ResultPageProps {
  onNavigate: (page: 'home' | 'analysis' | 'terms' | 'privacy' | 'refund' | 'contact' | 'auth') => void
}

const CATEGORY_STYLE: Record<string, { icon: string; bg: string }> = {
  Skin: { icon: 'face', bg: '#f0abfc' },
  Base: { icon: 'palette', bg: '#fbbf24' },
  Eyes: { icon: 'visibility', bg: '#818cf8' },
  Lips: { icon: 'lip_touch', bg: '#fb7185' },
  Cheeks: { icon: 'brush', bg: '#f9a8d4' },
  Brow: { icon: 'edit', bg: '#a78bfa' },
  Primer: { icon: 'layers', bg: '#34d399' },
}

function buildBuyLink(brand: string, name: string): string {
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brand + ' ' + name)}`
}

export default function ResultPage({ onNavigate }: ResultPageProps) {
  const { t } = useI18n()
  const [data, setData] = useState<SharedResultData | null>(null)
  const [loading, setLoading] = useState(true)
  const [cells, setCells] = useState<string[]>([])

  useEffect(() => {
    const id = window.location.pathname.split('/result/')[1]
    if (!id) {
      onNavigate('home')
      return
    }
    loadSharedResult(id).then(result => {
      if (result) {
        setData(result)
        // Slice grid image into 9 cells
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const cellW = Math.floor(img.width / 3)
          const cellH = Math.floor(img.height / 3)
          const sliced: string[] = []
          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
              const cvs = document.createElement('canvas')
              cvs.width = cellW
              cvs.height = cellH
              const ctx = cvs.getContext('2d')!
              ctx.drawImage(img, col * cellW, row * cellH, cellW, cellH, 0, 0, cellW, cellH)
              sliced.push(cvs.toDataURL('image/jpeg', 0.85))
            }
          }
          setCells(sliced)
          setLoading(false)
        }
        img.onerror = () => setLoading(false)
        img.src = result.imageUrl
      } else {
        onNavigate('home')
      }
    })
  }, [])

  if (loading) {
    return (
      <div className="analysis-page">
        <div className="top-bar">
          <button className="top-bar-back" onClick={() => onNavigate('home')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="top-bar-title">{t('result.title')}</h2>
        </div>
        <div className="analysis-body">
          <div className="loading-card">
            <div className="spinner" />
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  // report가 여전히 문자열일 수 있으므로 방어 처리
  let reportObj = data.report
  if (typeof reportObj === 'string') {
    try { reportObj = JSON.parse(reportObj) } catch { reportObj = {} }
  }
  const a = reportObj?.analysis
  const products = reportObj?.products || []

  return (
    <div className="analysis-page">
      <div className="top-bar">
        <button className="top-bar-back" onClick={() => onNavigate('home')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="top-bar-title">{t('result.title')}</h2>
      </div>
      <div className="analysis-body">
        {/* AI 분석 리포트 */}
        {a && (
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
                  <h4>{t('result.skinType')}</h4>
                  <p>{a.skinTypeDetail}</p>
                </div>
              </div>
              <div className="analysis-card">
                <div className="analysis-card-icon tone-icon">
                  <span className="material-symbols-outlined">palette</span>
                </div>
                <div className="analysis-card-content">
                  <h4>{t('result.toneAnalysis')}</h4>
                  <p>{a.toneDetail}</p>
                </div>
              </div>
              <div className="analysis-advice">
                <span className="material-symbols-outlined">tips_and_updates</span>
                <p>{a.advice}</p>
              </div>
            </div>
          </section>
        )}

        {/* 메이크업 그리드 */}
        {cells.length === 9 && (
          <section className="result-section">
            <h3 className="section-heading">{t('result.makeupStyles')}</h3>
            <div className="makeup-grid">
              {data.styles.map((style, i) => (
                <div key={style} className="makeup-cell">
                  <img src={cells[i]} alt={style} className="makeup-cell-img" />
                  <p className="makeup-cell-label">{style}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 추천 제품 */}
        {products.length > 0 && (
          <section className="report-section">
            <h3 className="section-heading">{t('result.productRec')}</h3>
            <div className="product-cards">
              {products.map((p, i) => {
                const cat = CATEGORY_STYLE[p.category] || { icon: 'cosmetics', bg: '#94a3b8' }
                return (
                  <div key={i} className="product-card">
                    <div className="product-card-left">
                      <span className="product-category-badge" style={{ backgroundColor: cat.bg }}>
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
                      {t('result.buyNow')}
                    </a>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="fixed-cta-spacer" />
        <div className="fixed-cta">
          <button className="cta-btn" onClick={() => onNavigate('analysis')}>
            {t('common.startAnalysisLong')}
          </button>
        </div>
      </div>
    </div>
  )
}
