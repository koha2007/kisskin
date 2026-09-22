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
//
// 2026-09-22 저녁 — `result` 를 넘기면 **그 결과를 담은 메일**이 나간다.
// 이게 이 폼의 전환을 결정한다: 사람은 레터를 받으려고 주소를 주지 않고, 방금 나온 자기
// 결과를 남기려고 준다(결과 화면 이메일 수집 벤치마크 35~45%). 미확인 주소라면 같은 메일
// 안에 구독 확인 버튼이 함께 들어가므로 메일은 여전히 한 통이다.

import { useState, type FormEvent } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { trackEvent, trackSubscribePending, trackSubscribeSubmit } from '../lib/analytics'

type Status = 'idle' | 'sending' | 'pending' | 'sent' | 'recent' | 'already' | 'error'

/**
 * 메일에 실을 결과. 서버가 전부 다시 검증하므로(피싱 발송기 방지) 여기서는 화면이 이미
 * 가진 값을 그대로 넘기기만 한다. 셋 중 하나만 채우면 된다 —
 * `swatches`(퍼스널컬러 팔레트) · `bars`(MBTI 4축) · `facts`(향수·얼굴형 핵심 특징).
 */
export interface ResultMailPayload {
  tool: string
  code: string
  /** 진단명 — "퍼스널컬러" / "얼굴형". 메일 맨 위 라벨. */
  label: string
  name: string
  tagline: string
  emoji: string
  /** 결과 페이지 경로. 반드시 `/tools/...` 또는 `/en/tools/...` 로 끝에 슬래시. */
  path: string
  image?: string
  facts?: string[]
  swatches?: { label: string; hex: string }[]
  bars?: { left: string; right: string; value: number }[]
}

interface Props {
  /** 어느 화면이 구독자를 만드는지 재는 값. GA4 와 DB 양쪽에 같은 문자열로 남는다. */
  source: string
  /**
   * 방금 나온 결과 이름 — 예: "별빛 화가(INFP)". 넘기면 제목이 그 결과를 부르는 문장이 된다.
   *
   * 근거(2026-09-22 조사): 진단 결과 화면의 이메일 수집은 **완료자의 35~45%** 를 잡는다.
   * 일반 팝업(한 자릿수 초반)과 자릿수가 다르다. 결과를 막 받은 순간이 가장 열려 있기 때문이다.
   * ⚠ `result` 를 같이 넘기지 않으면 제목만 결과를 부를 뿐 메일에는 결과가 안 담긴다.
   *   그 상태에서 "결과를 보내드립니다" 라고 쓰면 거짓말이 되므로(2026-07-31 "가입 없이
   *   AI 메이크업" 과 같은 뿌리), 문구는 `result` 유무에 따라 아래에서 갈린다.
   */
  resultName?: string
  /**
   * 넘기면 폼이 **결과 메일 폼**이 된다 — 문구가 "결과를 보내드릴게요" 로 바뀌고,
   * 서버가 그 결과를 담은 메일을 보낸다. 없으면 기존 구독 신청 폼 그대로.
   */
  result?: ResultMailPayload
  /**
   * card = 크림 카드(본문 흐름 안). band = 진한 네이비 띠(섹션 경계).
   * 한 페이지에 SaveToAccount(네이비 띠)가 이미 있으면 card 를 쓴다 — 진한 띠가
   * 연달아 두 개 나오면 둘 다 광고로 읽힌다.
   */
  variant?: 'card' | 'band'
  className?: string
}

