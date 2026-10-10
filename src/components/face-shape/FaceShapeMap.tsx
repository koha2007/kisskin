import type { FaceShapeCode } from '../../lib/face-shape/types'
import { FACE_SHAPE_TYPES } from '../../lib/face-shape/types'
import { isPublished } from '../../lib/class/lessons'
import { curriculumBySlug } from '../../lib/class/curriculum'
import { trackEvent } from '../../lib/analytics'

// 얼굴형별 메이크업 지도 — 2026-10-10 (운영자 요청 C·D).
// 처음엔 9룩·클래스와 같은 AI 페이스 차트로 만들려 했다. 샘플 3장을 뽑아 보니 AI 가 윤곽을
// 그 얼굴형으로 정확히 못 그리고(둥근형인데 턱이 뾰족) 컨투어 위치도 흐렸다 → 교과서식 SVG 도식.
// 윤곽·영역이 전부 좌표라 "어디에"가 틀릴 일이 없고, 비용 0, 크롤러도 읽는다(alt + 범례 텍스트).
// 영역은 src/lib/face-shape/types.ts 의 contouring/recommendedStyle 문장과 맞춰 그렸다 — 문장을 바꾸면 여기도.

const W = 300
const OUTLINE: Record<FaceShapeCode, string> = {
  oval: 'M150,55 C208,55 244,105 244,175 C244,250 205,338 150,340 C95,338 56,250 56,175 C56,105 92,55 150,55 Z',
  round: 'M150,80 C215,80 252,125 252,190 C252,250 225,305 150,322 C75,305 48,250 48,190 C48,125 85,80 150,80 Z',
  square: 'M150,62 C200,62 238,72 240,120 L242,250 C242,285 230,300 205,312 C185,322 168,326 150,326 C132,326 115,322 95,312 C70,300 58,285 58,250 L60,120 C62,72 100,62 150,62 Z',
  oblong: 'M150,40 C200,40 228,80 230,150 L230,250 C230,300 205,338 150,350 C95,338 70,300 70,250 L70,150 C72,80 100,40 150,40 Z',
  heart: 'M150,64 C185,56 230,60 244,100 C254,135 246,190 225,240 C205,285 175,320 150,348 C125,320 95,285 75,240 C54,190 46,135 56,100 C70,60 115,56 150,64 Z',
}
const BROW: Record<FaceShapeCode, string> = {
  oval: 'M95,153 Q118,140 140,148',
  round: 'M95,155 Q116,132 140,148',
  square: 'M95,152 C108,143 128,142 140,149',
  oblong: 'M95,151 Q118,146 140,149',
  heart: 'M95,153 Q118,142 140,148',
}

type E = { cx: number; cy: number; rx: number; ry: number; rot?: number; mirror?: boolean }
type Zones = { contour: E[]; highlight: E[]; blush: E[] }
const NOSE: E = { cx: 150, cy: 200, rx: 3.5, ry: 20 }
const Z: Record<FaceShapeCode, Zones> = {
  oval: {
    contour: [{ cx: 80, cy: 222, rx: 22, ry: 8, rot: 28, mirror: true }],
    blush: [{ cx: 100, cy: 206, rx: 24, ry: 13, rot: -15, mirror: true }],
    highlight: [{ cx: 96, cy: 191, rx: 16, ry: 5, rot: -20, mirror: true }, NOSE],
  },
  round: {
    contour: [{ cx: 76, cy: 228, rx: 34, ry: 9, rot: 35, mirror: true }, { cx: 60, cy: 262, rx: 9, ry: 28, mirror: true }],
    blush: [{ cx: 92, cy: 200, rx: 27, ry: 10, rot: -30, mirror: true }],
    highlight: [{ cx: 150, cy: 120, rx: 12, ry: 22 }, NOSE, { cx: 150, cy: 300, rx: 12, ry: 7 }],
  },
  square: {
    contour: [{ cx: 70, cy: 292, rx: 24, ry: 15, rot: -38, mirror: true }, { cx: 72, cy: 86, rx: 22, ry: 13, rot: 35, mirror: true }],
    blush: [{ cx: 100, cy: 208, rx: 17, ry: 16, mirror: true }],
    highlight: [{ cx: 150, cy: 110, rx: 16, ry: 14 }, NOSE, { cx: 150, cy: 310, rx: 14, ry: 7 }],
  },
  oblong: {
    contour: [{ cx: 150, cy: 50, rx: 72, ry: 12 }, { cx: 150, cy: 344, rx: 42, ry: 9 }],
    blush: [{ cx: 90, cy: 212, rx: 30, ry: 10, mirror: true }],
    highlight: [{ cx: 110, cy: 196, rx: 22, ry: 5, mirror: true }],
  },
  heart: {
    contour: [{ cx: 66, cy: 106, rx: 17, ry: 26, rot: 15, mirror: true }, { cx: 150, cy: 340, rx: 11, ry: 7 }],
    blush: [{ cx: 98, cy: 222, rx: 24, ry: 10, mirror: true }],
    highlight: [{ cx: 150, cy: 316, rx: 10, ry: 8 }, { cx: 112, cy: 250, rx: 12, ry: 6, mirror: true }, NOSE],
  },
}

