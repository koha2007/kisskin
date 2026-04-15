import { useState, useRef, useEffect } from 'react'
import './App.css'
import { navigate } from 'vike/client/router'
import { useI18n } from './i18n/context'
import { supabase } from './lib/supabase'
import { saveSharedResult } from './lib/shareResult'
import type { User } from '@supabase/supabase-js'

// ── Google Analytics helper ──────────────────────────────────────
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
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
function gtagEvent(name: string, params?: Record<string, unknown>) {
  window.gtag?.('event', name, params)
}

type Gender = 'female' | 'male' | null
type SkinType = 'oily' | 'dry' | 'combination' | 'normal' | 'not_sure' | null

const FEMALE_MAKEUP_STYLES = [
  'Natural Glow', 'Cloud Skin', 'Blood Lip', 'Maximalist Eye',
  'Metallic Eye', 'Bold Lip', 'Blush Draping & Layering', 'Grunge Makeup', 'K-pop Idol Makeup',
]
const MALE_MAKEUP_STYLES = [
  'No-Makeup Makeup', 'Skincare Hybrid Base', 'Blurred Lip', 'Grunge / Smoky Eye',
  'Monochrome', 'Utility Makeup', 'Blue Point Eye', 'Vampire Romantic', 'K-pop Idol Makeup',
]
const GENDER_MAP: Record<string, string> = { female: '여성', male: '남성' }
const SKIN_MAP: Record<string, string> = {
  oily: '지성', dry: '건성', combination: '복합성', normal: '중성', not_sure: '잘 모름'
}

interface ProductRecommendation {
  category: string; name: string; brand: string; price: string; reason: string
}
interface AnalysisDetail {
  gender: string; skinType: string; skinTypeDetail: string; tone: string; toneDetail: string; advice: string
}
interface StructuredReport {
  analysis?: AnalysisDetail; summary?: string; products: ProductRecommendation[]
}

function parseReport(reportStr: string): StructuredReport | null {
  if (!reportStr) return null
  const candidates: string[] = []
  candidates.push(reportStr.trim())
  const fenceMatch = reportStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) candidates.push(fenceMatch[1].trim())
  const braceMatch = reportStr.match(/\{[\s\S]*\}/)
  if (braceMatch) candidates.push(braceMatch[0].trim())
  for (const jsonStr of candidates) {
    try {
      const parsed = JSON.parse(jsonStr)
      if (parsed && typeof parsed === 'object' && (Array.isArray(parsed.products) || parsed.analysis)) {
        if (!Array.isArray(parsed.products)) parsed.products = []
        return parsed as StructuredReport
      }
    } catch { /* next */ }
  }
  return null
}

