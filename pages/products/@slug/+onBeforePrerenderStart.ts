import { PRODUCT_ITEMS } from '../../../src/lib/products/items'

export default function onBeforePrerenderStart() {
  return PRODUCT_ITEMS.map((p) => `/products/${p.slug}/`)
}
