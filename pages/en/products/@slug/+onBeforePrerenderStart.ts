import { PRODUCT_ITEMS_EN } from '../../../../src/lib/products/items.en'

export default function onBeforePrerenderStart() {
  return PRODUCT_ITEMS_EN.map((p) => `/en/products/${p.slug}/`)
}
