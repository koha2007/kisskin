// 홈 — "이렇게 받아요" 시연 영상 (2026-10-12)
// ────────────────────────────────────────────────────────────────────
// 운영자: "사용자들이 사용법과 결과물을 모른다." → 9룩 컬렉션 실제 화면을 처음부터 끝까지
// 녹화한 영상(셀카 고르기 → $4.99 → 9룩 생성 → 모아보기 → 낱장)을 홈 한가운데 둔다.
// 영상은 실제 사이트 화면을 Playwright 로 녹화한 것. 얼굴은 9룩 카드와 같은 AI 생성 모델이고,
// 결과는 그 사진에 도구를 실제로 돌린 출력(LOOK_IMAGES)이다 — 꾸민 결과가 아니다. 결제창 화면만 잘랐다.
// 다시 만들 때: scripts/rec-collection-demo.mjs(가짜 세션 + makeup-edit 를 룩 애프터로 응답) → ffmpeg 로
// 흰 로딩 구간을 잘라 public/demo/collection-{ko,en}.mp4.
//
// 화면에 들어올 때만 받아서 재생(preload=none) — 홈 첫 로딩에 330KB 를 얹지 않는다.
import { useEffect, useRef } from 'react'
import { MAKEUP_OFFER } from '../../lib/makeup/offer'

function gtagEvent(name: string, params?: Record<string, unknown>) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void }
  if (typeof w.gtag === 'function') w.gtag('event', name, params)
}

// 2026-10-18 운영자: "보자마자 이해되고, 나도 해 볼까 하는 마음이 드는 문구로" — 기능 나열 → 내가 겪는 장면으로.
const STEPS_KO = [
  { t: '앨범에서 셀카 한 장 고르기', d: '평소 찍어 둔 정면 셀카면 충분해요. 사진은 AI 처리를 위해 안전하게 전송되고, 처리가 끝나면 바로 삭제돼요.' },
  { t: '커피 한 모금 하는 사이, 9룩 완성', d: '내추럴 글로우부터 K-pop 아이돌까지 — 2~3분이면 9룩이 전부 내 얼굴로.' },
  { t: '제일 예쁜 나를 골라 자랑하기', d: '"나한테 뭐가 제일 잘 어울려?" 한눈에 보는 모아보기 1장 + 룩별 9장. 저장해서 바로 올려요.' },
]
const STEPS_EN = [
  { t: 'Pick a selfie from your camera roll', d: 'Any front-facing selfie you already have works. Your photo is sent securely for AI processing and deleted as soon as it’s done.' },
  { t: 'Sip your coffee — 9 looks are done', d: 'From Natural Glow to K-Pop Idol, all 9 looks land on your own face in 2–3 minutes.' },
  { t: 'Find your best look and show it off', d: '"Which one suits me most?" — one side-by-side grid + each look on its own. Save it and post.' },
]

export default function CollectionDemo({ isEn }: { isEn: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  const lang = isEn ? 'en' : 'ko'

  useEffect(() => {
    const v = ref.current
    if (!v || typeof IntersectionObserver === 'undefined') return
    let started = false
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!v.src) v.src = `/demo/collection-${lang}.mp4?v=20261102`
        v.play().catch(() => {})
        if (!started) { started = true; gtagEvent('home_demo_view', { lang }) }
      } else v.pause()
    }, { threshold: 0.4 })
    io.observe(v)
    return () => io.disconnect()
  }, [lang])

  const steps = isEn ? STEPS_EN : STEPS_KO
  // 2026-11-02 개편: 작은 영상(왼쪽) + 3단계(오른쪽). 모바일은 단계 제목만, 설명은 PC 에서만.
  return (
    <section id="demo" className="bg-cream scroll-mt-16 text-navy" aria-labelledby="demo-title">
      <div className="mx-auto flex max-w-[1120px] items-center gap-3.5 px-5 py-6 md:gap-16 md:px-4 md:py-11">
        <figure className="w-[132px] shrink-0 md:w-[250px]">
          <div className="rounded-[28px] bg-navy p-1.5">
            <video ref={ref} poster={`/demo/collection-${lang}.webp?v=20261102`} muted loop playsInline controls preload="none" width={390} height={844}
              aria-label={isEn ? 'Screen recording: creating a 9-look collection from one selfie' : '화면 녹화: 셀카 한 장으로 9룩 컬렉션 만들기'}
              className="block aspect-[390/844] w-full rounded-[22px] bg-navy object-cover" />
          </div>
          <figcaption className="mt-2 text-center text-[11.5px] leading-snug break-keep">
            {isEn ? 'Real site screens. The model is AI-generated.' : '실제 사이트 화면이에요. 모델은 AI 생성 이미지예요.'}
          </figcaption>
        </figure>
        <div className="flex min-w-0 flex-1 flex-col gap-3 md:gap-5">
          <div className="flex flex-col items-start gap-1.5">
            <h2 id="demo-title" className="rounded-full bg-primary px-3 py-0.5 text-xs font-extrabold md:text-[13px]">{isEn ? 'How it works' : '사용법'}</h2>
            <p className="text-xl font-extrabold leading-tight tracking-[-0.03em] md:text-[34px] break-keep">{isEn ? MAKEUP_OFFER.timeEn : MAKEUP_OFFER.timeKo}</p>
          </div>
          <ol className="flex flex-col gap-2.5 md:gap-3.5">
            {steps.map((s, i) => (
              <li key={s.t} className="flex gap-2 md:gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-extrabold text-white md:h-[30px] md:w-[30px] md:text-sm">{i + 1}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold leading-snug md:text-base break-keep">{s.t}</span>
                  <span className="mt-0.5 hidden text-[13px] leading-normal md:block break-keep">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
