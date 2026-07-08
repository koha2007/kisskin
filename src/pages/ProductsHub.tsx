import { useMemo } from 'react'
import HubShell, { type HubItem, type HubCategory } from '../components/HubShell'
import { PRODUCT_ITEMS } from '../lib/products/items'
import { PRODUCT_ITEMS_EN } from '../lib/products/items.en'
import { PRODUCT_CATEGORIES, getCategoryMeta } from '../lib/products/types'
import { useI18n } from '../i18n/I18nContext'

export default function ProductsHub() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const source = isEn ? PRODUCT_ITEMS_EN : PRODUCT_ITEMS

  const items = useMemo<HubItem[]>(
    () =>
      source.map((p) => {
        const meta = getCategoryMeta(p.category)
        return {
          slug: p.slug,
          title: p.title,
          summary: p.summary,
          date: p.date,
          readMinutes: 1,
          category: p.category,
          categoryLabel: isEn ? meta.enLabel : meta.koLabel,
          categoryColor: meta.color,
          categoryEmoji: meta.emoji,
          image: p.image,
        }
      }),
    [source, isEn],
  )

  const categories = useMemo<HubCategory[]>(
    () =>
      PRODUCT_CATEGORIES.filter((c) => source.some((p) => p.category === c.code)).map((c) => ({
        code: c.code,
        label: isEn ? c.enLabel : c.koLabel,
      })),
    [source, isEn],
  )

  return (
    <HubShell
      eyebrow="kissinskin · Makeup Products"
      title={isEn ? 'New K-beauty makeup, picked daily' : '매일 새로 나온 메이크업 제품'}
      subtitle={
        isEn
          ? 'Fresh launches and trending makeup — a quick visual look, with links to buy.'
          : '새로 나온 신상과 요즘 뜨는 메이크업을 사진 위주로 짧게. 구매 링크까지 한 번에.'
      }
      basePath={isEn ? '/en/products' : '/products'}
      items={items}
      categories={categories}
      totalLabel={isEn ? `${items.length} products` : `${items.length}개 · 매일 업데이트`}
    />
  )
}
