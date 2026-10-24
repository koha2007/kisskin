// 생성 결과 "이미지 저장 + 메일로 받기" — 럭키 메이크업 결과용 (2026-10-24)
// ────────────────────────────────────────────────────────────────────
// 운영자: "럭키 메이크업 결과 값을 메이크업 9종과 똑같이 이미지 저장과 메일로 받기로."
// → MakeupResult(9종)의 handleSave·handleEmail 과 같은 규칙을 그대로 옮겼다:
//   · 저장 이미지 = buildMakeupComposite(9:16, 룩 이름·설명·kissinskin 브랜딩) — 9종과 같은 장
//   · 합성은 결과가 나오면 미리 만들어 둔다(iOS 는 탭 직후 동기로 열어야 팝업이 안 막힘)
//   · 앱 웹뷰 = 네이티브 갤러리 저장 / iOS = 새 탭 열고 "길게 눌러 사진에 저장" / 그 외 = 바로 다운로드
//   · 메일 = /api/send-report (합성 이미지 첨부), 로그인했으면 이메일 자동 채움 + 주간 메일 동의(선택)
import { useEffect, useRef, useState } from 'react'
import MarketingConsent from '../MarketingConsent'
import { buildMakeupComposite } from '../../lib/makeup/composite'
import { isNativeApp, nativeSaveImage } from '../../lib/nativePicker'
import { supabase } from '../../lib/supabase'
import { trackEvent } from '../../lib/analytics'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Composite = { file: File; dataUrl: string }

