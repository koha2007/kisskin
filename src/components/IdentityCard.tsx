// IdentityCard — shared 9:16 result card used by all 4 free tools (FINAL §3-4).
// On screen: a scaled-down DOM preview (mirrors the canvas layout).
// "이미지로 저장": renders the real 1080×1920 PNG via the pure-canvas renderer
// in src/lib/cardToPng.ts (decision ①) and exports it.
//
// 2026-07-27 — 저장·공유가 "눌러도 아무 일 없음" 이던 버그 수정.
// 원인은 기능 부재가 아니라 **경로가 하나뿐**이었던 것: toDataURL + <a download>.
//   · iOS Safari — data: URL 에 download 속성을 무시 → 무반응
//   · 카카오/네이버/인스타 인앱 브라우저 — download 무반응 (한국 유입 대부분)
//   · Expo 앱 웹뷰 — download 도 navigator.share 도 없음
//   · 공유 버튼 — 이미지가 아니라 텍스트+링크만 보냈다(카드 공유가 목적인데)
// AI 메이크업(MakeupResult.tsx)이 이미 풀어 둔 환경별 분기를 그대로 가져온다.

import { useState, useEffect, useRef } from 'react'
import type { IdentityCardData } from '../lib/identityCard/types'
import { buildIdentityCardImage, trackCardSaved, type IdentityCardImage } from '../lib/cardToPng'
import { isNativeApp, nativeSaveImage, nativeShareImage } from '../lib/nativePicker'

const isAbort = (e: unknown) => e instanceof Error && e.name === 'AbortError'

interface Props {
  /** 진단명 라벨 — e.g. "향수 타입" */
  label: string
  emoji: string
  card: IdentityCardData
  /** PNG 파일명 슬러그 — e.g. "perfume-floral" */
  fileSlug: string
  saveLabel?: string
  /** 카드 바로 옆 공유 버튼. 넘기지 않으면 버튼이 뜨지 않는다. */
  share?: { url: string; text: string; title: string }
  shareLabel?: string
  /**
   * 버튼 안에서만 쓰는 로케일 플래그 — 진행/완료 문구("저장 중…", "복사됨")는
   * 부모가 넘기는 라벨에 없어서 여기서 갈라야 한다. 카드 본문 텍스트는
   * `localizeCard()` 가 이미 로케일에 맞게 넘겨 주므로 여기서 손대지 않는다.
   */
  isEn?: boolean
}

