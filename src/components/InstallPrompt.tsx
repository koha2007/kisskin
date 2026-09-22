// 홈 화면 설치(PWA) 유도 띠.
//
// 왜 필요했나(2026-09-23 운영자 보고: "설치되는 사람과 안 되는 사람이 있다"):
// 설치 요건은 처음부터 다 갖춰져 있었다 — manifest·서비스워커·아이콘 전부 정상이고
// Chrome 이 `beforeinstallprompt` 도 정상적으로 쏜다. 문제는 **그걸 받아 버튼을 띄우는
// UI 가 `src/AnalysisApp.tsx` 안에만 있었다는 것**이다. 그 파일은 라우팅에서 빠진
// 죽은 코드라(2026-07-06 메모), 사이트 어디에서도 설치 안내가 뜨지 않았다.
// → 설치에 성공한 사람은 브라우저 메뉴("앱 설치")를 스스로 찾은 사람뿐이었다.
//
// 브라우저마다 가능한 것이 다르다. 그래서 세 갈래로 갈라 대응한다:
//   ① Chrome/Edge/Samsung(안드로이드·데스크톱) — `beforeinstallprompt` → 버튼 한 번
//   ② iOS Safari — 설치 API 가 아예 없다. '공유 → 홈 화면에 추가' 를 글로 안내한다.
//   ③ 인앱 브라우저(네이버·카카오·인스타…) — 설치 자체가 불가능 → 띄우지 않는다.
//      (여기서 "설치하세요" 라고 하면 방법이 없는 사람에게 말을 거는 꼴이 된다.)
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { trackEvent } from '../lib/analytics'

const DISMISS_KEY = 'kissinskin_install_dismissed'
const DISMISS_DAYS = 30
/** 쿠키 배너와 같은 자리(화면 아래 고정)다. 배너가 떠 있는 동안은 양보한다. */
const COOKIE_KEY = 'kissinskin_cookie_consent'

type Mode = 'hidden' | 'prompt' | 'ios'

interface DeferredPrompt {
  prompt: () => void
  userChoice: Promise<{ outcome: string }>
}

function readDismissed(): boolean {
  try {
    const at = Number(window.localStorage.getItem(DISMISS_KEY) || 0)
    return !!at && Date.now() - at < DISMISS_DAYS * 86400000
  } catch {
    return false
  }
}

export default function InstallPrompt() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const [mode, setMode] = useState<Mode>('hidden')

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 이미 설치된 앱으로 열린 화면에서는 설치를 권하지 않는다.
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    if (standalone) return

    // 로그인·메이크업 생성 흐름은 방해하지 않는다(전환이 걸려 있는 화면).
    if (/^\/(en\/)?(auth|analysis)(\/|$)/.test(window.location.pathname)) return

    if (readDismissed()) return

    let consent: string | null = null
    try {
      consent = window.localStorage.getItem(COOKIE_KEY)
    } catch {
      /* 차단된 환경 — 쿠키 배너가 계속 떠 있으므로 설치 띠는 접는다 */
    }
    if (consent !== 'granted' && consent !== 'denied') return

    const ua = navigator.userAgent || ''
    // 인앱 브라우저는 홈 화면 추가 메뉴 자체가 없다(AuthPage 의 판정과 같은 기준).
    const inApp =
      /KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Line|DaumApps|everytimeApp/i.test(ua) ||
      (/wv\)/.test(ua) && /Android/.test(ua))
    if (inApp) return

    const iOS =
      /iPhone|iPad|iPod/.test(ua) ||
      (/Mac/.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document)
    const iosSafari = iOS && !/CriOS|FxiOS|EdgiOS/.test(ua)

    const pwa = (window as unknown as { __pwaInstall?: { deferredPrompt: DeferredPrompt | null } })
      .__pwaInstall
    if (pwa?.deferredPrompt) {
      setMode('prompt')
      return
    }

    const onAvailable = () => setMode('prompt')
    const onInstalled = () => setMode('hidden')
    window.addEventListener('pwa-install-available', onAvailable)
    window.addEventListener('pwa-installed', onInstalled)

    // iOS 는 이벤트가 영원히 오지 않는다. 안드로이드에서 이벤트가 늦게 올 수도 있으니
    // 잠깐 기다렸다가, 그때까지 아무것도 안 왔을 때만 수동 안내로 넘어간다.
    let timer: number | undefined
    if (iosSafari) {
      timer = window.setTimeout(() => setMode((m) => (m === 'hidden' ? 'ios' : m)), 1500)
    }

    return () => {
      window.removeEventListener('pwa-install-available', onAvailable)
      window.removeEventListener('pwa-installed', onInstalled)
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (mode !== 'hidden') trackEvent('pwa_prompt_shown', { variant: mode })
  }, [mode])

  if (mode === 'hidden') return null

  const close = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      /* 저장 못 해도 이번 화면에서는 닫힌다 */
    }
    trackEvent('pwa_prompt_dismissed', { variant: mode })
    setMode('hidden')
  }

  const install = async () => {
    const pwa = (window as unknown as { __pwaInstall?: { deferredPrompt: DeferredPrompt | null } })
      .__pwaInstall
    const deferred = pwa?.deferredPrompt
    if (!deferred) return
    trackEvent('pwa_install_click')
    deferred.prompt()
    const choice = await deferred.userChoice.catch(() => ({ outcome: 'error' }))
    trackEvent('pwa_install_choice', { outcome: choice.outcome })
    if (pwa) pwa.deferredPrompt = null
    setMode('hidden')
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[90] p-3 pointer-events-none"
      style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
      role="complementary"
      aria-label={isEn ? 'Install kissinskin' : '키스인스킨 설치'}
    >
      <div className="pointer-events-auto mx-auto flex max-w-xl items-center gap-3 rounded-xl bg-navy px-4 py-3 text-white shadow-2xl">
        <img
          src="/icons/icon-192x192.png"
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-lg bg-white/95 object-contain p-0.5"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug">
            {isEn ? 'Keep kissinskin one tap away' : '키스인스킨을 홈 화면에'}
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-white/70">
            {mode === 'ios'
              ? isEn
                ? 'Tap the Share button, then “Add to Home Screen”.'
                : '공유 버튼을 누르고 “홈 화면에 추가”를 선택하세요.'
              : isEn
                ? 'Install the app — no store, no download wait.'
                : '앱처럼 바로 열려요. 스토어 설치 없이 한 번이면 됩니다.'}
          </p>
        </div>
        {mode === 'prompt' && (
          <button
            type="button"
            onClick={install}
            className="shrink-0 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-navy transition-colors hover:bg-white/90"
          >
            {isEn ? 'Install' : '설치'}
          </button>
        )}
        <button
          type="button"
          onClick={close}
          aria-label={isEn ? 'Dismiss' : '닫기'}
          className="shrink-0 rounded-lg p-1.5 text-white/60 transition-colors hover:text-white"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>
    </div>
  )
}