function buildBuyLink(brand: string, name: string): string {
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brand + ' ' + name)}`
}

const CATEGORY_STYLE: Record<string, { icon: string; bg: string }> = {
  Skin: { icon: 'face', bg: '#f0abfc' }, Base: { icon: 'palette', bg: '#fbbf24' },
  Eyes: { icon: 'visibility', bg: '#818cf8' }, Lips: { icon: 'lip_touch', bg: '#fb7185' },
  Cheeks: { icon: 'brush', bg: '#f9a8d4' }, Brow: { icon: 'edit', bg: '#a78bfa' },
  Primer: { icon: 'layers', bg: '#67e8f9' },
}

async function fetchJsonWithRetry(url: string, options: RequestInit, retries = 2): Promise<{ res: Response; data: Record<string, unknown> }> {
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url, options)
    try {
      const data = await res.json()
      return { res, data }
    } catch {
      if (i < retries) { await new Promise(r => setTimeout(r, 500 * (i + 1))); continue }
      throw new Error(`[${res.status}]`)
    }
  }
  throw new Error('Unreachable')
}

function createTiledGrid(photoUrl: string): Promise<{ gridPhoto: string; gridSize: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const w = img.naturalWidth; const h = img.naturalHeight; const ratio = w / h
      let gridW: number, gridH: number, gridSize: string
      if (ratio < 0.85) { gridW = 1024; gridH = 1536; gridSize = '1024x1536' }
      else if (ratio > 1.15) { gridW = 1536; gridH = 1024; gridSize = '1536x1024' }
      else { gridW = 1024; gridH = 1024; gridSize = '1024x1024' }
      gridW = Math.floor(gridW / 3) * 3; gridH = Math.floor(gridH / 3) * 3
      const cellW = gridW / 3; const cellH = gridH / 3; const cellRatio = cellW / cellH
      const cvs = document.createElement('canvas'); cvs.width = gridW; cvs.height = gridH
      const ctx = cvs.getContext('2d')
      if (!ctx) { reject(new Error('Canvas not supported')); return }
      let sx: number, sy: number, sw: number, sh: number
      if (ratio > cellRatio) { sh = h; sw = Math.floor(h * cellRatio); sx = Math.floor((w - sw) / 2); sy = 0 }
      else { sw = w; sh = Math.floor(w / cellRatio); sx = 0; sy = Math.floor((h - sh) * 0.15) }
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

export default function AnalysisApp() {
  const { t, locale, setLocale } = useI18n()

  const SKIN_DATA: Record<string, { icon: string; desc: string }> = {
    oily: { icon: 'water_drop', desc: t('analysis.oilyDesc') },
    dry: { icon: 'dry_cleaning', desc: t('analysis.dryDesc') },
    combination: { icon: 'contrast', desc: t('analysis.combinationDesc') },
    normal: { icon: 'verified_user', desc: t('analysis.normalDesc') },
    not_sure: { icon: 'help', desc: t('analysis.notSureDesc') },
  }
  const SKIN_LABELS: Record<string, string> = {
    oily: t('analysis.oily'), dry: t('analysis.dry'), combination: t('analysis.combination'),
    normal: t('analysis.normal'), not_sure: t('analysis.notSure'),
  }

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const [photo, setPhoto] = useState<string | null>(null)
  const [gender, setGender] = useState<Gender>(null)
  const [skinType, setSkinType] = useState<SkinType>(null)
  const [loading, setLoading] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [resultCells, setResultCells] = useState<string[]>([])
  const [report, setReport] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [emailWarning, setEmailWarning] = useState<string | null>(null)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [shareId, setShareId] = useState<string | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const customerEmailRef = useRef<string | null>(null)
  const shareMenuRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const [subStatus, setSubStatus] = useState<{
    active: boolean; status?: string; tier?: string | null
    usage: number; limit: number; trialEndsAt?: string | null; checked: boolean
  }>({ active: false, usage: 0, limit: 0, checked: false })
  const checkSubscription = async () => {
    if (!user?.email) return
    try {
      const { res, data } = await fetchJsonWithRetry('/api/subscription-status', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      })
      if (res.ok) { setSubStatus({ ...data, checked: true } as typeof subStatus); customerEmailRef.current = user.email }
    } catch { /* subscription check failed - will fall through to checkout */ }
  }

  useEffect(() => {
    if (user) checkSubscription()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // PWA 설치 배너
  useEffect(() => {
    const ua = navigator.userAgent
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone
    setIsIos(ios)
    if (isStandalone) return
    if (ios) {
      const dismissed = sessionStorage.getItem('pwa-banner-dismissed')
      if (!dismissed) setShowInstallBanner(true)
    } else {
      const onAvailable = () => setShowInstallBanner(true)
      window.addEventListener('pwa-install-available', onAvailable)
      if ((window as unknown as { __pwaInstall?: { deferredPrompt: unknown } }).__pwaInstall?.deferredPrompt) {
        const dismissed = sessionStorage.getItem('pwa-banner-dismissed')
        if (!dismissed) setShowInstallBanner(true)
      }
      return () => window.removeEventListener('pwa-install-available', onAvailable)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIos) { setShowIosGuide(true); return }
    const pwa = (window as unknown as { __pwaInstall?: { deferredPrompt: { prompt: () => void; userChoice: Promise<unknown> } | null } }).__pwaInstall
    if (pwa?.deferredPrompt) { pwa.deferredPrompt.prompt(); await pwa.deferredPrompt.userChoice; pwa.deferredPrompt = null; setShowInstallBanner(false) }
  }

  const dismissInstallBanner = () => { setShowInstallBanner(false); sessionStorage.setItem('pwa-banner-dismissed', '1') }

  // 화면 꺼짐 시 URL 복원
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && (resultImage || report)) {
        window.history.replaceState({}, '', '/')
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [resultImage, report])

  const loadPhoto = (dataUrl: string) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 1280; const MAX_BYTES = 1.5 * 1024 * 1024
      let w = img.naturalWidth; let h = img.naturalHeight
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * (MAX / w)); w = MAX } else { w = Math.round(w * (MAX / h)); h = MAX }
      }
      const cvs = document.createElement('canvas'); cvs.width = w; cvs.height = h
      const ctx = cvs.getContext('2d'); if (!ctx) return
      ctx.drawImage(img, 0, 0, w, h)
      let quality = 0.85; let compressed = cvs.toDataURL('image/jpeg', quality)
      while (compressed.length * 0.75 > MAX_BYTES && quality > 0.3) { quality -= 0.1; compressed = cvs.toDataURL('image/jpeg', quality) }
      if (compressed.length * 0.75 > MAX_BYTES) {
        const scale = 0.7; cvs.width = Math.round(w * scale); cvs.height = Math.round(h * scale)
        ctx.drawImage(img, 0, 0, cvs.width, cvs.height); compressed = cvs.toDataURL('image/jpeg', 0.7)
      }
      setPhoto(compressed); gtagEvent('photo_uploaded')
    }
    img.onerror = () => setError(t('error.imageLoad'))
    img.src = dataUrl
  }

  const processPickedFile = (file: File) => {
    if (!file.type.startsWith('image/')) { setError(t('error.imageOnly')); return }
    if (file.size > 50 * 1024 * 1024) { setError(locale === 'ko' ? '파일 크기는 50MB 이하만 가능합니다.' : 'File must be under 50MB.'); return }
    setError(null)
    const reader = new FileReader()
    reader.onloadend = () => loadPhoto(reader.result as string)
    reader.onerror = () => setError(t('error.fileRead'))
    reader.readAsDataURL(file)
  }

  // Build and click a *fresh* <input> each call. Reusing a single hidden input
  // causes Android WebView's file chooser to get stuck after the first dismiss,
  // and the `capture` attribute is more reliably honoured when set before the
  // element enters the DOM.
  const openPicker = (mode: 'gallery' | 'camera') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    if (mode === 'camera') {
      input.setAttribute('capture', 'environment')
    }
    input.style.position = 'fixed'
    input.style.left = '-9999px'
    input.style.top = '0'
    input.style.opacity = '0'
    input.onchange = () => {
      const file = input.files?.[0]
      if (file) processPickedFile(file)
      try { document.body.removeChild(input) } catch { /* already removed */ }
    }
    document.body.appendChild(input)
    // Delay click one frame so WebView finishes appending before dispatching.
    requestAnimationFrame(() => input.click())
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      if (file.size > 50 * 1024 * 1024) { setError(locale === 'ko' ? '파일 크기는 50MB 이하만 가능합니다.' : 'File must be under 50MB.'); return }
      const reader = new FileReader()
      reader.onloadend = () => loadPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const activeStyles = gender === 'male' ? MALE_MAKEUP_STYLES : FEMALE_MAKEUP_STYLES
  const isComplete = photo && gender && skinType

  const reverseUsage = () => { setSubStatus(prev => ({ ...prev, usage: Math.max(0, prev.usage - 1) })) }

  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, maxW: number, y: number, lineH: number): number => {
    const words = text.split(' '); let line = ''; let curY = y
    for (const word of words) {
      const test = line ? line + ' ' + word : word
      if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, curY); line = word; curY += lineH }
      else line = test
    }
    if (line) { ctx.fillText(line, x, curY); curY += lineH }
    return curY - y
  }

  const buildCompositeCanvas = async (gridImg: HTMLImageElement, includeProducts = false): Promise<HTMLCanvasElement> => {
    const srcCellW = Math.floor(gridImg.width / 3)
    const srcCellH = Math.floor(gridImg.height / 3)
    const gap = Math.round(srcCellW * 0.035); const pad = Math.round(srcCellW * 0.04)
    const radius = Math.round(srcCellW * 0.045); const fontSize = Math.max(14, Math.round(srcCellW * 0.065))
    const cellW = srcCellW; const displayImgH = Math.round(cellW * 1.25); const labelH = Math.round(fontSize * 2.2)
    const cellH = displayImgH + labelH
    const gridW = Math.round(pad * 2 + cellW * 3 + gap * 2); const gridH = Math.round(pad * 2 + cellH * 3 + gap * 2)
    const structured = report ? parseReport(report) : null; const a = structured?.analysis
    const tmpCvs = document.createElement('canvas'); tmpCvs.width = gridW; const tmpCtx = tmpCvs.getContext('2d')!
    const rPad = Math.round(gridW * 0.05); const rContentW = gridW - rPad * 2
    const rFontTitle = Math.max(16, Math.round(gridW * 0.04)); const rFontBody = Math.max(13, Math.round(gridW * 0.032))
    const rLineH = Math.round(rFontBody * 1.6)
    let reportH = 0
    if (a) {
      reportH = Math.round(rFontTitle * 2.5); reportH += Math.round(rFontBody * 2)
      const sections = [
        { label: locale === 'ko' ? '피부 타입' : 'Skin Type', text: a.skinTypeDetail },
        { label: locale === 'ko' ? '톤 분석' : 'Tone Analysis', text: a.toneDetail },
        { label: locale === 'ko' ? '맞춤 조언' : 'Advice', text: a.advice },
      ]
      for (const s of sections) {
        reportH += Math.round(rFontBody * 2.2)
        tmpCtx.font = `400 ${rFontBody}px Manrope, sans-serif`
        const words = s.text.split(' '); let line = ''
        for (const word of words) {
          const test = line ? line + ' ' + word : word
          if (tmpCtx.measureText(test).width > rContentW - 20 && line) { reportH += rLineH; line = word } else line = test
        }
        if (line) reportH += rLineH; reportH += Math.round(rLineH * 0.5)
      }
      reportH += rPad * 2
    }
    const products = (includeProducts && structured?.products) ? structured.products : []
    let productsH = 0
    if (products.length > 0) {
      const prodTitleH = Math.round(rFontTitle * 2.5); const prodCardH = Math.round(rFontBody * 7); const prodGap = Math.round(rFontBody * 0.8)
      productsH = prodTitleH + products.length * (prodCardH + prodGap) + rPad
    }
    const brandH = Math.round(gridW * 0.14); const totalH = gridH + reportH + productsH + brandH
    const canvas = document.createElement('canvas'); canvas.width = gridW; canvas.height = totalH
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#f8f6f6'; ctx.fillRect(0, 0, gridW, totalH)
    const roundRect = (x: number, y: number, w: number, h: number, r: number[]) => {
      const [tl, tr, br, bl] = r; ctx.beginPath(); ctx.moveTo(x + tl, y); ctx.lineTo(x + w - tr, y)
      ctx.arcTo(x + w, y, x + w, y + tr, tr); ctx.lineTo(x + w, y + h - br)
      ctx.arcTo(x + w, y + h, x + w - br, y + h, br); ctx.lineTo(x + bl, y + h)
      ctx.arcTo(x, y + h, x, y + h - bl, bl); ctx.lineTo(x, y + tl)
      ctx.arcTo(x, y, x + tl, y, tl); ctx.closePath()
    }
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const i = row * 3 + col; const sx = Math.round(col * srcCellW); const sy = Math.round(row * srcCellH)
        const dx = Math.round(pad + col * (cellW + gap)); const dy = Math.round(pad + row * (cellH + gap))
        ctx.save(); roundRect(dx, dy, cellW, cellH, [radius, radius, radius, radius])
        ctx.fillStyle = '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,0.08)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 1; ctx.fill(); ctx.restore()
        const targetRatio = cellW / displayImgH; const srcRatio = srcCellW / srcCellH
        let cropX = sx, cropY = sy, cropW = srcCellW, cropH = srcCellH
        if (srcRatio > targetRatio) { cropW = Math.round(srcCellH * targetRatio); cropX = sx + Math.round((srcCellW - cropW) / 2) }
        else { cropH = Math.round(srcCellW / targetRatio); cropY = sy }
        ctx.save(); roundRect(dx, dy, cellW, displayImgH, [radius, radius, 0, 0]); ctx.clip()
        ctx.drawImage(gridImg, cropX, cropY, cropW, cropH, dx, dy, cellW, displayImgH); ctx.restore()
        ctx.fillStyle = '#070953'; ctx.font = `700 ${fontSize}px Manrope, sans-serif`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(activeStyles[i], dx + cellW / 2, dy + displayImgH + labelH / 2)
      }
    }
    if (a) {
      let y = gridH + rPad
      ctx.save(); roundRect(rPad, gridH + Math.round(rPad * 0.5), gridW - rPad * 2, reportH - rPad, [radius * 2, radius * 2, radius * 2, radius * 2])
      ctx.fillStyle = '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,0.06)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2; ctx.fill(); ctx.restore()
      const cardX = rPad + Math.round(rPad * 0.6); const cardContentW = rContentW - Math.round(rPad * 1.2)
      ctx.fillStyle = '#eb4763'; ctx.font = `800 ${rFontTitle}px Manrope, sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'top'
      ctx.fillText('✨ AI Skin Analysis', cardX, y); y += Math.round(rFontTitle * 1.8)
      const badges = [a.gender, a.skinType, a.tone].filter(Boolean); let bx = cardX
      for (const badge of badges) {
        ctx.font = `600 ${Math.round(rFontBody * 0.9)}px Manrope, sans-serif`; const bw = ctx.measureText(badge).width + 20
        ctx.save(); roundRect(bx, y, bw, Math.round(rFontBody * 1.8), [10, 10, 10, 10])
        ctx.fillStyle = 'rgba(235,71,99,0.08)'; ctx.fill(); ctx.restore()
        ctx.fillStyle = '#eb4763'; ctx.textBaseline = 'middle'; ctx.fillText(badge, bx + 10, y + Math.round(rFontBody * 0.9))
        bx += bw + 8
      }
      y += Math.round(rFontBody * 3)
      const sections = [
        { label: locale === 'ko' ? '🧴 피부 타입' : '🧴 Skin Type', text: a.skinTypeDetail },
        { label: locale === 'ko' ? '🎨 톤 분석' : '🎨 Tone Analysis', text: a.toneDetail },
        { label: locale === 'ko' ? '💡 맞춤 조언' : '💡 Advice', text: a.advice },
      ]
      for (const s of sections) {
        ctx.fillStyle = '#070953'; ctx.font = `700 ${rFontBody}px Manrope, sans-serif`; ctx.textBaseline = 'top'
        ctx.fillText(s.label, cardX, y); y += Math.round(rFontBody * 1.6)
        ctx.fillStyle = '#475569'; ctx.font = `400 ${rFontBody}px Manrope, sans-serif`
        const h = wrapText(ctx, s.text, cardX, cardContentW, y, rLineH); y += h + Math.round(rLineH * 0.5)
      }
    }
    if (products.length > 0) {
      let py = gridH + reportH + rPad
      ctx.fillStyle = '#eb4763'; ctx.font = `800 ${rFontTitle}px Manrope, sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'top'
      ctx.fillText(locale === 'ko' ? '🛍️ 맞춤 화장품 추천' : '🛍️ Product Recommendations', rPad, py)
      py += Math.round(rFontTitle * 2)
      const prodCardH = Math.round(rFontBody * 7); const prodGap = Math.round(rFontBody * 0.8)
      const catColors: Record<string, string> = { Skin: '#f0abfc', Base: '#fbbf24', Eyes: '#818cf8', Lips: '#fb7185', Cheeks: '#f9a8d4', Brow: '#a78bfa', Primer: '#67e8f9' }
      for (const p of products) {
        ctx.save(); roundRect(rPad, py, gridW - rPad * 2, prodCardH, [radius, radius, radius, radius])
        ctx.fillStyle = '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,0.05)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 1; ctx.fill(); ctx.restore()
        const cx = rPad + Math.round(rPad * 0.6)
        const badgeSize = Math.round(rFontBody * 2.4); const badgeColor = catColors[p.category] || '#94a3b8'
        ctx.save(); roundRect(cx, py + Math.round((prodCardH - badgeSize) / 2), badgeSize, badgeSize, [8, 8, 8, 8])
        ctx.fillStyle = badgeColor; ctx.fill(); ctx.restore()
        ctx.fillStyle = '#ffffff'; ctx.font = `700 ${Math.round(rFontBody * 0.7)}px Manrope, sans-serif`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(p.category.slice(0, 3).toUpperCase(), cx + badgeSize / 2, py + prodCardH / 2)
        const tx = cx + badgeSize + Math.round(rPad * 0.5); ctx.textAlign = 'left'
        ctx.fillStyle = '#eb4763'; ctx.font = `700 ${Math.round(rFontBody * 0.7)}px Manrope, sans-serif`; ctx.textBaseline = 'top'
        let ty = py + Math.round(rFontBody * 0.6); ctx.fillText(p.category.toUpperCase(), tx, ty); ty += Math.round(rFontBody * 1.2)
        ctx.fillStyle = '#070953'; ctx.font = `700 ${rFontBody}px Manrope, sans-serif`
        ctx.fillText(p.name.length > 35 ? p.name.slice(0, 35) + '…' : p.name, tx, ty); ty += Math.round(rFontBody * 1.4)
        ctx.fillStyle = '#64748b'; ctx.font = `500 ${Math.round(rFontBody * 0.9)}px Manrope, sans-serif`
        ctx.fillText(`${p.brand} · ${p.price}`, tx, ty); ty += Math.round(rFontBody * 1.3)
        ctx.fillStyle = '#94a3b8'; ctx.font = `400 ${Math.round(rFontBody * 0.85)}px Manrope, sans-serif`
        ctx.fillText(p.reason.length > 50 ? p.reason.slice(0, 50) + '…' : p.reason, tx, ty)
        py += prodCardH + prodGap
      }
    }
    const brandY = totalH - brandH
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1; ctx.beginPath()
    ctx.moveTo(rPad, brandY + Math.round(brandH * 0.1)); ctx.lineTo(gridW - rPad, brandY + Math.round(brandH * 0.1)); ctx.stroke()
    try {
      const logoImg = new Image(); logoImg.crossOrigin = 'anonymous'; logoImg.src = '/logo.png'
      await new Promise<void>((resolve) => { logoImg.onload = () => resolve(); logoImg.onerror = () => resolve() })
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        const logoSize = Math.round(brandH * 0.45); const logoX = gridW / 2 - Math.round(gridW * 0.18); const logoY = brandY + Math.round((brandH - logoSize) / 2)
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
        const textX = logoX + logoSize + Math.round(gridW * 0.02)
        ctx.fillStyle = '#070953'; ctx.font = `800 ${Math.max(14, Math.round(gridW * 0.035))}px Manrope, sans-serif`
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('kissinskin', textX, brandY + brandH * 0.4)
        ctx.fillStyle = '#eb4763'; ctx.font = `600 ${Math.max(11, Math.round(gridW * 0.025))}px Manrope, sans-serif`
        ctx.fillText('kissinskin.net', textX, brandY + brandH * 0.65)
      }
    } catch {
      ctx.fillStyle = '#070953'; ctx.font = `800 ${Math.max(14, Math.round(gridW * 0.035))}px Manrope, sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('kissinskin', gridW / 2, brandY + brandH * 0.4)
      ctx.fillStyle = '#eb4763'; ctx.font = `600 ${Math.max(11, Math.round(gridW * 0.025))}px Manrope, sans-serif`
      ctx.fillText('kissinskin.net', gridW / 2, brandY + brandH * 0.65)
    }
    return canvas
  }

  const runAnalysis = async () => {
    setLoading(true); setError(null)
    gtagEvent('analysis_start', { gender, skin_type: skinType })
    try {
      const { gridPhoto, gridSize } = await createTiledGrid(photo!)
      const abortCtrl = new AbortController()
      const timeoutId = setTimeout(() => abortCtrl.abort(), 120_000) // 2 min client timeout
      const res = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo, gridPhoto, gridSize, gender: GENDER_MAP[gender!], skinType: SKIN_MAP[skinType!], lang: locale }),
        signal: abortCtrl.signal,
      })
      clearTimeout(timeoutId)
      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const text = await res.text(); console.error('[kissinskin] Non-JSON response:', res.status, text.slice(0, 200))
        throw new Error(`${t('error.analysisError')} [${res.status}:non-json]`)
      }
      const data = await res.json()
      if (!res.ok) { console.error('[kissinskin] API error:', data.error); throw new Error(`${t('error.analysisError')} ${data.error ? `[${String(data.error).slice(0, 150)}]` : `[${res.status}]`}`) }
      if (!data.image && !data.report) { reverseUsage(); throw new Error(t('error.bothGenFailed')) }
      if (!data.image) { reverseUsage(); throw new Error(t('error.imageGenFailed')) }
      if (!data.report) { reverseUsage(); throw new Error(t('error.reportGenFailed')) }
      setResultImage(data.image); setReport(data.report)
      gtagEvent('analysis_complete', { gender, skin_type: skinType, has_report: !!data.report, has_image: !!data.image })
      if (data.image && data.report && gender) {
        saveSharedResult(data.image, data.report, gender, activeStyles)
          .then(id => setShareId(id))
          .catch(err => {
            console.warn('[auto-save] Failed:', err)
            setTimeout(() => {
              saveSharedResult(data.image, data.report, gender, activeStyles)
                .then(id => setShareId(id))
                .catch(err2 => console.warn('[auto-save] Retry failed:', err2))
            }, 3000)
          })
      }
      const img = new Image()
      img.onerror = (e) => {
        console.warn('[analysis] grid image failed to load for slicing, showing full grid fallback', e)
        setResultCells([])
      }
      img.onload = async () => {
        try {
          const srcCellW = Math.floor(img.width / 3); const srcCellH = Math.floor(img.height / 3)
          const cells: string[] = []
          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
              const cvs = document.createElement('canvas'); cvs.width = srcCellW; cvs.height = srcCellH
              const ctx = cvs.getContext('2d')!
              ctx.drawImage(img, col * srcCellW, row * srcCellH, srcCellW, srcCellH, 0, 0, srcCellW, srcCellH)
              cells.push(cvs.toDataURL('image/jpeg', 0.85))
            }
          }
          setResultCells(cells)
        } catch (sliceErr) {
          console.warn('[analysis] canvas slicing failed, showing full grid fallback', sliceErr)
          setResultCells([])
        }
        if (data.report) {
          const targetEmail = customerEmailRef.current
          if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(targetEmail)) {
            console.warn('[send-report] No valid email available, skipping email report')
            setEmailWarning(locale === 'ko' ? '이메일 주소가 없어 리포트를 전송할 수 없습니다. 마이페이지에서 확인하세요.' : 'No email address available to send report. Check your account page.')
          } else {
            try {
              let composedImage = ''
              try { const composedCanvas = await buildCompositeCanvas(img, true); composedImage = composedCanvas.toDataURL('image/jpeg', 0.85) }
              catch (canvasErr) { console.warn('[send-report] canvas failed:', canvasErr) }
              const parsed = parseReport(data.report)
              gtagEvent('email_report_sent', { email_domain: targetEmail.split('@')[1] })
              fetch('/api/send-report', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: targetEmail, report: parsed || { summary: data.report, products: [] }, styles: activeStyles, resultImage: composedImage, lang: locale }),
              }).then(res => {
                if (!res.ok) setEmailWarning(locale === 'ko' ? '이메일 리포트 전송에 실패했습니다.' : 'Failed to send email report.')
              }).catch(() => setEmailWarning(locale === 'ko' ? '이메일 리포트 전송에 실패했습니다.' : 'Failed to send email report.'))
            } catch (emailErr) { console.warn('[send-report] email preparation failed:', emailErr); setEmailWarning(locale === 'ko' ? '이메일 리포트 준비에 실패했습니다.' : 'Failed to prepare email report.') }
          }
        }
      }
      img.src = data.image
    } catch (e) {
      const msg = e instanceof DOMException && e.name === 'AbortError'
        ? (locale === 'ko' ? '분석 시간이 초과되었습니다. 다시 시도해 주세요.' : 'Analysis timed out. Please try again.')
        : e instanceof Error ? e.message : t('error.analysisError')
      reverseUsage(); setError(msg)
      gtagEvent('analysis_error', { error_message: msg.slice(0, 100) })
    } finally { setLoading(false) }
  }

  const openCheckout = async (type: 'one-time' | 'subscription' = 'one-time') => {
    gtagEvent('begin_checkout', { checkout_type: type, value: type === 'subscription' ? 9.88 : 2.99, currency: 'USD' })
    try {
      if (isMobile) try { sessionStorage.setItem('kisskin_pending', JSON.stringify({ photo, gender, skinType, locale })) } catch { /* storage full or unavailable */ }
      const { res: checkoutRes, data: checkoutRaw } = await fetchJsonWithRetry('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: isMobile, email: user?.email, type }),
      }).catch((err) => { throw new Error(`${t('error.checkoutError')} [API:${err?.message || 'unknown'}]`) })
      const checkoutData = checkoutRaw as { id?: string; url?: string; error?: string }
      if (!checkoutRes.ok) throw new Error(checkoutData.error || `${t('error.checkoutCreate')} [${checkoutRes.status}]`)
      if (!checkoutData.url) throw new Error(`${t('error.checkoutError')} [NO_URL]`)
      if (!window.Polar?.EmbedCheckout) {
        if (isMobile) {
          const { res: redirectRes, data: redirectRaw } = await fetchJsonWithRetry('/api/checkout', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: true, redirect: true, email: user?.email, type }),
          }).catch(() => { throw new Error(`${t('error.checkoutError')}`) })
          const redirectData = redirectRaw as { url?: string; error?: string }
          if (redirectRes.ok && redirectData.url) { window.location.href = redirectData.url } else throw new Error(redirectData.error || t('error.checkoutCreate'))
          return
        }
        throw new Error(t('error.checkoutModule'))
      }
      const embeddedCheckoutId = checkoutData.id!; let paid = false
      let embed: Awaited<ReturnType<typeof window.Polar.EmbedCheckout.create>>
      try { embed = await window.Polar!.EmbedCheckout.create(checkoutData.url!, { theme: 'light' }) }
      catch (embedErr) { throw new Error(`${t('error.checkoutError')} [EMBED:${embedErr instanceof Error ? embedErr.message : String(embedErr)}]`) }
      const onCheckoutComplete = async () => {
        if (paid) return; paid = true; embed.close()
        if (isMobile) sessionStorage.removeItem('kisskin_pending')
        gtagEvent('purchase', { transaction_id: embeddedCheckoutId, value: type === 'subscription' ? 9.88 : 2.99, currency: 'USD', checkout_type: type })
        if (type === 'subscription') { await checkSubscription() }
        else {
          try { const vRes = await fetch('/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checkoutId: embeddedCheckoutId }) }); if (vRes.ok) { const vData = await vRes.json(); if (vData.customerEmail) customerEmailRef.current = vData.customerEmail } }
          catch { /* ok - proceed without email */ }
          runAnalysis()
        }
      }
      embed.addEventListener('success', onCheckoutComplete); embed.addEventListener('confirmed', onCheckoutComplete)
      embed.addEventListener('close', async () => {
        if (!paid) {
          try {
            const vRes = await fetch('/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checkoutId: embeddedCheckoutId }) })
            if (!vRes.ok) throw new Error('verify failed')
            const vData = await vRes.json()
            if (vData.status === 'succeeded' || vData.status === 'confirmed') {
              if (vData.customerEmail) customerEmailRef.current = vData.customerEmail
              paid = true
              if (type === 'subscription') await checkSubscription(); else runAnalysis()
              return
            }
          } catch { /* ok */ }
          if (type !== 'subscription') setError(t('error.paymentIncomplete'))
        }
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[checkout] error:', msg, e); setError(msg || t('error.checkoutError'))
    }
  }

  const handleSubmit = async () => {
    if (!isComplete) return; setError(null)
    gtagEvent('submit_analysis', { gender, skin_type: skinType, logged_in: !!user })
    if (user?.email) {
      if (!subStatus.checked) await checkSubscription()
      if (subStatus.active) {
        if (subStatus.limit !== -1 && subStatus.usage >= subStatus.limit) { setError(t('sub.usageLimitReached')); return }
        customerEmailRef.current = user.email
        // Track usage synchronously before starting analysis to prevent race conditions
        try {
          await fetch('/api/track-usage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email }) })
        } catch { /* proceed even if tracking fails */ }
        setSubStatus(prev => ({ ...prev, usage: prev.usage + 1 }))
        runAnalysis(); return
      }
    }
    await openCheckout('one-time')
  }

  // 모바일 결제 복귀 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const checkoutId = params.get('checkout_id')
    if (!checkoutId) return
    window.history.replaceState({}, '', window.location.pathname)
    const pending = sessionStorage.getItem('kisskin_pending')
    if (!pending) return; sessionStorage.removeItem('kisskin_pending')
    try {
      const data = JSON.parse(pending)
      setPhoto(data.photo); setGender(data.gender); setSkinType(data.skinType)
      if (data.locale) setLocale(data.locale)
      fetchJsonWithRetry('/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checkoutId }) })
        .then(({ data: result }) => {
          if (result.customerEmail && typeof result.customerEmail === 'string') customerEmailRef.current = result.customerEmail
          if (result.status === 'succeeded' || result.status === 'confirmed') setTimeout(() => runAnalysis(), 100)
          else setError(t('error.paymentIncomplete'))
        }).catch(() => setError(t('error.verifyError')))
    } catch { /* ok */ }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = () => { setResultImage(null); setResultCells([]); setReport(null); setError(null); setShareId(null) }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) setShowShareMenu(false)
    }
    if (showShareMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showShareMenu])

  const handleShare = async (platform: string) => {
    if (!resultImage) return
    gtagEvent('share', { method: platform, content_type: 'analysis_result' })
    try {
      let currentShareId = shareId
      if (!currentShareId && resultImage && report && gender) {
        try { currentShareId = await saveSharedResult(resultImage, report, gender, activeStyles); setShareId(currentShareId) }
        catch (e) {
          console.warn('[share] Failed to save result:', e)
          // Still proceed with share — URL will point to homepage as fallback
        }
      }
      const img = new Image(); img.src = resultImage
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject })
      const canvas = await buildCompositeCanvas(img, true)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9))
      if (!blob) { alert(t('error.shareImageFail')); return }
      const file = new File([blob], 'kissinskin-makeup.jpg', { type: 'image/jpeg' })
      const shareUrl = currentShareId ? `https://kissinskin.net/result/${currentShareId}` : 'https://kissinskin.net'
      const structured = report ? parseReport(report) : null; const a = structured?.analysis
      let shareText = ''
      if (a) {
        const stylesList = activeStyles.map((s, i) => `${i + 1}. ${s}`).join('\n')
        if (locale === 'ko') {
          shareText = `💄 AI 메이크업 분석 리포트 - kissinskin\n\n✨ 피부 분석\n• 피부 타입: ${a.skinType}\n• ${a.skinTypeDetail}\n• 톤: ${a.tone}\n• ${a.toneDetail}\n\n💡 맞춤 조언\n${a.advice}\n\n💄 메이크업 스타일 9종\n${stylesList}\n\n` +
            (structured.products.length > 0 ? `🛍️ 추천 제품\n${structured.products.map(p => `• ${p.brand} ${p.name} (${p.price}) - ${p.reason}`).join('\n')}\n\n` : '') + shareUrl
        } else {
          shareText = `💄 AI Makeup Analysis Report - kissinskin\n\n✨ Skin Analysis\n• Skin Type: ${a.skinType}\n• ${a.skinTypeDetail}\n• Tone: ${a.tone}\n• ${a.toneDetail}\n\n💡 Advice\n${a.advice}\n\n💄 9 Makeup Styles\n${stylesList}\n\n` +
            (structured.products.length > 0 ? `🛍️ Recommended Products\n${structured.products.map(p => `• ${p.brand} ${p.name} (${p.price}) - ${p.reason}`).join('\n')}\n\n` : '') + shareUrl
        }
      } else { shareText = (locale === 'ko' ? 'AI가 추천한 나만의 메이크업 스타일 9종' : 'My 9 AI-recommended makeup styles') + '\n' + shareUrl }
      // Void unused var warning while still keeping long-form text available for future platforms
      void shareText
      if (platform === 'native') {
        // Pass URL only — chat apps (KakaoTalk, iMessage, Discord, WhatsApp) then scrape OG meta
        // and render a proper preview card with thumbnail, like YouTube.
        try {
          if (navigator.share && navigator.canShare?.({ files: [file] })) await navigator.share({ title: 'kissinskin', url: shareUrl, files: [file] })
          else await navigator.share?.({ title: 'kissinskin', url: shareUrl })
        } catch (e) { if (e instanceof Error && e.name !== 'AbortError') alert(t('error.shareFail')) }
      } else if (platform === 'copy') {
        // Copy only the bare URL so pasting into any chat app triggers a rich OG preview.
        try {
          await navigator.clipboard.writeText(shareUrl)
          alert(t('error.copyLinkDone'))
        } catch { alert(t('error.copyFail')) }
      }
      setShowShareMenu(false)
    } catch (e) { if (e instanceof Error && e.name !== 'AbortError') alert(t('error.shareFallback')) }
  }

  const handleDownload = async () => {
    if (!resultImage) return
    try {
      const img = new Image()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('image load failed'))
        img.src = resultImage
      })
      const canvas = await buildCompositeCanvas(img)
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'))
      if (!blob) throw new Error('canvas toBlob failed')
      const file = new File([blob], 'kissinskin-makeup.png', { type: 'image/png' })
      // Web Share API with files — works in Android WebView (Chrome 89+) and iOS Safari,
      // letting the user save to Photos/Gallery via the system sheet.
      if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'kissinskin' })
          return
        } catch (e) {
          if (e instanceof Error && e.name === 'AbortError') return
          // fall through to anchor download
        }
      }
      // Fallback: anchor download (desktop browsers and older WebViews)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'kissinskin-makeup.png'
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch (e) {
      console.warn('[download] Failed:', e)
      alert(t('error.shareImageFail'))
    }
  }

  // ── RENDER ──

  // 로딩 화면
  if (loading) {
    return (
      <div className="analysis-page">
        <div className="top-bar">
          <button className="top-bar-back" onClick={() => navigate('/')} aria-label="Go back">
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
          <button className="top-bar-back" onClick={() => navigate('/')} aria-label="Go back">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="top-bar-title">{t('result.title')}</h2>
        </div>
        <div className="analysis-body">
          {report && (() => {
            const structured = parseReport(report); const a = structured?.analysis
            if (a) {
              return (
                <section className="ai-analysis-section">
                  <div className="ai-analysis-header"><span className="material-symbols-outlined">auto_awesome</span><h3>AI Skin Analysis</h3></div>
                  <div className="analysis-badges"><span className="analysis-badge">{a.gender}</span><span className="analysis-badge">{a.skinType}</span><span className="analysis-badge tone">{a.tone}</span></div>
                  <div className="analysis-cards">
                    <div className="analysis-card"><div className="analysis-card-icon"><span className="material-symbols-outlined">dermatology</span></div><div className="analysis-card-content"><h4>{t('result.skinType')}</h4><p>{a.skinTypeDetail}</p></div></div>
                    <div className="analysis-card"><div className="analysis-card-icon tone-icon"><span className="material-symbols-outlined">palette</span></div><div className="analysis-card-content"><h4>{t('result.toneAnalysis')}</h4><p>{a.toneDetail}</p></div></div>
                    <div className="analysis-advice"><span className="material-symbols-outlined">tips_and_updates</span><p>{a.advice}</p></div>
                  </div>
                </section>
              )
            }; return null
          })()}
          {resultImage && (
            <section className="result-section">
              <h3 className="section-heading">{t('result.makeupStyles')}</h3>
              {resultCells.length === 9 ? (
                <div className="makeup-grid">
                  {activeStyles.map((style, i) => (<div key={style} className="makeup-cell"><img src={resultCells[i]} alt={style} className="makeup-cell-img" /><p className="makeup-cell-label">{style}</p></div>))}
                </div>
              ) : (
                <div className="makeup-grid-fallback" style={{ display: 'flex', justifyContent: 'center' }}>
                  <img src={resultImage} alt="makeup grid" style={{ maxWidth: '100%', height: 'auto', borderRadius: '12px' }} />
                </div>
              )}
              <div className="action-btn-row">
                <button className="download-btn" onClick={handleDownload}><span className="material-symbols-outlined">download</span>{t('result.save')}</button>
                <button className="download-btn share-btn" onClick={async () => {
                  if (!shareId && resultImage && report && gender) {
                    try { const id = await saveSharedResult(resultImage, report, gender, activeStyles); setShareId(id) }
                    catch (e) {
                      console.warn('[share] Failed to save:', e)
                      setEmailWarning(locale === 'ko' ? '공유 링크 생성에 실패했습니다. 다시 시도해 주세요.' : 'Failed to generate share link. Please try again.')
                    }
                  }
                  setShowShareMenu(true)
                }}><span className="material-symbols-outlined">share</span>{t('result.share')}</button>
              </div>
              {/* AddToAny Share Buttons */}
              <div className="a2a_kit a2a_kit_size_32 a2a_default_style" style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '12px' }}
                data-a2a-url={shareId ? `https://kissinskin.net/result/${shareId}` : 'https://kissinskin.net'}
                data-a2a-title={locale === 'ko' ? 'AI 메이크업 분석 결과 - kissinskin' : 'AI Makeup Analysis - kissinskin'}>
                <a className="a2a_button_facebook"></a>
                <a className="a2a_button_kakao"></a>
                <a className="a2a_button_facebook_messenger"></a>
                <a className="a2a_button_threads"></a>
                <a className="a2a_button_linkedin"></a>
                <a className="a2a_button_reddit"></a>
                <a className="a2a_button_sms"></a>
                <a className="a2a_button_pinterest"></a>
                <a className="a2a_button_email"></a>
                <a className="a2a_dd" href="https://www.addtoany.com/share"></a>
              </div>
            </section>
          )}
          {showShareMenu && (() => {
            const shareUrl = shareId ? `https://kissinskin.net/result/${shareId}` : 'https://kissinskin.net'
            const sr = report ? parseReport(report) : null; const sa = sr?.analysis
            let shareTitle = '', shareTextFull = ''
            if (sa) {
              const topProducts = sr.products.slice(0, 3).map(p => `${p.brand} ${p.name}`).join(', ')
              shareTitle = locale === 'ko' ? `💄 AI 메이크업 분석 리포트 - kissinskin` : `💄 AI Makeup Analysis - kissinskin`
              const summary = locale === 'ko'
                ? `✨ ${sa.skinType} | ${sa.tone}\n💡 ${sa.advice}${topProducts ? `\n🛍️ 추천: ${topProducts}` : ''}`
                : `✨ ${sa.skinType} | ${sa.tone}\n💡 ${sa.advice}${topProducts ? `\n🛍️ Picks: ${topProducts}` : ''}`
              shareTextFull = `${shareTitle}\n${summary}\n\n${shareUrl}`
            } else { shareTitle = locale === 'ko' ? 'AI가 추천한 나만의 메이크업 스타일 9종' : 'My 9 AI-recommended makeup styles'; shareTextFull = `${shareTitle}\n${shareUrl}` }
            const encodedText = encodeURIComponent(shareTextFull); const encodedUrl = encodeURIComponent(shareUrl); const encodedTitle = encodeURIComponent(shareTitle)
            return (
              <div className="share-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowShareMenu(false) }}>
                <div className="share-modal">
                  <div className="share-modal-header"><h3>{t('result.share')}</h3><button className="share-modal-close" onClick={() => setShowShareMenu(false)} aria-label="Close"><span className="material-symbols-outlined">close</span></button></div>
                  <div className="share-icons-row">
                    {'share' in navigator && (<button className="share-option" onClick={() => handleShare('native')}><div className="share-icon-circle" style={{ background: '#2a2d8a' }}><span className="material-symbols-outlined">phone_iphone</span></div>{t('result.defaultShare')}</button>)}
                    <button className="share-option" onClick={() => handleShare('copy')}><div className="share-icon-circle" style={{ background: '#8b5cf6' }}><span className="material-symbols-outlined">content_copy</span></div>{t('result.copyLink')}</button>
                    <button className="share-option" onClick={() => { navigator.clipboard.writeText(shareUrl).then(() => alert(locale === 'ko' ? '링크가 복사되었습니다.\n카카오톡에 붙여넣기 해주세요!' : 'Link copied!\nPaste it in KakaoTalk.')).catch(() => alert(locale === 'ko' ? '링크 복사에 실패했습니다.' : 'Failed to copy link.')) }}><div className="share-icon-circle" style={{ background: '#FFE812' }}><svg viewBox="0 0 24 24" width="24" height="24" fill="#3C1E1E"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.726 1.802 5.113 4.508 6.463-.144.509-.926 3.281-.962 3.503 0 0-.019.162.085.224.104.062.227.029.227.029.3-.042 3.472-2.275 4.022-2.652.37.052.748.079 1.12.079 5.523 0 10-3.463 10-7.646C22 6.463 17.523 3 12 3z"/></svg></div>KakaoTalk</button>
                    <button className="share-option" onClick={() => { window.open(`https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`, '_blank', 'width=600,height=400') }}><div className="share-icon-circle" style={{ background: '#00B900' }}><svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg></div>LINE</button>
                    <button className="share-option" onClick={() => { window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank') }}><div className="share-icon-circle" style={{ background: '#25D366' }}><svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></div>WhatsApp</button>
                    <button className="share-option" onClick={() => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank', 'width=600,height=400') }}><div className="share-icon-circle" style={{ background: '#1877F2' }}><svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></div>Facebook</button>
                    <button className="share-option" onClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank', 'width=600,height=400') }}><div className="share-icon-circle" style={{ background: '#000' }}><svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></div>X</button>
                    <button className="share-option" onClick={() => { window.open(`https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`, '_blank', 'width=600,height=400') }}><div className="share-icon-circle" style={{ background: '#E60023' }}><svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg></div>Pinterest</button>
                    <button className="share-option" onClick={() => { window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank', 'width=600,height=400') }}><div className="share-icon-circle" style={{ background: '#0088cc' }}><svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></div>Telegram</button>
                    <button className="share-option" onClick={() => { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank', 'width=600,height=400') }}><div className="share-icon-circle" style={{ background: '#0A66C2' }}><svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></div>LinkedIn</button>
                    <button className="share-option" onClick={() => { window.open(`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`, '_blank', 'width=600,height=400') }}><div className="share-icon-circle" style={{ background: '#FF4500' }}><svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.884-7.003 4.884-3.874 0-7.004-2.19-7.004-4.884 0-.18.015-.36.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 000-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z"/></svg></div>Reddit</button>
                    <button className="share-option" onClick={() => { window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedText}` }}><div className="share-icon-circle" style={{ background: '#64748b' }}><span className="material-symbols-outlined">mail</span></div>Email</button>
                  </div>
                  <div className="share-link-bar"><span>{shareUrl}</span><button className="share-link-copy-btn" onClick={() => { navigator.clipboard.writeText(shareUrl).then(() => alert(t('error.copyLinkDone'))).catch(() => alert(t('error.copyFail'))) }}>{t('result.copyLink')}</button></div>
                </div>
              </div>
            )
          })()}
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
                          <div className="product-card-left"><span className="product-category-badge" style={{ backgroundColor: cat.bg }}><span className="material-symbols-outlined">{cat.icon}</span></span></div>
                          <div className="product-card-body">
                            <p className="product-category-label">{p.category}</p><p className="product-name">{p.name}</p>
                            <p className="product-brand-price">{p.brand} · {p.price}</p><p className="product-reason">{p.reason}</p>
                          </div>
                          <a className="product-buy-btn" href={buildBuyLink(p.brand, p.name)} target="_blank" rel="noopener noreferrer"
                            onClick={() => gtagEvent('select_item', { item_brand: p.brand, item_name: p.name, item_category: p.category, price: p.price })}>{t('result.buyNow')}</a>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            }; return null
          })()}
          <div className="fixed-cta-spacer" />
          <div className="fixed-cta"><button className="cta-btn" onClick={handleReset}>{t('common.tryAgain')}</button></div>
        </div>
      </div>
    )
  }

  // 입력 화면
  return (
    <div className="analysis-page">
      <div className="top-bar">
        <button className="top-bar-back" onClick={() => navigate('/')} aria-label="Go back">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="top-bar-title">{t('analysis.back')}</h2>
        <button onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
          style={{ fontSize: '12px', padding: '2px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', color: '#64748b', cursor: 'pointer' }}>
          {locale === 'ko' ? 'EN' : '한국어'}
        </button>
      </div>
      <div className="analysis-body setup-body">
        <section className="upload-section">
          <h3 className="upload-heading">{t('analysis.uploadTitle')}</h3>
          <p className="upload-sub">{t('analysis.uploadHint')}</p>
          <div className={`avatar-upload ${dragging ? 'dragging' : ''}`} onClick={() => openPicker('gallery')}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}>
            <div className={`avatar-circle ${photo ? 'has-photo' : ''} ${dragging ? 'dragging' : ''}`}>
              {photo ? (<><img src={photo} alt={t('analysis.changePhoto')} className="avatar-img" /><div className="avatar-hover"><span className="material-symbols-outlined">photo_camera</span><span>{t('analysis.changePhoto')}</span></div></>)
                : (<><span className="material-symbols-outlined avatar-placeholder-icon">add_a_photo</span><span className="avatar-placeholder-text">{t('analysis.selectPhoto')}</span></>)}
            </div>
            {photo && (<div className="avatar-edit-badge"><span className="material-symbols-outlined">edit</span></div>)}
          </div>
          <div className="upload-actions">
            <button type="button" className="upload-action-btn" onClick={(e) => { e.stopPropagation(); openPicker('gallery') }}>
              <span className="material-symbols-outlined">photo_library</span>
              {locale === 'ko' ? '갤러리' : 'Gallery'}
            </button>
            <button type="button" className="upload-action-btn camera" onClick={(e) => { e.stopPropagation(); openPicker('camera') }}>
              <span className="material-symbols-outlined">photo_camera</span>
              {locale === 'ko' ? '카메라' : 'Camera'}
            </button>
          </div>
        </section>
        <section className="form-group">
          <h4 className="section-label">{t('analysis.gender')}</h4>
          <div className="gender-row">
            {(['female', 'male'] as const).map((g) => (<button key={g} className={`gender-btn ${gender === g ? 'selected' : ''}`} onClick={() => setGender(g)}>{t(`analysis.${g}`)}</button>))}
          </div>
        </section>
        <section className="form-group">
          <div className="section-label-row"><h4 className="section-label">{t('analysis.skinType')}</h4><span className="section-label-hint">{t('analysis.skinTypeSelect')}</span></div>
          <div className="skin-grid">
            {(['oily', 'dry', 'combination', 'normal'] as const).map((type) => (
              <button key={type} className={`skin-card ${skinType === type ? 'selected' : ''}`} onClick={() => setSkinType(type)}>
                <div className="skin-card-top"><span className="material-symbols-outlined skin-card-icon">{SKIN_DATA[type].icon}</span>{skinType === type && <span className="material-symbols-outlined skin-card-check">check_circle</span>}</div>
                <span className="skin-card-name">{SKIN_LABELS[type]}</span><span className="skin-card-desc">{SKIN_DATA[type].desc}</span>
              </button>
            ))}
            <button className={`skin-card full-width horizontal ${skinType === 'not_sure' ? 'selected' : ''}`} onClick={() => setSkinType('not_sure')}>
              <div className="skin-card-h-left"><span className="material-symbols-outlined skin-card-icon">{SKIN_DATA['not_sure'].icon}</span><div className="skin-card-h-text"><span className="skin-card-name">{SKIN_LABELS['not_sure']}</span><span className="skin-card-desc">{SKIN_DATA['not_sure'].desc}</span></div></div>
              {skinType === 'not_sure' ? (<span className="material-symbols-outlined skin-card-check">check_circle</span>) : (<span className="material-symbols-outlined skin-card-chevron">chevron_right</span>)}
            </button>
          </div>
        </section>
        <div className="info-tip"><span className="material-symbols-outlined">info</span><p>{t('analysis.infoTip')}</p></div>
        {error && (<div className="error-msg"><span className="material-symbols-outlined">error</span>{error}</div>)}
        {emailWarning && (<div className="error-msg" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#f59e0b' }}><span className="material-symbols-outlined">warning</span>{emailWarning}</div>)}
      </div>
      {user && subStatus.checked && subStatus.active && (
        <div style={{ margin: '0 16px 8px', padding: '10px 14px', background: subStatus.status === 'trialing' ? '#fef3c7' : '#ecfdf5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ background: subStatus.status === 'trialing' ? '#f59e0b' : '#10b981', color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{subStatus.status === 'trialing' ? t('sub.trialBadge') : t('sub.proBadge')}</span>
            <span style={{ color: '#64748b' }}>{t('sub.usage')}: {subStatus.usage}{subStatus.limit === -1 ? ` / ${t('sub.unlimited')}` : ` / ${subStatus.limit}`}</span>
          </div>
          {subStatus.trialEndsAt && (<span style={{ color: '#92400e', fontSize: 11 }}>{t('sub.trialEnds')}: {new Date(subStatus.trialEndsAt).toLocaleDateString()}</span>)}
        </div>
      )}
      <div className="fixed-cta-spacer" />
      <div className="fixed-cta gradient">
        {user && subStatus.active && subStatus.limit !== -1 && subStatus.usage >= subStatus.limit ? (
          <button className="cta-btn" onClick={() => openCheckout('subscription')}><span>{t('sub.upgradeBtn')}</span><span className="material-symbols-outlined">upgrade</span></button>
        ) : user && subStatus.active ? (
          <button className={`cta-btn ${!isComplete ? 'disabled' : ''}`} disabled={!isComplete} onClick={handleSubmit}><span>{t('common.generateLooks')}</span><span className="material-symbols-outlined">auto_awesome</span></button>
        ) : (
          <button className={`cta-btn ${!isComplete ? 'disabled' : ''}`} disabled={!isComplete} onClick={handleSubmit}><span className="cta-price">$2.99</span><span>{t('common.generateLooks')}</span><span className="material-symbols-outlined">auto_awesome</span></button>
        )}
        {!(user && subStatus.active) && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0 8px', width: '100%' }}><div style={{ flex: 1, height: 1, background: 'rgba(7,9,83,0.1)' }} /><span style={{ fontSize: 11, color: 'rgba(7,9,83,0.35)', fontWeight: 500 }}>or</span><div style={{ flex: 1, height: 1, background: 'rgba(7,9,83,0.1)' }} /></div>
            <button className={`cta-btn ${!isComplete ? 'disabled' : ''}`} disabled={!isComplete}
              onClick={() => { if (!user) { navigate('/auth'); return }; openCheckout('subscription') }}
              style={{ background: '#fff', border: '1.5px solid #eb4763', color: '#eb4763', boxShadow: '0 4px 16px rgba(235,71,99,0.1)' }}>
              <span className="cta-price" style={{ background: 'rgba(235,71,99,0.1)', color: '#eb4763' }}>$9.88<span style={{ fontSize: 10, fontWeight: 400 }}>/mo</span></span>
              <span>{t('sub.subscribeGenerate')}</span><span className="material-symbols-outlined">all_inclusive</span>
            </button>
            <span style={{ fontSize: 11, color: '#eb4763', marginTop: 4, fontWeight: 500, opacity: 0.7 }}>{t('sub.ctaSubTrial')}</span>
          </>
        )}
      </div>
      {showInstallBanner && (
        <div className="pwa-install-banner">
          <img src="/icons/icon-96x96.png" alt="kissinskin" className="pwa-install-icon" />
          <div className="pwa-install-text"><strong>kissinskin</strong><span>{locale === 'ko' ? '홈 화면에 추가하고 빠르게 이용하세요' : 'Add to home screen for quick access'}</span></div>
          <button className="pwa-install-btn" onClick={handleInstallClick}>{locale === 'ko' ? '설치' : 'Install'}</button>
          <button className="pwa-install-close" onClick={dismissInstallBanner} aria-label="Close"><span className="material-symbols-outlined">close</span></button>
        </div>
      )}
      {showIosGuide && (
        <div className="share-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowIosGuide(false) }}>
          <div className="share-modal">
            <div className="share-modal-header"><h3>{locale === 'ko' ? '앱 설치 방법' : 'How to Install'}</h3><button className="share-modal-close" onClick={() => setShowIosGuide(false)} aria-label="Close"><span className="material-symbols-outlined">close</span></button></div>
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <img src="/icons/icon-96x96.png" alt="kissinskin" style={{ width: 64, height: 64, borderRadius: 14, margin: '0 auto 16px', display: 'block' }} />
              <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, textAlign: 'left' }}>
                <p style={{ margin: '0 0 16px', fontWeight: 700, textAlign: 'center', color: '#121570' }}>{locale === 'ko' ? 'Safari에서 홈 화면에 추가하세요' : 'Add to Home Screen from Safari'}</p>
                <p style={{ margin: '0 0 10px' }}><strong>1.</strong> {locale === 'ko' ? ' 하단의 ' : ' Tap the '}<span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: 'middle', color: '#007AFF' }}>ios_share</span>{locale === 'ko' ? ' 공유 버튼을 탭하세요' : ' share button below'}</p>
                <p style={{ margin: '0 0 10px' }}><strong>2.</strong> {locale === 'ko' ? ' 스크롤 후 "홈 화면에 추가"를 탭하세요' : ' Scroll and tap "Add to Home Screen"'}</p>
                <p style={{ margin: 0 }}><strong>3.</strong> {locale === 'ko' ? ' 오른쪽 상단 "추가"를 탭하세요' : ' Tap "Add" in the top right'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