export default function ResultSaveEmail({ image, name, desc, fileName, tag, isEn }: {
  /** 생성 결과 data URL */
  image: string
  /** 룩 이름(합성 이미지·메일 라벨) */
  name: string
  desc: string
  fileName: string
  /** GA4 구분값(예: 'lucky:wealth') */
  tag: string
  isEn: boolean
}) {
  const [toast, setToast] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const compositeRef = useRef<Composite | null>(null)
  const flash = (m: string) => { setToast(m); window.setTimeout(() => setToast((c) => (c === m ? null : c)), 2400) }

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : ''
  // iPadOS Safari 는 UA 를 Mac 으로 보고하므로 터치 여부로 함께 판별
  const isIOS = /iP(hone|ad|od)/i.test(ua) || (/Mac/.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document)

  const makeComposite = async (): Promise<Composite> => {
    const canvas = await buildMakeupComposite({ afterSrc: image, styleName: name, styleDesc: desc, isEn })
    const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob null'))), 'image/jpeg', 0.92))
    return { file: new File([blob], fileName, { type: 'image/jpeg' }), dataUrl: canvas.toDataURL('image/jpeg', 0.9) }
  }
  const getComposite = async () => (compositeRef.current ??= await makeComposite())

  // 결과가 나오면 합성을 미리 만든다 + 로그인 이메일 자동 채움
  useEffect(() => {
    compositeRef.current = null
    let off = false
    makeComposite().then((c) => { if (!off) compositeRef.current = c }).catch(() => { /* 탭 때 다시 */ })
    supabase.auth.getSession().then(({ data }) => {
      const e = data.session?.user?.email
      if (!off && e) setEmail((cur) => cur || e)
    }).catch(() => { /* 익명 — 직접 입력 */ })
    return () => { off = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image])

  const openImageTab = (file: File): boolean => {
    const url = URL.createObjectURL(file)
    // 'noopener' 금지 — window.open 이 항상 null 을 돌려줘 팝업 차단으로 오판한다(MakeupResult 2026-07-27)
    const win = window.open(url, '_blank')
    if (!win) { URL.revokeObjectURL(url); return false }
    window.setTimeout(() => URL.revokeObjectURL(url), 60000)
    return true
  }
  const download = (file: File) => {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url; a.download = fileName; a.rel = 'noopener'
    document.body.appendChild(a); a.click(); a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    trackEvent('makeup_save', { style: tag, method: 'download' })
    flash(isEn ? 'Saved to your device' : '이미지를 저장했어요')
  }

  const save = async () => {
    if (isNativeApp()) {
      try {
        const ok = await nativeSaveImage((await getComposite()).dataUrl)
        trackEvent('makeup_save', { style: tag, method: 'native' })
        flash(ok ? (isEn ? 'Saved to your gallery' : '갤러리에 저장했어요') : (isEn ? 'Save failed — allow photo permission and try again' : '저장에 실패했어요. 사진 권한을 허용하고 다시 시도해 주세요'))
      } catch { flash(isEn ? 'Save failed — try again' : '저장에 실패했어요. 다시 시도해 주세요') }
      return
    }
    const hint = isEn ? 'Press & hold the image → "Save to Photos"' : '이미지를 길게 눌러 "사진에 저장"을 선택하세요'
    const cached = compositeRef.current
    if (isIOS && cached && openImageTab(cached.file)) { trackEvent('makeup_save', { style: tag, method: 'newtab' }); flash(hint); return }
    try {
      const c = cached ?? await getComposite()
      if (isIOS && openImageTab(c.file)) { trackEvent('makeup_save', { style: tag, method: 'newtab' }); flash(hint); return }
      download(c.file)
    } catch { flash(isEn ? 'Save failed — try again' : '저장에 실패했어요. 다시 시도해 주세요') }
  }

  const sendEmail = async () => {
    const target = email.trim()
    if (!EMAIL_RE.test(target)) { setEmailState('error'); flash(isEn ? 'Enter a valid email' : '올바른 이메일을 입력해 주세요'); return }
    setEmailState('sending')
    try {
      const { dataUrl } = await getComposite()
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: target, report: { summary: desc, products: [] }, styles: [name], resultImage: dataUrl, lang: isEn ? 'en' : 'ko' }),
      })
      if (!res.ok) throw new Error('send failed')
      setEmailState('sent')
      trackEvent('makeup_email_sent', { style: tag, email_domain: target.split('@')[1] })
    } catch {
      setEmailState('error')
      flash(isEn ? 'Failed to send — try again' : '전송에 실패했어요. 다시 시도해 주세요')
    }
  }

  return (
    <div className="space-y-2">
      {toast && <div role="status" className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white shadow-lg">{toast}</div>}
      <button type="button" onClick={() => void save()} className="flex w-full items-center justify-center gap-1.5 bg-primary-dark py-3.5 text-[15px] font-bold text-white hover:bg-primary transition-colors">
        <span className="material-symbols-outlined text-base">download</span>{isEn ? 'Save image' : '이미지 저장'}
      </button>

      <MarketingConsent isEn={isEn} variant="prompt" />

      {/* 메일로 받기 — 로그인 시 자동 채움, 익명은 직접 입력 */}
      <div className="bg-white/10 p-4">
        {emailState === 'sent' ? (
          <p className="flex items-center gap-2 text-[13px] font-bold text-emerald-300">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
            {isEn ? 'Sent! Check your inbox (and spam).' : '전송 완료! 받은편지함(스팸함)을 확인하세요.'}
          </p>
        ) : (
          <>
            <label htmlFor="lucky-email" className="mb-2 flex items-center gap-1.5 text-[12px] font-bold text-white/80">
              <span className="material-symbols-outlined text-base">mail</span>{isEn ? 'Email me this result' : '이 결과를 메일로 받기'}
            </label>
            <div className="flex gap-2">
              <input id="lucky-email" type="email" inputMode="email" autoComplete="email" value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailState === 'error') setEmailState('idle') }}
                placeholder={isEn ? 'you@example.com' : '이메일 주소'}
                className="min-w-0 flex-1 bg-white px-3 py-2.5 text-[14px] font-medium text-navy placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-white/60" />
              <button type="button" onClick={() => void sendEmail()} disabled={emailState === 'sending'}
                className="shrink-0 bg-primary-dark px-4 py-2.5 text-[13px] font-extrabold text-white hover:bg-primary disabled:opacity-50 transition-colors">
                {emailState === 'sending' ? (isEn ? 'Sending…' : '전송 중…') : (isEn ? 'Send' : '보내기')}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-white/45">{isEn ? 'We email the look image + branding. No spam, unsubscribe anytime.' : '룩 이미지와 브랜딩을 메일로 보내드려요. 스팸 없이, 언제든 수신 거부 가능.'}</p>
          </>
        )}
      </div>
    </div>
  )
}