export function EmailSubscribe({ source, variant = 'card', className = '', resultName, result }: Props) {
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
        body: JSON.stringify({ email: value, locale, source, ...(result ? { result } : {}) }),
      })
      const data = (await res.json().catch(() => ({}))) as { status?: string; error?: string }
      if (res.ok && data.status === 'already') {
        setStatus('already')
        trackEvent('subscribe_already', { source })
        return
      }
      // sent = 이미 구독 중인 사람에게 결과만 보낸 경우 / recent = 쿨다운(방금 보냄).
      if (res.ok && (data.status === 'sent' || data.status === 'recent')) {
        setStatus(data.status)
        if (result) trackEvent('result_mail_sent', { source, tool: result.tool })
        return
      }
      if (res.ok && data.status === 'pending') {
        setStatus('pending')
        // 진짜 구독 성립은 확인 클릭이지만, 화면에서 잰 "신청" 은 이 지점이다.
        trackSubscribePending(source)
        if (result) trackEvent('result_mail_sent', { source, tool: result.tool })
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
  if (status === 'pending' || status === 'already' || status === 'sent' || status === 'recent') {
    // 문구는 **무엇을 보냈는지**에 따라 갈린다. 결과를 보냈으면서 "확인 메일을 보냈어요"
    // 라고 하면 사용자는 결과가 안 왔다고 읽는다.
    const title = isEn
      ? {
          already: 'You are already subscribed',
          pending: result ? 'Your result is on the way' : 'Check your inbox',
          sent: 'Sent — check your inbox',
          recent: 'We just sent it',
        }[status]
      : {
          already: '이미 구독 중이세요',
          pending: result ? '결과를 보냈어요' : '메일함을 확인해 주세요',
          sent: '결과를 보냈어요',
          recent: '조금 전에 보냈어요',
        }[status]
    const spam = isEn
      ? " (Check spam if it isn't there in a minute.)"
      : ' (1분 안에 안 보이면 스팸함도 확인해 주세요.)'
    const body = isEn
      ? {
          already: 'This address is already on the list — nothing else to do.',
          pending: result
            ? `We sent your result to ${email}. Tap the button inside that email to start the weekly letter too.${spam}`
            : `We sent a confirmation to ${email}. Tap the button in that email and you're in.${spam}`,
          sent: `Your result is on its way to ${email}.${spam}`,
          recent: `We already sent one to ${email} a moment ago.${spam}`,
        }[status]
      : {
          already: '이 주소는 이미 명단에 있어요. 더 하실 건 없습니다.',
          pending: result
            ? `${email} 로 결과를 보냈어요. 같은 메일 안의 버튼을 누르면 매주 화요일 레터도 시작됩니다.${spam}`
            : `${email} 로 확인 메일을 보냈어요. 그 안의 버튼을 눌러야 구독이 시작됩니다.${spam}`,
          sent: `${email} 로 결과를 보냈어요.${spam}`,
          recent: `${email} 로 이미 한 통 보냈어요. 메일함을 확인해 주세요.${spam}`,
        }[status]

    return (
      <div
        className={`${dark ? 'bg-navy text-white' : 'bg-cream border border-navy/12 text-navy'} px-5 py-6 sm:px-7 sm:py-7 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <span className={`material-symbols-outlined text-xl ${dark ? 'text-white' : 'text-primary'}`}>
            {status === 'already' ? 'check_circle' : status === 'recent' ? 'schedule_send' : 'mark_email_unread'}
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
  const title = result
    ? isEn
      ? `Email me my result${resultName ? `: ${resultName}` : ''}`
      : `${resultName ? `${resultName} ` : ''}결과를 메일로 받아보세요`
    : resultName
      ? isEn
        ? `More for your ${resultName}, every Tuesday`
        : `${resultName}에게 어울리는 소식, 매주 화요일에`
      : isEn
        ? 'One K-beauty email, every Tuesday'
        : '매주 화요일 아침, K-뷰티 한 통'
  // 결과 메일 폼에서도 레터를 숨기지 않는다 — 같은 메일 안에 확인 버튼이 들어가므로,
  // 말하지 않고 보내면 "신청한 적 없는 메일" 이 된다.
  const sub = result
    ? isEn
      ? 'Your result in one email, so you can open it again later. It also has a one-tap button for the weekly K-beauty letter — nothing else is sent unless you tap it.'
      : '지금 이 결과를 한 통으로 정리해 보내드려요. 나중에 다시 열어볼 수 있게요. 같은 메일에 주간 레터 신청 버튼도 있는데, 누르기 전에는 아무것도 보내지 않습니다.'
    : isEn
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
          {result ? (isEn ? 'Your result by email' : '결과 메일') : isEn ? 'Weekly letter' : '주간 레터'}
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
              : result
                ? isEn
                  ? 'Send my result'
                  : '결과 메일 받기'
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
