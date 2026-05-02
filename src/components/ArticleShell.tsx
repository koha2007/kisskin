import type { ReactNode } from 'react'
import { ToolsNav, ToolsFooter } from './ToolsLayout'

export type RelatedItem = {
  slug: string
  title: string
  date: string
  categoryLabel: string
  categoryColor: string
}

type Props = {
  hubLabel: string
  hubPath: string
  categoryLabel: string
  categoryColor: string
  date: string
  readMinutes: number
  title: string
  summary: string
  metaExtra?: ReactNode
  children: ReactNode
  tags?: string[]
  related?: RelatedItem[]
  relatedLabel?: string
  relatedBasePath?: string
  ctaTitle?: string
  ctaSubtitle?: string
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default function ArticleShell({
  hubLabel,
  hubPath,
  categoryLabel,
  categoryColor,
  date,
  readMinutes,
  title,
  summary,
  metaExtra,
  children,
  tags,
  related,
  relatedLabel,
  relatedBasePath,
  ctaTitle = '내게 어울리는 룩, AI로 직접 시뮬레이션',
  ctaSubtitle = '셀카 한 장으로 9가지 K-뷰티 메이크업을 30초 안에',
}: Props) {
  return (
    <div className="font-display bg-white min-h-screen">
      <ToolsNav />

      <main>
        {/* Header — clean, no gradient */}
        <section className="border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <a
              href={hubPath}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-navy text-xs font-medium mb-6"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              {hubLabel}
            </a>
            <div className="flex items-center gap-2 mb-5 text-[11px] text-slate-500 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: categoryColor }}
                />
                <span className="font-semibold text-slate-700">{categoryLabel}</span>
              </span>
              <span className="text-slate-300">·</span>
              <span>{formatDate(date)}</span>
              <span className="text-slate-300">·</span>
              <span>{readMinutes}분 읽기</span>
              {metaExtra && (
                <>
                  <span className="text-slate-300">·</span>
                  {metaExtra}
                </>
              )}
            </div>
            <h1 className="text-2xl md:text-[36px] font-bold text-navy leading-[1.2] tracking-tight mb-4">
              {title}
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-6">
              {summary}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>작성</span>
              <a href="/about" className="font-semibold text-slate-700 hover:text-navy underline">
                kissinskin Editorial · Yonghun Kim
              </a>
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}

            {tags && tags.length > 0 && (
              <div className="mt-12 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">태그</span>
                  {tags.map((tag) => (
                    <span key={tag} className="text-slate-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA — single subtle button */}
        <section className="border-t border-slate-200 bg-slate-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h2 className="text-lg md:text-xl font-bold text-navy mb-2 tracking-tight">
              {ctaTitle}
            </h2>
            <p className="text-slate-600 text-sm mb-5">{ctaSubtitle}</p>
            <a
              href="/analysis"
              className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-navy-mid transition-colors"
            >
              AI 메이크업 시작
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>
        </section>

        {/* Related — list, not card grid */}
        {related && related.length > 0 && relatedBasePath && (
          <section className="border-t border-slate-200">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-5">
                {relatedLabel ?? '관련 글'}
              </div>
              <ul className="divide-y divide-slate-200">
                {related.map((r) => (
                  <li key={r.slug}>
                    <a
                      href={`${relatedBasePath}/${r.slug}/`}
                      className="group block py-4"
                    >
                      <div className="flex items-center gap-2 mb-1.5 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full"
                            style={{ background: r.categoryColor }}
                          />
                          <span className="font-semibold text-slate-700">
                            {r.categoryLabel}
                          </span>
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-navy leading-snug group-hover:text-primary transition-colors">
                        {r.title}
                      </h3>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>

      <ToolsFooter />
    </div>
  )
}
