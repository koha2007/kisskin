import { useMemo } from 'react'
import HubShell, { type HubItem, type HubCategory } from '../components/HubShell'
import { NEWS_ITEMS } from '../lib/news/items'
import { NEWS_ITEMS_EN } from '../lib/news/items.en'
import { NEWS_CATEGORIES, getCategoryMeta } from '../lib/news/types'
import { useI18n } from '../i18n/I18nContext'

export default function NewsHub() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const source = isEn ? NEWS_ITEMS_EN : NEWS_ITEMS

  const items = useMemo<HubItem[]>(
    () =>
      source.map((n) => {
        const meta = getCategoryMeta(n.category)
        return {
          slug: n.slug,
          title: n.title,
          summary: n.summary,
          date: n.date,
          readMinutes: n.readMinutes,
          category: n.category,
          categoryLabel: isEn ? meta.enLabel : meta.koLabel,
          categoryColor: meta.color,
        }
      }),
    [source, isEn],
  )

  const categories = useMemo<HubCategory[]>(
    () =>
      NEWS_CATEGORIES.filter((c) => source.some((n) => n.category === c.code)).map((c) => ({
        code: c.code,
        label: isEn ? c.enLabel : c.koLabel,
      })),
    [source, isEn],
  )

  return (
    <HubShell
      eyebrow="kissinskin · News"
      title={isEn ? 'K-beauty & global cosmetics news' : 'K-뷰티·글로벌 화장품 산업 뉴스'}
      subtitle={
        isEn
          ? 'New launches, market data, and shifting trends — insight, not advertising.'
          : '신제품, 시장 데이터, 트렌드 변화를 매주 정리합니다. 광고가 아닌 인사이트만.'
      }
      basePath={isEn ? '/en/news' : '/news'}
      items={items}
      categories={categories}
      totalLabel={isEn ? `${items.length} articles` : `${items.length}건 · 매주 업데이트`}
    />
  )
}
