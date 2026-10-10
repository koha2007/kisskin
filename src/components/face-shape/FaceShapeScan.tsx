import { useState } from 'react'
import { pickImage } from '../../lib/nativePicker'
import { scanFace, storeMix, type ScanResult, type ScanError } from '../../lib/face-shape/measure'
import { FACE_SHAPE_TYPES } from '../../lib/face-shape/types'
import { trackEvent, trackToolComplete } from '../../lib/analytics'

// 얼굴형 랜딩의 "셀카로 재기" — 2026-10-10.
// 사진은 이 기기 안에서만 처리된다(MediaPipe 온디바이스). 결과는 비율(%)로 — 하나로 단정하지 않는다.
// 결과 페이지(/tools/face-shape/{type}/)로 넘길 땐 sessionStorage 에만 담는다(서버 전송 0).

type State = { k: 'idle' } | { k: 'busy' } | { k: 'done'; r: ScanResult } | { k: 'error'; e: ScanError | 'bad-file' }

export default function FaceShapeScan({ isEn, basePath, onQuiz }: { isEn: boolean; basePath: string; onQuiz: () => void }) {
  const [st, setSt] = useState<State>({ k: 'idle' })
  const T = isEn
    ? {
        eyebrow: 'New · measure with a selfie', title: 'Measure your face shape from a selfie',
        desc: 'We map 478 points on your face and compare forehead, cheekbone and jaw widths and face length. Most faces are a blend, so you get percentages, not a single label.',
        privacy: 'Your photo never leaves this device — it’s measured in your browser and not uploaded.',
        camera: 'Take a selfie', gallery: 'Choose a photo', quiz: 'Prefer questions? Take the 6-question quiz',
        tips: 'Face the camera straight on · hair off your forehead and jaw · neutral expression · even light',
        busy: 'Measuring… (first time takes a few seconds)',
        result: 'Your measurement', closest: 'Closest to', see: 'See my full result',
        retry: 'Try another photo', note: 'An estimate from one photo — angle, expression and hair can shift it. Use it as a starting point.',
        ratio: 'Length ÷ cheekbone width', taper: 'Forehead ÷ jaw width', angle: 'Jaw angle',
        labels: { length: 'length', forehead: 'forehead', cheek: 'cheekbones', jaw: 'jaw' },
        err: {
          'no-face': 'We couldn’t find a face. Try a brighter, front-facing photo.',
          'many-faces': 'There’s more than one face. Use a photo with just you.',
          tilted: 'Your head is turned. Face the camera straight on and try again.',
          'load-failed': 'The measuring tool didn’t load. Check your connection and try again.',
          'bad-file': 'That file couldn’t be opened. Try a JPG or PNG photo.',
        },
      }
    : {
        eyebrow: 'NEW · 셀카로 재기', title: '셀카 한 장으로 얼굴형 재기',
        desc: '얼굴 위 478개 점을 찾아 이마 · 광대 · 턱 너비와 얼굴 길이를 비교해요. 대부분의 얼굴은 두 유형이 섞여 있어서, 하나로 단정하지 않고 가까운 정도(%)로 알려드려요.',
        privacy: '사진은 이 기기 밖으로 나가지 않아요. 브라우저 안에서만 재고, 업로드하지 않아요.',
        camera: '셀카 찍기', gallery: '사진 고르기', quiz: '질문으로 할래요 (6문항)',
        tips: '정면 · 앞머리와 옆머리는 넘기고 · 무표정 · 고른 조명',
        busy: '재는 중이에요… (처음엔 몇 초 걸려요)',
        result: '측정 결과', closest: '가장 가까운 얼굴형', see: '내 결과 자세히 보기',
        retry: '다른 사진으로', note: '사진 한 장으로 낸 추정이에요. 각도 · 표정 · 머리카락에 따라 달라질 수 있으니 출발점으로 봐 주세요.',
        ratio: '세로 ÷ 광대 너비', taper: '이마 ÷ 턱 너비', angle: '턱 각도',
        labels: { length: '세로', forehead: '이마', cheek: '광대', jaw: '턱' },
        err: {
          'no-face': '얼굴을 찾지 못했어요. 더 밝은 정면 사진으로 해 주세요.',
          'many-faces': '얼굴이 둘 이상 있어요. 혼자 나온 사진으로 해 주세요.',
          tilted: '고개가 돌아가 있어요. 카메라를 정면으로 보고 다시 찍어 주세요.',
          'load-failed': '측정 도구를 불러오지 못했어요. 인터넷 연결을 확인하고 다시 해 주세요.',
          'bad-file': '사진을 열 수 없어요. JPG나 PNG 사진으로 해 주세요.',
        },
      }

  const run = async (mode: 'camera' | 'gallery') => {
    const p = pickImage(mode) // 클릭 핸들러 안에서 바로 호출해야 파일 선택창이 열린다
    trackEvent('face_scan_start', { mode })
    const file = await p
    if (!file) return
    setSt({ k: 'busy' })
    const url = URL.createObjectURL(file)
    try {
      const img = new Image()
      img.src = url
      await img.decode()
      const r = await scanFace(img, T.labels)
      if (typeof r === 'string') {
        setSt({ k: 'error', e: r })
        trackEvent('face_scan_error', { reason: r })
        return
      }
      setSt({ k: 'done', r })
      storeMix({ source: 'scan', mix: r.mix, features: r.features, overlay: r.overlay })
      const top = FACE_SHAPE_TYPES[r.mix[0].code]
      trackEvent('face_scan_complete', { shape: top.code, pct: r.mix[0].pct })
      trackToolComplete('face-shape', top.slug)
    } catch {
      setSt({ k: 'error', e: 'bad-file' })
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  const btn = 'inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm md:text-base font-bold transition-colors'

  return (
    <section id="scan" className="scroll-mt-20 py-10 md:py-14 border-y border-slate-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 grid md:grid-cols-[minmax(0,1fr)_minmax(0,360px)] gap-8 md:gap-12 items-center">
        <div>
          <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-primary-dark mb-3">{T.eyebrow}</p>
          <h2 className="font-serif text-2xl md:text-4xl font-semibold text-navy leading-tight tracking-tight">{T.title}</h2>
          <p className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed max-w-xl">{T.desc}</p>
          <p className="mt-3 flex items-start gap-1.5 text-xs md:text-sm font-semibold text-slate-700">
            <span className="material-symbols-outlined text-base text-primary-dark">lock</span>{T.privacy}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <button type="button" disabled={st.k === 'busy'} onClick={() => run('camera')} className={`${btn} bg-navy text-white hover:bg-navy-mid disabled:opacity-60`}>
              <span className="material-symbols-outlined text-xl">photo_camera</span>{T.camera}
            </button>
            <button type="button" disabled={st.k === 'busy'} onClick={() => run('gallery')} className={`${btn} border border-navy text-navy hover:bg-navy/5 disabled:opacity-60`}>
              <span className="material-symbols-outlined text-xl">image</span>{T.gallery}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">{T.tips}</p>
          <button type="button" onClick={onQuiz} className="mt-4 text-sm font-semibold text-slate-600 underline underline-offset-4 decoration-slate-300 hover:text-navy">{T.quiz}</button>
        </div>

        <div className="w-full max-w-[360px] mx-auto" aria-live="polite">
          {st.k === 'done' ? (
            <div className="border border-slate-200 bg-background-light">
              <img src={st.r.overlay} alt={isEn ? 'Your photo with measurement lines' : '측정선이 그려진 내 사진'} className="w-full block" />
              <div className="p-4 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-dark">{T.result}</p>
                <ul className="space-y-1.5">
                  {st.r.mix.filter((m) => m.pct >= 3).map((m, i) => {
                    const ft = FACE_SHAPE_TYPES[m.code]
                    return (
                      <li key={m.code} className="grid grid-cols-[72px_1fr_40px] items-center gap-2 text-sm">
                        <span className={i === 0 ? 'font-extrabold text-navy' : 'text-slate-600'}>{isEn ? ft.enName.replace(/ Face$/i, '') : ft.koName}</span>
                        <span className="h-2 bg-slate-200 overflow-hidden"><span className="block h-full" style={{ width: `${m.pct}%`, background: i === 0 ? ft.primaryColor : '#94a3b8' }} /></span>
                        <span className="text-right font-mono text-xs tabular-nums text-slate-600">{m.pct}%</span>
                      </li>
                    )
                  })}
                </ul>
                <dl className="grid grid-cols-3 gap-2 text-center border-t border-slate-200 pt-3">
                  {[[T.ratio, st.r.features.L.toFixed(2)], [T.taper, st.r.features.T.toFixed(2)], [T.angle, `${Math.round(st.r.features.A)}°`]].map(([k, v]) => (
                    <div key={k}><dt className="text-[10px] leading-tight text-slate-500">{k}</dt><dd className="mt-0.5 font-mono text-sm font-bold text-navy tabular-nums">{v}</dd></div>
                  ))}
                </dl>
                <a href={`${basePath}/${FACE_SHAPE_TYPES[st.r.mix[0].code].slug}/`}
                  className={`${btn} w-full bg-primary text-white hover:bg-primary-dark`}>
                  {T.see}<span className="material-symbols-outlined text-lg">arrow_forward</span>
                </a>
                <p className="text-[11px] leading-relaxed text-slate-500">{T.note}</p>
                <button type="button" onClick={() => setSt({ k: 'idle' })} className="text-xs font-semibold text-slate-500 underline underline-offset-4">{T.retry}</button>
              </div>
            </div>
          ) : (
            <div className="relative aspect-[4/5] border border-dashed border-slate-300 bg-background-light flex flex-col items-center justify-center text-center p-6 gap-3">
              {st.k === 'busy' ? (
                <>
                  <span className="material-symbols-outlined text-4xl text-navy animate-spin">progress_activity</span>
                  <p className="text-sm font-semibold text-slate-600">{T.busy}</p>
                </>
              ) : st.k === 'error' ? (
                <>
                  <span className="material-symbols-outlined text-4xl text-primary-dark">error</span>
                  <p className="text-sm font-semibold text-slate-700">{T.err[st.e]}</p>
                </>
              ) : (
                <>
                  {/* 측정 미리보기 그림 — 실제 사진 대신 선만(SSR 에서도 보이는 정적 SVG) */}
                  <svg viewBox="0 0 200 250" className="w-40 h-auto" aria-hidden="true">
                    <ellipse cx="100" cy="125" rx="66" ry="92" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 5" />
                    <line x1="52" y1="78" x2="148" y2="78" stroke="#e0a800" strokeWidth="3" /><circle cx="52" cy="78" r="4" fill="#e0a800" /><circle cx="148" cy="78" r="4" fill="#e0a800" />
                    <line x1="36" y1="128" x2="164" y2="128" stroke="#d6336c" strokeWidth="3" /><circle cx="36" cy="128" r="4" fill="#d6336c" /><circle cx="164" cy="128" r="4" fill="#d6336c" />
                    <line x1="58" y1="182" x2="142" y2="182" stroke="#1c7ed6" strokeWidth="3" /><circle cx="58" cy="182" r="4" fill="#1c7ed6" /><circle cx="142" cy="182" r="4" fill="#1c7ed6" />
                    <line x1="100" y1="36" x2="100" y2="216" stroke="#334155" strokeWidth="2" />
                  </svg>
                  <p className="text-xs text-slate-500">{isEn ? 'Forehead · cheekbones · jaw · length' : '이마 · 광대 · 턱 · 세로 길이'}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
