// 남은 가입 무료 크레딧 안내(11/27: 무료권 → 무료 크레딧 2개·30일) — 로그인 회원에게만, 브라우저에서 확인한 뒤 보인다.
// 상단 로그인으로 가입하면 홈으로 돌아오는데 무료권 안내가 없었다. 다 쓰면 저절로 사라진다.
// 비로그인·프리렌더 HTML 에는 아무것도 그리지 않으므로 검색엔진이 보는 홈은 그대로다.
import { useEffect, useState } from 'react'
import { trackEvent } from '../../lib/analytics'
import { getFreeStatus } from '../../lib/freeStatus'
import { supabase } from '../../lib/supabase'

// 2026-11-26 운영자: 홈에서 이 띠가 가장 늦게 뜸 → 지난번 값을 기억해 두었다가 같은 회원이면 바로 그리고,
// 서버 확인(/api/free-status)이 끝나면 고친다. 다 쓰거나 로그아웃이면 지운다.
const CACHE_KEY = 'kisskin_free_pass_cache'

export default function HomeFreePass({ isEn }: { isEn: boolean }) {
  const [bonus, setBonus] = useState<{ left: number; until: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    void supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id
      if (!uid) { try { localStorage.removeItem(CACHE_KEY) } catch { /* noop */ } return }
      try {
        const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') as { uid?: string; left?: number; until?: string } | null
        if (!cancelled && c?.uid === uid && c.left && c.until && new Date(c.until).getTime() > Date.now()) setBonus({ left: c.left, until: c.until })
      } catch { /* noop */ }
      return getFreeStatus({ balance: false }).then((s) => {
        if (cancelled || !s) return
        const v = s.bonus && s.bonus.remaining > 0 ? { left: s.bonus.remaining, until: s.bonus.expiresAt } : null
        setBonus(v)
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ uid, ...(v ?? { left: 0 }) })) } catch { /* noop */ }
      })
    }).catch(() => { /* 안내만 생략 */ })
    return () => { cancelled = true }
  }, [])

  if (!bonus) return null
  const d = new Date(bonus.until)
  const untilTxt = isEn ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `${d.getMonth() + 1}월 ${d.getDate()}일`

  const prefix = isEn ? '/en' : ''
  const doors = [
    { pool: 'makeup', href: `${prefix}/makeup/`, label: isEn ? 'AI makeup' : 'AI 메이크업', cls: 'bg-primary text-navy' },
    { pool: 'lucky', href: `${prefix}/lucky-makeup/`, label: isEn ? 'Lucky makeup' : '럭키 메이크업', cls: 'bg-navy text-white' },
    { pool: 'ideal', href: `${prefix}/tools/ideal-type/photo/`, label: isEn ? 'Ideal-type photo' : '이상형 사진', cls: 'bg-white text-navy border-2 border-navy' },
  ]

  return (
    <section aria-labelledby="home-free-pass" className="mx-auto max-w-[1120px] px-5 pt-5 text-navy md:px-4 md:pt-8">
      <div className="flex flex-col gap-3 rounded-[21px] border-2 border-navy p-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="min-w-0">
          <h2 id="home-free-pass" className="text-[19px] font-extrabold leading-tight tracking-[-0.03em] break-keep md:text-[22px]">
            {isEn ? `You have ${bonus.left} free ${bonus.left === 1 ? 'credit' : 'credits'}` : `무료 크레딧 ${bonus.left}개가 있어요`}
          </h2>
          <p className="mt-1 text-[13px] leading-snug break-keep md:text-sm">
            {isEn ? `Use them on anything, until ${untilTxt} · no card needed` : `원하는 기능 아무거나 · ${untilTxt}까지 · 카드 없이`}
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-3 gap-2 md:flex">
          {doors.map((d) => (
            <a
              key={d.pool}
              href={d.href}
              onClick={() => trackEvent('home_free_pass', { pool: d.pool })}
              className={`flex min-h-[44px] items-center justify-center rounded-full px-3 py-2 text-center text-[13px] font-extrabold leading-tight break-keep md:px-4 md:text-sm ${d.cls}`}
            >
              {d.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
