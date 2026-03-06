import { useState, useRef, useEffect } from 'react'
import './App.css'
import HomePage from './HomePage'

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

type Gender = '여성' | '남성' | null
type SkinType = '건성' | '지성' | '중성' | '복합성' | '잘 모름' | null
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
      const MAX = 1536
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
      const compressed = cvs.toDataURL('image/jpeg', 0.92)
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

  const activeStyles = gender === '남성' ? MALE_MAKEUP_STYLES : FEMALE_MAKEUP_STYLES

  const isComplete = photo && gender && skinType

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)

    try {
      const { gridPhoto, gridSize } = await createTiledGrid(photo!)

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo, gridPhoto, gridSize, gender, skinType }),
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

  const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  const handleSubmit = async () => {
    if (!isComplete) return

    setError(null)

    try {
      // 모바일: 분석 데이터를 저장해두고 결제 후 복원 (임베디드 실패 시 리다이렉트 대비)
      if (isMobile) {
        sessionStorage.setItem('kisskin_pending', JSON.stringify({ photo, gender, skinType }))
      }

      // 1. Polar 체크아웃 세션 생성
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: isMobile }),
      })

      const checkoutData = await checkoutRes.json()

      if (!checkoutRes.ok) {
        throw new Error(checkoutData.error || '결제 세션 생성 실패')
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
            throw new Error(redirectData.error || '결제 세션 생성 실패')
          }
          return
        }
        throw new Error('결제 모듈을 불러오지 못했습니다. 페이지를 새로고침해주세요.')
      }

      let paid = false
      const embed = await window.Polar.EmbedCheckout.create(checkoutData.url, { theme: 'light' })

      embed.addEventListener('success', () => {
        paid = true
        embed.close()
        if (isMobile) {
          sessionStorage.removeItem('kisskin_pending')
        }
        runAnalysis()
      })

      embed.addEventListener('close', () => {
        if (!paid) {
          // 결제 완료 없이 닫힘
        }
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : '결제 처리 중 오류가 발생했습니다.')
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
      setPage('analysis')

      // 결제 확인 후 분석 시작
      fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutId }),
      })
        .then(res => res.json())
        .then(result => {
          if (result.status === 'succeeded' || result.status === 'confirmed') {
            // 분석 데이터가 세팅된 후 실행되도록 약간 지연
            setTimeout(() => runAnalysis(), 100)
          } else {
            setError('결제가 완료되지 않았습니다. 다시 시도해주세요.')
          }
        })
        .catch(() => {
          setError('결제 확인 중 오류가 발생했습니다.')
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
        alert('이미지 생성에 실패했습니다. 저장하기를 이용해주세요.')
        return
      }

      const file = new File([blob], 'kisskin-makeup.jpg', { type: 'image/jpeg' })
      const imageUrl = URL.createObjectURL(blob)
      const shareUrl = 'https://kisskin.net'
      const shareText = 'AI가 추천한 나만의 메이크업 스타일 9종'

      if (platform === 'native') {
        try {
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ title: 'kisskin', text: shareText, files: [file] })
          } else {
            await navigator.share({ title: 'kisskin', text: shareText + '\n' + shareUrl })
          }
        } catch (e) {
          if (e instanceof Error && e.name !== 'AbortError') {
            alert('공유에 실패했습니다.')
          }
        }
      } else if (platform === 'copy') {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          alert('이미지가 클립보드에 복사되었습니다!')
        } catch {
          try {
            await navigator.clipboard.writeText(shareUrl)
            alert('링크가 클립보드에 복사되었습니다!')
          } catch {
            alert('복사에 실패했습니다.')
          }
        }
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
      } else if (platform === 'email') {
        window.location.href = `mailto:?subject=${encodeURIComponent('kisskin - AI Makeup Looks')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
      }

      URL.revokeObjectURL(imageUrl)
      setShowShareMenu(false)
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        alert('공유에 실패했습니다. 저장하기를 이용해주세요.')
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
      link.download = 'kisskin-makeup.png'
      link.click()
    }
    img.src = resultImage
  }

  // 이용약관 (Terms of Service)
  if (page === 'terms') {
    return (
      <div className="legal-page">
        <div className="legal-header">
          <button className="legal-back" onClick={() => handleNavigate('home')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1>Terms of Service</h1>
        </div>
        <div className="legal-content">
          <p className="legal-date">Effective Date: March 6, 2026</p>

          <h2>1. Agreement to Terms</h2>
          <p>By accessing or using kisskin (<a href="https://kisskin.net" target="_blank" rel="noopener noreferrer">https://kisskin.net</a>), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>

          <h2>2. Service Description</h2>
          <p>kisskin is an AI-powered makeup simulation and beauty recommendation service. When you submit a photo, our AI generates:</p>
          <ul>
            <li>9 personalized makeup style previews applied to your face</li>
            <li>Skin type and tone analysis</li>
            <li>Customized cosmetic product recommendations</li>
          </ul>
          <p>Results are generated using OpenAI's image generation and language models, delivered instantly in your browser.</p>

          <h2>3. Payment & Billing</h2>
          <ul>
            <li>Each analysis is a <strong>one-time purchase of $2.99 USD</strong>. There are no subscriptions, recurring charges, or hidden fees.</li>
            <li>Payment is securely processed by <strong>Polar</strong> (<a href="https://polar.sh" target="_blank" rel="noopener noreferrer">polar.sh</a>), a Merchant of Record. Polar handles all billing, tax calculation, and payment processing on our behalf.</li>
            <li>Accepted payment methods include credit/debit cards and other methods supported by Polar.</li>
            <li>By completing a purchase, you authorize Polar to charge your selected payment method.</li>
            <li>Your payment receipt and invoice are provided by Polar. For billing inquiries, you may contact Polar directly or reach us at <strong>support@kisskin.net</strong>.</li>
          </ul>

          <h2>4. Delivery of Service</h2>
          <ul>
            <li>Results are delivered <strong>immediately</strong> after payment, directly in your browser.</li>
            <li>No download, account creation, or email is required to receive results.</li>
            <li>Results are available only during your current browser session. Once you close the page, results cannot be recovered. We recommend using the <strong>Save</strong> or <strong>Share</strong> feature before leaving.</li>
          </ul>

          <h2>5. Refund Policy</h2>
          <p>Please see our dedicated <a className="legal-link" onClick={() => handleNavigate('refund')}>Refund Policy</a> page for full details. In summary:</p>
          <ul>
            <li>Since results are delivered instantly as digital content, <strong>all sales are generally final</strong>.</li>
            <li>Full refunds are granted if the Service fails to deliver results due to a technical error on our side.</li>
            <li>Refund requests are processed through Polar.</li>
          </ul>

          <h2>6. User Eligibility & Responsibilities</h2>
          <ul>
            <li>You must be at least <strong>13 years old</strong> to use this Service. Users under 18 should have parental consent.</li>
            <li>You must only upload photos of yourself, or photos for which you have explicit consent from the person depicted.</li>
            <li>You agree not to use the Service to generate harmful, illegal, deceptive, or offensive content.</li>
            <li>You are responsible for ensuring your uploaded content does not violate any third-party rights.</li>
          </ul>

          <h2>7. Intellectual Property</h2>
          <ul>
            <li><strong>Your photos:</strong> You retain full ownership of photos you upload. We claim no rights over your original images.</li>
            <li><strong>AI-generated results:</strong> The makeup simulation images are generated by OpenAI's models. You are granted a personal, non-exclusive license to use, save, and share your results. Commercial use of results is permitted.</li>
            <li><strong>Our content:</strong> The kisskin brand, logo, website design, and all original content are owned by kisskin and protected by applicable intellectual property laws.</li>
          </ul>

          <h2>8. AI Disclaimer</h2>
          <ul>
            <li>AI-generated makeup simulations are <strong>artistic approximations</strong>, not guarantees of real-world appearance.</li>
            <li>Product recommendations are AI-generated suggestions based on your skin analysis. kisskin does not manufacture, sell, or endorse any recommended products.</li>
            <li>kisskin is not liable for any purchasing decisions you make based on AI recommendations.</li>
            <li>AI results may vary based on photo quality, lighting, angle, and other factors.</li>
          </ul>

          <h2>9. Limitation of Liability</h2>
          <p>The Service is provided <strong>"as is" and "as available"</strong> without warranties of any kind, express or implied. To the maximum extent permitted by applicable law:</p>
          <ul>
            <li>kisskin shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</li>
            <li>Our total liability for any claim shall not exceed the amount you paid for the specific transaction giving rise to the claim.</li>
          </ul>

          <h2>10. Service Availability</h2>
          <ul>
            <li>We strive for 24/7 availability but do not guarantee uninterrupted service.</li>
            <li>We may temporarily suspend the Service for maintenance, updates, or circumstances beyond our control.</li>
            <li>We reserve the right to modify, suspend, or discontinue the Service at any time with reasonable notice.</li>
          </ul>

          <h2>11. Prohibited Uses</h2>
          <p>You may not:</p>
          <ul>
            <li>Reverse-engineer, decompile, or attempt to extract the source code of the Service.</li>
            <li>Use automated tools (bots, scrapers) to access the Service.</li>
            <li>Circumvent payment or abuse free trials or promotional offers.</li>
            <li>Upload content that is illegal, explicit, or violates others' rights.</li>
          </ul>

          <h2>12. Governing Law</h2>
          <p>These Terms are governed by and construed in accordance with applicable international commercial laws. Any disputes shall be resolved through good-faith negotiation first, then through arbitration if necessary.</p>

          <h2>13. Changes to Terms</h2>
          <p>We may update these Terms at any time. Material changes will be posted on this page with an updated effective date. Your continued use of the Service after changes constitutes acceptance.</p>

          <h2>14. Contact Us</h2>
          <p>For any questions about these Terms:</p>
          <ul>
            <li>Email: <strong>support@kisskin.net</strong></li>
            <li>Website: <a href="https://kisskin.net" target="_blank" rel="noopener noreferrer">https://kisskin.net</a></li>
          </ul>
        </div>
      </div>
    )
  }

  // 환불 규정 (Refund Policy)
  if (page === 'refund') {
    return (
      <div className="legal-page">
        <div className="legal-header">
          <button className="legal-back" onClick={() => handleNavigate('home')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1>Refund Policy</h1>
        </div>
        <div className="legal-content">
          <p className="legal-date">Effective Date: March 6, 2026</p>

          <h2>1. Overview</h2>
          <p>kisskin provides AI-generated makeup analysis results that are delivered <strong>instantly</strong> after payment. Because our product is digital content consumed immediately upon delivery, our refund policy reflects this nature.</p>

          <h2>2. General Policy</h2>
          <p>All purchases are <strong>final</strong> once the AI analysis results have been successfully delivered to your browser. Since results are generated and displayed immediately after payment, we cannot "undo" or "take back" the delivered content.</p>

          <h2>3. When You ARE Eligible for a Refund</h2>
          <p>We will issue a <strong>full refund</strong> in the following cases:</p>
          <ul>
            <li><strong>Technical failure:</strong> Payment was charged but no analysis results were generated or displayed due to a server error, API failure, or other technical issue on our end.</li>
            <li><strong>Duplicate charge:</strong> You were accidentally charged more than once for the same analysis.</li>
            <li><strong>Processing error:</strong> The AI returned a completely blank, corrupted, or unrelated result (not merely an unsatisfactory style preference).</li>
          </ul>

          <h2>4. When You Are NOT Eligible for a Refund</h2>
          <ul>
            <li>You are <strong>dissatisfied with the AI-generated styles</strong> (style preferences are subjective; AI results vary based on photo quality, lighting, and other factors).</li>
            <li>You <strong>closed the browser</strong> before saving your results. Results exist only in your active browser session.</li>
            <li>You <strong>changed your mind</strong> after seeing the results.</li>
            <li>You <strong>uploaded the wrong photo</strong> or selected incorrect options (gender, skin type).</li>
            <li>Your <strong>device or internet connection</strong> caused issues displaying the results.</li>
          </ul>

          <h2>5. How to Request a Refund</h2>
          <ol>
            <li>Email <strong>support@kisskin.net</strong> within <strong>7 days</strong> of your purchase.</li>
            <li>Include the following information:
              <ul>
                <li>The email address used for payment</li>
                <li>Date and approximate time of purchase</li>
                <li>Description of the issue (screenshot if possible)</li>
              </ul>
            </li>
            <li>We will review your request and respond within <strong>3 business days</strong>.</li>
          </ol>

          <h2>6. How Refunds Are Processed</h2>
          <ul>
            <li>Approved refunds are processed through <strong>Polar</strong>, our payment processor.</li>
            <li>Refunds are returned to your <strong>original payment method</strong>.</li>
            <li>Processing time: <strong>5–10 business days</strong> depending on your bank or card issuer.</li>
            <li>You will receive a confirmation email from Polar once the refund is initiated.</li>
          </ul>

          <h2>7. Chargebacks</h2>
          <p>We encourage you to contact us at <strong>support@kisskin.net</strong> before initiating a chargeback with your bank. We are committed to resolving issues fairly and promptly. Filing a chargeback without contacting us first may result in delays and additional complications.</p>

          <h2>8. Pricing & Currency</h2>
          <ul>
            <li>All prices are listed in <strong>USD ($)</strong>.</li>
            <li>The final amount charged may vary slightly due to currency conversion fees applied by your bank. kisskin is not responsible for exchange rate differences.</li>
            <li>Tax may be added to your purchase depending on your location, as calculated by Polar.</li>
          </ul>

          <h2>9. Contact Us</h2>
          <p>For refund requests or billing questions:</p>
          <ul>
            <li>Email: <strong>support@kisskin.net</strong></li>
            <li>Response time: Within 3 business days</li>
          </ul>
        </div>
      </div>
    )
  }

  // 개인정보처리방침 (Privacy Policy)
  if (page === 'privacy') {
    return (
      <div className="legal-page">
        <div className="legal-header">
          <button className="legal-back" onClick={() => handleNavigate('home')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1>Privacy Policy</h1>
        </div>
        <div className="legal-content">
          <p className="legal-date">Effective Date: March 6, 2026</p>

          <h2>1. Introduction</h2>
          <p>kisskin ("we", "our", "us") operates the website <a href="https://kisskin.net" target="_blank" rel="noopener noreferrer">https://kisskin.net</a>. This Privacy Policy explains how we collect, use, and protect your information when you use our AI makeup analysis service.</p>

          <h2>2. Information We Collect</h2>

          <h3>2.1 Photos You Upload</h3>
          <ul>
            <li>When you use our Service, you upload a facial photo for AI analysis.</li>
            <li>Your photo is sent to <strong>OpenAI's API</strong> for processing and is <strong>not stored on our servers</strong>.</li>
            <li>Photos are processed in real-time memory and <strong>discarded immediately</strong> after your analysis results are generated.</li>
            <li>We do not keep, archive, or back up your photos in any form.</li>
          </ul>

          <h3>2.2 Payment Information</h3>
          <ul>
            <li>All payment processing is handled by <strong>Polar</strong> (<a href="https://polar.sh" target="_blank" rel="noopener noreferrer">polar.sh</a>), acting as our Merchant of Record.</li>
            <li>We <strong>never</strong> receive, see, or store your credit card number, CVV, or full billing details.</li>
            <li>Polar collects the necessary payment information (card details, billing address, email) to process your transaction. This data is subject to <a href="https://polar.sh/legal/privacy" target="_blank" rel="noopener noreferrer">Polar's Privacy Policy</a>.</li>
            <li>We may receive from Polar: transaction confirmation, order amount, and a reference ID for customer support purposes.</li>
          </ul>

          <h3>2.3 Automatically Collected Data</h3>
          <ul>
            <li><strong>Cloudflare Analytics:</strong> As our hosting provider, Cloudflare may collect anonymous usage data (page views, country, device type, browser). This data does not identify you personally.</li>
            <li>We do <strong>not</strong> use cookies for tracking or advertising.</li>
            <li>We do <strong>not</strong> use Google Analytics or any third-party tracking pixels.</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <table className="legal-table">
            <thead>
              <tr><th>Data</th><th>Purpose</th><th>Retention</th></tr>
            </thead>
            <tbody>
              <tr><td>Uploaded photo</td><td>Generate AI makeup analysis</td><td>Not retained (real-time only)</td></tr>
              <tr><td>Analysis results</td><td>Display in your browser</td><td>Browser session only (not on server)</td></tr>
              <tr><td>Payment info</td><td>Process payment via Polar</td><td>Managed by Polar</td></tr>
              <tr><td>Anonymous analytics</td><td>Improve service quality</td><td>Aggregated, no PII</td></tr>
            </tbody>
          </table>

          <h2>4. Third-Party Services</h2>
          <p>We use the following third-party services. Each has their own privacy policy:</p>
          <table className="legal-table">
            <thead>
              <tr><th>Service</th><th>Purpose</th><th>Privacy Policy</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>OpenAI</strong></td><td>AI image generation & text analysis</td><td><a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer">openai.com/privacy</a></td></tr>
              <tr><td><strong>Polar</strong></td><td>Payment processing (Merchant of Record)</td><td><a href="https://polar.sh/legal/privacy" target="_blank" rel="noopener noreferrer">polar.sh/legal/privacy</a></td></tr>
              <tr><td><strong>Cloudflare</strong></td><td>Website hosting & CDN</td><td><a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">cloudflare.com/privacy</a></td></tr>
            </tbody>
          </table>
          <p><strong>Important:</strong> OpenAI's API data usage policy states that data sent through the API is <strong>not used to train their models</strong>. Your photos are not used for AI training by OpenAI or by us.</p>

          <h2>5. Data We Do NOT Collect</h2>
          <ul>
            <li>We do not collect your name, email, phone number, or address (unless provided to Polar during payment).</li>
            <li>We do not create user accounts or profiles.</li>
            <li>We do not track you across websites.</li>
            <li>We do not sell, rent, or share your data with advertisers.</li>
            <li>We do not use your photos for AI model training.</li>
          </ul>

          <h2>6. Data Security</h2>
          <ul>
            <li>All data transmission is encrypted using <strong>HTTPS/TLS</strong>.</li>
            <li>Photos are transmitted directly from your browser to OpenAI's API via our secure serverless function — no intermediate storage.</li>
            <li>Our infrastructure runs on <strong>Cloudflare Workers</strong> (serverless), meaning there is no persistent server where data could be stored or accessed.</li>
          </ul>

          <h2>7. Your Rights</h2>
          <p>Regardless of your location, you have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Know what data we hold about you (effectively none, as described above).</li>
            <li><strong>Deletion:</strong> Request deletion of any data. Since we don't store photos or personal data, this primarily applies to payment records held by Polar.</li>
            <li><strong>Portability:</strong> Request your data in a portable format.</li>
            <li><strong>Objection:</strong> Object to any data processing.</li>
          </ul>
          <p>To exercise these rights, contact <strong>support@kisskin.net</strong>.</p>

          <h2>8. International Users</h2>
          <ul>
            <li>kisskin is accessible worldwide. By using the Service, you consent to your photo being processed by OpenAI (based in the United States) and payment being processed by Polar.</li>
            <li>For <strong>EU/EEA users (GDPR):</strong> Polar acts as data controller for payment data. Our legal basis for processing your photo is your explicit consent when you upload it and initiate analysis.</li>
            <li>For <strong>California users (CCPA):</strong> We do not sell personal information. You may request disclosure of data collected about you.</li>
          </ul>

          <h2>9. Children's Privacy</h2>
          <p>The Service is not intended for children under <strong>13</strong>. We do not knowingly collect data from children under 13. If you believe a child has used our Service, contact us and we will take appropriate action.</p>

          <h2>10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Material changes will be reflected with an updated effective date at the top of this page. Continued use of the Service after changes constitutes acceptance.</p>

          <h2>11. Contact Us</h2>
          <p>For privacy-related questions or data requests:</p>
          <ul>
            <li>Email: <strong>support@kisskin.net</strong></li>
            <li>Website: <a href="https://kisskin.net" target="_blank" rel="noopener noreferrer">https://kisskin.net</a></li>
          </ul>
        </div>
      </div>
    )
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
                  저장하기
                </button>
                <div className="share-wrapper" ref={shareMenuRef}>
                  <button className="download-btn share-btn" onClick={() => setShowShareMenu(!showShareMenu)}>
                    <span className="material-symbols-outlined">share</span>
                    공유하기
                  </button>
                  {showShareMenu && (
                    <div className="share-menu">
                      {'share' in navigator && (
                        <button className="share-option" onClick={() => handleShare('native')}>
                          <span className="material-symbols-outlined">phone_iphone</span>기본 공유
                        </button>
                      )}
                      <button className="share-option" onClick={() => handleShare('copy')}>
                        <span className="material-symbols-outlined">content_copy</span>복사하기
                      </button>
                      <button className="share-option share-x" onClick={() => handleShare('x')}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        X
                      </button>
                      <button className="share-option share-facebook" onClick={() => handleShare('facebook')}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        Facebook
                      </button>
                      <button className="share-option share-whatsapp" onClick={() => handleShare('whatsapp')}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                      </button>
                      <button className="share-option share-telegram" onClick={() => handleShare('telegram')}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#0088cc"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                        Telegram
                      </button>
                      <button className="share-option share-line" onClick={() => handleShare('line')}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#00B900"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                        LINE
                      </button>
                      <button className="share-option share-email" onClick={() => handleShare('email')}>
                        <span className="material-symbols-outlined">mail</span>Email
                      </button>
                    </div>
                  )}
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
          <span className="cta-price">$2.99</span>
          <span>Generate My Looks</span>
          <span className="material-symbols-outlined">auto_awesome</span>
        </button>
      </div>
    </div>
  )
}

export default App
