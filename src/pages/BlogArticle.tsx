import ArticleShell, { type RelatedItem } from '../components/ArticleShell'
import { renderBody } from '../components/ArticleBlocks'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { BLOG_POSTS, getPostBySlug } from '../lib/blog/posts'
import { getBlogCategoryMeta } from '../lib/blog/types'

interface Props {
  slug: string
}

export default function BlogArticle({ slug }: Props) {
  const post = getPostBySlug(slug)
  if (!post) {
    return (
      <div className="font-display bg-white min-h-screen">
        <ToolsNav />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">글을 찾을 수 없습니다</h1>
          <a
            href="/blog/"
            className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-full font-semibold"
          >
            블로그 홈으로
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </main>
        <ToolsFooter />
      </div>
    )
  }

  const meta = getBlogCategoryMeta(post.category)
  const related: RelatedItem[] = BLOG_POSTS.filter(
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
      hubLabel="블로그 홈"
      hubPath="/blog/"
      categoryLabel={meta.koLabel}
      categoryColor={meta.color}
      date={post.date}
      readMinutes={post.readMinutes}
      title={post.title}
      summary={post.summary}
      tags={post.tags}
      related={related}
      relatedLabel={`${meta.koLabel} 카테고리 더 읽기`}
      relatedBasePath="/blog"
    >
      <article className="article-body prose prose-slate max-w-none text-slate-700 leading-[1.8] text-[16px] md:text-[17px] space-y-6">
        {renderBody(post.body)}
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.summary,
            datePublished: post.date,
            dateModified: post.date,
            author: { '@type': 'Organization', name: 'kissinskin' },
            publisher: {
              '@type': 'Organization',
              name: 'kissinskin',
              logo: { '@type': 'ImageObject', url: 'https://kissinskin.net/logo.png' },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://kissinskin.net/blog/${post.slug}/`,
            },
            articleSection: meta.koLabel,
            keywords: post.tags.join(', '),
          }),
        }}
      />
    </ArticleShell>
  )
}
