// Before/After 비교 슬라이더 (FREE_PIVOT_PLAN 커밋 P1-4 선구현, screen3 시안)
// ────────────────────────────────────────────────────────────────────
// 드래그 가능한 가운데 핸들로 before(원본)·after(메이크업) 를 비교한다.
// before/after 이미지가 주어지면 실제 이미지를, 없으면 §8 준수 플레이스홀더
// (텍스트 + 무드 스와치)를 그린다 — AI 생성 가짜 얼굴 금지.

import { useRef, useState, useCallback } from 'react'

interface Props {
  /** 원본 셀카 (없으면 플레이스홀더) */
  beforeSrc?: string
  /** 메이크업 결과 (없으면 무드 스와치 플레이스홀더) */
  afterSrc?: string
  /** after 플레이스홀더에 깔 무드 그라데이션 (선택 스타일 색) */
  afterMood?: string
  beforeLabel?: string
  afterLabel?: string
  /** 플레이스홀더임을 알리는 캡션 (실데이터 연결 전) */
  placeholderNote?: string
  isEn?: boolean
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  afterMood = 'linear-gradient(150deg, #dcebf1 0%, #a9d4e3 100%)',
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
  placeholderNote,
  isEn = false,
}: Props) {
  const [pos, setPos] = useState(50) // 0~100, after 가 보이는 비율(왼쪽)
  const wrapRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const setFromClientX = useCallback((clientX: number) => {
    const el = wrapRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const p = ((clientX - r.left) / r.width) * 100
    setPos(Math.max(0, Math.min(100, p)))
  }, [])

  const onDown = (clientX: number) => { dragging.current = true; setFromClientX(clientX) }
  const onMove = (clientX: number) => { if (dragging.current) setFromClientX(clientX) }
  const onUp = () => { dragging.current = false }

  // 플레이스홀더 패널 (이미지 없을 때) — 가짜 얼굴 대신 라벨 + 스와치
  const Placeholder = ({ which }: { which: 'before' | 'after' }) => (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-4"
      style={{ background: which === 'after' ? afterMood : 'linear-gradient(150deg, #4b4f6b 0%, #2a2d44 100%)' }}
    >
      <span className="material-symbols-outlined text-4xl text-white/55" style={{ fontVariationSettings: "'FILL' 1" }}>
        {which === 'after' ? 'auto_awesome' : 'person'}
      </span>
      <span className="text-white/80 text-xs font-bold">
        {which === 'after'
          ? `${afterLabel} · ${isEn ? 'makeup result' : '메이크업 결과'}`
          : `${beforeLabel} · ${isEn ? 'your selfie' : '원본 셀카'}`}
      </span>
    </div>
  )

  return (
    <div className="select-none">
      <div
        ref={wrapRef}
        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden cursor-ew-resize touch-none bg-navy"
        onMouseDown={(e) => onDown(e.clientX)}
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={(e) => onDown(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onUp}
        role="slider"
        aria-label="Before after comparison"
        aria-valuenow={Math.round(pos)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* BEFORE (바닥 전체) */}
        {beforeSrc ? (
          <img src={beforeSrc} alt="before" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <Placeholder which="before" />
        )}

        {/* AFTER (왼쪽 pos% 만 보이게 clip) */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          {afterSrc ? (
            <img src={afterSrc} alt="after" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <Placeholder which="after" />
          )}
        </div>

        {/* 라벨 */}
        <span className="absolute top-3 left-3 text-[10px] font-extrabold tracking-wider text-white bg-black/40 rounded-full px-2.5 py-1">
          {beforeLabel}
        </span>
        <span className="absolute top-3 right-3 text-[10px] font-extrabold tracking-wider text-white bg-black/40 rounded-full px-2.5 py-1">
          {afterLabel}
        </span>

        {/* 핸들 */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow" style={{ left: `${pos}%` }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center text-navy">
            <span className="material-symbols-outlined text-lg">unfold_more</span>
          </div>
        </div>
      </div>

      {placeholderNote && (
        <p className="mt-2 text-center text-[11px] text-white/55">{placeholderNote}</p>
      )}
    </div>
  )
}
