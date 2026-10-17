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
// 2026-10-17: 운영자가 SVG 를 "엉성하다"고 해 gpt-image-2(high)로 다시 그렸다. 이번엔 영역 문장을 프롬프트에
// 그대로 넣고 5장을 눈으로 검수(둥근형 턱·각진형 턱 모서리·긴형 위아래 컨투어 확인) → 일러스트로 교체.
// 문장을 바꾸면 차트도 다시 그려야 한다(프롬프트: 세션 스크래치 charts.json, 같은 문장 그대로).

// 범례 색(컨투어·하이라이트·블러셔) — 그림은 페이스 차트 일러스트(/mood/fs-*-chart.webp)
const C = { contour: 'rgb(132,98,78)', highlight: 'rgb(255,251,238)', blush: 'rgb(238,124,112)' }

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
          {/* 2026-10-17: 코드로 그린 도형 → 메이크업 아티스트 페이스 차트 일러스트(gpt-image-2).
              위치는 아래 설명(contouring·blush·highlighter)과 맞춰 생성·검수했다. */}
          <img
            src={`/mood/fs-${code}-chart.webp`}
            alt={isEn ? `${name}: where to contour, highlight and blush` : `${name} 컨투어 · 하이라이트 · 블러셔 위치`}
            width={768} height={1152} loading="lazy" decoding="async"
            className="block w-full h-auto"
          />
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
