// 디자인 시스템 통일 — 무료 도구 카드 공통 컴포넌트 (단일 소스).
// 홈 무료도구 그리드 + /tools 허브가 같은 컴포넌트를 재사용한다.
// 카드 틀(배경/보더/라운드/그림자/여백)은 전 도구 동일. 도구별 색은 '액센트 1점'
// (아이콘 칩 틴트 + 태그)으로만 사용한다 — 메인은 네이비+핑크. (DESIGN_SYSTEM.md)

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
}

export default function ToolCard({ href, icon, accent, title, desc, tag, cta, available = true }: ToolCardProps) {
  const tint = `color-mix(in srgb, ${accent} 12%, white)`
  return (
    // 2026-07-22: 라운드를 조이고 hover 리프트+큰 그림자를 뺐다. 떠오르는 카드는
    // 2019~20년 머티리얼 문법이라 그 자체로 연식을 드러낸다. 상태 변화는 보더로만 준다.
    <a
      href={available ? href : undefined}
      className={`group flex flex-col rounded-lg border border-slate-200 bg-white p-5 md:p-6 transition-colors ${
        available ? 'hover:border-navy' : 'opacity-60 cursor-not-allowed'
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: tint, color: accent }}
        >
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {icon}
          </span>
        </div>
        {tag && (
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>
            {tag}
          </span>
        )}
      </div>

      <h3 className="mb-1.5 text-base md:text-lg font-bold leading-snug text-navy">{title}</h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600">{desc}</p>

      {available && cta && (
        <div className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition-all group-hover:gap-1.5">
          {cta}
          <span className="material-symbols-outlined text-base" style={{ color: accent }}>arrow_forward</span>
        </div>
      )}
    </a>
  )
}
