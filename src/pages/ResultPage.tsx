import { useState, useEffect } from 'react'
import { loadSharedResult, type SharedResultData } from '../lib/shareResult'
import { useI18n } from '../i18n/context'

interface ResultPageProps {
  onNavigate?: (page: 'home' | 'analysis' | 'terms' | 'privacy' | 'refund' | 'contact' | 'auth') => void
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
  const nav = (page: string) => {
    const paths: Record<string, string> = { home: '/', analysis: '/analysis', terms: '/terms', privacy: '/privacy', refund: '/refund', contact: '/contact', auth: '/auth', mypage: '/mypage' }
    if (onNavigate) onNavigate(page as 'home' | 'analysis' | 'terms' | 'privacy' | 'refund' | 'contact' | 'auth')
    else window.location.href = paths[page] || '/'
  }
  const { t, locale } = useI18n()
  const [data, setData] = useState<SharedResultData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cells, setCells] = useState<string[]>([])
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const id = window.location.pathname.split('/result/')[1]
    if (!id) {
      nav('home')
      return
    }
    loadSharedResult(id)
      .then(result => {
        if (!result) {
          setError('Result not found')
          setLoading(false)
          return
        }
        setData(result)

        // Slice grid image into 9 cells
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          try {
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
          } catch (e) {
            console.warn('[ResultPage] Canvas slicing failed (CORS), showing full grid:', e)
          }
          setLoading(false)
        }
        img.onerror = () => {
          console.warn('[ResultPage] Image load failed, trying without CORS')
          // CORS 실패 시 crossOrigin 없이 재시도 (캔버스 슬라이싱 불가하지만 전체 이미지 표시 가능)
          setLoading(false)
        }
        img.src = result.imageUrl
      })
      .catch(err => {
        console.error('[ResultPage] Load error:', err)
        setError('Failed to load result')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="analysis-page">
        <div className="top-bar">
          <button className="top-bar-back" onClick={() => nav('home')}>
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

  if (error || !data) {
    return (
      <div className="analysis-page">
        <div className="top-bar">
          <button className="top-bar-back" onClick={() => nav('home')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="top-bar-title">{t('result.title')}</h2>
        </div>
        <div className="analysis-body">
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#d1d5db' }}>error_outline</span>
            <p style={{ marginTop: 16, color: '#6b7280', fontSize: 14 }}>
              {error || 'Result not found'}
            </p>
            <button className="cta-btn" style={{ marginTop: 24, maxWidth: 240 }} onClick={() => nav('analysis')}>
              {t('common.startAnalysisLong')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const shareId = window.location.pathname.split('/result/')[1]
  const shareUrl = `https://kissinskin.net/result/${shareId}`

  const getShareText = () => {
    let reportObj = data.report
    if (typeof reportObj === 'string') {
      try { reportObj = JSON.parse(reportObj) } catch { reportObj = {} }
    }
    const a = reportObj?.analysis
    if (a) {
      const stylesList = data.styles.map((s, i) => `${i + 1}. ${s}`).join('\n')
      if (locale === 'ko') {
        return `💄 AI 메이크업 분석 리포트 - kissinskin\n\n✨ 피부 분석\n• 피부 타입: ${a.skinType}\n• 톤: ${a.tone}\n\n💡 맞춤 조언\n${a.advice}\n\n💄 메이크업 스타일 ${data.styles.length}종\n${stylesList}\n\n${shareUrl}`
      }
      return `💄 AI Makeup Analysis - kissinskin\n\n✨ Skin: ${a.skinType} | ${a.tone}\n💡 ${a.advice}\n\n💄 ${data.styles.length} Makeup Styles\n${stylesList}\n\n${shareUrl}`
    }
    return (locale === 'ko' ? 'AI가 추천한 나만의 메이크업 스타일' : 'My AI-recommended makeup styles') + '\n' + shareUrl
  }

  const handleSharePlatform = async (platform: string) => {
    const shareText = getShareText()
    const shareTitle = locale === 'ko' ? '💄 AI 메이크업 분석 - kissinskin' : '💄 AI Makeup Analysis - kissinskin'
    const encodedText = encodeURIComponent(shareText)
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(shareTitle)

    if (platform === 'native') {
      try { await navigator.share?.({ title: 'kissinskin', text: shareText, url: shareUrl }) }
      catch (e) { if (e instanceof Error && e.name !== 'AbortError') alert(t('error.shareFail')) }
    } else if (platform === 'copy') {
      try { await navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(() => setCopied(false), 2000) }
      catch { alert(t('error.copyFail')) }
    } else {
      const urls: Record<string, string> = {
        kakao: `https://story.kakao.com/share?url=${encodedUrl}&text=${encodedText}`,
        line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodedText}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
        email: `mailto:?subject=${encodedTitle}&body=${encodedText}`,
      }
      if (urls[platform]) {
        if (platform === 'email') window.location.href = urls[platform]
        else window.open(urls[platform], '_blank', 'width=600,height=400')
      }
    }
    setShowShareMenu(false)
  }

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
        <button className="top-bar-back" onClick={() => nav('home')}>
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
        {cells.length === 9 ? (
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
        ) : data.imageUrl && (
          <section className="result-section">
            <h3 className="section-heading">{t('result.makeupStyles')}</h3>
            <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
              <img src={data.imageUrl} alt="Makeup styles grid" style={{ width: '100%', display: 'block' }} />
            </div>
            {data.styles.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12, justifyContent: 'center' }}>
                {data.styles.map((style, i) => (
                  <span key={i} style={{ fontSize: 11, padding: '4px 10px', background: '#f3f4f6', borderRadius: 20, color: '#374151', fontWeight: 600 }}>{style}</span>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 추천 제품 */}
        {products.length > 0 && (
          <section className="report-section">
            <h3 className="section-heading">{t('result.productRec')}</h3>
            <div className="product-cards">
              {products.map((p: { category: string; name: string; brand: string; price: string; reason: string }, i: number) => {
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

        {/* Share + Try buttons */}
        <div className="action-btn-row" style={{ marginTop: 16 }}>
          <button className="download-btn share-btn" onClick={() => setShowShareMenu(true)}>
            <span className="material-symbols-outlined">share</span>{t('result.share')}
          </button>
        </div>

        {/* Share Modal */}
        {showShareMenu && (() => {
          return (
            <div className="share-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowShareMenu(false) }}>
              <div className="share-modal">
                <div className="share-modal-header"><h3>{t('result.share')}</h3><button className="share-modal-close" onClick={() => setShowShareMenu(false)}><span className="material-symbols-outlined">close</span></button></div>
                <div className="share-icons-row">
                  {'share' in navigator && (<button className="share-option" onClick={() => handleSharePlatform('native')}><div className="share-icon-circle" style={{ background: '#2a2d8a' }}><span className="material-symbols-outlined">phone_iphone</span></div>{t('result.defaultShare')}</button>)}
                  <button className="share-option" onClick={() => handleSharePlatform('copy')}><div className="share-icon-circle" style={{ background: '#8b5cf6' }}><span className="material-symbols-outlined">content_copy</span></div>{copied ? t('result.copied') : t('result.copyLink')}</button>
                  <button className="share-option" onClick={() => handleSharePlatform('kakao')}><div className="share-icon-circle" style={{ background: '#FFE812' }}><svg viewBox="0 0 24 24" width="24" height="24" fill="#3C1E1E"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.726 1.802 5.113 4.508 6.463-.144.509-.926 3.281-.962 3.503 0 0-.019.162.085.224.104.062.227.029.227.029.3-.042 3.472-2.275 4.022-2.652.37.052.748.079 1.12.079 5.523 0 10-3.463 10-7.646C22 6.463 17.523 3 12 3z"/></svg></div>KakaoTalk</button>
                  <button className="share-option" onClick={() => handleSharePlatform('line')}><div className="share-icon-circle" style={{ background: '#00B900' }}><svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg></div>LINE</button>
                  <button className="share-option" onClick={() => handleSharePlatform('whatsapp')}><div className="share-icon-circle" style={{ background: '#25D366' }}><svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></div>WhatsApp</button>
                  <button className="share-option" onClick={() => handleSharePlatform('facebook')}><div className="share-icon-circle" style={{ background: '#1877F2' }}><svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></div>Facebook</button>
                  <button className="share-option" onClick={() => handleSharePlatform('twitter')}><div className="share-icon-circle" style={{ background: '#000' }}><svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></div>X</button>
                  <button className="share-option" onClick={() => handleSharePlatform('pinterest')}><div className="share-icon-circle" style={{ background: '#E60023' }}><svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg></div>Pinterest</button>
                  <button className="share-option" onClick={() => handleSharePlatform('telegram')}><div className="share-icon-circle" style={{ background: '#0088cc' }}><svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></div>Telegram</button>
                  <button className="share-option" onClick={() => handleSharePlatform('linkedin')}><div className="share-icon-circle" style={{ background: '#0A66C2' }}><svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></div>LinkedIn</button>
                  <button className="share-option" onClick={() => handleSharePlatform('reddit')}><div className="share-icon-circle" style={{ background: '#FF4500' }}><svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.884-7.003 4.884-3.874 0-7.004-2.19-7.004-4.884 0-.18.015-.36.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 000-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z"/></svg></div>Reddit</button>
                  <button className="share-option" onClick={() => handleSharePlatform('email')}><div className="share-icon-circle" style={{ background: '#64748b' }}><span className="material-symbols-outlined">mail</span></div>Email</button>
                </div>
                <div className="share-link-bar">
                  <span>{shareUrl}</span>
                  <button className="share-link-copy-btn" onClick={() => { navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }).catch(() => {}) }}>
                    {copied ? t('result.copied') : t('result.copyLink')}
                  </button>
                </div>
              </div>
            </div>
          )
        })()}

        {/* CTA */}
        <div className="fixed-cta-spacer" />
        <div className="fixed-cta">
          <button className="cta-btn" onClick={() => nav('analysis')}>
            {t('common.startAnalysisLong')}
          </button>
        </div>
      </div>
    </div>
  )
}
