import { GUIDE_POSTS } from '../../../src/lib/guides/posts'

export default function onBeforePrerenderStart() {
  return GUIDE_POSTS.map((p) => `/guides/${p.slug}/`)
}
