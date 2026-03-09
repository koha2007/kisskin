import { useState, useRef, useEffect } from 'react'
import './App.css'
import HomePage from './HomePage'
import Terms from './pages/terms'
import Refund from './pages/refund'
import Privacy from './pages/privacy'
import { useI18n } from './i18n/context'

declare global {
  interface Window {
    Polar?: {
      EmbedCheckout: {
        create: (url: string, options?: { theme?: string }) => Promise<{
          addEventListener: (event: string, callback: (e: Event) => void, options?: { once?: boolean }) => void
          close: () => void
        }>
      }
    }
  }
}

type Gender = 'female' | 'male' | null
type SkinType = 'oily' | 'dry' | 'combination' | 'normal' | 'not_sure' | null
type Page = 'home' | 'analysis' | 'terms' | 'privacy' | 'refund'

const FEMALE_MAKEUP_STYLES = [
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

const MALE_MAKEUP_STYLES = [
  'No-Makeup Makeup',
  'Skincare Hybrid Base',
  'Blurred Lip',
  'Grunge / Smoky Eye',
  'Monochrome',
  'Utility Makeup',
  'Blue & Color Point Eye',
  'Vampire Romantic',
  'K-pop Idol Makeup',
]


const GENDER_MAP: Record<string, string> = { female: '여성', male: '남성' }
const SKIN_MAP: Record<string, string> = {
  oily: '지성', dry: '건성', combination: '복합성', normal: '중성', not_sure: '잘 모름'
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

// 원본 사진 비율을 유지하며 3x3 타일 그리드 생성
function createTiledGrid(photoUrl: string): Promise<{ gridPhoto: string; gridSize: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      const ratio = w / h

      // 원본 비율에 맞는 그리드 사이즈 선택 (OpenAI 지원 사이즈)
      let gridW: number, gridH: number, gridSize: string
      if (ratio < 0.85) {
        gridW = 1024; gridH = 1536; gridSize = '1024x1536' // 세로 사진
      } else if (ratio > 1.15) {
        gridW = 1536; gridH = 1024; gridSize = '1536x1024' // 가로 사진
      } else {
        gridW = 1024; gridH = 1024; gridSize = '1024x1024' // 정사각형
      }

      const cellW = Math.floor(gridW / 3)
      const cellH = Math.floor(gridH / 3)
      const cellRatio = cellW / cellH

      const cvs = document.createElement('canvas')
      cvs.width = gridW
      cvs.height = gridH
      const ctx = cvs.getContext('2d')
      if (!ctx) { reject(new Error('Canvas not supported')); return }

      // 원본 사진을 셀 비율에 맞게 크롭 (중앙 기준, 세로는 상단 바이어스)
      let sx: number, sy: number, sw: number, sh: number
      if (ratio > cellRatio) {
        // 사진이 셀보다 가로로 넓음 → 좌우 크롭
        sh = h; sw = Math.floor(h * cellRatio)
        sx = Math.floor((w - sw) / 2); sy = 0
      } else {
        // 사진이 셀보다 세로로 김 → 하단 크롭 (얼굴 상단 유지)
        sw = w; sh = Math.floor(w / cellRatio)
        sx = 0; sy = Math.floor((h - sh) * 0.15)
      }

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          ctx.drawImage(img, sx, sy, sw, sh, col * cellW, row * cellH, cellW, cellH)
        }
      }
      resolve({ gridPhoto: cvs.toDataURL('image/png'), gridSize })
    }
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = photoUrl
  })
}

