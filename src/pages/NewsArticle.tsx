import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { NEWS_ITEMS, getNewsBySlug } from '../lib/news/items'
import { getCategoryMeta } from '../lib/news/types'

interface Props {
  slug: string
}

export default function NewsArticle({ slug }: Props) {
  const item = getNewsBySlug(slug)
  if (!item) {
    return (
      <div className="font-display bg-background-light min-h-screen">
        <ToolsNav />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-extrabold text-navy mb-4">기사를 찾을 수 없습니다</h1>
          <a
            href="/news/"
            className="bg-primary text-white px-6 py-3 rounded-full font-bold inline-flex items-center gap-2"
          >
            뉴스 홈으로
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </main>
        <ToolsFooter />
      </div>
    )
  }

  const meta = getCategoryMeta(item.category)
  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
  }

  // Related articles: same category, exclude self, max 3
  const related = NEWS_ITEMS.filter((n) => n.category === item.category && n.slug !== item.slug).slice(0, 3)

  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />

      <main>
        {/* Header */}
        <section
          className="relative py-14 md:py-20 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${meta.color}10 0%, ${meta.color}25 100%)` }}
        >
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
            <a
              href="/news/"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-primary text-sm font-medium mb-4"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              뉴스 홈
            </a>
            <div className="flex items-center gap-2 mb-4">
              <a
                href={`/news/?cat=${item.category}`}
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ background: `${meta.color}20`, color: meta.color }}
              >
                <span>{meta.emoji}</span>
                {meta.koLabel}
              </a>
              <span className="text-xs text-slate-500">{formatDate(item.date)}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">{item.readMinutes}분 읽기</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-navy leading-[1.25] tracking-tight mb-4">
              {item.title}
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">{item.summary}</p>
          </div>
        </section>

        {/* Body */}
        <section className="py-10 md:py-14 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <article className="prose prose-slate max-w-none text-slate-700 leading-[1.85] text-[15px] md:text-base space-y-5">
              {item.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </article>

            {/* Tags */}
            <div className="mt-10 pt-8 border-t border-pink-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[0.7rem] uppercase tracking-widest font-bold text-slate-400">태그</span>
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full text-slate-600 bg-pink-50/60 border border-pink-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* JSON-LD: NewsArticle */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'NewsArticle',
                  headline: item.title,
                  description: item.summary,
                  datePublished: item.date,
                  dateModified: item.date,
                  author: { '@type': 'Organization', name: 'kissinskin' },
                  publisher: {
                    '@type': 'Organization',
                    name: 'kissinskin',
                    logo: { '@type': 'ImageObject', url: 'https://kissinskin.net/logo.png' },
                  },
                  mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': `https://kissinskin.net/news/${item.slug}/`,
                  },
                  articleSection: meta.koLabel,
                  keywords: item.tags.join(', '),
                }),
              }}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-gradient-to-br from-pink-50 to-rose-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">
              내게 어울리는 룩, AI로 직접 확인해 보세요
            </h2>
            <p className="text-slate-600 text-sm mb-6">셀카 한 장 업로드 — 9가지 K-뷰티 메이크업 시뮬레이션</p>
            <a
              href="/analysis"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-pink-500 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-primary/25"
            >
              AI 메이크업 시작
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="py-12 md:py-16 bg-white border-t border-pink-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl md:text-2xl font-extrabold text-navy text-center mb-8 tracking-tight">
                {meta.koLabel} 카테고리 관련 기사
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                {related.map((r) => (
                  <a
                    key={r.slug}
                    href={`/news/${r.slug}/`}
                    className="group block bg-white rounded-2xl p-5 border border-pink-100 hover:border-primary/30 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: `${meta.color}15`, color: meta.color }}
                      >
                        {meta.emoji} {meta.koLabel}
                      </span>
                      <span className="text-[0.6rem] text-slate-400">{formatDate(r.date)}</span>
                    </div>
                    <h3 className="text-sm font-extrabold text-navy leading-snug group-hover:text-primary transition-colors line-clamp-3">
                      {r.title}
                    </h3>
                  </a>
                ))}
              </div>
              <div className="text-center mt-8">
                <a
                  href="/news/"
                  className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all"
                >
                  더 많은 뉴스 보기
                  <span className="material-symbols-outlined">arrow_forward</span>
                </a>
              </div>
            </div>
          </section>
        )}
      </main>

      <ToolsFooter />
    </div>
  )
}
