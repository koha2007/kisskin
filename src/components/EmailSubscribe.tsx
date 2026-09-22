// 이메일 구독 신청 폼 (가입 없이 이메일만).
//
// 왜(2026-09-22): 우리 1차 목표는 구독자 증가인데, **사이트 어디에도 이메일을 받는
// 자리가 없었다.** 주간 다이제스트 수신자는 전부 "회원가입까지 간 사람"이고,
// 유입의 대부분은 무료 도구 결과 페이지에서 끝난다. 그 사이의 낮은 문턱이 이 폼이다.
//
//   [높은 문턱] 회원가입 → 결과가 계정에 저장(SaveToAccount)
//   [낮은 문턱] 이메일 한 줄 → 주 1회 레터            ← 이 컴포넌트
//
// 두 개를 같은 화면 같은 자리에 겹쳐 두지 않는다. SaveToAccount 는 결과 히어로 바로
// 아래(저장 의향이 가장 높은 지점), 이 폼은 **페이지를 끝까지 읽은 뒤**에 둔다.
//
// 서버는 functions/api/subscribe.ts (더블 옵트인 — 확인 메일의 버튼을 눌러야 구독 성립).
// 그래서 성공 문구는 "구독 완료"가 아니라 **"메일함을 확인하세요"** 여야 한다.

import { useState, type FormEvent } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { trackEvent, trackSubscribePending, trackSubscribeSubmit } from '../lib/analytics'

type Status = 'idle' | 'sending' | 'pending' | 'already' | 'error'

interface Props {
  /** 어느 화면이 구독자를 만드는지 재는 값. GA4 와 DB 양쪽에 같은 문자열로 남는다. */
  source: string
  /**
   * card = 크림 카드(본문 흐름 안). band = 진한 네이비 띠(섹션 경계).
   * 한 페이지에 SaveToAccount(네이비 띠)가 이미 있으면 card 를 쓴다 — 진한 띠가
   * 연달아 두 개 나오면 둘 다 광고로 읽힌다.
   */
  variant?: 'card' | 'band'
  className?: string
}

