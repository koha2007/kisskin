// AI 메이크업 — 9스타일 선택 화면 (2026-07-05: 여성 9룩 복원, 3×3 그리드)
// ────────────────────────────────────────────────────────────────────
// 폰트·색은 우리 토큰 — Pretendard(font-display) / navy #070953 / primary #eb4763.
// 무드 그라데이션·글래스 카드 언어는 QuizScreen 의 grid variant 를 그대로 따라간다.
//
// 카드 이미지(2026-07-12): 무드 그라데이션만으로는 "이 룩이 실제로 어떤 얼굴이 되는지"를
// 못 보여줘 선택이 어렵다 → 룩별 실제 결과 이미지(LOOK_IMAGES.after)를 깔고 그 위에
// 라벨을 얹는다. 이 애프터들은 라이브와 동일한 파이프라인(gpt-image-2 + promptWholeFace)의
// 실제 출력이라 §8 위반이 아니다(가짜 결과 아님). 이미지 로드 실패 시 무드 그라데이션 폴백.
//
// 1개 선택 = 1크레딧 = 결과 1장.

import { useState } from 'react'
import { MAKEUP_STYLES, type MakeupStyleId } from '../../lib/makeup/styles'
import { lookImage } from '../../lib/makeup/lookImages'

const NAVY = '#070953'
const PRIMARY = '#eb4763'

// 화면 배경: 결과 IdentityCard·QuizScreen 과 동일한 navy → primary 그라데이션.
const screenBg = { background: `linear-gradient(160deg, ${NAVY} 0%, #1a1268 45%, ${PRIMARY} 125%)` }

function gtagEvent(name: string, params?: Record<string, unknown>) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void }
  if (typeof w.gtag === 'function') w.gtag('event', name, params)
}

interface Props {
  /** "이 스타일로 생성하기" → 선택된 스타일 id 전달 (다음 단계 = 셀카 업로드/생성) */
  onConfirm: (styleId: MakeupStyleId) => void
  onBack: () => void
  isEn?: boolean
  /** 진입 시 미리 선택해 둘 스타일 (없으면 첫 스타일) */
  initialStyle?: MakeupStyleId
  /** 미로그인이면 로그인 링크(?next= 포함). 생성 직전 화면이라 여기서도 못박아 준다. */
  loginHref?: string
}