export default function IdentityCard({ label, emoji, card, fileSlug, saveLabel, share, shareLabel, isEn = false }: Props) {
  const [saving, setSaving] = useState(false)
  const [shared, setShared] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [from, to] = card.gradient

  const fileName = `kissinskin-${fileSlug}.png`
  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 3200)
  }

  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent
  const isMobile = /Mobi|Android|iP(hone|ad|od)/i.test(ua)
  const isIOS = /iP(hone|ad|od)/i.test(ua)
    || (/Mac/.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document)

  // ── 카드 PNG 를 미리 만들어 캐시한다 ────────────────────────────────────
  // navigator.share() 는 호출 시점에 사용자 제스처(transient activation)가 살아
  // 있어야 한다. 탭한 뒤에 폰트 로딩+1080×1920 렌더+toBlob 을 await 하면 활성화가
  // 만료돼 NotAllowedError 로 죽는다(iOS). 렌더는 마운트 직후 미리 끝내 둔다.
  const imageRef = useRef<IdentityCardImage | null>(null)
  // ⚠️ 의존성은 `card` 객체가 아니라 **내용 키**다. 결과 페이지들이
  //   `const card = localizeCard(t.card, isEn)` 를 렌더마다 새로 만들어서(EN 경로),
  //   객체를 의존성에 넣으면 저장 버튼을 눌러 setSaving 이 리렌더를 일으키는 순간
  //   이펙트가 다시 돌며 방금 쓰려던 캐시를 지워 버린다.
  const cardKey = `${label}|${emoji}|${fileName}|${card.nickname}|${card.identityLine}|${card.hashtags.join(',')}`
  useEffect(() => {
    imageRef.current = null
    let cancelled = false
    buildIdentityCardImage({ label, emoji, card }, fileName)
      .then((img) => { if (!cancelled) imageRef.current = img })
      .catch(() => { /* 탭 시 온디맨드로 재시도 */ })
    return () => { cancelled = true }
    // 카드 내용이 바뀌면(로케일 토글 등) 다시 만든다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardKey])

  const getImage = async (): Promise<IdentityCardImage> => {
    if (imageRef.current) return imageRef.current
    const img = await buildIdentityCardImage({ label, emoji, card }, fileName)
    imageRef.current = img
    return img
  }

  /** 이미지를 새 탭으로 연다 — iOS 사진첩 저장 경로("길게 눌러 → 사진에 저장"). */
  const openImageTab = (file: File): boolean => {
    const url = URL.createObjectURL(file)
    // ⚠️ 'noopener' 를 주면 안 된다 — 명세상 window.open 이 **항상 null 을 반환**해서
    //   "팝업이 막혔다" 로 오판하고, 실제로는 열린 탭의 blob URL 을 즉시 revoke 해
    //   빈 탭만 남긴 채 <a download> 로 폴백한다(iOS 는 그것도 무시 → 무반응).
    //   같은 출처의 blob 이라 opener 노출 위험도 없다.
    const win = window.open(url, '_blank')
    if (!win) {
      URL.revokeObjectURL(url)
      return false
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    return true
  }

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  // 2026-07-22: GA4 30일 기준 makeup_save 4명 / makeup_share 3명.
  // 기능이 없어서가 아니라 **공유 UI가 페이지 한참 아래(ShareBar)에만 있어서** 도달을 못 했다.
  // Colorwise 는 결과가 뜨는 순간 저장/공유를 나란히 1급으로 놓는다. 그 자리를 여기로 올린다.
  //
  // 공유는 "카드 이미지 + 링크" 가 기본이다. 이미지 공유가 불가능한 환경에서만
  // 텍스트+링크로 떨어진다(예전엔 어느 환경이든 텍스트+링크뿐이었다).
  const onShare = async () => {
    if (!share) return
    const nav = navigator as Navigator & {
      share?: (d: ShareData) => Promise<void>
      canShare?: (d: ShareData) => boolean
    }

    // 앱 웹뷰: navigator.share 가 아예 없어 클립보드로 새던 것 → 네이티브 공유 시트.
    if (isNativeApp()) {
      try {
        const img = await getImage()
        const ok = await nativeShareImage(img.dataUrl)
        if (!ok) showToast(isEn ? 'Share failed — try again' : '공유에 실패했어요. 다시 시도해 주세요')
      } catch {
        showToast(isEn ? 'Share failed — try again' : '공유에 실패했어요. 다시 시도해 주세요')
      }
      return
    }

    const cached = imageRef.current
    // 빠른 경로: 캐시된 파일로 탭 즉시 공유 → iOS 활성화 유지.
    if (cached && isMobile && typeof nav.canShare === 'function' && nav.canShare({ files: [cached.file] })) {
      try {
        await nav.share({ files: [cached.file], title: share.title, text: share.text, url: share.url })
        return
      } catch (e) {
        if (isAbort(e)) return
      }
    }

    try {
      const img = cached ?? await getImage()
      if (isMobile && typeof nav.canShare === 'function' && nav.canShare({ files: [img.file] })) {
        try {
          await nav.share({ files: [img.file], title: share.title, text: share.text, url: share.url })
          return
        } catch (e) {
          if (isAbort(e)) return
        }
      }
    } catch {
      /* 렌더 실패 — 아래 링크 공유로 폴백 */
    }

    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title: share.title, text: share.text, url: share.url })
        return
      } catch (e) {
        if (isAbort(e)) return
      }
    }

    try {
      await navigator.clipboard.writeText(`${share.text}${share.url}`)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      showToast(isEn ? 'Copy failed — copy the link from the address bar' : '복사에 실패했어요. 주소창의 링크를 복사해 주세요')
    }
  }

  // 저장 — 공유 시트를 열지 않는다(그건 공유 버튼의 일). 실제로 파일이 기기에
  // 남는 경로만 쓴다. 환경별 분기는 MakeupResult.handleSave 와 동일하다.
  const onSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      // 앱 웹뷰: <a download> 무반응 → 네이티브 갤러리 저장 브릿지.
      if (isNativeApp()) {
        const img = await getImage()
        const ok = await nativeSaveImage(img.dataUrl)
        if (ok) {
          trackCardSaved({ label, emoji, card }, 'native')
          showToast(isEn ? 'Saved to your gallery' : '갤러리에 저장했어요')
        } else {
          showToast(isEn ? 'Save failed — allow photo permission and try again' : '저장에 실패했어요. 사진 권한을 허용하고 다시 시도해 주세요')
        }
        return
      }

      // iOS/인앱 브라우저: download 속성이 무시된다 → 이미지를 새 탭으로 열어
      // "길게 눌러 → 사진에 저장". 캐시가 있으면 동기적으로 열려 팝업차단도 없다.
      const saveHint = isEn
        ? 'Press & hold the image → "Save to Photos"'
        : '이미지를 길게 눌러 "사진에 저장"을 선택하세요'
      const cached = imageRef.current
      if (isIOS && cached && openImageTab(cached.file)) {
        trackCardSaved({ label, emoji, card }, 'newtab')
        showToast(saveHint)
        return
      }

      const img = cached ?? await getImage()
      if (isIOS && openImageTab(img.file)) {
        trackCardSaved({ label, emoji, card }, 'newtab')
        showToast(saveHint)
        return
      }
      downloadFile(img.file)
      trackCardSaved({ label, emoji, card }, 'download')
      showToast(isEn ? 'Saved to your device' : '이미지를 저장했어요')
    } catch (e) {
      console.error('card save failed', e)
      showToast(isEn ? 'Save failed — try again' : '저장에 실패했어요. 다시 시도해 주세요')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* 9:16 미리보기 — 실제 PNG와 동일 레이아웃의 축소판 */}
      <div
        className="w-full max-w-[300px] rounded-3xl shadow-2xl overflow-hidden text-white"
        style={{ aspectRatio: '9 / 16', background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
      >
        <div className="h-full w-full flex flex-col items-center justify-between px-6 py-8 text-center">
          <p className="text-[11px] font-semibold tracking-[0.3em] text-white/80 uppercase">{label}</p>

          <div className="flex flex-col items-center gap-3 -mt-2">
            <div className="text-[88px] leading-none drop-shadow-lg">{emoji}</div>
            <h3 className="text-3xl font-extrabold leading-tight px-1">{card.nickname}</h3>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-white/75">
              {card.enName.toUpperCase()}
            </p>
            <p className="text-sm font-medium text-white/95 leading-snug px-1">“{card.identityLine}”</p>
          </div>

          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex flex-wrap justify-center gap-1.5">
              {card.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold bg-white/16 rounded-full px-2.5 py-1 whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-[11px] font-bold tracking-wider text-white/90">kissinskin.net</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        // 카드 내부 타이포는 건드리지 않는다 — 이 미리보기는 src/lib/cardToPng.ts 의
        // 1080×1920 캔버스 렌더러와 레이아웃이 1:1로 맞춰져 있어서, 여기만 바꾸면
        // 화면과 저장되는 PNG가 어긋난다. 버튼(카드 밖)만 새 언어로 맞춘다.
        className="inline-flex items-center gap-2 bg-navy hover:bg-navy-mid transition-colors text-white px-7 py-3.5 font-bold t-body disabled:opacity-60"
      >
        <span className="material-symbols-outlined">{saving ? 'hourglass_top' : 'download'}</span>
        {saving
          ? (isEn ? 'Saving…' : '저장 중…')
          : (saveLabel ?? (isEn ? 'Save image' : '이미지로 저장'))}
      </button>

        {share && (
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-2 border border-navy/25 hover:border-navy transition-colors text-navy px-7 py-3.5 font-bold t-body"
          >
            <span className="material-symbols-outlined">{shared ? 'check' : 'share'}</span>
            {shared
              ? (isEn ? 'Copied' : '복사됨')
              : (shareLabel ?? (isEn ? 'Share' : '공유하기'))}
          </button>
        )}
      </div>

      {/* 결과 피드백 — 저장 경로가 환경마다 달라(다운로드/새 탭/갤러리) 무엇이
          일어났는지 말해 주지 않으면 성공해도 "안 됐다"로 읽힌다. */}
      {toast && (
        <p
          role="status"
          className="max-w-[320px] text-center text-sm font-semibold text-navy bg-white/90 border border-navy/15 rounded-xl px-4 py-2.5 leading-snug"
        >
          {toast}
        </p>
      )}
    </div>
  )
}
