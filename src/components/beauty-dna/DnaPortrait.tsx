import { useRef, useState } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import { useAuth } from '../../hooks/useAuth'
import type { BeautyDna } from '../../lib/beauty-dna/types'
import { writeDnaPortrait, encodeDnaCode } from '../../lib/beauty-dna/types'
import { generateDnaPortrait } from '../../lib/beauty-dna/generate'

type Phase = 'idle' | 'loading' | 'done' | 'error'
type ErrKind = 'login' | 'topup' | 'unconfigured' | 'retry'

// 서버는 PNG(1024×1536, 수 MB)를 돌려준다. localStorage 에 그대로 넣으면 쿼터 위험 →
// 캔버스로 폭 768 · webp 0.85 로 줄여 저장/표시한다(실패 시 원본 유지).
async function shrinkToWebp(dataUrl: string, maxW = 768): Promise<string> {
  try {
    if (typeof document === 'undefined') return dataUrl
    const img = new Image()
    await new Promise<void>((res, rej) => {
      img.onload = () => res()
      img.onerror = () => rej(new Error('decode'))
      img.src = dataUrl
    })
    const scale = Math.min(1, maxW / (img.naturalWidth || maxW))
    const c = document.createElement('canvas')
    c.width = Math.round((img.naturalWidth || maxW) * scale)
    c.height = Math.round((img.naturalHeight || maxW * 1.5) * scale)
    const ctx = c.getContext('2d')
    if (!ctx) return dataUrl
    ctx.drawImage(img, 0, 0, c.width, c.height)
    const out = c.toDataURL('image/webp', 0.85)
    return out.startsWith('data:image/webp') ? out : dataUrl
  } catch {
    return dataUrl
  }
}

interface Props {
  dna: BeautyDna
  /** localStorage 에 캐시된 이전 결과 (있으면 바로 done) */
  cached?: string
  /** 공유(?c=)로 열린 남의 조합이면 생성 버튼을 숨긴다 */
  readOnly?: boolean
}

