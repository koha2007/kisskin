// 10장 묶음(9장 + 3×3 모아보기) 저장·메일 공용 — 9룩 컬렉션 · 럭키 메이크업 9장 (2026-10-29)
// ────────────────────────────────────────────────────────────────────
// 운영자 10/29: "럭키 메이크업 결과물도 9가지 메이크업 결과물과 똑같이 이미지 저장과 메일로 받게."
// → MakeupCollection 에만 있던 저장 분기·메일 발송을 여기로 옮겨 두 화면이 같은 코드를 쓴다.
import { supabase } from '../supabase'
import { isNativeApp, nativeSaveImage } from '../nativePicker'

export function dataUrlToFile(dataUrl: string, name: string): File {
  const [head, b64] = dataUrl.split(',')
  const type = /data:([^;]+)/.exec(head)?.[1] || 'image/jpeg'
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new File([arr], name, { type })
}

// 저장 경로 판정 — 인앱 브라우저(인스타·카톡·틱톡·네이버 등)는 다운로드를 무시하거나 파일 공유를
// 못 해서 "꾹 눌러 저장" 보기로 보낸다. iOS 는 공유 창의 "이미지 N개 저장"이 사진첩으로 바로 간다.
// 안드로이드 크롬 공유 창엔 "기기에 저장"이 없는 폰이 많아 공유 대신 다운로드(갤러리에 잡힌다).
const ua = () => (typeof navigator === 'undefined' ? '' : navigator.userAgent)
const isInApp = () => /KAKAOTALK|Instagram|FBAN|FBAV|NAVER\(inapp|Line\/|musical_ly|BytedanceWebview|TikTok|Snapchat/i.test(ua())
const isIOS = () => /iPhone|iPad|iPod/.test(ua()) || (/Macintosh/.test(ua()) && typeof document !== 'undefined' && 'ontouchend' in document)

/** 'viewer' = 호출한 화면이 "꾹 눌러 저장" 보기를 열어야 한다 / 'cancel' = 공유 창을 닫음 */
export type SaveAllMethod = 'native' | 'viewer' | 'share' | 'download' | 'cancel'

/** files 와 dataUrls 는 같은 순서(앱은 data URL 로 갤러리 저장) */
export async function saveAllImages(files: File[], dataUrls: string[], title: string): Promise<SaveAllMethod> {
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (isNativeApp()) {
    for (const u of dataUrls) await nativeSaveImage(u)
    return 'native'
  }
  if (isInApp()) return 'viewer'
  // 아이폰: 공유 시트 한 번으로 10장을 사진첩에 저장/바로 올리기
  if (isIOS() && typeof nav.share === 'function' && nav.canShare?.({ files })) {
    try {
      await nav.share({ files, title })
      return 'share'
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancel'
    }
  }
  // 안드로이드 크롬·데스크톱: 하나씩 내려받기(크롬이 "여러 파일 다운로드 허용"을 한 번 묻는다)
  for (const f of files) {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(f)
    a.download = f.name
    document.body.appendChild(a); a.click(); a.remove()
    await new Promise((r) => setTimeout(r, 250))
  }
  return 'download'
}

export function saveOneImage(file: File) {
  if (isNativeApp()) {
    const r = new FileReader()
    r.onload = () => { void nativeSaveImage(String(r.result)) }
    r.readAsDataURL(file)
    return
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(file)
  a.download = file.name
  document.body.appendChild(a); a.click(); a.remove()
}

export type MailResult = { k: 'sent'; to: string } | { k: 'login' } | { k: 'limit' } | { k: 'error' }

/** 로그인한 계정 메일로만 보낸다(/api/collection-mail). kind 는 메일 제목·본문·링크만 바꾼다 */
export async function mailImages(images: { name: string; dataUrl: string }[], lang: 'ko' | 'en', kind: 'collection' | 'lucky' = 'collection'): Promise<MailResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { k: 'login' }
    const res = await fetch('/api/collection-mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ images, lang, kind }),
    })
    const d = (await res.json().catch(() => ({}))) as { to?: string }
    if (res.status === 429) return { k: 'limit' }
    if (!res.ok) return { k: 'error' }
    return { k: 'sent', to: d.to || '' }
  } catch {
    return { k: 'error' }
  }
}
