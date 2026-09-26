// 디자인 시스템 통일 — 무료 도구 카드 공통 컴포넌트 (단일 소스).
// 홈 무료도구 그리드 + /tools 허브가 같은 컴포넌트를 재사용한다.
// 카드 틀(배경/보더/라운드/그림자/여백)은 전 도구 동일. 도구별 색은 '액센트 1점'
// (아이콘 칩 틴트 + 태그)으로만 사용한다 — 메인은 네이비+핑크. (DESIGN_SYSTEM.md)

import type { CSSProperties } from 'react'
import { readableInk } from '../lib/a11y/readableInk'

interface ToolCardProps {
  href: string
  /** Material Symbols 아이콘 이름 (예: 'palette', 'quiz', 'face') */
  icon: string
  /** 도구 액센트 색 — CSS 토큰 권장: 'var(--color-tool-mbti)' 등 */
  accent: string
  title: string
  /** 한 줄 핵심 설명 */
  desc: string
  /** 작은 액센트 라벨 (예: '인기', '신규', '시그니처') */
  tag?: string
  /** CTA 라벨 (예: '진단', '테스트'). 생략 시 CTA 미표시 */
  cta?: string
  /** 기본 true. false면 비활성(흐림) */
  available?: boolean
  /** 카드 상단 실물 이미지. 없으면 기존 아이콘 칩만 나온다. */
  image?: string
  /** "6문항 · 약 1분" 처럼 실제 수치. 진단 도구를 누르게 만드는 유일한 정보다. */
  meta?: string
}

export default function ToolCard({ href, icon, accent, title, desc, tag, cta, available = true, image, meta }: ToolCardProps) {
  // 도구 액센트 6색은 '눈에 띄라고' 고른 밝은 색이라 글자색으로 쓰면 대비가 깨진다
  // (틸 3.07 · 세이지 3.10 · 머스터드 2.74 — AA 4.5 미달). 2026-09-22 실측.
  // 면·점·아이콘에는 원색을, **글자(배지·CTA)에는 잉크**를 쓴다. 색상은 그대로고 명도만 내려간다.
  // accent 는 두 가지 모양으로 온다: 헥스(#4e9fa6)와 CSS 변수(var(--color-tool-mbti)).
  // 변수는 런타임에 값을 모르므로 계산할 수 없다 → 짝이 되는 -ink 변수로 바꿔 준다
  // (index.css 에 6색의 잉크 단계가 정의돼 있다). 헥스면 그 자리에서 계산한다.
  const ink = /^var\(--color-tool-[a-z]+\)$/.test(accent.trim())
    ? accent.trim().replace(/\)$/, '-ink)')
    : readableInk(accent, '#ffffff')
  const tint = `color-mix(in srgb, ${accent} 12%, white)`
  const tintHover = `color-mix(in srgb, ${accent} 5%, white)`
  const borderHover = `color-mix(in srgb, ${accent} 45%, white)`
  return (
    // 2026-09 개편: 검색 유입의 첫 착지점이라 "눈에 더 들어오게" 한다.
    //  · hover 는 리프트/큰 그림자 없이 보더+옅은 배경 워시로만(2026-07-22 방침 유지).
    //  · 2026-09-10: 상단 액센트 바 제거 → 이미지가 라운드 상단까지 꽉 차게(다른 섹션 카드와 통일).
    <a
      href={available ? href : undefined}
      style={available ? ({ '--tc-bd': borderHover, '--tc-bg': tintHover } as CSSProperties) : undefined}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors ${
        available
          ? 'hover:border-[var(--tc-bd)] hover:bg-[var(--tc-bg)]'
          : 'opacity-60 cursor-not-allowed'
      }`}
    >
      {/* 결과 사진(허브에서만 전달) — YouCam 처럼 "무엇을 해 주는지" 먼저 보여준다. */}
      {image && (
        <span className="block aspect-[16/9] overflow-hidden bg-cream">
          <img src={image} alt={title} loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
        </span>
      )}
      <div className="flex flex-1 flex-col p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: tint, color: accent }}
        >
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {icon}
          </span>
        </div>
        {tag && (
          <span
            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ color: ink, borderColor: `color-mix(in srgb, ${accent} 30%, white)` }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
            {tag}
          </span>
        )}
      </div>

      <h3 className="mb-1.5 text-[17px] md:text-lg font-bold leading-snug text-navy">{title}</h3>
      <p className="mb-3 flex-1 text-sm leading-relaxed text-slate-600">{desc}</p>

      {meta && (
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{meta}</p>
      )}

      {available && cta && (
        <div
          className="inline-flex items-center gap-1 text-sm font-bold transition-all group-hover:gap-2"
          style={{ color: ink }}
        >
          {cta}
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </div>
      )}
      </div>
    </a>
  )
}
