// 홈 — "이렇게 받아요" 시연 영상 (2026-10-12)
// ────────────────────────────────────────────────────────────────────
// 운영자: "사용자들이 사용법과 결과물을 모른다." → 9룩 컬렉션 실제 화면을 처음부터 끝까지
// 녹화한 영상(셀카 고르기 → $4.99 → 9룩 생성 → 모아보기 → 낱장)을 홈 한가운데 둔다.
// 영상은 실제 사이트 화면을 Playwright 로 녹화한 것. 얼굴은 9룩 카드와 같은 AI 생성 모델이고,
// 결과는 그 사진에 도구를 실제로 돌린 출력(LOOK_IMAGES)이다 — 꾸민 결과가 아니다. 결제창 화면만 잘랐다.
// 다시 만들 때: 대화 기록의 _rec.mjs 방식(가짜 세션 + makeup-edit 를 룩 애프터로 응답) → ffmpeg 로
// 흰 로딩 구간을 잘라 public/demo/collection-{ko,en}.mp4.
//
// 화면에 들어올 때만 받아서 재생(preload=none) — 홈 첫 로딩에 330KB 를 얹지 않는다.
import { useEffect, useRef } from 'react'
import SectionHeader from './SectionHeader'

function gtagEvent(name: string, params?: Record<string, unknown>) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void }
  if (typeof w.gtag === 'function') w.gtag('event', name, params)
}

const STEPS_KO = [
  { t: '셀카 한 장 올리기', d: '정면 사진 한 장이면 돼요. 사진은 이 기기 밖으로 저장되지 않아요.' },
  { t: '9룩이 내 얼굴로', d: '내추럴 글로우부터 K-pop 아이돌까지 9룩을 2~3분 안에 한 번에 만들어요.' },
  { t: '10장 받아서 올리기', d: '"나한테 제일 어울리는 건?" 모아보기 1장 + 룩별 낱장 9장. 저장·메일로 받기.' },
]
const STEPS_EN = [
  { t: 'Upload one selfie', d: 'One front-facing photo is all it takes. Your selfie never leaves this device.' },
  { t: 'All 9 looks on your face', d: 'From Natural Glow to K-Pop Idol — all 9 looks made in 2–3 minutes.' },
  { t: 'Get 10 images to post', d: 'A "which one suits me?" grid + each look on its own. Save or email them.' },
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
        if (!v.src) v.src = `/demo/collection-${lang}.mp4`
        v.play().catch(() => {})
        if (!started) { started = true; gtagEvent('home_demo_view', { lang }) }
      } else v.pause()
    }, { threshold: 0.4 })
    io.observe(v)
    return () => io.disconnect()
  }, [lang])

  const steps = isEn ? STEPS_EN : STEPS_KO
  return (
    <section id="demo" className="py-16 md:py-24 bg-white scroll-mt-16" aria-labelledby="demo-title">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          titleId="demo-title"
          eyebrow={isEn ? 'How it works' : '이렇게 받아요'}
          title={isEn ? 'One selfie, all 9 looks on your face' : '셀카 한 장으로, 9룩 전부 내 얼굴로'}
        />
        {/* 모바일: 영상 → 단계·버튼 / PC: 왼쪽 단계 · 오른쪽 영상 */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-[1fr_auto] gap-x-16 gap-y-10 items-center">
          <div className="order-2 md:order-1">
            <ol className="space-y-5">
              {steps.map((s, i) => (
                <li key={s.t} className="flex gap-4">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-extrabold text-white">{i + 1}</span>
                  <span>
                    <span className="block text-base md:text-lg font-extrabold text-navy">{s.t}</span>
                    <span className="mt-1 block text-sm text-slate-600 leading-relaxed break-keep">{s.d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-col sm:flex-row gap-2">
              <a href="/analysis/?collection=new" onClick={() => gtagEvent('collection_entry', { from: 'home_demo' })}
                className="inline-flex items-center justify-center gap-1.5 bg-navy px-6 py-3.5 text-sm font-bold text-white hover:bg-navy-mid transition-colors">
                {isEn ? 'Get my 9 looks · $4.99' : '9룩 전부 받기 · $4.99'}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </a>
              <a href="/analysis/" className="inline-flex items-center justify-center border border-navy px-6 py-3.5 text-sm font-bold text-navy hover:bg-navy/5 transition-colors">
                {isEn ? 'One look — 1st free' : '한 룩만 · 첫 1회 무료'}
              </a>
            </div>
          </div>

          <figure className="order-1 md:order-2 mx-auto w-[240px] md:w-[280px]">
            <div className="rounded-[2rem] bg-navy p-2 shadow-2xl shadow-navy/25">
              <video ref={ref} poster={`/demo/collection-${lang}.webp`} muted loop playsInline preload="none" width={390} height={844}
                aria-label={isEn ? 'Screen recording: creating a 9-look collection from one selfie' : '화면 녹화: 셀카 한 장으로 9룩 컬렉션 만들기'}
                className="block w-full aspect-[390/844] rounded-[1.6rem] bg-navy object-cover" />
            </div>
            <figcaption className="mt-3 text-center text-[11px] leading-relaxed text-slate-400 break-keep">
              {isEn
                ? 'Real site screens. The model is AI-generated; results are the tool’s actual output on that photo.'
                : '실제 사이트 화면이에요. 모델은 AI 생성 이미지, 결과는 그 사진에 도구를 실제로 돌린 출력이에요.'}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
