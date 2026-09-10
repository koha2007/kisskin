import type { ReactNode } from 'react'

interface SectionHeaderProps {
  /** 버밀리언 소문자 라벨 */
  eyebrow: string
  title: ReactNode
  subtitle?: ReactNode
  /** dark = 네이비 배경 위(제목 흰색) */
  tone?: 'light' | 'dark'
  /** 섹션 안 하위 블록이면 3 */
  level?: 2 | 3
  /** section 의 aria-labelledby 대상 */
  titleId?: string
  className?: string
}

/**
 * 홈 전 섹션 공통 헤더 — eyebrow + serif 제목 + (선택) 부제.
 * 위치(가운데)·크기·색을 한 곳에서 관리한다. 2026-09-10 통일:
 * 이전엔 섹션마다 정렬·폰트크기(1.75rem~3rem)·색이 제각각이었다.
 */
export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  tone = 'light',
  level = 2,
  titleId,
  className = '',
}: SectionHeaderProps) {
  const dark = tone === 'dark'
  // lining-nums: serif 기본 올드스타일 숫자가 '1분'을 'I분'처럼 보이게 해서 캡하이트 숫자로 고정.
  const cls = `font-serif lining-nums text-[1.75rem] md:text-[2.5rem] font-semibold tracking-tight leading-[1.15] ${
    dark ? 'text-white' : 'text-navy'
  }`
  return (
    <div className={`max-w-2xl mx-auto text-center mb-10 md:mb-14 ${className}`}>
      <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
        {eyebrow}
      </p>
      {level === 3 ? (
        <h3 id={titleId} className={cls}>{title}</h3>
      ) : (
        <h2 id={titleId} className={cls}>{title}</h2>
      )}
      {subtitle && (
        <p
          className={`text-sm md:text-base mt-3 leading-relaxed ${
            dark ? 'text-slate-300' : 'text-slate-500'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