const C = { contour: 'rgb(132,98,78)', highlight: 'rgb(255,251,238)', blush: 'rgb(238,124,112)' }
const expand = (es: E[]) => es.flatMap((e) => (e.mirror ? [e, { ...e, cx: W - e.cx, rot: -(e.rot ?? 0) }] : [e]))

function FaceSvg({ code, title }: { code: FaceShapeCode; title: string }) {
  const id = `fs-${code}`
  const z = Z[code]
  const layer = (es: E[], color: string, op: number) =>
    expand(es).map((e, i) => (
      <ellipse key={i} cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} fill={color} opacity={op}
        transform={e.rot ? `rotate(${e.rot} ${e.cx} ${e.cy})` : undefined} />
    ))
  return (
    <svg viewBox={`0 0 ${W} 380`} role="img" aria-label={title} className="w-full h-auto">
      <title>{title}</title>
      <defs>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
        <clipPath id={`${id}-clip`}><path d={OUTLINE[code]} /></clipPath>
      </defs>
      <rect width={W} height="380" fill="#f6f1e8" />
      {/* 목 */}
      <path d="M122,290 L112,380 M178,290 L188,380" stroke="#6b6460" strokeWidth="1.3" fill="none" />
      <path d={OUTLINE[code]} fill="#f3e4d6" />
      <g clipPath={`url(#${id}-clip)`} filter={`url(#${id}-soft)`}>
        {layer(z.contour, C.contour, 0.55)}
        {layer(z.blush, C.blush, 0.55)}
        {layer(z.highlight, C.highlight, 1)}
      </g>
      <path d={OUTLINE[code]} fill="none" stroke="#3f3a37" strokeWidth="1.6" />
      {/* 눈썹 · 눈 · 코 · 입 — 연필 선 */}
      <g fill="none" stroke="#4a4340" strokeLinecap="round">
        <path d={BROW[code]} strokeWidth="3.2" />
        <path d={BROW[code]} strokeWidth="3.2" transform={`translate(${W} 0) scale(-1 1)`} />
        <path d="M103,176 Q118,166 133,176 Q118,183 103,176 Z" strokeWidth="1.3" />
        <path d="M167,176 Q182,166 197,176 Q182,183 167,176 Z" strokeWidth="1.3" />
        <path d="M136,224 Q150,233 164,224" strokeWidth="1.3" />
        <path d="M132,262 Q141,256 150,259 Q159,256 168,262 Q150,274 132,262 Z" strokeWidth="1.3" />
      </g>
      <circle cx="118" cy="175.5" r="4" fill="#4a4340" />
      <circle cx="182" cy="175.5" r="4" fill="#4a4340" />
    </svg>
  )
}

// 이 얼굴형에 이어지는 클래스 편(커리큘럼 11·23·25) — 아직 안 나왔으면 "곧 공개"로 허브에
const CLASS_LINKS = [
  { slug: 'eyebrow-shape-face-shape', icon: 'face', part: 'brows' },
  { slug: 'blush-placement-face-shape', icon: 'brush', part: 'cheeks' },
  { slug: 'contour-face-shape', icon: 'contrast', part: 'cheeks' },
] as const

