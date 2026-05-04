import ArticleShell, { type RelatedItem } from '../components/ArticleShell'
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
      <div className="font-display bg-white min-h-screen">
        <ToolsNav />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">기사를 찾을 수 없습니다</h1>
          <a
            href="/news/"
            className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-full font-semibold"
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
  const related: RelatedItem[] = NEWS_ITEMS.filter(
    (n) => n.category === item.category && n.slug !== item.slug,
  )
    .slice(0, 3)
    .map((r) => ({
      slug: r.slug,
      title: r.title,
      date: r.date,
      categoryLabel: meta.koLabel,
      categoryColor: meta.color,
    }))

  return (
    <ArticleShell
      hubLabel="뉴스 홈"
      hubPath="/news/"
      categoryLabel={meta.koLabel}
      categoryColor={meta.color}
      date={item.date}
      readMinutes={item.readMinutes}
      title={item.title}
      summary={item.summary}
      tags={item.tags}
      related={related}
      relatedLabel={`${meta.koLabel} 카테고리 관련 기사`}
      relatedBasePath="/news"
    >
      <article className="prose prose-slate max-w-none text-slate-700 leading-[1.8] text-[16px] md:text-[17px] space-y-6 first:[&>p]:text-[17px] md:first:[&>p]:text-[19px] first:[&>p]:text-slate-800 first:[&>p]:font-medium">
        {item.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>

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
    </ArticleShell>
  )
}
