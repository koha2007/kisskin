import ArticleShell, { type RelatedItem } from '../components/ArticleShell'
import { renderBody } from '../components/ArticleBlocks'
import GuideUpsellCTA from '../components/GuideUpsellCTA'
import GuideProductBox from '../components/GuideProductBox'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { GUIDE_POSTS, getGuideBySlug } from '../lib/guides/posts'
import { GUIDE_POSTS_EN, getGuideBySlugEn } from '../lib/guides/posts.en'
import { getGuideCategoryMeta } from '../lib/guides/types'
import { useI18n } from '../i18n/I18nContext'
import { pickRelated } from '../lib/seo/pickRelated'

interface Props {
  slug: string
}

export default function GuidesArticle({ slug }: Props) {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const posts = isEn ? GUIDE_POSTS_EN : GUIDE_POSTS
  const post = isEn ? getGuideBySlugEn(slug) : getGuideBySlug(slug)
  const hubPath = isEn ? '/en/guides/' : '/guides/'
  const hubBase = isEn ? '/en/guides' : '/guides'
  const siteBase = isEn ? 'https://kissinskin.net/en/guides' : 'https://kissinskin.net/guides'

  if (!post) {
    return (
      <div className="font-display bg-white min-h-screen">
        <ToolsNav />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">
            {isEn ? 'Guide not found' : '가이드를 찾을 수 없습니다'}
          </h1>
          <a
            href={hubPath}
            className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-full font-semibold"
          >
            {isEn ? 'Back to guides' : '가이드 홈으로'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </main>
        <ToolsFooter />
      </div>
    )
  }

  const meta = getGuideCategoryMeta(post.category)
  const categoryLabel = isEn ? meta.enLabel : meta.koLabel
  const related: RelatedItem[] = pickRelated(posts, post, 3).map((r) => {
    const rm = getGuideCategoryMeta(r.category)
    return {
      slug: r.slug,
      title: r.title,
      date: r.date,
      categoryLabel: isEn ? rm.enLabel : rm.koLabel,
      categoryColor: rm.color,
    }
  })

  return (
    <ArticleShell
      hubLabel={isEn ? 'Guides home' : '가이드 홈'}
      hubPath={hubPath}
      categoryLabel={categoryLabel}
      categoryColor={meta.color}
      date={post.date}
      readMinutes={post.readMinutes}
      title={post.title}
      summary={post.summary}
      tags={post.tags}
      related={related}
      relatedLabel={isEn ? `More in ${categoryLabel}` : `${meta.koLabel} 카테고리 다른 가이드`}
      relatedBasePath={hubBase}
    >
      <article className="article-body prose prose-slate max-w-none text-slate-700 leading-[1.8] text-[16px] md:text-[17px] space-y-6">
        {renderBody(post.body)}
      </article>

      <GuideProductBox category={post.category} slug={post.slug} accentColor={meta.color} />

      <GuideUpsellCTA
        slug={post.slug}
        accentColor={meta.color}
        hook={
          post.ctaHook ??
          (isEn
            ? 'See the makeup you just read about — on your own face'
            : '방금 읽은 메이크업, 내 얼굴로 직접 적용해보세요')
        }
        variant="bottom"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: post.title,
            description: post.summary,
            inLanguage: isEn ? 'en' : 'ko',
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
              '@id': `${siteBase}/${post.slug}/`,
            },
            keywords: post.tags.join(', '),
          }),
        }}
      />
    </ArticleShell>
  )
}
