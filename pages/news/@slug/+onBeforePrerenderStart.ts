import { NEWS_ITEMS } from '../../../src/lib/news/items'

export default function onBeforePrerenderStart() {
  return NEWS_ITEMS.map((n) => `/news/${n.slug}/`)
}