export default function MakeupStyleSelect({ onConfirm, onBack, isEn = false, initialStyle, loginHref }: Props) {
  const [selected, setSelected] = useState<MakeupStyleId>(initialStyle ?? MAKEUP_STYLES[0].id)
  // 큰 프리뷰에서 비포/애프터를 직접 비교한다. 룩을 바꾸면 애프터로 되돌린다.
  const [showBefore, setShowBefore] = useState(false)
  const selectedStyle = MAKEUP_STYLES.find((s) => s.id === selected) ?? MAKEUP_STYLES[0]
  const preview = lookImage(selected)

  const pick = (id: MakeupStyleId) => { setSelected(id); setShowBefore(false) }

  const handleConfirm = () => {
    gtagEvent('style_selected', { style: selected })
    onConfirm(selected)
  }

  const Card = ({ id }: { id: MakeupStyleId }) => {
    const s = MAKEUP_STYLES.find((x) => x.id === id)!
    const img = lookImage(id)
    const isSel = selected === id
    return (
      <button
        type="button"
        onClick={() => pick(id)}
        aria-pressed={isSel}
        className={`style-card group relative w-full rounded-xl aspect-[4/5] p-2.5 flex flex-col justify-end text-left overflow-hidden transition-all active:scale-[0.97] ${
          isSel
            ? 'ring-2 ring-white shadow-2xl shadow-black/40 scale-[1.03]'
            : 'ring-1 ring-white/15 opacity-90 hover:opacity-100'
        }`}
        style={{ background: s.mood }}
      >
        {/* 실제 룩 결과 이미지 — 없거나 실패하면 아래 무드 그라데이션이 그대로 보인다. */}
        {img && (
          <img
            src={img.after}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        )}

        {/* 하단 스크림 — 흰 텍스트 가독성 (밝은 사진/그라데이션 대비) */}
        <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 to-transparent" />

        {/* 선택 체크 (우상단 동그라미 체크) */}
        {isSel && (
          <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white text-primary flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              check
            </span>
          </span>
        )}

        <span className="relative">
          {isEn ? (
            <span className="block text-white font-extrabold text-[10.5px] leading-tight tracking-tight drop-shadow-md">
              {s.subEn}
            </span>
          ) : (
            <>
              <span className="block text-white font-extrabold text-[12px] leading-tight drop-shadow-md">
                {s.nameKo}
              </span>
              <span className="block text-white/70 text-[7.5px] font-bold tracking-wide mt-0.5 drop-shadow leading-tight">
                {s.subEn}
              </span>
            </>
          )}
        </span>
      </button>
    )
  }

  return (
    <div className="min-h-[100dvh] flex flex-col font-display text-white" style={screenBg}>
      {/* 상단: 뒤로 + 타이틀 + 진행 점 (스타일→셀카→결과) */}
      <header className="px-5 pt-5 flex items-center gap-3 max-w-xl w-full mx-auto">
        <button
          onClick={onBack}
          aria-label={isEn ? 'Back' : '뒤로'}
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 transition"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-base font-bold tracking-tight">{isEn ? 'AI Makeup' : 'AI 메이크업'}</h1>
        <div className="shrink-0 flex items-center gap-1.5" aria-hidden>
          <span className="w-2 h-2 rounded-full bg-white" />
          <span className="w-2 h-2 rounded-full bg-white/30" />
          <span className="w-2 h-2 rounded-full bg-white/30" />
        </div>
      </header>

      {/* 본문: 큰 프리뷰 + 9카드 그리드 */}
      <main className="flex-1 flex flex-col px-5 pt-5 pb-4 max-w-xl w-full mx-auto">
        <h2 className="text-xl md:text-2xl font-extrabold leading-snug tracking-tight mb-4">
          {isEn ? 'Which makeup shall we try?' : '어떤 메이크업을 입혀볼까요?'}
        </h2>

        {/* ── 선택한 룩의 애프터를 크게 ──
            3×3 썸네일만으론 룩이 실제로 어떤 얼굴이 되는지 판단이 안 된다(모바일에서 카드 폭 ~110px).
            선택 즉시 큰 프리뷰로 보여주고, 비포와 직접 견줘 볼 수 있게 토글을 단다.
            이 이미지들은 라이브와 같은 파이프라인(gpt-image-2 + promptWholeFace)의 실제 출력이다(§8). */}
        {preview && (
          <figure className="relative rounded-3xl overflow-hidden ring-1 ring-white/20 shadow-2xl shadow-black/40 mb-3" style={{ background: selectedStyle.mood }}>
            <img
              key={`${selected}-${showBefore ? 'b' : 'a'}`}
              src={showBefore ? preview.before : preview.after}
              alt={
                isEn
                  ? `${selectedStyle.subEn} — ${showBefore ? 'before (bare face)' : 'after'} example`
                  : `${selectedStyle.nameKo} — ${showBefore ? '비포(민낯)' : '애프터'} 예시`
              }
              className="w-full h-[36vh] min-h-[200px] max-h-[330px] object-cover object-top"
              decoding="async"
            />

            {/* 비포/애프터 토글 */}
            <div className="absolute top-2.5 left-2.5 flex rounded-full bg-black/45 backdrop-blur-sm p-0.5 text-[11px] font-extrabold">
              {[
                { key: 'after', label: isEn ? 'After' : '애프터' },
                { key: 'before', label: isEn ? 'Before' : '비포' },
              ].map((t) => {
                const on = (t.key === 'before') === showBefore
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setShowBefore(t.key === 'before')}
                    aria-pressed={on}
                    className={`px-3 py-1.5 rounded-full transition ${on ? 'bg-white text-navy' : 'text-white/75'}`}
                    style={on ? { color: NAVY } : undefined}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>

            {/* 이건 "내 결과"가 아니라 모델 예시라는 걸 분명히 한다 — 오인 방지. */}
            <span className="absolute top-3.5 right-3 text-[10px] font-bold text-white/70 drop-shadow">
              {isEn ? 'Real output · sample model' : '실제 생성 예시 (모델 사진)'}
            </span>

            <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-4">
              <span className="block text-white font-extrabold text-[17px] leading-tight drop-shadow">
                {isEn ? selectedStyle.subEn : selectedStyle.nameKo}
              </span>
              <span className="block text-white/80 text-[12.5px] leading-snug mt-1 drop-shadow">
                {isEn ? selectedStyle.descEn : selectedStyle.descKo}
              </span>
            </figcaption>
          </figure>
        )}

        <p className="text-[12px] text-white/55 mb-2.5 text-center">
          {isEn ? 'Tap a look to preview it' : '카드를 누르면 위에서 크게 볼 수 있어요'}
        </p>

        <div className="grid grid-cols-3 gap-2.5">
          {MAKEUP_STYLES.map((s) => (
            <Card key={s.id} id={s.id} />
          ))}
        </div>
      </main>

      {/* 하단: "1장 생성" 안내 + CTA (sticky) */}
      <footer
        className="sticky bottom-0 px-5 pt-3 pb-6 max-w-xl w-full mx-auto"
        style={{ background: 'linear-gradient(to top, rgba(7,9,83,0.95) 60%, transparent)' }}
      >
        {/* 생성 직전 화면 — 로그인이 "필수"임을 여기서도 못박는다(업로드 화면 배너와 같은 톤). */}
        {loginHref && (
          <a
            href={loginHref}
            className="mb-2.5 flex items-center justify-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-2 text-[12px] font-semibold active:scale-[0.99] transition"
          >
            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock
            </span>
            {isEn ? (
              <span><span className="font-extrabold">Login required</span> to generate · 1st try free</span>
            ) : (
              <span>생성하려면 <span className="font-extrabold">로그인 필수</span> · 무료 1회</span>
            )}
            <span className="underline underline-offset-2 opacity-80">{isEn ? 'Log in' : '로그인'}</span>
          </a>
        )}
        <p className="text-center text-xs font-bold text-white/80 mb-2.5 inline-flex w-full items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
          {isEn ? '1 credit · 1 result image' : '1크레딧 = 결과 1장 생성'}
        </p>
        <button
          onClick={handleConfirm}
          className="w-full rounded-full py-4 font-extrabold text-[15px] text-white shadow-xl shadow-primary/30 active:scale-[0.98] transition-transform"
          style={{ background: PRIMARY }}
        >
          {isEn ? 'Try this style' : '이 스타일로 생성하기'}
        </button>
      </footer>
    </div>
  )
}
