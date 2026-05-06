import ArticleShell, { type RelatedItem } from '../components/ArticleShell'
import { renderBody } from '../components/ArticleBlocks'
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
      <div className="font-display bg-white min-h-screen">
        <ToolsNav />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">가이드를 찾을 수 없습니다</h1>
          <a
            href="/guides/"
            className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-full font-semibold"
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
  const related: RelatedItem[] = GUIDE_POSTS.filter(
    (p) => p.category === post.category && p.slug !== post.slug,
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
      hubLabel="가이드 홈"
      hubPath="/guides/"
      categoryLabel={meta.koLabel}
      categoryColor={meta.color}
      date={post.date}
      readMinutes={post.readMinutes}
      title={post.title}
      summary={post.summary}
      tags={post.tags}
      related={related}
      relatedLabel={`${meta.koLabel} 카테고리 다른 가이드`}
      relatedBasePath="/guides"
    >
      <article className="article-body prose prose-slate max-w-none text-slate-700 leading-[1.8] text-[16px] md:text-[17px] space-y-6">
        {renderBody(post.body)}
      </article>

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
    </ArticleShell>
  )
}
