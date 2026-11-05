// 남은 가입 무료권 안내 — 로그인 회원에게만, 브라우저에서 확인한 뒤 보인다.
// 상단 로그인으로 가입하면 홈으로 돌아오는데 무료권 안내가 없었다. 다 쓰면 저절로 사라진다.
// 비로그인·프리렌더 HTML 에는 아무것도 그리지 않으므로 검색엔진이 보는 홈은 그대로다.
import { useEffect, useState } from 'react'
import { trackEvent } from '../../lib/analytics'
import { getFreeStatus } from '../../lib/freeStatus'

export default function HomeFreePass({ isEn }: { isEn: boolean }) {
  const [left, setLeft] = useState({ makeup: 0, lucky: 0 })

  useEffect(() => {
    let cancelled = false
    getFreeStatus()
      .then((s) => { if (!cancelled && s) setLeft({ makeup: s.makeup.left, lucky: s.lucky.left }) })
      .catch(() => { /* 안내만 생략 */ })
    return () => { cancelled = true }
  }, [])

  const total = left.makeup + left.lucky
  if (total === 0) return null

  const prefix = isEn ? '/en' : ''
  const doors = [
    { pool: 'makeup', count: left.makeup, href: `${prefix}/makeup/`, label: isEn ? '9 Makeup Looks, free' : '9가지 메이크업 무료로', cls: 'bg-primary text-navy' },
    { pool: 'lucky', count: left.lucky, href: `${prefix}/lucky-makeup/`, label: isEn ? 'Lucky Makeup, free' : '럭키 메이크업 무료로', cls: 'bg-navy text-white' },
  ].filter((d) => d.count > 0)

  return (
    <section aria-labelledby="home-free-pass" className="mx-auto max-w-[1120px] px-5 pt-5 text-navy md:px-4 md:pt-8">
      <div className="flex flex-col gap-3 rounded-[21px] border-2 border-navy p-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="min-w-0">
          <h2 id="home-free-pass" className="text-[19px] font-extrabold leading-tight tracking-[-0.03em] break-keep md:text-[22px]">
            {isEn ? `You have ${total} free ${total === 1 ? 'pass' : 'passes'}` : `무료권 ${total}장이 있어요`}
          </h2>
          <p className="mt-1 text-[13px] leading-snug break-keep md:text-sm">
            {isEn ? 'Use your own selfie, no card needed' : '카드 없이 내 셀카로 바로 만들어 보세요'}
          </p>
        </div>
        <div className={`grid shrink-0 gap-2 ${doors.length === 2 ? 'grid-cols-2' : 'grid-cols-1'} md:flex`}>
          {doors.map((d) => (
            <a
              key={d.pool}
              href={d.href}
              onClick={() => trackEvent('home_free_pass', { pool: d.pool })}
              className={`flex min-h-[44px] items-center justify-center rounded-full px-4 py-2 text-center text-[13px] font-extrabold leading-tight break-keep md:text-sm ${d.cls}`}
            >
              {d.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