export default function FaceShapeMap({ code, isEn }: { code: FaceShapeCode; isEn: boolean }) {
  const t = FACE_SHAPE_TYPES[code]
  const prefix = isEn ? '/en' : ''
  const name = isEn ? t.enName : t.koName
  const c = isEn && t.contouringEn ? t.contouringEn : t.contouring
  const s = isEn && t.recommendedStyleEn ? t.recommendedStyleEn : t.recommendedStyle
  const rows = [
    { color: C.contour, label: isEn ? 'Contour' : '컨투어', text: `${c.cheekbone} ${c.jawline}` },
    { color: C.highlight, label: isEn ? 'Highlight' : '하이라이트', text: c.highlighter, ring: true },
    { color: C.blush, label: isEn ? 'Blush' : '블러셔', text: s.blush },
    { color: '#4a4340', label: isEn ? 'Brows' : '눈썹', text: s.brow },
  ]
  return (
    <section className="py-10 md:py-14 bg-white border-y border-slate-200" aria-labelledby="fs-map-title">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 grid md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] gap-8 md:gap-12 items-start">
        <figure className="w-full max-w-[320px] mx-auto border border-slate-200">
          <FaceSvg code={code} title={isEn ? `${name}: where to contour, highlight and blush` : `${name} 컨투어 · 하이라이트 · 블러셔 위치`} />
        </figure>
        <div className="min-w-0">
          <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-primary-dark mb-2">{isEn ? 'Makeup map' : '메이크업 지도'}</p>
          <h2 id="fs-map-title" className="font-serif text-2xl md:text-3xl font-semibold text-navy leading-tight tracking-tight">
            {isEn ? `Where makeup goes on a ${name.toLowerCase()}` : `${name}, 어디에 무엇을`}
          </h2>
          <ul className="mt-5 space-y-3.5">
            {rows.map((r) => (
              <li key={r.label} className="grid grid-cols-[18px_minmax(0,1fr)] gap-3 items-start">
                <span className={`mt-1 h-[18px] w-[18px] rounded-full ${r.ring ? 'ring-1 ring-slate-300' : ''}`} style={{ background: r.color }} aria-hidden="true" />
                <p className="text-sm md:text-[15px] text-slate-700 leading-relaxed"><strong className="text-navy">{r.label}</strong> · {r.text}</p>
              </li>
            ))}
          </ul>

          <div className="mt-7">
            <p className="text-xs font-bold text-slate-500 mb-2">{isEn ? 'Learn it step by step — free makeup class' : '단계별로 배우기 — 무료 메이크업 클래스'}</p>
            <div className="grid sm:grid-cols-3 gap-2">
              {CLASS_LINKS.map((l) => {
                const cur = curriculumBySlug(l.slug)!
                const live = isPublished(l.slug)
                const href = live ? `${prefix}/class/${l.slug}/` : `${prefix}/class/#${l.part}`
                return (
                  <a key={l.slug} href={href} onClick={() => trackEvent('face_shape_class_click', { shape: code, lesson: l.slug, live })}
                    className="flex flex-col gap-1 border border-slate-200 bg-background-light px-3.5 py-3 hover:border-navy transition-colors">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                      <span className="material-symbols-outlined text-base text-primary-dark">{l.icon}</span>
                      {isEn ? `Lesson ${cur.n}` : `${cur.n}편`}{!live && (isEn ? ' · coming soon' : ' · 곧 공개')}
                    </span>
                    <span className="text-sm font-bold text-navy leading-snug break-keep">{isEn ? cur.titleEn : cur.titleKo}</span>
                  </a>
                )
              })}
            </div>
          </div>
          <p className="mt-4 text-[11px] text-slate-400">{isEn ? 'Diagram, not a photo — shading areas are approximate guides.' : '사진이 아닌 도식이에요. 칠한 영역은 대략적인 위치 안내예요.'}</p>
        </div>
      </div>
    </section>
  )
}