export function EmailSubscribe({ source, variant = 'card', className = '' }: Props) {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  const dark = variant === 'band'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (status === 'sending') return
    const value = email.trim()
    if (!value) return

    setStatus('sending')
    trackSubscribeSubmit(source)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, locale, source }),
      })
      const data = (await res.json().catch(() => ({}))) as { status?: string; error?: string }
      if (res.ok && data.status === 'already') {
        setStatus('already')
        trackEvent('subscribe_already', { source })
        return
      }
      if (res.ok && data.status === 'pending') {
        setStatus('pending')
        // 진짜 구독 성립은 확인 클릭이지만, 화면에서 잰 "신청" 은 이 지점이다.
        trackSubscribePending(source)
        return
      }
      setStatus('error')
      trackEvent('subscribe_error', { source, reason: data.error ?? res.status })
    } catch {
      setStatus('error')
      trackEvent('subscribe_error', { source, reason: 'network' })
    }
  }

  // ── 완료 상태 ───────────────────────────────────────────────────
  // 폼을 남겨두면 한 번 더 넣어보게 된다. 확인 메일을 보라는 말만 남긴다.
  if (status === 'pending' || status === 'already') {
    const title =
      status === 'already'
        ? isEn
          ? 'You are already subscribed'
          : '이미 구독 중이세요'
        : isEn
          ? 'Check your inbox'
          : '메일함을 확인해 주세요'
    const body =
      status === 'already'
        ? isEn
          ? 'This address is already on the list — nothing else to do.'
          : '이 주소는 이미 명단에 있어요. 더 하실 건 없습니다.'
        : isEn
          ? `We sent a confirmation to ${email}. Tap the button in that email and you're in. (Check spam if it isn't there in a minute.)`
          : `${email} 로 확인 메일을 보냈어요. 그 안의 버튼을 눌러야 구독이 시작됩니다. (1분 안에 안 보이면 스팸함도 확인해 주세요.)`

    return (
      <div
        className={`${dark ? 'bg-navy text-white' : 'bg-cream border border-navy/12 text-navy'} px-5 py-6 sm:px-7 sm:py-7 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <span className={`material-symbols-outlined text-xl ${dark ? 'text-white' : 'text-primary'}`}>
            {status === 'already' ? 'check_circle' : 'mark_email_unread'}
          </span>
          <div>
            <p className="font-bold text-sm md:text-base">{title}</p>
            <p className={`text-xs md:text-sm mt-1 ${dark ? 'text-white/70' : 'text-navy/65'}`}>{body}</p>
          </div>
        </div>
      </div>
    )
  }

  // ── 신청 폼 ─────────────────────────────────────────────────────
  // 카피 원칙: "구독하세요" 가 아니라 **무엇이 언제 오는지**를 먼저 말한다.
  // 주기(매주 화요일)와 분량(한 통)을 밝히면 "메일 폭탄" 걱정이 줄어 전환이 오른다.
  const title = isEn ? 'One K-beauty email, every Tuesday' : '매주 화요일 아침, K-뷰티 한 통'
  const sub = isEn
    ? 'The week’s new releases and news, cut down to one short email. No account needed.'
    : '지난 한 주의 신제품과 뉴스만 짧게 추려서. 가입 없이 이메일만 남기면 됩니다.'

  return (
    <section
      className={`${dark ? 'bg-navy text-white' : 'bg-cream border border-navy/12 text-navy'} px-5 py-7 sm:px-7 sm:py-8 ${className}`}
    >
      <div className="max-w-xl">
        {/* 한글엔 uppercase 가 무의미하고 0.18em 자간이 벌어져 읽기 나쁘다 →
            .t-label(한글) / .t-eyebrow(영문). src/index.css 의 라벨 규칙. */}
        <p className={`${isEn ? 't-eyebrow' : 't-label'} mb-2 ${dark ? 'text-white/55' : 'text-primary-dark'}`}>
          {isEn ? 'Weekly letter' : '주간 레터'}
        </p>
        <h2 className="font-bold text-lg md:text-xl leading-snug">{title}</h2>
        <p className={`text-xs md:text-sm mt-1.5 ${dark ? 'text-white/70' : 'text-navy/65'}`}>{sub}</p>

        <form onSubmit={onSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
          <label htmlFor={`sub-${source}`} className="sr-only">
            {isEn ? 'Email address' : '이메일 주소'}
          </label>
          <input
            id={`sub-${source}`}
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder={isEn ? 'you@example.com' : 'name@example.com'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'sending'}
            className={`flex-1 min-w-0 px-4 py-3 text-sm outline-none border transition-colors ${
              dark
                ? 'bg-white/10 border-white/25 text-white placeholder:text-white/45 focus:border-white'
                : 'bg-white border-navy/20 text-navy placeholder:text-navy/35 focus:border-primary'
            }`}
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm whitespace-nowrap transition-colors disabled:opacity-60 ${
              dark ? 'bg-white text-navy hover:bg-white/90' : 'bg-primary-dark text-white hover:brightness-90'
            }`}
          >
            {status === 'sending'
              ? isEn
                ? 'Sending…'
                : '보내는 중…'
              : isEn
                ? 'Get it free'
                : '무료로 받아보기'}
            {status !== 'sending' && <span className="material-symbols-outlined text-base">arrow_forward</span>}
          </button>
        </form>

        {status === 'error' && (
          <p className="text-xs mt-2 font-semibold text-primary" role="alert">
            {isEn
              ? 'Something went wrong. Check the address and try again.'
              : '보내지 못했어요. 주소를 확인하고 다시 시도해 주세요.'}
          </p>
        )}

        {/* 광고성 정보 수신 동의 고지(정보통신망법). 링크는 진짜 <a> 로 둔다. */}
        <p className={`text-[11px] leading-relaxed mt-3 ${dark ? 'text-white/50' : 'text-navy/50'}`}>
          {isEn ? (
            <>
              The letter may include new releases and promotions. Unsubscribe from the bottom of any
              email.{' '}
              <a href="/en/privacy/" className="underline hover:no-underline">
                Privacy policy
              </a>
            </>
          ) : (
            <>
              신제품·할인 등 광고성 정보가 포함될 수 있어요. 메일 맨 아래에서 언제든 해지할 수
              있습니다.{' '}
              <a href="/privacy/" className="underline hover:no-underline">
                개인정보처리방침
              </a>
            </>
          )}
        </p>
      </div>
    </section>
  )
}

export default EmailSubscribe
