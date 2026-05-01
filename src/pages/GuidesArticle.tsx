import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { GUIDE_POSTS, getGuideBySlug } from '../lib/guides/posts'
import { getGuideCategoryMeta } from '../lib/guides/types'

interface Props {
  slug: string
}

export default function GuidesArticle({ slug }: Props) {
  const post = getGuideBySlug(slug)
  if (!post) {
    return (
      <div className="font-display bg-background-light min-h-screen">
        <ToolsNav />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-extrabold text-navy mb-4">가이드를 찾을 수 없습니다</h1>
          <a
            href="/guides/"
            className="bg-emerald-500 text-white px-6 py-3 rounded-full font-bold inline-flex items-center gap-2"
          >
            가이드 홈으로
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </main>
        <ToolsFooter />
      </div>
    )
  }

  const meta = getGuideCategoryMeta(post.category)
  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
  }

  const related = GUIDE_POSTS.filter((p) => p.category === post.category && p.slug !== post.slug).slice(0, 3)

  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />

      <main>
        <section
          className="relative py-14 md:py-20 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${meta.color}15 0%, ${meta.color}30 100%)` }}
        >
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
            <a
              href="/guides/"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-600 text-sm font-medium mb-4"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              가이드 홈
            </a>
            <div className="flex items-center gap-2 mb-4">
              <span
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ background: `${meta.color}25`, color: meta.color }}
              >
                <span>{meta.emoji}</span>
                {meta.koLabel}
              </span>
              <span className="text-xs text-slate-500">{formatDate(post.date)}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">{post.readMinutes}분 읽기</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-navy leading-[1.25] tracking-tight mb-4">
              {post.title}
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">{post.summary}</p>
          </div>
        </section>

        <section className="py-10 md:py-14 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <article className="prose prose-slate max-w-none text-slate-700 leading-[1.85] text-[15px] md:text-base space-y-5">
              {post.body.map((p, i) => {
                if (p.startsWith('## ')) {
                  return (
                    <h2 key={i} className="text-xl md:text-2xl font-extrabold text-navy mt-8 mb-3 tracking-tight">
                      {p.replace(/^## /, '')}
                    </h2>
                  )
                }
                return <p key={i}>{p}</p>
              })}
            </article>

            <div className="mt-10 pt-8 border-t border-emerald-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[0.7rem] uppercase tracking-widest font-bold text-slate-400">태그</span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full text-slate-600 bg-emerald-50/60 border border-emerald-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'HowTo',
                  name: post.title,
                  description: post.summary,
                  datePublished: post.date,
                  dateModified: post.date,
                  totalTime: `PT${post.readMinutes}M`,
                  author: { '@type': 'Organization', name: 'kissinskin' },
                  publisher: {
                    '@type': 'Organization',
                    name: 'kissinskin',
                    logo: { '@type': 'ImageObject', url: 'https://kissinskin.net/logo.png' },
                  },
                  mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': `https://kissinskin.net/guides/${post.slug}/`,
                  },
                  keywords: post.tags.join(', '),
                }),
              }}
            />
          </div>
        </section>

        <section className="py-12 bg-gradient-to-br from-emerald-50 to-cyan-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">
              내게 어울리는 룩, AI로 즉시 시뮬레이션
            </h2>
            <p className="text-slate-600 text-sm mb-6">셀카 한 장으로 9가지 K-뷰티 메이크업을 30초 안에</p>
            <a
              href="/analysis"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3.5 rounded-full font-bold shadow-lg"
            >
              AI 메이크업 시작
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </section>

        {related.length > 0 && (
          <section className="py-12 md:py-16 bg-white border-t border-emerald-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl md:text-2xl font-extrabold text-navy text-center mb-8 tracking-tight">
                {meta.koLabel} 카테고리 다른 가이드
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                {related.map((r) => (
                  <a
                    key={r.slug}
                    href={`/guides/${r.slug}/`}
                    className="group block bg-white rounded-2xl overflow-hidden border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all"
                  >
                    <div
                      className="h-32 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${meta.color}20 0%, ${meta.color}05 100%)`,
                      }}
                    >
                      <span className="text-5xl">{meta.emoji}</span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-extrabold text-navy leading-snug group-hover:text-emerald-600 transition-colors line-clamp-3">
                        {r.title}
                      </h3>
                      <div className="text-[0.6rem] text-slate-400 mt-2">{formatDate(r.date)}</div>
                    </div>
                  </a>
                ))}
              </div>
              <div className="text-center mt-8">
                <a
                  href="/guides/"
                  className="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm hover:gap-3 transition-all"
                >
                  더 많은 가이드 보기
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
