import type { ReactNode } from 'react'
import { ToolsNav, ToolsFooter } from './ToolsLayout'
import { useI18n } from '../i18n/I18nContext'

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

function formatDate(iso: string, isEn: boolean) {
  const d = new Date(iso)
  if (isEn) {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }
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
  ctaTitle,
  ctaSubtitle,
}: Props) {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const aboutPath = isEn ? '/en/about/' : '/about/'
  const contactPath = isEn ? '/en/contact/' : '/contact/'
  const analysisPath = isEn ? '/en/' : '/analysis/'
  const resolvedCtaTitle = ctaTitle ?? (isEn ? 'Try your perfect look with AI' : '내게 어울리는 룩, AI로 직접 시뮬레이션')
  const resolvedCtaSubtitle =
    ctaSubtitle ?? (isEn ? 'One selfie, five K-beauty looks in about 30 seconds.' : '셀카 한 장으로 5가지 K-뷰티 메이크업을 30초 안에')

  return (
    <div className="font-display bg-white min-h-screen">
      <ToolsNav />

      <main>
        {/* Header — subtle category-tinted gradient (Vercel-blog style accent) */}
        <section
          className="relative border-b border-slate-200 overflow-hidden"
          style={{
            background: `linear-gradient(180deg, ${categoryColor}08 0%, transparent 100%)`,
          }}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-9 md:py-14 relative">
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
                aria-label={isEn ? `More in ${categoryLabel}` : `${categoryLabel} 카테고리 글 더 보기`}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: categoryColor }}
                />
                <span className="font-semibold text-slate-700 hover:text-navy">{categoryLabel}</span>
              </a>
              <span className="text-slate-300">·</span>
              <span>{formatDate(date, isEn)}</span>
              <span className="text-slate-300">·</span>
              <span>{isEn ? `${readMinutes} min read` : `${readMinutes}분 읽기`}</span>
              {metaExtra && (
                <>
                  <span className="text-slate-300">·</span>
                  {metaExtra}
                </>
              )}
            </div>
            <h1 className="font-serif text-[32px] md:text-[48px] font-semibold text-navy leading-[1.1] tracking-tight mb-4">
              {title}
            </h1>
            <p className="text-[15px] md:text-lg text-slate-600 leading-relaxed mb-5">
              {summary}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{isEn ? 'By' : '편집'}</span>
              <a href={aboutPath} className="font-semibold text-slate-700 hover:text-navy underline">
                {isEn ? 'kissinskin Global Beauty Desk' : 'kissinskin 글로벌 뷰티 데스크'}
              </a>
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="py-10 md:py-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}

            {/* Content provenance disclosure — 공개 출처 기반 정보 피드(AI 지원) 표기.
                ────────────────────────────────────────────────────────────────
                2026-07-28. 원래 여기에 편집 원칙 4문장(약 300자)을 통째로 실었는데,
                그 4문장은 /about/ 「편집·검수 원칙」의 복사본이었다. 실측하니 뉴스 53편
                **전부(53/53)** 에 같은 문장이 들어가 페이지당 중복 글자 비중 27.1% 의
                가장 큰 덩어리였다. 7/23 조사에서 "크롤링됨 – 색인 미생성 24건"의 원인이
                분량이 아니라 중복으로 판명됐으므로, 복제본을 지우고 원본(/about/)을
                가리킨다 — 고지 자체는 유지하되 전문은 한 곳에만 둔다(정석적인 편집 정책
                페이지 구조이기도 하다).
                `<footer>` 로 감싸는 이유: 이 블록은 기사 본문이 아니라 출처·연락처
                메타데이터다. 시맨틱을 맞춰 두면 크롤러가 boilerplate 로 걸러내기 쉽다. */}
            <footer className="mt-12 p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-[13px] md:text-sm text-slate-600 leading-relaxed">
                {isEn ? (
                  <>
                    Compiled and edited (AI-assisted) from public sources —{' '}
                    <a href={aboutPath} className="font-semibold text-navy underline hover:text-primary">
                      editorial standards
                    </a>{' '}
                    ·{' '}
                    <a href={contactPath} className="font-semibold text-navy underline hover:text-primary">
                      report a correction
                    </a>
                  </>
                ) : (
                  <>
                    공개 자료를 바탕으로 정리·편집한 정보 콘텐츠입니다(AI 지원) —{' '}
                    <a href={aboutPath} className="font-semibold text-navy underline hover:text-primary">
                      편집·검수 원칙
                    </a>{' '}
                    ·{' '}
                    <a href={contactPath} className="font-semibold text-navy underline hover:text-primary">
                      오류 제보
                    </a>
                  </>
                )}
              </p>
            </footer>

            {tags && tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{isEn ? 'Tags' : '태그'}</span>
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
              {isEn ? 'kissinskin · Free AI quizzes' : 'kissinskin · 무료 AI 진단'}
            </div>
            <h2 className="text-lg md:text-xl font-bold text-navy text-center mb-6 tracking-tight">
              {isEn ? 'While you’re here, find the makeup that suits you' : '읽은 김에, 내게 맞는 메이크업도 진단해 보세요'}
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <a
                href={isEn ? '/en/tools/makeup-mbti/' : '/tools/makeup-mbti/'}
                className="group block p-5 border border-slate-200 rounded-xl hover:border-primary/40 hover:bg-primary/5/30 transition-colors"
              >
                <div className="text-2xl mb-2">💄</div>
                <div className="text-[13px] font-bold text-navy mb-1 group-hover:text-primary">
                  {isEn ? 'Makeup MBTI' : '메이크업 MBTI'}
                </div>
                <div className="text-[12px] text-slate-500 leading-snug">
                  {isEn ? '16 makeup personality types' : '16가지 메이크업 성향 진단'}
                </div>
              </a>
              <a
                href={isEn ? '/en/tools/personal-color/' : '/tools/personal-color/'}
                className="group block p-5 border border-slate-200 rounded-xl hover:border-primary/40 hover:bg-primary/5/30 transition-colors"
              >
                <div className="text-2xl mb-2">🎨</div>
                <div className="text-[13px] font-bold text-navy mb-1 group-hover:text-primary">
                  {isEn ? 'Personal Color' : '퍼스널 컬러'}
                </div>
                <div className="text-[12px] text-slate-500 leading-snug">
                  {isEn ? 'Spring / Summer / Autumn / Winter' : '봄/여름/가을/겨울 4계절 분석'}
                </div>
              </a>
              <a
                href={isEn ? '/en/tools/face-shape/' : '/tools/face-shape/'}
                className="group block p-5 border border-slate-200 rounded-xl hover:border-primary/40 hover:bg-primary/5/30 transition-colors"
              >
                <div className="text-2xl mb-2">👤</div>
                <div className="text-[13px] font-bold text-navy mb-1 group-hover:text-primary">
                  {isEn ? 'Face Shape' : '얼굴형 진단'}
                </div>
                <div className="text-[12px] text-slate-500 leading-snug">
                  {isEn ? '5 face shapes + focal points' : '5가지 얼굴형 + 강조 포인트'}
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* CTA — single subtle button */}
        <section className="border-t border-slate-200 bg-slate-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h2 className="text-lg md:text-xl font-bold text-navy mb-2 tracking-tight">
              {resolvedCtaTitle}
            </h2>
            <p className="text-slate-600 text-sm mb-5">{resolvedCtaSubtitle}</p>
            <a
              href={analysisPath}
              className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-navy-mid transition-colors"
            >
              {isEn ? 'Start AI Makeup' : 'AI 메이크업 시작'}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>
        </section>

        {/* Related — list, not card grid */}
        {related && related.length > 0 && relatedBasePath && (
          <section className="border-t border-slate-200">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-5">
                {relatedLabel ?? (isEn ? 'Related' : '관련 글')}
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
