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
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-9 md:py-14">
            <a
              href={hubPath}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-navy text-xs font-medium mb-5"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              {hubLabel}
            </a>
            <div className="flex items-center gap-2 mb-4 text-[11px] text-slate-500 flex-wrap">
              <a
                href={hubPath}
                className="inline-flex items-center gap-1.5 hover:text-navy transition-colors"
                aria-label={`${categoryLabel} 카테고리 글 더 보기`}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: categoryColor }}
                />
                <span className="font-semibold text-slate-700 hover:text-navy">{categoryLabel}</span>
              </a>
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
            <h1 className="text-[26px] md:text-[38px] font-bold text-navy leading-[1.22] tracking-tight mb-4">
              {title}
            </h1>
            <p className="text-[15px] md:text-lg text-slate-600 leading-relaxed mb-5">
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
        <section className="py-10 md:py-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}

            {/* Editorial transparency disclosure — AdSense policy: original content provenance */}
            <div className="mt-12 p-5 md:p-6 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-2">
                이 글에 대해
              </div>
              <p className="text-[13px] md:text-sm text-slate-600 leading-relaxed mb-2">
                kissinskin은 1인 인디 프로젝트로, 모든 글은 운영자{' '}
                <a href="/about" className="font-semibold text-navy underline hover:text-primary">
                  Yonghun Kim
                </a>
                이 직접 기획·편집합니다. 사실 확인은 BeautyMatter, NIQ, Mintel, Sephora 분기 보고서, Olive Young 베스트셀러
                데이터 등 공개 출처를 교차 참조합니다.
              </p>
              <p className="text-[13px] md:text-sm text-slate-600 leading-relaxed">
                개인 의견과 일반화된 가이드는 구분해 표기하며, 의학적·법적 판단이 필요한 사안은 전문가 상담을 권고합니다.
                오류 제보·의견은{' '}
                <a href="/contact" className="font-semibold text-navy underline hover:text-primary">
                  문의 페이지
                </a>
                를 통해 받습니다.
              </p>
            </div>

            {tags && tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">태그</span>
                  {tags.map((tag) => (
                    <a
                      key={tag}
                      href={hubPath}
                      className="text-slate-500 hover:text-navy hover:bg-slate-100 px-2 py-0.5 rounded-full transition-colors"
                    >
                      #{tag}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Related AI tools — content → tool funnel + internal link density */}
        <section className="border-t border-slate-200 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-2 text-center">
              kissinskin · 무료 AI 진단
            </div>
            <h2 className="text-lg md:text-xl font-bold text-navy text-center mb-6 tracking-tight">
              읽은 김에, 내게 맞는 메이크업도 진단해 보세요
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <a
                href="/tools/makeup-mbti/"
                className="group block p-5 border border-slate-200 rounded-xl hover:border-primary/40 hover:bg-rose-50/30 transition-colors"
              >
                <div className="text-2xl mb-2">💄</div>
                <div className="text-[13px] font-bold text-navy mb-1 group-hover:text-primary">
                  메이크업 MBTI
                </div>
                <div className="text-[12px] text-slate-500 leading-snug">
                  16가지 메이크업 성향 진단
                </div>
              </a>
              <a
                href="/tools/personal-color/"
                className="group block p-5 border border-slate-200 rounded-xl hover:border-primary/40 hover:bg-rose-50/30 transition-colors"
              >
                <div className="text-2xl mb-2">🎨</div>
                <div className="text-[13px] font-bold text-navy mb-1 group-hover:text-primary">
                  퍼스널 컬러
                </div>
                <div className="text-[12px] text-slate-500 leading-snug">
                  봄/여름/가을/겨울 4계절 분석
                </div>
              </a>
              <a
                href="/tools/face-shape/"
                className="group block p-5 border border-slate-200 rounded-xl hover:border-primary/40 hover:bg-rose-50/30 transition-colors"
              >
                <div className="text-2xl mb-2">👤</div>
                <div className="text-[13px] font-bold text-navy mb-1 group-hover:text-primary">
                  얼굴형 진단
                </div>
                <div className="text-[12px] text-slate-500 leading-snug">
                  5가지 얼굴형 + 강조 포인트
                </div>
              </a>
            </div>
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
