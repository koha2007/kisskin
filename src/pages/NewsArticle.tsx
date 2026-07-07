import ArticleShell, { type RelatedItem } from '../components/ArticleShell'
import { renderBody } from '../components/ArticleBlocks'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import NewsProductBox from '../components/NewsProductBox'
import { NEWS_ITEMS, getNewsBySlug } from '../lib/news/items'
import { NEWS_ITEMS_EN, getNewsBySlugEn } from '../lib/news/items.en'
import { getCategoryMeta } from '../lib/news/types'
import { useI18n } from '../i18n/I18nContext'

interface Props {
  slug: string
}

export default function NewsArticle({ slug }: Props) {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const items = isEn ? NEWS_ITEMS_EN : NEWS_ITEMS
  const item = isEn ? getNewsBySlugEn(slug) : getNewsBySlug(slug)
  const hubPath = isEn ? '/en/news/' : '/news/'
  const hubBase = isEn ? '/en/news' : '/news'
  const siteBase = isEn ? 'https://kissinskin.net/en/news' : 'https://kissinskin.net/news'

  if (!item) {
    return (
      <div className="font-display bg-white min-h-screen">
        <ToolsNav />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">
            {isEn ? 'Article not found' : '기사를 찾을 수 없습니다'}
          </h1>
          <a
            href={hubPath}
            className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-full font-semibold"
          >
            {isEn ? 'Back to news' : '뉴스 홈으로'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </main>
        <ToolsFooter />
      </div>
    )
  }

  const meta = getCategoryMeta(item.category)
  const categoryLabel = isEn ? meta.enLabel : meta.koLabel
  const related: RelatedItem[] = items
    .filter((n) => n.category === item.category && n.slug !== item.slug)
    .slice(0, 3)
    .map((r) => ({
      slug: r.slug,
      title: r.title,
      date: r.date,
      categoryLabel,
      categoryColor: meta.color,
    }))

  return (
    <ArticleShell
      hubLabel={isEn ? 'News home' : '뉴스 홈'}
      hubPath={hubPath}
      categoryLabel={categoryLabel}
      categoryColor={meta.color}
      date={item.date}
      readMinutes={item.readMinutes}
      title={item.title}
      summary={item.summary}
      tags={item.tags}
      related={related}
      relatedLabel={isEn ? `More in ${categoryLabel}` : `${meta.koLabel} 카테고리 관련 기사`}
      relatedBasePath={hubBase}
    >
      <article className="article-body prose prose-slate max-w-none text-slate-700 leading-[1.8] text-[16px] md:text-[17px] space-y-6">
        {renderBody(item.body)}
      </article>

      <NewsProductBox category={item.category} slug={item.slug} accentColor={meta.color} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: item.title,
            description: item.summary,
            inLanguage: isEn ? 'en' : 'ko',
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
              '@id': `${siteBase}/${item.slug}/`,
            },
            articleSection: categoryLabel,
            keywords: item.tags.join(', '),
          }),
        }}
      />
    </ArticleShell>
  )
}
