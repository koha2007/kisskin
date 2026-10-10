import { useEffect, useState } from 'react'
import { readMix, type StoredMix } from '../../lib/face-shape/measure'
import { FACE_SHAPE_TYPES, type FaceShapeCode } from '../../lib/face-shape/types'

// 결과 페이지 상단 "내 측정 결과" — 2026-10-10 (운영자 요청 B).
// 방금 이 탭에서 진단한 사람에게만 보인다(sessionStorage). 유형 페이지 자체는 정적 프리렌더 그대로라
// 검색으로 바로 들어온 사람·크롤러에겐 아무것도 안 그린다(빈 자리 없음).
export default function FaceShapeMix({ code, isEn, basePath }: { code: FaceShapeCode; isEn: boolean; basePath: string }) {
  const [m, setM] = useState<StoredMix | null>(null)
  useEffect(() => { setM(readMix()) }, [])
  if (!m || !m.mix.some((x) => x.code === code)) return null
  const top = m.mix[0]
  const second = m.mix[1]
  const isTop = top.code === code
  const nm = (c: FaceShapeCode) => (isEn ? FACE_SHAPE_TYPES[c].enName.replace(/ Face$/i, '') : FACE_SHAPE_TYPES[c].koName)

  return (
    <section className="py-8 md:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)] gap-5 md:gap-8 items-center bg-white border border-slate-200 p-4 md:p-6">
          {m.overlay ? (
            <img src={m.overlay} alt={isEn ? 'Your photo with measurement lines (stays on this device)' : '측정선이 그려진 내 사진(이 기기에만 있어요)'} className="w-full max-w-[200px] mx-auto block" />
          ) : null}
          <div className={m.overlay ? '' : 'sm:col-span-2'}>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-dark">
              {m.source === 'scan' ? (isEn ? 'Measured from your selfie' : '내 셀카 측정 결과') : (isEn ? 'From your answers' : '내 답변으로 본 결과')}
            </p>
            <p className="mt-1.5 text-lg md:text-xl font-extrabold text-navy leading-snug">
              {second && second.pct >= 20
                ? (isEn ? `Mostly ${nm(top.code)}, with some ${nm(second.code)}` : `${nm(top.code)}에 가깝고, ${nm(second.code)} 느낌도 있어요`)
                : (isEn ? `Closest to ${nm(top.code)}` : `${nm(top.code)}에 가장 가까워요`)}
            </p>
            <ul className="mt-3 space-y-1.5 max-w-md">
              {m.mix.filter((x) => x.pct >= 3).map((x) => (
                <li key={x.code} className="grid grid-cols-[64px_1fr_40px] items-center gap-2 text-sm">
                  <a href={`${basePath}/${FACE_SHAPE_TYPES[x.code].slug}/`} className={x.code === code ? 'font-extrabold text-navy' : 'text-slate-600 hover:text-navy underline-offset-2 hover:underline'}>{nm(x.code)}</a>
                  <span className="h-2 bg-slate-200 overflow-hidden"><span className="block h-full" style={{ width: `${x.pct}%`, background: x.code === code ? FACE_SHAPE_TYPES[x.code].primaryColor : '#94a3b8' }} /></span>
                  <span className="text-right font-mono text-xs tabular-nums text-slate-600">{x.pct}%</span>
                </li>
              ))}
            </ul>
            {!isTop && (
              <p className="mt-3 text-sm text-slate-600">
                {isEn ? 'You’re viewing a shape that isn’t your top match. ' : '지금 보는 건 1순위가 아닌 얼굴형이에요. '}
                <a href={`${basePath}/${FACE_SHAPE_TYPES[top.code].slug}/`} className="font-bold text-navy underline underline-offset-4">{isEn ? `See ${nm(top.code)}` : `${nm(top.code)} 보기`}</a>
              </p>
            )}
            {second && second.pct >= 20 && isTop && (
              <p className="mt-3 text-sm text-slate-600">
                {isEn ? 'Blended shapes are common — tips for your second shape can help too. ' : '두 유형이 섞인 얼굴은 흔해요. 2순위 얼굴형 팁도 함께 참고해 보세요. '}
                <a href={`${basePath}/${FACE_SHAPE_TYPES[second.code].slug}/`} className="font-bold text-navy underline underline-offset-4">{isEn ? `See ${nm(second.code)}` : `${nm(second.code)} 보기`}</a>
              </p>
            )}
            {m.source === 'scan' && (
              <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
                {isEn ? 'An estimate from one photo. Your photo was measured in this browser and never uploaded.' : '사진 한 장으로 낸 추정이에요. 사진은 이 브라우저에서만 쟀고 업로드하지 않았어요.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
