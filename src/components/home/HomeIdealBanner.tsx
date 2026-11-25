// 홈 — AI 이상형 테스트 NEW 띠 (2026-11-25, 매장 5계단 1단계 = 방문 늘리기)
// 벤치마크: 16Personalities(테스트 한 버튼) · Picsart("New this month" 표시) · NN/g·Baymard(캐러셀보다 정적 띠 하나).
// 셀카 없이 1분이면 끝나는 가벼운 입구 — 맨 위가 전부 셀카 필요한 기능이던 문제를 보완한다.
// GA4: select_promotion creative_slot=home_ideal_banner (4주 뒤 home_hero_* 와 비교)
import { trackEvent } from '../../lib/analytics'
import { idealImage } from '../../lib/ideal-type/types'

const PICKS = [
  { code: 'golden-retriever', g: 'm' },
  { code: 'black-cat', g: 'f' },
  { code: 'bunny', g: 'f' },
] as const

export default function HomeIdealBanner({ isEn }: { isEn: boolean }) {
  const href = isEn ? '/en/tools/ideal-type/' : '/tools/ideal-type/'
  return (
    <section aria-label={isEn ? 'New: AI Ideal Type Test' : '새 기능: AI 이상형 테스트'} className="border-b border-navy/10" style={{ background: '#f6eedc' }}>
      <a href={href} onClick={() => trackEvent('select_promotion', { creative_slot: 'home_ideal_banner', promotion_id: 'ideal-type' })}
        className="mx-auto grid max-w-[1120px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4 text-navy md:gap-8 md:px-4 md:py-6">
        <span className="flex min-w-0 flex-col gap-1">
          <span className="w-fit rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-[0.12em] text-white" style={{ background: '#d6247f' }}>NEW</span>
          <strong className="text-[22px] font-extrabold leading-tight tracking-[-0.04em] md:text-[34px] break-keep">{isEn ? 'AI Ideal Type Test' : 'AI 이상형 테스트'}</strong>
          <span className="text-[13px] font-semibold leading-snug md:text-[16px] break-keep">{isEn ? 'Their face & style as an art poster · 1 min · free · no sign-up' : '내 이상형 얼굴·패션을 포스터로 · 1분 · 무료 · 가입 없이'}</span>
          <span className="mt-1 flex min-h-[40px] w-fit items-center rounded-full bg-navy px-4 text-[13px] font-extrabold text-white">{isEn ? 'Start the test →' : '테스트 시작 →'}</span>
        </span>
        <span className="relative flex shrink-0 items-center" aria-hidden="true">
          {PICKS.map((p, i) => (
            <img key={p.code} src={idealImage(p.code, p.g)} alt="" width={120} height={135} decoding="async"
              className={`aspect-[8/9] w-[74px] rounded-2xl border-2 border-[#f6eedc] object-cover shadow-md md:w-[150px] ${i ? '-ml-7 md:-ml-12' : ''}`}
              style={{ transform: `rotate(${(i - 1) * 6}deg)`, zIndex: i === 1 ? 2 : 1 }} />
          ))}
          <span className="absolute -bottom-2 right-0 z-10 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white">{isEn ? 'AI art' : 'AI 일러스트'}</span>
        </span>
      </a>
    </section>
  )
}
