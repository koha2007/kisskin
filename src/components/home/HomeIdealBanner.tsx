// 홈 — AI 이상형 테스트 NEW 띠 (2026-11-25, 매장 5계단 1단계 = 방문 늘리기)
// 벤치마크: 16Personalities(테스트 한 버튼) · Picsart("New" 표시) · NN/g·Baymard(캐러셀보다 정적 띠).
// 11/25 운영자: 무료·유료를 한눈에 나눠 보이게 + 유료는 운영자 사진 예시 3장(배경 다름).
// GA4: select_promotion creative_slot=home_ideal_banner, promotion_id=free|paid
import { trackEvent } from '../../lib/analytics'
import { idealImage } from '../../lib/ideal-type/types'

const FREE = [
  { code: 'golden-retriever', g: 'm' },
  { code: 'black-cat', g: 'f' },
  { code: 'bunny', g: 'f' },
] as const
export const IDEAL_PAID_SAMPLES = ['golden-retriever-picnic', 'bunny-amusement', 'black-cat-lpbar'].map((f) => `/ideal-type/samples/${f}.webp?v=20261125`)

function Stack({ srcs, ratio, label }: { srcs: readonly string[]; ratio: string; label: string }) {
  return (
    <span className="relative flex items-center justify-center py-1" aria-hidden="true">
      {srcs.map((src, i) => (
        <img key={src} src={src} alt="" width={120} height={150} decoding="async"
          className={`${ratio} w-[31%] max-w-[120px] rounded-xl border-2 border-white object-cover shadow-md ${i ? '-ml-[6%]' : ''}`}
          style={{ transform: `rotate(${(i - 1) * 6}deg)`, zIndex: i === 1 ? 2 : 1 }} />
      ))}
      <span className="absolute bottom-0 right-1 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">{label}</span>
    </span>
  )
}

export default function HomeIdealBanner({ isEn }: { isEn: boolean }) {
  const href = isEn ? '/en/tools/ideal-type/' : '/tools/ideal-type/'
  const go = (id: 'free' | 'paid') => () => trackEvent('select_promotion', { creative_slot: 'home_ideal_banner', promotion_id: id })
  return (
    <section aria-labelledby="home-ideal" className="border-b border-navy/10" style={{ background: '#f6eedc' }}>
      <div className="mx-auto max-w-[1120px] px-5 py-4 text-navy md:px-4 md:py-7">
        <h2 id="home-ideal" className="flex items-center gap-2 text-[21px] font-extrabold leading-tight tracking-[-0.04em] md:text-[32px]">
          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-[0.12em] text-white" style={{ background: '#d6247f' }}>NEW</span>
          {isEn ? 'AI Ideal Type Test' : 'AI 이상형 테스트'}
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2.5 md:gap-6">
          <a href={href} onClick={go('free')} className="flex min-w-0 flex-col gap-1.5 rounded-2xl bg-white/70 p-2.5 md:p-5">
            <span className="w-fit rounded-full border border-navy px-2 py-0.5 text-[11px] font-extrabold">{isEn ? 'FREE' : '무료'}</span>
            <strong className="text-[15px] leading-tight md:text-[22px] break-keep">{isEn ? 'Find your ideal type' : '내 이상형 찾기'}</strong>
            <span className="text-[12px] leading-snug md:text-[15px] break-keep">{isEn ? '10 questions · their face & style as an art poster · no sign-up' : '10문항 · 얼굴·패션을 포스터로 · 가입 없이'}</span>
            <Stack srcs={FREE.map((p) => idealImage(p.code, p.g))} ratio="aspect-[8/9]" label={isEn ? 'AI art' : 'AI 일러스트'} />
            <span className="mt-auto flex min-h-[40px] items-center justify-center rounded-full bg-navy px-3 text-[13px] font-extrabold text-white">{isEn ? 'Start free →' : '무료로 시작 →'}</span>
          </a>
          <a href={`${href}photo/`} onClick={go('paid')} className="flex min-w-0 flex-col gap-1.5 rounded-2xl p-2.5 text-white md:p-5" style={{ background: '#070953' }}>
            <span className="w-fit rounded-full px-2 py-0.5 text-[11px] font-extrabold text-navy" style={{ background: '#ef4da0' }}>{isEn ? 'PAID · 1st preview free' : '유료 · 첫 맛보기 무료'}</span>
            <strong className="text-[15px] leading-tight md:text-[22px] break-keep">{isEn ? 'Me + my ideal type' : '이상형 옆에 선 나'}</strong>
            <span className="text-[12px] leading-snug text-white/80 md:text-[15px] break-keep">{isEn ? 'One selfie → a date photo together, with date makeup · HD 1 credit' : '셀카 한 장 → 함께 찍은 데이트 사진 · 고화질 크레딧 1개'}</span>
            <Stack srcs={IDEAL_PAID_SAMPLES} ratio="aspect-[2/3]" label={isEn ? 'AI · operator photo' : 'AI · 운영자 사진 예시'} />
            <span className="mt-auto flex min-h-[40px] items-center justify-center rounded-full px-3 text-[13px] font-extrabold text-navy" style={{ background: '#ef4da0' }}>{isEn ? 'Make my photo →' : '내 사진 만들기 →'}</span>
          </a>
        </div>
      </div>
    </section>
  )
}
