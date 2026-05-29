import { GUIDE_POSTS_EN } from '../../../../src/lib/guides/posts.en'

export default function onBeforePrerenderStart() {
  return GUIDE_POSTS_EN.map((p) => `/en/guides/${p.slug}/`)
}