export default function DnaPortrait({ dna, cached, readOnly = false }: Props) {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const { user, loading: authLoading } = useAuth()
  const [phase, setPhase] = useState<Phase>(cached ? 'done' : 'idle')
  const [img, setImg] = useState<string | null>(cached ?? null)
  const [err, setErr] = useState<ErrKind | null>(null)
  const [tier, setTier] = useState<'free' | 'credit' | null>(null)
  // 새 생성마다 새 jobId(차감), 에러 재시도는 같은 jobId(멱등) — makeup-edit 패턴
  const jobIdRef = useRef<string | null>(null)

  if (readOnly && phase !== 'done') return null

  const L = isEn
    ? {
        title: 'See it on a model',
        desc: 'We put your combination on a model face — an illustration, not a real person.',
        needLogin: 'Generating the model needs a login (the 4 quizzes don’t). First one is free, no card.',
        cta: 'Make my makeup model',
        free: 'First one free',
        loginCta: 'Log in to make it',
        loading: 'Creating your model… (up to ~1 min)',
        again: 'Make another',
        label: 'Illustration · not a real person · example of the type combination',
        save: 'Press and hold the image to save',
        errLogin: 'Log in to make your model — the first one is free, no card needed.',
        errTopup: 'Not enough credits. Top up to make another.',
        errUnconfigured: 'This feature is not live yet. Please check back soon.',
        errRetry: 'Generation failed. Please try again.',
        tierFree: 'Free trial used', tierCredit: '1 credit used',
      }
    : {
        title: '모델로 보기',
        desc: '내 조합을 모델 얼굴에 입혀봤어요. 실제 인물이 아닌 일러스트예요.',
        needLogin: '모델 생성에는 로그인이 필요해요(진단 4가지는 로그인 없이). 첫 1회 무료, 카드 필요 없어요.',
        cta: '내 메이크업 모델 만들기',
        free: '첫 1회 무료',
        loginCta: '로그인하고 만들기',
        loading: '모델 생성 중… (최대 1분)',
        again: '다시 만들기',
        label: '일러스트 · 실제 인물 아님 · 유형 조합 예시',
        save: '이미지를 길게 눌러 저장하세요',
        errLogin: '로그인하면 첫 1회 무료로 만들 수 있어요. 카드는 필요 없어요.',
        errTopup: '크레딧이 부족해요. 충전하면 다시 만들 수 있어요.',
        errUnconfigured: '아직 준비 중인 기능이에요. 곧 열릴 예정이에요.',
        errRetry: '생성에 실패했어요. 다시 시도해 주세요.',
        tierFree: '무료 체험 사용', tierCredit: '크레딧 1회 사용',
      }

  const run = async (retry = false) => {
    if (!retry || !jobIdRef.current) {
      jobIdRef.current = `dna:${encodeDnaCode(dna) ?? 'x'}:${Date.now().toString(36)}`
    }
    setPhase('loading'); setErr(null)
    const r = await generateDnaPortrait(dna, jobIdRef.current)
    if (r.ok) {
      const small = await shrinkToWebp(r.image)
      setImg(small)
      setTier(r.tier)
      writeDnaPortrait(small)
      setPhase('done')
    } else {
      setErr(r.kind)
      setPhase('error')
    }
  }

  const nextParam = typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname) : ''
  const loginHref = isEn ? `/auth/?next=${nextParam}` : `/auth/?next=${nextParam}`

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {phase === 'done' && img ? (
          <figure className="text-center">
            <img
              src={img}
              alt={L.label}
              className="mx-auto w-full max-w-sm rounded-2xl border border-slate-200"
              width={512}
              height={768}
            />
            <figcaption className="mt-2 text-[11px] text-slate-400">{L.label}</figcaption>
            <p className="mt-1 text-xs text-slate-500">{L.save}</p>
            {tier && (
              <p className="mt-1 text-[11px] text-slate-400">{tier === 'free' ? L.tierFree : L.tierCredit}</p>
            )}
            {!readOnly && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => run(false)}
                  className="inline-flex items-center gap-1.5 border border-navy/25 hover:border-navy text-navy px-6 py-2.5 text-sm font-bold transition-colors"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  {L.again}
                </button>
                <p className="mt-1.5 text-[11px] text-slate-400">{isEn ? 'Uses 1 credit' : '크레딧 1회 사용'}</p>
              </div>
            )}
          </figure>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 text-center">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-navy tracking-tight">{L.title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed mt-2 max-w-md mx-auto">{L.desc}</p>

            {phase === 'loading' ? (
              <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-dark">
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                {L.loading}
              </p>
            ) : phase === 'error' ? (
              <div className="mt-5">
                <p className="text-sm text-slate-600">
                  {err === 'login' ? L.errLogin : err === 'topup' ? L.errTopup : err === 'unconfigured' ? L.errUnconfigured : L.errRetry}
                </p>
                {err === 'login' ? (
                  <a href={loginHref} className="mt-3 inline-flex items-center gap-2 bg-navy text-white px-6 py-3 text-sm font-bold hover:bg-navy-mid transition-colors">
                    {L.loginCta}
                  </a>
                ) : err === 'topup' ? (
                  <a href="/analysis/?topup=1" className="mt-3 inline-flex items-center gap-2 bg-navy text-white px-6 py-3 text-sm font-bold hover:bg-navy-mid transition-colors">
                    {isEn ? 'Top up' : '충전하기'}
                  </a>
                ) : err === 'retry' ? (
                  <button type="button" onClick={() => run(true)} className="mt-3 inline-flex items-center gap-2 bg-navy text-white px-6 py-3 text-sm font-bold hover:bg-navy-mid transition-colors">
                    {isEn ? 'Try again' : '다시 시도'}
                  </button>
                ) : null}
              </div>
            ) : authLoading ? (
              <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-400">
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                {isEn ? 'Checking…' : '확인 중…'}
              </p>
            ) : user ? (
              <>
                <button
                  type="button"
                  onClick={() => run(false)}
                  className="mt-5 inline-flex items-center gap-2 bg-navy text-white px-7 py-3.5 text-sm font-bold hover:bg-navy-mid transition-colors"
                >
                  {L.cta}
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                </button>
                {phase === 'idle' && (
                  <p className="mt-2 text-[11px] font-semibold text-primary-dark">{L.free}</p>
                )}
              </>
            ) : (
              <>
                <a
                  href={loginHref}
                  className="mt-5 inline-flex items-center gap-2 bg-navy text-white px-7 py-3.5 text-sm font-bold hover:bg-navy-mid transition-colors"
                >
                  {L.loginCta}
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                </a>
                <p className="mt-2.5 text-xs text-slate-500 leading-relaxed max-w-md mx-auto">{L.needLogin}</p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
