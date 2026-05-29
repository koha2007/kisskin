import { NEWS_ITEMS_EN } from '../../../../src/lib/news/items.en'

export default function onBeforePrerenderStart() {
  return NEWS_ITEMS_EN.map((n) => `/en/news/${n.slug}/`)
}