function App() {
  const { t, locale, setLocale } = useI18n()

  const SKIN_DATA: Record<string, { icon: string; desc: string }> = {
    oily: { icon: 'water_drop', desc: t('analysis.oilyDesc') },
    dry: { icon: 'dry_cleaning', desc: t('analysis.dryDesc') },
    combination: { icon: 'contrast', desc: t('analysis.combinationDesc') },
    normal: { icon: 'verified_user', desc: t('analysis.normalDesc') },
    not_sure: { icon: 'help', desc: t('analysis.notSureDesc') },
  }

  const SKIN_LABELS: Record<string, string> = {
    oily: t('analysis.oily'),
    dry: t('analysis.dry'),
    combination: t('analysis.combination'),
    normal: t('analysis.normal'),
    not_sure: t('analysis.notSure'),
  }

  const [page, setPage] = useState<Page>('home')
  const [photo, setPhoto] = useState<string | null>(null)
  const [gender, setGender] = useState<Gender>(null)
  const [skinType, setSkinType] = useState<SkinType>(null)
  const [loading, setLoading] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [resultCells, setResultCells] = useState<string[]>([])
  const [report, setReport] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [customerEmail, setCustomerEmail] = useState<string | null>(null)
  const [checkoutIdRef, setCheckoutIdRef] = useState<string | null>(null)
  const [refundFailed, setRefundFailed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const shareMenuRef = useRef<HTMLDivElement>(null)

  const handleNavigate = (target: Page) => {
    setPage(target)
    window.scrollTo(0, 0)
  }

  const loadPhoto = (dataUrl: string) => {
    const img = new Image()
    img.onload = () => {
      // 모바일 카메라 사진 리사이즈 & 압축 (EXIF 방향도 자동 보정)
      const MAX = 1280
      const MAX_BYTES = 1.5 * 1024 * 1024 // 1.5MB 이하로 압축
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

      // 반복 압축: 용량이 MAX_BYTES 이하가 될 때까지 품질을 낮춤
      let quality = 0.85
      let compressed = cvs.toDataURL('image/jpeg', quality)
      while (compressed.length * 0.75 > MAX_BYTES && quality > 0.3) {
        quality -= 0.1
        compressed = cvs.toDataURL('image/jpeg', quality)
      }
      // 그래도 크면 해상도 추가 축소
      if (compressed.length * 0.75 > MAX_BYTES) {
        const scale = 0.7
        cvs.width = Math.round(w * scale)
        cvs.height = Math.round(h * scale)
        ctx.drawImage(img, 0, 0, cvs.width, cvs.height)
        compressed = cvs.toDataURL('image/jpeg', 0.7)
      }
      setPhoto(compressed)
    }
    img.onerror = () => {
      setError(t('error.imageLoad'))
    }
    img.src = dataUrl
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError(t('error.imageOnly'))
        return
      }
      setError(null)
      const reader = new FileReader()
      reader.onloadend = () => loadPhoto(reader.result as string)
      reader.onerror = () => setError(t('error.fileRead'))
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

  const activeStyles = gender === 'male' ? MALE_MAKEUP_STYLES : FEMALE_MAKEUP_STYLES

  const isComplete = photo && gender && skinType

  const autoRefund = async (reason: string): Promise<boolean> => {
    if (!checkoutIdRef) return false
    try {
      const res = await fetch('/api/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkoutId: checkoutIdRef,
          reason: 'service_disruption',
          comment: reason,
        }),
      })
      if (!res.ok) return false
      const data = await res.json()
      return data.refundId ? true : false
    } catch {
      return false
    }
  }

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)

    try {
      const { gridPhoto, gridSize } = await createTiledGrid(photo!)

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo, gridPhoto, gridSize, gender: GENDER_MAP[gender!], skinType: SKIN_MAP[skinType!], lang: locale }),
      })

      // 응답이 JSON이 아닌 경우 (Cloudflare HTML 에러 페이지 등) 처리
      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const text = await res.text()
        console.error('[kissinskin] Non-JSON response:', res.status, text.slice(0, 200))
        throw new Error(t('error.analysisError'))
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || t('error.analysisError'))
      }

      // 이미지 또는 리포트가 없으면 실패 → 자동 환불
      const failAndRefund = async (reason: string, userMsg: string) => {
        const refunded = await autoRefund(reason)
        if (refunded) {
          throw new Error(userMsg + ' ' + t('error.autoRefund'))
        } else {
          setRefundFailed(true)
          throw new Error(userMsg)
        }
      }

      if (!data.image && !data.report) {
        await failAndRefund('AI analysis failed (no image and no text)', t('error.bothGenFailed'))
      }
      if (!data.image) {
        await failAndRefund('AI image generation failed', t('error.imageGenFailed'))
      }
      if (!data.report) {
        await failAndRefund('AI report generation failed', t('error.reportGenFailed'))
      }

      setResultImage(data.image)
      setReport(data.report)

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
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('error.analysisError')
      // General error (auto-refund not yet attempted) → try refund
      if (!msg.includes(t('error.autoRefund')) && !refundFailed) {
        const refunded = await autoRefund(`Analysis error: ${msg}`)
        if (refunded) {
          setError(msg + ' ' + t('error.autoRefund'))
        } else {
          setRefundFailed(true)
          setError(msg)
        }
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  const handleSubmit = async () => {
    if (!isComplete) return

    setError(null)

    try {
      // 모바일: 분석 데이터를 저장해두고 결제 후 복원 (임베디드 실패 시 리다이렉트 대비)
      if (isMobile) {
        sessionStorage.setItem('kisskin_pending', JSON.stringify({ photo, gender, skinType, locale }))
      }

      // 1. Polar 체크아웃 세션 생성
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: isMobile }),
      })

      const checkoutData = await checkoutRes.json()

      if (!checkoutRes.ok) {
        throw new Error(checkoutData.error || t('error.checkoutCreate'))
      }

      // 임베디드 체크아웃 모달 (PC + 모바일 공통)
      if (!window.Polar?.EmbedCheckout) {
        if (isMobile) {
          // 임베디드 SDK 로드 실패 → 리다이렉트용 세션 새로 생성
          const redirectRes = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: true, redirect: true }),
          })
          const redirectData = await redirectRes.json()
          if (redirectRes.ok) {
            window.location.href = redirectData.url
          } else {
            throw new Error(redirectData.error || t('error.checkoutCreate'))
          }
          return
        }
        throw new Error(t('error.checkoutModule'))
      }

      // checkout ID는 API 응답에서 직접 사용 (URL 파싱 불필요)
      const embeddedCheckoutId = checkoutData.id

      let paid = false
      const embed = await window.Polar.EmbedCheckout.create(checkoutData.url, { theme: 'light' })

      embed.addEventListener('success', async () => {
        paid = true
        embed.close()
        if (isMobile) {
          sessionStorage.removeItem('kisskin_pending')
        }
        setCheckoutIdRef(embeddedCheckoutId)
        try {
          const vRes = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checkoutId: embeddedCheckoutId }),
          })
          const vData = await vRes.json()
          if (vData.customerEmail) {
            setCustomerEmail(vData.customerEmail)
          }
        } catch { /* 이메일 획득 실패해도 분석은 진행 */ }
        runAnalysis()
      })

      embed.addEventListener('close', () => {
        if (!paid) {
          // 결제 완료 없이 닫힘
        }
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error.checkoutError'))
    }
  }

  // 모바일 결제 완료 후 복귀 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const checkoutId = params.get('checkout_id')
    if (!checkoutId) return

    // URL에서 checkout_id 제거
    window.history.replaceState({}, '', window.location.pathname)

    // 저장된 분석 데이터 복원
    const pending = sessionStorage.getItem('kisskin_pending')
    if (!pending) return
    sessionStorage.removeItem('kisskin_pending')

    try {
      const data = JSON.parse(pending)
      setPhoto(data.photo)
      setGender(data.gender)
      setSkinType(data.skinType)
      if (data.locale) setLocale(data.locale)
      setPage('analysis')

      // 결제 확인 후 이메일 획득 및 분석 시작
      setCheckoutIdRef(checkoutId)
      fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutId }),
      })
        .then(res => res.json())
        .then(result => {
          if (result.customerEmail) {
            setCustomerEmail(result.customerEmail)
          }
          if (result.status === 'succeeded' || result.status === 'confirmed') {
            setTimeout(() => runAnalysis(), 100)
          } else {
            setError(t('error.paymentIncomplete'))
          }
        })
        .catch(() => {
          setError(t('error.verifyError'))
        })
    } catch {
      // 복원 실패
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = () => {
    setResultImage(null)
    setResultCells([])
    setReport(null)
    setError(null)
  }

  // 공유 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShowShareMenu(false)
      }
    }
    if (showShareMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showShareMenu])

  const handleShare = async (platform: string) => {
    if (!resultImage) return

    try {
      // 다운로드용 캔버스와 동일한 이미지 생성
      const img = new Image()
      img.src = resultImage
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject })

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

          ctx.save()
          roundRect(dx, dy, cellW, cellH, [radius, radius, radius, radius])
          ctx.fillStyle = '#ffffff'
          ctx.shadowColor = 'rgba(0,0,0,0.08)'
          ctx.shadowBlur = 6
          ctx.shadowOffsetY = 1
          ctx.fill()
          ctx.restore()

          ctx.save()
          roundRect(dx, dy, cellW, srcCellH, [radius, radius, 0, 0])
          ctx.clip()
          ctx.drawImage(img, sx, sy, srcCellW, srcCellH, dx, dy, cellW, srcCellH)
          ctx.restore()

          ctx.fillStyle = '#0f172a'
          ctx.font = `700 ${fontSize}px Manrope, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(activeStyles[i], dx + cellW / 2, dy + srcCellH + labelH / 2)
        }
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9)
      )

      if (!blob) {
        alert(t('error.shareImageFail'))
        return
      }

      const file = new File([blob], 'kissinskin-makeup.jpg', { type: 'image/jpeg' })
      const imageUrl = URL.createObjectURL(blob)
      const shareUrl = 'https://kissinskin.net'
      const shareText = locale === 'ko' ? 'AI가 추천한 나만의 메이크업 스타일 9종' : 'My 9 AI-recommended makeup styles'

      if (platform === 'native') {
        try {
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ title: 'kissinskin', text: shareText, files: [file] })
          } else {
            await navigator.share({ title: 'kissinskin', text: shareText + '\n' + shareUrl })
          }
        } catch (e) {
          if (e instanceof Error && e.name !== 'AbortError') {
            alert(t('error.shareFail'))
          }
        }
      } else if (platform === 'copy') {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          alert(t('result.copied'))
        } catch {
          try {
            await navigator.clipboard.writeText(shareUrl)
            alert(t('error.copyLinkDone'))
          } catch {
            alert(t('error.copyFail'))
          }
        }
      } else if (platform === 'kakao') {
        window.open(`https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank')
      } else if (platform === 'x') {
        window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank')
      } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank')
      } else if (platform === 'whatsapp') {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank')
      } else if (platform === 'telegram') {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank')
      } else if (platform === 'line') {
        window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank')
      } else if (platform === 'pinterest') {
        window.open(`https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareText)}&media=${encodeURIComponent(shareUrl + '/og-image.png')}`, '_blank')
      } else if (platform === 'linkedin') {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')
      } else if (platform === 'email') {
        window.location.href = `mailto:?subject=${encodeURIComponent('kissinskin - AI Makeup Looks')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
      }

      URL.revokeObjectURL(imageUrl)
      setShowShareMenu(false)
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        alert(t('error.shareFallback'))
      }
    }
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
          ctx.fillText(activeStyles[i], dx + cellW / 2, dy + srcCellH + labelH / 2)
        }
      }

      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = 'kissinskin-makeup.png'
      link.click()
    }
    img.src = resultImage
  }

  // 이용약관 (Terms of Service)
  if (page === 'terms') {
    return <Terms onNavigate={handleNavigate} />
  }

  // 환불 규정 (Refund Policy)
  if (page === 'refund') {
    return <Refund onNavigate={handleNavigate} />
  }

  // 개인정보처리방침 (Privacy Policy)
  if (page === 'privacy') {
    return <Privacy onNavigate={handleNavigate} />
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
          <h2 className="top-bar-title">{t('analysis.loading.title')}</h2>
        </div>
        <div className="analysis-body">
          <div className="loading-card">
            <div className="spinner" />
            <p className="loading-text">{t('analysis.loading.subtitle')}</p>
            <p className="loading-sub">{t('analysis.loading.time')}</p>
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
          <h2 className="top-bar-title">{t('result.title')}</h2>
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
              )
            }
            return null
          })()}

          {/* 메이크업 그리드 */}
          {resultCells.length === 9 && (
            <section className="result-section">
              <h3 className="section-heading">{t('result.makeupStyles')}</h3>
              <div className="makeup-grid">
                {activeStyles.map((style, i) => (
                  <div key={style} className="makeup-cell">
                    <img src={resultCells[i]} alt={style} className="makeup-cell-img" />
                    <p className="makeup-cell-label">{style}</p>
                  </div>
                ))}
              </div>
              <div className="action-btn-row">
                <button className="download-btn" onClick={handleDownload}>
                  <span className="material-symbols-outlined">download</span>
                  {t('result.save')}
                </button>
                <div className="share-wrapper" ref={shareMenuRef}>
                  <button className="download-btn share-btn" onClick={() => setShowShareMenu(!showShareMenu)}>
                    <span className="material-symbols-outlined">share</span>
                    {t('result.share')}
                  </button>
                  {showShareMenu && (() => {
                    const lang = navigator.language || ''
                    const isKo = lang.startsWith('ko')
                    const isJa = lang.startsWith('ja')
                    const isZh = lang.startsWith('zh')
                    const isTh = lang.startsWith('th')

                    return (
                    <div className="share-menu">
                      {'share' in navigator && (
                        <button className="share-option" onClick={() => handleShare('native')}>
                          <span className="material-symbols-outlined">phone_iphone</span>{t('result.defaultShare')}
                        </button>
                      )}
                      <button className="share-option" onClick={() => handleShare('copy')}>
                        <span className="material-symbols-outlined">content_copy</span>{t('result.copyLink')}
                      </button>

                      {/* 한국: 카카오톡 */}
                      {isKo && (
                        <button className="share-option" onClick={() => handleShare('kakao')} style={{ color: '#3C1E1E' }}>
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="#FFE812"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.726 1.802 5.113 4.508 6.463-.144.509-.926 3.281-.962 3.503 0 0-.019.162.085.224.104.062.227.029.227.029.3-.042 3.472-2.275 4.022-2.652.37.052.748.079 1.12.079 5.523 0 10-3.463 10-7.646C22 6.463 17.523 3 12 3z"/></svg>
                          KakaoTalk
                        </button>
                      )}

                      {/* 일본/태국: LINE */}
                      {(isJa || isTh) && (
                        <button className="share-option" onClick={() => handleShare('line')}>
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="#00B900"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                          LINE
                        </button>
                      )}

                      {/* 글로벌: WhatsApp (한국/일본/중국 제외) */}
                      {!isKo && !isJa && !isZh && (
                        <button className="share-option" onClick={() => handleShare('whatsapp')}>
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          WhatsApp
                        </button>
                      )}

                      {/* 공통: X, Facebook */}
                      <button className="share-option share-x" onClick={() => handleShare('x')}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        X
                      </button>
                      <button className="share-option share-facebook" onClick={() => handleShare('facebook')}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        Facebook
                      </button>

                      {/* 뷰티 특화: Pinterest */}
                      <button className="share-option" onClick={() => handleShare('pinterest')}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#E60023"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>
                        Pinterest
                      </button>

                      {/* 글로벌: Telegram (중국 제외) */}
                      {!isZh && (
                        <button className="share-option" onClick={() => handleShare('telegram')}>
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="#0088cc"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                          Telegram
                        </button>
                      )}

                      {/* 한국: LINE (한국에서도 인기) */}
                      {isKo && (
                        <button className="share-option" onClick={() => handleShare('line')}>
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="#00B900"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                          LINE
                        </button>
                      )}

                      {/* 글로벌 하단: LinkedIn, Email */}
                      {!isKo && !isJa && (
                        <button className="share-option" onClick={() => handleShare('linkedin')}>
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          LinkedIn
                        </button>
                      )}
                      <button className="share-option" onClick={() => handleShare('email')}>
                        <span className="material-symbols-outlined">mail</span>Email
                      </button>
                    </div>
                    )
                  })()}
                </div>
              </div>
            </section>
          )}

          {/* 추천 제품 */}
          {report && (() => {
            const structured = parseReport(report)
            if (structured) {
              return (
                <section className="report-section">
                  <h3 className="section-heading">{t('result.productRec')}</h3>
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
                <h3 className="section-heading">{t('result.productRec')}</h3>
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
              {t('common.tryAgain')}
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
        <button
          onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
          style={{ fontSize: '12px', padding: '2px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', color: '#64748b', cursor: 'pointer' }}
        >
          {locale === 'ko' ? 'EN' : '한국어'}
        </button>
      </div>

      <div className="analysis-body setup-body">
        {/* Upload Section */}
        <section className="upload-section">
          <h3 className="upload-heading">{t('analysis.uploadTitle')}</h3>
          <p className="upload-sub">{t('analysis.uploadHint')}</p>

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
                  <img src={photo} alt={t('analysis.changePhoto')} className="avatar-img" />
                  <div className="avatar-hover">
                    <span className="material-symbols-outlined">photo_camera</span>
                    <span>{t('analysis.changePhoto')}</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined avatar-placeholder-icon">add_a_photo</span>
                  <span className="avatar-placeholder-text">{t('analysis.selectPhoto')}</span>
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
          <h4 className="section-label">{t('analysis.gender')}</h4>
          <div className="gender-row">
            {(['female', 'male'] as const).map((g) => (
              <button
                key={g}
                className={`gender-btn ${gender === g ? 'selected' : ''}`}
                onClick={() => setGender(g)}
              >
                {t(`analysis.${g}`)}
              </button>
            ))}
          </div>
        </section>

        {/* Skin Type Selection */}
        <section className="form-group">
          <div className="section-label-row">
            <h4 className="section-label">{t('analysis.skinType')}</h4>
            <span className="section-label-hint">{t('analysis.skinTypeSelect')}</span>
          </div>
          <div className="skin-grid">
            {(['oily', 'dry', 'combination', 'normal'] as const).map((type) => (
              <button
                key={type}
                className={`skin-card ${skinType === type ? 'selected' : ''}`}
                onClick={() => setSkinType(type)}
              >
                <div className="skin-card-top">
                  <span className="material-symbols-outlined skin-card-icon">{SKIN_DATA[type].icon}</span>
                  {skinType === type && <span className="material-symbols-outlined skin-card-check">check_circle</span>}
                </div>
                <span className="skin-card-name">{SKIN_LABELS[type]}</span>
                <span className="skin-card-desc">{SKIN_DATA[type].desc}</span>
              </button>
            ))}
            <button
              className={`skin-card full-width horizontal ${skinType === 'not_sure' ? 'selected' : ''}`}
              onClick={() => setSkinType('not_sure')}
            >
              <div className="skin-card-h-left">
                <span className="material-symbols-outlined skin-card-icon">{SKIN_DATA['not_sure'].icon}</span>
                <div className="skin-card-h-text">
                  <span className="skin-card-name">{SKIN_LABELS['not_sure']}</span>
                  <span className="skin-card-desc">{SKIN_DATA['not_sure'].desc}</span>
                </div>
              </div>
              {skinType === 'not_sure' ? (
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
          <p>{t('analysis.infoTip')}</p>
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
          <span className="cta-price">$2.99</span>
          <span>{t('common.generateLooks')}</span>
          <span className="material-symbols-outlined">auto_awesome</span>
        </button>
      </div>
    </div>
  )
}

export default App
